import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Truck, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const isMock = searchParams.get('mock') === 'true';

  useEffect(() => {
    if (sessionId) {
      // In a real implementation, you would fetch order details from your backend
      // using the session_id to get the order information
      loadOrderDetails(sessionId, isMock);
    } else {
      setLoading(false);
    }
  }, [sessionId, isMock]);

  const loadOrderDetails = async (sessionId, isMock = false) => {
    try {
      // Simulate loading order details
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock order details
      setOrderDetails({
        id: sessionId,
        status: 'paid',
        amount: 89.90,
        currency: 'BRL',
        customerEmail: isMock ? 'gabrielperfumes990@gmail.com' : 'cliente@exemplo.com',
        shippingMethod: 'PAC',
        estimatedDelivery: '3-5 dias úteis',
        trackingNumber: 'BR123456789',
        createdAt: new Date(),
        isMock: isMock,
      });
    } catch (error) {
      console.error('Error loading order details:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Pagamento Aprovado!
          </h1>
          <p className="text-gray-400 text-lg">
            Seu pedido foi processado com sucesso
          </p>
          {orderDetails?.isMock && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ Modo de Demonstração - Este é um pagamento simulado para testes
              </p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {orderDetails && (
          <Card className="bg-gray-900 border-yellow-600/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-500" />
                Detalhes do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">ID do Pedido</p>
                  <p className="text-white font-mono">{orderDetails.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <Badge className="bg-green-600 text-white">
                    {orderDetails.status === 'paid' ? 'Pago' : orderDetails.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Valor Total</p>
                  <p className="text-yellow-400 font-bold text-xl">
                    {formatCurrency(orderDetails.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{orderDetails.customerEmail}</p>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-yellow-500" />
                  Informações de Envio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Método de Envio</p>
                    <p className="text-white">{orderDetails.shippingMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Prazo de Entrega</p>
                    <p className="text-white">{orderDetails.estimatedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Código de Rastreamento</p>
                    <p className="text-white font-mono">{orderDetails.trackingNumber}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-yellow-500" />
                  Informações de Pagamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Método de Pagamento</p>
                    <p className="text-white">Cartão de Crédito</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Data do Pagamento</p>
                    <p className="text-white">
                      {orderDetails.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="bg-gray-900 border-yellow-600/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="text-white font-semibold">Confirmação por Email</p>
                  <p className="text-gray-400 text-sm">
                    Você receberá um email de confirmação com todos os detalhes do pedido
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-white font-semibold">Preparação do Pedido</p>
                  <p className="text-gray-400 text-sm">
                    Seu pedido será preparado e enviado em até 24 horas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="text-white font-semibold">Rastreamento</p>
                  <p className="text-gray-400 text-sm">
                    Use o código de rastreamento para acompanhar sua entrega
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-3"
          >
            Continuar Comprando
          </Button>
          <Button
            onClick={() => navigate('/MyOrders')}
            variant="outline"
            className="border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black font-semibold px-8 py-3"
          >
                Ver Meus Pedidos
              </Button>
          </div>
      </div>
    </div>
  );
}