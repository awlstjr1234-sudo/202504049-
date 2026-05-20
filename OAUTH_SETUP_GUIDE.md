# Meal Fit - OAuth 로그인 완벽 가이드

## 🎯 현재 상황
✅ **이미 구현된 기능:**
- 카카오, 네이버, 구글 OAuth 인증 API
- 아이디/비밀번호 회원가입 및 로그인
- SNS 로그인/연동 UI
- 회원 정보 관리 및 SNS 연동 해제

⚠️ **설정 필요:**
- MongoDB 데이터베이스 연결
- OAuth 클라이언트 설정 확인 (이미 .env에 설정됨)

---

## 🗄️ 1단계: MongoDB 데이터베이스 설정

### 옵션 A: MongoDB Atlas (추천 - 클라우드)

1. **MongoDB Atlas 가입**
   - https://www.mongodb.com/cloud/atlas 방문
   - Google 또는 이메일로 회원가입

2. **클러스터 생성**
   - "Create Deployment" 클릭
   - 무료 Shared 클러스터 선택
   - AWS, 아시아 서울 리전 선택
   - "Create" 클릭

3. **연결 정보 획득**
   - 생성된 클러스터 선택
   - "Connect" 버튼 클릭
   - "Drivers" 선택
   - Node.js 드라이버 선택
   - 연결 문자열 복사 (예: `mongodb+srv://username:password@cluster.mongodb.net/mealfit`)

4. **.env 파일 수정**
   ```bash
   # backend/.env 파일 수정
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mealfit
   ```

### 옵션 B: 로컬 MongoDB
```bash
# Ubuntu/Debian에서 MongoDB 설치
sudo apt-get install -y mongodb

# MongoDB 서비스 시작
sudo systemctl start mongodb

# 상태 확인
sudo systemctl status mongodb
```

---

## 🔐 2단계: OAuth 클라이언트 설정 확인

### 카카오 로그인
1. **카카오 개발자 사이트** (https://developers.kakao.com)에서 앱 생성
2. 설정 → 일반 → App ID 확인
3. 설정 → 보안 → REST API Key, Client Secret 확인
4. `.env` 파일 업데이트:
   ```
   KAKAO_CLIENT_ID=발급받은_클라이언트_아이디
   KAKAO_CLIENT_SECRET=발급받은_클라이언트_시크릿
   ```
5. **리디렉션 URI 등록**: `http://localhost:5000/api/auth/kakao/callback`

### 네이버 로그인
1. **네이버 개발자 센터** (https://developers.naver.com)에서 애플리케이션 등록
2. 기본 정보 확인
3. `.env` 파일 업데이트:
   ```
   NAVER_CLIENT_ID=발급받은_클라이언트_아이디
   NAVER_CLIENT_SECRET=발급받은_클라이언트_시크릿
   ```
4. **리디렉션 URI 등록**: `http://localhost:5000/api/auth/naver/callback`

### 구글 로그인
1. **Google Cloud Console** (https://console.cloud.google.com)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI: `http://localhost:5000/api/auth/google/callback` 등록
4. `.env` 파일 업데이트:
   ```
   GOOGLE_CLIENT_ID=발급받은_클라이언트_아이디
   GOOGLE_CLIENT_SECRET=발급받은_클라이언트_시크릿
   ```

---

## 🚀 3단계: 서버 실행

```bash
# 백엔드 디렉토리에서
cd backend

# 의존성 설치 (처음 한 번만)
npm install

# 서버 시작 (개발 모드)
npm run dev

# 또는 운영 모드
npm start
```

서버가 실행되면 `http://localhost:5000`에서 접속 가능합니다.

---

## 📱 4단계: 기능 테스트

### 로그인 페이지 방문
```
http://localhost:5000/pages/login.html
```

### 테스트 시나리오

#### 1️⃣ 아이디/비밀번호 회원가입
- 회원가입 탭 클릭
- 아이디, 이메일, 비밀번호 입력
- "회원가입" 버튼 클릭
- ✅ 성공: 자동 로그인되고 "회원가입이 완료되었습니다" 메시지 표시

#### 2️⃣ 아이디/비밀번호 로그인
- 로그인 탭 클릭
- 아이디, 비밀번호 입력
- "로그인" 버튼 클릭
- ✅ 성공: "로그인이 완료되었습니다" 메시지 표시

#### 3️⃣ 카카오 로그인/연동
- SNS 버튼 중 카카오 버튼 클릭 (K 버튼)
- 카카오 로그인 페이지 이동
- 카카오 계정 정보 입력
- 앱 접근 권한 동의
- ✅ 성공: 로그인 페이지로 돌아오며 "소셜 로그인/연동이 완료되었습니다" 메시지

#### 4️⃣ 로그인된 상태 확인
- 로그인 후 페이지 새로고침
- "현재 로그인 정보" 섹션에 사용자 정보 표시
- 연동된 SNS 표시

#### 5️⃣ SNS 연동 해제
- 로그인 상태에서 "카카오 연동 해제" 등 버튼 클릭
- ✅ 성공: "카카오 연동이 해제되었습니다" 메시지 표시

#### 6️⃣ 로그아웃
- "로그아웃" 버튼 클릭
- ✅ 성공: "로그아웃되었습니다" 메시지 표시

---

## 🔍 문제 해결

### "Cannot GET /api/auth/kakao/oauth"
- ✅ **원인**: OAuth 클라이언트 ID가 설정되지 않음
- **해결**: `.env` 파일에서 `KAKAO_CLIENT_ID` 값이 비어있지 않은지 확인

### "MongoDB 연결 오류"
- ✅ **원인**: MongoDB가 실행되지 않거나 연결 문자열이 잘못됨
- **해결**: 
  - MongoDB Atlas: 올바른 클러스터 연결 문자열 확인
  - 로컬 MongoDB: `systemctl status mongodb` 또는 `mongod` 명령어로 실행 확인

### "소셜 사용자 정보 조회에 실패했습니다"
- ✅ **원인**: OAuth 리디렉션 URI가 등록되지 않거나 일치하지 않음
- **해결**: 각 플랫폼의 개발자 센터에서 리디렉션 URI 정확히 등록

### "아이디 또는 비밀번호가 일치하지 않습니다"
- ✅ **원인**: 사용자가 존재하지 않거나 비밀번호가 틀림
- **해결**: 
  - 회원가입 페이지에서 계정 생성
  - 비밀번호 대소문자 구분

---

## 📊 데이터베이스 스키마

### User 모델
```javascript
{
  id: String,                    // 사용자 아이디 (소셜 로그인 시 자동 생성)
  email: String,                 // 이메일 (고유)
  password: String,              // 비밀번호 (bcrypt 해시됨)
  name: String,                  // 사용자 이름
  avatar: String,                // 프로필 사진 URL
  loginType: String,             // 로그인 유형: password, kakao, naver, google
  social: {
    kakao: { id: String, linkedAt: Date },
    naver: { id: String, linkedAt: Date },
    google: { id: String, linkedAt: Date }
  },
  lastLogin: Date,               // 마지막 로그인 시간
  settings: {
    monthlyBudget: Number,       // 월간 예산
    preferredCategories: [String],// 선호 카테고리
    preferredDietary: [String]    // 식이 제한
  },
  ingredients: [                 // 보유 재료
    { name: String, addedAt: Date }
  ],
  shopping: [                    // 장보기 리스트
    { name: String, addedAt: Date }
  ],
  timestamps: true               // createdAt, updatedAt 자동 생성
}
```

---

## 🔗 API 엔드포인트

### 인증 관련 API

#### 회원가입
```
POST /api/auth/signup
Body: { id, email, password, passwordConfirm }
Response: { success: boolean, token: string, user: Object }
```

#### 로그인
```
POST /api/auth/login
Body: { id, password }
Response: { success: boolean, token: string, user: Object }
```

#### 소셜 로그인 시작
```
GET /api/auth/{provider}/oauth
provider: kakao | naver | google
Response: 리디렉션 (OAuth 제공자 인증 페이지)
```

#### 소셜 로그인 콜백
```
GET /api/auth/{provider}/callback?code=...&state=...
Response: 리디렉션 (login.html?token=...)
```

### 사용자 관련 API

#### 현재 사용자 정보 조회
```
GET /api/user/me
Headers: { Authorization: "Bearer {token}" }
Response: { success: boolean, user: Object }
```

#### SNS 연동 해제
```
POST /api/user/unlink-social/{provider}
Headers: { Authorization: "Bearer {token}" }
provider: kakao | naver | google
Response: { success: boolean, user: Object }
```

#### 사용자 정보 수정
```
PATCH /api/user/me
Headers: { Authorization: "Bearer {token}" }
Body: { name, avatar, monthlyBudget, preferredCategories, preferredDietary }
Response: { success: boolean, user: Object }
```

---

## 🎓 프론트엔드 코드 구조

### 토큰 관리 (app.js)
```javascript
// 토큰 저장
const setToken = (token) => localStorage.setItem("mealfit_token", token);

// 토큰 조회
const getToken = () => localStorage.getItem("mealfit_token");

// 토큰 삭제
const clearToken = () => localStorage.removeItem("mealfit_token");

// API 헤더에 토큰 포함
const getAuthHeaders = () => ({
  "Authorization": `Bearer ${getToken()}`
});
```

### SNS 버튼 클릭 처리
```javascript
socialButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const provider = button.getAttribute("data-provider");
    window.location.href = `${API_BASE_URL}/auth/${provider}/oauth`;
  });
});
```

### OAuth 콜백 처리
```javascript
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
if (token) {
  setToken(token);
  // 사용자 정보 표시
}
```

---

## ✨ 다음 단계

1. **MongoDB Atlas 설정 완료**
2. **OAuth 클라이언트 ID 획득 및 설정**
3. **서버 실행 및 테스트**
4. **배포 전 보안 설정**
   - `JWT_SECRET` 변경 (프로덕션 환경)
   - `FRONTEND_URL` 설정 (프로덕션 도메인)
   - HTTPS 적용

---

## 📞 지원

문제가 발생하면:
1. 콘솔 에러 메시지 확인
2. 각 플랫폼 개발자 센터에서 설정 재확인
3. `.env` 파일의 환경 변수 값 검증
