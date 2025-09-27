-- 주문 테이블
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL, -- 토스페이먼츠용 고유 주문 ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_type TEXT NOT NULL, -- 'basic', 'premium', 'enterprise'
  amount INTEGER NOT NULL, -- 결제 금액 (원)
  currency TEXT DEFAULT 'KRW',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled', 'failed'
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 결제 테이블
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_key TEXT UNIQUE, -- 토스페이먼츠 결제 키
  toss_order_id TEXT NOT NULL, -- 토스페이먼츠 주문 ID
  amount INTEGER NOT NULL,
  method TEXT, -- 'card', 'transfer', 'virtual_account', etc.
  status TEXT DEFAULT 'ready', -- 'ready', 'in_progress', 'waiting_for_deposit', 'done', 'canceled', 'partial_canceled', 'aborted', 'expired'
  approved_at TIMESTAMP WITH TIME ZONE,
  receipt_url TEXT,
  checkout_url TEXT,
  failure_code TEXT,
  failure_message TEXT,
  metadata JSONB, -- 토스페이먼츠 응답 전체 저장
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 주문/결제만 조회 가능
CREATE POLICY "Users can view their own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- 인덱스 생성
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_key ON payments(payment_key);
CREATE INDEX idx_payments_status ON payments(status);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();