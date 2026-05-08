import mongoose from 'mongoose';

const AddOnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'optimization',
      'hosting',
      'security',
      'marketing',
      'integration',
      'maintenance',
      'analytics',
      'other'
    ],
    default: 'other',
  },
  icon: String,
  pricing: {
    oneTime: {
      type: Number,
      default: 0,
    },
    monthly: {
      type: Number,
      default: 0,
    },
    yearly: {
      type: Number,
      default: 0,
    },
  },
  features: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Auto-generate slug from name
AddOnSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
AddOnSchema.index({ slug: 1 });
AddOnSchema.index({ category: 1 });
AddOnSchema.index({ isActive: 1 });
AddOnSchema.index({ displayOrder: 1 });

export default mongoose.models.AddOn || mongoose.model('AddOn', AddOnSchema);
