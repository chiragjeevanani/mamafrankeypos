const mongoose = require('mongoose');

const variantOptionSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const variantGroupSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'Add-on' },
  options: [variantOptionSchema],
});

const menuItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ['veg', 'non-veg', 'egg'],
      default: 'veg',
    },
    image: {
      type: String, // Cloudinary URL
    },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Out of Stock'],
      default: 'Available',
    },
    shortCode: {
      type: String,
    },
    rank: {
      type: Number,
      default: 0,
    },
    variantGroups: [variantGroupSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
menuItemSchema.index({ category: 1, rank: 1 });
menuItemSchema.index({ status: 1 });
menuItemSchema.index({ shortCode: 1 }, { unique: true, sparse: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
