const mongoose = require('mongoose');

const tableSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Section',
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
    },
    status: {
      type: String,
      required: true,
      enum: ['blank', 'running-kot', 'printed', 'paid', 'on-hold'],
      default: 'blank',
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Will be implemented in Phase 6
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

// Unique constraint on name within a section
tableSchema.index({ name: 1, section: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
