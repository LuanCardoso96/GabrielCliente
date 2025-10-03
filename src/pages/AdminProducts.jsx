import React, { useState, useEffect } from "react";
import { Product } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Package, AlertCircle, Upload, Image as ImageIcon } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsList = await Product.getAll();
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      // First, save the product to Firestore
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl: null, // Will be updated later if image is uploaded
        createdAt: new Date()
      };
      
      let productId;
      if (editingProduct) {
        await Product.update(editingProduct.id, productData);
        productId = editingProduct.id;
      } else {
        const docRef = await Product.create(productData);
        productId = docRef.id;
      }
      
      // Upload image if file is selected (after saving product)
      if (selectedFile) {
        try {
          const uploadResult = await UploadFile(selectedFile, 'products');
          await Product.update(productId, { imageUrl: uploadResult.url });
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Product is still saved, just without image
        }
      }
      
      await loadProducts();
      setIsDialogOpen(false);
      setEditingProduct(null);
      setSelectedFile(null);
      setPreviewUrl("");
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        imageUrl: ""
      });
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category: product.category || "",
      imageUrl: product.imageUrl || ""
    });
    setSelectedFile(null);
    setPreviewUrl(product.imageUrl || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await Product.delete(productId);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-yellow-400 text-xl">Carregando produtos...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Produtos</h1>
        <p className="text-gray-400">Adicione, edite ou remova produtos do catálogo</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Nome do Produto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-gray-300">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock" className="text-gray-300">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="image" className="text-gray-300">
                  Imagem do Produto <span className="text-gray-500 text-sm">(opcional)</span>
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image').click()}
                      className="border-gray-600 text-gray-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar
                    </Button>
                  </div>
                  
                  {previewUrl && (
                    <div className="mt-4">
                      <p className="text-gray-300 text-sm mb-2">Preview:</p>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                  
                  {!previewUrl && !selectedFile && (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Nenhuma imagem selecionada</p>
                      <p className="text-gray-500 text-xs">Você pode adicionar uma imagem depois</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-black"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      {selectedFile ? 'Enviando...' : 'Salvando...'}
                    </>
                  ) : (
                    editingProduct ? 'Salvar' : 'Adicionar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                  <p className="text-gray-400 text-sm">{product.category}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Sem imagem</p>
                  </div>
                </div>
              )}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-bold text-lg">
                  {formatCurrency(product.price)}
                </span>
                <Badge className={product.stock > 5 ? "bg-green-600" : "bg-red-600"}>
                  {product.stock} em estoque
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Tente ajustar sua busca' : 'Adicione seu primeiro produto'}
          </p>
        </div>
      )}
    </AdminLayout>
  );
}