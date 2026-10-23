import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { LanguageProvider } from './i18n';

// Backend Services
import authService from './services/authService';
import wasteService from './services/wasteService';
import offerService from './services/offerService';
import transactionService from './services/transactionService';
import { subscribeSyncStatus } from './services/offline/syncManager';

// Reference / Default Data Fallbacks
import {
  mockCollectors,
  mockRecyclers,
  mockWasteLots,
  mockTransactions,
  mockOffers
} from './data/mockData';

export default function App() {
  const navigate = useNavigate();

  // Active User / Auth State
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Live Platform Data State
  const [materialLots, setMaterialLots] = useState([]);
  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 1. Validate / Refresh Auth Session on Mount
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      try {
        const user = await authService.fetchCurrentUser();
        if (isMounted) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.debug('Session check:', err.message);
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    }
    verifyAuth();

    // Listen for 401 unauthorized events
    const handleUnauthorized = () => {
      setCurrentUser(null);
      navigate('/login');
    };
    window.addEventListener('ecolink_unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('ecolink_unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  // 2. Fetch live domain data from Express/Supabase based on current role
  const refreshAppData = useCallback(async () => {
    if (!currentUser) {
      setMaterialLots([]);
      setOffers([]);
      setTransactions([]);
      return;
    }

    setIsLoadingData(true);
    try {
      if (currentUser.role === 'collector') {
        const [lots, txs] = await Promise.all([
          wasteService.getMyLots().catch(err => {
            console.warn('Could not fetch collector lots:', err.message);
            return [];
          }),
          transactionService.getMyTransactions().catch(err => {
            console.warn('Could not fetch collector transactions:', err.message);
            return [];
          })
        ]);
        setMaterialLots(lots || []);
        setTransactions(txs || []);
      } else if (currentUser.role === 'recycler') {
        const [availableLots, myOffers, txs] = await Promise.all([
          wasteService.getAvailableLots().catch(err => {
            console.warn('Could not fetch available lots:', err.message);
            return [];
          }),
          offerService.getMyOffers().catch(err => {
            console.warn('Could not fetch recycler offers:', err.message);
            return [];
          }),
          transactionService.getMyTransactions().catch(err => {
            console.warn('Could not fetch recycler transactions:', err.message);
            return [];
          })
        ]);
        setMaterialLots(availableLots || []);
        setOffers(myOffers || []);
        setTransactions(txs || []);
      }
    } catch (err) {
      console.error('Failed to load application data from backend:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshAppData();
  }, [refreshAppData]);

  // Subscribe to background sync manager events
  useEffect(() => {
    const unsub = subscribeSyncStatus((syncState) => {
      if (syncState.status === 'completed') {
        refreshAppData();
      }
    });
    return unsub;
  }, [refreshAppData]);

  // Auth Handlers
  const handleLoginSuccess = (userPayload) => {
    setCurrentUser(userPayload);
    refreshAppData();
  };

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setMaterialLots([]);
    setOffers([]);
    setTransactions([]);
    navigate('/');
  };

  // Collector Workflow: Create E-Waste Request on Backend or IndexedDB (Offline)
  const handleLotCreated = async (newLotData) => {
    try {
      const createdLot = await wasteService.createLot({
        ...newLotData,
        category: newLotData.category,
        categoryOther: newLotData.categoryOther,
        material: newLotData.material || newLotData.materialType,
        materialType: newLotData.material || newLotData.materialType,
        description: newLotData.description || newLotData.notes || '',
        quantity: newLotData.quantity,
        unit: newLotData.unit || 'kg',
        totalWeightKg: newLotData.totalWeightKg,
        condition: newLotData.condition || 'Non-working / Scrap',
        notes: newLotData.notes,
        location: newLotData.location || newLotData.collectionAddress,
        locationText: newLotData.location || newLotData.collectionAddress,
        latitude: newLotData.latitude,
        longitude: newLotData.longitude,
        collectionAddress: newLotData.collectionAddress,
        cityDistrict: newLotData.cityDistrict,
        storageCondition: newLotData.storageCondition,
        storageConditionDetails: newLotData.storageConditionDetails,
        hazardousCondition: newLotData.hazardousCondition,
        hazardousConditionDetails: newLotData.hazardousConditionDetails,
        expectedPrice: newLotData.expectedPrice,
        isOpenToMarket: Boolean(newLotData.isOpenToMarket),
        preferredPickupDate: newLotData.preferredPickupDate,
        imageUrls: newLotData.imageUrls || [],
        quotedPrice: newLotData.quotedPrice || newLotData.expectedPrice,
        benchmarkPrice: newLotData.benchmarkPrice,
        estimatedLotValue: newLotData.estimatedLotValue,
        allowedPriceRange: newLotData.allowedPriceRange
      });

      // Update state with authoritative backend lot or local offline lot
      setMaterialLots(prev => [createdLot, ...prev]);
      return createdLot;
    } catch (err) {
      console.error('Failed to create waste lot:', err);
      throw err;
    }
  };

  // Recycler Workflow: Submit Price Offer on Collector Request
  const handleSubmitOffer = async (newOfferData) => {
    try {
      const createdOffer = await offerService.submitOffer({
        lotId: newOfferData.lotId,
        ratePerKg: newOfferData.pricePerUnit || newOfferData.ratePerKg,
        pricePerUnit: newOfferData.pricePerUnit || newOfferData.ratePerKg,
        pickupDate: newOfferData.proposedPickupDate || newOfferData.pickupDate,
        notes: newOfferData.notes
      });

      setOffers(prev => [createdOffer, ...prev]);
      // Refresh lots so status changes to OFFERS_RECEIVED
      refreshAppData();
      return createdOffer;
    } catch (err) {
      console.error('Failed to submit offer to server:', err);
      throw err;
    }
  };

  // Collector Workflow: Accept One Recycler Offer (Atomic backend transaction)
  const handleAcceptOffer = async (acceptPayload) => {
    try {
      const result = await offerService.acceptOffer(acceptPayload.offerId);
      // Refresh live state from database
      await refreshAppData();
      return result;
    } catch (err) {
      console.error('Failed to accept offer on server:', err);
      throw err;
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center text-[#222222]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1F6F5F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wider text-[#555555]">
            Connecting to Eco-Link Secure Network...
          </p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#FFFFFF] text-[#222222] font-sans antialiased selection:bg-[#1F6F5F] selection:text-white">
        <AppRoutes
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onUserUpdated={handleUserUpdated}
          onLogout={handleLogout}
          materialLots={materialLots}
          offers={offers}
          onLotCreated={handleLotCreated}
          onSubmitOffer={handleSubmitOffer}
          onAcceptOffer={handleAcceptOffer}
          onRefreshData={refreshAppData}
          transactions={transactions}
          collectors={collectors}
          recyclers={recyclers}
          isLoadingData={isLoadingData}
        />
      </div>
    </LanguageProvider>
  );
}
