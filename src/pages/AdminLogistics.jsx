import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, Clock } from "lucide-react";
import moment from "moment";

export default function AdminLogistics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logistics, setLogistics] = useState({
    pendingShipment: [],
    inTransit: [],
    delivered: []
  });

  const checkAdmin = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.email !== "dsconstrucoesdev@gmail.com") {
        navigate(createPageUrl("Home"));
        return;
      }
      await loadLogistics();
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  }, [navigate]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const loadLogistics = async () => {
    const orders = await Order.list("-created_date");
    
    setLogistics({
      pendingShipment: orders.filter(o => o.status === 'paid' || o.status === 'processing'),
      inTransit: orders.filter(o => o.status === 'shipped'),
      delivered: orders.filter(o => o.status === 'delivered')
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
        <h1 className="text-4xl font-bold text-white mb-2">Logística</h1>
        <p className="text-gray-400">Acompanhe o status das entregas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-yellow-600/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-600/20 p-3 rounded-lg">
              <Package className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-3xl font-bold text-white">{logistics.pendingShipment.length}</span>
          </div>
          <h3 className="text-white font-semibold">Aguardando Envio</h3>
          <p className="text-gray-400 text-sm">Pedidos prontos para despacho</p>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600/20 p-3 rounded-lg">
              <Truck className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-white">{logistics.inTransit.length}</span>
          </div>
          <h3 className="text-white font-semibold">Em Trânsito</h3>
          <p className="text-gray-400 text-sm">Pedidos a caminho do cliente</p>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-600/20 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-3xl font-bold text-white">{logistics.delivered.length}</span>
          </div>
          <h3 className="text-white font-semibold">Entregues</h3>
          <p className="text-gray-400 text-sm">Pedidos finalizados</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-yellow-600/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-400" />
            Aguardando Envio
          </h2>
          <div className="space-y-3">
            {logistics.pendingShipment.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum pedido aguardando envio</p>
            ) : (
              logistics.pendingShipment.map((order) => (
                <div key={order.id} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold">#{order.id.slice(-8)}</p>
                      <p className="text-gray-400 text-sm">{order.customer_name || order.customer_email}</p>
                    </div>
                    <Badge className="bg-yellow-600/20 text-yellow-400">
                      {order.status === 'paid' ? 'Pago' : 'Processando'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {moment(order.created_date).format('DD/MM/YYYY HH:mm')}
                  </div>
                  {order.shipping_address && (
                    <p className="text-gray-400 text-sm mt-2">
                      📍 {order.shipping_address.city} - {order.shipping_address.state}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Em Trânsito
          </h2>
          <div className="space-y-3">
            {logistics.inTransit.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma entrega em andamento</p>
            ) : (
              logistics.inTransit.map((order) => (
                <div key={order.id} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold">#{order.id.slice(-8)}</p>
                      <p className="text-gray-400 text-sm">{order.customer_name || order.customer_email}</p>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-400">Em trânsito</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    Enviado {moment(order.updated_date).fromNow()}
                  </div>
                  {order.shipping_address && (
                    <p className="text-gray-400 text-sm mt-2">
                      📍 {order.shipping_address.city} - {order.shipping_address.state}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}