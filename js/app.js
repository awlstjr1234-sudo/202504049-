const recipes = [
  { name: "김치제육볶음", price: 7000, category: "간편요리", icon: "🍲" },
  { name: "스팸달걀덮밥", price: 9000, category: "간편요리", icon: "🍛" },
  { name: "된장찌개", price: 5200, category: "초저가", icon: "🥘" },
  { name: "닭가슴살 샐러드", price: 6800, category: "건강식", icon: "🥗" },
  { name: "참치김치볶음밥", price: 4300, category: "초저가", icon: "🍚" },
  { name: "두부스테이크", price: 6100, category: "건강식", icon: "🍽️" },
  { name: "계란간장밥", price: 2800, category: "초저가", icon: "🥚" },
  { name: "멸치주먹밥", price: 3200, category: "초저가", icon: "🍙" },
  { name: "콩나물국밥", price: 3900, category: "초저가", icon: "🥣" },
  { name: "감자채볶음", price: 3500, category: "초저가", icon: "🥔" },
  { name: "김치볶음밥", price: 4800, category: "초저가", icon: "🍳" },
  { name: "우동", price: 5600, category: "간편요리", icon: "🍜" },
  { name: "카레라이스", price: 6200, category: "간편요리", icon: "🍛" },
  { name: "오므라이스", price: 7300, category: "간편요리", icon: "🍅" },
  { name: "토마토파스타", price: 7800, category: "간편요리", icon: "🍝" },
  { name: "크림파스타", price: 8700, category: "간편요리", icon: "🧀" },
  { name: "소고기무국", price: 8200, category: "간편요리", icon: "🍲" },
  { name: "비빔국수", price: 5400, category: "간편요리", icon: "🥢" },
  { name: "불고기덮밥", price: 9500, category: "간편요리", icon: "🥩" },
  { name: "마파두부", price: 7600, category: "간편요리", icon: "🌶️" },
  { name: "그릭요거트볼", price: 5900, category: "건강식", icon: "🥣" },
  { name: "닭가슴살 또띠아", price: 7400, category: "건강식", icon: "🌯" },
  { name: "연어포케", price: 9800, category: "건강식", icon: "🍣" },
  { name: "현미채소비빔밥", price: 6900, category: "건강식", icon: "🥬" },
  { name: "렌틸콩 샐러드", price: 6600, category: "건강식", icon: "🥗" },
  { name: "두부김치샐러드", price: 5700, category: "건강식", icon: "🥗" },
  { name: "닭가슴살 월남쌈", price: 8800, category: "건강식", icon: "🥬" },
  { name: "버섯들깨수프", price: 6300, category: "건강식", icon: "🍄" },
  { name: "아보카도오픈샌드", price: 7100, category: "건강식", icon: "🥑" },
  { name: "순두부찌개", price: 5200, category: "초저가", icon: "🍲" },
  { name: "김치말이국수", price: 4500, category: "초저가", icon: "🍜" },
  { name: "참치마요덮밥", price: 4900, category: "초저가", icon: "🍚" },
  { name: "두부계란탕", price: 4100, category: "초저가", icon: "🥣" },
  { name: "어묵탕", price: 4600, category: "초저가", icon: "🍢" },
  { name: "미역국", price: 3800, category: "초저가", icon: "🥬" }
];

const AUTH_USERS_KEY = "mealfit_users";
const AUTH_SESSION_KEY = "mealfit_session";
const OWNED_INGREDIENTS_KEY = "mealfit_owned_ingredients";
const SHOPPING_ITEMS_KEY = "mealfit_shopping_items";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getNowLabel() {
  const date = new Date();
  return `${date.toLocaleDateString("ko-KR")} ${date.toLocaleTimeString("ko-KR")}`;
}

function randomPick(list) {
  if (!list.length) return "";
  return list[Math.floor(Math.random() * list.length)];
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function findUserById(users, userId) {
  return users.find((user) => user.id === userId) || null;
}

function getSessionUser(users) {
  const session = loadSession();
  if (!session || !session.userId) return null;
  return findUserById(users, session.userId);
}

function getLoginTypeLabel(loginType) {
  const map = {
    password: "일반 로그인",
    signup: "회원가입 직후 로그인",
    kakao: "카카오",
    naver: "네이버",
    google: "구글"
  };
  return map[loginType] || "알 수 없음";
}

function createAccountSummaryHtml(user, session, title = "계정 정보") {
  const linked = [];
  if (user.social && user.social.kakao) linked.push("카카오");
  if (user.social && user.social.naver) linked.push("네이버");
  if (user.social && user.social.google) linked.push("구글");

  const linkedText = linked.length ? linked.join(", ") : "없음";
  const loginType = session && session.loginType ? getLoginTypeLabel(session.loginType) : "미확인";

  return `
    <article class="account-summary-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="account-summary-grid">
        <div><span>아이디</span><strong>${escapeHtml(user.id)}</strong></div>
        <div><span>이메일</span><strong>${escapeHtml(user.email || "미입력")}</strong></div>
        <div><span>로그인 방식</span><strong>${escapeHtml(loginType)}</strong></div>
        <div><span>SNS 연동</span><strong>${escapeHtml(linkedText)}</strong></div>
      </div>
    </article>
  `;
}

function formatWon(value) {
  return Number(value).toLocaleString("ko-KR") + "원";
}

function createRecipeCard(recipe) {
  const detailHref = `recipe.html?menu=${encodeURIComponent(recipe.name)}`;
  return `
    <article class="recipe-card">
      <div class="thumb">${recipe.icon}</div>
      <div class="recipe-info">
        <strong>${recipe.name}</strong>
        <div class="inline-between">
          <span>${recipe.category}</span>
          <span class="price">약 ${formatWon(recipe.price)}</span>
        </div>
        <a class="btn primary" href="${detailHref}">레시피 보기</a>
      </div>
    </article>
  `;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getRecipeMarketFactor(recipeName) {
  const now = new Date();
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const hash = hashString(`${recipeName}-${daySeed}`);
  const offsetPercent = (hash % 17) - 8;
  return 1 + offsetPercent / 100;
}

function roundToHundred(value) {
  return Math.max(100, Math.round(value / 100) * 100);
}

function buildRecipeDetail(recipe) {
  const profileByKeyword = [
    {
      test: /김치제육|제육/,
      ingredients: [
        { name: "돼지고기", amount: "220g", baseCost: 2800 },
        { name: "김치", amount: "180g", baseCost: 1400 },
        { name: "양파", amount: "1/2개", baseCost: 600 },
        { name: "고추장", amount: "1큰술", baseCost: 300 },
        { name: "간장", amount: "1큰술", baseCost: 200 }
      ],
      steps: [
        "양파를 먼저 볶아 단맛을 끌어낸 뒤 돼지고기를 센 불에 익힙니다.",
        "김치를 넣고 수분이 줄어들 때까지 볶아 감칠맛을 올립니다.",
        "고추장과 간장을 넣어 양념을 고르게 입힙니다.",
        "약불에서 1분 마무리해 밥과 함께 제공합니다."
      ],
      substitutes: ["돼지고기 -> 닭다리살", "김치 -> 신김치+식초 소량", "고추장 -> 고춧가루+된장 소량"]
    },
    {
      test: /된장찌개|순두부찌개|찌개/,
      ingredients: [
        { name: "된장/순두부", amount: "된장 1.5큰술 또는 순두부 300g", baseCost: 1200 },
        { name: "애호박", amount: "1/3개", baseCost: 500 },
        { name: "양파", amount: "1/2개", baseCost: 600 },
        { name: "두부", amount: "150g", baseCost: 700 },
        { name: "멸치육수", amount: "500ml", baseCost: 500 }
      ],
      steps: [
        "육수에 된장을 풀고 중불에서 끓여 기본 맛을 만듭니다.",
        "양파와 애호박을 넣고 3분간 끓입니다.",
        "두부 또는 순두부를 넣고 한소끔 더 끓입니다.",
        "간을 보고 부족하면 국간장으로 보정합니다."
      ],
      substitutes: ["멸치육수 -> 쌀뜨물", "애호박 -> 감자", "두부 -> 버섯"]
    },
    {
      test: /파스타|토마토|크림/,
      ingredients: [
        { name: "파스타면", amount: "120g", baseCost: 1200 },
        { name: "토마토소스/크림소스", amount: "150g", baseCost: 2100 },
        { name: "양파", amount: "1/2개", baseCost: 600 },
        { name: "마늘", amount: "2쪽", baseCost: 300 },
        { name: "치즈", amount: "20g", baseCost: 700 }
      ],
      steps: [
        "면을 소금물에 7~8분 삶아 체에 밭쳐둡니다.",
        "팬에 마늘과 양파를 볶아 향을 낸 뒤 소스를 넣습니다.",
        "삶은 면을 넣고 소스가 고르게 묻도록 2분간 볶습니다.",
        "치즈를 올려 농도를 맞추고 후추로 마무리합니다."
      ],
      substitutes: ["파스타면 -> 우동면", "치즈 -> 우유+버터 소량", "양파 -> 대파"]
    },
    {
      test: /덮밥|비빔밥|오므라이스|볶음밥|밥/,
      ingredients: [
        { name: "밥", amount: "1공기", baseCost: 1000 },
        { name: "주재료", amount: "돼지고기/참치/계란 중 1", baseCost: 1800 },
        { name: "양파", amount: "1/3개", baseCost: 400 },
        { name: "간장", amount: "1큰술", baseCost: 200 },
        { name: "식용유", amount: "1큰술", baseCost: 100 }
      ],
      steps: [
        "주재료를 먼저 볶아 향과 식감을 만듭니다.",
        "양파를 넣어 단맛을 더하고 밥을 투입합니다.",
        "간장으로 간을 맞추며 전체를 고르게 볶습니다.",
        "기호에 맞춰 김가루 또는 계란을 올려 마무리합니다."
      ],
      substitutes: ["주재료(돼지고기) -> 참치", "주재료(참치) -> 두부", "밥 -> 현미밥"]
    },
    {
      test: /국수|우동|국밥|국|탕|수프/,
      ingredients: [
        { name: "면/밥", amount: "면 120g 또는 밥 1공기", baseCost: 1100 },
        { name: "육수", amount: "550ml", baseCost: 1000 },
        { name: "대파", amount: "1/2대", baseCost: 400 },
        { name: "부재료", amount: "어묵/콩나물/버섯 중 1", baseCost: 1300 },
        { name: "간장", amount: "1큰술", baseCost: 200 }
      ],
      steps: [
        "육수를 끓인 뒤 부재료를 먼저 넣어 맛을 우려냅니다.",
        "면 또는 밥을 넣고 2~4분간 끓여 익힙니다.",
        "간장으로 염도를 맞추고 대파를 넣습니다.",
        "후추 또는 고춧가루로 기호에 맞게 마무리합니다."
      ],
      substitutes: ["육수 -> 물+다시다 소량", "어묵 -> 두부", "대파 -> 쪽파"]
    },
    {
      test: /샐러드|포케|요거트|또띠아|월남쌈|아보카도/,
      ingredients: [
        { name: "채소믹스", amount: "120g", baseCost: 1800 },
        { name: "단백질", amount: "닭가슴살/연어/두부 120g", baseCost: 2700 },
        { name: "드레싱", amount: "2큰술", baseCost: 600 },
        { name: "부재료", amount: "견과/옥수수/토마토", baseCost: 1000 },
        { name: "또띠아/곡물", amount: "1장 또는 80g", baseCost: 900 }
      ],
      steps: [
        "채소를 차갑게 준비해 식감을 살립니다.",
        "단백질 재료를 굽거나 데쳐 한입 크기로 준비합니다.",
        "볼에 재료를 층층이 담고 드레싱을 뿌립니다.",
        "또띠아 또는 곡물을 곁들여 한 끼 구성을 완성합니다."
      ],
      substitutes: ["연어 -> 닭가슴살", "드레싱 -> 올리브유+레몬즙", "견과 -> 병아리콩"]
    }
  ];

  const categoryFallback = {
    "초저가": {
      ingredients: [
        { name: "주재료", amount: "1인분", baseCost: 1500 },
        { name: "양파", amount: "1/3개", baseCost: 400 },
        { name: "간장", amount: "1큰술", baseCost: 200 },
        { name: "고춧가루", amount: "1작은술", baseCost: 200 },
        { name: "식용유", amount: "1큰술", baseCost: 100 }
      ],
      steps: [
        "주재료를 손질하고 팬 또는 냄비를 예열합니다.",
        "양파와 함께 주재료를 볶거나 끓입니다.",
        "간장과 고춧가루로 간을 맞춥니다.",
        "불을 줄여 1분 더 익혀 마무리합니다."
      ],
      substitutes: ["양파 -> 대파", "간장 -> 소금", "식용유 -> 참기름 소량"]
    },
    "간편요리": {
      ingredients: [
        { name: "주재료", amount: "1인분", baseCost: 2600 },
        { name: "탄수화물", amount: "밥/면 1인분", baseCost: 1100 },
        { name: "양파", amount: "1/2개", baseCost: 600 },
        { name: "양념", amount: "2큰술", baseCost: 500 },
        { name: "부재료", amount: "1가지", baseCost: 900 }
      ],
      steps: [
        "팬을 달군 뒤 주재료를 먼저 익힙니다.",
        "탄수화물 재료를 넣고 함께 조리합니다.",
        "양념을 넣고 수분을 맞춥니다.",
        "부재료로 식감을 더해 완성합니다."
      ],
      substitutes: ["주재료 -> 두부", "양념 -> 굴소스", "양파 -> 대파"]
    },
    "건강식": {
      ingredients: [
        { name: "채소", amount: "120g", baseCost: 1700 },
        { name: "단백질", amount: "120g", baseCost: 2500 },
        { name: "곡물", amount: "80g", baseCost: 900 },
        { name: "드레싱", amount: "2큰술", baseCost: 600 },
        { name: "토핑", amount: "견과류 10g", baseCost: 600 }
      ],
      steps: [
        "채소를 씻어 물기를 제거합니다.",
        "단백질 재료를 굽거나 데쳐 준비합니다.",
        "채소와 곡물을 담고 단백질을 올립니다.",
        "드레싱과 토핑으로 마무리합니다."
      ],
      substitutes: ["단백질(닭) -> 두부", "곡물 -> 고구마", "견과류 -> 병아리콩"]
    }
  };

  const profile = profileByKeyword.find((item) => item.test.test(recipe.name)) || categoryFallback[recipe.category] || categoryFallback["간편요리"];
  const marketFactor = getRecipeMarketFactor(recipe.name);

  const ingredients = profile.ingredients.map((item) => ({
    ...item,
    estimatedCost: roundToHundred(item.baseCost * marketFactor)
  }));

  const totalFromIngredients = ingredients.reduce((acc, item) => acc + item.estimatedCost, 0);
  const estimatedPrice = roundToHundred((totalFromIngredients * 0.7) + (recipe.price * 0.3));
  const lowestPrice = roundToHundred(Math.min(estimatedPrice * 0.9, recipe.price * 0.88));
  const saving = Math.max(0, estimatedPrice - lowestPrice);

  return {
    ingredients,
    steps: profile.steps,
    substitutes: profile.substitutes,
    estimatedPrice,
    lowestPrice,
    saving
  };
}

function initRecipeDetail() {
  const titleEl = document.getElementById("detailTitle");
  const ingredientsEl = document.getElementById("detailIngredients");
  const priceEl = document.getElementById("detailPrice");
  const priceMetaEl = document.getElementById("detailPriceMeta");
  const stepsEl = document.getElementById("detailSteps");
  const subsEl = document.getElementById("detailSubs");
  const aiNoteEl = document.getElementById("detailAiNote");

  if (!titleEl || !ingredientsEl || !priceEl || !stepsEl || !subsEl) return;

  const params = new URLSearchParams(window.location.search);
  const selectedMenu = params.get("menu") || "";
  const recipe = recipes.find((item) => item.name === selectedMenu) || recipes[0];
  const detail = buildRecipeDetail(recipe);

  titleEl.textContent = `${recipe.name} 상세`;

  ingredientsEl.innerHTML = detail.ingredients
    .map((item) => `<li>${escapeHtml(item.name)} ${escapeHtml(item.amount)} · 약 ${formatWon(item.estimatedCost)}</li>`)
    .join("");

  priceEl.textContent = `약 ${formatWon(detail.estimatedPrice)}`;

  if (priceMetaEl) {
    priceMetaEl.textContent = `메뉴별 AI 분석 최저가 ${formatWon(detail.lowestPrice)} | 절약 예상 ${formatWon(detail.saving)}`;
  }

  stepsEl.innerHTML = detail.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  subsEl.innerHTML = detail.substitutes.map((sub) => `<li>${escapeHtml(sub)}</li>`).join("");

  if (aiNoteEl) {
    aiNoteEl.textContent = `${recipe.name} 기준으로 재료량/예상 단가/조리 순서를 한 번에 생성했습니다.`;
  }
}

function createAiSummaryHtml(title, lines) {
  const items = lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  return `
    <article class="ai-summary-card">
      <h3>${escapeHtml(title)}</h3>
      <ul>${items}</ul>
    </article>
  `;
}

function activateChipGroup(container) {
  if (!container) return;

  container.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("chip")) return;

    container.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
    target.classList.add("active");
  });
}

function createStreamer(container, metaElement) {
  const state = {
    timer: null,
    requestId: 0
  };

  return (title, lines) => {
    state.requestId += 1;
    const activeRequestId = state.requestId;
    if (state.timer) clearTimeout(state.timer);

    if (metaElement) {
      metaElement.textContent = "AI 답변 생성 중...";
    }

    state.timer = setTimeout(() => {
      if (activeRequestId !== state.requestId) {
        return;
      }

      container.innerHTML = createAiSummaryHtml(title, lines);

      if (metaElement) {
        metaElement.textContent = `마지막 갱신: ${getNowLabel()}`;
      }
    }, 500);
  };
}

function initLogin() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const notice = document.getElementById("authNotice");
  const status = document.getElementById("authStatus");
  const loginTab = document.getElementById("showLoginBtn");
  const signupTab = document.getElementById("showSignupBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const unlinkKakaoBtn = document.getElementById("unlinkKakaoBtn");
  const unlinkNaverBtn = document.getElementById("unlinkNaverBtn");
  const socialButtons = document.querySelectorAll(".social[data-provider]");

  if (!loginForm || !signupForm || !notice || !status || !loginTab || !signupTab) return;

  const showNotice = (message, isError) => {
    notice.textContent = message;
    notice.style.display = "block";
    notice.style.background = isError ? "#fce8e3" : "#eef6e7";
    notice.style.borderColor = isError ? "#e2b1a4" : "#c8dab2";
    notice.style.color = isError ? "#7a3425" : "#2f4b21";
  };

  const switchTab = (target) => {
    const loginMode = target === "login";
    loginForm.style.display = loginMode ? "grid" : "none";
    signupForm.style.display = loginMode ? "none" : "grid";
    loginTab.classList.toggle("active", loginMode);
    signupTab.classList.toggle("active", !loginMode);
  };

  const renderStatus = () => {
    const users = loadUsers();
    const user = getSessionUser(users);
    const session = loadSession();

    if (!user) {
      status.innerHTML = '<p class="notice">현재 로그인된 계정이 없습니다.</p>';
      return;
    }

    status.innerHTML = createAccountSummaryHtml(user, session, "현재 계정");
  };

  loginTab.addEventListener("click", () => switchTab("login"));
  signupTab.addEventListener("click", () => switchTab("signup"));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idInput = document.getElementById("loginId");
    const passwordInput = document.getElementById("loginPassword");
    if (!(idInput instanceof HTMLInputElement) || !(passwordInput instanceof HTMLInputElement)) return;

    const userId = idInput.value.trim();
    const password = passwordInput.value;

    const users = loadUsers();
    const user = users.find((item) => item.id === userId && item.password === password);
    if (!user) {
      showNotice("아이디 또는 비밀번호가 일치하지 않습니다.", true);
      return;
    }

    saveSession({ userId: user.id, loginType: "password", updatedAt: Date.now() });
    renderStatus();
    showNotice("로그인 성공! SNS 연동 또는 메뉴 추천 기능을 이용해보세요.", false);
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idInput = document.getElementById("signupId");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const confirmInput = document.getElementById("signupPasswordConfirm");
    if (
      !(idInput instanceof HTMLInputElement) ||
      !(emailInput instanceof HTMLInputElement) ||
      !(passwordInput instanceof HTMLInputElement) ||
      !(confirmInput instanceof HTMLInputElement)
    ) {
      return;
    }

    const id = idInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (id.length < 4) {
      showNotice("아이디는 4자 이상 입력해주세요.", true);
      return;
    }

    if (password.length < 6) {
      showNotice("비밀번호는 6자 이상 입력해주세요.", true);
      return;
    }

    if (password !== confirm) {
      showNotice("비밀번호 확인 값이 일치하지 않습니다.", true);
      return;
    }

    const users = loadUsers();
    if (users.some((user) => user.id === id)) {
      showNotice("이미 사용 중인 아이디입니다.", true);
      return;
    }

    const newUser = {
      id,
      email,
      password,
      social: { kakao: false, naver: false, google: false },
      createdAt: Date.now()
    };
    users.push(newUser);
    saveUsers(users);
    saveSession({ userId: newUser.id, loginType: "signup", updatedAt: Date.now() });

    switchTab("login");
    loginForm.reset();
    signupForm.reset();
    renderStatus();
    showNotice("회원가입이 완료되어 자동 로그인되었습니다.", false);
  });

  socialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!(button instanceof HTMLElement)) return;
      const provider = button.getAttribute("data-provider");
      if (!provider) return;

      const users = loadUsers();
      const currentUser = getSessionUser(users);

      const providerLabel = { kakao: "카카오", naver: "네이버", google: "구글" }[provider] || provider;

      if (currentUser) {
        currentUser.social = currentUser.social || { kakao: false, naver: false, google: false };
        currentUser.social[provider] = true;
        saveUsers(users);
        renderStatus();
        showNotice(`${providerLabel} 계정 연동이 완료되었습니다.`, false);
        return;
      }

      const linkedUser = users.find((user) => user.social && user.social[provider]);
      if (linkedUser) {
        saveSession({ userId: linkedUser.id, loginType: provider, updatedAt: Date.now() });
        renderStatus();
        showNotice(`${providerLabel} 연동 계정으로 로그인되었습니다.`, false);
        return;
      }

      const suffix = Math.floor(1000 + Math.random() * 9000);
      const quickUser = {
        id: `${provider}_user_${suffix}`,
        email: `${provider}${suffix}@mealfit.local`,
        password: `${provider}_${suffix}`,
        social: { kakao: provider === "kakao", naver: provider === "naver", google: provider === "google" },
        createdAt: Date.now()
      };

      users.push(quickUser);
      saveUsers(users);
      saveSession({ userId: quickUser.id, loginType: provider, updatedAt: Date.now() });
      renderStatus();
      showNotice(`${providerLabel} 빠른 회원가입 후 로그인되었습니다.`, false);
    });
  });

  if (unlinkKakaoBtn) {
    unlinkKakaoBtn.addEventListener("click", () => {
      const users = loadUsers();
      const user = getSessionUser(users);
      if (!user) {
        showNotice("로그인 후 연동 해제를 진행해주세요.", true);
        return;
      }
      user.social = user.social || { kakao: false, naver: false };
      user.social.kakao = false;
      saveUsers(users);
      renderStatus();
      showNotice("카카오 연동이 해제되었습니다.", false);
    });
  }

  const unlinkGoogleBtn = document.getElementById("unlinkGoogleBtn");

  if (unlinkNaverBtn) {
    unlinkNaverBtn.addEventListener("click", () => {
      const users = loadUsers();
      const user = getSessionUser(users);
      if (!user) {
        showNotice("로그인 후 연동 해제를 진행해주세요.", true);
        return;
      }
      user.social = user.social || { kakao: false, naver: false, google: false };
      user.social.naver = false;
      saveUsers(users);
      renderStatus();
      showNotice("네이버 연동이 해제되었습니다.", false);
    });
  }

  if (unlinkGoogleBtn) {
    unlinkGoogleBtn.addEventListener("click", () => {
      const users = loadUsers();
      const user = getSessionUser(users);
      if (!user) {
        showNotice("로그인 후 연동 해제를 진행해주세요.", true);
        return;
      }
      user.social = user.social || { kakao: false, naver: false, google: false };
      user.social.google = false;
      saveUsers(users);
      renderStatus();
      showNotice("구글 연동이 해제되었습니다.", false);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      saveSession(null);
      renderStatus();
      showNotice("로그아웃되었습니다.", false);
    });
  }

  renderStatus();
}

function initRecommend() {
  const list = document.getElementById("recommendList");
  const budgetFilter = document.getElementById("budgetFilter");
  const aiButton = document.getElementById("recommendAiBtn");
  const askAiMenuBtn = document.getElementById("askAiMenuBtn");
  const aiMenuPrompt = document.getElementById("aiMenuPrompt");
  const aiResult = document.getElementById("recommendAiResult");
  const aiMeta = document.getElementById("recommendAiMeta");
  if (!list || !budgetFilter) return;

  const streamAi = aiResult ? createStreamer(aiResult, aiMeta) : null;
  let requestCount = 0;

  const getFiltered = () => {
    const max = Number(budgetFilter.value);
    return recipes.filter((recipe) => recipe.price <= max);
  };

  const render = () => {
    const filtered = getFiltered();
    list.innerHTML = filtered.map(createRecipeCard).join("");
  };

  const getPromptScore = (recipe, question) => {
    const q = question.toLowerCase();
    let score = 0;

    if (!q) return score;
    if (q.includes(recipe.name.toLowerCase())) score += 8;

    const keywordRules = [
      { keys: ["매운", "얼큰", "칼칼", "매콤"], test: /김치|찌개|마파|제육|비빔/ },
      { keys: ["가벼운", "다이어트", "헬시", "건강"], test: /샐러드|두부|닭가슴살|요거트|현미|수프|아보카도/ },
      { keys: ["든든", "포만", "배부", "푸짐"], test: /덮밥|국밥|불고기|파스타|카레|오므라이스/ },
      { keys: ["국물", "따뜻", "해장"], test: /국|찌개|탕|수프|우동/ },
      { keys: ["면", "누들", "국수", "파스타"], test: /국수|우동|파스타|짬뽕/ },
      { keys: ["밥", "덮밥", "라이스"], test: /밥|덮밥|비빔밥|오므라이스|주먹밥/ },
      { keys: ["한식", "집밥", "한국"], test: /찌개|국|볶음|비빔밥|불고기|된장|미역/ },
      { keys: ["양식", "서양"], test: /파스타|샌드|포케|또띠아/ },
      { keys: ["간단", "빠른", "초간단"], test: /계란|주먹밥|볶음밥|덮밥|또띠아/ },
      { keys: ["저렴", "가성비", "싼", "절약"], test: null }
    ];

    keywordRules.forEach((rule) => {
      const matched = rule.keys.some((key) => q.includes(key));
      if (!matched) return;

      if (rule.test && rule.test.test(recipe.name)) {
        score += 3;
      }

      if (rule.keys.includes("저렴") && recipe.price <= 5500) {
        score += 4;
      }
    });

    if ((q.includes("비건") || q.includes("채식")) && /두부|샐러드|렌틸콩|아보카도|버섯/.test(recipe.name)) {
      score += 5;
    }

    return score;
  };

  const renderAiMenuByQuestion = () => {
    if (!streamAi || !(aiMenuPrompt instanceof HTMLTextAreaElement)) return;
    const question = aiMenuPrompt.value.trim();
    const max = Number(budgetFilter.value) || 999999;
    const candidates = getFiltered();

    if (!question) {
      streamAi("AI 메뉴 추천 답변", [
        "질문을 입력해 주세요. 예: 매콤하고 든든한 저녁 메뉴 추천해줘",
        `현재 추천 예산 상한: ${formatWon(max)}`
      ]);
      return;
    }

    if (!candidates.length) {
      streamAi("AI 메뉴 추천 답변", [
        `질문: ${question}`,
        "현재 예산 조건에서 추천 가능한 메뉴가 없습니다.",
        "예산 상한을 높인 뒤 다시 질문해보세요."
      ]);
      return;
    }

    const ranked = [...candidates]
      .map((recipe) => ({ recipe, score: getPromptScore(recipe, question) }))
      .sort((a, b) => (b.score - a.score) || (a.recipe.price - b.recipe.price))
      .slice(0, 3)
      .map((item) => item.recipe);

    const fallback = [...candidates].sort((a, b) => a.price - b.price).slice(0, 3);
    const picks = ranked.length ? ranked : fallback;

    streamAi("AI 메뉴 추천 답변", [
      `질문: ${question}`,
      `조건 범위: ~ ${formatWon(max)} | 후보 ${candidates.length}개`,
      `1순위: ${picks[0] ? `${picks[0].name} (${formatWon(picks[0].price)})` : "없음"}`,
      `2순위: ${picks[1] ? `${picks[1].name} (${formatWon(picks[1].price)})` : "없음"}`,
      `3순위: ${picks[2] ? `${picks[2].name} (${formatWon(picks[2].price)})` : "없음"}`,
      "예산 상한과 질문 의도를 함께 반영해 메뉴를 구성했습니다."
    ]);
  };

  const renderAi = () => {
    if (!streamAi) return;
    requestCount += 1;
    const max = Number(budgetFilter.value);
    const filtered = getFiltered();
    if (!filtered.length) {
      streamAi("AI 추천 답변", [
        `예산 ${formatWon(max)} 기준으로 분석한 결과 현재 추천 가능한 메뉴가 없습니다.`,
        "예산 상한을 높이거나 레시피 검색 페이지에서 조건을 넓혀보세요."
      ]);
      return;
    }

    const cheapest = [...filtered].sort((a, b) => a.price - b.price)[0];
    const picked = [...filtered].sort(() => Math.random() - 0.5).slice(0, Math.min(2, filtered.length));
    const avg = Math.round(filtered.reduce((acc, recipe) => acc + recipe.price, 0) / filtered.length);
    const categories = [...new Set(filtered.map((recipe) => recipe.category))].join(", ");
    const strategy = randomPick([
      "남은 예산을 다음 끼니에 분배하는 절약형 추천",
      "평균 비용을 유지하면서 만족도를 높이는 균형형 추천",
      "현재 인기 메뉴를 반영한 변동형 추천"
    ]);

    streamAi("AI 추천 답변", [
      `예산 ${formatWon(max)} 이하 기준으로 ${filtered.length}개의 메뉴를 찾았습니다.`,
      `가장 경제적인 메뉴는 ${cheapest.name} (${formatWon(cheapest.price)}) 입니다.`,
      `현재 추천군의 평균 예상 비용은 ${formatWon(avg)} 입니다.`,
      `추천 카테고리 분포: ${categories}`,
      `이번 ${requestCount}회차 추가 추천: ${picked.map((item) => item.name).join(", ")}`,
      `추천 전략: ${strategy}`
    ]);
  };

  budgetFilter.addEventListener("change", () => {
    render();
    renderAi();
  });
  if (aiButton) aiButton.addEventListener("click", renderAi);
  if (askAiMenuBtn) askAiMenuBtn.addEventListener("click", renderAiMenuByQuestion);
  render();
  renderAi();
}

function initSearch() {
  const result = document.getElementById("searchResult");
  const aiResult = document.getElementById("searchAiResult");
  const categoryChips = document.getElementById("categoryChips");
  const button = document.getElementById("searchBtn");
  const aiMeta = document.getElementById("searchAiMeta");
  const minBudget = document.getElementById("minBudget");
  const maxBudget = document.getElementById("maxBudget");
  const ownedToggle = document.getElementById("ownedToggle");
  const foodName = document.getElementById("foodName");

  if (!result || !categoryChips || !button || !minBudget || !maxBudget || !foodName) return;

  const streamAi = aiResult ? createStreamer(aiResult, aiMeta) : null;
  let searchCount = 0;
  let hasSearched = false;

  activateChipGroup(categoryChips);

  const getFiltered = ({ ignoreKeyword = false } = {}) => {
    const min = Number(minBudget.value) || 0;
    const max = Number(maxBudget.value) || 999999;
    const keyword = foodName.value.trim();
    const active = categoryChips.querySelector(".chip.active");
    const selectedCategory = active ? active.getAttribute("data-category") : "전체";

    return recipes.filter((recipe) => {
      const byBudget = recipe.price >= min && recipe.price <= max;
      const byCategory = selectedCategory === "전체" || recipe.category === selectedCategory;
      const byKeyword = ignoreKeyword || !keyword || recipe.name.includes(keyword);
      return byBudget && byCategory && byKeyword;
    });
  };

  const renderAi = (filtered) => {
    if (!streamAi) return;
    searchCount += 1;
    const min = Number(minBudget.value) || 0;
    const max = Number(maxBudget.value) || 999999;
    const keyword = foodName.value.trim() || "전체 메뉴";
    const optimized = ownedToggle instanceof HTMLInputElement && ownedToggle.checked;

    if (!filtered.length) {
      streamAi("AI 검색 답변", [
        `${keyword} 조건에서 ${formatWon(min)} ~ ${formatWon(max)} 범위를 분석했습니다.`,
        "일치하는 레시피가 없어 예산 범위 확장 또는 카테고리 변경을 권장합니다.",
        "메뉴 추천형 답변은 메뉴추천 페이지에서 이용할 수 있습니다.",
        `검색 요청 번호: ${searchCount}`
      ]);
      return;
    }

    const avg = Math.round(filtered.reduce((acc, recipe) => acc + recipe.price, 0) / filtered.length);
    const categories = [...new Set(filtered.map((recipe) => recipe.category))].join(", ");
    const tone = randomPick(["조건 분석", "예산 범위 점검", "재료 최적화 점검"]);

    streamAi("AI 검색 답변", [
      `${keyword} 기준으로 ${filtered.length}개의 레시피를 찾았습니다.`,
      `검색 결과 평균 예상 비용은 ${formatWon(avg)} 입니다.`,
      `해당 결과의 카테고리 분포: ${categories}`,
      optimized ? "보유 재료 최적화가 켜져 있어 재료 중복 구매를 줄이는 방향으로 추천했습니다." : "보유 재료 최적화가 꺼져 있어 일반 추천 기준으로 정렬했습니다.",
      "특정 메뉴 추천은 메뉴추천 페이지에서 AI 메뉴 추천 기능으로 확인할 수 있습니다.",
      `이번 응답 포커스: ${tone} | 요청 #${searchCount}`
    ]);
  };

  const render = () => {
    const filtered = getFiltered();

    result.innerHTML = filtered.length
      ? filtered.map(createRecipeCard).join("")
      : '<p class="notice">조건에 맞는 레시피가 없습니다. 예산 범위를 넓히거나 카테고리를 변경해보세요.</p>';

    renderAi(filtered);
  };

  const resetSearchView = () => {
    result.innerHTML = '<p class="notice">검색 조건을 입력한 뒤 레시피검색 버튼을 눌러주세요.</p>';
    if (aiResult) {
      aiResult.innerHTML = '<p class="notice">검색 조건을 입력하고 레시피 검색 버튼을 누르면 AI 답변이 표시됩니다.</p>';
    }
    if (aiMeta) {
      aiMeta.textContent = "응답 대기 중";
    }
  };

  const runSearch = () => {
    hasSearched = true;
    render();
  };

  categoryChips.addEventListener("click", () => {
    if (!hasSearched) return;
    render();
  });
  button.addEventListener("click", runSearch);
  resetSearchView();
}

function initIngredients() {
  const ingredientInput = document.getElementById("ingredientInput");
  const shoppingInput = document.getElementById("shoppingInput");
  const ingredientList = document.getElementById("ingredientList");
  const shoppingList = document.getElementById("shoppingList");
  const addIngredientBtn = document.getElementById("addIngredientBtn");
  const addShoppingBtn = document.getElementById("addShoppingBtn");
  const clearIngredientBtn = document.getElementById("clearIngredientBtn");
  const clearShoppingBtn = document.getElementById("clearShoppingBtn");

  if (!ingredientInput || !shoppingInput || !ingredientList || !shoppingList || !addIngredientBtn || !addShoppingBtn) return;

  const loadList = (key) => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveList = (key, list) => {
    localStorage.setItem(key, JSON.stringify(list));
  };

  const normalizeText = (value) => value.replace(/\s+/g, "").toLowerCase();

  const sanitizeStoredItems = (items) => {
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        if (typeof item === "string") {
          const text = item.trim();
          if (!text) return null;
          return { text, done: false };
        }

        if (item && typeof item === "object") {
          const text = typeof item.text === "string" ? item.text.trim() : "";
          if (!text) return null;
          return { text, done: Boolean(item.done) };
        }

        return null;
      })
      .filter(Boolean);
  };

  const hasDuplicate = (list, text) => {
    const normalized = normalizeText(text);
    return list.some((item) => normalizeText(item.text) === normalized);
  };

  let ownedIngredients = sanitizeStoredItems(loadList(OWNED_INGREDIENTS_KEY));
  let shoppingItems = sanitizeStoredItems(loadList(SHOPPING_ITEMS_KEY));

  const renderManagedItems = (listElement, items, emptyText, onToggle) => {
    if (!items.length) {
      listElement.innerHTML = `<li class="notice">${escapeHtml(emptyText)}</li>`;
      return;
    }

    listElement.innerHTML = items
      .map((item, index) => `
        <li class="managed-item ${item.done ? "completed" : ""}">
          <label class="managed-check">
            <input type="checkbox" class="item-check" data-index="${index}" ${item.done ? "checked" : ""} />
            <span class="item-text">${escapeHtml(item.text)}</span>
          </label>
        </li>
      `)
      .join("");

    listElement.querySelectorAll(".item-check").forEach((check) => {
      check.addEventListener("change", () => {
        if (!(check instanceof HTMLInputElement)) return;
        const index = Number(check.getAttribute("data-index"));
        if (Number.isNaN(index)) return;
        onToggle(index, check.checked);
      });
    });
  };

  const renderOwnedIngredients = () => {
    renderManagedItems(ingredientList, ownedIngredients, "등록된 보유 재료가 없습니다.", (index, checked) => {
      if (!ownedIngredients[index]) return;
      ownedIngredients[index].done = checked;
      saveList(OWNED_INGREDIENTS_KEY, ownedIngredients);
      renderOwnedIngredients();
    });
  };

  const renderShoppingItems = () => {
    renderManagedItems(shoppingList, shoppingItems, "등록된 장보기 항목이 없습니다.", (index, checked) => {
      if (!shoppingItems[index]) return;
      shoppingItems[index].done = checked;
      saveList(SHOPPING_ITEMS_KEY, shoppingItems);
      renderShoppingItems();
    });
  };

  const appendItem = (value, list, key, render) => {
    const text = value.trim();
    if (!text) return;

    if (hasDuplicate(list, text)) {
      window.alert("이미 등록된 항목입니다.");
      return;
    }

    list.unshift({ text, done: false });
    saveList(key, list);
    render();
  };

  addIngredientBtn.addEventListener("click", () => {
    appendItem(ingredientInput.value, ownedIngredients, OWNED_INGREDIENTS_KEY, renderOwnedIngredients);
    ingredientInput.value = "";
    ingredientInput.focus();
  });

  addShoppingBtn.addEventListener("click", () => {
    appendItem(shoppingInput.value, shoppingItems, SHOPPING_ITEMS_KEY, renderShoppingItems);
    shoppingInput.value = "";
    shoppingInput.focus();
  });

  if (clearIngredientBtn) {
    clearIngredientBtn.addEventListener("click", () => {
      const ok = window.confirm("보유 재료를 모두 초기화할까요?");
      if (!ok) return;
      ownedIngredients = [];
      saveList(OWNED_INGREDIENTS_KEY, ownedIngredients);
      renderOwnedIngredients();
    });
  }

  if (clearShoppingBtn) {
    clearShoppingBtn.addEventListener("click", () => {
      const ok = window.confirm("장보기 리스트를 모두 초기화할까요?");
      if (!ok) return;
      shoppingItems = [];
      saveList(SHOPPING_ITEMS_KEY, shoppingItems);
      renderShoppingItems();
    });
  }

  renderOwnedIngredients();
  renderShoppingItems();
}

function initSettings() {
  const saveButton = document.getElementById("saveBudgetBtn");
  const budgetInput = document.getElementById("monthlyBudget");
  const budgetText = document.getElementById("saveBudgetText");
  const accountSummary = document.getElementById("settingsAccountSummary");
  const settingsLogoutBtn = document.getElementById("settingsLogoutBtn");
  if (!saveButton || !budgetInput || !budgetText) return;

  const renderSettingsAccount = () => {
    if (!accountSummary) return;
    const users = loadUsers();
    const user = getSessionUser(users);
    const session = loadSession();

    if (!user) {
      accountSummary.innerHTML = '<p class="notice">로그인된 계정이 없습니다. 로그인/회원가입 페이지에서 계정을 먼저 등록해 주세요.</p>';
      return;
    }

    accountSummary.innerHTML = createAccountSummaryHtml(user, session, "내 계정");
  };

  saveButton.addEventListener("click", () => {
    const value = Number(budgetInput.value) || 0;
    budgetText.textContent = `현재 월 예산: ${formatWon(value)}`;
  });

  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener("click", () => {
      saveSession(null);
      renderSettingsAccount();
    });
  }

  renderSettingsAccount();
}

initLogin();
initRecommend();
initSearch();
initRecipeDetail();
initIngredients();
initSettings();
