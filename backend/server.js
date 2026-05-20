require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.set("trust proxy", true);

const corsOptions = {
  origin: process.env.NODE_ENV === "development" ? true : process.env.FRONTEND_URL,
  credentials: true
};

// 미들웨어
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

// 데이터베이스 연결
connectDB();

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "Meal Fit 백엔드 서버",
    version: "1.0.0",
    status: "running"
  });
});

// 헬스 체크
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// 라우트 등록
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "요청한 엔드포인트를 찾을 수 없습니다."
  });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error("서버 에러:", err);
  res.status(500).json({
    success: false,
    message: "서버 오류가 발생했습니다.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// 서버 시작
app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🍲 Meal Fit 백엔드 서버               ║
╠════════════════════════════════════════╣
║  포트: ${PORT}                         ║
║  환경: ${process.env.NODE_ENV || "development"}               ║
║  URL: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}        ║
╚════════════════════════════════════════╝
  `);
});
