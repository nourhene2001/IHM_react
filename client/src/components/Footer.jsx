import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand and Socials */}
          <div>
            <h3 className="text-2xl font-extrabold text-primary-400 mb-4">CareerConnect</h3>
            <p className="text-neutral-200 mb-6 leading-relaxed">
              Connecting talent with opportunities. Find your dream job or the perfect candidate.
            </p>
            <div className="flex space-x-4">
              {[faFacebookF, faTwitter, faLinkedinIn, faInstagram].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-white hover:text-primary-400 transition-colors text-lg"
                  aria-label={`Social icon ${i}`}
                >
                  <FontAwesomeIcon icon={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-neutral-200">
              <li>
                <Link to="/jobs" className="hover:text-primary-400 transition-colors">Browse Jobs</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Employer Section */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">For Employers</h4>
            <ul className="space-y-2 text-neutral-200">
              <li>
                <Link to="/post-job" className="hover:text-primary-400 transition-colors">Post a Job</Link>
              </li>
              <li>
                <Link to="/recruitment-solutions" className="hover:text-primary-400 transition-colors">
                  Recruitment Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-4 text-neutral-200">
              <li className="flex items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-400 mt-1 mr-3" />
                <span>123 Career Street, Employment City, Tunisia </span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon={faPhone} className="text-primary-400 mt-1 mr-3" />
                <span>+216 77 575 020</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon={faEnvelope} className="text-primary-400 mt-1 mr-3" />
                <span>contact@careerconnect.com</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon={faHeadset} className="text-primary-400 mt-1 mr-3" />
                <span> 24/7 Support Available</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
   {/* Bottom copyright */}
{/* Bottom copyright */}
<div className="mt-16 pt-12 pb-12 border-t border-neutral-700 text-center text-neutral-400 text-sm">
  <p>&copy; {currentYear} CareerConnect. All rights reserved.</p>
</div>


      </div>
    </footer>
  );
}

export default Footer;
