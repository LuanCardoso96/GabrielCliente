import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Product } from "@/api/entities";
import { calculateShipping } from "@/api/functions";
import { calculateShippingWithSuperFrete } from "@/api/superfrete";
import { initiateCheckout } from "@/api/stripe";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Truck, 
  CreditCard,
  MapPin,
  Calculator
} from "lucide-react";

export default function ProductDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    cep: "",
    city: "",
    state: ""
  });
  const [shippingQuotes, setShippingQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const productId = searchParams.get("id");
      
      if (!productId) {
        navigate("/");
        return;
      }

      const foundProduct = await Product.getById(productId);
      
      if (!foundProduct) {
        navigate("/");
        return;
      }

      setProduct(foundProduct);
    } catch (error) {
      console.error('Error loading product:', error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingCost = async () => {
    if (!shippingAddress.cep || !product) {
      return;
    }

    setCalculatingShipping(true);
    try {
      const items = [{
        productId: product.id,
        quantity: quantity,
        weight: 0.5 // Default weight in kg
      }];

      const result = await calculateShipping(shippingAddress, items);
      setShippingQuotes(result.quotes || []);
      
      // Auto-select cheapest quote
      if (result.quotes && result.quotes.length > 0) {
        const cheapest = result.quotes
          .filter(quote => !quote.has_error && quote.price)
          .sort((a, b) => (a.price || 0) - (b.price || 0))[0];
        setSelectedQuote(cheapest);
      }
    } catch (uploadError) {
      console.error('Error calculating shipping:', uploadError);
    } finally {
      setCalculatingShipping(false);
    }
  };

  useEffect(() => {
    if (shippingAddress.cep && product) {
      const timeoutId = setTimeout(calculateShippingCost, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [shippingAddress, quantity, product]);

  const handleAddToCart = async () => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', { product, quantity });
  };

  const handleFinalizePurchase = async () => {
    if (!currentUser) {
      navigate('/Auth');
      return;
    }

    if (!selectedQuote) {
      alert('Por favor, selecione uma opção de frete');
      return;
    }

    setProcessingPayment(true);
    try {
      await initiateCheckout(product, quantity, selectedQuote, currentUser);
    } catch (error) {
      console.error('Error finalizing purchase:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBuyNow = async () => {
    // TODO: Implement direct purchase
    console.log('Buying now:', { product, quantity, shippingCost });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalPrice = product ? (product.price * quantity) + (selectedQuote?.price || 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Produto não encontrado</div>
      </div>
    );
  }

  // Create array of images (for now, just use the main image)
  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-400 hover:text-yellow-400"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="bg-gray-900 border-yellow-600/20 overflow-hidden">
              <div className="relative h-96 md:h-[600px]">
                <img
                  src={images[currentImageIndex] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-yellow-600/20 hover:bg-yellow-600"
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-yellow-600/20 hover:bg-yellow-600"
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-yellow-500"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {product.name}
              </h1>
              <p className="text-yellow-400 text-xl">{product.category}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-yellow-500">
                {formatCurrency(product.price)}
              </span>
            </div>

            {product.stock > 0 ? (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <Package className="w-4 h-4 mr-2" />
                {product.stock} unidades disponíveis
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-500">
                Esgotado
              </Badge>
            )}

            <div className="border-t border-yellow-600/20 pt-6">
              <h3 className="text-white font-semibold mb-2">Descrição</h3>
              <p className="text-gray-400 leading-relaxed">
                {product.description || "Descrição não disponível."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="border-t border-yellow-600/20 pt-6">
              <Label className="text-white font-semibold mb-4 block">Quantidade:</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="border-yellow-600/50"
                >
                  -
                </Button>
                <span className="text-white w-12 text-center text-lg font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                  disabled={quantity >= (product.stock || 999)}
                  className="border-yellow-600/50"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Shipping Calculator */}
            <Card className="bg-gray-900 border-yellow-600/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Calcular Frete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="cep" className="text-gray-300 text-sm">CEP</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={shippingAddress.cep}
                      onChange={(e) => setShippingAddress({...shippingAddress, cep: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-gray-300 text-sm">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="Cidade"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-300 text-sm">Estado</Label>
                    <Input
                      id="state"
                      placeholder="UF"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                {calculatingShipping && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                    Calculando frete...
                  </div>
                )}
                
                {shippingQuotes.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Opções de Frete:</Label>
                    {shippingQuotes.map((quote, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedQuote?.id === quote.id
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedQuote(quote)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">
                              {quote.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {quote.company?.name || 'Transportadora'}
                            </p>
                            {quote.delivery_time && (
                              <p className="text-gray-400 text-xs">
                                {quote.delivery_time} dia(s)
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {quote.has_error ? (
                              <p className="text-red-400 text-sm">{quote.error}</p>
                            ) : (
                              <p className="text-yellow-400 font-semibold">
                                {formatCurrency(quote.price || 0)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Summary */}
            <Card className="bg-gray-900 border-yellow-600/20">
              <CardHeader>
                <CardTitle className="text-white">Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {product.name} x{quantity}
                  </span>
                  <span className="text-white">
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>
                
                {selectedQuote && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Frete:</span>
                    <span className="text-white">{formatCurrency(selectedQuote.price || 0)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">Total:</span>
                    <span className="text-yellow-400 font-bold text-xl">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleFinalizePurchase}
                disabled={product.stock === 0 || !selectedQuote || processingPayment}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-6 text-lg"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Finalizar Compra
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !selectedQuote}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-6 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {!selectedQuote ? 'Selecione uma opção de frete' : 'Adicionar ao Carrinho'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}