import React from 'react';
import { DropletIcon } from 'lucide-react';
import styles from './AssessmentLoader.module.css';

const AssessmentLoader: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Main Loader Container */}
      <div className="relative">
        {/* Animated Water Droplets */}
        <div className="flex space-x-2 mb-8">
          <div className={`${styles.dropletBounce} ${styles.dropletDelay0} w-4 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full`}></div>
          <div className={`${styles.dropletBounce} ${styles.dropletDelay200} w-4 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full`}></div>
          <div className={`${styles.dropletBounce} ${styles.dropletDelay400} w-4 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full`}></div>
        </div>
        
        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <DropletIcon className="w-4 h-4 text-white animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Loading Text with Animated Dots */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Assessment Results
          </h3>
          <div className="flex items-center justify-center space-x-1 text-blue-600">
            <span className="text-sm">Analyzing your data</span>
            <div className="flex space-x-1">
              <div className={`${styles.pulseDot} ${styles.pulseDelay0} w-1 h-1 bg-blue-500 rounded-full`}></div>
              <div className={`${styles.pulseDot} ${styles.pulseDelay300} w-1 h-1 bg-blue-500 rounded-full`}></div>
              <div className={`${styles.pulseDot} ${styles.pulseDelay600} w-1 h-1 bg-blue-500 rounded-full`}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Bubbles */}
        <div className={`${styles.floatingBubble} ${styles.bubble1} absolute bg-blue-200 rounded-full opacity-20 w-4 h-4`}></div>
        <div className={`${styles.floatingBubble} ${styles.bubble2} absolute bg-blue-200 rounded-full opacity-20 w-6 h-6`}></div>
        <div className={`${styles.floatingBubble} ${styles.bubble3} absolute bg-blue-200 rounded-full opacity-20 w-3 h-3`}></div>
        <div className={`${styles.floatingBubble} ${styles.bubble4} absolute bg-cyan-200 rounded-full opacity-20 w-5 h-5`}></div>
        <div className={`${styles.floatingBubble} ${styles.bubble5} absolute bg-blue-300 rounded-full opacity-20 w-4 h-4`}></div>
        <div className={`${styles.floatingBubble} ${styles.bubble6} absolute bg-cyan-300 rounded-full opacity-20 w-3 h-3`}></div>
      </div>
      
      {/* Progress Steps Indicator */}
      <div className="mt-12 flex items-center space-x-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm bg-blue-500 text-white animate-pulse">
            🔄
          </div>
          <span className="text-xs mt-2 text-blue-600 font-medium">Processing</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm bg-gray-200 text-gray-400 transition-all duration-500">
            🌦️
          </div>
          <span className="text-xs mt-2 text-gray-400 transition-colors duration-500">Weather Data</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm bg-gray-200 text-gray-400 transition-all duration-500">
            📊
          </div>
          <span className="text-xs mt-2 text-gray-400 transition-colors duration-500">Analysis</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm bg-gray-200 text-gray-400 transition-all duration-500">
            ✨
          </div>
          <span className="text-xs mt-2 text-gray-400 transition-colors duration-500">Results</span>
        </div>
      </div>
    </div>
  );
};

export default AssessmentLoader;