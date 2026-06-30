const mongoose = require('mongoose');

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    gstNumber: {
      type: String,
      default: '',
    },
    fssai: {
      type: String,
      default: '',
    },
    legalName: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

branchSchema.index({ slug: 1 }, { unique: true });
branchSchema.index({ isActive: 1 });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
