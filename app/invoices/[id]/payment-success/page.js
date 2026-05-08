"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        setInvoice(data.data);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-50 text-lg">Thank you for your payment</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {invoice && (
              <>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                        Invoice Number
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                        Amount Paid
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{invoice.paidAmount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                        Client Name
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {invoice.clientName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                        Payment Status
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        {invoice.paymentStatus === 'paid' ? 'PAID IN FULL' : 'PARTIALLY PAID'}
                      </p>
                    </div>
                  </div>

                  {invoice.payments && invoice.payments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
                        Transaction ID
                      </p>
                      <p className="font-mono text-xs text-gray-600 break-all">
                        {invoice.payments[invoice.payments.length - 1].transactionId}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>What's next?</strong> A payment confirmation has been recorded. 
                    You can download your invoice for your records.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/invoices/${params.id}`}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    View Invoice
                  </Link>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Go to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            For any queries, please contact us at{' '}
            <a href="mailto:contact@techbuddyspace.in" className="text-green-600 hover:underline">
              contact@techbuddyspace.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
