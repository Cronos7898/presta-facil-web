
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, DollarSign, Calendar, List } from "lucide-react";

const Dashboard: React.FC = () => {
  const stats = [
    { title: "Clientes Totales", value: 24, icon: <UserPlus className="h-8 w-8 text-lending-primary" />, change: "+20%" },
    { title: "Préstamos Activos", value: 18, icon: <DollarSign className="h-8 w-8 text-lending-secondary" />, change: "+12%" },
    { title: "Por Cobrar", value: "S/ 5,400", icon: <Calendar className="h-8 w-8 text-lending-accent" />, change: "-2%" },
    { title: "Pagos Recibidos", value: "S/ 12,650", icon: <List className="h-8 w-8 text-lending-secondary" />, change: "+8%" }
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
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.change} desde el mes pasado</p>
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
            <ul className="space-y-4">
              {['Juan Pérez', 'María García', 'Carlos López', 'Ana Rodríguez'].map((name, i) => (
                <li key={i} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                      {name.charAt(0)}
                    </div>
                    <span>{name}</span>
                  </div>
                  <span className="text-sm text-gray-500">Hace {i + 1} días</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Próximos Pagos</CardTitle>
            <CardDescription>Cuotas pendientes esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                { name: 'Juan Pérez', amount: 'S/ 250', date: '12/05/2025' },
                { name: 'María García', amount: 'S/ 350', date: '13/05/2025' },
                { name: 'Carlos López', amount: 'S/ 150', date: '14/05/2025' },
                { name: 'Ana Rodríguez', amount: 'S/ 400', date: '15/05/2025' }
              ].map((payment, i) => (
                <li key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p>{payment.name}</p>
                    <p className="text-sm text-gray-500">{payment.date}</p>
                  </div>
                  <span className="font-medium">{payment.amount}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
