
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  LayoutDashboard,
  Package,
  Users,
  Tag,
  LogOut,
  Home,
  ShoppingCart,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user?.email === "dsconstrucoesdev@gmail.com";
  const isAdminPage = location.pathname.includes("/admin");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setCartCount(currentUser.cart?.length || 0);
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl("Home");
  };

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
          
          :root {
            --gold: #D4AF37;
            --dark: #000000;
            --light: #FFFFFF;
          }
          
          * {
            font-family: 'Inter', sans-serif;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Playfair Display', serif;
          }
        `}</style>

        <div className="flex min-h-screen">
          <aside className="w-64 bg-black border-r border-yellow-600/20 fixed h-full overflow-y-auto">
            <div className="p-6 border-b border-yellow-600/20">
              <Link to={createPageUrl("Home")}>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Imperium 7
                </h2>
              </Link>
              <p className="text-gray-400 text-sm mt-1">Painel Admin</p>
            </div>

            <nav className="p-4 space-y-2">
              <Link to={createPageUrl("AdminDashboard")}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    location.pathname.includes("AdminDashboard")
                      ? "bg-yellow-600/20 text-yellow-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  Dashboard
                </Button>
              </Link>

              <Link to={createPageUrl("AdminProducts")}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    location.pathname.includes("AdminProducts")
                      ? "bg-yellow-600/20 text-yellow-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Package className="w-4 h-4 mr-3" />
                  Produtos
                </Button>
              </Link>

              <Link to={createPageUrl("AdminOrders")}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    location.pathname.includes("AdminOrders")
                      ? "bg-yellow-600/20 text-yellow-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  Pedidos
                </Button>
              </Link>

              <Link to={createPageUrl("AdminCategories")}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    location.pathname.includes("AdminCategories")
                      ? "bg-yellow-600/20 text-yellow-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Tag className="w-4 h-4 mr-3" />
                  Categorias
                </Button>
              </Link>

              <Link to={createPageUrl("AdminLogistics")}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    location.pathname.includes("AdminLogistics")
                      ? "bg-yellow-600/20 text-yellow-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Truck className="w-4 h-4 mr-3" />
                  Logística
                </Button>
              </Link>

              <Link to={createPageUrl("AdminCustomers")}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    location.pathname.includes("AdminCustomers")
                      ? "bg-yellow-600/20 text-yellow-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Clientes
                </Button>
              </Link>

              <div className="pt-4 mt-4 border-t border-yellow-600/20">
                <Link to={createPageUrl("Home")}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Voltar à Loja
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-gray-800 mt-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sair
                </Button>
              </div>
            </nav>
          </aside>

          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
          --gold: #D4AF37;
          --dark: #000000;
          --light: #FFFFFF;
        }
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
        }
      `}</style>

      <header className="fixed top-0 w-full bg-black/95 backdrop-blur-lg border-b border-yellow-600/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("Home")} className="flex items-center">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
                Imperium 7
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Início
                </Button>
              </Link>
              <Link to={createPageUrl("Catalog")}>
                <Button variant="ghost" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Catálogo
                </Button>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to={createPageUrl("Cart")}>
                <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-yellow-400">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-yellow-600 text-black">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-300 hover:text-yellow-400">
                      <UserIcon className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-yellow-600/20">
                    <div className="px-3 py-2 border-b border-yellow-600/20">
                      <p className="text-sm font-medium text-white">{user.full_name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <Link to={createPageUrl("Profile")}>
                      <DropdownMenuItem className="text-gray-300 hover:text-yellow-400 cursor-pointer">
                        Meu Perfil
                      </DropdownMenuItem>
                    </Link>
                    <Link to={createPageUrl("MyOrders")}>
                      <DropdownMenuItem className="text-gray-300 hover:text-yellow-400 cursor-pointer">
                        Meus Pedidos
                      </DropdownMenuItem>
                    </Link>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-yellow-600/20" />
                        <Link to={createPageUrl("AdminDashboard")}>
                          <DropdownMenuItem className="text-yellow-400 hover:text-yellow-300 cursor-pointer">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Painel Admin
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-yellow-600/20" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => User.login()}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium"
                >
                  Entrar
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-yellow-600/20">
            <nav className="px-4 py-4 space-y-2">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" className="w-full justify-start text-gray-300">
                  Início
                </Button>
              </Link>
              <Link to={createPageUrl("Catalog")}>
                <Button variant="ghost" className="w-full justify-start text-gray-300">
                  Catálogo
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-20">
        {children}
      </main>

      <footer className="bg-black border-t border-yellow-600/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
                Imperium 7
              </h3>
              <p className="text-gray-400">
                Perfumes de luxo que definem sua essência
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
              <div className="space-y-2">
                <Link to={createPageUrl("Home")} className="block text-gray-400 hover:text-yellow-400 transition-colors">
                  Início
                </Link>
                <Link to={createPageUrl("Catalog")} className="block text-gray-400 hover:text-yellow-400 transition-colors">
                  Catálogo
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <p className="text-gray-400">
                Email: contato@imperium7.com.br
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-yellow-600/20 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Imperium 7. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
