import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropletIcon, CloudRainIcon, HomeIcon, LeafIcon } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Navigation timer
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-teal-600 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 border border-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 border border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 border border-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Animated Rain Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white opacity-30 rounded-full animate-bounce"
            style={{
              width: '2px',
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * -100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDirection: 'alternate-reverse'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 text-white z-10">
        
        {/* Logo Section with Enhanced Animation */}
        <div className="mb-8 relative">
          {/* Outer Ring Animation */}
          <div className="absolute inset-0 w-32 h-32 border-4 border-blue-300 rounded-full animate-spin opacity-30" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-2 w-28 h-28 border-2 border-teal-300 rounded-full animate-spin opacity-40" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          
          {/* Center Logo */}
          <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-blue-400 to-teal-500 rounded-full shadow-2xl animate-pulse">
            <div className="relative">
              <DropletIcon className="h-16 w-16 text-white drop-shadow-lg" />
              {/* Small animated droplets around main icon */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-200 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-teal-200 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Brand Name with Gradient Text */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-blue-200 via-white to-teal-200 bg-clip-text text-transparent animate-fade-in">
            RainWise
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <LeafIcon className="h-5 w-5 text-green-300" />
            <p className="text-xl md:text-2xl font-light text-blue-100">
              Smart Rainwater Harvesting
            </p>
            <LeafIcon className="h-5 w-5 text-green-300" />
          </div>
          <p className="text-sm text-blue-200 opacity-90 max-w-md mx-auto leading-relaxed">
            Transforming every drop into sustainable water solutions for a greener tomorrow
          </p>
        </div>

        {/* Feature Icons Row */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0s' }}>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-30 rounded-full flex items-center justify-center mb-2">
              <CloudRainIcon className="h-6 w-6 text-blue-200" />
            </div>
            <span className="text-xs text-blue-200">Collect</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 bg-teal-500 bg-opacity-30 rounded-full flex items-center justify-center mb-2">
              <DropletIcon className="h-6 w-6 text-teal-200" />
            </div>
            <span className="text-xs text-teal-200">Filter</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.6s' }}>
            <div className="w-12 h-12 bg-green-500 bg-opacity-30 rounded-full flex items-center justify-center mb-2">
              <HomeIcon className="h-6 w-6 text-green-200" />
            </div>
            <span className="text-xs text-green-200">Store</span>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-2">
            <span>Initializing</span>
            <span>{progress}%</span>
          </div>
          <div className="relative w-full h-2 bg-blue-800 bg-opacity-50 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-teal-400 rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-blue-300">
              {progress < 30 ? 'Loading resources...' : 
               progress < 60 ? 'Preparing interface...' : 
               progress < 90 ? 'Almost ready...' : 'Welcome to RainWise!'}
            </p>
          </div>
        </div>

        {/* Floating Action Indicators */}
        <div className="flex space-x-4">
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Subtle Branding Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-blue-300 opacity-70">
            Sustainable • Efficient • Smart
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Top-left corner decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-transparent opacity-20 rounded-full transform -translate-x-32 -translate-y-32"></div>
        {/* Bottom-right corner decoration */}
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-teal-400 to-transparent opacity-20 rounded-full transform translate-x-40 translate-y-40"></div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;