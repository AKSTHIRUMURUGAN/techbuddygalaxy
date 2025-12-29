export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="text-4xl font-bold text-blue-900 mr-2">TB</div>
              <div className="text-lg text-gray-600">Tech Buddy Space</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Terms and Conditions
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Tech Buddy Space services, including our internship programs, document generation tools, 
                and related services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
                please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Internship Program Terms</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">2.1 Application Process</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All information provided in internship applications must be accurate and truthful</li>
                  <li>Submission of false information may result in immediate disqualification</li>
                  <li>We reserve the right to verify all information provided</li>
                  <li>Application review process may take 3-5 business days</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">2.2 Internship Conditions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Internships are unpaid learning opportunities unless otherwise specified</li>
                  <li>Duration and schedule will be communicated upon acceptance</li>
                  <li>Interns must maintain professional conduct at all times</li>
                  <li>Completion certificates will be provided upon successful completion</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Document Generation Services</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">3.1 Service Usage</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Document generation tools are provided for legitimate business purposes</li>
                  <li>Users are responsible for the accuracy of information entered</li>
                  <li>Generated documents should be reviewed before official use</li>
                  <li>We do not guarantee legal validity of generated documents</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">3.2 Template Usage</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Templates are provided as-is for general use</li>
                  <li>Users may customize templates according to their needs</li>
                  <li>Commercial use of templates is permitted</li>
                  <li>We retain no ownership of documents generated using our tools</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Privacy and Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">4.1 Data Collection</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We collect only necessary information for service provision</li>
                  <li>Personal data is stored securely and encrypted</li>
                  <li>Resume files are stored in secure cloud storage</li>
                  <li>We do not share personal information with third parties without consent</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">4.2 Data Retention</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Application data is retained for administrative purposes</li>
                  <li>Users may request data deletion by contacting us</li>
                  <li>Some data may be retained for legal compliance</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and up-to-date information</li>
                <li>Use services in compliance with applicable laws</li>
                <li>Respect intellectual property rights</li>
                <li>Report any technical issues or security concerns</li>
                <li>Maintain confidentiality of any sensitive information accessed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Tech Buddy Space provides services &quot;as is&quot; without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Any direct, indirect, or consequential damages</li>
                <li>Loss of data or business opportunities</li>
                <li>Service interruptions or technical issues</li>
                <li>Actions taken based on generated documents</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <p>All content, trademarks, and intellectual property on this platform belong to Tech Buddy Space unless otherwise stated.</p>
                <p>Users retain ownership of their submitted content and generated documents.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modifications</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes. 
                Continued use of services after modifications constitutes acceptance of new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  For questions about these terms or our services, please contact us:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Email:</strong> admin@techbuddyspace.com</li>
                  <li><strong>Phone:</strong> +91 96003 38406</li>
                  <li><strong>Website:</strong> www.techbuddyspace.com</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t pt-8 mt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Tech Buddy Space. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}