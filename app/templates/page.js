'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FiAward,
  FiBriefcase,
  FiExternalLink,
  FiFileText,
  FiLayers,
  FiPlusCircle,
  FiSettings,
  FiZap
} from 'react-icons/fi';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    { id: 'appointment-letter', name: 'Appointment Letter', description: 'Professional appointment letter template for new hires', category: 'hr', url: 'https://docs.google.com/document/d/1example-appointment/edit', downloadUrl: 'https://docs.google.com/document/d/1example-appointment/export?format=docx', preview: '/templates/appointment-preview.png', fields: ['employeeName', 'position', 'department', 'startDate', 'salary', 'companyName'] },
    { id: 'offer-letter', name: 'Offer Letter', description: 'Job offer letter template with terms and conditions', category: 'hr', url: 'https://docs.google.com/document/d/1example-offer/edit', downloadUrl: 'https://docs.google.com/document/d/1example-offer/export?format=docx', preview: '/templates/offer-preview.png', fields: ['candidateName', 'position', 'salary', 'startDate', 'benefits'] },
    { id: 'internship-letter', name: 'Internship Letter', description: 'Internship appointment letter for students and graduates', category: 'internship', url: 'https://docs.google.com/document/d/1example-internship/edit', downloadUrl: 'https://docs.google.com/document/d/1example-internship/export?format=docx', preview: '/templates/internship-preview.png', fields: ['internName', 'position', 'duration', 'startDate', 'mentor'] },
    { id: 'loi-letter', name: 'Letter of Intent (LOI)', description: 'Letter of Intent template for business partnerships', category: 'business', url: 'https://docs.google.com/document/d/1example-loi/edit', downloadUrl: 'https://docs.google.com/document/d/1example-loi/export?format=docx', preview: '/templates/loi-preview.png', fields: ['companyName', 'partnerName', 'projectDescription', 'timeline'] },
    { id: 'completion-certificate', name: 'Completion Certificate', description: 'Certificate template for course/internship completion', category: 'certificate', url: 'https://docs.google.com/document/d/1example-certificate/edit', downloadUrl: 'https://docs.google.com/document/d/1example-certificate/export?format=docx', preview: '/templates/certificate-preview.png', fields: ['participantName', 'courseName', 'completionDate', 'duration'] },
    { id: 'experience-letter', name: 'Experience Letter', description: 'Work experience letter template for employees', category: 'hr', url: 'https://docs.google.com/document/d/1example-experience/edit', downloadUrl: 'https://docs.google.com/document/d/1example-experience/export?format=docx', preview: '/templates/experience-preview.png', fields: ['employeeName', 'position', 'joinDate', 'endDate', 'responsibilities'] }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: FiLayers },
    { id: 'hr', name: 'HR Documents', icon: FiBriefcase },
    { id: 'internship', name: 'Internship', icon: FiFileText },
    { id: 'business', name: 'Business', icon: FiSettings },
    { id: 'certificate', name: 'Certificates', icon: FiAward }
  ];

  const filteredTemplates = selectedCategory === 'all' ? templates : templates.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template) => {
    window.open(`/dynamic-template?url=${encodeURIComponent(template.downloadUrl)}&name=${encodeURIComponent(template.name)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#05070f] py-12 px-4 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="text-5xl font-bold text-white mr-3">TB</div>
            <div className="text-xl text-slate-300">Tech Buddy Space</div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Document Templates</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Professional document templates ready to use. Choose from our collection of HR documents, certificates, and business letters.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 border ${
                selectedCategory === category.id
                  ? 'bg-white text-slate-900 shadow-lg border-white'
                  : 'bg-slate-900/80 text-slate-100 border-white/10 hover:border-white/30'
              }`}
            >
              <category.icon className="mr-2 text-lg" />
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-slate-950/80 border border-white/10 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <FiFileText className="text-6xl text-slate-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-slate-300 mb-4">{template.description}</p>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Required Fields:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.slice(0, 3).map((field) => (
                      <span key={field} className="px-2 py-1 bg-cyan-500/15 text-cyan-300 text-xs rounded">
                        {field}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                        +{template.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Use Template
                  </button>
                  <a
                    href={template.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-white/20 text-slate-100 hover:bg-slate-800 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiExternalLink className="mr-1" />
                    Preview
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-slate-950/80 border border-white/10 rounded-xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Need a Custom Template?</h2>
            <p className="text-slate-300 mb-6">Have your own Word document template? Use our dynamic generator to create forms automatically.</p>
            <Link href="/dynamic-template" className="inline-flex items-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
              <FiPlusCircle className="w-5 h-5 mr-2" />
              Upload Custom Template
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/appointment-simple" className="bg-purple-600 hover:bg-purple-500 text-white p-6 rounded-xl text-center transition-colors duration-200">
            <FiZap className="text-3xl mb-2 mx-auto" />
            <h3 className="font-bold mb-2">Quick Generator</h3>
            <p className="text-purple-200 text-sm">Simple appointment letter generator</p>
          </Link>
          <Link href="/admin" className="bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-xl text-center transition-colors duration-200">
            <FiSettings className="text-3xl mb-2 mx-auto" />
            <h3 className="font-bold mb-2">Admin Panel</h3>
            <p className="text-indigo-200 text-sm">Manage applications and documents</p>
          </Link>
          <Link href="/terms-and-conditions" className="bg-slate-600 hover:bg-slate-500 text-white p-6 rounded-xl text-center transition-colors duration-200">
            <FiFileText className="text-3xl mb-2 mx-auto" />
            <h3 className="font-bold mb-2">Terms & Conditions</h3>
            <p className="text-slate-200 text-sm">Read our terms and policies</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
