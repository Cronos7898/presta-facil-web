import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentRow {
  id: string;
  client_id: string;
  client_name: string;
  client_dni: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  days_until_due: number;
  payment_priority: 'today' | 'this-week' | 'overdue' | 'normal';
}

export const usePayments = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('installments')
        .select(`
          id,
          loan_id,
          installment_number,
          due_date,
          amount,
          interest_amount,
          total_amount,
          status,
          paid_date,
          loans!inner(
            id,
            client_id
          )
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Obtener información de clientes por separado
      const clientIds = [...new Set(data.map(item => item.loans.client_id))];
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, dni, first_name, last_name')
        .in('id', clientIds);

      if (clientsError) throw clientsError;

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const processedPayments: PaymentRow[] = data.map(installment => {
        const dueDate = new Date(installment.due_date);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let paymentPriority: PaymentRow['payment_priority'] = 'normal';
        
        if (daysUntilDue < 0) {
          paymentPriority = 'overdue';
        } else if (daysUntilDue === 0) {
          paymentPriority = 'today';
        } else if (daysUntilDue <= 7) {
          paymentPriority = 'this-week';
        }

        // Calcular interés por mora si está vencida
        const interestAmount = daysUntilDue < 0 && installment.status === 'pending' 
          ? Number(installment.amount) * 0.25 * Math.abs(daysUntilDue) / 30
          : installment.interest_amount || 0;

        // Encontrar información del cliente
        const client = clientsData?.find(c => c.id === installment.loans.client_id);
        
        return {
          id: installment.id,
          client_id: installment.loans.client_id,
          client_name: client ? `${client.first_name} ${client.last_name}` : 'Cliente no encontrado',
          client_dni: client?.dni || '',
          loan_id: installment.loan_id,
          installment_number: installment.installment_number,
          due_date: installment.due_date,
          amount: Number(installment.amount),
          interest_amount: interestAmount,
          total_amount: Number(installment.amount) + interestAmount,
          status: installment.status as 'pending' | 'paid' | 'overdue',
          paid_date: installment.paid_date,
          days_until_due: daysUntilDue,
          payment_priority: paymentPriority
        };
      });

      // Filtrar: mes actual + deudas pendientes de meses anteriores
      const filteredPayments = processedPayments.filter(payment => {
        const paymentDate = new Date(payment.due_date);
        const isCurrentMonth = paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        const isPendingFromPreviousMonths = payment.status === 'pending' && paymentDate < today;
        
        return isCurrentMonth || isPendingFromPreviousMonths;
      });

      setPayments(filteredPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Error al cargar los pagos');
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments
  };
};