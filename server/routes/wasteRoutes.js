import express from 'express';
import {
  createWasteLot,
  getMyWasteLots,
  getAvailableWasteLots,
  getWasteLotById,
  getWasteLotOffers,
  cancelWasteLot,
  uploadWasteImage
} from '../controllers/wasteController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createWasteLotValidationRules } from '../validators/wasteValidator.js';

const router = express.Router();

// Upload waste image to Supabase Storage
router.post(
  '/upload-image',
  authMiddleware,
  requireRole('collector'),
  uploadWasteImage
);

// Collector creates a waste lot
router.post(
  '/',
  authMiddleware,
  requireRole('collector'),
  createWasteLotValidationRules,
  validateRequest,
  createWasteLot
);

// Collector retrieves their own declared waste lots
router.get(
  '/my',
  authMiddleware,
  requireRole('collector'),
  getMyWasteLots
);

// Recycler retrieves open & matching waste lots
router.get(
  '/available',
  authMiddleware,
  requireRole('recycler', 'admin'),
  getAvailableWasteLots
);

// Get specific waste lot by id / lot_id
router.get(
  '/:lotId',
  authMiddleware,
  getWasteLotById
);

// Collector views all incoming offers for their specific lot
router.get(
  '/:lotId/offers',
  authMiddleware,
  requireRole('collector', 'admin'),
  getWasteLotOffers
);

// Collector cancels their waste lot
router.post(
  '/:lotId/cancel',
  authMiddleware,
  requireRole('collector', 'admin'),
  cancelWasteLot
);

export default router;
