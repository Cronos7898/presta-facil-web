-- Crear tabla de métodos de pago
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'qr', 'cash', 'card', etc.
  config JSONB, -- Para guardar configuración específica como QR codes
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar métodos de pago por defecto
INSERT INTO public.payment_methods (name, type) VALUES 
('Yape', 'qr'),
('Pago en Efectivo', 'cash'),
('Tarjeta de Débito/Crédito', 'card');

-- Crear tabla de pagos
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  loan_id UUID NOT NULL,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  interest_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'failed'
  receipt_number VARCHAR(50) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de préstamos actualizada
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  installments INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  payment_day INTEGER NOT NULL, -- Día del mes para pagar (1-31)
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'defaulted'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de cronograma de pagos
CREATE TABLE public.installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  interest_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Actualizar tabla de clientes para que sea compatible
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dni VARCHAR(8) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_payments_loan_id ON public.payments(loan_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX idx_loans_client_id ON public.loans(client_id);
CREATE INDEX idx_installments_loan_id ON public.installments(loan_id);
CREATE INDEX idx_installments_due_date ON public.installments(due_date);
CREATE INDEX idx_installments_status ON public.installments(status);

-- Función para calcular interés por mora (25% mensual)
CREATE OR REPLACE FUNCTION calculate_late_interest(
  original_amount DECIMAL,
  due_date DATE
) RETURNS DECIMAL AS $$
DECLARE
  days_late INTEGER;
  monthly_rate DECIMAL := 0.25;
  daily_rate DECIMAL;
  interest DECIMAL;
BEGIN
  days_late := CURRENT_DATE - due_date;
  
  IF days_late <= 0 THEN
    RETURN 0;
  END IF;
  
  daily_rate := monthly_rate / 30;
  interest := original_amount * daily_rate * days_late;
  
  RETURN ROUND(interest, 2);
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estado de cuotas automáticamente
CREATE OR REPLACE FUNCTION update_installment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la fecha de vencimiento ya pasó y no está pagada, marcar como vencida
  IF NEW.due_date < CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status := 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estado automáticamente
CREATE TRIGGER trigger_update_installment_status
  BEFORE UPDATE ON public.installments
  FOR EACH ROW
  EXECUTE FUNCTION update_installment_status();

-- Función para generar número de recibo
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'REC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('receipt_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para números de recibo
CREATE SEQUENCE IF NOT EXISTS receipt_sequence START 1;

-- Función para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at
  BEFORE UPDATE ON public.installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();