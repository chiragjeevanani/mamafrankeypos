const mongoose = require('mongoose');

const comboElementSchema = mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, default: 1 },
});

const comboSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
    },
    elements: [comboElementSchema],
    active: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const Combo = mongoose.model('Combo', comboSchema);

module.exports = Combo;
