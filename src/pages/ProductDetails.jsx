import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ChevronLeft, ChevronRight, Package, Truck } from "lucide-react";

export default function ProductDetails() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
      navigate(createPageUrl("Home"));
      return;
    }

    const products = await Product.list();
    const foundProduct = products.find(p => p.id === productId);
    
    if (!foundProduct) {
      navigate(createPageUrl("Home"));
      return;
    }

    setProduct(foundProduct);

    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = async () => {
    if (!user) {
      User.login();
      return;
    }

    const cart = user.cart || [];
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product_id: product.id, quantity });
    }

    await User.updateMyUserData({ cart });
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (product?.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
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
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-400 hover:text-yellow-400"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Card className="bg-gray-900 border-yellow-600/20 overflow-hidden">
              <div className="relative h-96 md:h-[600px]">
                <img
                  src={product.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {product.images?.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-yellow-600/20 hover:bg-yellow-600"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-yellow-600/20 hover:bg-yellow-600"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
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

          <div className="space-y-6">
            {product.featured && (
              <Badge className="bg-yellow-600 text-black">Destaque</Badge>
            )}

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {product.name}
              </h1>
              <p className="text-yellow-400 text-xl">{product.brand}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-yellow-500">
                R$ {product.price?.toFixed(2)}
              </span>
              {product.volume && (
                <span className="text-gray-400">{product.volume}</span>
              )}
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
              <p className="text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            {product.notes && (
              <div className="border-t border-yellow-600/20 pt-6">
                <h3 className="text-white font-semibold mb-2">Notas Olfativas</h3>
                <p className="text-gray-400">{product.notes}</p>
              </div>
            )}

            {product.category && (
              <div className="border-t border-yellow-600/20 pt-6">
                <h3 className="text-white font-semibold mb-2">Categoria</h3>
                <Badge variant="outline" className="border-yellow-600/50 text-yellow-400">
                  {product.category}
                </Badge>
              </div>
            )}

            <div className="border-t border-yellow-600/20 pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-white font-semibold">Quantidade:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="border-yellow-600/50"
                  >
                    -
                  </Button>
                  <span className="text-white w-12 text-center">{quantity}</span>
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

              <Button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-6 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-600/20">
              <div className="flex items-center gap-3 text-gray-400">
                <Truck className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-white font-medium">Frete Calculado no Checkout</p>
                  <p className="text-sm">Enviamos para todo o Brasil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}