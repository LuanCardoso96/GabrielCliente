import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Tag, TrendingUp } from "lucide-react";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const checkAdmin = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.email !== "dsconstrucoesdev@gmail.com") {
        navigate(createPageUrl("Home"));
        return;
      }
      await loadCategories();
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  }, [navigate]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const loadCategories = async () => {
    const products = await Product.list();
    
    const categoriesData = [
      {
        name: 'Masculino',
        value: 'masculino',
        count: products.filter(p => p.category === 'masculino').length,
        totalValue: products.filter(p => p.category === 'masculino').reduce((sum, p) => sum + (p.price || 0), 0)
      },
      {
        name: 'Feminino',
        value: 'feminino',
        count: products.filter(p => p.category === 'feminino').length,
        totalValue: products.filter(p => p.category === 'feminino').reduce((sum, p) => sum + (p.price || 0), 0)
      },
      {
        name: 'Unissex',
        value: 'unissex',
        count: products.filter(p => p.category === 'unissex').length,
        totalValue: products.filter(p => p.category === 'unissex').reduce((sum, p) => sum + (p.price || 0), 0)
      }
    ];

    setCategories(categoriesData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Categorias</h1>
        <p className="text-gray-400">Visão geral das categorias de produtos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.value} className="bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-600/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-600/20 p-3 rounded-lg">
                <Tag className="w-6 h-6 text-yellow-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Produtos</span>
                <span className="text-white font-semibold">{category.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valor Total</span>
                <span className="text-yellow-500 font-bold">R$ {category.totalValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-yellow-600/20">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600"
                  style={{ width: `${(category.count / Math.max(...categories.map(c => c.count)) * 100)}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-900 border-yellow-600/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Informações</h2>
        <p className="text-gray-400 mb-4">
          As categorias ajudam os clientes a encontrar perfumes adequados ao seu perfil. 
          Mantenha o catálogo organizado com produtos bem categorizados.
        </p>
        <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            💡 Dica: Produtos bem categorizados têm 40% mais chance de serem vendidos!
          </p>
        </div>
      </Card>
    </div>
  );
}