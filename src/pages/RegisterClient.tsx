
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search } from "lucide-react";

const RegisterClient: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const searchDNI = async () => {
    // Validar que el DNI tenga 8 dígitos
    if (formData.dni.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${formData.dni}`);
      
      if (!response.ok) {
        throw new Error('No se pudo obtener la información del DNI');
      }
      
      const data = await response.json();
      
      // Actualizar el formulario con los datos obtenidos
      setFormData(prev => ({
        ...prev,
        nombre: data.nombres || prev.nombre,
        apellido: `${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim() || prev.apellido,
        direccion: data.direccion || prev.direccion,
        telefono: data.telefono || prev.telefono
      }));
      
      toast.success("Datos cargados correctamente");
    } catch (error) {
      console.error("Error al buscar DNI:", error);
      toast.error("Error al buscar información con el DNI proporcionado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.dni || !formData.nombre || !formData.apellido || !formData.direccion || !formData.email) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    if (formData.dni.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor ingrese un correo electrónico válido");
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
            <div className="flex gap-2 items-end">
              <div className="space-y-2 flex-1">
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
              <Button 
                type="button" 
                onClick={searchDNI} 
                className="mb-0" 
                disabled={isLoading || formData.dni.length !== 8}
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com" 
                  required
                />
              </div>
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
              <Button 
                type="submit" 
                disabled={isLoading || !formData.dni || !formData.nombre || !formData.apellido || !formData.direccion || !formData.email}
              >
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
