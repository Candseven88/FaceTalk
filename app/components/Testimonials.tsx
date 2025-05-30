'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Mock data for testimonials - in a real app, this would come from an API/database
const initialTestimonials = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Content Creator',
    comment: 'FaceTalk has revolutionized my content. The quality is incredible!',
    avatar: '/avatars/sarah.jpg',
    rating: 5,
    date: '2023-12-10',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    role: 'Marketing Director',
    comment: 'We use FaceTalk for all our corporate presentations. It\'s a game-changer!',
    avatar: '/avatars/mike.jpg',
    rating: 5,
    date: '2023-11-28',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Education Specialist',
    comment: 'The voice cloning feature is mind-blowing. Perfect for personalized content.',
    avatar: '/avatars/emily.jpg',
    rating: 5,
    date: '2024-01-05',
  },
  {
    id: '4',
    name: 'Alex Thompson',
    role: 'YouTube Creator',
    comment: 'Since using FaceTalk, my engagement rates have increased by 35%. The avatars look so realistic!',
    avatar: '/avatars/alex.jpg',
    rating: 4,
    date: '2024-01-15',
  },
  {
    id: '5',
    name: 'Jessica Kim',
    role: 'Digital Marketing Consultant',
    comment: 'My clients are amazed by what we can create with FaceTalk. Worth every penny!',
    avatar: '/avatars/jessica.jpg',
    rating: 5,
    date: '2024-02-02',
  }
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    comment: '',
    rating: 5,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would be sent to an API
    const newTestimonial = {
      id: Date.now().toString(),
      name: formData.name,
      role: formData.role,
      comment: formData.comment,
      avatar: '',
      rating: formData.rating,
      date: new Date().toISOString().split('T')[0],
    };
    
    setTestimonials(prev => [newTestimonial, ...prev]);
    setFormData({
      name: '',
      role: '',
      comment: '',
      rating: 5,
    });
    setSuccessMessage('Thank you for your feedback!');
    setTimeout(() => {
      setSuccessMessage('');
      setShowForm(false);
    }, 3000);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };
  
  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'all') return true;
    return t.rating === parseInt(filter);
  });
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-blue-100 text-facebook-blue text-sm font-semibold rounded-full mb-2 animate-pulse">
            User Feedback
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied creators who have transformed their content with FaceTalk.
            We value your feedback to continuously improve our services.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <label htmlFor="filter" className="mr-2 text-gray-700 font-medium">Filter by rating:</label>
            <select 
              id="filter" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-facebook-blue"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center animate-fade-in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Share Your Experience'}
          </button>
        </div>
        
        {/* Feedback Form */}
        {showForm && (
          <div className="mb-12 bg-gray-50 p-6 rounded-2xl shadow-card animate-scale-in">
            <h3 className="text-xl font-semibold mb-4">Share Your FaceTalk Experience</h3>
            {successMessage ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 animate-fade-in">
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Role/Profession
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Feedback *
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                  />
                </div>
                
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating *
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="text-gray-300 hover:text-yellow-400 focus:outline-none p-1"
                      >
                        <svg 
                          className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="facebook-card p-6 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 overflow-hidden flex-shrink-0">
                  {testimonial.avatar ? (
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      width={48} 
                      height={48} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500 font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-400 mt-1">{testimonial.date}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
        
        {/* Google Form Integration */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to share more detailed feedback? We'd love to hear from you!
          </p>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSermFAkp6UU0Us3cD464W4KyrQmX-LRpwMwf65TC_KZ-F2LJA/viewform?usp=sharing&ouid=109318936006223507296" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Complete Our Detailed Feedback Form
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
} 