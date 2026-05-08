"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Eye, Download, Printer, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600 border-gray-300',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  viewed: 'bg-purple-50 text-purple-700 border-purple-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-orange-50 text-orange-700 border-orange-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function QuotationViewPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchQuotation();
    markAsViewed();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setQuotation(data.data);
      } else {
        setError(data.error || 'Failed to load quotation');
      }
    } catch (err) {
      setError('Failed to load quotation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async () => {
    try {
      await fetch(`/api/quotations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'viewed',
          viewedAt: new Date(),
        }),
      });
    } catch (err) {
      console.error('Failed to mark as viewed:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedback = () => {
    router.push(`/feedback/${params.id}`);
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
    if (!quotation.razorpayEnabled) {
      toast.error('Online payment is not enabled for this quotation');
      return;
    }

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
      const orderResponse = await fetch(`/api/quotations/${params.id}/create-order`, {
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
        description: `Payment for ${orderData.data.quotationNumber}`,
        order_id: orderData.data.orderId,
        prefill: {
          name: orderData.data.clientName,
          email: orderData.data.clientEmail,
        },
        theme: {
          color: '#1a1a2e',
        },
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch(`/api/quotations/${params.id}/verify-payment`, {
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
            toast.success('Payment successful! 🎉');
            // Redirect to success page
            router.push(`/quotations/${params.id}/payment-success`);
          } else {
            toast.error('Payment verification failed');
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a2e] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-200 rounded-lg p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Quotation Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The quotation you are looking for does not exist.'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#1a1a2e] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#e8b86d] hover:text-[#1a1a2e] transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const isExpired = new Date(quotation.validTill) < new Date();
  const selectedAddOns = quotation.addOns?.filter(a => a.selected) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex gap-3 items-center justify-between mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-[#1a1a2e]">Quotation</h1>
            <p className="text-sm text-gray-500">#{quotation.quotationNumber}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border-2 border-[#1a1a2e] text-[#1a1a2e] text-xs font-black uppercase tracking-widest hover:bg-[#f5f0eb] transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </button>
            {quotation.paymentStatus === 'completed' ? (
              <div className="px-6 py-2 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle size={16} />
                Paid ₹{quotation.paidAmount.toLocaleString()}
              </div>
            ) : (
              <>
                {quotation.razorpayEnabled && quotation.status !== 'rejected' && !isExpired && (
                  <button
                    onClick={handlePayNow}
                    disabled={processingPayment}
                    className="px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black uppercase tracking-widest border-2 border-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        Pay Now
                      </>
                    )}
                  </button>
                )}
                {quotation.status !== 'accepted' && quotation.status !== 'rejected' && !isExpired && (
                  <button
                    onClick={handleFeedback}
                    className="px-6 py-2 bg-[#1a1a2e] text-[#e8b86d] hover:bg-[#e8b86d] hover:text-[#1a1a2e] text-xs font-black uppercase tracking-widest border-2 border-[#1a1a2e] transition-colors"
                  >
                    Respond to Quotation
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Expired Notice */}
        {isExpired && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-600" size={24} />
              <div>
                <p className="font-bold text-orange-900">This quotation has expired</p>
                <p className="text-sm text-orange-700">
                  Valid until: {new Date(quotation.validTill).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document */}
        <div className="bg-white border-2 border-[#1a1a2e] print:border-0 shadow-lg">
          {/* Header */}
          <div className="bg-[#1a1a2e] text-white p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-[#e8b86d] flex items-center justify-center">
                    <span className="text-[#1a1a2e] font-black text-2xl">TBG</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-widest uppercase text-[#e8b86d]">
                      Tech Buddy Galaxy
                    </h1>
                    <p className="text-xs text-gray-400 tracking-widest uppercase">
                      Digital Solutions Agency
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1 mt-4">
                  <p>📧 contact@techbuddyspace.in</p>
                  <p>🌐 www.techbuddyspace.in</p>
                  <p>📞 +91 98765 43210</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-4xl font-black uppercase tracking-widest text-[#e8b86d] mb-2">
                  Quotation
                </div>
                <div className="text-sm text-gray-300 space-y-1 font-mono">
                  <p># {quotation.quotationNumber}</p>
                  <p>Date: {new Date(quotation.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}</p>
                  <p>Valid: {new Date(quotation.validTill).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}</p>
                </div>
                <div className={`mt-3 text-xs font-black uppercase tracking-widest px-4 py-2 border inline-block ${STATUS_STYLES[quotation.status]}`}>
                  {quotation.status}
                </div>
              </div>
            </div>
          </div>

          {/* Accent Bar */}
          <div className="h-1.5 bg-[#e8b86d]"></div>

          {/* Client Info */}
          <div className="p-8 border-b-2 border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-3">
                  Bill To
                </p>
                <div className="space-y-1">
                  <p className="text-lg font-black text-[#1a1a2e]">{quotation.clientName}</p>
                  {quotation.companyName && (
                    <p className="text-sm font-bold text-gray-600">{quotation.companyName}</p>
                  )}
                  <p className="text-sm text-gray-500">📧 {quotation.clientEmail}</p>
                  {quotation.clientPhone && (
                    <p className="text-sm text-gray-500">📞 {quotation.clientPhone}</p>
                  )}
                  {quotation.gstNumber && (
                    <p className="text-sm text-gray-500">GST: {quotation.gstNumber}</p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-[#e8b86d] p-4">
                <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-2">
                  Summary
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Services</span>
                    <span className="font-bold">{quotation.services?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between border-t border-amber-200 pt-1 mt-1">
                    <span className="font-black text-[#1a1a2e]">Grand Total</span>
                    <span className="font-black text-[#1a1a2e] text-base">
                      ₹{quotation.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Title */}
          {quotation.projectTitle && (
            <div className="px-8 pt-6">
              <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">{quotation.projectTitle}</h2>
              {quotation.projectDescription && (
                <p className="text-gray-600">{quotation.projectDescription}</p>
              )}
            </div>
          )}

          {/* Services Table */}
          <div className="p-8">
            <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-4">
              Services & Deliverables
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a1a2e] text-white">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest font-bold">#</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest font-bold">Service</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest font-bold hidden md:table-cell">Description</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-widest font-bold">Qty</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-widest font-bold">Rate</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-widest font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotation.services?.map((service, index) => (
                  <tr
                    key={service._id || index}
                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="py-3 px-4 text-gray-400 text-xs font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1a1a2e]">
                      {service.name}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs hidden md:table-cell">
                      {service.description}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{service.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-600 font-mono">
                      ₹{service.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#1a1a2e] font-mono">
                      ₹{service.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-8">
              <div className="w-80">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 uppercase text-xs tracking-widest">Subtotal</span>
                    <span className="font-mono">₹{quotation.subtotal.toLocaleString()}</span>
                  </div>
                  {quotation.taxRate > 0 && (
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500 uppercase text-xs tracking-widest">
                        GST ({quotation.taxRate}%)
                      </span>
                      <span className="font-mono">₹{quotation.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between bg-[#1a1a2e] text-white px-4 py-3 mt-2">
                    <span className="font-black uppercase tracking-widest text-sm text-[#e8b86d]">
                      Total Amount
                    </span>
                    <span className="font-black text-xl font-mono">
                      ₹{quotation.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="px-8 pb-6">
              <div className="bg-gray-50 border-l-4 border-[#e8b86d] p-4">
                <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-2">
                  Notes & Terms
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-[#1a1a2e] text-white px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
              <div>
                <p className="text-[#e8b86d] font-black uppercase tracking-widest mb-1">
                  Bank Details
                </p>
                <p>Bank: HDFC Bank</p>
                <p>A/C: 1234 5678 9012</p>
                <p>IFSC: HDFC0001234</p>
              </div>
              <div className="text-center">
                <p className="text-[#e8b86d] font-black uppercase tracking-widest mb-1">
                  Connect With Us
                </p>
                <p>🌐 www.techbuddyspace.in</p>
                <p>📧 contact@techbuddyspace.in</p>
                <p>📱 +91 98765 43210</p>
              </div>
              <div className="text-right">
                <p className="text-[#e8b86d] font-black uppercase tracking-widest mb-1">
                  For Tech Buddy Galaxy
                </p>
                <div className="mt-6 border-t border-gray-600 pt-2 text-right">
                  <p>Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-4 pt-4 text-center">
              <p className="text-xs text-gray-500">
                Thank you for choosing Tech Buddy Galaxy. We believe your company will grow to new heights! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
