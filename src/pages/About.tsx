import React, { useRef, useState } from 'react';
import { CheckCircle, Users, Award, Clock, Image as ImageIcon, FileText, MapPin, Phone, Mail, Building2, Download, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import html2canvas from 'html2canvas';

const BrandLogo: React.FC<{ brand: { name: string; localLogo: string; logoUrl: string } }> = ({ brand }) => {
  const [imgSrc, setImgSrc] = React.useState(brand.localLogo);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (imgSrc === brand.localLogo) {
      // Try Clearbit logo service
      setImgSrc(brand.logoUrl);
    } else {
      // Both failed, show text fallback
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="text-2xl font-bold text-primary-600">
        {brand.name}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${brand.name} logo`}
      className="max-h-16 max-w-full object-contain"
      onError={handleError}
    />
  );
};

const VisitingCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = 'wainso-visiting-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsVCF = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:WAINSO
ORG:WAINSO
ADR;TYPE=WORK:;;Room No-9, 1st Floor, Yadav Complex, Near Block Chawck, Block Chowk;Ramgarh Cantt;Jharkhand;829122;India
TEL;TYPE=WORK,VOICE:+91 98998 60975
TEL;TYPE=WORK,VOICE:+91 82927 17044
EMAIL;TYPE=WORK:wainsogps@gmail.com
URL:wainso.com
NOTE:GSTIN: 20AACFW6441P1ZY
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wainso-contact.vcf';
    link.click();
    URL.revokeObjectURL(link.href);
    setShowDownloadMenu(false);
  };

  const handleDownloadImage = async () => {
    await downloadAsImage();
    setShowDownloadMenu(false);
  };

  return (
    <div className="space-y-4">
      {/* Modern Visiting Card */}
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100"
        style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
      >
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Building2 className="h-8 w-8 text-white opacity-90" />
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-xs font-semibold">Est. 2017</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-1">WAINSO</h2>
            <p className="text-primary-100 text-sm font-medium">GPS & Security System</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 space-y-4">
          {/* Address */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary-50 p-2 rounded-lg flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <p className="text-sm font-medium text-gray-900 leading-tight">
                Room No-9, 1st Floor, Yadav Complex<br />
                Near Block Chawck, Block Chowk<br />
                Ramgarh Cantt - 829122, Jharkhand
              </p>
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary-50 p-2 rounded-lg flex-shrink-0">
              <Phone className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <a href="tel:+919911484404" className="text-sm font-medium text-gray-900 hover:text-primary-600 block">
                +91 98998 60975
              </a>
              <a href="tel:+918292717044" className="text-sm font-medium text-gray-900 hover:text-primary-600 block">
                +91 82927 17044
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary-50 p-2 rounded-lg flex-shrink-0">
              <Mail className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <a href="mailto:wainsogps@gmail.com" className="text-sm font-medium text-gray-900 hover:text-primary-600 block break-all">
                wainsogps@gmail.com
              </a>
            </div>
          </div>

          {/* GSTIN */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">GSTIN</p>
            <p className="text-xs font-semibold text-gray-700">20AACFW6441P1ZY</p>
          </div>
        </div>

        {/* Footer with Rating */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Rating</p>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-primary-600">4.9</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">(45+ reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Website</p>
              <a href="https://wainso.com" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                wainso.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button with Dropdown */}
      <div className="flex justify-center">
        <div className="relative">
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Download className="h-5 w-5" />
            <span>Download</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showDownloadMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDownloadMenu(false)}
              ></div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-[200px]">
                <button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {isDownloading ? 'Downloading...' : 'Download as Image'}
                  </span>
                </button>
                <button
                  onClick={downloadAsVCF}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">Download as vCard</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const About: React.FC = () => {
  const stats = [
    { number: '500+', label: 'Happy Clients' },
    { number: '1000+', label: 'Projects Completed' },
    { number: '8+', label: 'Years Experience' },
    { number: '4.9', label: 'Customer Rating' }
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
    <>
      <SEO
        title="About WAINSO - IT, Security & ERP Partner in Jharkhand | India"
        description="Established in 2017, WAINSO is a trusted IT and security partner delivering ERP, networking, CCTV, and software solutions across Jharkhand and India. 500+ satisfied customers and 4.9-star service quality."
        path="/about"
      />
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
                  Established in 2017, WAINSO began with a simple mission: to provide businesses
                  and individuals across India with reliable, cutting-edge security and tracking solutions.
                  What started as a small team of passionate technicians has grown into a trusted name in the industry, 
                  serving over 500+ satisfied customers.
                </p>
                <p>
                  Over the past 8 years, we've helped hundreds of businesses secure their premises, 
                  track their assets, and maintain their equipment. Our commitment to quality 
                  and customer satisfaction has earned us a 4.9-star rating and the trust of clients across various 
                  industries including retail, manufacturing, logistics, healthcare, and more.
                </p>
                <p>
                  We are authorized dealers for leading brands including CP Plus, Hikvision, Panasonic, Godrej, 
                  and Concox GPS tracking systems. Our expertise spans CCTV installation, GPS tracking, security alarms, 
                  video door phones, and comprehensive maintenance services.
                </p>
                <p>
                  Today, we continue to innovate and expand our services, always staying ahead 
                  of the curve with the latest technology and best practices in security and 
                  tracking solutions. Our team of certified technicians ensures professional installation 
                  and ongoing support for all our products and services.
                </p>
              </div>
            </div>
            <VisitingCard />
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

      {/* Brands Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Authorized Dealers & Partners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We are authorized dealers for leading security and tracking brands
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
            {[
              { 
                name: 'CP Plus', 
                category: 'CCTV & Security',
                logoUrl: 'https://logo.clearbit.com/cpplus.com',
                localLogo: '/images/partners/cpplus.png',
                website: 'https://www.cpplus.com'
              },
              { 
                name: 'Hikvision', 
                category: 'CCTV Systems',
                logoUrl: 'https://logo.clearbit.com/hikvision.com',
                localLogo: '/images/partners/hikvision.png',
                website: 'https://www.hikvision.com'
              },
              { 
                name: 'Panasonic', 
                category: 'Security Cameras',
                logoUrl: 'https://logo.clearbit.com/panasonic.com',
                localLogo: '/images/partners/panasonic.png',
                website: 'https://www.panasonic.com'
              },
              { 
                name: 'Godrej', 
                category: 'Security Systems',
                logoUrl: 'https://logo.clearbit.com/godrej.com',
                localLogo: '/images/partners/godrej.png',
                website: 'https://www.godrej.com'
              },
              { 
                name: 'Concox', 
                category: 'GPS Tracking',
                logoUrl: 'https://logo.clearbit.com/concox.com',
                localLogo: '/images/partners/concox.png',
                website: 'https://www.concox.com'
              }
            ].map((brand, index) => {
              const brandForLogo = { name: brand.name, localLogo: brand.localLogo, logoUrl: brand.logoUrl };
              return (
              <a
                key={index}
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all border-2 border-gray-200 hover:border-primary-300 group"
              >
                <div className="h-20 flex items-center justify-center mb-3">
                  <BrandLogo brand={brandForLogo} />
                </div>
                <div className="text-xs text-gray-500 group-hover:text-primary-600 transition-colors">
                  {brand.category}
                </div>
              </a>
              );
            })}
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
    </>
  );
};

export default About;
