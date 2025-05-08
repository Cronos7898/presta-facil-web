
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RegisterClient: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.dni || !formData.nombre || !formData.apellido || !formData.direccion) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    if (formData.dni.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    // In a real app, you'd save this to a database
    // For now, we'll save to localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const newClient = {
      id: Date.now().toString(),
      ...formData,
      loans: [],
    };
    clients.push(newClient);
    localStorage.setItem('clients', JSON.stringify(clients));

    toast.success("Cliente registrado exitosamente");
    
    // Navigate to loan registration
    navigate(`/register-loan/${newClient.id}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Registrar Cliente</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <Input 
                  id="dni" 
                  name="dni" 
                  value={formData.dni} 
                  onChange={handleChange}
                  placeholder="12345678" 
                  maxLength={8}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono" 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange}
                  placeholder="987654321" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombres *</Label>
                <Input 
                  id="nombre" 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange}
                  placeholder="Juan" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellidos *</Label>
                <Input 
                  id="apellido" 
                  name="apellido" 
                  value={formData.apellido} 
                  onChange={handleChange}
                  placeholder="Pérez" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange}
                placeholder="ejemplo@correo.com" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input 
                id="direccion" 
                name="direccion" 
                value={formData.direccion} 
                onChange={handleChange}
                placeholder="Av. Ejemplo 123" 
                required 
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Siguiente: Registrar Préstamo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterClient;
