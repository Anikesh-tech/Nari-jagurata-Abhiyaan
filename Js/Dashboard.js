// dashboard.js
// Persist activation state + simple demo income simulate + count-up animation

const activateBtn = document.getElementById("activateBtn");
const planStatus = document.getElementById("planStatus");
const statusText = document.getElementById("statusText");

const directAmtEl = document.getElementById("directAmt");
const levelAmtEl = document.getElementById("levelAmt");
const repurchaseAmtEl = document.getElementById("repurchaseAmt");
const rewardAmtEl = document.getElementById("rewardAmt");

const simulateBtn = document.getElementById("simulateBtn");
const resetBtn = document.getElementById("resetBtn");

const STORAGE_KEY = "nj_dashboard_state_v1";

// default state
let state = {
  planActive: false,
  incomes: {
    direct: 0,
    level: 0,
    repurchase: 0,
    reward: 0,
  },
  user: {
    name: "Ankita Sharma",
    sponsor: "Priya Verma",
  },
};

// load state from localStorage
function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) state = JSON.parse(s);
  } catch (e) {
    console.warn("load err", e);
  }
  applyState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("save err", e);
  }
}

function applyState() {
  // plan
  if (state.planActive) {
    planStatus.classList.remove("inactive");
    planStatus.classList.add("active");
    statusText.textContent = "Active";
    activateBtn.textContent = "Activated";
    activateBtn.disabled = true;
  } else {
    planStatus.classList.remove("active");
    planStatus.classList.add("inactive");
    statusText.textContent = "Non-active";
    activateBtn.textContent = "Activate ₹499";
    activateBtn.disabled = false;
  }

  // incomes
  updateAmountUI("direct", state.incomes.direct);
  updateAmountUI("level", state.incomes.level);
  updateAmountUI("repurchase", state.incomes.repurchase);
  updateAmountUI("reward", state.incomes.reward);

  // user info
  document.getElementById("userName").textContent = `Name: ${state.user.name}`;
  document.getElementById(
    "sponsorName"
  ).textContent = `Sponsor: ${state.user.sponsor}`;
}

// small count-up animation
function animateValue(el, start, end, duration = 800) {
  const range = end - start;
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(start + range * progress);
    el.textContent = `₹${value.toLocaleString()}`;
    if (progress < 1) window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
}

function updateAmountUI(key, value) {
  const elMap = {
    direct: directAmtEl,
    level: levelAmtEl,
    repurchase: repurchaseAmtEl,
    reward: rewardAmtEl,
  };
  const el = elMap[key];
  const cur = parseInt(el.dataset?.val || "0", 10) || 0;
  el.dataset.val = value;
  animateValue(el, cur, value, 700);
}

// Activate plan
activateBtn.addEventListener("click", () => {
  // mimic payment flow or confirmation
  const ok = confirm("Activate ₹499 plan now?");
  if (!ok) return;
  state.planActive = true;
  saveState();
  applyState();

  // give initial bonus incomes when activated (demo)
  state.incomes.direct += 150;
  state.incomes.reward += 25;
  saveState();
  applyState();
});

// simulate incomes (demo) — increments random amounts
simulateBtn.addEventListener("click", () => {
  // require plan active to simulate higher income
  const multiplier = state.planActive ? 1 : 0.3;
  state.incomes.direct += Math.round((Math.random() * 100 + 20) * multiplier);
  state.incomes.level += Math.round((Math.random() * 80 + 10) * multiplier);
  state.incomes.repurchase += Math.round((Math.random() * 60 + 5) * multiplier);
  state.incomes.reward += Math.round((Math.random() * 40 + 2) * multiplier);
  saveState();
  applyState();
});

// reset local
resetBtn.addEventListener("click", () => {
  if (!confirm("This will clear saved demo data. Continue?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = {
    planActive: false,
    incomes: { direct: 0, level: 0, repurchase: 0, reward: 0 },
    user: { name: "Ankita Sharma", sponsor: "Priya Verma" },
  };
  applyState();
});

// small UX: click on income card to add a tiny instant bonus
document.querySelectorAll(".income-card").forEach((card) => {
  card.addEventListener("click", () => {
    const k = card.dataset.key;
    const add = Math.round(Math.random() * 20) + 5;
    state.incomes[k] += add;
    saveState();
    applyState();

    // little pulse animation
    card.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.03)" },
        { transform: "scale(1)" },
      ],
      { duration: 300, easing: "ease-out" }
    );
  });
});

// Init
loadState();
