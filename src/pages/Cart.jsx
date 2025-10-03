import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Coupon } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, Tag } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (currentUser.cart && currentUser.cart.length > 0) {
        const products = await Product.list();
        const items = currentUser.cart.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return product ? { ...product, quantity: item.quantity } : null;
        }).filter(Boolean);
        
        setCartItems(items);
      }
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const cart = user.cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    await User.updateMyUserData({ cart });
    loadCart();
  };

  const removeItem = async (productId) => {
    const cart = user.cart.filter(item => item.product_id !== productId);
    await User.updateMyUserData({ cart });
    loadCart();
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    const coupons = await Coupon.list();
    const coupon = coupons.find(c => 
      c.code.toLowerCase() === couponCode.toLowerCase() && 
      c.active &&
      (!c.expiration_date || new Date(c.expiration_date) >= new Date()) &&
      (!c.usage_limit || c.times_used < c.usage_limit)
    );

    if (!coupon) {
      alert("Cupom inválido ou expirado");
      return;
    }

    const subtotal = getSubtotal();
    if (coupon.min_purchase && subtotal < coupon.min_purchase) {
      alert(`Compra mínima de R$ ${coupon.min_purchase.toFixed(2)} necessária`);
      return;
    }

    setAppliedCoupon(coupon);
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
    return Math.max(0, getSubtotal() - getDiscount());
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;
    
    const params = new URLSearchParams();
    if (appliedCoupon) {
      params.set("coupon", appliedCoupon.code);
    }
    
    navigate(createPageUrl("Checkout") + (params.toString() ? `?${params.toString()}` : ""));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Carrinho Vazio</h1>
          <p className="text-gray-400 mb-8">Adicione produtos ao carrinho para continuar</p>
          <Button
            onClick={() => navigate(createPageUrl("Catalog"))}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
          >
            Explorar Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Meu Carrinho</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="bg-gray-900 border-yellow-600/20 p-4">
                <div className="flex gap-4">
                  <img
                    src={item.images?.[0] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                    <p className="text-yellow-400 text-sm mb-2">{item.brand}</p>
                    <p className="text-yellow-500 font-bold">R$ {item.price?.toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 999)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="bg-gray-900 border-yellow-600/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>R$ {getSubtotal().toFixed(2)}</span>
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

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={!!appliedCoupon || !couponCode}
                    variant="outline"
                    className="border-yellow-600/50"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  onClick={proceedToCheckout}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-6"
                >
                  Finalizar Compra
                </Button>
              </div>

              <p className="text-gray-400 text-xs text-center mt-4">
                Frete será calculado no checkout
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}