
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

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
  cuotas: number;
  schedule: PaymentSchedule[];
}

interface PaymentSchedule {
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estado: string;
}

interface Payment {
  clientId: string;
  clientName: string;
  clientDni: string;
  loanId: string;
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estado: string;
  daysUntilDue: number;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => {
    const clients: Client[] = JSON.parse(localStorage.getItem('clients') || '[]');
    const allPayments: Payment[] = [];
    
    clients.forEach(client => {
      if (client.loans && client.loans.length > 0) {
        client.loans.forEach(loan => {
          if (loan.schedule && loan.schedule.length > 0) {
            loan.schedule.forEach(payment => {
              const today = new Date();
              const dueDate = new Date(payment.fechaVencimiento);
              const timeDiff = dueDate.getTime() - today.getTime();
              const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
              
              allPayments.push({
                clientId: client.id,
                clientName: `${client.nombre} ${client.apellido}`,
                clientDni: client.dni,
                loanId: loan.id,
                numeroCuota: payment.numeroCuota,
                fechaVencimiento: payment.fechaVencimiento,
                montoCuota: payment.montoCuota,
                estado: payment.estado,
                daysUntilDue: daysUntilDue
              });
            });
          }
        });
      }
    });
    
    // Sort by due date
    allPayments.sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
    
    setPayments(allPayments);
    applyFilters(allPayments, searchTerm, filter);
  };

  const applyFilters = (allPayments: Payment[], search: string, status: string) => {
    let filtered = allPayments;
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(payment => 
        payment.clientName.toLowerCase().includes(search.toLowerCase()) ||
        payment.clientDni.includes(search)
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      const today = new Date();
      
      if (status === 'pending') {
        filtered = filtered.filter(p => p.estado === 'pendiente');
      } else if (status === 'paid') {
        filtered = filtered.filter(p => p.estado === 'pagado');
      } else if (status === 'due-this-week') {
        filtered = filtered.filter(p => 
          p.estado === 'pendiente' && 
          p.daysUntilDue >= 0 && 
          p.daysUntilDue <= 7
        );
      } else if (status === 'overdue') {
        filtered = filtered.filter(p => 
          p.estado === 'pendiente' && 
          p.daysUntilDue < 0
        );
      }
    }
    
    setFilteredPayments(filtered);
  };

  useEffect(() => {
    applyFilters(payments, searchTerm, filter);
  }, [searchTerm, filter, payments]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cronograma de Pagos</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros de Búsqueda</span>
            <span className="text-sm font-normal text-muted-foreground">Total: {filteredPayments.length} pagos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de cliente o DNI..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
            >
              Pendientes
            </Button>
            <Button 
              variant={filter === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilter('paid')}
              size="sm"
            >
              Pagados
            </Button>
            <Button 
              variant={filter === 'due-this-week' ? 'default' : 'outline'}
              onClick={() => setFilter('due-this-week')}
              size="sm"
            >
              Por Vencer (7 días)
            </Button>
            <Button 
              variant={filter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilter('overdue')}
              size="sm"
            >
              Vencidos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {payments.length === 0 
                      ? "No hay pagos registrados" 
                      : "No se encontraron resultados para la búsqueda"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment, index) => (
                  <TableRow key={`${payment.loanId}-${payment.numeroCuota}`} 
                    className={payment.estado === 'pendiente' && payment.daysUntilDue < 0 
                      ? 'bg-red-50' 
                      : (payment.estado === 'pendiente' && payment.daysUntilDue <= 7 && payment.daysUntilDue >= 0
                        ? 'bg-amber-50' 
                        : '')
                    }>
                    <TableCell>
                      <Link to={`/client/${payment.clientId}`} className="hover:underline">
                        {payment.clientName}
                      </Link>
                    </TableCell>
                    <TableCell>{payment.clientDni}</TableCell>
                    <TableCell>{payment.numeroCuota}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(payment.fechaVencimiento)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">S/ {payment.montoCuota.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.estado === 'pagado' 
                          ? 'bg-green-100 text-green-800' 
                          : (
                            payment.daysUntilDue < 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-amber-100 text-amber-800'
                          )
                      }`}>
                        {payment.estado === 'pagado' 
                          ? 'Pagado' 
                          : (
                            payment.daysUntilDue < 0 
                              ? 'Vencido' 
                              : 'Pendiente'
                            )
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Link to={`/client/${payment.clientId}`}>
                          <Button variant="outline" size="sm">
                            Ver Cliente
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPage;
