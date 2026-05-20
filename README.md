# Meal Fit

예산과 보유 재료를 기반으로 레시피를 추천하는 웹사이트 프로토타입입니다.

## 페이지 구성

- 메인: index.html
- 로그인/회원가입: pages/login.html
- 레시피 검색: pages/search.html
- 메뉴추천: pages/recommend.html
- 레시피 상세: pages/recipe.html
- 재료관리: pages/ingredients.html
- 설정(마이페이지): pages/settings.html

## 실행 방법

정적 페이지이므로 브라우저에서 `index.html`을 열면 됩니다.

VS Code Live Server 확장 사용 시 루트에서 실행하면 전체 링크가 정상 동작합니다.

백엔드 서버를 켜려면 `backend`에서 다음을 실행하세요:

```bash
cd backend
npm install
npm start
```

## 구현된 기능

- 로그인/회원가입: 로컬 스토리지 기반 계정 생성 및 로그인
- SNS 연동: 카카오/네이버 버튼으로 계정 연동, 연동 해제, SNS 로그인(빠른 회원가입 포함)
- AI 응답: 검색/추천 페이지에서 답변 생성 완료 후 한 번에 표시되며, 요청마다 다른 추천 포인트를 생성

## 백엔드 환경 변수

`backend/.env` 또는 `backend/.env.example` 파일에 다음 값을 설정해야 합니다:

- `MONGODB_URI`: MongoDB 연결 문자열
  - 예: `mongodb+srv://<username>:<password>@<cluster-url>/mealfit?retryWrites=true&w=majority`
- `JWT_SECRET`: JWT 서명용 비밀 문자열
- `FRONTEND_URL`: 프론트엔드가 실행되는 주소
  - 예: `http://localhost:3000` 또는 `http://localhost:5500`
- `BACKEND_URL`: 백엔드가 외부에서 접근 가능한 주소
  - 예: `http://localhost:5000`
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Codespaces preview 환경에서 실행할 때

- 프론트엔드/백엔드가 모두 preview URL로 열리는 경우 `FRONTEND_URL`과 `BACKEND_URL`을 아래처럼 실제 preview 주소로 바꾸세요.
  - `https://humble-cod-97pqq457vgvr24v-5000.app.github.dev`
- 만약 프록시 호스트가 변경되면 `BACKEND_URL`과 SNS 리디렉트 URI도 해당 호스트로 등록해야 합니다.

### 카카오 리디렉션 URI 예시

- `http://localhost:5000/api/auth/kakao/callback`

### 네이버 리디렉션 URI 예시

- `http://localhost:5000/api/auth/naver/callback`

### 구글 리디렉션 URI 예시

- `http://localhost:5000/api/auth/google/callback`

## 디버깅

백엔드가 실행 중일 때 아래 URL로 상태를 확인할 수 있습니다:

- `http://localhost:5000/api/auth/status`