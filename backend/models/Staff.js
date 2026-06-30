const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const staffSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    pin: {
      type: String, // 4-digit PIN for POS (bcrypt hashed)
    },
    pinHash: {
      type: String, // SHA-256 hash of PIN for fast O(1) query lookup
    },
    role: {
      type: String,
      required: true,
      default: 'Biller',
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null, // null = Super Admin (global access), all other roles must have a branch
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
staffSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false, email: { $type: "string" } }
  }
);
staffSchema.index(
  { pinHash: 1, branch: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false, pinHash: { $type: "string" } }
  }
);
staffSchema.index({ role: 1 });
staffSchema.index({ status: 1 });
staffSchema.index({ isDeleted: 1 });
staffSchema.index({ branch: 1 });

staffSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

staffSchema.methods.matchPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

staffSchema.pre('save', async function () {
  // If pin is modified, generate deterministic pinHash (SHA-256) first, then bcrypt the pin
  if (this.isModified('pin') && this.pin) {
    this.pinHash = crypto.createHash('sha256').update(this.pin).digest('hex');
    
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
  }

  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
