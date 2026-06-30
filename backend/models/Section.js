const mongoose = require('mongoose');

const sectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String, // Friendly name for display
      required: true,
    },
    rank: {
      type: Number,
      default: 0,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['DINE-IN', 'CAR-SERVICE'],
      default: 'DINE-IN',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null, // null for system/global sections
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
sectionSchema.index({ rank: 1 });
sectionSchema.index({ branch: 1 });
sectionSchema.index({ name: 1, branch: 1 }, { unique: true, sparse: true });

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
