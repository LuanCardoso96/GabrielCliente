import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Coupon } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { calculateShipping } from "@/api/functions";
import { createCheckoutSession } from "@/api/functions";

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const calculateShippingCost = useCallback(async (zipCode) => {
    if (!zipCode || zipCode.replace(/\D/g, '').length !== 8) return;

    try {
      const totalWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 500), 0);
      const response = await calculateShipping({ zipCode, weight: totalWeight });
      
      if (response.data.success) {
        setShippingCost(response.data.shippingCost);
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
    }
  }, [cartItems]);

  const loadCheckoutData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (!currentUser.cart || currentUser.cart.length === 0) {
        navigate(createPageUrl("Cart"));
        return;
      }

      const products = await Product.list();
      const items = currentUser.cart.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return product ? { ...product, quantity: item.quantity } : null;
      }).filter(Boolean);
      
      setCartItems(items);

      if (currentUser.shipping_address) {
        setAddress(currentUser.shipping_address);
        await calculateShippingCost(currentUser.shipping_address.zip_code);
      }

      const urlParams = new URLSearchParams(window.location.search);
      const couponCode = urlParams.get("coupon");
      if (couponCode) {
        const coupons = await Coupon.list();
        const coupon = coupons.find(c => c.code === couponCode);
        if (coupon) setAppliedCoupon(coupon);
      }

      setLoading(false);
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  }, [navigate, calculateShippingCost]);

  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  const handleAddressChange = (field, value) => {
    const newAddress = { ...address, [field]: value };
    setAddress(newAddress);

    if (field === 'zip_code' && value.replace(/\D/g, '').length === 8) {
      calculateShippingCost(value);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = getSubtotal();
    if (appliedCoupon.discount_type === "percentage") {
      return (subtotal * appliedCoupon.discount_value) / 100;
    }
    return appliedCoupon.discount_value;
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount() + shippingCost);
  };

  const handleCheckout = async () => {
    if (!address.zip_code || !address.street || !address.number || !address.city || !address.state) {
      alert('Por favor, preencha todos os campos obrigatórios do endereço');
      return;
    }

    setProcessing(true);

    try {
      await User.updateMyUserData({ shipping_address: address });

      const response = await createCheckoutSession({
        items: cartItems,
        shippingCost,
        discount: getDiscount(),
        couponCode: appliedCoupon?.code,
        shippingAddress: address
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      alert('Erro ao processar pagamento. Tente novamente.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Finalizar Compra</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900 border-yellow-600/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Endereço de Entrega</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-white">CEP *</Label>
                  <Input
                    value={address.zip_code}
                    onChange={(e) => handleAddressChange('zip_code', e.target.value)}
                    placeholder="00000-000"
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Rua *</Label>
                  <Input
                    value={address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Nome da rua"
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Número *</Label>
                  <Input
                    value={address.number}
                    onChange={(e) => handleAddressChange('number', e.target.value)}
                    placeholder="123"
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Complemento</Label>
                  <Input
                    value={address.complement}
                    onChange={(e) => handleAddressChange('complement', e.target.value)}
                    placeholder="Apto, bloco, etc"
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Bairro *</Label>
                  <Input
                    value={address.neighborhood}
                    onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                    placeholder="Nome do bairro"
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Cidade *</Label>
                  <Input
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Nome da cidade"
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Estado *</Label>
                  <Input
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900 border-yellow-600/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Resumo dos Produtos</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-300">
                    <span>{item.name} x {item.quantity}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-900 border-yellow-600/20 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>R$ {getSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Frete</span>
                  <span>{shippingCost > 0 ? `R$ ${shippingCost.toFixed(2)}` : 'Calcular'}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Desconto ({appliedCoupon.code})</span>
                    <span>- R$ {getDiscount().toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-yellow-600/20 pt-3 flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span className="text-yellow-500">R$ {getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing || shippingCost === 0}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-6"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Pagar com Stripe'
                )}
              </Button>

              <p className="text-gray-400 text-xs text-center mt-4">
                Pagamento seguro processado pelo Stripe
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}