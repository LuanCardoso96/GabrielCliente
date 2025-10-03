import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    volume: '',
    category: 'masculino',
    stock: '',
    featured: false,
    notes: '',
    images: []
  });

  const checkAdmin = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.email !== "dsconstrucoesdev@gmail.com") {
        navigate(createPageUrl("Home"));
        return;
      }
      await loadProducts();
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  }, [navigate]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const loadProducts = async () => {
    const data = await Product.list("-created_date");
    setProducts(data);
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 4) {
      alert('Máximo de 4 imagens por produto');
      return;
    }

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const response = await UploadFile({ file });
        uploadedUrls.push(response.file_url);
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
      }
    }

    setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0
    };

    if (editingProduct) {
      await Product.update(editingProduct.id, productData);
    } else {
      await Product.create(productData);
    }

    setDialogOpen(false);
    resetForm();
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      brand: product.brand || '',
      volume: product.volume || '',
      category: product.category || 'masculino',
      stock: product.stock || '',
      featured: product.featured || false,
      notes: product.notes || '',
      images: product.images || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await Product.delete(id);
      loadProducts();
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      brand: '',
      volume: '',
      category: 'masculino',
      stock: '',
      featured: false,
      notes: '',
      images: []
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Produtos</h1>
          <p className="text-gray-400">Gerencie o catálogo de perfumes</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-yellow-600/20 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white">Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-gray-800 border-yellow-600/20 text-white h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Estoque</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Marca</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Volume</Label>
                  <Input
                    value={formData.volume}
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                    placeholder="Ex: 100ml"
                    className="bg-gray-800 border-yellow-600/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-gray-800 border-yellow-600/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-yellow-600/20">
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Notas Olfativas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-gray-800 border-yellow-600/20 text-white h-20"
                  placeholder="Ex: Notas de topo: Limão..."
                />
              </div>

              <div>
                <Label className="text-white flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4"
                  />
                  Produto em Destaque
                </Label>
              </div>

              <div>
                <Label className="text-white">Imagens (máx. 4)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading || formData.images.length >= 4}
                  className="bg-gray-800 border-yellow-600/20 text-white"
                />
                {uploading && <p className="text-yellow-400 text-sm mt-2">Fazendo upload...</p>}
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt="" className="w-full h-20 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== index)})}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1 border-yellow-600/50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                >
                  {editingProduct ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="bg-gray-900 border-yellow-600/20 p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum produto cadastrado</h3>
          <p className="text-gray-400">Comece adicionando seu primeiro produto</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-gray-900 border-yellow-600/20 overflow-hidden">
              <div className="relative h-48">
                <img
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <span className="absolute top-2 right-2 bg-yellow-600 text-black px-2 py-1 rounded-full text-xs font-semibold">
                    Destaque
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-yellow-400 text-sm mb-2">{product.brand}</p>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-yellow-500 font-bold text-xl">R$ {product.price?.toFixed(2)}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    (product.stock || 0) > 10 ? 'bg-green-500/20 text-green-400' :
                    (product.stock || 0) > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {product.stock || 0} un.
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1 border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/20"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}