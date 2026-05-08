const mongoose = require('mongoose');

const storeSettingsSchema = mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: 'Mama Frankey POS',
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    gstNumber: {
      type: String,
    },
    // Adjustment Protocols
    visibilityDecrement: {
      type: Number,
      default: 0,
    },
    maskQuantity: {
      type: Boolean,
      default: false,
    },
    targetOutlet: {
      type: String,
      default: 'Main Outlet (Sadar)'
    },
    protocolPriceRange: {
      type: String,
      default: 'Price Range: Standard'
    },
    itemReplacements: [
      {
        originalItem: String,
        replacedWith: String,
        replacedPrice: { type: Number, default: 0 }
      }
    ],
    taxes: [
      {
        name: { type: String, required: true },
        percentage: { type: Number, required: true, default: 0 },
        active: { type: Boolean, default: true }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

module.exports = StoreSettings;
