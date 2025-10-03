import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <Card className="group bg-gradient-to-br from-gray-900 to-black border-yellow-600/20 overflow-hidden hover:border-yellow-600/50 transition-all duration-300">
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link to={createPageUrl(`ProductDetails?id=${product.id}`)}>
            <Button 
              size="sm" 
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-yellow-400 text-sm mb-2">{product.brand}</p>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-yellow-500">
            R$ {product.price?.toFixed(2)}
          </span>
          {product.stock > 0 ? (
            <span className="text-xs text-green-400">Em estoque</span>
          ) : (
            <span className="text-xs text-red-400">Esgotado</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}