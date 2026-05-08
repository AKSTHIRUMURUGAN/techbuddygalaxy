"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, Home, Mail } from 'lucide-react';

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setQuotation(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a2e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-emerald-500 rounded-full p-6">
              <CheckCircle size={64} className="text-white" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-white border-4 border-[#1a1a2e] shadow-2xl">
          {/* Header */}
          <div className="bg-[#1a1a2e] text-white p-8 text-center">
            <h1 className="text-3xl font-black uppercase tracking-widest text-[#e8b86d] mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-gray-400 text-sm">
              Your payment has been processed successfully
            </p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Payment Details */}
            {quotation && (
              <div className="bg-emerald-50 border-2 border-emerald-200 p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                      Quotation Number
                    </p>
                    <p className="font-black text-[#1a1a2e]">{quotation.quotationNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                      Amount Paid
                    </p>
                    <p className="font-black text-emerald-600 text-lg">
                      ₹{quotation.paidAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                      Payment Method
                    </p>
                    <p className="font-bold text-gray-700 capitalize">
                      {quotation.paymentMethod || 'Online'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                      Payment Date
                    </p>
                    <p className="font-bold text-gray-700">
                      {quotation.paidAt ? new Date(quotation.paidAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }) : 'Just now'}
                    </p>
                  </div>
                </div>

                {quotation.razorpayPaymentId && (
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                      Transaction ID
                    </p>
                    <p className="font-mono text-xs text-gray-600 break-all">
                      {quotation.razorpayPaymentId}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* What's Next */}
            <div className="bg-blue-50 border-2 border-blue-200 p-6">
              <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-3">
                📋 What's Next?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>You will receive a payment confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Our team will start working on your project as per the timeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>You can download the quotation for your records</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>We'll keep you updated on the project progress</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push(`/quotations/${params.id}`)}
                className="px-6 py-4 border-2 border-[#1a1a2e] text-[#1a1a2e] font-black uppercase tracking-widest text-sm hover:bg-[#f5f0eb] transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                View Quotation
              </button>
              <button
                onClick={() => window.location.href = 'mailto:contact@techbuddyspace.in'}
                className="px-6 py-4 bg-[#1a1a2e] text-[#e8b86d] font-black uppercase tracking-widest text-sm hover:bg-[#e8b86d] hover:text-[#1a1a2e] border-2 border-[#1a1a2e] transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Contact Us
              </button>
            </div>

            {/* Thank You Message */}
            <div className="bg-amber-50 border-2 border-[#e8b86d] p-6 text-center">
              <p className="text-lg font-black text-[#1a1a2e] uppercase tracking-widest mb-2">
                Thank You for Your Trust! 🙏
              </p>
              <p className="text-gray-600 text-sm">
                We're excited to work with you and help your business grow to new heights!
              </p>
              <div className="flex justify-center gap-6 mt-4 text-xs font-black uppercase tracking-widest">
                <a
                  href="https://techbuddyspace.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1a1a2e] hover:text-[#e8b86d] transition-colors"
                >
                  🌐 Website
                </a>
                <a
                  href="https://instagram.com/techbuddyspace"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1a1a2e] hover:text-[#e8b86d] transition-colors"
                >
                  📸 Instagram
                </a>
                <a
                  href="https://linkedin.com/company/techbuddyspace"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1a1a2e] hover:text-[#e8b86d] transition-colors"
                >
                  💼 LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
