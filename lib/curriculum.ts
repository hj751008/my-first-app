export type UnitStatus = "ready" | "planned" | "locked";

export type Unit = {
  id: number;
  title: string;
  description: string;
  prerequisite?: string;
  progress: number;
  status: UnitStatus;
  href?: string;
};

export const middleSchoolGrades = [
  {
    label: "중등 1학년",
    href: "/middle-1",
    description: "수지의 기초를 다시 세우는 출발 학년",
    badge: "추천 시작점",
  },
  {
    label: "중등 2학년",
    href: "/middle-2",
    description: "중1 기반 위에 이어지는 연결 단계",
    badge: "준비 중",
  },
  {
    label: "중등 3학년",
    href: "/middle-3",
    description: "후기 확장을 위한 다음 단계",
    badge: "준비 중",
  },
] as const;

export const middle1Units: Unit[] = [
  {
    id: 1,
    title: "소인수분해",
    description: "수 하나를 가장 작은 기본 블록으로 나누는 감각을 익혀요.",
    progress: 0,
    status: "ready",
    href: "/middle-1/prime-factorization",
  },
  {
    id: 2,
    title: "정수와 유리수",
    description: "양수, 음수, 0을 한 줄 위에 놓고 크기와 계산 흐름을 이해해요.",
    prerequisite: "1단원 소인수분해",
    progress: 0,
    status: "ready",
    href: "/middle-1/integers-and-rational-numbers",
  },
  {
    id: 3,
    title: "문자와 식",
    description: "이름 없는 문자를 수의 자리에 넣어 식을 읽는 연습을 해요.",
    prerequisite: "2단원 정수와 유리수",
    progress: 0,
    status: "ready",
    href: "/middle-1/literal-expressions",
  },
  {
    id: 4,
    title: "좌표평면과 그래프",
    description: "평면 위 위치와 변화량을 함께 읽는 연습을 해요.",
    prerequisite: "3단원 문자와 식",
    progress: 0,
    status: "locked",
  },
  {
    id: 5,
    title: "기본 도형",
    description: "점, 선, 각의 관계를 눈에 보이게 연결해요.",
    prerequisite: "4단원 좌표평면과 그래프",
    progress: 0,
    status: "planned",
  },
  {
    id: 6,
    title: "평면도형의 성질",
    description: "삼각형과 사각형의 성질을 일상적인 모양으로 연결해요.",
    prerequisite: "5단원 기본 도형",
    progress: 0,
    status: "planned",
  },
  {
    id: 7,
    title: "입체도형의 성질",
    description: "상자와 주사위처럼 생긴 입체를 관찰해요.",
    prerequisite: "6단원 평면도형의 성질",
    progress: 0,
    status: "planned",
  },
  {
    id: 8,
    title: "자료의 정리와 해석",
    description: "표와 그래프를 읽으며 숫자 속 이야기를 찾아요.",
    progress: 0,
    status: "planned",
  },
];
