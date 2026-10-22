import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/Layout/PublicLayout';
import CollectorLayout from '../components/Layout/CollectorLayout';
import RecyclerLayout from '../components/Layout/RecyclerLayout';

// Public Pages
import Home from '../pages/public/Home';
import HowItWorks from '../pages/public/HowItWorks';
import RecycleGuide from '../pages/public/RecycleGuide';
import Locations from '../pages/public/Locations';
import About from '../pages/public/About';
import Login from '../pages/public/Login';

// Collector Pages
import CollectorDashboard from '../pages/collector/CollectorDashboard';
import RegisterWaste from '../pages/collector/RegisterWaste';
import MyRequests from '../pages/collector/MyRequests';
import RequestDetails from '../pages/collector/RequestDetails';
import Transactions from '../pages/collector/Transactions';
import TransactionDetails from '../pages/collector/TransactionDetails';
import CollectorProfile from '../pages/collector/CollectorProfile';
import CollectorNotifications from '../pages/collector/CollectorNotifications';

// Recycler Pages
import RecyclerDashboard from '../pages/recycler/RecyclerDashboard';
import WasteRequests from '../pages/recycler/WasteRequests';
import RecyclerTransactions from '../pages/recycler/RecyclerTransactions';
import Compliance from '../pages/recycler/Compliance';
import RecyclerProfile from '../pages/recycler/RecyclerProfile';
import RecyclerNotifications from '../pages/recycler/RecyclerNotifications';

// 404 Fallback Page
import NotFound from '../pages/NotFound';

export default function AppRoutes({
  currentUser,
  onLoginSuccess,
  onUserUpdated,
  onLogout,
  materialLots,
  offers,
  onLotCreated,
  onSubmitOffer,
  onAcceptOffer,
  transactions
}) {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route element={<PublicLayout currentUser={currentUser} onLogout={onLogout} />}>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/recycle-guide" element={<RecycleGuide />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login initialTab="login" onLoginSuccess={onLoginSuccess} />} />
        <Route path="/signup" element={<Login initialTab="signup" onLoginSuccess={onLoginSuccess} />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 2. COLLECTOR ROUTES (Request-Driven Flow) */}
      <Route path="/collector" element={<CollectorLayout currentUser={currentUser} onLogout={onLogout} />}>
        <Route path="dashboard" element={<CollectorDashboard materialLots={materialLots} offers={offers} transactions={transactions} collectorProfile={currentUser} />} />
        <Route path="register-waste" element={<RegisterWaste onLotCreated={onLotCreated} collectorProfile={currentUser} />} />
        <Route path="create-request" element={<RegisterWaste onLotCreated={onLotCreated} collectorProfile={currentUser} />} />
        <Route path="requests" element={<MyRequests materialLots={materialLots} offers={offers} />} />
        <Route path="my-requests" element={<MyRequests materialLots={materialLots} offers={offers} />} />
        <Route path="waste-lots" element={<MyRequests materialLots={materialLots} offers={offers} />} />
        <Route path="requests/:requestId" element={<RequestDetails materialLots={materialLots} offers={offers} onAcceptOffer={onAcceptOffer} />} />
        <Route path="waste-lots/:lotId" element={<RequestDetails materialLots={materialLots} offers={offers} onAcceptOffer={onAcceptOffer} />} />
        <Route path="recycler-matches" element={<Navigate to="/collector/requests" replace />} />
        <Route path="recycler-matches/:matchId" element={<Navigate to="/collector/requests" replace />} />
        <Route path="transactions" element={<Transactions transactions={transactions} />} />
        <Route path="transactions/:transactionId" element={<TransactionDetails transactions={transactions} />} />
        <Route path="profile" element={<CollectorProfile currentUser={currentUser} onProfileUpdated={onUserUpdated} />} />
        <Route path="notifications" element={<CollectorNotifications />} />
      </Route>

      {/* 3. RECYCLER ROUTES */}
      <Route path="/recycler" element={<RecyclerLayout currentUser={currentUser} onLogout={onLogout} />}>
        <Route path="dashboard" element={<RecyclerDashboard materialLots={materialLots} recyclerProfile={currentUser} />} />
        <Route path="waste-requests" element={<WasteRequests materialLots={materialLots} onSubmitOffer={onSubmitOffer} recyclerProfile={currentUser} />} />
        <Route path="matches" element={<Navigate to="/recycler/waste-requests" replace />} />
        <Route path="transactions" element={<RecyclerTransactions transactions={transactions} />} />
        <Route path="compliance" element={<Compliance recyclerProfile={currentUser} />} />
        <Route path="profile" element={<RecyclerProfile currentUser={currentUser} onProfileUpdated={onUserUpdated} />} />
        <Route path="notifications" element={<RecyclerNotifications />} />
      </Route>

      {/* Redirect any legacy /admin path to login */}
      <Route path="/admin/*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
