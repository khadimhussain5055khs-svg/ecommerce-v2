import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    cta: { type: String, default: 'Shop Now' },
  },
  { timestamps: true },
);

export const Banner = mongoose.model('Banner', bannerSchema);
