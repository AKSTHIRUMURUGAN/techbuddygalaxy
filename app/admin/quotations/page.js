"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, FileText, Send, Eye, Edit, Copy, 
  Trash2, Download, Calendar, DollarSign, User, Building2,
  Mail, Phone, MapPin, X, Check, AlertCircle, Loader2, Star,
  MessageSquare, ChevronDown, ChevronUp, Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchQuotations();
    fetchClients();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await fetch('/api/quotations');
      const data = await res.json();
      if (data.success) {
        setQuotations(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handlePreview = (quotation) => {
    setSelectedQuotation(quotation);
    setShowPreviewModal(true);
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setShowEditModal(true);
  };

  const handleSendEmail = async (quotation) => {
    setSelectedQuotation(quotation);
    setShowSendEmailModal(true);
  };

  const handleViewFeedback = (quotation) => {
    setSelectedQuotation(quotation);
    setShowFeedbackModal(true);
  };

  const handleConvertToInvoice = async (quotation) => {
    if (!confirm(`Convert quotation ${quotation.quotationNumber} to invoice?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/quotations/${quotation._id}/convert-to-invoice`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Invoice created successfully!');
        fetchQuotations();
        // Optionally redirect to invoices page
        // window.location.href = '/admin/invoices';
      } else {
        toast.error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('An error occurred');
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quotations
              </h1>
              <p className="text-gray-600 mt-1">Create and manage professional quotations</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
            >
              <Plus size={20} />
              Create Quotation
            </motion.button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : filteredQuotations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FileText className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No quotations found</h3>
            <p className="text-gray-500 mb-6">Create your first quotation to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold"
            >
              Create Quotation
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredQuotations.map((quotation, index) => (
              <QuotationCard
                key={quotation._id}
                quotation={quotation}
                index={index}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onSendEmail={() => handleSendEmail(quotation)}
                onViewFeedback={handleViewFeedback}
                onConvertToInvoice={handleConvertToInvoice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <QuotationWorkflow
            clients={clients}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchQuotations();
            }}
          />
        )}
        {showEditModal && selectedQuotation && (
          <QuotationWorkflow
            initialData={selectedQuotation}
            clients={clients}
            onClose={() => {
              setShowEditModal(false);
              setSelectedQuotation(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedQuotation(null);
              fetchQuotations();
            }}
          />
        )}
        {showPreviewModal && selectedQuotation && (
          <PreviewModal
            quotation={selectedQuotation}
            onClose={() => {
              setShowPreviewModal(false);
              setSelectedQuotation(null);
            }}
            onSendEmail={() => {
              setShowPreviewModal(false);
              handleSendEmail(selectedQuotation);
            }}
          />
        )}
        {showFeedbackModal && selectedQuotation && (
          <FeedbackModal
            quotation={selectedQuotation}
            onClose={() => {
              setShowFeedbackModal(false);
              setSelectedQuotation(null);
            }}
          />
        )}
        {showSendEmailModal && selectedQuotation && (
          <SendEmailModal
            isOpen={showSendEmailModal}
            onClose={() => {
              setShowSendEmailModal(false);
              setSelectedQuotation(null);
              fetchQuotations();
            }}
            documentType="quotation"
            documentId={selectedQuotation._id}
            clientEmail={selectedQuotation.clientEmail}
            clientName={selectedQuotation.clientName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuotationCard({ quotation, index, onPreview, onEdit, onSendEmail, onViewFeedback, onConvertToInvoice }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      sent: 'bg-blue-100 text-blue-700 border-blue-300',
      viewed: 'bg-purple-100 text-purple-700 border-purple-300',
      accepted: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      expired: 'bg-orange-100 text-orange-700 border-orange-300',
    };
    return colors[status] || colors.draft;
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
              <h3 className="text-xl font-bold text-gray-900">{quotation.quotationNumber}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(quotation.status)}`}>
                {quotation.status}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-1">{quotation.projectTitle}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={14} />
                {quotation.clientName}
              </span>
              {quotation.companyName && (
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {quotation.companyName}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ₹{quotation.totalAmount?.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Valid till {new Date(quotation.validTill).toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            {new Date(quotation.createdAt).toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPreview(quotation)}
              className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Preview"
            >
              <Eye size={18} className="text-indigo-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(quotation)}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={18} className="text-purple-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onConvertToInvoice(quotation)}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              title="Convert to Invoice"
            >
              <Receipt size={18} className="text-orange-600" />
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
              onClick={() => onViewFeedback(quotation)}
              className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
              title="View Feedback"
            >
              <MessageSquare size={18} className="text-yellow-600" />
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

// Continue in next part...


// Import the modal component
import CreateQuotationModal from '@/components/quotations/CreateQuotationModal';
import QuotationWorkflow from '@/components/quotations/QuotationWorkflow';
import SendEmailModal from '@/components/admin/SendEmailModal';

// Preview Modal Component
function PreviewModal({ quotation, onClose, onSendEmail }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Quotation Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onSendEmail}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              Send Email
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)] bg-gray-50">
          {/* Quotation Document */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-indigo-600">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h1>
                <p className="text-lg font-semibold text-indigo-600">{quotation.quotationNumber}</p>
              </div>
              <div className="text-right">
                <img 
                  src="https://galaxy.techbuddyspace.in/tbg.png" 
                  alt="Tech Buddy Galaxy" 
                  className="h-16 ml-auto mb-2"
                />
                <p className="text-xl font-bold text-gray-900">
                  Tech Buddy Galaxy
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  A unit of TechBuddySpace Private Limited
                </p>
                <p className="text-xs text-gray-600 mt-1">Professional IT Services</p>
              </div>
            </div>

            {/* Client & Date Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To:</h3>
                <p className="font-bold text-gray-900">{quotation.clientName}</p>
                {quotation.companyName && <p className="text-gray-700">{quotation.companyName}</p>}
                <p className="text-gray-600">{quotation.clientEmail}</p>
                {quotation.clientPhone && <p className="text-gray-600">{quotation.clientPhone}</p>}
                {quotation.gstNumber && <p className="text-gray-600">GST: {quotation.gstNumber}</p>}
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <span className="text-sm font-semibold text-gray-500">Date:</span>
                  <p className="text-gray-900">{new Date(quotation.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500">Valid Till:</span>
                  <p className="text-gray-900">{new Date(quotation.validTill).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{quotation.projectTitle}</h3>
              {quotation.projectDescription && (
                <p className="text-gray-600">{quotation.projectDescription}</p>
              )}
            </div>

            {/* Services Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Discount</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.services.map((service, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-600">{service.description}</div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700">{service.quantity}</td>
                      <td className="text-right py-3 px-4 text-gray-700">₹{service.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="text-right py-3 px-4 text-gray-700">{service.discount}%</td>
                      <td className="text-right py-3 px-4 font-semibold text-gray-900">₹{service.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="flex justify-between py-2 text-gray-700">
                  <span>Services Subtotal:</span>
                  <span className="font-semibold">₹{quotation.subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {/* Add-ons Section */}
                {quotation.addOns && quotation.addOns.length > 0 && quotation.addOns.filter(a => a.selected).length > 0 && (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Add-ons & Extras:</div>
                    {quotation.addOns.filter(a => a.selected).map((addon, index) => (
                      <div key={index} className="flex justify-between py-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="text-green-600">✓</span>
                          {addon.name}
                        </span>
                        <span className="font-medium">
                          {addon.price === 0 ? (
                            <span className="text-green-600 font-semibold">FREE</span>
                          ) : (
                            `₹${addon.price.toLocaleString('en-IN')}`
                          )}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 text-gray-700 border-t border-gray-200 mt-2">
                      <span className="font-semibold">Add-ons Total:</span>
                      <span className="font-semibold">
                        ₹{quotation.addOns.filter(a => a.selected).reduce((sum, a) => sum + (a.price || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between py-2 text-gray-700 border-t border-gray-200 mt-2">
                  <span>GST ({quotation.taxRate}%):</span>
                  <span className="font-semibold">₹{quotation.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300 text-lg font-bold text-indigo-600">
                  <span>Total Amount:</span>
                  <span>₹{quotation.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Payment Terms:</h4>
                <p className="text-gray-600">{quotation.paymentTerms}</p>
              </div>
              {quotation.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Notes:</h4>
                  <p className="text-gray-600">{quotation.notes}</p>
                </div>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-xs">
                  <strong>Note:</strong> {quotation.termsAndConditions}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
              <p className="mt-2">For any queries, please contact us at {process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contact@techbuddyspace.in'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Feedback Modal Component
function FeedbackModal({ quotation, onClose }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/quotations/${quotation._id}/feedback`);
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} />
            Client Feedback
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No feedback yet</h3>
              <p className="text-gray-500 mb-6">Client hasn't submitted feedback for this quotation</p>
              
              {/* Feedback Link Section */}
              <div className="max-w-xl mx-auto mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <MessageSquare className="text-indigo-600" size={20} />
                  <h4 className="font-bold text-gray-900">Share Feedback Link</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Copy and share this link with your client to collect their feedback:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quotations/${quotation._id}/feedback`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border-2 border-indigo-200 rounded-lg text-sm font-mono text-gray-700 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={() => {
                      const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quotations/${quotation._id}/feedback`;
                      navigator.clipboard.writeText(feedbackUrl);
                      toast.success('Feedback link copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <AlertCircle size={14} />
                  <span>You can also send this link via email or WhatsApp</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200"
                >
                  {/* Client Info */}
                  {(feedback.clientName || feedback.clientCompany) && (
                    <div className="mb-4 pb-4 border-b border-yellow-200">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={16} />
                        <span className="font-semibold">{feedback.clientName}</span>
                        {feedback.clientCompany && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{feedback.clientCompany}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Overall Rating */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Overall Rating:</h4>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={i < Math.round(feedback.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-2 text-lg font-bold text-gray-900">
                        {feedback.rating.toFixed(1)} out of 5
                      </span>
                    </div>
                  </div>

                  {/* Individual Category Ratings */}
                  {feedback.categoryRatings && Object.keys(feedback.categoryRatings).length > 0 && (
                    <div className="mb-4 bg-white/50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Individual Ratings:</h4>
                      <div className="space-y-3">
                        {Object.entries(feedback.categoryRatings).map(([category, rating]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <div className="flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                                />
                              ))}
                              <span className="ml-1 text-sm font-semibold text-gray-700 w-8">
                                {rating}/5
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Would Recommend */}
                  {feedback.wouldRecommend !== undefined && (
                    <div className="mb-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        feedback.wouldRecommend 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {feedback.wouldRecommend ? (
                          <>
                            <Check size={18} />
                            <span className="font-semibold">Would recommend Tech Buddy Galaxy</span>
                          </>
                        ) : (
                          <>
                            <X size={18} />
                            <span className="font-semibold">Would not recommend</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback Text */}
                  {feedback.feedback && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Comments:</h4>
                      <p className="text-gray-700 bg-white/50 rounded-lg p-3">{feedback.feedback}</p>
                    </div>
                  )}

                  {/* Testimonial */}
                  {feedback.testimonial && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Testimonial:</h4>
                      <p className="text-gray-700 italic bg-white/50 rounded-lg p-3">"{feedback.testimonial}"</p>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-yellow-200">
                    <span>Submitted on {new Date(feedback.createdAt).toLocaleDateString('en-IN')}</span>
                    <div className="flex items-center gap-2">
                      {feedback.isApproved && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Approved
                        </span>
                      )}
                      {feedback.isPublic && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
