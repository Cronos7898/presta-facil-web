
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Client {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono?: string;
  email?: string;
  loans: Loan[];
}

interface Loan {
  id: string;
  monto: number;
  cuotas: number;
  interes: number;
  montoTotal: number;
  fechaInicio: string;
  estado: 'activo' | 'pagado';
  schedule: PaymentSchedule[];
}

interface PaymentSchedule {
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estado: 'pendiente' | 'pagado';
}

const RegisterLoan: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loanData, setLoanData] = useState({
    monto: '',
    cuotas: '1',
  });

  useEffect(() => {
    // Fetch client data from localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const foundClient = clients.find((c: Client) => c.id === clientId);
    
    if (foundClient) {
      setClient(foundClient);
    } else {
      toast.error("Cliente no encontrado");
      navigate('/register-client');
    }
  }, [clientId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoanData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setLoanData(prev => ({ ...prev, cuotas: value }));
  };

  const generatePaymentSchedule = (
    amount: number, 
    installments: number, 
    interestRate: number = 0.1
  ): PaymentSchedule[] => {
    const totalAmount = amount * (1 + interestRate);
    const installmentAmount = Math.round((totalAmount / installments) * 100) / 100;
    
    const schedule: PaymentSchedule[] = [];
    let currentDate = new Date();
    
    for (let i = 0; i < installments; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      schedule.push({
        numeroCuota: i + 1,
        fechaVencimiento: currentDate.toISOString().split('T')[0],
        montoCuota: installmentAmount,
        estado: 'pendiente'
      });
    }
    
    return schedule;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanData.monto || !loanData.cuotas) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    const monto = parseFloat(loanData.monto);
    const cuotas = parseInt(loanData.cuotas);
    
    if (monto <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    
    if (cuotas <= 0) {
      toast.error("Las cuotas deben ser mayor a 0");
      return;
    }

    const interes = 0.1; // 10% de interés
    const montoTotal = monto * (1 + interes);
    
    // Generate payment schedule
    const paymentSchedule = generatePaymentSchedule(monto, cuotas);
    
    // Create new loan
    const newLoan: Loan = {
      id: Date.now().toString(),
      monto,
      cuotas,
      interes,
      montoTotal,
      fechaInicio: new Date().toISOString().split('T')[0],
      estado: 'activo',
      schedule: paymentSchedule
    };
    
    // Update client in localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const updatedClients = clients.map((c: Client) => {
      if (c.id === clientId) {
        return {
          ...c,
          loans: [...(c.loans || []), newLoan]
        };
      }
      return c;
    });
    
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    toast.success("Préstamo registrado exitosamente");
    
    // Navigate to loan details page
    navigate(`/client/${clientId}`);
  };

  if (!client) {
    return <div className="p-4 text-center">Cargando datos del cliente...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Registrar Préstamo</h1>
      
      <Card className="mb-6 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">DNI</p>
              <p className="text-lg">{client.dni}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Nombre Completo</p>
              <p className="text-lg">{client.nombre} {client.apellido}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Dirección</p>
              <p className="text-lg">{client.direccion}</p>
            </div>
            {client.telefono && (
              <div>
                <p className="text-sm font-medium mb-1">Teléfono</p>
                <p className="text-lg">{client.telefono}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Datos del Préstamo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto a Prestar (S/)</Label>
              <Input 
                id="monto" 
                name="monto" 
                value={loanData.monto} 
                onChange={handleChange}
                type="number"
                min="1"
                placeholder="1000" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cuotas">Número de Cuotas</Label>
              <Select 
                value={loanData.cuotas} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el número de cuotas" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 6, 12, 18, 24].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'cuota' : 'cuotas'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {loanData.monto && loanData.cuotas && (
              <div className="bg-lending-light p-4 rounded-md mt-4">
                <h3 className="font-medium mb-2">Resumen del Préstamo:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p>Monto a Prestar:</p>
                  <p className="font-medium">S/ {parseFloat(loanData.monto).toFixed(2)}</p>
                  
                  <p>Interés (10%):</p>
                  <p className="font-medium">S/ {(parseFloat(loanData.monto) * 0.1).toFixed(2)}</p>
                  
                  <p>Monto Total a Pagar:</p>
                  <p className="font-medium">S/ {(parseFloat(loanData.monto) * 1.1).toFixed(2)}</p>
                  
                  <p>Valor de Cada Cuota:</p>
                  <p className="font-medium">S/ {(parseFloat(loanData.monto) * 1.1 / parseInt(loanData.cuotas)).toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit">
                Registrar Préstamo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterLoan;
