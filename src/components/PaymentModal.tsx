import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, CreditCard, Banknote, Calendar, CircleDollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PaymentRow } from '@/hooks/usePayments';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'qr' | 'cash' | 'card';
  active: boolean;
}

interface PaymentModalProps {
  payment: PaymentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  open,
  onOpenChange,
  onPaymentComplete
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
      generateReceiptNumber();
    }
  }, [open]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setPaymentMethods((data || []) as PaymentMethod[]);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Error al cargar métodos de pago');
    }
  };

  const generateReceiptNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_receipt_number');
      if (error) throw error;
      setReceiptNumber(data || '');
    } catch (error) {
      console.error('Error generating receipt number:', error);
      const fallbackNumber = `REC-${format(new Date(), 'yyyyMMdd')}-${Date.now().toString().slice(-6)}`;
      setReceiptNumber(fallbackNumber);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'qr':
        return <QrCode className="h-6 w-6" />;
      case 'cash':
        return <Banknote className="h-6 w-6" />;
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <CircleDollarSign className="h-6 w-6" />;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'qr':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700';
      case 'cash':
        return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700';
      case 'card':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700';
    }
  };

  const processPayment = async () => {
    if (!payment || !selectedMethod) return;

    setLoading(true);
    try {
      // 1. Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: payment.client_id,
          loan_id: payment.loan_id,
          installment_number: payment.installment_number,
          amount: payment.amount,
          interest_amount: payment.interest_amount,
          total_amount: payment.total_amount,
          payment_method_id: selectedMethod.id,
          due_date: payment.due_date,
          receipt_number: receiptNumber,
          notes: notes.trim() || null
        });

      if (paymentError) throw paymentError;

      // 2. Update installment status
      const { error: installmentError } = await supabase
        .from('installments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (installmentError) throw installmentError;

      toast.success(`Pago registrado exitosamente. Recibo: ${receiptNumber}`);
      onPaymentComplete();
      onOpenChange(false);
      
      // Reset form
      setSelectedMethod(null);
      setNotes('');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5" />
            Registrar Pago
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{payment.client_name}</div>
                  <div className="text-sm text-muted-foreground">DNI: {payment.client_dni}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm">Cuota #{payment.installment_number}</div>
                  <div className="text-xs text-muted-foreground">
                    Vence: {format(new Date(payment.due_date), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm">Monto a pagar:</span>
                <div className="text-right">
                  <div className="font-bold text-lg">S/ {payment.total_amount.toFixed(2)}</div>
                  {payment.interest_amount > 0 && (
                    <div className="text-xs text-red-600">
                      (incluye S/ {payment.interest_amount.toFixed(2)} interés)
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <div className="grid gap-2">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    selectedMethod?.id === method.id
                      ? 'ring-2 ring-primary ' + getMethodColor(method.type)
                      : 'hover:shadow-md ' + getMethodColor(method.type)
                  }`}
                  onClick={() => setSelectedMethod(method)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    {getMethodIcon(method.type)}
                    <span className="font-medium">{method.name}</span>
                    {selectedMethod?.id === method.id && (
                      <Badge variant="default" className="ml-auto">Seleccionado</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Receipt Number */}
          <div className="space-y-2">
            <Label>Número de Recibo</Label>
            <Input
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="Número de recibo"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={processPayment}
              disabled={!selectedMethod || loading}
              className="flex-1"
            >
              {loading ? 'Procesando...' : 'Registrar Pago'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};