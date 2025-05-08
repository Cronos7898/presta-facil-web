
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Home, List, User, UserPlus } from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Registrar Cliente', path: '/register-client', icon: <UserPlus className="h-5 w-5" /> },
    { name: 'Clientes', path: '/clients', icon: <List className="h-5 w-5" /> },
    { name: 'Préstamos', path: '/loans', icon: <DollarSign className="h-5 w-5" /> },
    { name: 'Pagos', path: '/payments', icon: <Calendar className="h-5 w-5" /> },
  ];

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
          <div className="flex items-center">
            <User className="h-8 w-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground p-1" />
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
              <p className="text-xs text-sidebar-foreground/60">admin@prestafacil.com</p>
            </div>
          </div>
        )}
        {collapsed && <User className="h-8 w-8 mx-auto rounded-full bg-sidebar-accent text-sidebar-accent-foreground p-1" />}
      </div>
    </div>
  );
};

export default Sidebar;
