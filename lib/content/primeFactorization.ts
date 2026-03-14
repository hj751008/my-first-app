export const primeFactorizationContent = {
  overview: {
    title: "소인수분해",
    subtitle: "숫자를 기본 블록까지 차근차근 쪼개 보는 연습",
    description:
      "소인수분해는 큰 수를 작은 레고 블록처럼 가장 기본이 되는 소수들의 곱으로 바꿔 보는 감각이야. 앱 안의 모든 문제와 설명은 수지에게 맞게 새로 구성한 학습용 콘텐츠야.",
    checkpoints: [
      "소수와 합성수를 구분할 수 있어?",
      "12를 곱셈 형태로 두 수의 곱으로 여러 번 나눠 볼 수 있어?",
      "더 이상 나눌 수 없는 소수만 남길 때까지 갈 수 있어?",
    ],
  },
  misconceptions: [
    "1도 소수라고 생각하는 경우",
    "2 x 6이나 3 x 4까지만 쓰고 끝내는 경우",
    "소인수분해는 무조건 한 가지 길로만 가야 한다고 생각하는 경우",
    "끝까지 쪼개야 한다는 뜻보다 계산 문제로만 받아들이는 경우",
  ],
  hintCards: [
    {
      title: "가장 작은 블록 보기",
      text: "숫자를 큰 팀이라고 생각해봐. 소인수는 그 팀을 이루는 더 이상 나눌 수 없는 기본 멤버야.",
    },
    {
      title: "두 수의 곱으로 시작하기",
      text: "한 번에 완벽하게 하지 않아도 괜찮아. 먼저 두 수의 곱으로만 바꾸고, 그다음 더 쪼갤 수 있는지 보면 돼.",
    },
    {
      title: "끝까지 가는 기준",
      text: "남아 있는 수가 모두 소수라면 이제 기본 블록까지 다 온 거야.",
    },
  ],
  generatedProblems: [
    {
      id: "pf-easy-1",
      level: "easy",
      prompt: "18을 소인수분해해 보자.",
      answer: "2 x 3 x 3",
      firstHint: "18을 먼저 두 수의 곱으로 나눠 보면 뭐가 떠오를까?",
      secondHint: "18 = 2 x 9처럼 시작하고, 9를 한 번 더 쪼개 봐.",
    },
    {
      id: "pf-easy-2",
      level: "easy",
      prompt: "20을 소인수분해해 보자.",
      answer: "2 x 2 x 5",
      firstHint: "20은 4와 5의 곱으로도 볼 수 있어.",
      secondHint: "4는 아직 소수가 아니니까 한 번 더 나눌 수 있어.",
    },
    {
      id: "pf-mid-1",
      level: "medium",
      prompt: "24를 소인수분해하는 서로 다른 출발 방법 두 가지를 떠올려 보자.",
      answer: "예: 24 = 3 x 8, 24 = 4 x 6",
      firstHint: "정답은 하나지만 시작하는 길은 여러 개일 수 있어.",
      secondHint: "두 길 모두 끝까지 가면 같은 소수들의 곱으로 모이게 돼.",
    },
  ],
  diagnosticQuiz: [
    {
      id: 1,
      prompt: "다음 중 소수는 무엇일까?",
      options: ["1", "4", "7", "9"],
      answer: "7",
      explanation: "7은 1과 자기 자신으로만 나누어지는 소수야.",
    },
    {
      id: 2,
      prompt: "다음 중 12를 두 수의 곱으로 바르게 나타낸 것은 무엇일까?",
      options: ["2 x 5", "3 x 4", "5 x 5", "1 x 10"],
      answer: "3 x 4",
      explanation: "3 x 4는 12가 되고, 소인수분해의 출발점으로 쓰기 좋아.",
    },
    {
      id: 3,
      prompt: "다음 중 12의 소인수분해 결과로 알맞은 것은 무엇일까?",
      options: ["2 x 6", "3 x 4", "2 x 2 x 3", "1 x 12"],
      answer: "2 x 2 x 3",
      explanation: "더 이상 쪼갤 수 없는 소수들만 남겨야 해서 2 x 2 x 3이 맞아.",
    },
  ],
} as const;
