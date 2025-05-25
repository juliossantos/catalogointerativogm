
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { City, ShippingRate } from '@/types/products';
import { SHIPPING_RATES } from '@/data/shipping';

interface CitySelectorProps {
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onSelectCity
}) => {
  return (
    <div className="w-full">
      <Select value={selectedCity || undefined} onValueChange={(value) => onSelectCity(value as City)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione sua cidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {SHIPPING_RATES.map((rate) => (
              <SelectItem key={rate.city} value={rate.city}>
                {rate.city} - R$ {rate.cost.toFixed(2)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySelector;
