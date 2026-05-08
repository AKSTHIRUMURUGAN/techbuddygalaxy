import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true,
  },
  cc: [String],
  bcc: [String],
  subject: {
    type: String,
    required: true,
  },
  emailType: {
    type: String,
    enum: [
      'quotation_sent',
      'invoice_sent',
      'payment_reminder',
      'service_started',
      'service_completed',
      'feedback_request',
      'welcome',
      'other'
    ],
    required: true,
  },
  relatedDocument: {
    model: {
      type: String,
      enum: ['Quotation', 'Invoice', 'Service', 'Feedback'],
    },
    id: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'bounced', 'opened', 'clicked'],
    default: 'sent',
  },
  errorMessage: String,
  sentAt: {
    type: Date,
    default: Date.now,
  },
  openedAt: Date,
  clickedAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Indexes
EmailLogSchema.index({ to: 1 });
EmailLogSchema.index({ emailType: 1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ sentAt: -1 });
EmailLogSchema.index({ 'relatedDocument.model': 1, 'relatedDocument.id': 1 });

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
