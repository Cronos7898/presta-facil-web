
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, FileText } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    // Fetch client data from localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const foundClient = clients.find((c: Client) => c.id === clientId);
    
    if (foundClient) {
      setClient(foundClient);
      if (foundClient.loans?.length > 0) {
        setSelectedLoan(foundClient.loans[0]);
      }
    } else {
      toast.error("Cliente no encontrado");
      navigate('/clients');
    }
  }, [clientId, navigate]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const downloadSchedule = (loan: Loan) => {
    const clientName = `${client?.nombre} ${client?.apellido}`;
    const loanAmount = loan.monto.toFixed(2);
    const totalAmount = loan.montoTotal.toFixed(2);
    
    let content = `CRONOGRAMA DE PAGOS\n\n`;
    content += `Cliente: ${clientName}\n`;
    content += `DNI: ${client?.dni}\n`;
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
    a.download = `cronograma_${client?.apellido}_${client?.nombre}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Cronograma descargado exitosamente");
  };

  if (!client) {
    return <div className="p-4 text-center">Cargando datos del cliente...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link to="/clients" className="hover:underline">Clientes</Link>
            <span>/</span>
            <span>{client.nombre} {client.apellido}</span>
          </div>
          <h1 className="text-3xl font-bold">{client.nombre} {client.apellido}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/register-loan/${client.id}`}>
            <Button>
              <DollarSign className="mr-2 h-4 w-4" />
              Nuevo Préstamo
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">DNI</p>
              <p className="text-lg">{client.dni}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dirección</p>
              <p className="text-lg">{client.direccion}</p>
            </div>
            {client.telefono && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-lg">{client.telefono}</p>
              </div>
            )}
            {client.email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{client.email}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Préstamos</CardTitle>
          </CardHeader>
          <CardContent>
            {client.loans?.length > 0 ? (
              <Tabs defaultValue={client.loans[0].id} onValueChange={(value) => {
                const loan = client.loans.find(l => l.id === value);
                if (loan) setSelectedLoan(loan);
              }}>
                <TabsList className="mb-4">
                  {client.loans.map((loan) => (
                    <TabsTrigger key={loan.id} value={loan.id}>
                      Préstamo #{client.loans.indexOf(loan) + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {client.loans.map((loan) => (
                  <TabsContent key={loan.id} value={loan.id}>
                    <div className="mb-4 p-4 bg-lending-light rounded-md">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monto Préstamo</p>
                          <p className="text-lg font-medium">S/ {loan.monto.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Interés</p>
                          <p className="text-lg font-medium">10%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
                          <p className="text-lg font-medium">S/ {loan.montoTotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Fecha Inicio</p>
                          <p className="text-lg font-medium">{formatDate(loan.fechaInicio)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Cronograma de Pagos</h3>
                      <Button variant="outline" size="sm" onClick={() => downloadSchedule(loan)}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N° Cuota</TableHead>
                          <TableHead>Fecha Vencimiento</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="hidden md:table-cell">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loan.schedule.map((item) => (
                          <TableRow key={item.numeroCuota}>
                            <TableCell>{item.numeroCuota}</TableCell>
                            <TableCell>{formatDate(item.fechaVencimiento)}</TableCell>
                            <TableCell className="text-right">S/ {item.montoCuota.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.estado === 'pagado' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-6 flex flex-col items-center justify-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">Sin préstamos registrados</h3>
                <p className="text-muted-foreground mb-4">Este cliente no tiene préstamos registrados.</p>
                <Link to={`/register-loan/${client.id}`}>
                  <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Registrar Préstamo
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetail;
