import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faGlobe,
  faBuilding,
  faFileAlt,
  faCloudUploadAlt,
  faEdit,
  faUserCircle,
  faBriefcase,
  faGraduationCap,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    website: '',
    company: '',
    position: '',
    avatar: null,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const userData = response.data;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          about: userData.about || '',
          website: userData.website || '',
          company: userData.company || '',
          position: userData.position || '',
          avatar: userData.avatar || null,
        });
        setSkills(userData.skills || []);
        setExperiences(userData.experiences || []);
        setEducation(userData.education || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors({ general: 'Failed to load profile data' });
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const validateFields = () => {
    const newErrors = {};
    if (!profileData.name || profileData.name.trim().length < 2) {
      newErrors.name = 'Name is required and must be at least 2 characters';
    }
    if (profileData.phone && !/^\+?[\d\s-]{10,}$/.test(profileData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (profileData.website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(profileData.website)) {
      newErrors.website = 'Invalid website URL';
    }
    if (isAddingExperience) {
      if (!newExperience.company) newErrors.experienceCompany = 'Company is required';
      if (!newExperience.position) newErrors.experiencePosition = 'Position is required';
      if (!newExperience.startDate) newErrors.experienceStartDate = 'Start date is required';
    }
    if (isAddingEducation) {
      if (!newEducation.institution) newErrors.educationInstitution = 'Institution is required';
      if (!newEducation.degree) newErrors.educationDegree = 'Degree is required';
      if (!newEducation.startDate) newErrors.educationStartDate = 'Start date is required';
    }
    return newErrors;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!/image\/(jpeg|png)/.test(file.type)) {
        setErrors((prev) => ({ ...prev, avatar: 'Only JPEG/PNG images are allowed' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: 'File size exceeds 5MB' }));
        return;
      }
      setAvatarFile(file);
      setProfileData((prev) => ({
        ...prev,
        avatar: URL.createObjectURL(file), // Preview
      }));
      setErrors((prev) => ({ ...prev, avatar: '' }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setErrors((prev) => ({ ...prev, newSkill: '' }));
    } else {
      setErrors((prev) => ({
        ...prev,
        newSkill: newSkill.trim() ? 'Skill already exists' : 'Skill cannot be empty',
      }));
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExperience({
      ...newExperience,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrors((prev) => ({ ...prev, [`experience${name.charAt(0).toUpperCase() + name.slice(1)}`]: '' }));
  };

  const handleAddExperience = () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    const id = experiences.length ? Math.max(...experiences.map((e) => e.id)) + 1 : 1;
    setExperiences([{ ...newExperience, id }, ...experiences]);
    setNewExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
    setIsAddingExperience(false);
  };

  const handleRemoveExperience = (id) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation({
      ...newEducation,
      [name]: value,
    });
    setErrors((prev) => ({ ...prev, [`education${name.charAt(0).toUpperCase() + name.slice(1)}`]: '' }));
  };

  const handleAddEducation = () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    const id = education.length ? Math.max(...education.map((e) => e.id)) + 1 : 1;
    setEducation([{ ...newEducation, id }, ...education]);
    setNewEducation({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setIsAddingEducation(false);
  };

  const handleRemoveEducation = (id) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      formData.append('location', profileData.location);
      formData.append('about', profileData.about);
      formData.append('website', profileData.website);
      formData.append('company', profileData.company);
      formData.append('position', profileData.position);
      formData.append('skills', JSON.stringify(skills));
      formData.append('experiences', JSON.stringify(experiences));
      formData.append('education', JSON.stringify(education));
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await axios.put('/api/users/me', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      updateProfile(response.data);
      setSuccess(true);
      setIsEditing(false);
      setAvatarFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-center mb-8">My Profile</h1>

        {success && (
          <div className="toast success mb-6">
            Profile updated successfully!
          </div>
        )}

        {errors.general && (
          <div className="toast error mb-6">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt={profileData.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                      <FontAwesomeIcon icon={faUserCircle} className="text-5xl text-primary-500" />
                    </div>
                  )}

                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
                      <FontAwesomeIcon icon={faEdit} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                {errors.avatar && (
                  <p className="text-error-500 text-xs mt-2">{errors.avatar}</p>
                )}

                {!isEditing ? (
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold">{profileData.name}</h2>
                    <p className="text-neutral-600">{profileData.position}</p>
                    {user?.role === 'recruiter' && (
                      <p className="text-neutral-600">{profileData.company}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className={`form-input text-center font-semibold mb-2 ${errors.name ? 'border-error-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-error-500 text-xs">{errors.name}</p>
                    )}
                    <input
                      type="text"
                      name="position"
                      value={profileData.position}
                      onChange={handleProfileChange}
                      className="form-input text-center text-sm mb-2"
                      placeholder="Your position/title"
                    />
                    {user?.role === 'recruiter' && (
                      <input
                        type="text"
                        name="company"
                        value={profileData.company}
                        onChange={handleProfileChange}
                        className="form-input text-center text-sm"
                        placeholder="Your company"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {!isEditing ? (
                  <>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary-500 w-5" />
                      <span className="ml-3">{profileData.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faPhone} className="text-primary-500 w-5" />
                      <span className="ml-3">{profileData.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-500 w-5" />
                      <span className="ml-3">{profileData.location || 'Not provided'}</span>
                    </div>
                    {profileData.website && (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faGlobe} className="text-primary-500 w-5" />
                        <a
                          href={profileData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-primary-600 hover:underline"
                        >
                          {profileData.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-500" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="form-input"
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-500" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className={`form-input ${errors.phone ? 'border-error-500' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-error-500 text-xs">{errors.phone}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-primary-500" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        className="form-input"
                        placeholder="City, State"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faGlobe} className="mr-2 text-primary-500" />
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={profileData.website}
                        onChange={handleProfileChange}
                        className={`form-input ${errors.website ? 'border-error-500' : ''}`}
                        placeholder="https://yourwebsite.com"
                      />
                      {errors.website && (
                        <p className="text-error-500 text-xs">{errors.website}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {!isEditing ? (
                <button
                  className="btn btn-primary w-full mt-6"
                  onClick={() => setIsEditing(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3 mt-6">
                  <button
                    className="btn btn-neutral flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setErrors({});
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="card">
              <h3 className="mb-4">Skills</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full flex items-center"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        className="ml-2 text-primary-700 hover:text-primary-900"
                        onClick={() => handleRemoveSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className={`form-input flex-1 ${errors.newSkill ? 'border-error-500' : ''}`}
                    placeholder="Add a skill"
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAddSkill}
                  >
                    Add
                  </button>
                </div>
              )}
              {errors.newSkill && (
                <p className="text-error-500 text-xs mt-2">{errors.newSkill}</p>
              )}
            </div>
          </div>

          {/* Right Column - Experience, Education, etc. */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="card mb-6">
              <h3 className="mb-4">About Me</h3>

              {!isEditing ? (
                <p className="whitespace-pre-wrap">{profileData.about || 'No bio provided'}</p>
              ) : (
                <textarea
                  name="about"
                  value={profileData.about}
                  onChange={handleProfileChange}
                  className="form-input w-full"
                  rows="4"
                  placeholder="Write a short bio about yourself..."
                ></textarea>
              )}
            </div>

            {/* Experience Section */}
            <div className="card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3>Work Experience</h3>
                {isEditing && !isAddingExperience && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAddingExperience(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    Add
                  </button>
                )}
              </div>

              {isAddingExperience && (
                <div className="border border-neutral-200 rounded-lg p-4 mb-6">
                  <h4 className="mb-3">Add New Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={newExperience.company}
                        onChange={handleExperienceChange}
                        className={`form-input ${errors.experienceCompany ? 'border-error-500' : ''}`}
                        placeholder="Company name"
                      />
                      {errors.experienceCompany && (
                        <p className="text-error-500 text-xs">{errors.experienceCompany}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Position</label>
                      <input
                        type="text"
                        name="position"
                        value={newExperience.position}
                        onChange={handleExperienceChange}
                        className={`form-input ${errors.experiencePosition ? 'border-error-500' : ''}`}
                        placeholder="Your title"
                      />
                      {errors.experiencePosition && (
                        <p className="text-error-500 text-xs">{errors.experiencePosition}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="month"
                        name="startDate"
                        value={newExperience.startDate}
                        onChange={handleExperienceChange}
                        className={`form-input ${errors.experienceStartDate ? 'border-error-500' : ''}`}
                      />
                      {errors.experienceStartDate && (
                        <p className="text-error-500 text-xs">{errors.experienceStartDate}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="month"
                        name="endDate"
                        value={newExperience.endDate}
                        onChange={handleExperienceChange}
                        className="form-input"
                        disabled={newExperience.current}
                      />
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="current-job"
                          name="current"
                          checked={newExperience.current}
                          onChange={handleExperienceChange}
                          className="mr-2"
                        />
                        <label htmlFor="current-job" className="text-sm">I currently work here</label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={newExperience.description}
                      onChange={handleExperienceChange}
                      className="form-input"
                      rows="3"
                      placeholder="Describe your responsibilities and achievements..."
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="btn btn-neutral"
                      onClick={() => setIsAddingExperience(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddExperience}
                    >
                      Add Experience
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {experiences.length === 0 ? (
                  <p className="text-neutral-500 text-center py-4">
                    No work experience added yet.
                    {isEditing && ' Click the "Add" button to add your work history.'}
                  </p>
                ) : (
                  experiences.map((exp) => (
                    <div key={exp.id} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{exp.position}</h4>
                          <p className="text-primary-600">{exp.company}</p>
                          <p className="text-sm text-neutral-500">
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                          </p>
                        </div>
                        {isEditing && (
                          <button
                            className="text-error-500 hover:text-error-700"
                            onClick={() => handleRemoveExperience(exp.id)}
                            aria-label={`Remove ${exp.company} experience`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-neutral-700">{exp.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Education Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3>Education</h3>
                {isEditing && !isAddingEducation && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAddingEducation(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    Add
                  </button>
                )}
              </div>

              {isAddingEducation && (
                <div className="border border-neutral-200 rounded-lg p-4 mb-6">
                  <h4 className="mb-3">Add New Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">Institution</label>
                      <input
                        type="text"
                        name="institution"
                        value={newEducation.institution}
                        onChange={handleEducationChange}
                        className={`form-input ${errors.educationInstitution ? 'border-error-500' : ''}`}
                        placeholder="School/University name"
                      />
                      {errors.educationInstitution && (
                        <p className="text-error-500 text-xs">{errors.educationInstitution}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree</label>
                      <input
                        type="text"
                        name="degree"
                        value={newEducation.degree}
                        onChange={handleEducationChange}
                        className={`form-input ${errors.educationDegree ? 'border-error-500' : ''}`}
                        placeholder="e.g. Bachelor's, Master's"
                      />
                      {errors.educationDegree && (
                        <p className="text-error-500 text-xs">{errors.educationDegree}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">Field of Study</label>
                      <input
                        type="text"
                        name="field"
                        value={newEducation.field}
                        onChange={handleEducationChange}
                        className="form-input"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Graduation Date</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="month"
                          name="startDate"
                          value={newEducation.startDate}
                          onChange={handleEducationChange}
                          className={`form-input ${errors.educationStartDate ? 'border-error-500' : ''}`}
                          placeholder="Start"
                        />
                        <input
                          type="month"
                          name="endDate"
                          value={newEducation.endDate}
                          onChange={handleEducationChange}
                          className="form-input"
                          placeholder="End"
                        />
                      </div>
                      {errors.educationStartDate && (
                        <p className="text-error-500 text-xs">{errors.educationStartDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={newEducation.description}
                      onChange={handleEducationChange}
                      className="form-input"
                      rows="3"
                      placeholder="Describe your coursework, activities, achievements..."
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="btn btn-neutral"
                      onClick={() => setIsAddingEducation(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddEducation}
                    >
                      Add Education
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {education.length === 0 ? (
                  <p className="text-neutral-500 text-center py-4">
                    No education history added yet.
                    {isEditing && ' Click the "Add" button to add your education.'}
                  </p>
                ) : (
                  education.map((edu) => (
                    <div key={edu.id} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{edu.institution}</h4>
                          <p className="text-primary-600">
                            {edu.degree} in {edu.field}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                          </p>
                        </div>
                        {isEditing && (
                          <button
                            className="text-error-500 hover:text-error-700"
                            onClick={() => handleRemoveEducation(edu.id)}
                            aria-label={`Remove ${edu.institution} education`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-neutral-700">{edu.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;