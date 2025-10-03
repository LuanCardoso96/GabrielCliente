import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const loadProfile = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setPhone(currentUser.phone || '');
      setAddress(currentUser.shipping_address || {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: ''
      });
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        phone,
        shipping_address: address
      });
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao salvar perfil');
    }
    setSaving(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full p-3">
            <UserIcon className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Meu Perfil</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-yellow-600/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Informações Pessoais</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white">Nome Completo</Label>
                <Input
                  value={user.full_name}
                  disabled
                  className="bg-gray-800 border-yellow-600/20 text-gray-400"
                />
              </div>

              <div>
                <Label className="text-white">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-gray-800 border-yellow-600/20 text-gray-400"
                />
              </div>

              <div>
                <Label className="text-white">Telefone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-yellow-600/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Endereço de Entrega</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-white">CEP</Label>
                <Input
                  value={address.zip_code}
                  onChange={(e) => setAddress({...address, zip_code: e.target.value})}
                  placeholder="00000-000"
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">Rua</Label>
                <Input
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  placeholder="Nome da rua"
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Número</Label>
                <Input
                  value={address.number}
                  onChange={(e) => setAddress({...address, number: e.target.value})}
                  placeholder="123"
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Complemento</Label>
                <Input
                  value={address.complement}
                  onChange={(e) => setAddress({...address, complement: e.target.value})}
                  placeholder="Apto, bloco, etc"
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Bairro</Label>
                <Input
                  value={address.neighborhood}
                  onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                  placeholder="Nome do bairro"
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Cidade</Label>
                <Input
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  placeholder="Nome da cidade"
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Estado</Label>
                <Input
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                  placeholder="SP"
                  maxLength={2}
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>
            </div>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-6"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
}