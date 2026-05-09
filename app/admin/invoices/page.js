"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Receipt, Send, Eye, Edit, 
  Download, Calendar, DollarSign, User, Building2,
  X, Check, AlertCircle, Loader2, CheckCircle, CreditCard, ExternalLink, Link2
} from 'lucide-react';
import { toast } from 'sonner';
import SendEmailModal from '@/components/admin/SendEmailModal';
import MarkInvoicePaidModal from '@/components/admin/MarkInvoicePaidModal';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (invoice) => {
    setSelectedInvoice(invoice);
    setShowSendEmailModal(true);
  };

  const handleMarkPaid = (invoice) => {
    setSelectedInvoice(invoice);
    setShowMarkPaidModal(true);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || inv.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Invoices
              </h1>
              <p className="text-gray-600 mt-1">Manage and track payment invoices</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-600" size={40} />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Receipt className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No invoices found</h3>
            <p className="text-gray-500">Convert quotations to invoices to get started</p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredInvoices.map((invoice, index) => (
              <InvoiceCard
                key={invoice._id}
                invoice={invoice}
                index={index}
                onSendEmail={() => handleSendEmail(invoice)}
                onMarkPaid={() => handleMarkPaid(invoice)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Send Email Modal */}
      <AnimatePresence>
        {showSendEmailModal && selectedInvoice && (
          <SendEmailModal
            isOpen={showSendEmailModal}
            onClose={() => {
              setShowSendEmailModal(false);
              setSelectedInvoice(null);
              fetchInvoices();
            }}
            documentType="invoice"
            documentId={selectedInvoice._id}
            clientEmail={selectedInvoice.clientEmail}
            clientName={selectedInvoice.clientName}
          />
        )}
      </AnimatePresence>

      {/* Mark as Paid Modal */}
      <AnimatePresence>
        {showMarkPaidModal && selectedInvoice && (
          <MarkInvoicePaidModal
            isOpen={showMarkPaidModal}
            onClose={() => {
              setShowMarkPaidModal(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
            onSuccess={() => {
              fetchInvoices();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InvoiceCard({ invoice, index, onSendEmail, onMarkPaid }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      partially_paid: 'bg-blue-100 text-blue-700 border-blue-300',
      paid: 'bg-green-100 text-green-700 border-green-300',
      overdue: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || colors.pending;
  };

  const canMarkPaid = invoice.paymentStatus !== 'paid' && invoice.balanceAmount > 0;

  const copyInvoiceLink = () => {
    const invoiceUrl = `${window.location.origin}/invoices/${invoice._id}`;
    navigator.clipboard.writeText(invoiceUrl);
    toast.success('Invoice link copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.paymentStatus)}`}>
                {invoice.paymentStatus.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-1">{invoice.projectTitle}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={14} />
                {invoice.clientName}
              </span>
              {invoice.companyName && (
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {invoice.companyName}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₹{invoice.totalAmount?.toLocaleString('en-IN')}
            </div>
            {invoice.balanceAmount > 0 && (
              <div className="text-sm text-red-600 font-semibold mt-1">
                Due: ₹{invoice.balanceAmount?.toLocaleString('en-IN')}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-2">
            {canMarkPaid && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMarkPaid}
                className="px-3 py-2 bg-green-50 text-green-700 rounded-lg transition-colors hover:bg-green-100 flex items-center gap-1 text-sm font-semibold"
                title="Mark as Paid"
              >
                <CreditCard size={16} />
                Mark Paid
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyInvoiceLink}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              title="Copy Invoice Link"
            >
              <Link2 size={18} className="text-purple-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(`/invoices/${invoice._id}`, '_blank')}
              className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View Invoice"
            >
              <Eye size={18} className="text-indigo-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSendEmail}
              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
              title="Send Email"
            >
              <Send size={18} className="text-green-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download size={18} className="text-blue-600" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
