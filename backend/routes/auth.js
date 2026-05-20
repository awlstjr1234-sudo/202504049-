const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
const User = require("../models/User");

const router = express.Router();
router.use(cookieParser());

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_in_production_12345";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "";
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || "";
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "";
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const generateUniqueUsername = (provider) => {
  return `${provider}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

const getBackendUrl = (req) => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  return `${req.protocol}://${req.get("host")}`;
};

const getFrontendUrl = (req) => {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  return `${req.protocol}://${req.get("host")}`;
};

const getOAuthRedirectUri = (provider, req) => `${getBackendUrl(req)}/api/auth/${provider}/callback`;

const buildSocialProfile = (provider, profile) => {
  if (provider === "kakao") {
    const kakaoAccount = profile.kakao_account || {};
    const kakaoProfile = kakaoAccount.profile || {};
    return {
      providerId: String(profile.id),
      email: kakaoAccount.email,
      name: kakaoProfile.nickname || profile.properties?.nickname || "카카오 사용자",
      avatar: kakaoProfile.profile_image_url || profile.properties?.profile_image || ""
    };
  }

  if (provider === "naver") {
    const user = profile.response || profile;
    return {
      providerId: String(user.id),
      email: user.email,
      name: user.name || user.nickname || "네이버 사용자",
      avatar: user.profile_image || ""
    };
  }

  if (provider === "google") {
    return {
      providerId: String(profile.sub || profile.id),
      email: profile.email,
      name: profile.name || profile.given_name || "구글 사용자",
      avatar: profile.picture || ""
    };
  }

  return null;
};

const getProviderConfig = (provider, req) => {
  const redirectUri = getOAuthRedirectUri(provider, req);

  if (provider === "kakao") {
    return {
      authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
      tokenUrl: "https://kauth.kakao.com/oauth/token",
      userInfoUrl: "https://kapi.kakao.com/v2/user/me",
      scope: "account_email",
      clientId: KAKAO_CLIENT_ID,
      tokenBody: (code) => {
        const body = new URLSearchParams();
        body.set("grant_type", "authorization_code");
        body.set("client_id", KAKAO_CLIENT_ID);
        body.set("redirect_uri", redirectUri);
        body.set("code", code);
        if (KAKAO_CLIENT_SECRET) {
          body.set("client_secret", KAKAO_CLIENT_SECRET);
        }
        return body;
      },
      buildUserInfoHeaders: (token) => ({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      }),
      parseUserInfo: async (data) => data
    };
  }

  if (provider === "naver") {
    return {
      authorizeUrl: "https://nid.naver.com/oauth2.0/authorize",
      tokenUrl: "https://nid.naver.com/oauth2.0/token",
      userInfoUrl: "https://openapi.naver.com/v1/nid/me",
      scope: "profile email",
      clientId: NAVER_CLIENT_ID,
      tokenBody: (code, state) => {
        const body = new URLSearchParams();
        body.set("grant_type", "authorization_code");
        body.set("client_id", NAVER_CLIENT_ID);
        body.set("client_secret", NAVER_CLIENT_SECRET);
        body.set("redirect_uri", redirectUri);
        body.set("code", code);
        body.set("state", state);
        return body;
      },
      buildUserInfoHeaders: (token) => ({
        Authorization: `Bearer ${token}`
      }),
      parseUserInfo: async (data) => data
    };
  }

  if (provider === "google") {
    return {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      scope: "openid email profile",
      clientId: GOOGLE_CLIENT_ID,
      tokenBody: (code) => {
        const body = new URLSearchParams();
        body.set("grant_type", "authorization_code");
        body.set("client_id", GOOGLE_CLIENT_ID);
        body.set("client_secret", GOOGLE_CLIENT_SECRET);
        body.set("redirect_uri", redirectUri);
        body.set("code", code);
        return body;
      },
      buildUserInfoHeaders: (token) => ({
        Authorization: `Bearer ${token}`
      }),
      parseUserInfo: async (data) => data
    };
  }

  return null;
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
};

const createOrUpdateSocialUser = async ({ provider, providerId, email, name, avatar }) => {
  if (!providerId || !email) {
    throw new Error("소셜 사용자 정보에서 필수값을 가져올 수 없습니다.");
  }

  let user = await User.findOne({ [`social.${provider}.id`]: providerId });
  const existingEmailUser = await User.findOne({ email });

  if (!user && existingEmailUser) {
    user = existingEmailUser;
  }

  if (!user) {
    user = new User({
      id: generateUniqueUsername(provider),
      email,
      name,
      avatar,
      loginType: provider,
      password: generateUniqueUsername(`${provider}_password`)
    });
  }

  user.social = user.social || {};
  user.social[provider] = {
    id: providerId,
    linkedAt: new Date()
  };

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  user.loginType = provider;
  user.lastLogin = new Date();

  await user.save();
  return user;
};

const requireProvider = (provider) => {
  if (!["kakao", "naver", "google"].includes(provider)) {
    const err = new Error("지원되지 않는 소셜 제공업체입니다.");
    err.status = 400;
    throw err;
  }
};

const generateState = () => crypto.randomBytes(16).toString("hex");

const verifyState = (req, state) => {
  const cookieState = req.cookies.oauth_state;
  return cookieState && state && cookieState === state;
};

const clearStateCookie = (res) => {
  res.clearCookie("oauth_state");
};

router.post(
  "/signup",
  [
    body("id").trim().isLength({ min: 4 }).withMessage("아이디는 4자 이상이어야 합니다."),
    body("email").isEmail().withMessage("유효한 이메일을 입력해주세요."),
    body("password").isLength({ min: 6 }).withMessage("비밀번호는 6자 이상이어야 합니다."),
    body("passwordConfirm").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("비밀번호 확인이 일치하지 않습니다.");
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const { id, email, password } = req.body;
      const existingUser = await User.findOne({ $or: [{ id }, { email }] });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: existingUser.id === id ? "이미 사용 중인 아이디입니다." : "이미 가입된 이메일입니다."
        });
      }

      const newUser = new User({ id, email, password, loginType: "password" });
      await newUser.save();

      const token = generateToken(newUser._id.toString(), newUser.email);
      return res.status(201).json({ success: true, message: "회원가입이 완료되었습니다.", token, user: newUser.toJSON() });
    } catch (error) {
      console.error("회원가입 오류:", error);
      return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
  }
);

router.post(
  "/login",
  [
    body("id").trim().notEmpty().withMessage("아이디를 입력해주세요."),
    body("password").notEmpty().withMessage("비밀번호를 입력해주세요.")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const { id, password } = req.body;
      const user = await User.findOne({ id }).select("+password");

      if (!user) {
        return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id.toString(), user.email);
      return res.status(200).json({ success: true, message: "로그인이 완료되었습니다.", token, user: user.toJSON() });
    } catch (error) {
      console.error("로그인 오류:", error);
      return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
  }
);

router.get("/:provider/oauth", async (req, res) => {
  try {
    const provider = req.params.provider;
    requireProvider(provider);
    const config = getProviderConfig(provider, req);

    if (!config || !config.clientId) {
      const redirectUrl = `${getFrontendUrl(req)}/pages/login.html?error=${encodeURIComponent(`${provider} OAuth 설정이 누락되었습니다.`)}`;
      return res.redirect(redirectUrl);
    }

    const state = generateState();
    res.cookie("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000
    });

    const authUrl = new URL(config.authorizeUrl);
    authUrl.searchParams.set("client_id", config.clientId);
    authUrl.searchParams.set("redirect_uri", getOAuthRedirectUri(provider, req));
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);

    if (provider === "kakao") {
      authUrl.searchParams.set("scope", config.scope);
    }

    if (provider === "google") {
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("scope", config.scope);
    }

    if (provider === "naver") {
      authUrl.searchParams.set("scope", config.scope);
    }

    return res.redirect(authUrl.toString());
  } catch (error) {
    console.error("OAuth 시작 오류:", error);
    return res.status(500).json({ success: false, message: "OAuth 서버 리다이렉트 중 오류가 발생했습니다." });
  }
});

router.get("/:provider/callback", async (req, res) => {
  try {
    const provider = req.params.provider;
    requireProvider(provider);
    const config = getProviderConfig(provider, req);
    const { code, state } = req.query;

    if (!code) {
      const errorMessage = req.query.error_description || req.query.error || "인증 코드가 없습니다.";
      return res.redirect(`${getFrontendUrl(req)}/pages/login.html?error=${encodeURIComponent(errorMessage)}`);
    }

    if (!verifyState(req, state)) {
      return res.redirect(`${getFrontendUrl(req)}/pages/login.html?error=${encodeURIComponent("OAuth 상태 검증에 실패했습니다.")}`);
    }

    clearStateCookie(res);
    const tokenBody = config.tokenBody(code, state);

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      body: tokenBody
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      const message = tokenData.error_description || tokenData.error || "소셜 토큰 교환에 실패했습니다.";
      console.error("토큰 교환 오류:", tokenData);
      return res.redirect(`${getFrontendUrl(req)}/pages/login.html?error=${encodeURIComponent(message)}`);
    }

    const userResponse = await fetch(config.userInfoUrl, {
      headers: config.buildUserInfoHeaders(tokenData.access_token)
    });

    const userInfo = await userResponse.json();
    if (!userResponse.ok) {
      console.error("유저 정보 조회 오류:", userInfo);
      return res.redirect(`${getFrontendUrl(req)}/pages/login.html?error=${encodeURIComponent("소셜 사용자 정보 조회에 실패했습니다.")}`);
    }

    const profile = buildSocialProfile(provider, userInfo);
    if (!profile || !profile.email) {
      return res.redirect(`${getFrontendUrl(req)}/pages/login.html?error=${encodeURIComponent("소셜 로그인에서 이메일을 가져올 수 없습니다.")}`);
    }

    const user = await createOrUpdateSocialUser({ provider, ...profile });
    const token = generateToken(user._id.toString(), user.email);

    const redirectUrl = new URL(`${getFrontendUrl(req)}/pages/login.html`);
    redirectUrl.searchParams.set("token", token);
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("OAuth 콜백 처리 오류:", error);
    return res.redirect(`${getFrontendUrl(req)}/pages/login.html?error=${encodeURIComponent("OAuth 처리 중 오류가 발생했습니다.")}`);
  }
});

module.exports = router;
