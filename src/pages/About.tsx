import React from 'react';
import { CheckCircle, Users, Award, Clock } from 'lucide-react';

const About: React.FC = () => {
  const stats = [
    { number: '500+', label: 'Happy Clients' },
    { number: '1000+', label: 'Projects Completed' },
    { number: '5+', label: 'Years Experience' },
    { number: '24/7', label: 'Support Available' }
  ];

  const values = [
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Quality Assurance',
      description: 'We ensure the highest quality in all our products and services, backed by comprehensive warranties.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do. We prioritize their needs and satisfaction.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Expert Team',
      description: 'Our certified technicians bring years of experience and expertise to every project.'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Timely Delivery',
      description: 'We understand the importance of time and deliver projects on schedule without compromising quality.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About WAINSO
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Your trusted partner in security, tracking, and maintenance solutions. 
              We've been serving businesses across India with cutting-edge technology and reliable service.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2019, WAINSO began with a simple mission: to provide businesses 
                  with reliable, cutting-edge security and tracking solutions. What started as 
                  a small team of passionate technicians has grown into a trusted name in the 
                  industry.
                </p>
                <p>
                  Over the years, we've helped hundreds of businesses secure their premises, 
                  track their assets, and maintain their equipment. Our commitment to quality 
                  and customer satisfaction has earned us the trust of clients across various 
                  industries.
                </p>
                <p>
                  Today, we continue to innovate and expand our services, always staying ahead 
                  of the curve with the latest technology and best practices in security and 
                  tracking solutions.
                </p>
              </div>
            </div>
            <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="text-6xl mb-4">🏢</div>
                <p>Company Image</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-600">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              To empower businesses with innovative security, tracking, and maintenance solutions 
              that provide peace of mind, enhance efficiency, and drive growth. We are committed 
              to delivering exceptional value through cutting-edge technology, expert service, 
              and unwavering reliability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
