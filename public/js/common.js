// 정적 HTML 화면들이 공통으로 사용하는 브라우저 유틸리티 모듈입니다.
// API 호출, 토스트 메시지, 숫자/퍼센트 포맷, HTML escaping을 한곳에 모읍니다.

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  // FastAPI 백엔드는 HTTP-only 쿠키 세션도 사용하므로 credentials: "include"를 유지합니다.
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // 네트워크 자체 오류 (서버 다운, CORS 등)
    throw new Error("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
  }

  // 응답 본문 파싱 (JSON 실패해도 계속)
  let data = {};
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    // FastAPI HTTPException → detail 필드
    // 일반 에러 → error 또는 message 필드
    const msg =
      data?.detail ||
      data?.error  ||
      data?.message ||
      `서버 오류 (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function getMe() {
  // 현재 로그인 사용자를 확인하는 공통 헬퍼입니다.
  return api("/api/me");
}

export function setToast(msg, type = "ok") {
  // 기존 toast를 제거하고 새 toast를 만듭니다.
  // Tailwind CDN 환경에서는 @apply 전처리가 없으므로 인라인 스타일을 사용합니다.
  // 기존 toast 제거 후 새로 만들기 (CDN Tailwind @apply 파싱 문제 우회)
  const existing = document.getElementById("_toast_el");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.id = "_toast_el";

  // 인라인 스타일로 완전히 제어 (Tailwind CDN @apply 의존 없음)
  Object.assign(el.style, {
    position:    "fixed",
    top:         "72px",
    left:        "50%",
    transform:   "translateX(-50%)",
    zIndex:      "9999",
    padding:     "12px 20px",
    borderRadius:"12px",
    fontSize:    "14px",
    fontWeight:  "500",
    maxWidth:    "480px",
    whiteSpace:  "pre-wrap",
    boxShadow:   "0 4px 24px rgba(0,0,0,0.5)",
    border:      "1px solid",
    transition:  "opacity 0.3s ease",
    opacity:     "1",
  });

  if (type === "error") {
    el.style.background   = "#1e0a0a";
    el.style.color        = "#f87171";
    el.style.borderColor  = "rgba(239,68,68,0.4)";
  } else {
    el.style.background   = "#0a1e12";
    el.style.color        = "#34d399";
    el.style.borderColor  = "rgba(52,211,153,0.4)";
  }

  el.textContent = msg;
  document.body.appendChild(el);

  // 4초 후 페이드아웃 → 제거
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 350);
  }, 4000);
}

export function escHtml(s) {
  // 사용자 입력이나 외부 API 문자열을 HTML에 직접 넣을 때 XSS를 막기 위한 escape 함수입니다.
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function fmt(n, digits = 0) {
  // 숫자 문자열과 숫자 타입을 모두 한국어 로케일 표시 형식으로 변환합니다.
  if (n == null || n === "") return "-";
  const num = parseFloat(n);
  if (isNaN(num)) return String(n);
  return num.toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPct(n) {
  // 등락률 표시용 퍼센트 formatter입니다.
  if (n == null) return "-";
  const v = parseFloat(n);
  if (isNaN(v)) return "-";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export function colorPct(n) {
  // 양수/음수 등락률에 맞는 Tailwind 색상 클래스를 반환합니다.
  if (n == null) return "";
  return parseFloat(n) >= 0 ? "text-emerald-400" : "text-red-400";
}
