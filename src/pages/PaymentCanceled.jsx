import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-red-600/20 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-500/20 rounded-full p-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Pagamento Cancelado
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            O pagamento foi cancelado. Você pode tentar novamente ou escolher outro método de pagamento.
          </p>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
            <p className="text-gray-400 text-sm mb-2">Possíveis motivos:</p>
            <ul className="text-gray-300 text-sm text-left space-y-1">
              <li>• Você cancelou o pagamento</li>
              <li>• Problema com o cartão de crédito</li>
              <li>• Timeout na sessão de pagamento</li>
              <li>• Erro na conexão com o Stripe</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-gray-600/50 text-gray-400 hover:bg-gray-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Voltar à Loja
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
