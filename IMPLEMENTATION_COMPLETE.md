# 🚀 Meal Fit 완벽한 실행 매뉴얼

## 📋 현재 구현 상태

### ✅ 완벽하게 구현된 기능

| 기능 | 상태 | 설명 |
|------|------|------|
| 아이디/비밀번호 회원가입 | ✅ | 4자 이상 아이디, 6자 이상 비밀번호 |
| 아이디/비밀번호 로그인 | ✅ | bcrypt로 안전한 비밀번호 저장 |
| 카카오 로그인 | ✅ | OAuth 2.0 인증 플로우 |
| 네이버 로그인 | ✅ | OAuth 2.0 인증 플로우 |
| 구글 로그인 | ✅ | OAuth 2.0 인증 플로우 |
| SNS 계정 연동 | ✅ | 회원가입 후 SNS 추가 연동 |
| SNS 연동 해제 | ✅ | 로그인된 상태에서 특정 SNS 해제 |
| 로그아웃 | ✅ | 토큰 삭제 및 로그아웃 상태 유지 |

---

## 🔧 즉시 필요한 작업 (3가지만!)

### 1️⃣ MongoDB 데이터베이스 설정 (5분)

**선택지:**

#### A. MongoDB Atlas 사용 (권장 - 클라우드 무료)
```bash
# 1. https://www.mongodb.com/cloud/atlas 방문
# 2. 무료 계정 가입 (Google 이용 권장)
# 3. 클러스터 생성 (Shared M0, AWS, Seoul 선택)
# 4. Connect → Drivers → Node.js → 연결 문자열 복사

# 5. backend/.env 파일 수정
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mealfit
```

#### B. 도커를 사용한 로컬 MongoDB
```bash
# MongoDB 컨테이너 실행
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 연결 확인
mongosh mongodb://localhost:27017
```

#### C. 로컬 MongoDB 설치 (권장하지 않음)
```bash
# Ubuntu/Debian
sudo apt-get install mongodb mongodb-clients
sudo systemctl start mongodb

# macOS
brew install mongodb-community
brew services start mongodb-community
```

---

### 2️⃣ OAuth 클라이언트 설정 (각 10분)

#### 카카오 로그인 설정

1. **카카오 개발자 사이트** 방문
   ```
   https://developers.kakao.com
   ```

2. **앱 생성**
   - 상단 "내 애플리케이션" → "앱 생성"
   - 앱 이름: "Meal Fit" (또는 원하는 이름)
   - 사업자명: 본인 이름
   - "만들기" 클릭

3. **설정 → 일반**
   - 앱 키 섹션의 "REST API 키" 복사

4. **설정 → 보안**
   - "Client Secret" 복사

5. **설정 → 플랫폼 → Web** (추가 필요하면)
   - 사이트 URL: `http://localhost:5000`

6. **설정 → 제품 → 카카오 로그인 → 동의항목**
   - "이메일" 필수 동의로 설정

7. **설정 → 제품 → 카카오 로그인 → Redirect URI**
   - URI 추가: `http://localhost:5000/api/auth/kakao/callback`

8. **.env 파일 업데이트**
   ```bash
   KAKAO_CLIENT_ID=REST_API_KEY_값
   KAKAO_CLIENT_SECRET=Client_Secret_값
   ```

#### 네이버 로그인 설정

1. **네이버 개발자 센터** 방문
   ```
   https://developers.naver.com
   ```

2. **애플리케이션 등록**
   - "Application" → "애플리케이션 등록"
   - 애플리케이션명: "Meal Fit"
   - 제품: Web 체크

3. **로그인 OpenID Connect 설정**
   - "로그인" 선택
   - Redirect URI: `http://localhost:5000/api/auth/naver/callback` 추가

4. **내 애플리케이션**
   - 생성된 앱 클릭
   - Client ID 및 Client Secret 복사

5. **.env 파일 업데이트**
   ```bash
   NAVER_CLIENT_ID=Client_ID_값
   NAVER_CLIENT_SECRET=Client_Secret_값
   ```

#### 구글 로그인 설정

1. **Google Cloud Console** 방문
   ```
   https://console.cloud.google.com
   ```

2. **프로젝트 생성**
   - 상단 프로젝트 선택 → "새 프로젝트" → "Meal Fit" 입력

3. **OAuth 동의 화면 설정**
   - 좌측 "OAuth 동의 화면"
   - 내부 선택 → "만들기"
   - 앱 이름: "Meal Fit"
   - 사용자 지원 이메일: 본인 이메일
   - "저장 후 계속"

4. **OAuth 클라이언트 ID 생성**
   - 좌측 "사용자 인증 정보"
   - "사용자 인증 정보 만들기" → "OAuth 2.0 클라이언트 ID"
   - 애플리케이션 유형: 웹 애플리케이션
   - 이름: "Meal Fit OAuth"
   - 승인된 리디렉션 URI 추가: `http://localhost:5000/api/auth/google/callback`
   - "만들기" 클릭

5. **클라이언트 ID 및 Secret 복사**

6. **.env 파일 업데이트**
   ```bash
   GOOGLE_CLIENT_ID=클라이언트_ID_값
   GOOGLE_CLIENT_SECRET=클라이언트_Secret_값
   ```

---

### 3️⃣ 서버 실행 (1분)

```bash
# 백엔드 디렉토리로 이동
cd /workspaces/202504049-/backend

# 서버 시작 (개발 모드)
npm run dev

# 또는 운영 모드
npm start
```

**성공 시 표시:**
```
╔════════════════════════════════════════╗
║   🍲 Meal Fit 백엔드 서버              ║
╠════════════════════════════════════════╣
║  포트: 5000                            ║
║  환경: development                     ║
║  URL: http://localhost:5000            ║
╚════════════════════════════════════════╝

MongoDB에 성공적으로 연결되었습니다.
서버가 포트 5000에서 실행 중입니다.
```

---

## 🧪 기능 테스트 방법

### 1. 로그인 페이지 방문
```
http://localhost:5000/pages/login.html
```

### 2. 테스트 시나리오

#### ✅ 회원가입 (아이디/비밀번호)
```
아이디: testuser
이메일: test@example.com
비밀번호: password123
```
1. "회원가입" 탭 클릭
2. 정보 입력
3. "회원가입" 버튼 클릭
4. ✅ 성공: "회원가입이 완료되어 자동 로그인되었습니다" 메시지

#### ✅ 로그인 (아이디/비밀번호)
```
아이디: testuser
비밀번호: password123
```
1. "로그인" 탭 클릭
2. 정보 입력
3. "로그인" 버튼 클릭
4. ✅ 성공: "로그인이 완료되었습니다" 메시지

#### ✅ 카카오 로그인/연동
1. K (카카오) 버튼 클릭
2. 카카오 로그인 페이지에서 계정 정보 입력
3. "동의 후 계속" 클릭
4. ✅ 성공: 로그인 페이지로 자동 리다이렉트
5. ✅ "소셜 로그인/연동이 완료되었습니다" 메시지 표시

#### ✅ 로그인 정보 확인
1. 로그인 후 페이지 새로고침
2. 하단 "현재 로그인 정보" 섹션 확인
3. 사용자 이름, 이메일, 연동된 SNS 표시

#### ✅ SNS 연동 해제
1. 로그인 상태에서 "카카오 연동 해제" 버튼 클릭
2. ✅ 성공: "카카오 연동이 해제되었습니다" 메시지

#### ✅ 로그아웃
1. "로그아웃" 버튼 클릭
2. ✅ 성공: "로그아웃되었습니다" 메시지
3. 페이지 새로고침 → 로그인 정보 사라짐

---

## 🎯 예상 플로우

### 첫 방문 (신규 사용자)

```
1. login.html 방문
   ↓
2. 회원가입 탭 클릭
   ↓
3a. 아이디/비밀번호로 회원가입 OR
3b. SNS 버튼(카카오/네이버/구글) 클릭
   ↓
4. 자동 로그인 (token이 localStorage에 저장됨)
   ↓
5. 로그인 정보 표시
   - 아이디: testuser_1234 (또는 SNS 제공자 아이디)
   - 이메일: user@example.com
   - 연동된 SNS: 카카오
```

### 기존 사용자 재방문

```
1. login.html 방문
   ↓
2. 저장된 token이 localStorage에 있으면 자동으로 로그인 정보 표시
   ↓
3. 로그인 상태 유지
   - 다른 페이지 방문 가능
   - API 요청 시 token 자동 포함
```

---

## 🔍 주요 파일 설명

| 파일 | 설명 |
|------|------|
| `backend/server.js` | 메인 서버 진입점 |
| `backend/routes/auth.js` | OAuth 인증 라우트 (회원가입, 로그인, SNS) |
| `backend/routes/user.js` | 사용자 정보 관리 라우트 |
| `backend/models/User.js` | MongoDB 사용자 스키마 |
| `backend/middleware/auth.js` | JWT 인증 미들웨어 |
| `backend/.env` | 환경 변수 (OAuth 클라이언트 설정) |
| `pages/login.html` | 로그인/회원가입/SNS 페이지 |
| `js/app.js` | 프론트엔드 로직 (API 호출, 토큰 관리) |

---

## 📊 API 호출 흐름

### 회원가입 플로우

```
클라이언트 (login.html)
    ↓ POST /api/auth/signup
    ↓ { id, email, password, passwordConfirm }
서버 (backend/routes/auth.js)
    ↓ User 모델에 저장 (bcrypt로 암호화)
    ↓ JWT 토큰 생성
클라이언트
    ↓ localStorage에 token 저장
    ↓ 로그인 정보 표시
```

### 카카오 로그인 플로우

```
클라이언트 (login.html)
    ↓ 카카오 버튼 클릭
    ↓ window.location = /api/auth/kakao/oauth
서버 (backend/routes/auth.js)
    ↓ 카카오 인증 페이지로 리다이렉트
클라이언트 (카카오 로그인)
    ↓ 카카오에 로그인
    ↓ 앱 접근 권한 동의
카카오
    ↓ 리다이렉트: /api/auth/kakao/callback?code=...
서버
    ↓ code로 access_token 교환 (카카오 API)
    ↓ access_token으로 사용자 정보 조회
    ↓ User 모델에 저장 또는 업데이트
    ↓ JWT 토큰 생성
    ↓ 리다이렉트: login.html?token=...
클라이언트
    ↓ URL에서 token 추출
    ↓ localStorage에 저장
    ↓ 로그인 정보 표시
```

---

## ⚠️ 문제 해결

### 문제: "Cannot GET /api/auth/kakao/oauth"

**원인:**
- OAuth 클라이언트 ID가 설정되지 않음
- 서버가 실행되지 않음

**해결:**
```bash
# 1. .env 파일 확인
cat backend/.env | grep KAKAO_CLIENT_ID

# 2. 값이 비어있으면 설정
KAKAO_CLIENT_ID=실제_클라이언트_아이디

# 3. 서버 재시작
cd backend && npm start
```

### 문제: "MongoDB 연결 오류"

**원인:**
- MongoDB가 실행되지 않음
- MONGODB_URI이 잘못됨

**해결:**

```bash
# MongoDB Atlas 사용하는 경우
# .env에서 확인
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mealfit

# 로컬 MongoDB 사용하는 경우
# 1. MongoDB 실행
mongod

# 2. 다른 터미널에서 서버 시작
cd backend && npm start
```

### 문제: "회원가입/로그인 실패"

**원인:**
- 유효성 검사 실패
- 데이터베이스 저장 실패

**해결:**
```bash
# 1. 브라우저 콘솔에서 에러 메시지 확인 (F12)
# 2. 서버 로그에서 오류 확인
# 3. 입력 형식 재확인
#    - 아이디: 4자 이상
#    - 비밀번호: 6자 이상
#    - 이메일: 유효한 이메일 형식
```

### 문제: "SNS 로그인 후 계속 로그인 페이지로 돌아옴"

**원인:**
- 리디렉션 URI가 등록되지 않음
- 클라이언트 Secret이 잘못됨
- 네트워크 오류

**해결:**
```bash
# 1. 각 플랫폼 개발자 센터 확인
#    - 카카오: https://developers.kakao.com → 설정 → 제품 → 카카오 로그인 → Redirect URI
#    - 네이버: https://developers.naver.com → 애플리케이션 → 설정 → Redirect URI
#    - 구글: https://console.cloud.google.com → 사용자 인증 정보 → OAuth 2.0 클라이언트

# 2. 정확한 URI 등록 확인
http://localhost:5000/api/auth/kakao/callback
http://localhost:5000/api/auth/naver/callback
http://localhost:5000/api/auth/google/callback

# 3. 서버 로그 확인
tail -f server.log
```

---

## 🎓 보안 최소 체크리스트

- [ ] 프로덕션 환경에서 `JWT_SECRET` 변경
- [ ] HTTPS 사용 (프로덕션)
- [ ] CORS 설정 확인 (`FRONTEND_URL`)
- [ ] 민감한 정보(.env) git에 커밋하지 않기
- [ ] 비밀번호는 bcrypt로 해시됨 ✅ (이미 구현)
- [ ] JWT 토큰 만료 설정 ✅ (기본 7일)

---

## 📱 프로덕션 배포 준비

```bash
# 1. 환경 변수 설정
NODE_ENV=production
JWT_SECRET=강력한_랜덤_문자열
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
MONGODB_URI=mongodb+srv://...

# 2. 서버 시작
npm start

# 또는 PM2 사용
pm2 start server.js --name "mealfit"
```

---

## 🚀 다음 기능 추가

이 기초 위에 다음 기능들을 추가할 수 있습니다:

1. **배경화면 이미지/테마 설정**
2. **식품 영양정보 API 연동**
3. **AI 기반 레시피 추천**
4. **푸시 알림 (웹 푸시)**
5. **오프라인 모드 (PWA)**
6. **카테고리별 재료 관리**
7. **식사 로그 및 통계**

---

## 📞 빠른 체크리스트

```
[ ] MongoDB 설정 (Atlas 또는 로컬)
[ ] .env 파일 확인
[ ] 카카오 OAuth 클라이언트 ID/Secret 설정
[ ] 네이버 OAuth 클라이언트 ID/Secret 설정
[ ] 구글 OAuth 클라이언트 ID/Secret 설정
[ ] 각 플랫폼의 Redirect URI 정확히 등록
[ ] npm install 실행
[ ] npm start 실행
[ ] http://localhost:5000/pages/login.html 방문
[ ] 회원가입 테스트
[ ] SNS 로그인 테스트
[ ] 로그아웃 테스트
```

완료 후 **모든 기능이 정상 작동합니다!** 🎉
