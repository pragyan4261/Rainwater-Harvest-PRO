import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropletIcon, LeafIcon, ChevronRightIcon, HomeIcon, TrendingUpIcon, ShieldCheckIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import MainLayout from '../../layouts/MainLayout';
import styles from './Onboarding.module.css';

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
  features: string[];
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides: OnboardingSlide[] = [
    {
      icon: <DropletIcon className="h-20 w-20 text-blue-500" />,
      title: 'Assess Your Potential',
      description: "Discover your home's rainwater harvesting potential with AI-powered analysis and real-time weather data.",
      color: 'blue',
      bgGradient: 'from-blue-50 to-cyan-50',
      features: ['Smart Assessment', 'Real-time Analysis', 'Personalized Results']
    },
    {
      icon: <TrendingUpIcon className="h-20 w-20 text-green-500" />,
      title: 'Save Water & Money',
      description: 'Reduce your water bills by up to 50% and contribute to sustainable water management in your community.',
      color: 'green',
      bgGradient: 'from-green-50 to-emerald-50',
      features: ['Cost Savings', 'Water Conservation', 'ROI Tracking']
    },
    {
      icon: <LeafIcon className="h-20 w-20 text-emerald-500" />,
      title: 'Environmental Impact',
      description: 'Help recharge groundwater, reduce stormwater runoff, and create a positive environmental legacy.',
      color: 'emerald',
      bgGradient: 'from-emerald-50 to-green-50',
      features: ['Eco-friendly', 'Carbon Footprint', 'Future Generation']
    }
  ];

  const nextSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        navigate('/login');
      }
      setIsAnimating(false);
    }, 300);
  };

  const skipToLogin = () => {
    navigate('/login');
  };

  const goToSlide = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <MainLayout hideNavbar>
      <div className="relative min-h-screen overflow-hidden">
        {/* Dynamic Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].bgGradient} transition-all duration-1000`}>
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`${styles.floatSlow} ${styles.floatDelay1} absolute rounded-full opacity-10 w-16 h-16 left-[10%] top-[20%] ${
              slides[currentSlide].color === 'blue' ? 'bg-blue-300' :
              slides[currentSlide].color === 'green' ? 'bg-green-300' : 'bg-emerald-300'
            }`} />
            <div className={`${styles.floatSlow} ${styles.floatDelay2} absolute rounded-full opacity-10 w-24 h-24 left-[80%] top-[10%] ${
              slides[currentSlide].color === 'blue' ? 'bg-blue-300' :
              slides[currentSlide].color === 'green' ? 'bg-green-300' : 'bg-emerald-300'
            }`} />
            <div className={`${styles.floatSlow} ${styles.floatDelay3} absolute rounded-full opacity-10 w-20 h-20 left-[60%] top-[70%] ${
              slides[currentSlide].color === 'blue' ? 'bg-blue-300' :
              slides[currentSlide].color === 'green' ? 'bg-green-300' : 'bg-emerald-300'
            }`} />
            <div className={`${styles.floatSlow} ${styles.floatDelay4} absolute rounded-full opacity-10 w-12 h-12 left-[20%] top-[80%] ${
              slides[currentSlide].color === 'blue' ? 'bg-blue-300' :
              slides[currentSlide].color === 'green' ? 'bg-green-300' : 'bg-emerald-300'
            }`} />
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col min-h-screen p-6">
          
          {/* Header with Skip Button */}
          <div className="flex justify-between items-center w-full mb-8">
            <div className="flex items-center space-x-2">
              <DropletIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">RainWise</span>
            </div>
            <button 
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-200" 
              onClick={skipToLogin}
            >
              Skip
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto text-center">
            
            {/* Icon Container with Animation */}
            <div className={`relative mb-8 transform transition-all duration-500 ${isAnimating ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}`}>
              <div className={`w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center relative overflow-hidden`}>
                {/* Animated Ring */}
                <div className={`absolute inset-0 rounded-full border-4 ${
                  slides[currentSlide].color === 'blue' ? 'border-blue-200' :
                  slides[currentSlide].color === 'green' ? 'border-green-200' : 'border-emerald-200'
                } animate-pulse`}></div>
                
                {/* Main Icon */}
                <div className="relative z-10">
                  {slides[currentSlide].icon}
                </div>
                
                {/* Floating Particles */}
                <div className="absolute inset-0">
                  <div className={`${styles.particleDelay1} absolute w-2 h-2 rounded-full top-[20%] right-[10%] animate-ping opacity-60 ${
                    slides[currentSlide].color === 'blue' ? 'bg-blue-300' :
                    slides[currentSlide].color === 'green' ? 'bg-green-300' : 'bg-emerald-300'
                  }`} />
                  <div className={`${styles.particleDelay2} absolute w-2 h-2 rounded-full top-[35%] right-[15%] animate-ping opacity-60 ${
                    slides[currentSlide].color === 'blue' ? 'bg-blue-300' :
                    slides[currentSlide].color === 'green' ? 'bg-green-300' : 'bg-emerald-300'
                  }`} />
                  <div className={`${styles.particleDelay3} absolute w-2 h-2 rounded-full top-[50%] right-[20%] animate-ping opacity-60 ${
                    slides[currentSlide].color === 'blue' ? 'bg-blue-300' :
                    slides[currentSlide].color === 'green' ? 'bg-green-300' : 'bg-emerald-300'
                  }`} />
                </div>
              </div>
            </div>

            {/* Title and Description */}
            <div className={`transform transition-all duration-500 delay-100 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                {slides[currentSlide].title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Features List */}
            <div className={`grid grid-cols-1 gap-3 mb-8 w-full max-w-sm transform transition-all duration-500 delay-200 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
              {slides[currentSlide].features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white bg-opacity-60 rounded-lg p-3 backdrop-blur-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    slides[currentSlide].color === 'blue' ? 'bg-blue-100' :
                    slides[currentSlide].color === 'green' ? 'bg-green-100' : 'bg-emerald-100'
                  }`}>
                    <ShieldCheckIcon className={`h-3 w-3 ${
                      slides[currentSlide].color === 'blue' ? 'text-blue-600' :
                      slides[currentSlide].color === 'green' ? 'text-green-600' : 'text-emerald-600'
                    }`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center space-x-3 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? `w-8 ${
                          slides[currentSlide].color === 'blue' ? 'bg-blue-600' :
                          slides[currentSlide].color === 'green' ? 'bg-green-600' : 'bg-emerald-600'
                        }` 
                      : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="w-full max-w-md mx-auto">
            <div className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200`}>
              <Button 
                variant="primary" 
                fullWidth 
                size="lg" 
                onClick={nextSlide}
                icon={currentSlide === slides.length - 1 ? <HomeIcon size={20} /> : <ChevronRightIcon size={20} />}
              >
                <span className="relative z-10 font-semibold">
                  {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
                </span>
              </Button>
            </div>
            
            {/* Progress Text */}
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">
                {currentSlide + 1} of {slides.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Onboarding;