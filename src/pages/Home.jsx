import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Product } from "@/api/entities";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductCard from "../components/products/ProductCard";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % Math.max(featuredProducts.length, 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredProducts]);

  const loadProducts = async () => {
    const products = await Product.list("-created_date");
    setAllProducts(products);
    setFeaturedProducts(products.filter(p => p.featured).slice(0, 3));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(featuredProducts.length, 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % Math.max(featuredProducts.length, 1));
  };

  return (
    <div className="bg-black min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
        
        <div className="absolute inset-0">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={product.images?.[0] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200"}
                alt={product.name}
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          ))}
        </div>

        <div className="relative z-20 text-center px-4">
          <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-6 animate-pulse">
            Imperium 7
          </h1>
          <p className="text-white text-xl md:text-3xl font-light tracking-wider mb-8">
            A Essência do Luxo
          </p>
          <Link to={createPageUrl("Catalog")}>
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-6 text-lg">
              Explorar Coleção
            </Button>
          </Link>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Destaques da Coleção
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 mx-auto" />
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="min-w-full px-4">
                      <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-600/20 overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-8 p-8">
                          <div className="relative h-96 rounded-xl overflow-hidden">
                            <img
                              src={product.images?.[0] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              <span className="bg-yellow-600 text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Destaque
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-center">
                            <h3 className="text-3xl font-bold text-white mb-2">{product.name}</h3>
                            <p className="text-yellow-400 text-xl mb-4">{product.brand}</p>
                            <p className="text-gray-400 mb-6 line-clamp-4">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-4xl font-bold text-yellow-500">
                                R$ {product.price?.toFixed(2)}
                              </span>
                              <Link to={createPageUrl(`ProductDetails?id=${product.id}`)}>
                                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold">
                                  Ver Detalhes
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {featuredProducts.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-yellow-600/20 hover:bg-yellow-600 hover:border-yellow-600"
                    onClick={prevSlide}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-yellow-600/20 hover:bg-yellow-600 hover:border-yellow-600"
                    onClick={nextSlide}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </Button>

                  <div className="flex justify-center mt-6 gap-2">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentSlide 
                            ? "bg-yellow-500 w-8" 
                            : "bg-gray-600 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nossa Coleção
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {allProducts.length > 8 && (
            <div className="text-center mt-12">
              <Link to={createPageUrl("Catalog")}>
                <Button 
                  variant="outline" 
                  className="border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black"
                >
                  Ver Todos os Produtos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Perfumes que Contam Histórias
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                Cada fragrância da Imperium 7 é uma obra-prima cuidadosamente elaborada, 
                combinando ingredientes raros e técnicas ancestrais de perfumaria.
              </p>
              <p className="text-gray-400 text-lg">
                Deixe sua essência falar por você com nossos perfumes exclusivos 
                que transcendem o tempo e definem personalidade.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800"
                alt="Luxury Perfumes"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}