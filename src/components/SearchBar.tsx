
import { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Category } from '@/types/products';
import { Badge } from './ui/badge';
import { normalizeText } from '@/utils/stringUtils';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: Category | 'all';
  setSelectedCategory: (category: Category | 'all') => void;
  categories: Category[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearSearch = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Ordered categories based on sales analysis
  const orderedCategories: (Category | 'all')[] = [
    'all',
    'Pão de Queijo',
    'Salgados Assados',
    'Salgados P/ Fritar',
    'Pães e Massas Doces',
    'Biscoito de Queijo',
    'Salgados Grandes',
    'Alho em creme',
    'Outros'
  ];

  return (
    <div className="sticky top-0 z-20 bg-white pb-2 pt-4 px-4 shadow-sm">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-gray-50 border-gray-200"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {orderedCategories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap ${
              selectedCategory === category 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'Todos' : category}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
