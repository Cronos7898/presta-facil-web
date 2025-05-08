
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, DollarSign, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

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
  estado: string;
  schedule: PaymentSchedule[];
}

interface PaymentSchedule {
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estado: string;
}

interface LoanWithClient extends Loan {
  clientId: string;
  clientName: string;
  clientDni: string;
}

const LoansList: React.FC = () => {
  const [loans, setLoans] = useState<LoanWithClient[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanWithClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch clients and their loans from localStorage
    const clients: Client[] = JSON.parse(localStorage.getItem('clients') || '[]');
    
    const allLoans: LoanWithClient[] = [];
    
    clients.forEach(client => {
      if (client.loans && client.loans.length > 0) {
        client.loans.forEach(loan => {
          allLoans.push({
            ...loan,
            clientId: client.id,
            clientName: `${client.nombre} ${client.apellido}`,
            clientDni: client.dni
          });
        });
      }
    });
    
    setLoans(allLoans);
    setFilteredLoans(allLoans);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLoans(loans);
      return;
    }

    const filtered = loans.filter(loan => 
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientDni.includes(searchTerm)
    );
    
    setFilteredLoans(filtered);
  }, [searchTerm, loans]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const downloadSchedule = (loan: LoanWithClient) => {
    const loanAmount = loan.monto.toFixed(2);
    const totalAmount = loan.montoTotal.toFixed(2);
    
    let content = `CRONOGRAMA DE PAGOS\n\n`;
    content += `Cliente: ${loan.clientName}\n`;
    content += `DNI: ${loan.clientDni}\n`;
    content += `Monto Préstamo: S/ ${loanAmount}\n`;
    content += `Interés: 10%\n`;
    content += `Monto Total: S/ ${totalAmount}\n`;
    content += `Número de Cuotas: ${loan.cuotas}\n\n`;
    content += `DETALLE DE CUOTAS:\n`;
    content += `----------------------------------------------------------------\n`;
    content += `Nro.  |  Fecha Vencimiento  |  Monto Cuota  |  Estado\n`;
    content += `----------------------------------------------------------------\n`;
    
    loan.schedule.forEach(item => {
      const formattedDate = formatDate(item.fechaVencimiento);
      content += `${item.numeroCuota.toString().padStart(4)}  |  ${formattedDate}  |  S/ ${item.montoCuota.toFixed(2).padStart(10)}  |  ${item.estado}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronograma_${loan.clientDni}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Cronograma descargado exitosamente");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Lista de Préstamos</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros de Búsqueda</span>
            <span className="text-sm font-normal text-muted-foreground">Total: {filteredLoans.length} préstamos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de cliente o DNI..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <TableHead className="text-right">Monto Préstamo</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Cuotas</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {loans.length === 0 
                      ? "No hay préstamos registrados" 
                      : "No se encontraron resultados para la búsqueda"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Link to={`/client/${loan.clientId}`} className="hover:underline">
                        {loan.clientName}
                      </Link>
                    </TableCell>
                    <TableCell>{loan.clientDni}</TableCell>
                    <TableCell className="text-right">S/ {loan.monto.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(loan.fechaInicio)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={loan.estado === 'activo' ? 'outline' : 'secondary'}>
                        {loan.estado === 'activo' ? 'Activo' : 'Pagado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {loan.schedule.filter(s => s.estado === 'pagado').length}/{loan.schedule.length}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => downloadSchedule(loan)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Link to={`/client/${loan.clientId}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalles
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

export default LoansList;
