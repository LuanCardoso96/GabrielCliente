import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { Product } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertCircle } from "lucide-react";
import moment from "moment";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
    lowStockProducts: []
  });

  const checkAdmin = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.email !== "dsconstrucoesdev@gmail.com") {
        navigate(createPageUrl("Home"));
        return;
      }
      await loadDashboardData();
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  }, [navigate]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const loadDashboardData = async () => {
    const orders = await Order.list("-created_date");
    const products = await Product.list();
    const users = await User.list();

    const totalRevenue = orders
      .filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const lowStockProducts = products.filter(p => (p.stock || 0) < 5);

    setStats({
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: users.length,
      recentOrders: orders.slice(0, 5),
      lowStockProducts
    });

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
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral do seu e-commerce</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-yellow-600/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Faturamento Total</CardTitle>
            <DollarSign className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Vendas confirmadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total de Pedidos</CardTitle>
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
            <p className="text-xs text-gray-400 mt-1">Todos os pedidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Produtos</CardTitle>
            <Package className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
            <p className="text-xs text-gray-400 mt-1">No catálogo</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Clientes</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-400 mt-1">Cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-yellow-600/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum pedido ainda</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">#{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-400">{order.customer_email}</p>
                      <p className="text-xs text-gray-500">{moment(order.created_date).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-500 font-bold">R$ {order.total_amount.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockProducts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Todos os produtos com estoque adequado</p>
              ) : (
                stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-sm text-gray-400">{product.brand}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-bold">{product.stock || 0} un.</span>
                      <p className="text-xs text-gray-500">Estoque baixo</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}