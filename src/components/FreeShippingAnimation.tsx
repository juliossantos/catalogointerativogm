
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FreeShippingAnimationProps {
  show: boolean;
}

const FreeShippingAnimation: React.FC<FreeShippingAnimationProps> = ({ show }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3500); // Animation will play for 3.5 seconds
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [show]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      className="fixed top-1/4 left-1/2 z-50 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 text-center border-2 border-green-500"
      initial={{ scale: 0.5, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <motion.div 
        className="text-2xl mb-1"
        animate={{ 
          scale: [1, 1.2, 1], 
          rotate: [0, 5, -5, 0] 
        }}
        transition={{ duration: 0.5, repeat: 2 }}
      >
        🎉
      </motion.div>
      <h3 className="font-bold text-green-600 mb-1">Frete Grátis!</h3>
      <p className="text-sm text-gray-600">Você desbloqueou o frete grátis!</p>
    </motion.div>
  );
};

export default FreeShippingAnimation;
