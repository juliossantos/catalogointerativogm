import React, { useState, useEffect } from 'react';
import { CartProvider } from '../contexts/CartContext';
import { PRODUCTS, CATEGORIES, TOP_SELLING_PRODUCTS, ORDERED_CATEGORIES } from '../data/products';
import { Category, Product } from '../types/products';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import Cart from '../components/Cart';
import CartToggle from '../components/CartToggle';
import { normalizeText } from '@/utils/stringUtils';
import { KITS } from '@/data/kits';
import KitCard from '@/components/KitCard';
import FeaturedProducts from '@/components/FeaturedProducts';
import { FEATURED_PRODUCTS, WEEKLY_TOP } from '@/data/featured';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Wallet, DollarSign } from "lucide-react";
import { useCart } from '@/contexts/CartContext';

// PaymentMethodsSection component removed as per RF049

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  const [championsProducts, setChampionsProducts] = useState<Product[]>([]);

  // Get champions products in the exact order specified
  useEffect(() => {
    // Create a map for O(1) lookups
    const productMap = new Map(
      PRODUCTS.map(product => [normalizeText(product.name), product])
    );
    
    // Get products in the specified order
    const champions = TOP_SELLING_PRODUCTS
      .map(name => {
        // Try to find an exact match first
        const normalizedName = normalizeText(name);
        let product = productMap.get(normalizedName);
        
        // If no exact match, try to find a product that includes the name
        if (!product) {
          product = PRODUCTS.find(p => 
            normalizeText(p.name).includes(normalizedName)
          );
        }
        
        return product;
      })
      .filter((product): product is Product => !!product); // Filter out undefined products
    
    setChampionsProducts(champions);
  }, []);

  // Filter products based on search term and selected category
  useEffect(() => {
    // Using the global search approach
    let result = PRODUCTS;
    
    // When search term exists, filter products globally regardless of category
    if (searchTerm) {
      const normalizedTerm = normalizeText(searchTerm);
      result = PRODUCTS.filter(product => 
        normalizeText(product.name).includes(normalizedTerm) || 
        (product.description && normalizeText(product.description).includes(normalizedTerm)) ||
        product.id.toLowerCase().includes(normalizedTerm) // Also search by code
      );
    }
    // Only apply category filter if not searching
    else if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Sort products - prioritize champions within their categories
    result = [...result].sort((a, b) => {
      const aIndex = TOP_SELLING_PRODUCTS.findIndex(name => 
        normalizeText(a.name).includes(normalizeText(name))
      );
      const bIndex = TOP_SELLING_PRODUCTS.findIndex(name => 
        normalizeText(b.name).includes(normalizeText(name))
      );
      
      // If both products are in TOP_SELLING_PRODUCTS, sort by their indices
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one product is in TOP_SELLING_PRODUCTS, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Otherwise, maintain original order
      return 0;
    });
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory]);

  // Only show featured products if on "all" category and not searching
  const shouldShowFeatured = selectedCategory === 'all' && !searchTerm;
  
  // If there's an active search, we'll show a special heading
  const isSearching = searchTerm !== '';

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-red-600 text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center font-fredoka tracking-wide ">GOSTINHO MINEIRO </h1>
            <p className="text-center opacity-90 italic font-roboto ">Os melhores produtos da região</p>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto pb-24">
          {/* Search and Filter */}
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={ORDERED_CATEGORIES}
          />
          
          {/* Champions Products Section - Only show on homepage (all category), hide during search */}
          <FeaturedProducts 
            title="🏆 Produtos Campeões de Vendas" 
            products={championsProducts}
            description="Os produtos mais vendidos em 2025"
            showFeatured={shouldShowFeatured}
            autoplay={true} // Enable autoplay for champions products
          />
          
          {/* Weekly Top Products - regular featured products */}
          {/* <FeaturedProducts 
            title="Destaques da Semana" 
            products={WEEKLY_TOP}
            description="Os produtos mais pedidos pelos nossos clientes"
            showFeatured={shouldShowFeatured}
            autoplay={false} // No autoplay for weekly top products
          /> */}
          
          {/* Kits Section - Only show when on "all" and not searching */}
          {selectedCategory === 'all' && !searchTerm && KITS.length > 0 && (
            <div className="mt-6 px-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Kits e Combos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {KITS.map(kit => (
                  <KitCard key={kit.id} kit={kit} />
                ))}
              </div>
            </div>
          )}
          
          {/* Show divider if both kits and products are displayed */}
          {selectedCategory === 'all' && 
           filteredProducts.length > 0 && !searchTerm && KITS.length > 0 && (
            <div className="border-t my-8 mx-4"></div>
          )}
          
          {/* Products Grid */}
          <div className="p-4">
            {/* Título da seção de produtos */}
            {isSearching ? (
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Resultados da busca para: "{searchTerm}"
              </h2>
            ) : selectedCategory === 'all' && !searchTerm ? (
              <h2 className="text-xl font-bold mb-4 text-gray-800">Produtos</h2>
            ) : (
              <h2 className="text-xl font-bold mb-4 text-gray-800">{selectedCategory}</h2>
            )}
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-gray-500">Nenhum produto encontrado</h2>
                <p className="text-gray-400 mt-2">Tente uma busca diferente ou outra categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </main>
        
        {/* Footer with Payment Methods Reminder */}
        <footer className="bg-gray-100 py-6 border-t">
          <div className="container mx-auto px-4">
            {/* <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="text-center md:text-left">
                <p className="text-gray-800 font-medium">💳 Pagamento feito na entrega</p>
                <p className="text-sm text-gray-500">Dinheiro ou cartão (crédito/débito)</p>
              </div>
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-gray-600" />
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
            </div>
             */}
          </div>
            <div className="border-t pt-4 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} Catálogo Interativo. Todos os direitos reservados.</p>
              <p className="text-sm mt-1 text-gray-400">Desenvolvido por Mateus Borges</p>
            </div>
        </footer>
        
        {/* Cart Toggle Button */}
        <CartToggle />
        
        {/* Cart Sidebar */}
        <Cart />

        {/* Removed the FreeShippingAnimation component */}
      </div>
    </CartProvider>
  );
};

export default Index;
