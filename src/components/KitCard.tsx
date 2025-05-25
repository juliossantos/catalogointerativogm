
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Kit } from '@/types/products';
import { getKitDetails } from '@/data/kits';
import { ShoppingCart, Package, Scale, Eye } from 'lucide-react';
import KitDetail from './KitDetail';

interface KitCardProps {
  kit: Kit;
}

const KitCard: React.FC<KitCardProps> = ({ kit }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const kitDetails = getKitDetails(kit.id);

  if (!kitDetails) return null;

  // Count how many items are packages
  const packageCount = kitDetails.items.reduce((count, item) => {
    if (item.product?.isPackage) {
      return count + item.quantity;
    }
    return count;
  }, 0);

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={kit.image || '/placeholder.svg'}
            alt={kit.name}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">{kit.name}</CardTitle>
          <CardDescription>{kit.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow pb-0">
          <p className="text-sm text-gray-500 mb-2">Contém {kitDetails.items.length} produtos:</p>
          <ul className="text-sm list-disc pl-5 text-gray-700">
            {kitDetails.items.slice(0, 3).map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.product?.name || 'Produto não encontrado'}
              </li>
            ))}
            {kitDetails.items.length > 3 && (
              <li>+ {kitDetails.items.length - 3} produtos</li>
            )}
          </ul>
          
          <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              <span>{packageCount}</span>
            </div>
            <div className="flex items-center">
              <Scale className="h-3 w-3 mr-1" />
              <span>{kitDetails.totalWeight.toFixed(2)}kg</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <div className="w-full flex items-center justify-between">
            <span className="font-bold text-red-600 text-xl">
              R$ {kitDetails.totalPrice.toFixed(2)}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailOpen(true)}
                className="px-3"
              >
                <Eye className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Ver Mais</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700 px-3"
                onClick={() => setIsDetailOpen(true)}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Adicionar</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <KitDetail 
        kit={kit} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </>
  );
};

export default KitCard;
