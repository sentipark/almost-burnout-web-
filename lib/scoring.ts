import { QuestionCategory } from './questions';

export interface CategoryScores {
  em: number; // 감정적·정서적 고갈
  pe: number; // 개인성취감 감소
  ph: number; // 신체적·생리적 고갈
  or: number; // 조직갈등
  im: number; // 비인격화
  [key: string]: number; // 인덱스 시그니처 추가
}

export interface AssessmentResult {
  categoryScores: CategoryScores;
  aboIndex: number;
  level: 'safe' | 'caution' | 'warning' | 'danger';
  timestamp: string;
  demographics?: {
    gender?: string;
    ageGroup?: string;
  };
}

export function calculateScores(answers: Record<number, number>): CategoryScores {
  const categoryTotals: Record<QuestionCategory, number[]> = {
    em: [],
    pe: [],
    ph: [],
    or: [],
    im: []
  };

  // 문항별 카테고리 매핑
  const questionCategories: Record<number, QuestionCategory> = {
    // em (1-14)
    1: 'em', 2: 'em', 3: 'em', 4: 'em', 5: 'em', 6: 'em', 7: 'em',
    8: 'em', 9: 'em', 10: 'em', 11: 'em', 12: 'em', 13: 'em', 14: 'em',
    // pe (15-18)
    15: 'pe', 16: 'pe', 17: 'pe', 18: 'pe',
    // ph (19-24)
    19: 'ph', 20: 'ph', 21: 'ph', 22: 'ph', 23: 'ph', 24: 'ph',
    // or (25-35)
    25: 'or', 26: 'or', 27: 'or', 28: 'or', 29: 'or', 30: 'or',
    31: 'or', 32: 'or', 33: 'or', 34: 'or', 35: 'or',
    // im (36-39)
    36: 'im', 37: 'im', 38: 'im', 39: 'im'
  };

  // 역채점 문항 (R)
  const reversedQuestions = [12, 14];

  // 점수 집계
  Object.entries(answers).forEach(([questionId, score]) => {
    const id = parseInt(questionId);
    const category = questionCategories[id];
    
    if (category) {
      let finalScore = score;
      // 역채점 처리 (5점 척도 기준: 1->5, 2->4, 3->3, 4->2, 5->1)
      if (reversedQuestions.includes(id)) {
        finalScore = 6 - score;
      }
      categoryTotals[category].push(finalScore);
    }
  });

  // 카테고리별 평균 점수 계산 (0-100 변환)
  const scores: CategoryScores = {
    em: 0,
    pe: 0,
    ph: 0,
    or: 0,
    im: 0
  };

  Object.entries(categoryTotals).forEach(([category, values]) => {
    if (values.length > 0) {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      // 1-5 점수를 0-100으로 변환
      scores[category as QuestionCategory] = ((average - 1) / 4) * 100;
    }
  });

  return scores;
}

export function calculateABOIndex(scores: CategoryScores): number {
  // 가중치 적용
  const weightedScore = 
    scores.em * 0.3 +  // 감정적 고갈 30%
    scores.pe * 0.2 +  // 개인성취감 감소 20%
    scores.ph * 0.2 +  // 신체적 고갈 20%
    scores.or * 0.2 +  // 조직갈등 20%
    scores.im * 0.1;   // 비인격화 10%
  
  return Math.round(weightedScore);
}

export function getBurnoutLevel(aboIndex: number): AssessmentResult['level'] {
  if (aboIndex < 30) return 'safe';
  if (aboIndex < 50) return 'caution';
  if (aboIndex < 70) return 'warning';
  return 'danger';
}

export function getLevelInfo(level: AssessmentResult['level']) {
  const info = {
    safe: {
      label: '안전',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: '번아웃 위험이 낮습니다. 현재의 균형을 유지하세요.'
    },
    caution: {
      label: '주의 필요',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: '번아웃 초기 징후가 보입니다. 예방 조치가 필요합니다.'
    },
    warning: {
      label: '경고',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Almost 단계입니다. 즉시 개입이 필요합니다.'
    },
    danger: {
      label: '위험',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: '심각한 번아웃 상태입니다. 전문적인 도움이 필요합니다.'
    }
  };
  
  return info[level];
}

export interface QuickWin {
  emoji: string;
  title: string;
  description: string;
  duration: string;
  category: string;
}

export function getQuickWins(scores: CategoryScores): QuickWin[] {
  const quickWins: QuickWin[] = [];
  
  // 가장 높은 점수의 카테고리 찾기
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);
  
  const [topCategory, topScore] = sortedCategories[0];
  const [secondCategory, secondScore] = sortedCategories[1];
  
  // 카테고리별 Quick Wins (재미있고 실천 가능한 미션)
  const categoryQuickWins: Record<string, QuickWin[]> = {
    em: [
      {
        emoji: "🚪",
        title: "8시 탈출 작전",
        description: "오늘 저녁 8시, 노트북을 닫고 당당히 퇴근하세요. 세상이 무너지지 않아요!",
        duration: "오늘 저녁",
        category: "감정 회복"
      },
      {
        emoji: "🧘",
        title: "5분 명상 챌린지",
        description: "화장실 가는 척하고 5분만 눈 감고 숨쉬기. 아무도 모를 거예요.",
        duration: "5분",
        category: "감정 회복"
      },
      {
        emoji: "🚶",
        title: "점심 산책 미션",
        description: "점심 먹고 10분만 걸어요. 소화도 되고 머리도 맑아져요!",
        duration: "10분",
        category: "감정 회복"
      }
    ],
    pe: [
      {
        emoji: "🏆",
        title: "작은 승리 일기",
        description: "오늘 내가 해낸 일 3개를 적어보세요. '커피 안 엎음'도 성과예요!",
        duration: "3분",
        category: "성취감 충전"
      },
      {
        emoji: "💝",
        title: "칭찬 릴레이",
        description: "동료에게 진심 담긴 칭찬 한 마디. 부메랑처럼 돌아올 거예요.",
        duration: "1분",
        category: "성취감 충전"
      },
      {
        emoji: "🎁",
        title: "나만의 보상",
        description: "작은 목표 달성하면 좋아하는 간식 먹기. 당신은 그럴 자격이 있어요!",
        duration: "즉시",
        category: "성취감 충전"
      }
    ],
    ph: [
      {
        emoji: "😴",
        title: "11시 수면 약속",
        description: "오늘 밤 11시엔 꼭 침대로! 넷플릭스는 내일도 있어요.",
        duration: "오늘 밤",
        category: "신체 회복"
      },
      {
        emoji: "💧",
        title: "물 마시기 게임",
        description: "커피 대신 물 한 잔. 카페인 말고 수분으로 충전해요!",
        duration: "지금",
        category: "신체 회복"
      },
      {
        emoji: "🤸",
        title: "스트레칭 알람",
        description: "2시간마다 스트레칭 알람. 거북목이 되기 전에!",
        duration: "2분",
        category: "신체 회복"
      }
    ],
    or: [
      {
        emoji: "🙅",
        title: "거절의 기술",
        description: "오늘 불필요한 회의 하나만 정중히 거절해보세요. 세계가 멸망하지 않아요!",
        duration: "오늘",
        category: "관계 정리"
      },
      {
        emoji: "📵",
        title: "디지털 디톡스",
        description: "1시간만 메신저 알림 끄기. 진짜 급한 일은 전화로 올 거예요.",
        duration: "1시간",
        category: "관계 정리"
      },
      {
        emoji: "☕",
        title: "커피 브레이크",
        description: "동료와 가벼운 수다 타임. 일 얘기 금지!",
        duration: "15분",
        category: "관계 정리"
      }
    ],
    im: [
      {
        emoji: "💭",
        title: "나의 즐거움 찾기",
        description: "일과 무관하게 내가 좋아하는 것 3개 떠올리기. 아직 잊지 않았어요!",
        duration: "3분",
        category: "자아 회복"
      },
      {
        emoji: "🎯",
        title: "70% 법칙",
        description: "완벽하지 않아도 괜찮아요. 70%만 해도 충분해요!",
        duration: "지금부터",
        category: "자아 회복"
      },
      {
        emoji: "🌟",
        title: "나만의 시간",
        description: "오늘 30분은 오직 나를 위해. 뭘 해도 좋아요!",
        duration: "30분",
        category: "자아 회복"
      }
    ]
  };
  
  // 상위 카테고리에서 Quick Win 선택
  if (topScore > 50) {
    const wins = categoryQuickWins[topCategory];
    quickWins.push(wins[Math.floor(Math.random() * wins.length)]);
  }
  if (secondScore > 40) {
    const wins = categoryQuickWins[secondCategory];
    quickWins.push(wins[Math.floor(Math.random() * wins.length)]);
  }
  
  // 기본 Quick Win 추가
  quickWins.push({
    emoji: "🌬️",
    title: "즉시 실천! 심호흡",
    description: "지금 바로 3번 깊게 숨쉬기. 1초 만에 시작할 수 있는 가장 쉬운 미션!",
    duration: "10초",
    category: "즉시 실천"
  });
  
  return quickWins.slice(0, 3);
}