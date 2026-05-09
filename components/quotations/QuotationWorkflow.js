"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import CreateStep from './workflow/CreateStep';
import PreviewStep from './workflow/PreviewStep';
import EmailStep from './workflow/EmailStep';
import FeedbackStep from './workflow/FeedbackStep';

const STEPS = [
  { value: 'create', label: '01 · Create', icon: '✏️' },
  { value: 'preview', label: '02 · Preview', icon: '📄' },
  { value: 'email', label: '03 · Send Email', icon: '📧' },
  { value: 'feedback', label: '04 · Feedback', icon: '💬' },
];

export default function QuotationWorkflow({ initialData, clients, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState('create');
  
  // Prepare initial data with defaults
  const prepareInitialData = (data) => {
    const defaultAddOns = [
      { id: 'ao1', name: '3 Minor Revision Rounds (Free)', price: 0, selected: true },
      { id: 'ao2', name: 'Priority Support (48hr Response)', price: 2500, selected: false },
      { id: 'ao3', name: 'Monthly Performance Report', price: 1500, selected: false },
      { id: 'ao4', name: 'SEO Optimization Package', price: 5000, selected: false },
      { id: 'ao5', name: 'Social Media Integration', price: 3000, selected: false },
      { id: 'ao6', name: 'Analytics Dashboard Setup', price: 2000, selected: false },
    ];

    if (data && data._id) {
      // Editing existing quotation
      return {
        ...data,
        clientCompany: data.companyName || '',
        clientAddress: data.billingAddress?.street || '',
        validUntil: data.validTill ? new Date(data.validTill).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        services: data.services?.map((s, index) => ({
          id: s._id || `s${Date.now()}_${index}`,
          name: s.name || '',
          description: s.description || '',
          quantity: s.quantity || 1,
          unitPrice: s.unitPrice || 0,
          discount: s.discount || 0,
        })) || [{ id: `s${Date.now()}`, name: '', description: '', quantity: 1, unitPrice: 0, discount: 0 }],
        addOns: (data.addOns && data.addOns.length > 0) ? data.addOns : defaultAddOns,
        discount: data.discount || 0,
        taxRate: data.taxRate || 18,
        razorpayEnabled: data.razorpayEnabled || false,
      };
    }

    // Creating new quotation
    return {
      docType: 'quotation',
      status: 'draft',
      docNumber: '',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: '',
      clientEmail: '',
      clientCompany: '',
      clientPhone: '',
      clientAddress: '',
      gstNumber: '',
      projectTitle: '',
      projectDescription: '',
      services: [{ id: `s${Date.now()}`, name: '', description: '', quantity: 1, unitPrice: 0, discount: 0 }],
      addOns: defaultAddOns,
      notes: 'Payment terms: 50% advance, 50% on delivery. Includes 3 minor revisions free of cost.',
      taxRate: 18,
      discount: 0,
      razorpayEnabled: false,
    };
  };

  const [quotationData, setQuotationData] = useState(prepareInitialData(initialData));

  const [savedQuotation, setSavedQuotation] = useState(null);

  const handleNext = (step) => {
    setCurrentStep(step);
  };

  const handleBack = (step) => {
    setCurrentStep(step);
  };

  const handleDataChange = (data) => {
    setQuotationData(data);
  };

  const handleQuotationSaved = (quotation) => {
    // Merge the saved quotation with the current quotationData to preserve addOns and discount
    const mergedQuotation = {
      ...quotation,
      addOns: quotation.addOns && quotation.addOns.length > 0 ? quotation.addOns : quotationData.addOns,
      discount: quotation.discount !== undefined ? quotation.discount : quotationData.discount,
    };
    setSavedQuotation(mergedQuotation);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#f5f0eb] rounded-none w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#1a1a2e] text-white px-6 py-4 flex items-center justify-between border-b-4 border-[#e8b86d]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e8b86d] flex items-center justify-center">
              <span className="text-[#1a1a2e] font-black text-lg">TBG</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest uppercase text-[#e8b86d]">
                Tech Buddy Galaxy
              </h1>
              <p className="text-xs text-gray-400 tracking-widest uppercase">
                Professional Quotation System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="bg-white border-b-2 border-[#1a1a2e]">
          <div className="grid grid-cols-4 gap-0">
            {STEPS.map((step, index) => (
              <button
                key={step.value}
                onClick={() => {
                  // Allow navigation to previous steps or current step
                  const currentIndex = STEPS.findIndex(s => s.value === currentStep);
                  if (index <= currentIndex) {
                    setCurrentStep(step.value);
                  }
                }}
                disabled={STEPS.findIndex(s => s.value === currentStep) < index}
                className={`
                  py-4 px-3 text-sm font-bold tracking-wide uppercase border-r border-gray-200 last:border-r-0
                  transition-colors relative
                  ${currentStep === step.value
                    ? 'bg-[#1a1a2e] text-[#e8b86d]'
                    : STEPS.findIndex(s => s.value === currentStep) > index
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="mr-1">{step.icon}</span>
                <span className="hidden sm:inline">{step.label}</span>
                {STEPS.findIndex(s => s.value === currentStep) > index && (
                  <span className="absolute top-2 right-2 text-green-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'create' && (
            <CreateStep
              data={quotationData}
              clients={clients}
              onChange={handleDataChange}
              onNext={() => handleNext('preview')}
              onQuotationSaved={handleQuotationSaved}
            />
          )}
          {currentStep === 'preview' && (
            <PreviewStep
              data={{
                ...(savedQuotation || quotationData),
                addOns: (savedQuotation?.addOns && savedQuotation.addOns.length > 0) 
                  ? savedQuotation.addOns 
                  : quotationData.addOns,
                discount: savedQuotation?.discount !== undefined 
                  ? savedQuotation.discount 
                  : quotationData.discount
              }}
              onBack={() => handleBack('create')}
              onNext={() => handleNext('email')}
            />
          )}
          {currentStep === 'email' && (
            <EmailStep
              data={savedQuotation || quotationData}
              onBack={() => handleBack('preview')}
              onNext={() => handleNext('feedback')}
            />
          )}
          {currentStep === 'feedback' && (
            <FeedbackStep
              data={savedQuotation || quotationData}
              onBack={() => handleBack('email')}
              onClose={onClose}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
