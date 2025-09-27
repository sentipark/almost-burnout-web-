import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { result, demographics } = body;

    if (!result || !result.categoryScores || !result.aboIndex) {
      return NextResponse.json(
        { error: '필수 결과 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // 개인정보 제외한 결과 데이터만 저장
    const shareData = {
      result_data: {
        categoryScores: result.categoryScores,
        aboIndex: result.aboIndex,
        level: result.level,
        timestamp: result.timestamp
      },
      abo_index: result.aboIndex,
      level: result.level,
      category_scores: result.categoryScores,
      demographics: demographics ? {
        gender: demographics.gender,
        ageGroup: demographics.ageGroup
      } : null
    };

    const { data, error } = await supabase
      .from('result_shares')
      .insert(shareData)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: '공유 링크 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://almostburnout.com'}/share/${data.id}`;

    return NextResponse.json({
      success: true,
      shareId: data.id,
      shareUrl
    });

  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}