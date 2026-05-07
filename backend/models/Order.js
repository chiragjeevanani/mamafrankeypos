const mongoose = require('mongoose');

const kotItemSchema = mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: String, // Snapshot name
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number, // Unit price at time of order
    required: true,
  },
  variants: [
    {
      name: String,
      price: Number,
    }
  ],
  instructions: String,
  status: {
    type: String,
    enum: ['pending', 'prepared', 'served', 'cancelled'],
    default: 'pending',
  }
});

const kotSchema = mongoose.Schema({
  kotNumber: String,
  items: [kotItemSchema],
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  time: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'printed', 'cancelled'],
    default: 'pending',
  },
  total: {
    type: Number,
    default: 0,
  }
});

const orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    orderType: {
      type: String,
      enum: ['DINE-IN', 'CAR-SERVICE', 'PICKUP'],
      default: 'DINE-IN',
    },
    carNumber: String,
    customer: {
      name: String,
      phone: String,
      address: String,
      locality: String,
      notes: String,
    },
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
    },
    kots: [kotSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxes: [
      {
        name: String,
        rate: Number,
        amount: Number,
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'PARTIAL'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: ['RUNNING', 'BILLED', 'COMPLETED', 'CANCELLED'],
      default: 'RUNNING',
    },
    billedAt: Date,
    completedAt: Date,
    counter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
