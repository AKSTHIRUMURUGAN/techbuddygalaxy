"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, Plus, Trash2, AlertCircle, User, Mail, Phone, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateQuotationModal({ clients, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState('existing'); // 'existing' or 'new'
  const [formData, setFormData] = useState({
    client: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    gstNumber: '',
    projectTitle: '',
    projectDescription: '',
    services: [{ name: '', description: '', quantity: 1, unitPrice: 0, discount: 0 }],
    taxRate: 18,
    validTill: '',
    paymentTerms: '50% advance, 50% on completion',
    notes: '',
    status: 'draft',
  });

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', description: '', quantity: 1, unitPrice: 0, discount: 0 }],
    });
  };

  const removeService = (index) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const updateService = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    setFormData({ ...formData, services: newServices });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    formData.services.forEach(service => {
      const itemTotal = service.quantity * service.unitPrice * (1 - service.discount / 100);
      subtotal += itemTotal;
    });
    const taxAmount = subtotal * (formData.taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        client: clientType === 'existing' ? formData.client : undefined,
      };

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Quotation created successfully!');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to create quotation');
      }
    } catch (error) {
      toast.error('An error occurred');
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
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Create New Quotation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Client Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Client Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setClientType('existing')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    clientType === 'existing'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      clientType === 'existing' ? 'border-indigo-600' : 'border-gray-300'
                    }`}>
                      {clientType === 'existing' && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Existing Client</div>
                      <div className="text-xs text-gray-500">Select from registered clients</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setClientType('new')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    clientType === 'new'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      clientType === 'new' ? 'border-indigo-600' : 'border-gray-300'
                    }`}>
                      {clientType === 'new' && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">New/Immediate Client</div>
                      <div className="text-xs text-gray-500">Enter client details manually</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Client Selection or Manual Entry */}
            {clientType === 'existing' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Client *
                </label>
                <select
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} {client.companyName ? `- ${client.companyName}` : ''} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User size={14} className="inline mr-1" />
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={14} className="inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone size={14} className="inline mr-1" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building2 size={14} className="inline mr-1" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="22AAAAA0000A1Z5 (Optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="E.g., E-commerce Website Development"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid Till *
                </label>
                <input
                  type="date"
                  required
                  value={formData.validTill}
                  onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Brief description of the project..."
              />
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Services *
                </label>
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  <Plus size={16} />
                  Add Service
                </button>
              </div>

              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Service {index + 1}</span>
                      {formData.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        required
                        placeholder="Service name"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Qty"
                        value={service.quantity}
                        onChange={(e) => updateService(index, 'quantity', parseFloat(e.target.value) || 1)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="Unit Price"
                        value={service.unitPrice}
                        onChange={(e) => updateService(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Discount %"
                        value={service.discount}
                        onChange={(e) => updateService(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700">
                        ₹{(service.quantity * service.unitPrice * (1 - service.discount / 100)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 items-center">
                  <span>GST (Optional - {formData.taxRate}%):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-right"
                      placeholder="0"
                    />
                    <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold text-indigo-600 pt-2 border-t border-indigo-200">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="E.g., 50% advance, 50% on completion"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="sent">Send to Client</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Any additional notes or special terms..."
              />
            </div>

            {/* Free Revision Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Includes 3 minor revisions free of cost. Additional revisions or major scope changes may incur extra charges.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Create Quotation
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
