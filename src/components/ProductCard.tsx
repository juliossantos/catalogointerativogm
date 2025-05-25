
import React, { useState, useEffect } from 'react';
import { Product } from '../types/products';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Plus, Minus, Package, Scale, Eye, Check, XCircle } from 'lucide-react';
import { Input } from './ui/input';
import ProductImageCarousel from './ProductImageCarousel';
import ProductDetail from './ProductDetail';
import { useToast } from '@/hooks/use-toast';
import { toast } from './ui/sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, decreaseQuantity, updateQuantity, cartItems } = useCart();
  const { toast: shadcnToast } = useToast();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Product is in stock by default unless explicitly set to false
  const isInStock = product.inStock !== false;
  
  // Find this product in cart to get current quantity
  const currentItem = cartItems.find(item => item.product.id === product.id);
  const quantity = currentItem ? currentItem.quantity : 0;
  
  // Local state for input field value
  const [inputValue, setInputValue] = useState<string>(quantity.toString());
  
  // Track if user is manually editing the field
  const [manualEdit, setManualEdit] = useState(false);
  
  // Update local state whenever cart quantity changes
  useEffect(() => {
    setInputValue(quantity.toString());
    // Reset manual edit flag when cart changes from elsewhere
    if (!manualEdit || parseInt(inputValue) === quantity) {
      setManualEdit(false);
    }
  }, [quantity]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setInputValue(value);
      setManualEdit(true); // Set manual edit mode when user types
    }
  };

  const handleApplyQuantity = () => {
    console.log("ProductCard - Applying quantity: Current input value =", inputValue);
    const newQuantity = parseInt(inputValue) || 0;
    console.log("ProductCard - Parsed quantity =", newQuantity);
    
    if (newQuantity > 0) {
      console.log("ProductCard - Checking if product exists in cart");
      const itemExists = cartItems.find(item => item.product.id === product.id);
      
      if (itemExists) {
        console.log("ProductCard - Product exists in cart, updating quantity to:", newQuantity);
        updateQuantity(product.id, newQuantity);
      } else {
        console.log("ProductCard - Product not in cart, adding with quantity:", newQuantity);
        addToCart(product, newQuantity);
      }
      
      setManualEdit(false); // Reset manual edit mode after applying
      console.log("ProductCard - Manual edit reset to:", false);
    } else {
      // Reset to current quantity if invalid
      setInputValue(quantity.toString());
      console.log("ProductCard - Invalid quantity. Reset to:", quantity);
      toast("Quantidade inválida", {
        description: "Por favor, insira um número maior que zero."
      });
    }
  };

  const handleAddToCart = () => {
    if (!isInStock) {
      toast("Produto indisponível", {
        description: "Este produto está temporariamente fora de estoque."
      });
      return;
    }
    addToCart(product);
  };

  const handleDecreaseQuantity = () => {
    decreaseQuantity(product.id);
  };
  
  // Only show apply button during manual edit AND when value is different
  const showApplyButton = manualEdit && parseInt(inputValue) !== quantity;
  
  console.log("ProductCard Render -", product.name, "- quantity:", quantity, "inputValue:", inputValue, "manualEdit:", manualEdit, "showApplyButton:", showApplyButton);

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative overflow-hidden">
          <ProductImageCarousel 
            images={product.images} 
            productName={product.name} 
            className="aspect-square"
          />
          <div className="absolute top-2 right-2 bg-white text-red-600 font-bold px-2 py-1 rounded-full text-xs">
            {product.category}
          </div>
          {product.featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white font-bold px-2 py-1 rounded-full text-xs">
              Destaque
            </div>
          )}
          {!isInStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-red-600 text-white font-bold px-3 py-2 rounded-md text-sm">
                SEM ESTOQUE
              </div>
            </div>
          )}
          {product.isLaunch && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-green-500 text-white font-bold px-3 py-2 rounded-md text-sm">
              EM BREVE
            </div>
            </div>
          )}
          
        </div>
        <CardContent className="flex-grow pt-4">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-1">{product.packageInfo}</p>
          {product.description && (
            <p className="text-sm text-gray-500 mb-2">{product.description}</p>
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
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver Mais
          </Button>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center">
          {isInStock ? (
            <div className="flex items-center">
              <Button
                onClick={handleDecreaseQuantity}
                variant="outline"
                size="icon"
                className={`rounded-full h-8 w-8 ${quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={quantity === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="mx-2 h-8 w-12 px-2 text-center"
                  inputMode="numeric" 
                  pattern="[0-9]*"
                />
                {showApplyButton && (
                  <Button
                    onClick={handleApplyQuantity}
                    variant="outline"
                    size="sm"
                    className="ml-1 h-8 px-2"
                  >
                    <Check className="h-3 w-3 mr-1" /> Aplicar
                  </Button>
                )}
              </div>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500"
                disabled
              >
                <XCircle className="h-4 w-4 mr-1" /> Indisponível
              </Button>
            </div>
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
