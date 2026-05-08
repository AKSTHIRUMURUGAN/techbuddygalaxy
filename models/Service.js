import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  projectTitle: {
    type: String,
    required: true,
  },
  projectDescription: String,
  serviceType: {
    type: String,
    enum: [
      'web_development',
      'mobile_app',
      'ui_ux_design',
      'seo',
      'digital_marketing',
      'cloud_services',
      'ai_ml',
      'consulting',
      'maintenance',
      'other'
    ],
    default: 'web_development',
  },
  status: {
    type: String,
    enum: [
      'inquiry_received',
      'requirement_discussion',
      'quotation_sent',
      'waiting_for_approval',
      'payment_pending',
      'in_progress',
      'review_phase',
      'completed',
      'delivered',
      'maintenance',
      'closed'
    ],
    default: 'inquiry_received',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  startDate: Date,
  expectedCompletionDate: Date,
  actualCompletionDate: Date,
  deliveryDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  addOns: [{
    name: String,
    description: String,
    price: Number,
    billingCycle: {
      type: String,
      enum: ['one_time', 'monthly', 'yearly'],
      default: 'one_time',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  timeline: [{
    status: String,
    note: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  internalNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  clientNotes: [{
    note: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  files: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  revisions: {
    total: {
      type: Number,
      default: 3,
    },
    used: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: 3,
    },
  },
  feedbackRequested: {
    type: Boolean,
    default: false,
  },
  feedbackReceivedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Update progress based on status
ServiceSchema.pre('save', function(next) {
  const statusProgressMap = {
    'inquiry_received': 5,
    'requirement_discussion': 10,
    'quotation_sent': 20,
    'waiting_for_approval': 25,
    'payment_pending': 30,
    'in_progress': 50,
    'review_phase': 80,
    'completed': 90,
    'delivered': 95,
    'maintenance': 100,
    'closed': 100,
  };
  
  if (!this.progress || this.progress === 0) {
    this.progress = statusProgressMap[this.status] || 0;
  }
  
  // Update revision remaining
  this.revisions.remaining = this.revisions.total - this.revisions.used;
  
  next();
});

// Indexes
ServiceSchema.index({ client: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ priority: 1 });
ServiceSchema.index({ createdAt: -1 });
ServiceSchema.index({ expectedCompletionDate: 1 });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
