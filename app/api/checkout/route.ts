import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CheckoutRequest {
  programType: 'basic' | 'premium' | 'enterprise';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  userId?: string;
}

const PROGRAM_PRICES = {
  basic: 29000,
  premium: 49000,
  enterprise: 99000
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { programType, customerName, customerEmail, customerPhone, userId } = body;

    // 입력값 검증
    if (!programType || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (!PROGRAM_PRICES[programType]) {
      return NextResponse.json(
        { error: '잘못된 프로그램 타입입니다.' },
        { status: 400 }
      );
    }

    const amount = PROGRAM_PRICES[programType];
    const orderId = `ABO_${Date.now()}_${uuidv4().substr(0, 8)}`;

    // Supabase에 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: userId || null,
        program_type: programType,
        amount: amount,
        currency: 'KRW',
        status: 'pending',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: '주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 토스페이먼츠 결제 준비 (실제로는 클라이언트에서 처리)
    const paymentData = {
      orderId: orderId,
      amount: amount,
      orderName: `AlmostBurnOut ${programType.charAt(0).toUpperCase() + programType.slice(1)} 프로그램`,
      customerName: customerName,
      customerEmail: customerEmail,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      failUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/fail`
    };

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentData
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}