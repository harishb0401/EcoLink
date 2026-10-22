import crypto from 'crypto';

/**
 * Generates unique formatted IDs for lots, offers, transactions, and receipts
 */
export function generateLotId() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `EWL-2026-${randomDigits}`;
}

export function generateOfferId() {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `OFF-2026-${randomDigits}`;
}

export function generateTransactionId() {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `TXN-2026-${randomDigits}`;
}

export function generateReceiptId() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `RCP-2026-${randomDigits}`;
}

export function generateEventId() {
  return `EVT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
}
