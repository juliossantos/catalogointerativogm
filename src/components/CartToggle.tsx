
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ShoppingCart, Package, Scale } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { MIN_PACKAGES, MIN_WEIGHT_KG } from '@/data/products';

const CartToggle: React.FC = () => {
  const { 
    toggleCart, 
    itemsCount, 
    cartTotal, 
    packageCount, 
    totalWeight, 
    meetsMinimumOrder,
    animateCartIcon 
  } = useCart();
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Watch for animation triggers
  useEffect(() => {
    if (animateCartIcon) {
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [animateCartIcon]);

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      {itemsCount > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-2 text-xs">
          {/* Combined metrics row */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              <span className={packageCount >= MIN_PACKAGES ? "text-green-600 font-bold" : ""}>
                {packageCount}/{MIN_PACKAGES}
              </span>
            </div>
            <div className="flex items-center">
              <Scale className="h-3 w-3 mr-1" />
              <span className={totalWeight >= MIN_WEIGHT_KG ? "text-green-600 font-bold" : ""}>
                {totalWeight.toFixed(1)}/{MIN_WEIGHT_KG}kg
              </span>
            </div>
          </div>
        </div>
      )}
      
      <Button 
        onClick={toggleCart}
        variant="default"
        className={`
          shadow-lg rounded-full h-16 w-16 md:h-auto md:w-auto md:rounded-lg md:px-4 md:py-2 
          md:bottom-auto md:top-4 md:right-4 transition-all duration-300
          ${meetsMinimumOrder ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500 hover:bg-gray-600'}
          ${isAnimating ? 'scale-110 animate-bounce' : ''}
        `}
      >
        <ShoppingCart className={`h-6 w-6 md:mr-2 ${isAnimating ? 'text-yellow-300' : ''}`} />
        <span className="hidden md:inline">R$ {cartTotal.toFixed(2)}</span>
        {itemsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemsCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default CartToggle;
