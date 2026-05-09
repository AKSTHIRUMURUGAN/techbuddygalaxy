"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Download, CheckCircle, AlertCircle, CreditCard, Clock, ArrowLeft, FileText, ShieldCheck, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        setInvoice(data.data);
      } else {
        setError(data.error || 'Invoice not found');
      }
    } catch (error) {
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    setProcessingPayment(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setProcessingPayment(false);
        return;
      }

      const orderResponse = await fetch(`/api/invoices/${params.id}/create-order`, {
        method: 'POST',
      });
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error(orderData.error || 'Failed to create payment order');
        setProcessingPayment(false);
        return;
      }

      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount * 100,
        currency: orderData.data.currency,
        name: 'Tech Buddy Galaxy',
        description: `Payment for ${orderData.data.invoiceNumber}`,
        order_id: orderData.data.orderId,
        prefill: {
          name: orderData.data.clientName,
          email: orderData.data.clientEmail,
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`/api/invoices/${params.id}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod: 'online',
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast.success('Payment successful!');
              router.push(`/invoices/${params.id}/payment-success`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed');
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={48} />
          <p className="mt-4 text-slate-600 font-medium">Loading invoice...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invoice Not Found</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const statusConfig = {
    paid: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: CheckCircle },
    pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: Clock },
    partially_paid: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: AlertCircle },
    overdue: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
  };

  const status = statusConfig[invoice.paymentStatus] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
          
          <div className="flex gap-3">
            {invoice.paymentStatus !== 'paid' && invoice.balanceAmount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayNow}
                disabled={processingPayment}
                className="relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {processingPayment ? (
                  <>
                    <Loader2 className="animate-spin relative z-10" size={18} />
                    <span className="relative z-10">Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="relative z-10" size={18} />
                    <span className="relative z-10">Pay Now</span>
                  </>
                )}
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <Download size={18} />
              Download
            </motion.button>
          </div>
        </div>

        {/* Invoice Document */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden print:shadow-none"
        >
          {/* Decorative Header Gradient */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b-2 border-slate-100">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <img 
                    src="https://galaxy.techbuddyspace.in/tbgalaxy.png" 
                    alt="Tech Buddy Galaxy" 
                    className="h-14 w-auto mb-4"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">INVOICE</h1>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg">
                    <FileText size={16} className="text-indigo-600" />
                    <p className="text-lg font-semibold text-indigo-700">{invoice.invoiceNumber}</p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-right"
              >
                <div className="flex items-center gap-2 justify-end mb-2">
                  <Building2 size={24} className="text-indigo-600" />
                  <p className="text-xl font-bold text-slate-900">Tech Buddy Galaxy</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">A unit of TechBuddySpace Private Limited</p>
                <p className="text-sm text-slate-600 mt-2 font-medium">Professional IT Services</p>
              </motion.div>
            </div>

            {/* Payment Status Banner */}
            <AnimatePresence>
              {invoice.paymentStatus !== 'pending' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 ${status.bg} border-2 ${status.border} rounded-xl p-5 flex items-center gap-4`}
                >
                  <motion.div
                    animate={invoice.paymentStatus === 'paid' ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <StatusIcon className={status.text} size={28} />
                  </motion.div>
                  <div>
                    <p className={`font-bold text-lg ${status.text}`}>
                      {invoice.paymentStatus === 'paid' && 'Payment Received'}
                      {invoice.paymentStatus === 'partially_paid' && 'Partially Paid'}
                      {invoice.paymentStatus === 'overdue' && 'Payment Overdue'}
                    </p>
                    <p className={`text-sm ${status.text.replace('800', '600')}`}>
                      {invoice.paymentStatus === 'paid' && 'This invoice has been paid in full'}
                      {invoice.paymentStatus === 'partially_paid' && 
                        `₹${invoice.paidAmount.toLocaleString('en-IN')} paid, ₹${invoice.balanceAmount.toLocaleString('en-IN')} remaining`
                      }
                      {invoice.paymentStatus === 'overdue' && 'This invoice is past its due date'}
                    </p>
                  </div>
                </motion.div>
              )}

              {invoice.paymentStatus === 'pending' && invoice.balanceAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 flex items-center gap-4"
                >
                  <Clock className="text-amber-600" size={28} />
                  <div>
                    <p className="font-bold text-lg text-amber-900">Payment Pending</p>
                    <p className="text-sm text-amber-700">This invoice is awaiting payment</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Client & Date Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-50 rounded-xl p-5"
              >
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill To:</h3>
                <p className="font-bold text-lg text-slate-900 mb-1">{invoice.clientName}</p>
                {invoice.companyName && <p className="text-slate-700 font-medium">{invoice.companyName}</p>}
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-slate-600">{invoice.clientEmail}</p>
                  {invoice.clientPhone && <p className="text-sm text-slate-600">{invoice.clientPhone}</p>}
                  {invoice.gstNumber && (
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-green-600" />
                      GST: {invoice.gstNumber}
                    </p>
                  )}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-right space-y-4"
              >
                <div className="bg-slate-50 rounded-xl p-4 inline-block">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Date:</span>
                    <p className="text-slate-900 font-medium">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date:</span>
                    <p className="text-red-600 font-bold">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  {invoice.quotation && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quotation Ref:</span>
                      <p className="text-slate-900 font-medium">{invoice.quotation.quotationNumber || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Project Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-3">{invoice.projectTitle}</h3>
              {invoice.projectDescription && (
                <p className="text-slate-600 leading-relaxed">{invoice.projectDescription}</p>
              )}
            </motion.div>

            {/* Services Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-indigo-50">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Service</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Qty</th>
                      <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm">Unit Price</th>
                      <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm">Discount</th>
                      <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.services.map((service, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-slate-500 mt-1">{service.description}</div>
                          )}
                        </td>
                        <td className="text-center py-4 px-6 text-slate-700">{service.quantity}</td>
                        <td className="text-right py-4 px-6 text-slate-700">₹{service.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="text-right py-4 px-6 text-slate-700">{service.discount}%</td>
                        <td className="text-right py-4 px-6 font-bold text-slate-900">₹{service.total.toLocaleString('en-IN')}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Add-ons Section */}
            {invoice.addOns && invoice.addOns.filter(addon => addon.selected).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                  Add-ons & Extras
                </h3>
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl p-5 space-y-3">
                  {invoice.addOns.filter(addon => addon.selected).map((addon, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-emerald-500" size={20} />
                        <span className="font-medium text-slate-900">{addon.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {addon.price === 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">FREE</span>
                        ) : (
                          `₹${addon.price.toLocaleString('en-IN')}`
                        )}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Totals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex justify-end mb-8"
            >
              <div className="w-full md:w-80 bg-slate-50 rounded-xl p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({invoice.taxRate}%)</span>
                    <span className="font-semibold">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t-2 border-indigo-200 pt-3 mt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-slate-900">Total Amount</span>
                      <span className="text-indigo-700">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-600 pt-2">
                        <span>Paid Amount</span>
                        <span className="font-semibold">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-red-600 font-bold text-lg pt-2 border-t-2 border-red-200">
                        <span>Balance Due</span>
                        <span>₹{invoice.balanceAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-600" />
                  Payment History
                </h3>
                <div className="space-y-3">
                  {invoice.payments.map((payment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                      className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-slate-900">
                              ₹{payment.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full">
                              {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {payment.transactionId && (
                            <p className="text-xs text-slate-500 mt-2 font-mono">
                              TXN: {payment.transactionId}
                            </p>
                          )}
                          {payment.notes && (
                            <p className="text-sm text-slate-600 mt-2 italic bg-slate-50 px-3 py-1 rounded-lg inline-block">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ delay: 1.5 + index * 0.1, duration: 0.3 }}
                        >
                          <CheckCircle className="text-emerald-500" size={24} />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Terms & Notes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Payment Terms
                  </h4>
                  <p className="text-slate-600 text-sm">{invoice.paymentTerms}</p>
                </div>
                {invoice.notes && (
                  <div className="bg-indigo-50 rounded-xl p-5">
                    <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      Notes
                    </h4>
                    <p className="text-indigo-700 text-sm">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-8 pt-6 border-t-2 border-slate-100"
            >
              <div className="text-center">
                <p className="text-slate-500 font-medium">Thank you for your business!</p>
                <p className="text-sm text-slate-400 mt-2">
                  For any queries, please contact us at{' '}
                  <a href="mailto:contact@techbuddyspace.in" className="text-indigo-600 hover:text-indigo-700 underline">
                    contact@techbuddyspace.in
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}