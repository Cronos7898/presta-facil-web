
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, DollarSign, Calendar, List } from "lucide-react";

interface Client {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  loans: Loan[];
}

interface Loan {
  id: string;
  monto: number;
  montoTotal: number;
  estado: string;
  schedule: PaymentSchedule[];
}

interface PaymentSchedule {
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estado: string;
}

const Dashboard: React.FC = () => {
  const [totalClients, setTotalClients] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<{name: string, amount: string, date: string}[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const clients: Client[] = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Calculate dashboard statistics
    setTotalClients(clients.length);
    
    let active = 0;
    let pending = 0;
    let received = 0;
    
    // Process all clients and their loans
    clients.forEach(client => {
      if (client.loans && client.loans.length > 0) {
        client.loans.forEach(loan => {
          if (loan.estado === 'activo') {
            active++;
            
            // Calculate pending amount (sum of pending payments)
            if (loan.schedule && loan.schedule.length > 0) {
              loan.schedule.forEach(payment => {
                if (payment.estado === 'pendiente') {
                  pending += payment.montoCuota;
                } else if (payment.estado === 'pagado') {
                  received += payment.montoCuota;
                }
              });
            }
          }
        });
      }
    });
    
    setActiveLoans(active);
    setPendingAmount(pending);
    setReceivedAmount(received);
    
    // Get recent clients (up to 4, sorted by most recent first)
    const sortedClients = [...clients].sort((a, b) => {
      // This is a simple sort assuming newer clients have higher IDs
      // In a real system, you'd sort by creation date
      return b.id.localeCompare(a.id);
    }).slice(0, 4);
    
    setRecentClients(sortedClients);
    
    // Get upcoming payments
    const today = new Date();
    const allUpcomingPayments: {name: string, amount: string, date: string, dueDate: Date}[] = [];
    
    clients.forEach(client => {
      if (client.loans && client.loans.length > 0) {
        client.loans.forEach(loan => {
          if (loan.schedule && loan.schedule.length > 0) {
            loan.schedule.forEach(payment => {
              if (payment.estado === 'pendiente') {
                const dueDate = new Date(payment.fechaVencimiento);
                // Only include payments that are due in the future
                if (dueDate >= today) {
                  allUpcomingPayments.push({
                    name: `${client.nombre} ${client.apellido}`,
                    amount: `S/ ${payment.montoCuota.toFixed(2)}`,
                    date: payment.fechaVencimiento,
                    dueDate: dueDate
                  });
                }
              }
            });
          }
        });
      }
    });
    
    // Sort by closest due date and take the first 4
    const sortedPayments = allUpcomingPayments
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 4)
      .map(p => ({
        name: p.name,
        amount: p.amount,
        date: new Date(p.date).toLocaleDateString('es-PE')
      }));
    
    setUpcomingPayments(sortedPayments);
    
  }, []);

  // Format numbers as currency
  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  const stats = [
    { title: "Clientes Totales", value: totalClients, icon: <UserPlus className="h-8 w-8 text-lending-primary" />, change: "" },
    { title: "Préstamos Activos", value: activeLoans, icon: <DollarSign className="h-8 w-8 text-lending-secondary" />, change: "" },
    { title: "Por Cobrar", value: formatCurrency(pendingAmount), icon: <Calendar className="h-8 w-8 text-lending-accent" />, change: "" },
    { title: "Pagos Recibidos", value: formatCurrency(receivedAmount), icon: <List className="h-8 w-8 text-lending-secondary" />, change: "" }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.change} desde el mes pasado</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Nuevos Clientes</CardTitle>
            <CardDescription>Últimos clientes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No hay clientes registrados</p>
            ) : (
              <ul className="space-y-4">
                {recentClients.map((client, i) => (
                  <li key={i} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                        {client.nombre.charAt(0)}
                      </div>
                      <span>{client.nombre} {client.apellido}</span>
                    </div>
                    <span className="text-sm text-gray-500">DNI: {client.dni}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Próximos Pagos</CardTitle>
            <CardDescription>Cuotas pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No hay pagos pendientes</p>
            ) : (
              <ul className="space-y-4">
                {upcomingPayments.map((payment, i) => (
                  <li key={i} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p>{payment.name}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                    <span className="font-medium">{payment.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
