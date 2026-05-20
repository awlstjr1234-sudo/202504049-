#!/usr/bin/env bash
set -euo pipefail

# start.sh - 개발용 실행 스크립트
# 사용법: 프로젝트 루트에서 ./start.sh

PORT=${PORT:-5000}
HOST=${HOST:-0.0.0.0}

echo "[start.sh] 포트=${PORT}, 호스트=${HOST} 로 서버 시작 시도"

# 1) Mongo 컨테이너 확인 및 시작
if docker ps --format '{{.Names}}' | grep -q '^mealfit-mongo$'; then
  status=$(docker inspect -f '{{.State.Status}}' mealfit-mongo)
  if [ "$status" = "running" ]; then
    echo "[start.sh] 기존 컨테이너 mealfit-mongo가 실행 중입니다."
  else
    echo "[start.sh] 기존 컨테이너 mealfit-mongo가 존재하지만 정지 상태입니다. 시작합니다..."
    docker start mealfit-mongo
  fi
else
  echo "[start.sh] mealfit-mongo 컨테이너가 없어 새로 생성합니다..."
  docker run -d --name mealfit-mongo -p 27017:27017 mongo:6
fi

# 2) 백엔드 의존성 설치(필요시)
cd backend
if [ ! -d node_modules ]; then
  echo "[start.sh] node_modules가 없습니다. npm install을 실행합니다..."
  npm install
fi

# 3) 서버 실행
echo "[start.sh] 서버를 실행합니다: PORT=${PORT}, HOST=${HOST}"
PORT="$PORT" HOST="$HOST" npm run dev
