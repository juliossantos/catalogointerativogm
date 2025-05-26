import React, { useState, useEffect } from 'react';
import { Product } from '../types/products';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Plus, Minus, Package, Scale, Eye, Check, XCircle } from 'lucide-react';
import { Input } from './ui/input';
import ProductImageCarousel from './ProductImageCarousel';
import ProductDetail from './ProductDetail';
import { toast } from './ui/sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, decreaseQuantity, updateQuantity, cartItems } = useCart();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Determine product availability
  const isAvailable = product.inStock !== false && !product.isLaunch;
  
  // Find this product in cart
  const currentItem = cartItems.find(item => item.product.id === product.id);
  const quantity = currentItem?.quantity || 0;
  const [inputValue, setInputValue] = useState(quantity.toString());
  
  // Sync input with cart quantity
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setInputValue(value);
  };

  const applyQuantity = () => {
    const newQuantity = parseInt(inputValue) || 0;
    
    if (newQuantity > 0) {
      if (quantity > 0) {
        updateQuantity(product.id, newQuantity);
      } else {
        addToCart(product, newQuantity);
      }
    } else {
      setInputValue(quantity.toString());
      toast.error("Quantidade inválida", {
        description: "Por favor, insira um número maior que zero."
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyQuantity();
    }
  };

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error("Produto indisponível", {
        description: product.isLaunch 
          ? "Este produto estará disponível em breve." 
          : "Este produto está temporariamente fora de estoque."
      });
      return;
    }
    addToCart(product);
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative overflow-hidden" aria-label={`Imagem do produto ${product.name}`}>
          <ProductImageCarousel 
            images={product.images} 
            productName={product.name} 
            className="aspect-square"
          />
          
          {/* Badges */}
          <div className="absolute top-2 right-2 bg-white text-red-600 font-bold px-2 py-1 rounded-full text-xs">
            {product.category}
          </div>
          
          {product.featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white font-bold px-2 py-1 rounded-full text-xs">
              Destaque
            </div>
          )}
          
          {!isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className={`font-bold px-3 py-2 rounded-md text-sm ${
                product.isLaunch ? 'bg-green-500' : 'bg-red-600'
              } text-white`}>
                {product.isLaunch ? 'EM BREVE' : 'SEM ESTOQUE'}
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="flex-grow pt-4">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-1">{product.packageInfo}</p>
          
          {product.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Scale className="h-3 w-3 mr-1" />
              {product.weight.toFixed(2)}kg
            </span>
            {product.isPackage && (
              <span className="flex items-center">
                <Package className="h-3 w-3 mr-1" />
                Pacote
              </span>
            )}
          </div>
          
          <p className="text-xl font-bold text-red-600">
            R$ {product.price.toFixed(2)}
          </p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailOpen(true)}
            className="text-xs flex items-center mt-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
            aria-label={`Ver detalhes do produto ${product.name}`}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver Mais
          </Button>
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between items-center">
          {isAvailable ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => decreaseQuantity(product.id)}
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8"
                disabled={quantity === 0}
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleQuantityChange}
                  onBlur={applyQuantity}
                  onKeyDown={handleKeyDown}
                  className="h-8 w-12 px-2 text-center"
                  inputMode="numeric"
                  aria-label="Quantidade do produto"
                />
                {inputValue !== quantity.toString() && (
                  <Button
                    onClick={applyQuantity}
                    variant="outline"
                    size="sm"
                    className="absolute -right-12 top-0 h-8 px-2"
                    aria-label="Aplicar quantidade"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-500"
              disabled
              aria-disabled
            >
              <XCircle className="h-4 w-4 mr-1" />
              {product.isLaunch ? 'Em Breve' : 'Indisponível'}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <ProductDetail 
        product={product} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </>
  );
};

export default ProductCard;