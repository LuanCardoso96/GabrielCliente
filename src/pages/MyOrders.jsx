import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Order } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, RefreshCw } from "lucide-react";

export default function MyOrders() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!currentUser) {
      navigate('/Auth');
      return;
    }

    try {
      setLoading(true);
      const allOrders = await Order.getAll();
      // Filter orders by current user's email
      const userOrders = allOrders.filter(order => 
        order.customerEmail === currentUser.email || 
        order.customer_email === currentUser.email
      );
      
      // Sort by creation date (newest first)
      userOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.created_date);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.created_date);
        return dateB - dateA;
      });
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'Data não disponível';
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'processing': 'Em Processamento',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
      'complete': 'Concluído'
    };
    return statusMap[status] || status;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400 mb-4">Você precisa estar logado para ver seus pedidos</p>
          <Button onClick={() => navigate('/Auth')} className="bg-yellow-600 hover:bg-yellow-700 text-black">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Meus Pedidos</h1>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600 hover:text-black"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </>
            )}
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-gray-900 border-yellow-600/20 p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Nenhum pedido ainda</h2>
            <p className="text-gray-400 mb-6">Faça seu primeiro pedido na nossa loja!</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
            >
              Começar a Comprar
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-gray-900 border-yellow-600/20 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle className="text-white text-lg mb-1">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <p className="text-gray-400 text-sm">
                        {formatDate(order.createdAt || order.created_date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`${getStatusColor(order.status)} h-fit flex items-center gap-2`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-yellow-400"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold text-sm">Itens do Pedido:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3">
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.name || item.product_name}</p>
                            <p className="text-gray-400 text-sm">Quantidade: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-semibold">
                              {formatCurrency((item.price || item.amount) * (item.quantity || 1))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t border-yellow-600/20 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-gray-300">
                        {formatCurrency((order.amountTotal || order.total_amount || 0) - (order.shippingAmount || order.shipping_cost || 0))}
                      </span>
                    </div>

                    {(order.shippingAmount || order.shipping_cost) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Frete</span>
                        <span className="text-gray-300">{formatCurrency(order.shippingAmount || order.shipping_cost)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-yellow-500">{formatCurrency(order.amountTotal || order.total_amount || 0)}</span>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {order.shippingDetails && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-yellow-500" />
                        Informações de Envio
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Nome:</span>
                          <span className="text-white ml-2">{order.shippingDetails.name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Telefone:</span>
                          <span className="text-white ml-2">{order.shippingDetails.phone || 'N/A'}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Endereço:</span>
                          <span className="text-white ml-2">
                            {order.shippingDetails.address?.line1 || 'N/A'}
                            {order.shippingDetails.address?.line2 && `, ${order.shippingDetails.address.line2}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Cidade:</span>
                          <span className="text-white ml-2">{order.shippingDetails.address?.city || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">CEP:</span>
                          <span className="text-white ml-2">{order.shippingDetails.address?.postal_code || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Informações de Pagamento
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 ml-2">{getStatusText(order.status)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Método:</span>
                        <span className="text-white ml-2">Cartão de Crédito</span>
                      </div>
                      {order.stripeSessionId && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400">ID da Sessão:</span>
                          <span className="text-white ml-2 font-mono text-xs">{order.stripeSessionId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}