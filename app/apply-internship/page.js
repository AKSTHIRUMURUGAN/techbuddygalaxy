'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast, Toaster } from 'sonner';

export default function ApplyInternshipPage() {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    position: '',
    
    // Education
    isStudent: true,
    college: '',
    department: '',
    year: '',
    
    // Professional Links
    github: '',
    linkedin: '',
    portfolio: '',
    
    // Project Links
    project1: '',
    project2: '',
    project3: '',
    
    // Additional Info
    experience: '',
    skills: '',
    motivation: '',
    availability: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form progress
  useEffect(() => {
    const requiredFields = ['name', 'email', 'phone', 'position'];
    const studentFields = formData.isStudent ? ['college', 'department', 'year'] : [];
    const allRequiredFields = [...requiredFields, ...studentFields];
    
    const filledFields = allRequiredFields.filter(field => formData[field]?.trim()).length;
    const resumeProgress = resumeFile ? 1 : 0;
    const totalRequired = allRequiredFields.length + 1; // +1 for resume
    
    const progress = Math.round(((filledFields + resumeProgress) / totalRequired) * 100);
    setFormProgress(progress);
  }, [formData, resumeFile]);

  // Fetch positions on component mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('/api/get-positions-public');
        if (response.ok) {
          const data = await response.json();
          setPositions(data.positions || []);
        } else {
          console.error('Failed to fetch positions');
          toast.error('Failed to load positions. Please refresh the page.');
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
        toast.error('Network error while loading positions. Please check your connection.');
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Resume file dropzone
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        resume: 'Please upload a valid PDF, DOC, or DOCX file (max 5MB)'
      }));
      toast.error('Please upload a valid PDF, DOC, or DOCX file (max 5MB)');
      return;
    }

    if (acceptedFiles.length > 0) {
      setResumeFile(acceptedFiles[0]);
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
      toast.success('Resume uploaded successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      toast.error('Please enter your full name');
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      toast.error('Please enter your email address');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      toast.error('Please enter your phone number');
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
      toast.error('Please select a position');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      toast.error('Please enter a valid email address');
    }

    // Student-specific validation
    if (formData.isStudent) {
      if (!formData.college.trim()) {
        newErrors.college = 'College name is required';
        toast.error('Please enter your college name');
      }
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required';
        toast.error('Please select your department');
      }
      if (!formData.year.trim()) {
        newErrors.year = 'Year of study is required';
        toast.error('Please select your year of study');
      }
    }

    // Resume file validation
    if (!resumeFile) {
      newErrors.resume = 'Resume is required';
      toast.error('Please upload your resume');
    }

    // URL validation for optional fields
    const urlRegex = /^https?:\/\/.+/;
    if (formData.github && !urlRegex.test(formData.github)) {
      newErrors.github = 'Please enter a valid GitHub URL';
      toast.error('Please enter a valid GitHub URL');
    }
    if (formData.linkedin && !urlRegex.test(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
      toast.error('Please enter a valid LinkedIn URL');
    }
    if (formData.portfolio && !urlRegex.test(formData.portfolio)) {
      newErrors.portfolio = 'Please enter a valid portfolio URL';
      toast.error('Please enter a valid portfolio URL');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add resume file
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const response = await fetch('/api/submit-internship-application', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        toast.success('🎉 Application submitted successfully! We\'ll get back to you soon.');
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '', email: '', phone: '', position: '', isStudent: true, college: '', department: '', year: '',
          github: '', linkedin: '', portfolio: '', project1: '', project2: '', project3: '',
          experience: '', skills: '', motivation: '', availability: ''
        });
        setResumeFile(null);
      } else {
        const errorData = await response.json();
        toast.error('Failed to submit application. Please try again.');
        setSubmitStatus('error');
        console.error('Submission error:', errorData);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Network error occurred. Please check your connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            background: '#000',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />
      <div className="min-h-screen bg-black text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="relative z-10 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-white to-gray-100 text-black px-8 py-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-black text-white text-4xl font-bold px-4 py-2 rounded-lg mr-4">TB</div>
                    <div className="text-2xl font-light text-gray-700">Tech Buddy Space</div>
                  </div>
                  <h1 className="text-4xl font-bold text-black mb-3">
                    Join Our Team
                  </h1>
                  <p className="text-gray-600 text-lg mb-6">
                    Start your journey with us and gain valuable experience in technology and innovation
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Application Progress</span>
                      <span>{formProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${formProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Personal Information */}
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold animate-slide-in-right">1</div>
                      <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300 flex items-center">
                            Full Name *
                            {formData.name && <span className="ml-2 text-green-400">✓</span>}
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${errors.name ? 'border-red-500 bg-red-500/10' : formData.name ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-white/40'}`}
                            placeholder="Enter your full name"
                          />
                        </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center">
                          Email Address *
                          {formData.email && <span className="ml-2 text-green-400">✓</span>}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${errors.email ? 'border-red-500 bg-red-500/10' : formData.email ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-white/40'}`}
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center">
                          Phone Number *
                          {formData.phone && <span className="ml-2 text-green-400">✓</span>}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${errors.phone ? 'border-red-500 bg-red-500/10' : formData.phone ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-white/40'}`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center">
                          Position *
                          {formData.position && <span className="ml-2 text-green-400">✓</span>}
                        </label>
                        {loadingPositions ? (
                          <div className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-gray-400 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                            Loading positions...
                          </div>
                        ) : (
                          <select
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white ${errors.position ? 'border-red-500 bg-red-500/10' : formData.position ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-white/40'}`}
                          >
                            <option value="" className="bg-black text-white">Select Position</option>
                            {positions.map((position) => (
                              <option key={position.id} value={position.title} className="bg-black text-white">
                                {position.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Education Information */}
                  <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold animate-slide-in-right" style={{animationDelay: '0.1s'}}>2</div>
                      <h2 className="text-2xl font-bold text-white">Education</h2>
                    </div>
                    
                    <div className="mb-6">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="isStudent"
                          checked={formData.isStudent}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-white bg-white/5 border-white/20 rounded focus:ring-white/50 focus:ring-2"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">I am currently a student</span>
                      </label>
                    </div>

                    {formData.isStudent && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            College/University *
                          </label>
                          <input
                            type="text"
                            name="college"
                            value={formData.college}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${errors.college ? 'border-red-500 bg-red-500/10' : 'border-white/20 hover:border-white/40'}`}
                            placeholder="Your college name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Department *
                          </label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white ${errors.department ? 'border-red-500 bg-red-500/10' : 'border-white/20 hover:border-white/40'}`}
                          >
                            <option value="" className="bg-black text-white">Select Department</option>
                            <option value="Computer Science" className="bg-black text-white">Computer Science</option>
                            <option value="Information Technology" className="bg-black text-white">Information Technology</option>
                            <option value="Software Engineering" className="bg-black text-white">Software Engineering</option>
                            <option value="Electronics" className="bg-black text-white">Electronics & Communication</option>
                            <option value="Mechanical" className="bg-black text-white">Mechanical Engineering</option>
                            <option value="Civil" className="bg-black text-white">Civil Engineering</option>
                            <option value="Business" className="bg-black text-white">Business Administration</option>
                            <option value="Design" className="bg-black text-white">Design</option>
                            <option value="Other" className="bg-black text-white">Other</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Year of Study *
                          </label>
                          <select
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white ${errors.year ? 'border-red-500 bg-red-500/10' : 'border-white/20 hover:border-white/40'}`}
                          >
                            <option value="" className="bg-black text-white">Select Year</option>
                            <option value="1st Year" className="bg-black text-white">1st Year</option>
                            <option value="2nd Year" className="bg-black text-white">2nd Year</option>
                            <option value="3rd Year" className="bg-black text-white">3rd Year</option>
                            <option value="4th Year" className="bg-black text-white">4th Year</option>
                            <option value="Graduate" className="bg-black text-white">Graduate</option>
                            <option value="Post Graduate" className="bg-black text-white">Post Graduate</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Professional Links */}
                  <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold animate-slide-in-right" style={{animationDelay: '0.2s'}}>3</div>
                      <h2 className="text-2xl font-bold text-white">Professional Links</h2>
                      <span className="text-sm text-gray-400">(Optional)</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          GitHub Profile
                        </label>
                        <input
                          type="url"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${errors.github ? 'border-red-500 bg-red-500/10' : 'border-white/20 hover:border-white/40'}`}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${errors.linkedin ? 'border-red-500 bg-red-500/10' : 'border-white/20 hover:border-white/40'}`}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Portfolio Website
                        </label>
                        <input
                          type="url"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${errors.portfolio ? 'border-red-500 bg-red-500/10' : 'border-white/20 hover:border-white/40'}`}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Links */}
                  <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold animate-slide-in-right" style={{animationDelay: '0.3s'}}>4</div>
                      <h2 className="text-2xl font-bold text-white">Previous Projects</h2>
                      <span className="text-sm text-gray-400">(Optional)</span>
                    </div>
                    
                    <div className="space-y-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Project {num} (GitHub/Demo Link)
                          </label>
                          <input
                            type="url"
                            name={`project${num}`}
                            value={formData[`project${num}`]}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 bg-white/5 border border-white/20 hover:border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                            placeholder={`https://github.com/yourusername/project${num}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold animate-slide-in-right" style={{animationDelay: '0.4s'}}>5</div>
                      <h2 className="text-2xl font-bold text-white">Resume Upload</h2>
                    </div>
                    
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive 
                          ? 'border-white bg-white/10' 
                          : errors.resume 
                            ? 'border-red-500 bg-red-500/10' 
                            : 'border-white/30 hover:border-white/60 hover:bg-white/5'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-4">
                        <div className="text-6xl">
                          {resumeFile ? '✅' : '📄'}
                        </div>
                        {resumeFile ? (
                          <div className="space-y-2">
                            <p className="text-white font-medium text-lg">{resumeFile.name}</p>
                            <p className="text-gray-400">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-green-400 text-sm">✓ Resume uploaded successfully</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xl font-medium text-white">
                              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                            </p>
                            <p className="text-gray-400">
                              Drag & drop or click to select (PDF, DOC, DOCX - Max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold animate-slide-in-right" style={{animationDelay: '0.5s'}}>6</div>
                      <h2 className="text-2xl font-bold text-white">Tell Us More</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Technical Skills
                        </label>
                        <textarea
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-4 bg-white/5 border border-white/20 hover:border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
                          placeholder="List your technical skills (e.g., JavaScript, React, Python, etc.)"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Previous Experience
                        </label>
                        <textarea
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-4 bg-white/5 border border-white/20 hover:border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
                          placeholder="Describe any relevant work experience, internships, or projects"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Why do you want to join us?
                        </label>
                        <textarea
                          name="motivation"
                          value={formData.motivation}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-4 bg-white/5 border border-white/20 hover:border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
                          placeholder="Tell us about your motivation and what you hope to learn"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Availability
                        </label>
                        <select
                          name="availability"
                          value={formData.availability}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-white/5 border border-white/20 hover:border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white"
                        >
                          <option value="" className="bg-black text-white">Select your availability</option>
                          <option value="Full-time" className="bg-black text-white">Full-time (40 hours/week)</option>
                          <option value="Part-time" className="bg-black text-white">Part-time (20-30 hours/week)</option>
                          <option value="Flexible" className="bg-black text-white">Flexible hours</option>
                          <option value="Weekends" className="bg-black text-white">Weekends only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative bg-white text-black font-bold py-4 px-12 rounded-xl transition-all duration-300 hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-lg min-w-[200px] shadow-2xl hover:shadow-white/20"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          Submit Application
                          <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Footer Info */}
                  <div className="text-center pt-8 border-t border-white/10 mt-12 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                    <p className="text-gray-400 text-sm mb-2">
                      🔒 Your information is secure and will only be used for application processing
                    </p>
                    <p className="text-gray-500 text-xs">
                      By submitting this application, you agree to our terms and conditions
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}