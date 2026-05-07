const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing for non-admins if needed
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    pin: {
      type: String, // 4-digit PIN for POS
    },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Biller', 'Waiter', 'Chef'],
      default: 'Biller',
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

staffSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

staffSchema.methods.matchPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

staffSchema.pre('save', async function () {
  if (!this.isModified('password') && !this.isModified('pin')) {
    return;
  }

  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('pin') && this.pin) {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
  }
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
