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
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState('');
  const [education, setEducation] = useState('');
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
        setSkills(userData.skills || '');
        setExperiences(userData.experiences || '');
        setEducation(userData.education || '');
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
        avatar: URL.createObjectURL(file),
      }));
      setErrors((prev) => ({ ...prev, avatar: '' }));
    }
  };

  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setSkills(value);
    } else if (name === 'experiences') {
      setExperiences(value);
    } else if (name === 'education') {
      setEducation(value);
    }
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
      formData.append('skills', skills);
      formData.append('experiences', experiences);
      formData.append('education', education);
      
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

              {!isEditing ? (
                <div className="whitespace-pre-wrap">
                  {skills || 'No skills added yet.'}
                </div>
              ) : (
                <>
                  <textarea
                    name="skills"
                    value={skills}
                    onChange={handleTextAreaChange}
                    className="form-input w-full"
                    rows="4"
                    placeholder="List your skills, separated by commas"
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    Example: JavaScript, React, Node.js, CSS
                  </p>
                </>
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
              <h3 className="mb-4">Work Experience</h3>

              {!isEditing ? (
                <div className="whitespace-pre-wrap">
                  {experiences || 'No work experience added yet.'}
                </div>
              ) : (
                <textarea
                  name="experiences"
                  value={experiences}
                  onChange={handleTextAreaChange}
                  className="form-input w-full"
                  rows="8"
                  placeholder="Describe your work experience..."
                />
              )}
            </div>

            {/* Education Section */}
            <div className="card">
              <h3 className="mb-4">Education</h3>

              {!isEditing ? (
                <div className="whitespace-pre-wrap">
                  {education || 'No education history added yet.'}
                </div>
              ) : (
                <textarea
                  name="education"
                  value={education}
                  onChange={handleTextAreaChange}
                  className="form-input w-full"
                  rows="6"
                  placeholder="Describe your education background..."
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;