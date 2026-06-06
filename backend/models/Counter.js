const mongoose = require('mongoose');

const counterSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      required: true,
      uppercase: true,
    },
    startNum: {
      type: Number,
      required: true,
      default: 1,
    },
    currentNum: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastResetDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
