import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'items.productType',
    required: true,
  },
  productType: {
    type: String,
    enum: ['Product', 'SpecialProduct'],
    default: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null,
  },
}, {
  timestamps: true,
});

// Virtual for cart totals
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export const Cart = mongoose.model('Cart', cartSchema);
