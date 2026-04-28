import mongoose from 'mongoose';

const footerLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
  },
  { _id: false },
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'primary' },
    headerDealsImage: { type: String, default: '' },
    headerDealsText: { type: String, default: 'Hot deals live now' },
    footerText: {
      type: String,
      default:
        'Your one-stop destination for premium shoes and shirts. Quality products at unbeatable prices.',
    },
    footerLinks: {
      type: [footerLinkSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
