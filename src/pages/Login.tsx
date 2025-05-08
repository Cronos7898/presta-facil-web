
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { DollarSign } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate credentials
    if (username === 'edward' && password === 'upao') {
      // Set auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      // Show success message
      toast.success("Inicio de sesión exitoso");
      
      // Redirect to dashboard
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
      toast.error("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-lending-primary flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">PrestaFácil</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para acceder al sistema de préstamos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            © 2025 PrestaFácil - Sistema de Gestión de Préstamos
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
