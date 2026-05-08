"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Download, CheckCircle, AlertCircle, CreditCard, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setProcessingPayment(false);
        return;
      }

      // Create order
      const orderResponse = await fetch(`/api/invoices/${params.id}/create-order`, {
        method: 'POST',
      });
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error(orderData.error || 'Failed to create payment order');
        setProcessingPayment(false);
        return;
      }

      // Razorpay options
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
          color: '#16a34a',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-6">
          {invoice.paymentStatus !== 'paid' && invoice.balanceAmount > 0 && (
            <button
              onClick={handlePayNow}
              disabled={processingPayment}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay Now
                </>
              )}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>

        {/* Invoice Document */}
        <div className="bg-white rounded-xl shadow-lg p-8 print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-green-600">
            <div>
              <img 
                src="https://galaxy.techbuddyspace.in/tbg.png" 
                alt="Tech Buddy Galaxy" 
                className="h-16 w-auto mb-3"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-lg font-semibold text-green-600">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">Tech Buddy Galaxy</p>
              <p className="text-xs text-gray-500 mt-1">A unit of TechBuddySpace Private Limited</p>
              <p className="text-sm text-gray-600 mt-2">Professional IT Services</p>
            </div>
          </div>

          {/* Payment Status Badge */}
          {invoice.paymentStatus === 'paid' && (
            <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-bold text-green-900">Payment Received</p>
                <p className="text-sm text-green-700">This invoice has been paid in full</p>
              </div>
            </div>
          )}

          {invoice.paymentStatus === 'pending' && invoice.balanceAmount > 0 && (
            <div className="mb-6 bg-amber-50 border-2 border-amber-500 rounded-lg p-4 flex items-center gap-3">
              <Clock className="text-amber-600" size={24} />
              <div>
                <p className="font-bold text-amber-900">Payment Pending</p>
                <p className="text-sm text-amber-700">This invoice is awaiting payment</p>
              </div>
            </div>
          )}

          {invoice.paymentStatus === 'partially_paid' && (
            <div className="mb-6 bg-blue-50 border-2 border-blue-500 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-blue-600" size={24} />
              <div>
                <p className="font-bold text-blue-900">Partially Paid</p>
                <p className="text-sm text-blue-700">
                  ₹{invoice.paidAmount.toLocaleString('en-IN')} paid, ₹{invoice.balanceAmount.toLocaleString('en-IN')} remaining
                </p>
              </div>
            </div>
          )}

          {invoice.paymentStatus === 'overdue' && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="font-bold text-red-900">Payment Overdue</p>
                <p className="text-sm text-red-700">This invoice is past its due date</p>
              </div>
            </div>
          )}

          {/* Client & Date Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To:</h3>
              <p className="font-bold text-gray-900">{invoice.clientName}</p>
              {invoice.companyName && <p className="text-gray-700">{invoice.companyName}</p>}
              <p className="text-gray-600">{invoice.clientEmail}</p>
              {invoice.clientPhone && <p className="text-gray-600">{invoice.clientPhone}</p>}
              {invoice.gstNumber && <p className="text-gray-600">GST: {invoice.gstNumber}</p>}
            </div>
            <div className="text-right">
              <div className="mb-3">
                <span className="text-sm font-semibold text-gray-500">Invoice Date:</span>
                <p className="text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="mb-3">
                <span className="text-sm font-semibold text-gray-500">Due Date:</span>
                <p className="text-red-600 font-semibold">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
              </div>
              {invoice.quotation && (
                <div>
                  <span className="text-sm font-semibold text-gray-500">Quotation Ref:</span>
                  <p className="text-gray-900">{invoice.quotation.quotationNumber || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{invoice.projectTitle}</h3>
            {invoice.projectDescription && (
              <p className="text-gray-600">{invoice.projectDescription}</p>
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
                {invoice.services.map((service, index) => (
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

          {/* Add-ons Section */}
          {invoice.addOns && invoice.addOns.filter(addon => addon.selected).length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add-ons & Extras</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {invoice.addOns.filter(addon => addon.selected).map((addon, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={18} />
                      <span className="font-medium text-gray-900">{addon.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {addon.price === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${addon.price.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="flex justify-between py-2 text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-700">
                <span>GST ({invoice.taxRate}%):</span>
                <span className="font-semibold">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-300 text-lg font-bold text-green-600">
                <span>Total Amount:</span>
                <span>₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between py-2 text-green-600">
                    <span>Paid Amount:</span>
                    <span className="font-semibold">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-red-300 text-lg font-bold text-red-600">
                    <span>Balance Due:</span>
                    <span>₹{invoice.balanceAmount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {invoice.payments.map((payment, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            ₹{payment.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Transaction ID: {payment.transactionId}
                          </p>
                        )}
                        {payment.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Payment Terms:</h4>
              <p className="text-gray-600">{invoice.paymentTerms}</p>
            </div>
            {invoice.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Notes:</h4>
                <p className="text-gray-600">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p className="mt-2">For any queries, please contact us at contact@techbuddyspace.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
