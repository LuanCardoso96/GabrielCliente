import React, { useState, useEffect } from "react";
import { Order, User, Product } from "@/api/entities";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0,
    topProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [showRevenue, setShowRevenue] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load orders
      const orders = await Order.getAll();
      
      // Load customers
      const customers = await User.getAll();
      
      // Load products
      const products = await Product.getAll();

      // Calculate stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalCustomers = customers.length;
      const totalProducts = products.length;

      // Calculate monthly stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Get top products
      const productSales = {};
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            if (item.productId) {
              productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
            }
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, sales]) => {
          const product = products.find(p => p.id === productId);
          return {
            id: productId,
            name: product?.name || 'Produto não encontrado',
            sales
          };
        });

      // Get recent orders
      const recentOrders = orders.slice(0, 10).map(order => ({
        id: order.id,
        customerName: order.customerName || 'Cliente não informado',
        total: order.total || 0,
        status: order.status || 'pending',
        createdAt: order.createdAt
      }));

      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        monthlyRevenue,
        monthlyOrders: monthlyOrders.length,
        topProducts,
        recentOrders
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-yellow-400 text-xl">Carregando dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-400">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
            <p className="text-xs text-gray-400">
              {stats.monthlyOrders} este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Receita Total</CardTitle>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRevenue(!showRevenue)}
                className="h-6 w-6 p-0"
              >
                {showRevenue ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {showRevenue ? formatCurrency(stats.totalRevenue) : '••••••'}
            </div>
            <p className="text-xs text-gray-400">
              {showRevenue ? formatCurrency(stats.monthlyRevenue) : '••••••'} este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-400">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
            <p className="text-xs text-gray-400">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Produtos Mais Vendidos</CardTitle>
            <CardDescription className="text-gray-400">
              Top 5 produtos por quantidade vendida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-gray-400 text-sm">{product.sales} vendas</p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <p className="text-gray-400 text-center py-4">Nenhum produto vendido ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Pedidos Recentes</CardTitle>
            <CardDescription className="text-gray-400">
              Últimos 10 pedidos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{order.customerName}</p>
                    <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(order.total)}</p>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && (
                <p className="text-gray-400 text-center py-4">Nenhum pedido encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}