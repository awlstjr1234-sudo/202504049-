# 포트 활성화 및 실행 가이드 (Codespaces / 로컬)

이 문서는 `Meal Fit` 프로젝트에서 백엔드 포트(기본 5000)를 활성화하고 서버를 실행하는 모든 단계와 문제 해결 방법을 자세히 설명합니다. 나중에 기억이 나지 않을 때도 이대로 따라하면 됩니다.

목차
- 준비
- Codespaces / GitHub Codespaces에서 포트 공개하기
- 로컬 개발 환경에서 포트 열기
- Docker MongoDB 시작하기
- 백엔드 서버 실행(개발용)
- 확인(헬스체크)
- 문제 해결
- 자주 사용하는 명령 모음

---

## 준비
- 프로젝트 루트: 이 문서는 저장소 루트에서 실행한다고 가정합니다.
- 백엔드 디렉터리: `backend/` (서버 진입점: `backend/server.js`)
- 기본 포트: `5000` (환경변수 `PORT`로 변경 가능)
- 호스트: `0.0.0.0`로 바인딩하면 외부(포트 포워딩)에서 접근 가능

## Codespaces (VS Code Remote / GitHub Codespaces)에서 포트 공개하기
1. 서버를 `0.0.0.0`과 포트 `5000`으로 실행합니다. 예:

```bash
# 저장소 루트에서
cd backend
PORT=5000 HOST=0.0.0.0 npm run dev
```

2. VS Code 창에서 오른쪽 하단(또는 왼쪽 사이드바)에 `Ports` 뷰를 엽니다.
   - Command Palette(Ctrl/Cmd+Shift+P) → `Ports: Focus on Ports View` 로 열 수도 있습니다.
3. 포트 목록에서 `5000`을 찾습니다.
4. 포트 오른쪽의 메뉴(세 점)를 클릭하고 `Make Public` 또는 `Forward Port`를 선택합니다.
   - `Make Public`을 사용하면 외부에서 접근 가능한 Preview URL(예: `https://<codespace>-5000.app.github.dev`)이 생성됩니다.
5. 생성된 URL을 브라우저에서 열어 서비스가 응답하는지 확인합니다.

> 참고: 일부 Codespaces나 조직 설정에서는 포트 공개가 제한될 수 있습니다. 이 경우 조직 관리자에게 포트 포워딩 정책을 요청하세요.

## 로컬 개발 환경에서 포트 열기 (Ubuntu 기준)
1. 서버가 `0.0.0.0`에 바인딩되어 있는지 확인합니다.
2. 방화벽(UFW) 사용 시 해당 포트를 허용합니다.

```bash
sudo ufw allow 5000/tcp
sudo ufw status
```

3. 시스템에서 이미 포트가 사용 중인지 확인:

```bash
ss -ltnp | grep :5000 || true
```

## Docker MongoDB 시작하기
프로젝트는 MongoDB에 의존합니다. Docker로 로컬 MongoDB를 띄우는 명령은 다음과 같습니다.

```bash
# 컨테이너가 이미 있으면 시작
docker start mealfit-mongo || true

# 없으면 새로 실행
docker run -d --name mealfit-mongo -p 27017:27017 mongo:6
```

- 상태 확인:

```bash
docker ps --filter "name=mealfit-mongo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 백엔드 서버 실행(개발용)
1. 의존성 설치 (최초 한 번 또는 `node_modules`가 없을 때):

```bash
cd backend
npm install
```

2. 개발 서버 실행 (포트/호스트 지정):

```bash
PORT=5000 HOST=0.0.0.0 npm run dev
```

- 이 명령은 `nodemon`을 사용하여 소스 변경 시 자동 재시작합니다.
- 서버가 정상적으로 시작되면 콘솔에 포트 정보와 `MongoDB에 성공적으로 연결되었습니다.` 메시지가 표시됩니다.

## 확인(헬스체크)
서버가 정상인지 확인하려면:

```bash
curl http://localhost:5000/health
# 또는 Codespaces에서 공개 URL 사용
curl https://<your-codespace>-5000.app.github.dev/health
```

정상 응답 예시:

```json
{ "status": "OK", "timestamp": "2026-05-20T..." }
```

## 문제 해결
- 포트가 바인딩되지 않음
  - `server.js`에서 `HOST`가 `0.0.0.0`인지 확인합니다.
  - `PORT`가 이미 사용 중이면 다른 포트로 변경하세요.
- MongoDB 연결 실패
  - Docker 컨테이너가 실행 중인지 확인: `docker ps`
  - `MONGODB_URI`가 올바른지(`mongodb://localhost:27017/mealfit`) 확인
- Codespaces 포트가 보이지 않음
  - VS Code의 `Ports` 뷰가 최신인지 새로 고침
  - 조직 정책으로 포트 공개가 제한된 경우 관리자에게 문의
- Github에 푸시가 시크릿으로 차단된 경우
  - `.env` 파일을 Git에서 완전히 제거하고(`git filter-branch` 또는 `git filter-repo`) 강제 푸시 필요

## 자주 사용하는 명령 모음
```bash
# Mongo 컨테이너 시작(없으면 생성)
docker start mealfit-mongo || docker run -d --name mealfit-mongo -p 27017:27017 mongo:6

# 백엔드 실행
cd backend
PORT=5000 HOST=0.0.0.0 npm run dev

# 포트 확인
ss -ltnp | grep :5000 || true

# 헬스체크
curl http://localhost:5000/health
```

## Docker Compose로 전체 서비스 실행하기 (권장)

프로젝트 루트에 `docker-compose.yml` 파일을 추가하면 MongoDB와 백엔드를 함께 컨테이너로 실행할 수 있습니다. 이 저장소에는 예시 `docker-compose.yml`과 `backend/Dockerfile`이 포함되어 있습니다.

빌드 및 실행:

```bash
# 프로젝트 루트에서
docker-compose up --build -d

# 로그 확인
docker-compose logs -f backend
```

중지 및 정리:

```bash
docker-compose down
```

포함된 구성 요약:
- `mongo`: `mongo:6` 이미지, 포트 `27017` 노출
- `backend`: `backend/Dockerfile`로 빌드, `5000` 포트 노출, `MONGODB_URI`는 내부 Docker 네트워크의 `mongo` 호스트를 가리킵니다.

## systemd로 자동 시작(옵션)

개발 서버를 시스템 부팅 시 자동으로 시작하려면 `systemd` 유닛 파일을 사용합니다. 저장소에는 예시 파일이 `systemd/mealfit.service`에 포함되어 있습니다. 실제 시스템에 설치하려면 아래를 따르세요.

1. 예시 파일을 복사하고 경로를 조정합니다.

```bash
sudo cp systemd/mealfit.service /etc/systemd/system/mealfit.service
# 편집: /etc/systemd/system/mealfit.service 내부의 WorkingDirectory와 ExecStart, User 값을 본인 환경에 맞게 수정
sudo systemctl daemon-reload
sudo systemctl enable mealfit.service
sudo systemctl start mealfit.service
sudo systemctl status mealfit.service
```

2. 로그 확인:

```bash
journalctl -u mealfit.service -f
```

주의:
- `ExecStart`가 `/usr/bin/env bash /path/to/repo/start.sh`를 가리키도록 하고, `start.sh` 실행 권한이 있어야 합니다.
- 보안상 `User`에는 루트가 아닌 일반 계정을 설정하세요.

---

문서나 구성 파일을 더 다듬어 드릴까요? 예를 들어 `docker-compose`로 프런트엔드까지 포함하거나, systemd 유닛의 사용자 설정을 자동화하는 스크립트를 만들 수 있습니다.

---

문서가 충분히 상세하지 않은 부분이나, 추가로 자동화(예: systemd 서비스 파일, docker-compose 구성) 원하시면 알려주세요.