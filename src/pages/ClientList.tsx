
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus } from 'lucide-react';

interface Client {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono?: string;
  email?: string;
  loans: any[];
}

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch clients from localStorage
    const storedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    setClients(storedClients);
    setFilteredClients(storedClients);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client => 
      client.dni.includes(searchTerm) ||
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.apellido.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Lista de Clientes</h1>
        <Link to="/register-client">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros de Búsqueda</span>
            <span className="text-sm font-normal text-muted-foreground">Total: {filteredClients.length} clientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por DNI, nombre o apellido..."
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
                <TableHead>DNI</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead className="hidden md:table-cell">Dirección</TableHead>
                <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                <TableHead>Préstamos</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {clients.length === 0 
                      ? "No hay clientes registrados" 
                      : "No se encontraron resultados para la búsqueda"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.dni}</TableCell>
                    <TableCell>{client.nombre} {client.apellido}</TableCell>
                    <TableCell className="hidden md:table-cell">{client.direccion}</TableCell>
                    <TableCell className="hidden lg:table-cell">{client.telefono || "-"}</TableCell>
                    <TableCell>{client.loans?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/client/${client.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </Link>
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

export default ClientList;
