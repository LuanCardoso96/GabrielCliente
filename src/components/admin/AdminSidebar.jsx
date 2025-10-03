// Admin Sidebar Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Tag, 
  Truck, 
  Users,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { signOutUser } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/AdminDashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Produtos',
    path: '/AdminProducts',
    icon: Package
  },
  {
    name: 'Pedidos',
    path: '/AdminOrders',
    icon: ShoppingBag
  },
  {
    name: 'Categorias',
    path: '/AdminCategories',
    icon: Tag
  },
  {
    name: 'Logística',
    path: '/AdminLogistics',
    icon: Truck
  },
  {
    name: 'Clientes',
    path: '/AdminCustomers',
    icon: Users
  }
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen border-r border-yellow-600/20">
      <div className="p-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-8">
          PAINEL ADMIN
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-yellow-600 text-black hover:bg-yellow-700" 
                      : "text-gray-300 hover:text-yellow-400 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-yellow-600/20">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
