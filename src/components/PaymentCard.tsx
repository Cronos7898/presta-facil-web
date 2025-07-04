import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CircleDollarSign, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PaymentRow } from '@/hooks/usePayments';

interface PaymentCardProps {
  payment: PaymentRow;
  onPayClick?: (payment: PaymentRow) => void;
  onViewClient?: (clientId: string) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onPayClick,
  onViewClient
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getCardClassName = () => {
    if (payment.status === 'paid') {
      return 'opacity-60 bg-muted/30 border-muted';
    }
    
    switch (payment.payment_priority) {
      case 'today':
        return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-yellow-50/50 shadow-lg animate-pulse';
      case 'overdue':
        return 'border-l-4 border-l-red-600 bg-red-50/50';
      case 'this-week':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50/50';
      default:
        return 'border-border';
    }
  };

  const getPriorityIcon = () => {
    switch (payment.payment_priority) {
      case 'today':
        return <Bell className="h-4 w-4 text-red-500 animate-bounce" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'this-week':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    if (payment.status === 'paid') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Pagado</Badge>;
    }
    
    switch (payment.payment_priority) {
      case 'today':
        return <Badge variant="destructive" className="animate-pulse">¡Vence Hoy!</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>;
      case 'this-week':
        return <Badge className="bg-yellow-100 text-yellow-800">Esta Semana</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  const getPriorityMessage = () => {
    if (payment.status === 'paid') return null;
    
    switch (payment.payment_priority) {
      case 'today':
        return (
          <div className="flex items-center gap-1 text-sm text-red-600 font-medium">
            <Bell className="h-3 w-3" />
            ¡Vence hoy! Contactar urgente
          </div>
        );
      case 'overdue':
        return (
          <div className="text-sm text-red-600">
            Vencido hace {Math.abs(payment.days_until_due)} días
            {payment.interest_amount > 0 && (
              <span className="font-medium"> - Interés: S/ {payment.interest_amount.toFixed(2)}</span>
            )}
          </div>
        );
      case 'this-week':
        return (
          <div className="text-sm text-yellow-600">
            Vence en {payment.days_until_due} días
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", getCardClassName())}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {getPriorityIcon()}
              <div>
                <button
                  onClick={() => onViewClient?.(payment.client_id)}
                  className="font-medium hover:underline text-left"
                >
                  {payment.client_name}
                </button>
                <div className="text-sm text-muted-foreground">
                  DNI: {payment.client_dni} • Cuota #{payment.installment_number}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {formatDate(payment.due_date)}
              </div>
              <div className="flex items-center gap-1">
                <CircleDollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">
                  S/ {payment.interest_amount > 0 ? payment.total_amount.toFixed(2) : payment.amount.toFixed(2)}
                </span>
                {payment.interest_amount > 0 && (
                  <span className="text-xs text-red-600">
                    (+ S/ {payment.interest_amount.toFixed(2)} interés)
                  </span>
                )}
              </div>
            </div>

            {getPriorityMessage()}
          </div>

          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {payment.status !== 'paid' && (
              <Button
                size="sm"
                onClick={() => onPayClick?.(payment)}
                className={cn(
                  payment.payment_priority === 'today' && "bg-red-500 hover:bg-red-600 animate-pulse",
                  payment.payment_priority === 'overdue' && "bg-red-600 hover:bg-red-700"
                )}
              >
                Pagar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};