import { body } from 'express-validator';

export const createWasteLotValidationRules = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('quantity')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage('Quantity must be a positive number greater than 0 if provided'),
  body('unit')
    .optional()
    .trim(),
  body('material')
    .optional()
    .trim(),
  body('condition')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim(),
  body('locationText')
    .optional()
    .trim(),
  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('totalWeightKg')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage('Total weight must be greater than 0'),
  body('expectedPrice')
    .optional({ nullable: true })
    .custom((val) => {
      if (val !== undefined && val !== null && val !== '') {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) {
          throw new Error('Expected selling price must be greater than or equal to 0');
        }
      }
      return true;
    }),
  body('isOpenToMarket')
    .optional()
    .isBoolean()
    .withMessage('isOpenToMarket must be a boolean'),
  body('pricingMode')
    .optional()
    .trim(),
  body('collectionAddress')
    .optional()
    .trim(),
  body('cityDistrict')
    .optional()
    .trim(),
  body('storageCondition')
    .optional()
    .trim(),
  body('hazardousCondition')
    .optional()
    .trim(),
  body('imageUrls')
    .optional()
    .isArray()
    .withMessage('Image URLs must be an array'),
  body('notes')
    .optional()
    .trim(),
  body('preferredPickupDate')
    .optional()
    .trim()
];
