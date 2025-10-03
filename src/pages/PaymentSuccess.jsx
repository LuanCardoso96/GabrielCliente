import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";

export default function PaymentSuccess() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSessionId(urlParams.get("session_id"));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-yellow-600/20 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500/20 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Pagamento Confirmado!
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Seu pedido foi recebido com sucesso e está sendo processado.
            Em breve você receberá um email com os detalhes da entrega.
          </p>

          {sessionId && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
              <p className="text-gray-400 text-sm mb-2">ID da Transação</p>
              <p className="text-white font-mono text-sm break-all">{sessionId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("MyOrders")}>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold">
                <Package className="w-4 h-4 mr-2" />
                Ver Meus Pedidos
              </Button>
            </Link>

            <Link to={createPageUrl("Home")}>
              <Button variant="outline" className="border-yellow-600/50 text-yellow-400">
                Voltar à Loja
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}