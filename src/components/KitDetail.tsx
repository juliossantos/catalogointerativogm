
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from './ui/button';
import { Kit } from '@/types/products';
import { getKitDetails } from '@/data/kits';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface KitDetailProps {
  kit: Kit | null;
  isOpen: boolean;
  onClose: () => void;
}

const KitDetail: React.FC<KitDetailProps> = ({
  kit,
  isOpen,
  onClose,
}) => {
  const { addMultipleToCart } = useCart();
  const { toast } = useToast();
  
  if (!kit) return null;
  
  const kitDetails = getKitDetails(kit.id);
  
  if (!kitDetails) {
    return null;
  }
  
  const handleAddKit = () => {
    if (kitDetails.items.every(item => item.product)) {
      // Add all kit items to cart
      addMultipleToCart(kitDetails.items);
      
      // Show toast notification
      toast({
        title: "Kit adicionado!",
        description: `${kit.name} foi adicionado ao carrinho.`,
        duration: 3000,
      });
      
      onClose();
    } else {
      // Show error if any product is missing
      toast({
        title: "Erro ao adicionar kit",
        description: "Alguns produtos deste kit não estão disponíveis.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{kit.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={kit.image || '/placeholder.svg'}
              alt={kit.name}
              className="object-cover w-full h-full"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-4">{kit.description}</p>
          
          <h3 className="text-sm font-medium text-gray-700 mb-2">Este kit contém:</h3>
          <div className="bg-gray-50 rounded-md p-3">
            <ul className="text-sm space-y-2">
              {kitDetails.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <div className="flex items-center">
                    {item.product?.images && item.product.images[0] && (
                      <div className="w-8 h-8 mr-2 rounded overflow-hidden bg-white">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                        />
                      </div>
                    )}
                    <span>
                      {item.quantity}x {item.product?.name || 'Produto não encontrado'}
                    </span>
                  </div>
                  <span className="font-medium">R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-red-600">R$ {kitDetails.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-2"
          >
            <X className="mr-1 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            variant="default"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleAddKit}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            Adicionar ao Carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KitDetail;
