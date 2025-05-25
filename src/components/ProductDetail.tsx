
import React, { useState, useEffect } from 'react';
import { Product } from '@/types/products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductImageCarousel from './ProductImageCarousel';
import { Package, Scale, Plus, Minus, Check, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { toast } from './ui/sonner';

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart, decreaseQuantity, updateQuantity, cartItems } = useCart();
  const { toast: shadcnToast } = useToast();
  
  // Product is in stock by default unless explicitly set to false
  const isInStock = product.inStock !== false;
  
  // Get current quantity from cart
  const currentItem = cartItems.find(item => item.product.id === product.id);
  const quantity = currentItem ? currentItem.quantity : 0;
  
  // Local state for input field value - keep it as a string for better input control
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
    console.log("ProductDetail - Applying quantity: Current input value =", inputValue);
    const newQuantity = parseInt(inputValue) || 0;
    console.log("ProductDetail - Parsed quantity =", newQuantity);
    
    if (newQuantity > 0) {
      console.log("ProductDetail - Checking if product exists in cart");
      const itemExists = cartItems.find(item => item.product.id === product.id);
      
      if (itemExists) {
        console.log("ProductDetail - Product exists in cart, updating quantity to:", newQuantity);
        updateQuantity(product.id, newQuantity);
      } else {
        console.log("ProductDetail - Product not in cart, adding with quantity:", newQuantity);
        addToCart(product, newQuantity);
      }
      
      setManualEdit(false); // Reset manual edit mode after applying
      console.log("ProductDetail - Manual edit reset to:", false);
    } else {
      // Reset to current quantity if invalid
      setInputValue(quantity.toString());
      console.log("ProductDetail - Invalid quantity. Reset to:", quantity);
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
  
  console.log("ProductDetail Render -", product.name, "- quantity:", quantity, "inputValue:", inputValue, "manualEdit:", manualEdit, "showApplyButton:", showApplyButton);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {product.packageInfo}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <ProductImageCarousel 
            images={product.images} 
            productName={product.name} 
            className="aspect-video rounded-lg overflow-hidden"
          />
          {!isInStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-red-600 text-white font-bold px-3 py-2 rounded-md text-sm">
                SEM ESTOQUE
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-4">
          {product.description && (
            <div>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          )}
          
          {product.extraInfo?.usageTips && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Dicas de uso:</h3>
              <p className="text-sm text-gray-600 mt-1">{product.extraInfo.usageTips}</p>
            </div>
          )}
          
          {product.extraInfo?.ingredients && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Ingredientes:</h3>
              <p className="text-sm text-gray-600 mt-1">{product.extraInfo.ingredients}</p>
            </div>
          )}
          
          {product.extraInfo?.funFact && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Você sabia?</h3>
              <p className="text-sm text-gray-600 mt-1">{product.extraInfo.funFact}</p>
            </div>
          )}
          
          {/* If no extraInfo at all, show a message */}
          {!product.extraInfo?.usageTips && 
           !product.extraInfo?.ingredients && 
           !product.extraInfo?.funFact && 
           !product.description && (
            <div>
              <p className="text-sm text-gray-500">Informações adicionais sobre este produto estarão disponíveis em breve.</p>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
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
          
          {!isInStock && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Produto indisponível no momento.</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-red-600">
              R$ {product.price.toFixed(2)}
            </span>
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
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500"
                disabled
              >
                <XCircle className="h-4 w-4 mr-1" /> Indisponível
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
