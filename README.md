# 수지의 수학 학습 도우미

중학교 2학년 수지가 중1 수학 기초를 다시 익힐 수 있도록 돕는 대화형 웹 앱입니다.

현재 범위:

- 홈 화면
- 중1 단원 목록
- 1단원 소인수분해 소개
- OpenAI 연동 준비가 된 튜터 화면

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## OpenAI 연결

실제 AI 튜터를 사용하려면 환경 변수를 설정하세요.

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5.4
```

로컬에서는 `.env.local` 파일에 넣으면 되고, Vercel에서는 프로젝트 환경 변수로 추가하면 됩니다.

## 배포

이 저장소는 GitHub와 Vercel 자동 배포 흐름을 기준으로 관리합니다.

- `main` 브랜치에 반영
- Vercel 자동 빌드
- 배포 URL 갱신
