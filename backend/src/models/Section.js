import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    showInHeader: { type: Boolean, default: true },
    showInHomepage: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

export const Section = mongoose.model('Section', sectionSchema);
