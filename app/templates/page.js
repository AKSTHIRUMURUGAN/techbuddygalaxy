'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 'appointment-letter',
      name: 'Appointment Letter',
      description: 'Professional appointment letter template for new hires',
      category: 'hr',
      url: 'https://docs.google.com/document/d/1example-appointment/edit',
      downloadUrl: 'https://docs.google.com/document/d/1example-appointment/export?format=docx',
      preview: '/templates/appointment-preview.png',
      fields: ['employeeName', 'position', 'department', 'startDate', 'salary', 'companyName']
    },
    {
      id: 'offer-letter',
      name: 'Offer Letter',
      description: 'Job offer letter template with terms and conditions',
      category: 'hr',
      url: 'https://docs.google.com/document/d/1example-offer/edit',
      downloadUrl: 'https://docs.google.com/document/d/1example-offer/export?format=docx',
      preview: '/templates/offer-preview.png',
      fields: ['candidateName', 'position', 'salary', 'startDate', 'benefits']
    },
    {
      id: 'internship-letter',
      name: 'Internship Letter',
      description: 'Internship appointment letter for students and graduates',
      category: 'internship',
      url: 'https://docs.google.com/document/d/1example-internship/edit',
      downloadUrl: 'https://docs.google.com/document/d/1example-internship/export?format=docx',
      preview: '/templates/internship-preview.png',
      fields: ['internName', 'position', 'duration', 'startDate', 'mentor']
    },
    {
      id: 'loi-letter',
      name: 'Letter of Intent (LOI)',
      description: 'Letter of Intent template for business partnerships',
      category: 'business',
      url: 'https://docs.google.com/document/d/1example-loi/edit',
      downloadUrl: 'https://docs.google.com/document/d/1example-loi/export?format=docx',
      preview: '/templates/loi-preview.png',
      fields: ['companyName', 'partnerName', 'projectDescription', 'timeline']
    },
    {
      id: 'completion-certificate',
      name: 'Completion Certificate',
      description: 'Certificate template for course/internship completion',
      category: 'certificate',
      url: 'https://docs.google.com/document/d/1example-certificate/edit',
      downloadUrl: 'https://docs.google.com/document/d/1example-certificate/export?format=docx',
      preview: '/templates/certificate-preview.png',
      fields: ['participantName', 'courseName', 'completionDate', 'duration']
    },
    {
      id: 'experience-letter',
      name: 'Experience Letter',
      description: 'Work experience letter template for employees',
      category: 'hr',
      url: 'https://docs.google.com/document/d/1example-experience/edit',
      downloadUrl: 'https://docs.google.com/document/d/1example-experience/export?format=docx',
      preview: '/templates/experience-preview.png',
      fields: ['employeeName', 'position', 'joinDate', 'endDate', 'responsibilities']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📄' },
    { id: 'hr', name: 'HR Documents', icon: '👥' },
    { id: 'internship', name: 'Internship', icon: '🎓' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'certificate', name: 'Certificates', icon: '🏆' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template) => {
    // Redirect to dynamic template generator with the template URL
    window.open(`/dynamic-template?url=${encodeURIComponent(template.downloadUrl)}&name=${encodeURIComponent(template.name)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="text-5xl font-bold text-white mr-3">TB</div>
            <div className="text-xl text-blue-200">Tech Buddy Space</div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Document Templates
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Professional document templates ready to use. Choose from our collection of HR documents, 
            certificates, and business letters.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'bg-blue-800 text-white hover:bg-blue-700'
              }`}
            >
              <span className="mr-2 text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              {/* Template Preview */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-6xl text-gray-400">📄</div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>

                {/* Fields Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Required Fields:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.slice(0, 3).map((field) => (
                      <span key={field} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {field}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{template.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Use Template
                  </button>
                  <a
                    href={template.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    Preview
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Template Section */}
        <div className="mt-16 bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Template?</h2>
            <p className="text-gray-600 mb-6">
              Have your own Word document template? Use our dynamic generator to create forms automatically.
            </p>
            <Link
              href="/dynamic-template"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload Custom Template
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/appointment-simple" className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors duration-200">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold mb-2">Quick Generator</h3>
            <p className="text-purple-200 text-sm">Simple appointment letter generator</p>
          </Link>

          <Link href="/admin" className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg text-center transition-colors duration-200">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-bold mb-2">Admin Panel</h3>
            <p className="text-indigo-200 text-sm">Manage applications and documents</p>
          </Link>

          <Link href="/terms-and-conditions" className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-center transition-colors duration-200">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-bold mb-2">Terms & Conditions</h3>
            <p className="text-gray-200 text-sm">Read our terms and policies</p>
          </Link>
        </div>
      </div>
    </div>
  );
}