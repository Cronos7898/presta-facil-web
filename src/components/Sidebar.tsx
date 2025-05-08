
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Home, List, LogOut, User, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Registrar Cliente', path: '/register-client', icon: <UserPlus className="h-5 w-5" /> },
    { name: 'Clientes', path: '/clients', icon: <List className="h-5 w-5" /> },
    { name: 'Préstamos', path: '/loans', icon: <DollarSign className="h-5 w-5" /> },
    { name: 'Pagos', path: '/payments', icon: <Calendar className="h-5 w-5" /> },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast.success("Sesión cerrada exitosamente");
    navigate('/login');
  };

  return (
    <div className={`bg-sidebar h-screen shadow-md flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
        {!collapsed && <h1 className="text-xl font-semibold text-sidebar-foreground">PrestaFácil</h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? '→' : '←'}
        </Button>
      </div>
      
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-button ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <User className="h-8 w-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground p-1" />
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">Edward</p>
                <p className="text-xs text-sidebar-foreground/60">admin@prestafacil.com</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        )}
        {collapsed && (
          <div className="flex flex-col items-center gap-3">
            <User className="h-8 w-8 mx-auto rounded-full bg-sidebar-accent text-sidebar-accent-foreground p-1" />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
