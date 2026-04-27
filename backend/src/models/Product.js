import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ['shoes', 'shirts'], required: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 4.5 },
    stockSold: { type: Number, default: 0 },
    availableStock: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    description: { type: String, required: true },
    tags: [{ type: String }],
    season: { type: String, enum: ['spring', 'summer', 'fall', 'winter', null], default: null },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBudgetFriendly: { type: Boolean, default: false },
    isMostSearched: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Product = mongoose.model('Product', productSchema);
