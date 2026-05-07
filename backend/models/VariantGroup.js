const mongoose = require('mongoose');

const variantOptionSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const variantGroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    options: [variantOptionSchema],
    type: {
      type: String,
      enum: ['Add-on', 'Upgrade', 'Dietary', 'Size'],
      default: 'Add-on',
    }
  },
  {
    timestamps: true,
  }
);

const VariantGroup = mongoose.model('VariantGroup', variantGroupSchema);

module.exports = VariantGroup;
