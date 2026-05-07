const mongoose = require('mongoose');

const taxSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      default: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Tax = mongoose.model('Tax', taxSchema);

module.exports = Tax;
