import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OldClient {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono?: string;
  email?: string;
  loans: OldLoan[];
}

interface OldLoan {
  id: string;
  monto: number;
  cuotas: number;
  interes: number;
  montoTotal: number;
  fechaInicio: string;
  estado: string;
  schedule: OldPaymentSchedule[];
}

interface OldPaymentSchedule {
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estado: string;
}

export const migrateLocalStorageToSupabase = async () => {
  try {
    const oldClients: OldClient[] = JSON.parse(localStorage.getItem('clients') || '[]');
    
    if (oldClients.length === 0) {
      toast.info('No hay datos para migrar');
      return;
    }

    console.log('Migrando', oldClients.length, 'clientes...');

    for (const oldClient of oldClients) {
      // 1. Insertar cliente
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          dni: oldClient.dni,
          first_name: oldClient.nombre,
          last_name: oldClient.apellido,
          address: oldClient.direccion,
          phone: oldClient.telefono,
          email: oldClient.email
        })
        .select()
        .single();

      if (clientError) {
        if (clientError.code === '23505') {
          // Cliente ya existe, obtenerlo
          const { data: existingClient } = await supabase
            .from('clients')
            .select('*')
            .eq('dni', oldClient.dni)
            .single();
          
          if (existingClient) {
            console.log('Cliente ya existe:', oldClient.dni);
            continue;
          }
        }
        throw clientError;
      }

      // 2. Insertar préstamos
      for (const oldLoan of oldClient.loans) {
        // Calcular día de pago basado en la primera fecha de vencimiento
        const firstPaymentDate = new Date(oldLoan.schedule[0]?.fechaVencimiento);
        const paymentDay = firstPaymentDate.getDate();

        const { data: loan, error: loanError } = await supabase
          .from('loans')
          .insert({
            client_id: client.id,
            amount: oldLoan.monto,
            interest_rate: oldLoan.interes,
            installments: oldLoan.cuotas,
            total_amount: oldLoan.montoTotal,
            start_date: oldLoan.fechaInicio,
            payment_day: paymentDay,
            status: oldLoan.estado === 'activo' ? 'active' : 'completed'
          })
          .select()
          .single();

        if (loanError) throw loanError;

        // 3. Insertar cronograma de pagos
        const installments = oldLoan.schedule.map(payment => ({
          loan_id: loan.id,
          installment_number: payment.numeroCuota,
          due_date: payment.fechaVencimiento,
          amount: payment.montoCuota,
          interest_amount: 0,
          total_amount: payment.montoCuota,
          status: payment.estado === 'pagado' ? 'paid' : 'pending',
          paid_date: payment.estado === 'pagado' ? payment.fechaVencimiento : null
        }));

        const { error: installmentsError } = await supabase
          .from('installments')
          .insert(installments);

        if (installmentsError) throw installmentsError;
      }
    }

    toast.success(`Migración completada: ${oldClients.length} clientes`);
    console.log('Migración completada exitosamente');
    
  } catch (error) {
    console.error('Error en migración:', error);
    toast.error('Error en la migración de datos');
  }
};

export const createSampleData = async () => {
  try {
    // Crear cliente de ejemplo
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        dni: '12345678',
        first_name: 'Juan Carlos',
        last_name: 'Pérez García',
        address: 'Av. Principal 123, Lima',
        phone: '987654321',
        email: 'juan.perez@email.com'
      })
      .select()
      .single();

    if (clientError && clientError.code !== '23505') throw clientError;

    if (client) {
      // Crear préstamo de ejemplo
      const startDate = new Date();
      startDate.setDate(1); // Primer día del mes
      
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .insert({
          client_id: client.id,
          amount: 5000,
          interest_rate: 10,
          installments: 12,
          total_amount: 5500,
          start_date: startDate.toISOString().split('T')[0],
          payment_day: 15, // Día 15 de cada mes
          status: 'active'
        })
        .select()
        .single();

      if (loanError) throw loanError;

      // Crear cronograma de pagos con diferentes estados
      const installments = [];
      const monthlyAmount = 458.33; // 5500 / 12

      for (let i = 1; i <= 12; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i - 1);
        dueDate.setDate(15);

        let status = 'pending';
        let paidDate = null;

        // Simular algunos pagos realizados y otros pendientes
        if (i <= 3) {
          status = 'paid';
          paidDate = dueDate.toISOString();
        } else if (i === 4) {
          // Pago vencido
          status = 'overdue';
        } else if (i === 5) {
          // Vence hoy (ajustar fecha para que sea hoy)
          dueDate.setTime(Date.now());
        } else if (i === 6) {
          // Vence en unos días
          dueDate.setTime(Date.now() + (3 * 24 * 60 * 60 * 1000));
        }

        installments.push({
          loan_id: loan.id,
          installment_number: i,
          due_date: dueDate.toISOString().split('T')[0],
          amount: monthlyAmount,
          interest_amount: 0,
          total_amount: monthlyAmount,
          status,
          paid_date: paidDate
        });
      }

      const { error: installmentsError } = await supabase
        .from('installments')
        .insert(installments);

      if (installmentsError) throw installmentsError;

      toast.success('Datos de ejemplo creados correctamente');
    }
    
  } catch (error) {
    console.error('Error creando datos de ejemplo:', error);
    toast.error('Error al crear datos de ejemplo');
  }
};