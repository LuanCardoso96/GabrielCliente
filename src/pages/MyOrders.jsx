import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import moment from "moment";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const user = await User.me();
      const allOrders = await Order.list("-created_date");
      const userOrders = allOrders.filter(order => order.customer_email === user.email);
      setOrders(userOrders);
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
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
        <h1 className="text-4xl font-bold text-white mb-8">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <Card className="bg-gray-900 border-yellow-600/20 p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Nenhum pedido ainda</h2>
            <p className="text-gray-400">Faça seu primeiro pedido na nossa loja!</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-gray-900 border-yellow-600/20 p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      Pedido #{order.id.slice(-8)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {moment(order.created_date).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>

                  <Badge variant="outline" className={`${getStatusColor(order.status)} h-fit flex items-center gap-2`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-300">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-yellow-600/20 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-gray-300">
                      R$ {(order.total_amount - (order.shipping_cost || 0) + (order.discount || 0)).toFixed(2)}
                    </span>
                  </div>

                  {order.shipping_cost > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Frete</span>
                      <span className="text-gray-300">R$ {order.shipping_cost.toFixed(2)}</span>
                    </div>
                  )}

                  {order.discount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Desconto</span>
                      <span className="text-green-400">- R$ {order.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-yellow-500">R$ {order.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {order.shipping_address && (
                  <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Endereço de Entrega</h4>
                    <p className="text-gray-400 text-sm">
                      {order.shipping_address.street}, {order.shipping_address.number}
                      {order.shipping_address.complement && `, ${order.shipping_address.complement}`}
                      <br />
                      {order.shipping_address.neighborhood} - {order.shipping_address.city}/{order.shipping_address.state}
                      <br />
                      CEP: {order.shipping_address.zip_code}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}