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

정적 페이지이므로 브라우저에서 index.html을 열면 됩니다.

VS Code Live Server 확장 사용 시 루트에서 실행하면 전체 링크가 정상 동작합니다.

## 구현된 기능

- 로그인/회원가입: 로컬 스토리지 기반 계정 생성 및 로그인
- SNS 연동: 카카오/네이버 버튼으로 계정 연동, 연동 해제, SNS 로그인(빠른 회원가입 포함)
- AI 응답: 검색/추천 페이지에서 실시간 타이핑 형태로 응답이 갱신되며, 요청마다 다른 추천 포인트를 생성