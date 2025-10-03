import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { Coupon } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Mail, ShoppingBag, MapPin, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import moment from "moment";

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '',
    expiration_date: ''
  });

  const checkAdmin = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.email !== "dsconstrucoesdev@gmail.com") {
        navigate(createPageUrl("Home"));
        return;
      }
      await loadCustomers();
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  }, [navigate]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const loadCustomers = async () => {
    const users = await User.list();
    const allOrders = await Order.list();
    
    const customersWithData = users.map(user => {
      const userOrders = allOrders.filter(o => o.customer_email === user.email);
      const totalSpent = userOrders
        .filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        ...user,
        orderCount: userOrders.length,
        totalSpent,
        lastOrder: userOrders[0]?.created_date
      };
    });

    customersWithData.sort((a, b) => b.totalSpent - a.totalSpent);

    setCustomers(customersWithData);
    setOrders(allOrders);
    setLoading(false);
  };

  const createCouponForCustomer = async (e) => {
    e.preventDefault();

    await Coupon.create({
      ...couponForm,
      discount_value: parseFloat(couponForm.discount_value),
      min_purchase: parseFloat(couponForm.min_purchase) || 0,
      active: true,
      usage_limit: 1,
      times_used: 0
    });

    alert(`Cupom ${couponForm.code} criado! Envie para: ${selectedCustomer.email}`);
    setDialogOpen(false);
    setCouponForm({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase: '',
      expiration_date: ''
    });
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
        <h1 className="text-4xl font-bold text-white mb-2">Clientes</h1>
        <p className="text-gray-400">Gerencie seus clientes e crie cupons personalizados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-yellow-600/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{customers.length}</span>
          </div>
          <p className="text-gray-400">Total de Clientes</p>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {customers.reduce((sum, c) => sum + c.orderCount, 0)}
            </span>
          </div>
          <p className="text-gray-400">Pedidos Totais</p>
        </Card>

        <Card className="bg-gray-900 border-yellow-600/20 p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">
              R$ {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </span>
          </div>
          <p className="text-gray-400">Faturamento de Clientes</p>
        </Card>
      </div>

      {customers.length === 0 ? (
        <Card className="bg-gray-900 border-yellow-600/20 p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum cliente cadastrado</h3>
          <p className="text-gray-400">Os clientes aparecerão aqui após o primeiro pedido</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="bg-gray-900 border-yellow-600/20 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full p-3">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{customer.full_name}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <p className="text-gray-400 text-sm">📞 {customer.phone}</p>
                      )}
                    </div>
                  </div>

                  {customer.shipping_address && (
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-white font-semibold mb-2">
                        <MapPin className="w-4 h-4" />
                        Endereço
                      </div>
                      <p className="text-gray-400 text-sm">
                        {customer.shipping_address.street}, {customer.shipping_address.number}
                        {customer.shipping_address.complement && `, ${customer.shipping_address.complement}`}
                        <br />
                        {customer.shipping_address.neighborhood} - {customer.shipping_address.city}/{customer.shipping_address.state}
                        <br />
                        CEP: {customer.shipping_address.zip_code}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-yellow-500">{customer.orderCount}</p>
                        <p className="text-gray-400 text-xs">Pedidos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">
                          R$ {customer.totalSpent.toFixed(0)}
                        </p>
                        <p className="text-gray-400 text-xs">Gasto Total</p>
                      </div>
                    </div>
                  </div>

                  {customer.lastOrder && (
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Último pedido</p>
                      <p className="text-white text-sm">{moment(customer.lastOrder).format('DD/MM/YYYY')}</p>
                    </div>
                  )}

                  <Dialog open={dialogOpen && selectedCustomer?.id === customer.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) setSelectedCustomer(customer);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black">
                        <Gift className="w-4 h-4 mr-2" />
                        Criar Cupom
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-yellow-600/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Criar Cupom para {customer.full_name}</DialogTitle>
                      </DialogHeader>

                      <form onSubmit={createCouponForCustomer} className="space-y-4">
                        <div>
                          <label className="text-white text-sm">Código do Cupom *</label>
                          <Input
                            value={couponForm.code}
                            onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                            required
                            placeholder="EX: CLIENTE10"
                            className="bg-gray-800 border-yellow-600/20 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-white text-sm">Tipo</label>
                            <select
                              value={couponForm.discount_type}
                              onChange={(e) => setCouponForm({...couponForm, discount_type: e.target.value})}
                              className="w-full bg-gray-800 border border-yellow-600/20 text-white rounded-md p-2"
                            >
                              <option value="percentage">Porcentagem (%)</option>
                              <option value="fixed">Valor Fixo (R$)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-white text-sm">Valor *</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={couponForm.discount_value}
                              onChange={(e) => setCouponForm({...couponForm, discount_value: e.target.value})}
                              required
                              className="bg-gray-800 border-yellow-600/20 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-white text-sm">Compra Mínima (R$)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={couponForm.min_purchase}
                            onChange={(e) => setCouponForm({...couponForm, min_purchase: e.target.value})}
                            className="bg-gray-800 border-yellow-600/20 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-white text-sm">Data de Expiração</label>
                          <Input
                            type="date"
                            value={couponForm.expiration_date}
                            onChange={(e) => setCouponForm({...couponForm, expiration_date: e.target.value})}
                            className="bg-gray-800 border-yellow-600/20 text-white"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                        >
                          Criar Cupom
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}