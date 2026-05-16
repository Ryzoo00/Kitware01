import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Pakistan' },
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash on Delivery', 'Credit Card', 'EasyPaisa', 'JazzCash', 'Bank Transfer'],
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending',
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
  trackingNumber: {
    type: String,
  },
  carrier: {
    type: String,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  this.itemsPrice = this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice - (this.discountAmount || 0);
  next();
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
