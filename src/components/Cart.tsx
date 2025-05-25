
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { X, Trash2, Plus, Minus, ShoppingCart, Package, Scale, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { toast } from '@/components/ui/sonner';
import { STORE_WHATSAPP } from '../data/products';
import { MIN_PACKAGES, MIN_WEIGHT_KG } from '@/data/products';
import { Input } from './ui/input';
import CitySelector from './CitySelector';
import { City } from '@/types/products';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from '@/data/shipping';
import NewCustomerForm from './NewCustomerForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";

// Define payment method types
type PaymentMethod = 'card' | 'pix' | 'cash';

// Define cart steps
type CartStep = 'review' | 'payment';

const Cart: React.FC = () => {
  const { 
    cartItems, 
    cartTotal, 
    isCartOpen, 
    closeCart, 
    itemsCount,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    updateQuantity,
    freeShippingRemaining,
    totalWeight,
    packageCount,
    meetsMinimumOrder,
    animateCartIcon
  } = useCart();

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState<boolean | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [currentStep, setCurrentStep] = useState<CartStep>('review');
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    cpf: string;
    address: string;
    zipCode: string;
    referralSource: string;
  } | null>(null);
  
  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen]);
  
  // Get the shipping cost for the selected city
  const shippingCost = selectedCity 
    ? SHIPPING_RATES.find(rate => rate.city === selectedCity)?.cost || 0
    : 0;
  
  // Only apply free shipping if cart total meets or exceeds the free shipping threshold
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const finalShippingCost = isFreeShipping ? 0 : shippingCost;
  const orderTotal = cartTotal + finalShippingCost;

  // New useEffect hook to trigger WhatsApp redirect when customerInfo is updated
  useEffect(() => {
    if (customerInfo) {
      sendToWhatsApp(true); // Send with customer information
    }
  }, [customerInfo]);

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    updateQuantity(productId, quantity);
  };

  const goToNextStep = () => {
    if (!selectedCity) {
      toast.error('Selecione sua cidade', {
        description: 'É necessário selecionar uma cidade para calcular o frete.'
      });
      return;
    }
    setCurrentStep('payment');
  };

  const goToPreviousStep = () => {
    setCurrentStep('review');
  };

  const handleFinalizeOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio!', {
        description: 'Adicione produtos antes de finalizar o pedido.'
      });
      return;
    }

    // Show validation errors when the user tries to finalize the order
    setShowValidationErrors(true);

    if (!meetsMinimumOrder) {
      toast.error('Não atende ao pedido mínimo!', {
        description: `Você precisa ter pelo menos ${MIN_PACKAGES} pacotes diversos ou ${MIN_WEIGHT_KG}kg no total.`
      });
      return;
    }
    
    if (!selectedCity) {
      toast.error('Selecione sua cidade!', {
        description: 'É necessário selecionar uma cidade para calcular o frete.'
      });
      return;
    }
    
    if (!selectedPaymentMethod) {
      toast.error('Selecione uma forma de pagamento!', {
        description: 'É necessário escolher como deseja pagar.'
      });
      return;
    }
    
    // Ask if it's the first purchase only if we don't already know
    if (showNewCustomerForm === null) {
      setShowNewCustomerForm(false); // Show the initial question dialog
      return;
    }
  };
  
  const sendToWhatsApp = (includeCustomerInfo: boolean = false) => {
    // Generate WhatsApp message with order details
    const cartItemsText = cartItems
      .map(item => `${item.quantity}x ${item.product.name} (${item.product.packageInfo}) - R$${(item.product.price * item.quantity).toFixed(2)} - Peso total: ${(item.product.weight * item.quantity).toFixed(2)}kg`)
      .join('\n');

    const shippingText = selectedCity 
      ? `\n\n*Entrega para:* ${selectedCity}` + 
        `\n*Taxa de entrega:* ${isFreeShipping ? 'Grátis' : `R$${finalShippingCost.toFixed(2)}`}`
      : '';
    
    // Add payment method information to the WhatsApp message
    let paymentMethodText = '';
    if (selectedPaymentMethod) {
      const paymentMethodMap: Record<PaymentMethod, string> = {
        card: 'Cartão de crédito/débito',
        pix: 'Pix',
        cash: 'Dinheiro'
      };
      paymentMethodText = `\n*Forma de pagamento:* ${paymentMethodMap[selectedPaymentMethod]}`;
    }

    // Add additional notes if available
    const notesText = additionalNotes ? `\n\n*Observações:* ${additionalNotes}` : '';
    
    let customerInfoText = '';
    if (includeCustomerInfo && customerInfo) {
      customerInfoText = `\n\n*Dados do Cliente:*\n` +
        `Nome: ${customerInfo.name}\n` +
        `CPF: ${customerInfo.cpf}\n` +
        `Endereço: ${customerInfo.address}\n` +
        `CEP: ${customerInfo.zipCode}\n` +
        `Como nos conheceu: ${customerInfo.referralSource}`;
    }

    const message = `*Novo Pedido*\n\n*Produtos:*\n${cartItemsText}` + 
                    shippingText +
                    paymentMethodText +
                    notesText +
                    customerInfoText +
                    `\n\n*Total:* R$${orderTotal.toFixed(2)}`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodedMessage}`, '_blank');
    
    // Close the cart after sending
    closeCart();
  };
  
  const handleNewCustomerFormSubmit = (formData: any) => {
    if (formData === true) {
      // User clicked "Sim" in the first question, show the actual form
      setShowNewCustomerForm(true);
    } else {
      // Form data was submitted from the detailed form
      setCustomerInfo(formData);
      // The useEffect hook will handle the WhatsApp redirect now
    }
  };
  
  const handleExistingCustomer = () => {
    // User clicked "Não", indicating they are a returning customer
    // or clicked "Cancelar" on the form
    setShowNewCustomerForm(null);
    
    // For returning customers or when user cancels form, send to WhatsApp directly without customer info
    sendToWhatsApp(false);
  };

  const renderCartItems = () => (
    <div className="flex-grow overflow-y-auto p-4 overscroll-behavior-contain">
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">Seu carrinho está vazio</p>
          <p className="text-sm">Adicione produtos para continuar</p>
        </div>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.product.id} className="mb-4 bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between">
                <div className="flex flex-grow">
                  {/* Product Image Thumbnail */}
                  <div className="w-12 h-12 mr-3 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                    <img 
                      src={item.product.images[0] || "/placeholder.svg"} 
                      alt={item.product.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">{item.product.packageInfo}</p>
                    <p className="text-red-600 font-semibold">
                      R$ {item.product.price.toFixed(2)}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <p>
                        Peso: {item.product.weight.toFixed(2)}kg × {item.quantity} = {(item.product.weight * item.quantity).toFixed(2)}kg
                      </p>
                      {item.product.isPackage && <p>• Pacote</p>}
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center mt-2">
                <Button
                  onClick={() => decreaseQuantity(item.product.id)}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="text"
                  value={item.quantity.toString()}
                  onChange={(e) => handleQuantityChange(item.product.id, e.target.value)}
                  className="mx-2 h-8 w-12 px-2 text-center"
                />
                <Button
                  onClick={() => addToCart(item.product)}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                <span className="ml-auto font-semibold">
                  R$ {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderOrderRequirements = () => (
    cartItems.length > 0 && (
      <div className="px-4 py-2 bg-gray-50 border-t">
        {/* Updated to combine package count and total weight into a single row */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm font-medium">
                <span className={packageCount >= MIN_PACKAGES ? 'text-green-600 font-bold' : ''}>
                  {packageCount}
                </span>/{MIN_PACKAGES}
              </span>
            </div>
            
            <div className="flex items-center">
              <Scale className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm font-medium">
                <span className={totalWeight >= MIN_WEIGHT_KG ? 'text-green-600 font-bold' : ''}>
                  {totalWeight.toFixed(2)}
                </span>/{MIN_WEIGHT_KG}kg
              </span>
            </div>
          </div>
        </div>
        {!meetsMinimumOrder && (
          <div className="text-amber-600 text-xs font-medium bg-amber-50 p-2 rounded-md mt-1">
            ⚠️ Pedido mínimo: {MIN_PACKAGES} pacotes diversos ou {MIN_WEIGHT_KG}kg no total.
          </div>
        )}
      </div>
    )
  );

  const renderFreeShippingProgress = () => (
    freeShippingRemaining > 0 && cartItems.length > 0 && (
      <div className="px-4 py-2 bg-gray-50">
        <p className="text-sm mb-1">
          Faltam <span className="font-bold text-red-600">R$ {freeShippingRemaining.toFixed(2)}</span> para frete grátis!
        </p>
        <Progress 
          value={(1 - freeShippingRemaining / FREE_SHIPPING_THRESHOLD) * 100} 
          className="h-2 bg-gray-200"
        />
      </div>
    )
  );

  const renderReviewStep = () => (
    <>
      {renderCartItems()}
      
      {renderOrderRequirements()}
      
      {renderFreeShippingProgress()}
      
      {/* City Selector */}
      {cartItems.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Selecione sua cidade:
          </label>
          <CitySelector 
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
          {showValidationErrors && !selectedCity && (
            <p className="text-red-500 text-xs mt-1">
              ⚠️ Cidade é obrigatória
            </p>
          )}
        </div>
      )}
      
      {/* Cart total and next step button */}
      <div className="p-4 border-t">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Subtotal:</span>
          <span className="font-bold">R$ {cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="font-medium">Entrega:</span>
          <span className="font-medium">
            {!selectedCity ? (
              'Selecione sua cidade'
            ) : isFreeShipping ? (
              <span className="text-green-600">Grátis</span>
            ) : (
              `R$ ${finalShippingCost.toFixed(2)}`
            )}
          </span>
        </div>
        <Separator className="mb-4" />
        <div className="flex justify-between mb-4">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-lg font-bold">R$ {orderTotal.toFixed(2)}</span>
        </div>
        <Button 
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
          onClick={goToNextStep}
          disabled={
            !meetsMinimumOrder || 
            cartItems.length === 0 ||
            !selectedCity
          }
        >
          <span>Próximo</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        {cartItems.length > 0 && !meetsMinimumOrder && (
          <p className="text-xs text-center text-amber-600 mt-2">
            ⚠️ Complete o pedido mínimo para continuar
          </p>
        )}
      </div>
    </>
  );

  const renderPaymentStep = () => (
    <>
      <div className="flex-grow overflow-y-auto p-4 overscroll-behavior-contain">
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Detalhes do Pedido</h3>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm">Subtotal ({itemsCount} itens)</span>
              <span className="font-medium">R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Entrega para {selectedCity}</span>
              <span className="font-medium">
                {isFreeShipping ? (
                  <span className="text-green-600">Grátis</span>
                ) : (
                  `R$ ${finalShippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-red-600 font-semibold pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>R$ {orderTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <CreditCard className="h-4 w-4 mr-1 text-gray-500" /> 
              <label className="text-sm font-medium text-gray-600">Como deseja pagar?</label>
            </div>
            
            <Select 
              value={selectedPaymentMethod || ""} 
              onValueChange={(value: PaymentMethod) => setSelectedPaymentMethod(value)}
            >
              <SelectTrigger className="w-full h-10 text-sm">
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Cartão de crédito/débito (maquininha disponível)</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
            
            {showValidationErrors && !selectedPaymentMethod && (
              <p className="text-red-500 text-xs mt-1">
                ⚠️ Forma de pagamento é obrigatória
              </p>
            )}
          </div>
          
          {/* Payment Information Box */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            <p className="font-medium mb-2">💳 O pagamento será feito no momento da entrega.</p>
            <p className="mb-1">Aceitamos:</p>
            <ul className="pl-4 mb-2">
              <li>• Cartão de crédito/débito (máquina disponível)</li>
              <li>• Pix</li>
              <li>• Dinheiro</li>
            </ul>
            <p className="text-xs italic text-gray-500">
              (Caso tenha dúvidas, confirme com nosso atendente no WhatsApp)
            </p>
          </div>
          
          {/* Additional Notes */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Observações adicionais (opcional)
            </label>
            <Textarea 
              placeholder="Ex: instruções para entrega, troco necessário, etc."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full h-24 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Buttons for navigating and finalizing */}
      <div className="p-4 border-t">
        <Button 
          className="w-full bg-red-600 hover:bg-red-700 text-white mb-3"
          size="lg"
          onClick={handleFinalizeOrder}
          disabled={!selectedPaymentMethod}
        >
          Finalizar Pedido
        </Button>
        
        <Button 
          onClick={goToPreviousStep} 
          variant="outline" 
          className="w-full flex justify-center items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Voltar ao Carrinho</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Cart button with badge */}
      <Button 
        onClick={closeCart}
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden bg-white rounded-full shadow-md"
        aria-label="Close cart"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Cart overlay/sidebar */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      <aside 
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 flex flex-col overflow-hidden ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 bg-red-600 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            {currentStep === 'review' ? (
              <>Carrinho ({itemsCount})</>
            ) : (
              <>Finalizar Pedido</>
            )}
          </h2>
          <Button variant="ghost" size="icon" onClick={closeCart} className="text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Wrap content in ScrollArea for better mobile scrolling */}
        <ScrollArea className="flex-grow">
          {/* Render different content based on current step */}
          {currentStep === 'review' ? renderReviewStep() : renderPaymentStep()}
        </ScrollArea>
      </aside>
      
      {/* New customer form dialog */}
      {showNewCustomerForm !== null && (
        <NewCustomerForm
          isOpen={showNewCustomerForm === true}
          onClose={() => setShowNewCustomerForm(null)}
          onSubmit={handleNewCustomerFormSubmit}
          onExistingCustomer={handleExistingCustomer}
        />
      )}
    </>
  );
};

export default Cart;
