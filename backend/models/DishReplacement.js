const mongoose = require('mongoose');

const dishReplacementSchema = mongoose.Schema(
  {
    originalDish: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'MenuItem',
    },
    replacementDish: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'MenuItem',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Scheduled', 'Expired'],
      default: 'Scheduled',
    }
  },
  {
    timestamps: true,
  }
);

const DishReplacement = mongoose.model('DishReplacement', dishReplacementSchema);

module.exports = DishReplacement;
