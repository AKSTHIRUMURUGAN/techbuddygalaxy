"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Loader2, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const RATING_CATEGORIES = [
  'Design Quality',
  'Communication',
  'Delivery Speed',
  'Value for Money',
  'Overall Experience',
];

export default function FeedbackPage() {
  const params = useParams();
  const quotationId = params.quotationId;

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [ratings, setRatings] = useState({});
  const [hoverRating, setHoverRating] = useState(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [recommend, setRecommend] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      const res = await fetch(`/api/quotations/${quotationId}`);
      const data = await res.json();
      if (data.success) {
        setQuotation(data.data);
        setName(data.data.clientName || '');
        setCompany(data.data.companyName || '');
      } else {
        toast.error('Quotation not found');
      }
    } catch (error) {
      toast.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  const averageRating = Object.values(ratings).length > 0
    ? (Object.values(ratings).reduce((sum, r) => sum + r, 0) / Object.values(ratings).length).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error('Please enter your name');
      return;
    }

    if (Object.keys(ratings).length < RATING_CATEGORIES.length) {
      toast.error('Please rate all categories');
      return;
    }

    if (recommend === null) {
      toast.error('Please select if you would recommend us');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/quotations/${quotationId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          ratings,
          recommend,
          feedback,
          averageRating: parseFloat(averageRating),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Thank you for your feedback!');
        setSubmitted(true);
      } else {
        toast.error(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1a1a2e]" size={48} />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black text-[#1a1a2e] mb-2">Quotation Not Found</p>
          <p className="text-gray-600">The quotation you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <div className="max-w-2xl w-full text-center py-16">
          <div className="text-7xl mb-6">🙏</div>
          <h2 className="text-3xl font-black text-[#1a1a2e] uppercase tracking-widest mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Your feedback means the world to us.
          </p>
          <p className="text-gray-500 mb-8">
            We're constantly improving to serve you better.
          </p>

          <div className="bg-[#1a1a2e] text-white p-8 text-left max-w-md mx-auto mb-8">
            <p className="text-[#e8b86d] font-black uppercase tracking-widest text-xs mb-4">
              Your Summary
            </p>
            <p className="text-sm text-gray-300 mb-2">
              <span className="text-white font-bold">Name:</span> {name}
            </p>
            {company && (
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-white font-bold">Company:</span> {company}
              </p>
            )}
            <p className="text-sm text-gray-300 mb-2">
              <span className="text-white font-bold">Avg Rating:</span> ⭐ {averageRating}/5
            </p>
            <p className="text-sm text-gray-300 mb-4">
              <span className="text-white font-bold">Recommend:</span> {recommend ? '✅ Yes' : '❌ No'}
            </p>
            {feedback && (
              <p className="text-xs text-gray-400 italic">"{feedback}"</p>
            )}
          </div>

          <div className="bg-amber-50 border-2 border-[#e8b86d] p-6">
            <p className="font-black text-[#1a1a2e] uppercase tracking-widest text-sm mb-2">
              We believe your company will grow HIGH! 🚀
            </p>
            <p className="text-gray-600 text-sm">
              Let's connect and build something amazing together.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a
                href="mailto:contact@techbuddyspace.in"
                className="text-xs font-black uppercase tracking-widest text-[#1a1a2e] border-b-2 border-[#e8b86d] hover:text-[#e8b86d] transition-colors"
              >
                📧 Email Us
              </a>
              <a
                href="https://techbuddyspace.in"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black uppercase tracking-widest text-[#1a1a2e] border-b-2 border-[#e8b86d] hover:text-[#e8b86d] transition-colors"
              >
                🌐 Visit Website
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-sans">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-[#1a1a2e] text-white px-6 py-4 border-b-4 border-[#e8b86d]">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-[#e8b86d] flex items-center justify-center">
            <span className="text-[#1a1a2e] font-black text-lg">TBG</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase text-[#e8b86d]">
              Tech Buddy Galaxy
            </h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase">
              Client Feedback Form
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-[#1a1a2e] text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8b86d] opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#e8b86d] opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <p className="text-[#e8b86d] font-black uppercase tracking-widest text-xs mb-2">
                💬 Your Voice Matters
              </p>
              <h2 className="text-3xl font-black uppercase tracking-wider mb-3">
                How Did We Do?
              </h2>
              <p className="text-gray-400 text-sm max-w-lg">
                Your feedback shapes the future of our services. Take 2 minutes — we promise we read every single response.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ratings */}
            <div className="bg-white border-2 border-[#1a1a2e] p-6">
              <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-5 border-b-2 border-[#e8b86d] pb-2">
                Rate Our Services
              </h3>
              <div className="space-y-5">
                {RATING_CATEGORIES.map((category) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                        {category}
                      </span>
                      {ratings[category] && (
                        <span className="text-xs font-black text-[#e8b86d]">
                          {'★'.repeat(ratings[category])}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isHovered = hoverRating?.category === category && star <= hoverRating.star;
                        const isSelected = ratings[category] >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating({ category, star })}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setRatings({ ...ratings, [category]: star })}
                            className={`text-2xl transition-all transform hover:scale-110 ${
                              isSelected || isHovered ? 'text-[#e8b86d]' : 'text-gray-200'
                            }`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {averageRating && (
                  <div className="mt-5 pt-4 border-t-2 border-[#e8b86d] flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest font-black text-gray-500">
                      Average
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-[#1a1a2e]">{averageRating}</span>
                      <span className="text-[#e8b86d] text-lg">★</span>
                      <span className="text-xs text-gray-400">/ 5</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details & Recommendation */}
            <div className="space-y-4">
              {/* Your Details */}
              <div className="bg-white border-2 border-[#1a1a2e] p-6">
                <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
                  Your Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your company"
                      className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
                    />
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-white border-2 border-[#1a1a2e] p-6">
                <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
                  Would You Recommend Us?
                </h3>
                <div className="flex gap-3">
                  {[
                    { value: true, label: '👍 Yes, Definitely!' },
                    { value: false, label: '👎 Not Yet' },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setRecommend(option.value)}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-2 transition-all ${
                        recommend === option.value
                          ? 'bg-[#1a1a2e] text-[#e8b86d] border-[#1a1a2e]'
                          : 'border-gray-200 text-gray-500 hover:border-[#1a1a2e]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Feedback */}
              <div className="bg-white border-2 border-[#1a1a2e] p-6">
                <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
                  Tell Us More
                </h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience, suggestions, or any comments..."
                  className="w-full px-3 py-2 border-2 border-gray-200 text-sm resize-none focus:outline-none focus:border-[#1a1a2e]"
                  rows={5}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !name || Object.keys(ratings).length < RATING_CATEGORIES.length || recommend === null}
            className="w-full bg-[#1a1a2e] text-[#e8b86d] hover:bg-[#e8b86d] hover:text-[#1a1a2e] font-black uppercase tracking-widest border-2 border-[#1a1a2e] py-6 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              <>
                <Check size={20} />
                Submit Feedback & Stay Connected 💬
              </>
            )}
          </button>

          {/* Footer Message */}
          <div className="bg-amber-50 border-2 border-[#e8b86d] p-6 text-center">
            <p className="text-lg font-black text-[#1a1a2e] uppercase tracking-widest mb-2">
              We Love to Connect With You! 🤝
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Thank you for choosing Tech Buddy Galaxy. We genuinely believe your company will grow to extraordinary heights, and we're honored to be part of that journey!
            </p>
            <div className="flex justify-center gap-6 text-xs font-black uppercase tracking-widest">
              <a
                href="mailto:contact@techbuddyspace.in"
                className="text-[#1a1a2e] hover:text-[#e8b86d] transition-colors"
              >
                📧 Email
              </a>
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
        </form>
      </main>
    </div>
  );
}
