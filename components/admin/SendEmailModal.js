"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, FileText, Receipt, MessageSquare, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const EMAIL_TYPES = [
  {
    id: 'quotation',
    label: 'Quotation',
    icon: FileText,
    color: 'indigo',
    description: 'Send quotation details to client',
    endpoint: '/api/quotations/{id}/send-email',
  },
  {
    id: 'invoice',
    label: 'Invoice',
    icon: Receipt,
    color: 'green',
    description: 'Send invoice with payment details',
    endpoint: '/api/invoices/{id}/send-email',
  },
  {
    id: 'feedback',
    label: 'Feedback Request',
    icon: MessageSquare,
    color: 'yellow',
    description: 'Request feedback from client',
    endpoint: '/api/send-feedback-request',
  },
];

export default function SendEmailModal({ isOpen, onClose, documentType, documentId, clientEmail, clientName }) {
  const [selectedType, setSelectedType] = useState(documentType || 'quotation');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Filter available email types based on document type
  const availableEmailTypes = EMAIL_TYPES.filter(type => {
    // Always show quotation and feedback for quotations
    if (documentType === 'quotation') {
      return type.id === 'quotation' || type.id === 'feedback';
    }
    // Only show invoice for invoices
    if (documentType === 'invoice') {
      return type.id === 'invoice' || type.id === 'feedback';
    }
    return true;
  });

  const handleSend = async () => {
    setLoading(true);
    try {
      const emailType = EMAIL_TYPES.find(t => t.id === selectedType);
      let endpoint = emailType.endpoint.replace('{id}', documentId);
      let body = {
        clientEmail,
        clientName,
      };

      // Special handling for feedback request
      if (selectedType === 'feedback') {
        body.quotationId = documentId;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}. The endpoint may not exist.`);
      }

      const data = await res.json();

      if (data.success) {
        setSent(true);
        toast.success(`${emailType.label} sent successfully!`);
        setTimeout(() => {
          onClose();
          setSent(false);
        }, 2000);
      } else {
        toast.error(data.error || `Failed to send ${emailType.label.toLowerCase()}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'An error occurred while sending email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="text-white" size={24} />
              <h2 className="text-2xl font-bold text-white">Send Email to Client</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Sending to:</p>
              <p className="text-lg font-semibold text-gray-900">{clientName}</p>
              <p className="text-sm text-gray-600">{clientEmail}</p>
            </div>

            {/* Email Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Email Type:
              </label>
              <div className={`grid gap-3 ${availableEmailTypes.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                {availableEmailTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  const colorClasses = {
                    indigo: {
                      border: 'border-indigo-500',
                      bg: 'bg-indigo-50',
                      text: 'text-indigo-600',
                      icon: 'text-indigo-600',
                    },
                    green: {
                      border: 'border-green-500',
                      bg: 'bg-green-50',
                      text: 'text-green-600',
                      icon: 'text-green-600',
                    },
                    yellow: {
                      border: 'border-yellow-500',
                      bg: 'bg-yellow-50',
                      text: 'text-yellow-600',
                      icon: 'text-yellow-600',
                    },
                  };
                  const colors = colorClasses[type.color];

                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? `${colors.border} ${colors.bg}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check size={20} className={colors.text} />
                        </div>
                      )}
                      <Icon
                        size={28}
                        className={`mb-2 ${isSelected ? colors.icon : 'text-gray-400'}`}
                      />
                      <h3
                        className={`font-semibold mb-1 ${
                          isSelected ? colors.text : 'text-gray-900'
                        }`}
                      >
                        {type.label}
                      </h3>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Mail className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Email Preview</p>
                  <p>
                    {selectedType === 'quotation' &&
                      'Client will receive a professional quotation email with project details, pricing breakdown, and a link to view the full quotation.'}
                    {selectedType === 'invoice' &&
                      'Client will receive an invoice email with payment details, due date, and a link to view and pay the invoice online.'}
                    {selectedType === 'feedback' &&
                      'Client will receive a friendly feedback request email with a link to submit their review and testimonial.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {sent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-2 text-green-800">
                  <Check size={20} />
                  <p className="font-semibold">Email sent successfully!</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading || sent}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : sent ? (
                  <>
                    <Check size={20} />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
