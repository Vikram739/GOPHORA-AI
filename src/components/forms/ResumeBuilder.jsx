import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiDownload, FiEye, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import html2pdf from 'html2pdf.js';

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('list'); // list, create, view, edit
  const [loading, setLoading] = useState(false);
  const [resumeList, setResumeList] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    location: '',
    email: '',
    phone: '',
    bio: '',
    skills: '',
    languages: '',
    experience: [
      { role: '', organization: '', description: '', startDate: '', endDate: '' }
    ],
    education: [
      { degree: '', school: '', field: '', year: '' }
    ],
    certifications: [
      { title: '', issuer: '', date: '' }
    ]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
    fetchResumes();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      const userData = response.data;
      setFormData(prev => ({
        ...prev,
        fullName: userData.name || userData.full_name || '',
        headline: userData.headline || '',
        location: userData.location || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        skills: Array.isArray(userData.skills) ? userData.skills.join(', ') : userData.skills || '',
        languages: Array.isArray(userData.languages) ? userData.languages.join(', ') : userData.languages || ''
      }));
      if (userData.profile_photo) {
        setProfilePhoto(userData.profile_photo);
      }
    } catch (err) {
      console.log('Could not fetch profile:', err.message);
    }
  };

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/resumes');
      setResumeList(response.data.resumes || []);
    } catch (err) {
      console.log('Could not fetch resumes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...formData.experience];
    newExperience[index][field] = value;
    setFormData(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index][field] = value;
    setFormData(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { role: '', organization: '', description: '', startDate: '', endDate: '' }]
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', field: '', year: '' }]
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { title: '', issuer: '', date: '' }]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.headline.trim()) newErrors.headline = 'Headline is required';
    if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveResume = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Use base64 photo directly (photo upload endpoint will be added later)
      let photoUrl = profilePhoto;

      const resumeData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
        profile_photo: photoUrl
      };

      console.log('Sending resume data:', resumeData);

      if (mode === 'create') {
        const response = await api.post('/user/resumes', resumeData);
        console.log('Create response:', response.data);
        setSelectedResume(response.data.resume);
        alert('Resume created successfully!');
        setMode('list');
      } else if (mode === 'edit' && selectedResume) {
        const response = await api.put(`/user/resumes/${selectedResume.id}`, resumeData);
        console.log('Update response:', response.data);
        setSelectedResume(resumeData);
        alert('Resume updated successfully!');
        setMode('list');
      }

      fetchResumes();
    } catch (err) {
      console.error('Error saving resume:', err);
      console.error('Error response:', err.response);
      alert('Failed to save resume: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      setLoading(true);
      await api.delete(`/user/resumes/${resumeId}`);
      fetchResumes();
      setSelectedResume(null);
      setMode('list');
      alert('Resume deleted successfully!');
    } catch (err) {
      console.error('Error deleting resume:', err);
      alert('Failed to delete resume');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      alert('No resume to download');
      return;
    }

    const options = {
      margin: 10,
      filename: `${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Resume Builder
          </h1>
          <p className="text-gray-300 text-lg">Create, manage, and download professional resumes</p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-10 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setMode('list')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              mode === 'list'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FiEye className="inline mr-2" size={20} /> My Resumes
          </button>
          <button
            onClick={() => {
              setMode('create');
              setSelectedResume(null);
              setProfilePhoto(null);
              setFormData({
                fullName: '',
                headline: '',
                location: '',
                email: '',
                phone: '',
                bio: '',
                skills: '',
                languages: '',
                experience: [{ role: '', organization: '', description: '', startDate: '', endDate: '' }],
                education: [{ degree: '', school: '', field: '', year: '' }],
                certifications: [{ title: '', issuer: '', date: '' }]
              });
            }}
            className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              mode === 'create'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FiPlus className="inline mr-2" size={20} /> Create New Resume
          </button>
        </div>

        {/* Resume List View (Default) */}
        {mode === 'list' && (
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : resumeList.length > 0 ? (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                  Your Resumes ({resumeList.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumeList.map((resume) => (
                    <div
                      key={resume.id}
                      className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer hover:scale-105"
                      onClick={() => {
                        setSelectedResume(resume);
                        setFormData({
                          ...resume,
                          skills: Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills,
                          languages: Array.isArray(resume.languages) ? resume.languages.join(', ') : resume.languages
                        });
                        setProfilePhoto(resume.profile_photo);
                        setMode('view');
                      }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {resume.profile_photo && (
                          <img
                            src={resume.profile_photo}
                            alt={resume.fullName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                            {resume.fullName}
                          </h3>
                          <p className="text-purple-300 text-sm line-clamp-1">{resume.headline}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResume(resume);
                            setFormData({
                              ...resume,
                              skills: Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills,
                              languages: Array.isArray(resume.languages) ? resume.languages.join(', ') : resume.languages
                            });
                            setProfilePhoto(resume.profile_photo);
                            setMode('edit');
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-4 py-2.5 rounded-xl transition-all font-medium"
                        >
                          <FiEdit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResume(resume.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 px-4 py-2.5 rounded-xl transition-all font-medium"
                        >
                          <FiTrash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-bold text-white mb-3">No Resumes Yet</h3>
                <p className="text-gray-400 mb-6">Create your first professional resume to get started</p>
                <button
                  onClick={() => setMode('create')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <FiPlus size={20} /> Create Your First Resume
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form Section - Full Width */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-10 flex items-center gap-3">
                <span className="w-1 h-10 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                {mode === 'create' ? 'Create New Resume' : 'Edit Resume'}
              </h2>

              {/* Profile Photo Section */}
              <div className="mb-8 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
                <label className="block text-white font-semibold mb-4 text-lg">Profile Photo</label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-purple-500/20 border-4 border-dashed border-purple-500 flex items-center justify-center">
                      <FiUpload className="text-purple-400" size={40} />
                    </div>
                  )}
                  <label className="cursor-pointer flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="bg-purple-500/20 hover:bg-purple-500/40 border-2 border-dashed border-purple-400 rounded-2xl p-6 text-center transition-all hover:scale-105">
                      <FiUpload className="text-purple-400 mx-auto mb-3" size={28} />
                      <p className="text-purple-200 font-semibold text-lg">Upload Photo</p>
                      <p className="text-purple-400 text-sm mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-white font-semibold mb-2 text-sm">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 border ${errors.fullName ? 'border-red-500' : 'border-white/20'} rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠ {errors.fullName}</p>}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-white font-semibold mb-2 text-sm">Professional Headline *</label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 border ${errors.headline ? 'border-red-500' : 'border-white/20'} rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                      placeholder="e.g. Full Stack Developer | UI/UX Designer"
                    />
                    {errors.headline && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠ {errors.headline}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠ {errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-white font-semibold mb-2 text-sm">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="City, State, Country"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-white font-semibold mb-2 text-sm">Professional Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="5"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Write a compelling summary about yourself, your expertise, and career goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Skills (comma separated) *</label>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full bg-white/10 border ${errors.skills ? 'border-red-500' : 'border-white/20'} rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                      placeholder="e.g. JavaScript, React, Node.js, Python, SQL, AWS, Git"
                    />
                    {errors.skills && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠ {errors.skills}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Languages</label>
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g. English (Native), Spanish (Fluent), French (Basic)"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Work Experience
                  </h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 px-4 py-2.5 rounded-xl transition-all transform hover:scale-105 font-medium"
                  >
                    <FiPlus size={18} /> Add Experience
                  </button>
                </div>
                <div className="space-y-5">
                  {formData.experience.map((exp, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Job Title / Role"
                          value={exp.role}
                          onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Company / Organization"
                          value={exp.organization}
                          onChange={(e) => handleExperienceChange(idx, 'organization', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                      </div>
                      <textarea
                        placeholder="Job description and key achievements..."
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                        rows="3"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none transition-all"
                      />
                      <div className="flex gap-3 items-center">
                        <input
                          type="month"
                          placeholder="Start Date"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        <span className="text-white/50">—</span>
                        <input
                          type="month"
                          placeholder="End Date"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        {formData.experience.length > 1 && (
                          <button
                            onClick={() => removeExperience(idx)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-3 rounded-xl transition-all transform hover:scale-110"
                            title="Remove"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Education
                  </h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 px-4 py-2.5 rounded-xl transition-all transform hover:scale-105 font-medium"
                  >
                    <FiPlus size={18} /> Add Education
                  </button>
                </div>
                <div className="space-y-5">
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Degree (e.g. Bachelor of Science)"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="School / University"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Field of Study"
                          value={edu.field}
                          onChange={(e) => handleEducationChange(idx, 'field', e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Year (e.g. 2023)"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        {formData.education.length > 1 && (
                          <button
                            onClick={() => removeEducation(idx)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-3 rounded-xl transition-all transform hover:scale-110"
                            title="Remove"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Certifications
                  </h3>
                  <button
                    onClick={addCertification}
                    className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 px-4 py-2.5 rounded-xl transition-all transform hover:scale-105 font-medium"
                  >
                    <FiPlus size={18} /> Add Certificate
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl p-4">
                      <input
                        type="text"
                        placeholder="Certification Title"
                        value={cert.title}
                        onChange={(e) => handleCertificationChange(idx, 'title', e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Issuing Organization"
                        value={cert.issuer}
                        onChange={(e) => handleCertificationChange(idx, 'issuer', e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                      <input
                        type="month"
                        placeholder="Date"
                        value={cert.date}
                        onChange={(e) => handleCertificationChange(idx, 'date', e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                      {formData.certifications.length > 1 && (
                        <button
                          onClick={() => removeCertification(idx)}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-3 rounded-xl transition-all transform hover:scale-110"
                          title="Remove"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/10">
                <button
                  onClick={handleSaveResume}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving Resume...
                    </span>
                  ) : (
                    mode === 'create' ? '✨ Create Resume' : '💾 Update Resume'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section - Full Width */}
        {(mode === 'view' || (selectedResume && mode !== 'create')) && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex gap-3 justify-end">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  <FiDownload size={20} /> Download PDF
                </button>
              </div>

              <div
                id="resume-preview"
                className="bg-white rounded-xl p-12 shadow-2xl text-gray-800"
              >
                {/* Resume Content */}
                {profilePhoto && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                    />
                  </div>
                )}

                <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold text-gray-900">{formData.fullName}</h1>
                  <p className="text-xl text-purple-600 font-semibold">{formData.headline}</p>
                  <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2">
                    {formData.location && <span>{formData.location}</span>}
                    {formData.email && <span>{formData.email}</span>}
                    {formData.phone && <span>{formData.phone}</span>}
                  </div>
                </div>

                {formData.bio && (
                  <div className="mb-6 text-center text-gray-700">
                    <p>{formData.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {formData.skills && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-purple-500">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {(typeof formData.skills === 'string'
                        ? formData.skills.split(',')
                        : formData.skills
                      ).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {formData.languages && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-purple-500">Languages</h2>
                    <div className="flex flex-wrap gap-2">
                      {(typeof formData.languages === 'string'
                        ? formData.languages.split(',')
                        : formData.languages
                      ).map((lang, idx) => (
                        <span key={idx} className="text-gray-700">
                          {lang.trim()}
                          {idx < (typeof formData.languages === 'string' ? formData.languages.split(',').length : formData.languages.length) - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {formData.experience.some(exp => exp.role) && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-purple-500">Experience</h2>
                    <div className="space-y-4">
                      {formData.experience.map((exp, idx) => (
                        (exp.role || exp.organization) && (
                          <div key={idx}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{exp.role}</h3>
                                <p className="text-gray-600 font-semibold">{exp.organization}</p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </span>
                            </div>
                            {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {formData.education.some(edu => edu.degree) && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-purple-500">Education</h2>
                    <div className="space-y-3">
                      {formData.education.map((edu, idx) => (
                        (edu.degree || edu.school) && (
                          <div key={idx}>
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                <p className="text-gray-600">{edu.school}</p>
                                {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                              </div>
                              {edu.year && <span className="text-gray-500">{edu.year}</span>}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {formData.certifications.some(cert => cert.title) && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-purple-500">Certifications</h2>
                    <div className="space-y-2">
                      {formData.certifications.map((cert, idx) => (
                        cert.title && (
                          <div key={idx} className="flex justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{cert.title}</p>
                              {cert.issuer && <p className="text-gray-600 text-sm">{cert.issuer}</p>}
                            </div>
                            {cert.date && <span className="text-gray-500 text-sm">{cert.date}</span>}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
