export type QuestionCategory = 'em' | 'pe' | 'ph' | 'or' | 'im';

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  isReversed?: boolean;
}

export const questions: Question[] = [
  // 감정적·정서적 고갈 (em)
  { id: 1, text: "나의 업무는 중요하지 않다.", category: "em" },
  { id: 2, text: "업무를 생각하면 무기력해진다.", category: "em" },
  { id: 3, text: "업무를 계속할 의욕이 없다.", category: "em" },
  { id: 4, text: "업무를 생각하면 바다른 길에 서있는 것 같다.", category: "em" },
  { id: 5, text: "업무를 생각하면 기진맥진한 느낌이 든다.", category: "em" },
  { id: 6, text: "퇴근할 때쯤이면 녹초가 된다.", category: "em" },
  { id: 7, text: "아침에 출근할 생각만 해도 피곤하다.", category: "em" },
  { id: 8, text: "업무를 생각하면 결근을 하고 싶다.", category: "em" },
  { id: 9, text: "업무 때문에 가슴이 답답하다.", category: "em" },
  { id: 10, text: "업무를 생각하면 짜증이 난다.", category: "em" },
  { id: 11, text: "삶의 의미가 느껴지지 않는다.", category: "em" },
  { id: 12, text: "퇴근 이후 다양한 여가활동 참여 생각에 즐겁다.", category: "em", isReversed: true },
  { id: 13, text: "예전과 달리 업무에 대한 열정이 없다.", category: "em" },
  { id: 14, text: "업무를 통해서 내가 성장하고 있음을 느낀다.", category: "em", isReversed: true },
  
  // 개인성취감 감소 (pe)
  { id: 15, text: "업무로 인해 좌절감을 느낀다.", category: "pe" },
  { id: 16, text: "직장 내 구성원들에 비해 성과에 대한 보상이 없다.", category: "pe" },
  { id: 17, text: "과중한 업무로 인해 개인시간이 없다.", category: "pe" },
  { id: 18, text: "더 이상 보람을 느끼지 못한다.", category: "pe" },
  
  // 신체적·생리적 고갈 (ph)
  { id: 19, text: "업무 스트레스로 인해 잠을 깊게 자지 못한다.", category: "ph" },
  { id: 20, text: "업무 스트레스로 인해 수시로 피곤함을 느낀다.", category: "ph" },
  { id: 21, text: "업무 스트레스로 인해 두통이 심해진다.", category: "ph" },
  { id: 22, text: "업무 스트레스로 인해 소화불량이 심해진다.", category: "ph" },
  { id: 23, text: "업무 스트레스로 인해 신체적인 이상이 생긴 것 같다.", category: "ph" },
  { id: 24, text: "퇴근 이후에 몸이 아프다.", category: "ph" },
  
  // 조직갈등 (or)
  { id: 25, text: "더 이상 출근하고 싶지 않다.", category: "or" },
  { id: 26, text: "더 이상 직장 내 구성원들과 대화하고 싶지 않다.", category: "or" },
  { id: 27, text: "직장 내 구성원과 감정싸움에 지친다.", category: "or" },
  { id: 28, text: "직장 내 구성원들이 나에게 고통을 주는 존재로 느껴진다.", category: "or" },
  { id: 29, text: "직장 내 구성원들이 나에게만 업무를 미루는 것 같다.", category: "or" },
  { id: 30, text: "직장 내 구성원들과 함께 일하는 것에 스트레스를 받는다.", category: "or" },
  { id: 31, text: "직장 내 구성원의 기대로 부담감을 느낀다.", category: "or" },
  { id: 32, text: "내 조직의 업무환경이 좋지 않다.", category: "or" },
  { id: 33, text: "근무시간 외에는 업무와 관련된 생각을 하고 싶지 않다.", category: "or" },
  { id: 34, text: "근무시간 외에 업무와 관련된 연락이 오면 화가 난다.", category: "or" },
  { id: 35, text: "조직 내에서 나의 존재가 점점 사라지고 있다.", category: "or" },
  
  // 비인격화 (im)
  { id: 36, text: "업무를 생각하면 이직을 하고 싶다.", category: "im" },
  { id: 37, text: "내 자신이 조직의 부속품으로 느껴진다.", category: "im" },
  { id: 38, text: "업무상 만나는 사람을 물건처럼 대하고 있다.", category: "im" },
  { id: 39, text: "나는 직무를 기계적으로 처리하고 있다.", category: "im" },
];

export const categoryNames: Record<QuestionCategory, string> = {
  em: "감정적·정서적 고갈",
  pe: "개인성취감 감소",
  ph: "신체적·생리적 고갈",
  or: "조직갈등",
  im: "비인격화"
};

export const categoryDescriptions: Record<QuestionCategory, string> = {
  em: "업무에 대한 열정과 의미를 잃어가고 있는 상태",
  pe: "성취감과 보람을 느끼지 못하는 상태",
  ph: "신체적으로 지치고 건강에 이상이 생기는 상태",
  or: "조직 및 동료와의 관계에서 갈등을 겪는 상태",
  im: "자신과 타인을 인격체로 대하지 못하는 상태"
};