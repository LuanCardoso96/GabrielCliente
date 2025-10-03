import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import moment from "moment";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.email !== "dsconstrucoesdev@gmail.com") {
        navigate(createPageUrl("Home"));
        return;
      }
      await loadOrders();
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  }, [navigate]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const loadOrders = async () => {
    const data = await Order.list("-created_date");
    setOrders(data);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await Order.update(orderId, { status: newStatus });
    loadOrders();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'processing': 'Processando',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
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
        <h1 className="text-4xl font-bold text-white mb-2">Pedidos</h1>
        <p className="text-gray-400">Gerencie todos os pedidos da loja</p>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-gray-900 border-yellow-600/20 p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum pedido ainda</h3>
          <p className="text-gray-400">Os pedidos aparecerão aqui quando forem realizados</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="bg-gray-900 border-yellow-600/20 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">
                    Pedido #{order.id.slice(-8)}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {moment(order.created_date).format('DD/MM/YYYY HH:mm')}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Cliente: {order.customer_name || order.customer_email}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={`${getStatusColor(order.status)} flex items-center gap-2 px-4 py-2`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </Badge>

                  <Select 
                    value={order.status} 
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-48 bg-gray-800 border-yellow-600/20 text-white">
                      <SelectValue placeholder="Mudar status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-yellow-600/20">
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Produtos</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between bg-gray-800/50 p-3 rounded">
                        <span className="text-gray-300">{item.product_name} x {item.quantity}</span>
                        <span className="text-yellow-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-yellow-600/20 space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>R$ {(order.total_amount - (order.shipping_cost || 0) + (order.discount || 0)).toFixed(2)}</span>
                    </div>
                    {order.shipping_cost > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Frete</span>
                        <span>R$ {order.shipping_cost.toFixed(2)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Desconto</span>
                        <span>- R$ {order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-yellow-600/20">
                      <span>Total</span>
                      <span className="text-yellow-500">R$ {order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {order.shipping_address && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Endereço de Entrega</h4>
                    <div className="bg-gray-800/50 p-4 rounded">
                      <p className="text-gray-300">
                        {order.shipping_address.street}, {order.shipping_address.number}
                        {order.shipping_address.complement && `, ${order.shipping_address.complement}`}
                      </p>
                      <p className="text-gray-300">
                        {order.shipping_address.neighborhood}
                      </p>
                      <p className="text-gray-300">
                        {order.shipping_address.city} - {order.shipping_address.state}
                      </p>
                      <p className="text-gray-300 mt-2">
                        CEP: {order.shipping_address.zip_code}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}