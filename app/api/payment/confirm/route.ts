import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 주문 정보 확인
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 금액 검증
    if (order.amount !== amount) {
      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 승인 요청
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount
      })
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error('TossPayments confirm error:', errorData);
      
      // 결제 실패 정보 저장
      await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_key: paymentKey,
          toss_order_id: orderId,
          amount: amount,
          status: 'aborted',
          failure_code: errorData.code,
          failure_message: errorData.message,
          metadata: errorData
        });

      return NextResponse.json(
        { error: errorData.message || '결제 승인에 실패했습니다.' },
        { status: 400 }
      );
    }

    const paymentResult = await tossResponse.json();

    // 결제 성공 - 데이터베이스 업데이트
    const { error: paymentInsertError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        payment_key: paymentKey,
        toss_order_id: orderId,
        amount: amount,
        method: paymentResult.method,
        status: 'done',
        approved_at: new Date(paymentResult.approvedAt).toISOString(),
        receipt_url: paymentResult.receipt?.url,
        metadata: paymentResult
      });

    if (paymentInsertError) {
      console.error('Payment insert error:', paymentInsertError);
    }

    // 주문 상태 업데이트
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id);

    if (orderUpdateError) {
      console.error('Order update error:', orderUpdateError);
    }

    return NextResponse.json({
      success: true,
      payment: paymentResult,
      orderId: order.id
    });

  } catch (error) {
    console.error('Payment confirm API error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}