"use client";
import { ArrowLeft } from 'lucide-react';

export default function FeedbackStep({ data, onBack, onClose }) {
  const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/feedback/${data._id}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1a1a2e] border-b border-transparent hover:border-[#1a1a2e] transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Email
      </button>

      {/* Success Message */}
      <div className="bg-[#1a1a2e] text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8b86d] opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#e8b86d] opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative text-center">
          <p className="text-7xl mb-6">🎉</p>
          <h2 className="text-3xl font-black uppercase tracking-wider mb-3">
            Quotation Sent Successfully!
          </h2>
          <p className="text-gray-400 text-lg">
            Your professional quotation has been sent to {data.clientName}
          </p>
        </div>
      </div>

      {/* Quotation Details */}
      <div className="bg-white border-2 border-[#1a1a2e] p-6">
        <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
          Quotation Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
              Quotation Number
            </p>
            <p className="font-mono font-bold text-[#1a1a2e]">{data.quotationNumber}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
              Client
            </p>
            <p className="font-bold text-[#1a1a2e]">{data.clientName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
              Project
            </p>
            <p className="font-bold text-[#1a1a2e]">{data.projectTitle}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">
              Total Amount
            </p>
            <p className="font-black text-[#1a1a2e] text-lg">
              ₹{data.totalAmount?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Link */}
      <div className="bg-white border-2 border-[#1a1a2e] p-6">
        <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
          Client Feedback Link
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Share this link with your client to collect feedback after project completion:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={feedbackUrl}
            readOnly
            className="flex-1 px-3 py-2 border-2 border-gray-200 text-sm font-mono bg-gray-50"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(feedbackUrl);
              alert('Link copied to clipboard!');
            }}
            className="px-4 py-2 bg-[#1a1a2e] text-[#e8b86d] font-black uppercase tracking-widest text-xs hover:bg-[#e8b86d] hover:text-[#1a1a2e] transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-amber-50 border-2 border-[#e8b86d] p-6">
        <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4">
          📋 Next Steps
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#e8b86d] font-bold">1.</span>
            <span>Client will receive the quotation email with PDF attachment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#e8b86d] font-bold">2.</span>
            <span>Follow up in 3-5 business days if no response</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#e8b86d] font-bold">3.</span>
            <span>After project completion, share the feedback link</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#e8b86d] font-bold">4.</span>
            <span>Track quotation status in the quotations dashboard</span>
          </li>
        </ul>
      </div>

      {/* Thank You Message */}
      <div className="bg-white border-2 border-[#1a1a2e] p-8 text-center">
        <p className="text-lg font-black text-[#1a1a2e] uppercase tracking-widest mb-2">
          We Believe Your Company Will Grow HIGH! 🚀
        </p>
        <p className="text-gray-600 text-sm mb-6">
          Thank you for using Tech Buddy Galaxy's Professional Quotation System
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-[#1a1a2e] text-[#e8b86d] hover:bg-[#e8b86d] hover:text-[#1a1a2e] font-black uppercase tracking-widest border-2 border-[#1a1a2e] transition-colors"
        >
          Close & Return to Dashboard
        </button>
      </div>
    </div>
  );
}
