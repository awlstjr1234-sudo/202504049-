const recipes = [
  { name: "김치제육볶음", price: 7000, category: "간편요리", icon: "🍲" },
  { name: "스팸달걀덮밥", price: 9000, category: "간편요리", icon: "🍛" },
  { name: "된장찌개", price: 5200, category: "초저가", icon: "🥘" },
  { name: "닭가슴살 샐러드", price: 6800, category: "건강식", icon: "🥗" },
  { name: "참치김치볶음밥", price: 4300, category: "초저가", icon: "🍚" },
  { name: "두부스테이크", price: 6100, category: "건강식", icon: "🍽️" }
];

const AUTH_USERS_KEY = "mealfit_users";
const AUTH_SESSION_KEY = "mealfit_session";

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

function formatWon(value) {
  return Number(value).toLocaleString("ko-KR") + "원";
}

function createRecipeCard(recipe) {
  return `
    <article class="recipe-card">
      <div class="thumb">${recipe.icon}</div>
      <div class="recipe-info">
        <strong>${recipe.name}</strong>
        <div class="inline-between">
          <span>${recipe.category}</span>
          <span class="price">약 ${formatWon(recipe.price)}</span>
        </div>
        <a class="btn primary" href="recipe.html">레시피 보기</a>
      </div>
    </article>
  `;
}

function createAiSummaryHtml(title, lines) {
  const items = lines.map((line) => `<li>${line}</li>`).join("");
  return `
    <article class="ai-summary-card">
      <h3>${title}</h3>
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
    if (state.timer) clearInterval(state.timer);

    const rendered = lines.map(() => "");
    let lineIndex = 0;
    let charIndex = 0;

    const renderFrame = () => {
      const items = rendered
        .map((line, idx) => {
          const cursor = idx === lineIndex && lineIndex < lines.length ? "<span class=\"stream-cursor\">▌</span>" : "";
          return `<li>${escapeHtml(line)}${cursor}</li>`;
        })
        .join("");

      container.innerHTML = `
        <article class="ai-summary-card">
          <h3>${escapeHtml(title)}</h3>
          <ul>${items}</ul>
        </article>
      `;
    };

    if (metaElement) {
      metaElement.textContent = "실시간 응답 생성 중...";
    }

    renderFrame();

    state.timer = setInterval(() => {
      if (activeRequestId !== state.requestId) {
        clearInterval(state.timer);
        return;
      }

      if (lineIndex >= lines.length) {
        clearInterval(state.timer);
        if (metaElement) {
          metaElement.textContent = `마지막 갱신: ${getNowLabel()}`;
        }
        return;
      }

      const sourceLine = lines[lineIndex];
      rendered[lineIndex] += sourceLine[charIndex] || "";
      charIndex += 1;

      if (charIndex >= sourceLine.length) {
        lineIndex += 1;
        charIndex = 0;
      }

      renderFrame();
    }, 28);
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

    if (!user) {
      status.innerHTML = '<p class="notice">현재 로그인된 계정이 없습니다.</p>';
      return;
    }

    const linked = [];
    if (user.social && user.social.kakao) linked.push("카카오");
    if (user.social && user.social.naver) linked.push("네이버");
    const linkedText = linked.length ? linked.join(", ") : "없음";

    status.innerHTML = `
      <article class="ai-summary-card">
        <h3>현재 계정</h3>
        <ul>
          <li>아이디: ${escapeHtml(user.id)}</li>
          <li>이메일: ${escapeHtml(user.email || "미입력")}</li>
          <li>연동된 SNS: ${escapeHtml(linkedText)}</li>
        </ul>
      </article>
    `;
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
      social: { kakao: false, naver: false },
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

      if (currentUser) {
        currentUser.social = currentUser.social || { kakao: false, naver: false };
        currentUser.social[provider] = true;
        saveUsers(users);
        renderStatus();
        showNotice(`${provider === "kakao" ? "카카오" : "네이버"} 계정 연동이 완료되었습니다.`, false);
        return;
      }

      const linkedUser = users.find((user) => user.social && user.social[provider]);
      if (linkedUser) {
        saveSession({ userId: linkedUser.id, loginType: provider, updatedAt: Date.now() });
        renderStatus();
        showNotice(`${provider === "kakao" ? "카카오" : "네이버"} 연동 계정으로 로그인되었습니다.`, false);
        return;
      }

      const suffix = Math.floor(1000 + Math.random() * 9000);
      const quickUser = {
        id: `${provider}_user_${suffix}`,
        email: `${provider}${suffix}@mealfit.local`,
        password: `${provider}_${suffix}`,
        social: { kakao: provider === "kakao", naver: provider === "naver" },
        createdAt: Date.now()
      };

      users.push(quickUser);
      saveUsers(users);
      saveSession({ userId: quickUser.id, loginType: provider, updatedAt: Date.now() });
      renderStatus();
      showNotice(`${provider === "kakao" ? "카카오" : "네이버"} 빠른 회원가입 후 로그인되었습니다.`, false);
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

  if (unlinkNaverBtn) {
    unlinkNaverBtn.addEventListener("click", () => {
      const users = loadUsers();
      const user = getSessionUser(users);
      if (!user) {
        showNotice("로그인 후 연동 해제를 진행해주세요.", true);
        return;
      }
      user.social = user.social || { kakao: false, naver: false };
      user.social.naver = false;
      saveUsers(users);
      renderStatus();
      showNotice("네이버 연동이 해제되었습니다.", false);
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

  activateChipGroup(categoryChips);

  const getFiltered = () => {
    const min = Number(minBudget.value) || 0;
    const max = Number(maxBudget.value) || 999999;
    const keyword = foodName.value.trim();
    const active = categoryChips.querySelector(".chip.active");
    const selectedCategory = active ? active.getAttribute("data-category") : "전체";

    return recipes.filter((recipe) => {
      const byBudget = recipe.price >= min && recipe.price <= max;
      const byCategory = selectedCategory === "전체" || recipe.category === selectedCategory;
      const byKeyword = !keyword || recipe.name.includes(keyword);
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
        `검색 요청 번호: ${searchCount}`
      ]);
      return;
    }

    const top = filtered[0];
    const avg = Math.round(filtered.reduce((acc, recipe) => acc + recipe.price, 0) / filtered.length);
    const second = filtered.length > 1 ? filtered[1].name : "해당 없음";
    const tone = randomPick(["비용 우선", "맛 균형", "재료 활용"]);

    streamAi("AI 검색 답변", [
      `${keyword} 기준으로 ${filtered.length}개의 레시피를 찾았습니다.`,
      `우선 추천 메뉴는 ${top.name}이며 예상 비용은 ${formatWon(top.price)} 입니다.`,
      `검색 결과 평균 예상 비용은 ${formatWon(avg)} 입니다.`,
      optimized ? "보유 재료 최적화가 켜져 있어 재료 중복 구매를 줄이는 방향으로 추천했습니다." : "보유 재료 최적화가 꺼져 있어 일반 추천 기준으로 정렬했습니다.",
      `차선 추천 메뉴: ${second}`,
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

  categoryChips.addEventListener("click", render);
  button.addEventListener("click", render);
  render();
}

function initIngredients() {
  const ingredientInput = document.getElementById("ingredientInput");
  const shoppingInput = document.getElementById("shoppingInput");
  const ingredientList = document.getElementById("ingredientList");
  const shoppingList = document.getElementById("shoppingList");
  const addIngredientBtn = document.getElementById("addIngredientBtn");
  const addShoppingBtn = document.getElementById("addShoppingBtn");

  if (!ingredientInput || !shoppingInput || !ingredientList || !shoppingList || !addIngredientBtn || !addShoppingBtn) return;

  const appendItem = (list, value) => {
    const text = value.trim();
    if (!text) return;
    const li = document.createElement("li");
    li.textContent = text;
    list.prepend(li);
  };

  addIngredientBtn.addEventListener("click", () => {
    appendItem(ingredientList, ingredientInput.value);
    ingredientInput.value = "";
  });

  addShoppingBtn.addEventListener("click", () => {
    appendItem(shoppingList, shoppingInput.value);
    shoppingInput.value = "";
  });
}

function initSettings() {
  const chips = document.querySelectorAll(".panel .chip");
  const saveButton = document.getElementById("saveBudgetBtn");
  const budgetInput = document.getElementById("monthlyBudget");
  const budgetText = document.getElementById("saveBudgetText");
  if (!saveButton || !budgetInput || !budgetText) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
    });
  });

  saveButton.addEventListener("click", () => {
    const value = Number(budgetInput.value) || 0;
    budgetText.textContent = `현재 월 예산: ${formatWon(value)}`;
  });
}

initLogin();
initRecommend();
initSearch();
initIngredients();
initSettings();
