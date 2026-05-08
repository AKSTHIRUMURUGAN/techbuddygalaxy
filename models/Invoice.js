import mongoose from 'mongoose';

const ServiceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  total: {
    type: Number,
    required: true,
  },
}, { _id: true });

const PaymentRecordSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'online', 'other'],
    default: 'online',
  },
  transactionId: String,
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  notes: String,
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false, // Optional for immediate clients
  },
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  companyName: String,
  gstNumber: String,
  billingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  projectTitle: {
    type: String,
    required: true,
  },
  projectDescription: String,
  services: [ServiceItemSchema],
  addOns: [{
    id: String,
    name: String,
    price: {
      type: Number,
      default: 0,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  taxRate: {
    type: Number,
    default: 18,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  balanceAmount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paymentTerms: {
    type: String,
    default: 'Payment due within 15 days',
  },
  notes: String,
  termsAndConditions: {
    type: String,
    default: 'Includes 3 minor revisions free of cost. Additional revisions or major scope changes may incur extra charges.',
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid', 'overdue'],
    default: 'pending',
  },
  payments: [PaymentRecordSchema],
  sentAt: Date,
  viewedAt: Date,
  paidAt: Date,
  remindersSent: {
    type: Number,
    default: 0,
  },
  lastReminderSentAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Auto-generate invoice number
InvoiceSchema.pre('save', async function() {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const lastInvoice = await mongoose.models.Invoice
      .findOne({ invoiceNumber: new RegExp(`^INV${year}${month}`) })
      .sort({ invoiceNumber: -1 });
    
    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.invoiceNumber = `INV${year}${month}${String(sequence).padStart(4, '0')}`;
  }
  
  // Calculate balance amount
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = 'pending';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
    if (!this.paidAt) {
      this.paidAt = new Date();
    }
  } else {
    this.paymentStatus = 'partially_paid';
  }
  
  // Check if overdue
  if (this.paymentStatus !== 'paid' && new Date() > this.dueDate) {
    this.paymentStatus = 'overdue';
  }
});

// Indexes
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ client: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ paymentStatus: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
