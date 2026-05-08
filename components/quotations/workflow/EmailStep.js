"use client";
import { useState } from 'react';
import { ArrowLeft, Mail, Loader2, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailStep({ data, onBack, onNext }) {
  const [emailData, setEmailData] = useState({
    to: data.clientEmail || '',
    cc: 'contact@techbuddyspace.in',
    subject: `${data.docType === 'invoice' ? 'Invoice' : 'Quotation'} from Tech Buddy Galaxy — ${data.quotationNumber || 'DRAFT'}`,
    body: generateEmailBody(data),
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const calculateTotal = () => {
    const subtotal = data.services?.reduce((sum, s) => {
      return sum + (s.quantity * s.unitPrice * (1 - (s.discount || 0) / 100));
    }, 0) || 0;
    const addOnsTotal = data.addOns?.filter(a => a.selected).reduce((sum, a) => sum + a.price, 0) || 0;
    const afterDiscount = subtotal + addOnsTotal - (data.discount || 0);
    const taxAmount = Math.round(afterDiscount * (data.taxRate || 18) / 100);
    return afterDiscount + taxAmount;
  };

  const total = calculateTotal();
  const freeAddOns = data.addOns?.filter(a => a.selected && a.price === 0) || [];

  const handleSendEmail = async () => {
    if (!emailData.to) {
      toast.error('Recipient email is required');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/quotations/${data._id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          cc: emailData.cc,
          subject: emailData.subject,
          customMessage: emailData.body,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Email sent successfully!');
        setSent(true);
        setTimeout(() => onNext(), 1500);
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('An error occurred');
    } finally {
      setSending(false);
    }
  };

  const handleOpenInGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailData.to)}&cc=${encodeURIComponent(emailData.cc)}&su=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.open(gmailUrl, '_blank');
    toast.success('Gmail opened in new tab');
  };

  const handleOpenInDefaultMail = () => {
    const mailtoUrl = `mailto:${emailData.to}?cc=${encodeURIComponent(emailData.cc)}&subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <button
        onClick={onBack}
        className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1a1a2e] border-b border-transparent hover:border-[#1a1a2e] transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Preview
      </button>

      {sent && (
        <div className="bg-green-50 border-2 border-green-400 p-5 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="font-black text-green-800 uppercase tracking-widest text-sm">
            Email Sent Successfully!
          </p>
          <p className="text-green-700 text-sm mt-1">
            Your quotation has been sent to {emailData.to}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Email Composer */}
        <div className="md:col-span-2 bg-white border-2 border-[#1a1a2e]">
          <div className="bg-[#1a1a2e] text-[#e8b86d] px-5 py-3 flex items-center gap-3">
            <Mail size={20} />
            <span className="font-black uppercase tracking-widest text-sm">Compose Email</span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-1">
                  To *
                </label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  placeholder="client@email.com"
                  className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-1">
                  CC
                </label>
                <input
                  type="email"
                  value={emailData.cc}
                  onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                  placeholder="cc@email.com"
                  className="w-full px-3 py-2 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-bold focus:outline-none focus:border-[#1a1a2e]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-1">
                Email Body
              </label>
              <textarea
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm resize-none font-mono leading-relaxed focus:outline-none focus:border-[#1a1a2e]"
                rows={18}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSendEmail}
                disabled={sending || sent}
                className="flex-1 bg-[#1a1a2e] text-[#e8b86d] hover:bg-[#e8b86d] hover:text-[#1a1a2e] font-black uppercase tracking-widest border-2 border-[#1a1a2e] py-5 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Sending...
                  </>
                ) : sent ? (
                  <>
                    <Check size={16} />
                    Sent!
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Email Now
                  </>
                )}
              </button>
              <button
                onClick={handleOpenInGmail}
                className="px-4 py-5 border-2 border-[#1a1a2e] text-[#1a1a2e] text-xs font-black uppercase tracking-widest hover:bg-[#f5f0eb] transition-colors flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Gmail
              </button>
              <button
                onClick={handleOpenInDefaultMail}
                className="px-4 py-5 border-2 border-[#1a1a2e] text-[#1a1a2e] text-xs font-black uppercase tracking-widest hover:bg-[#f5f0eb] transition-colors"
              >
                📨
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Document Summary */}
          <div className="bg-white border-2 border-[#1a1a2e] p-5">
            <h3 className="font-black uppercase tracking-widest text-xs text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
              Document Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Type</span>
                <span className="font-bold capitalize">{data.docType || 'quotation'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Number</span>
                <span className="font-mono text-xs">{data.quotationNumber || 'DRAFT'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Client</span>
                <span className="font-bold text-xs text-right max-w-24 truncate">
                  {data.clientName || '—'}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Total</span>
                <span className="font-black text-[#1a1a2e]">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Email Tips */}
          <div className="bg-[#1a1a2e] text-white p-5">
            <h3 className="font-black uppercase tracking-widest text-xs text-[#e8b86d] mb-3">
              📌 Email Tips
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex gap-2">
                <span className="text-[#e8b86d]">→</span>
                PDF will be attached automatically
              </li>
              <li className="flex gap-2">
                <span className="text-[#e8b86d]">→</span>
                Follow up in 3–5 days if no response
              </li>
              <li className="flex gap-2">
                <span className="text-[#e8b86d]">→</span>
                Ask for confirmation reply
              </li>
              <li className="flex gap-2">
                <span className="text-[#e8b86d]">→</span>
                Best time: Tue–Thu, 10am–12pm
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="bg-white border-2 border-[#1a1a2e] p-5">
            <h3 className="font-black uppercase tracking-widest text-xs text-[#1a1a2e] mb-3 border-b-2 border-[#e8b86d] pb-2">
              Our Links
            </h3>
            <div className="space-y-2">
              {[
                { icon: '🌐', label: 'Website', url: 'https://techbuddyspace.in' },
                { icon: '📸', label: 'Instagram', url: 'https://instagram.com/techbuddyspace' },
                { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com/company/techbuddyspace' },
                { icon: '▶️', label: 'YouTube', url: 'https://youtube.com/@techbuddyspace' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs hover:text-[#e8b86d] transition-colors group"
                >
                  <span>{link.icon}</span>
                  <span className="font-bold uppercase tracking-widest text-gray-500 group-hover:text-[#1a1a2e]">
                    {link.label}
                  </span>
                  <span className="text-gray-300 text-xs ml-auto">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateEmailBody(data) {
  const total = data.totalAmount || 0;
  const freeAddOns = data.addOns?.filter(a => a.selected && a.price === 0) || [];
  
  return `Dear ${data.clientName || 'Valued Client'},

Greetings from Tech Buddy Galaxy! 🙏

Thank you for choosing us for your digital journey. We are thrilled to present our ${data.docType === 'invoice' ? 'invoice' : 'quotation'} tailored specifically for ${data.companyName || 'your business'}.

📋 DOCUMENT DETAILS
${(data.docType || 'quotation').toUpperCase()} No: ${data.quotationNumber || 'DRAFT'}
Date: ${new Date(data.date || data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
${data.docType === 'quotation' ? `Valid Until: ${new Date(data.validTill || data.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}` : ''}

🛠 SERVICES INCLUDED
${data.services?.map(s => `• ${s.name} — ₹${(s.quantity * s.unitPrice * (1 - (s.discount || 0) / 100)).toLocaleString()}`).join('\n') || ''}

🎁 COMPLIMENTARY INCLUSIONS
${freeAddOns.length > 0 ? freeAddOns.map(a => `• ${a.name} (FREE)`).join('\n') : '• 3 Minor Revision Rounds — FREE of charge'}

💰 TOTAL AMOUNT: ₹${total.toLocaleString()} (inclusive of ${data.taxRate || 18}% GST)

${data.notes ? `📝 TERMS & NOTES\n${data.notes}\n` : ''}

📞 NEXT STEPS
• Review the attached ${data.docType || 'quotation'}
• Feel free to reach out for any questions or adjustments
• Reply to this email or call us at +91 98765 43210

💬 YOUR FEEDBACK MATTERS
We'd love to hear how we're doing! After the project, kindly share your experience with us — your review helps us serve you and others better.

🌱 At Tech Buddy Galaxy, we genuinely believe your company will grow to extraordinary heights. We're not just your service provider — we're your growth partner.

We look forward to connecting with you soon!

Warm regards,
Team Tech Buddy Galaxy
━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 www.techbuddyspace.in
📧 contact@techbuddyspace.in
📞 +91 98765 43210
📍 Your Company Address
━━━━━━━━━━━━━━━━━━━━━━━━━━
"We Help Businesses Grow Digitally"`;
}
