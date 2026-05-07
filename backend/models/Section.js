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
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
