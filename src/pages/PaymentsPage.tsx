
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, CircleDollarSign } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { PaymentCard } from '@/components/PaymentCard';

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { payments, loading, error, refetch } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filteredPayments = payments.filter(payment => {
    // Filtro de búsqueda
    const matchesSearch = searchTerm === '' || 
      payment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client_dni.includes(searchTerm);

    // Filtro de estado
    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && payment.status === 'pending';
    if (filter === 'paid') return matchesSearch && payment.status === 'paid';
    if (filter === 'overdue') return matchesSearch && payment.payment_priority === 'overdue';
    if (filter === 'today') return matchesSearch && payment.payment_priority === 'today';
    if (filter === 'this-week') return matchesSearch && payment.payment_priority === 'this-week';
    
    return matchesSearch;
  });

  const getStats = () => {
    const today = payments.filter(p => p.payment_priority === 'today' && p.status !== 'paid');
    const overdue = payments.filter(p => p.payment_priority === 'overdue' && p.status !== 'paid');
    const thisWeek = payments.filter(p => p.payment_priority === 'this-week' && p.status !== 'paid');
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.total_amount, 0);

    return { today, overdue, thisWeek, totalAmount };
  };

  const stats = getStats();

  const handlePayClick = (payment: any) => {
    // TODO: Implementar modal de pago
    console.log('Pagar:', payment);
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando pagos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cronograma de Pagos</h1>
        <Button onClick={refetch} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.today.length}</div>
                <div className="text-sm text-muted-foreground">Vencen Hoy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.overdue.length}</div>
                <div className="text-sm text-muted-foreground">Vencidos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.thisWeek.length}</div>
                <div className="text-sm text-muted-foreground">Esta Semana</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">S/ {stats.totalAmount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Mostrado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros de Búsqueda</span>
            <span className="text-sm font-normal text-muted-foreground">
              Total: {filteredPayments.length} pagos
            </span>
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
              variant={filter === 'today' ? 'default' : 'outline'}
              onClick={() => setFilter('today')}
              size="sm"
              className={filter === 'today' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              Vencen Hoy ({stats.today.length})
            </Button>
            <Button 
              variant={filter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilter('overdue')}
              size="sm"
              className={filter === 'overdue' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Vencidos ({stats.overdue.length})
            </Button>
            <Button 
              variant={filter === 'this-week' ? 'default' : 'outline'}
              onClick={() => setFilter('this-week')}
              size="sm"
              className={filter === 'this-week' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
            >
              Esta Semana ({stats.thisWeek.length})
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagos */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              {payments.length === 0 
                ? "No hay pagos registrados" 
                : "No se encontraron resultados para la búsqueda"}
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onPayClick={handlePayClick}
              onViewClient={handleViewClient}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
