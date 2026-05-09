"use client";
import { useRef } from 'react';
import { ArrowLeft, Printer, Download, FileText } from 'lucide-react';
import { generatePDF, downloadAsHTML } from '@/lib/utils/pdfGenerator';

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600 border-gray-300',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  viewed: 'bg-purple-50 text-purple-700 border-purple-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function PreviewStep({ data, onBack, onNext }) {
  const previewRef = useRef(null);

  // Debug: Log the data to see if addOns are present
  console.log('PreviewStep data:', {
    hasAddOns: !!data.addOns,
    addOnsLength: data.addOns?.length,
    selectedAddOns: data.addOns?.filter(a => a.selected).length,
    addOns: data.addOns
  });

  const calculateTotals = () => {
    const subtotal = data.services?.reduce((sum, s) => {
      return sum + (s.quantity * s.unitPrice * (1 - (s.discount || 0) / 100));
    }, 0) || 0;

    const addOnsTotal = data.addOns?.filter(a => a.selected).reduce((sum, a) => sum + a.price, 0) || 0;
    const overallCost = subtotal + addOnsTotal;
    const offeredPrice = overallCost - (data.discount || 0);
    const taxAmount = Math.round(offeredPrice * (data.taxRate || 0) / 100);
    const totalAmount = offeredPrice + taxAmount;

    return { subtotal, addOnsTotal, overallCost, offeredPrice, taxAmount, totalAmount };
  };

  const { subtotal, addOnsTotal, overallCost, offeredPrice, taxAmount, totalAmount } = calculateTotals();

  const selectedAddOns = data.addOns?.filter(a => a.selected) || [];
  const freeAddOns = selectedAddOns.filter(a => a.price === 0);
  const paidAddOns = selectedAddOns.filter(a => a.price > 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (previewRef.current) {
      await generatePDF(previewRef.current, `quotation-${data.quotationNumber || 'draft'}.pdf`);
    }
  };

  const handleDownloadHTML = () => {
    if (previewRef.current) {
      downloadAsHTML(previewRef.current, `quotation-${data.quotationNumber || 'draft'}.html`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3 items-center justify-between flex-wrap print:hidden">
        <button
          onClick={onBack}
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1a1a2e] border-b border-transparent hover:border-[#1a1a2e] transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Edit
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border-2 border-[#1a1a2e] text-[#1a1a2e] text-xs font-black uppercase tracking-widest hover:bg-[#f5f0eb] transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border-2 border-[#1a1a2e] text-[#1a1a2e] text-xs font-black uppercase tracking-widest hover:bg-[#f5f0eb] transition-colors flex items-center gap-2"
            title="Save as PDF using browser's print dialog"
          >
            <Download size={16} />
            PDF
          </button>
          <button
            onClick={handleDownloadHTML}
            className="px-4 py-2 border-2 border-[#1a1a2e] text-[#1a1a2e] text-xs font-black uppercase tracking-widest hover:bg-[#f5f0eb] transition-colors flex items-center gap-2"
            title="Download as standalone HTML file"
          >
            <FileText size={16} />
            HTML
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-[#1a1a2e] text-[#e8b86d] hover:bg-[#e8b86d] hover:text-[#1a1a2e] text-xs font-black uppercase tracking-widest border-2 border-[#1a1a2e] transition-colors"
          >
            📧 Send to Client →
          </button>
        </div>
      </div>

      {/* Document Preview */}
      <div
        ref={previewRef}
        className="bg-white border-2 border-[#1a1a2e] print:border-0 print:shadow-none shadow-lg"
      >
        {/* Header */}
        <div className="bg-[#1a1a2e] text-white p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src="https://galaxy.techbuddyspace.in/tbg.png" 
                  alt="Tech Buddy Galaxy" 
                  className="h-14 w-14 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-black tracking-widest uppercase text-[#e8b86d]">
                    Tech Buddy Galaxy
                  </h1>
                  <p className="text-xs text-gray-400 tracking-wide">
                    A unit of TechBuddySpace Private Limited
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400 space-y-1 mt-4">
                <p>📧 contact@techbuddyspace.in</p>
                <p>🌐 galaxy.techbuddyspace.in</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 Your Company Address</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-4xl font-black uppercase tracking-widest text-[#e8b86d] mb-2">
                {data.docType || 'Quotation'}
              </div>
              <div className="text-sm text-gray-300 space-y-1 font-mono">
                <p># {data.quotationNumber || 'DRAFT'}</p>
                <p>Date: {new Date(data.date || data.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}</p>
                <p>Valid: {new Date(data.validTill || data.validUntil).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}</p>
              </div>
              <div className={`mt-3 text-xs font-black uppercase tracking-widest px-4 py-2 border inline-block ${STATUS_STYLES[data.status] || STATUS_STYLES.draft}`}>
                {data.status || 'draft'}
              </div>
            </div>
          </div>
        </div>

        {/* Accent Bar */}
        <div className="h-1.5 bg-[#e8b86d]"></div>

        {/* Client Info */}
        <div className="p-8 border-b-2 border-gray-100">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-3">
                Bill To
              </p>
              {data.clientName ? (
                <div className="space-y-1">
                  <p className="text-lg font-black text-[#1a1a2e]">{data.clientName}</p>
                  {data.companyName && (
                    <p className="text-sm font-bold text-gray-600">{data.companyName}</p>
                  )}
                  {data.clientEmail && (
                    <p className="text-sm text-gray-500">📧 {data.clientEmail}</p>
                  )}
                  {data.clientPhone && (
                    <p className="text-sm text-gray-500">📞 {data.clientPhone}</p>
                  )}
                  {data.billingAddress?.street && (
                    <p className="text-sm text-gray-500">📍 {data.billingAddress.street}</p>
                  )}
                  {data.gstNumber && (
                    <p className="text-sm text-gray-500">GST: {data.gstNumber}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-300 italic">Client details not filled yet</p>
              )}
            </div>

            <div className="bg-amber-50 border-l-4 border-[#e8b86d] p-4">
              <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-2">
                Summary
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Services</span>
                  <span className="font-bold">{data.services?.length || 0} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Add-ons</span>
                  <span className="font-bold">{selectedAddOns.length} selected</span>
                </div>
                <div className="flex justify-between border-t border-amber-200 pt-1 mt-1">
                  <span className="font-black text-[#1a1a2e]">Grand Total</span>
                  <span className="font-black text-[#1a1a2e] text-base">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Title */}
        {data.projectTitle && (
          <div className="px-8 pt-6">
            <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">{data.projectTitle}</h2>
            {data.projectDescription && (
              <p className="text-gray-600">{data.projectDescription}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              {data.poNumber && (
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-500">PO Number:</span>
                  <span className="ml-2 font-mono">{data.poNumber}</span>
                </div>
              )}
              {data.deliveryTimeline && (
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Delivery:</span>
                  <span className="ml-2">{data.deliveryTimeline}</span>
                </div>
              )}
            </div>
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
              {data.services?.map((service, index) => {
                const amount = service.quantity * service.unitPrice * (1 - (service.discount || 0) / 100);
                return (
                  <tr
                    key={service.id || index}
                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="py-3 px-4 text-gray-400 text-xs font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1a1a2e]">
                      {service.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs hidden md:table-cell">
                      {service.description}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{service.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-600 font-mono">
                      ₹{service.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#1a1a2e] font-mono">
                      ₹{amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Add-ons */}
          {selectedAddOns.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-3">
                Included Add-ons
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {freeAddOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2"
                  >
                    <span className="text-green-500 font-black text-xs">✓</span>
                    <div>
                      <p className="text-xs font-bold text-green-800">{addOn.name}</p>
                      <p className="text-xs text-green-600 font-black">FREE</p>
                    </div>
                  </div>
                ))}
                {paidAddOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2"
                  >
                    <span className="text-[#e8b86d] font-black text-xs">+</span>
                    <div>
                      <p className="text-xs font-bold text-[#1a1a2e]">{addOn.name}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        ₹{addOn.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-80">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 uppercase text-xs tracking-widest">Services Subtotal</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                {addOnsTotal > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 uppercase text-xs tracking-widest">Add-ons</span>
                    <span className="font-mono">₹{addOnsTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100 font-semibold">
                  <span className="text-gray-700 uppercase text-xs tracking-widest">Overall Cost</span>
                  <span className="font-mono">₹{overallCost.toLocaleString()}</span>
                </div>
                {data.discount > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-100 text-green-600">
                    <span className="uppercase text-xs tracking-widest font-bold">Discount</span>
                    <span className="font-mono">−₹{data.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b-2 border-blue-200 font-bold text-blue-700">
                  <span className="uppercase text-xs tracking-widest">Offered Price</span>
                  <span className="font-mono text-base">₹{offeredPrice.toLocaleString()}</span>
                </div>
                {data.taxRate > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 uppercase text-xs tracking-widest">
                      GST ({data.taxRate}%)
                    </span>
                    <span className="font-mono">₹{taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between bg-[#1a1a2e] text-white px-4 py-3 mt-2">
                  <span className="font-black uppercase tracking-widest text-sm text-[#e8b86d]">
                    Final Quotation
                  </span>
                  <span className="font-black text-xl font-mono">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(data.notes || data.paymentMilestones) && (
          <div className="px-8 pb-6 space-y-4">
            {data.paymentMilestones && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-2">
                  Payment Milestones
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.paymentMilestones}</p>
              </div>
            )}
            {data.notes && (
              <div className="bg-gray-50 border-l-4 border-[#e8b86d] p-4">
                <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-2">
                  Notes & Terms
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}
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
              <p>🌐 galaxy.techbuddyspace.in</p>
              <p>📧 contact@techbuddyspace.in</p>
              <p>📱 +91 98765 43210</p>
            </div>
            <div className="text-right">
              <p className="text-[#e8b86d] font-black uppercase tracking-widest mb-1">
                For Tech Buddy Galaxy
              </p>
              <div className="mt-6 border-t border-gray-600 pt-2 text-right">
                <p className="font-semibold text-white">A K S THIRUMURUGAN</p>
                <p className="text-xs text-gray-500 mt-1">Authorized Signatory</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-4 pt-4 text-center">
            <p className="text-xs text-gray-500">
              Thank you for choosing Tech Buddy Galaxy. We believe your company will grow to new heights! 🚀
            </p>
            <p className="text-xs text-gray-600 mt-1">
              GST No: 33AABCN1234F1Z5 · CIN: U72200TN2020PTC135001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
