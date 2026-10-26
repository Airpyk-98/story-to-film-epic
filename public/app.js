// =====================================================================
// Story to Film — Frontend Controller (Firebase Auth + Firestore + Kie.ai + Kaggle T4)
// =====================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { createRepo, uploadFile } from "https://esm.sh/@huggingface/hub@1.15.2";

// ---------------------------------------------------------------------
// 1. FIREBASE INITIALIZATION (Brand-New Isolated Project)
// ---------------------------------------------------------------------
const firebaseConfig = {
  projectId: "story-to-film-epic-98",
  appId: "1:59385639516:web:4ec3e0a8d823b3a41eec99",
  storageBucket: "story-to-film-epic-98.firebasestorage.app",
  apiKey: "AIzaSyB9ULhynJSW6s8vvJI0jnIJwKpubUwcItA",
  authDomain: "story-to-film-epic-98.firebaseapp.com",
  messagingSenderId: "59385639516"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ---------------------------------------------------------------------
// 2. KIE.AI MODEL CATALOGS, DYNAMIC PRESETS & REAL-TIME CREDIT PRICING
// ---------------------------------------------------------------------
const KIE_IMAGE_MODELS = [
  {
    id: "nano-banana-2-lite",
    name: "NanoBanana 2 Lite (Default)",
    resolutions: ["1K", "2K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    creditsByRes: { "1K": 4, "2K": 6 },
    maxRefs: 8
  },
  {
    id: "nano-banana-2",
    name: "NanoBanana 2",
    resolutions: ["1K", "2K", "4K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1", "2:3", "3:2", "4:3", "3:4", "21:9"],
    creditsByRes: { "1K": 6, "2K": 10, "4K": 16 },
    maxRefs: 10
  },
  {
    id: "nano-banana-2-1",
    name: "NanoBanana 2.1",
    resolutions: ["1K", "2K", "4K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1", "2:3", "3:2", "4:3", "3:4", "21:9"],
    creditsByRes: { "1K": 8, "2K": 12, "4K": 18 },
    maxRefs: 10
  },
  {
    id: "nano-banana-pro",
    name: "NanoBanana Pro",
    resolutions: ["1K", "2K", "4K"],
    defaultRes: "2K",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    creditsByRes: { "1K": 10, "2K": 15, "4K": 24 },
    maxRefs: 8
  },
  {
    id: "google/nano-banana-edit",
    name: "NanoBanana Edit (Multi-Ref)",
    resolutions: ["1K", "2K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditsByRes: { "1K": 8, "2K": 12 },
    maxRefs: 8
  },
  {
    id: "seedream/5-lite-image-to-image",
    name: "ByteDance Seedream 5.0 Lite",
    resolutions: ["1K", "2K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    creditsByRes: { "1K": 5, "2K": 8 },
    maxRefs: 6
  },
  {
    id: "seedream/5-pro-image-to-image",
    name: "ByteDance Seedream 5.0 Pro",
    resolutions: ["1K", "2K", "4K"],
    defaultRes: "2K",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    creditsByRes: { "1K": 10, "2K": 16, "4K": 22 },
    maxRefs: 6
  },
  {
    id: "seedream/4.5-text-to-image",
    name: "ByteDance Seedream 4.5",
    resolutions: ["1K", "2K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditsByRes: { "1K": 6, "2K": 10 },
    maxRefs: 4
  },
  {
    id: "flux1-kontext",
    name: "Flux.1 Kontext Pro",
    resolutions: ["1K", "2K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditsByRes: { "1K": 8, "2K": 14 },
    maxRefs: 4
  },
  {
    id: "grok-imagine/text-to-image",
    name: "Grok Imagine Image (xAI)",
    resolutions: ["1K", "2K"],
    defaultRes: "1K",
    aspectRatios: ["16:9", "9:16", "1:1", "2:3", "3:2"],
    creditsByRes: { "1K": 6, "2K": 10 },
    maxRefs: 4
  }
];

const KIE_VIDEO_MODELS = [
  {
    id: "grok-imagine/image-to-video",
    name: "Grok Imagine Video (Default — xAI)",
    aspectRatios: ["16:9", "9:16", "1:1", "2:3", "3:2"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["360p", "480p", "720p"],
    defaultQuality: "720p",
    modes: ["normal", "fun"],
    defaultMode: "normal",
    creditsPerSecByQuality: { "360p": 6, "480p": 6, "720p": 10 }
  },
  {
    id: "bytedance/seedance-2-5",
    name: "ByteDance Seedance 2.5",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    durations: [4, 6, 8, 10, 12],
    defaultDuration: 6,
    qualities: ["360p", "480p", "720p", "1080p"],
    defaultQuality: "720p",
    modes: ["normal", "multi-ref"],
    defaultMode: "normal",
    creditsPerSecByQuality: { "360p": 18, "480p": 20, "720p": 45, "1080p": 95 }
  },
  {
    id: "bytedance/seedance-2",
    name: "ByteDance Seedance 2.0",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["360p", "480p", "720p", "1080p"],
    defaultQuality: "720p",
    modes: ["normal"],
    defaultMode: "normal",
    creditsPerSecByQuality: { "360p": 15, "480p": 16, "720p": 35, "1080p": 75 }
  },
  {
    id: "wan/3-0-video",
    name: "Alibaba Wan 3.0 Video",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["360p", "480p", "720p", "1080p"],
    defaultQuality: "720p",
    modes: ["normal", "prompt-expand"],
    defaultMode: "normal",
    creditsPerSecByQuality: { "360p": 8, "480p": 10, "720p": 16, "1080p": 28 }
  },
  {
    id: "wan/2-7-image-to-video",
    name: "Alibaba Wan 2.7 Image-to-Video",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["360p", "480p", "720p", "1080p"],
    defaultQuality: "720p",
    modes: ["normal"],
    defaultMode: "normal",
    creditsPerSecByQuality: { "360p": 7, "480p": 8, "720p": 14, "1080p": 24 }
  },
  {
    id: "wan/2-5-image-to-video",
    name: "Alibaba Wan 2.5 Image-to-Video",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["360p", "480p", "720p", "1080p"],
    defaultQuality: "720p",
    modes: ["normal"],
    defaultMode: "normal",
    creditsPerSecByQuality: { "360p": 6, "480p": 7, "720p": 12, "1080p": 20 }
  },
  {
    id: "kling-3.0-omni/image-to-video",
    name: "Kling 3.0 Omni",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["720p", "1080p"],
    defaultQuality: "720p",
    modes: ["standard", "pro"],
    defaultMode: "standard",
    creditsPerSecByQuality: { "720p": 36, "1080p": 56 }
  },
  {
    id: "kling-2.6/image-to-video",
    name: "Kling 2.6 Image-to-Video",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["360p", "720p", "1080p"],
    defaultQuality: "720p",
    modes: ["standard", "pro"],
    defaultMode: "standard",
    creditsPerSecByQuality: { "360p": 24, "720p": 32, "1080p": 48 }
  },
  {
    id: "veo-3-1",
    name: "Google Veo 3.1 (Flow / Omni Flash)",
    aspectRatios: ["16:9", "9:16"],
    durations: [4, 6, 8],
    defaultDuration: 6,
    qualities: ["720p", "1080p"],
    defaultQuality: "720p",
    modes: ["FIRST_AND_LAST_FRAMES_2_VIDEO", "REFERENCE_2_VIDEO"],
    defaultMode: "FIRST_AND_LAST_FRAMES_2_VIDEO",
    creditsPerSecByQuality: { "720p": 30, "1080p": 50 }
  },
  {
    id: "runway",
    name: "Runway Gen-4 Turbo",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [4, 6, 8, 10],
    defaultDuration: 6,
    qualities: ["720p", "1080p"],
    defaultQuality: "720p",
    modes: ["normal"],
    defaultMode: "normal",
    creditsPerSecByQuality: { "720p": 20, "1080p": 35 }
  },
  {
    id: "hailuo/02-image-to-video-standard",
    name: "MiniMax Hailuo 02",
    aspectRatios: ["16:9", "9:16"],
    durations: [6, 10],
    defaultDuration: 6,
    qualities: ["720p", "1080p"],
    defaultQuality: "720p",
    modes: ["standard"],
    defaultMode: "standard",
    creditsPerSecByQuality: { "720p": 18, "1080p": 30 }
  }
];

const DEFAULT_NVIDIA_MODELS = [
  "meta/llama-3.3-70b-instruct",
  "deepseek-ai/deepseek-r1",
  "deepseek-ai/deepseek-v3.1",
  "nvidia/llama-3.1-nemotron-ultra-253b-v1",
  "nvidia/llama-3.3-nemotron-super-49b-v1",
  "qwen/qwen2.5-72b-instruct",
  "qwen/qwq-32b",
  "meta/llama-3.1-405b-instruct",
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "mistralai/mistral-large-2-instruct",
  "mistralai/mixtral-8x22b-instruct-v0.1",
  "google/gemma-2-27b-it",
  "google/gemma-2-9b-it",
  "microsoft/phi-4-mini-instruct"
];

// ---------------------------------------------------------------------
// 3. STATE MANAGEMENT
// ---------------------------------------------------------------------
let currentUser = null;
let userCredentials = {
  kie_api_key: "",
  kie_last_balance: null,
  kie_balance_updated_at: "",
  nvidia_api_key: "",
  nvidia_model: "meta/llama-3.3-70b-instruct",
  nvidia_available_models: [...DEFAULT_NVIDIA_MODELS],
  kaggle_username: "",
  kaggle_key: "",
  hf_username: "",
  hf_token: "",
  hf_dataset_name: "story-to-film-assets",
  relay_url: "http://localhost:7860"
};

let referenceTags = []; // Array of { id, tag, url, previewUrl, uploading }
let currentJobId = null;
let currentJobScenes = [];
let unsubscribeJobSnapshot = null;
let autoDownloadedSceneUrls = new Set();
let draftSaveTimer = null;

// ---------------------------------------------------------------------
// 4. DOM ELEMENTS
// ---------------------------------------------------------------------
const authGate = document.getElementById("authGate");
const appShell = document.getElementById("appShell");
const btnGoogleSignIn = document.getElementById("btnGoogleSignIn");
const authErrorBox = document.getElementById("authErrorBox");
const userAvatar = document.getElementById("userAvatar");
const userNameDisplay = document.getElementById("userNameDisplay");
const btnSignOut = document.getElementById("btnSignOut");

const headerCreditValue = document.getElementById("headerCreditValue");
const btnHeaderRefreshCredit = document.getElementById("btnHeaderRefreshCredit");
const missingCredsBanner = document.getElementById("missingCredsBanner");
const btnGoToSettings = document.getElementById("btnGoToSettings");

// Studio Form Elements
const storyForm = document.getElementById("storyForm");
const storyInput = document.getElementById("storyInput");
const draftSaveIndicator = document.getElementById("draftSaveIndicator");
const refDropzone = document.getElementById("refDropzone");
const refFileInput = document.getElementById("refFileInput");
const refTagsGrid = document.getElementById("refTagsGrid");
const tagCountBadge = document.getElementById("tagCountBadge");
const tagValidationError = document.getElementById("tagValidationError");

const studioNvidiaModel = document.getElementById("studioNvidiaModel");
const imageModelSelect = document.getElementById("imageModelSelect");
const imageResolutionSelect = document.getElementById("imageResolutionSelect");
const videoModelSelect = document.getElementById("videoModelSelect");
const videoModeSelect = document.getElementById("videoModeSelect");
const aspectRatioSelect = document.getElementById("aspectRatioSelect");
const sceneDurationSelect = document.getElementById("sceneDurationSelect");
const videoQualitySelect = document.getElementById("videoQualitySelect");

const imageModelCreditTag = document.getElementById("imageModelCreditTag");
const videoModelCreditTag = document.getElementById("videoModelCreditTag");
const perSceneCostBadge = document.getElementById("perSceneCostBadge");
const summaryImgModelName = document.getElementById("summaryImgModelName");
const summaryImgCredits = document.getElementById("summaryImgCredits");
const summaryVidModelName = document.getElementById("summaryVidModelName");
const summaryVidCredits = document.getElementById("summaryVidCredits");
const summaryEstScenes = document.getElementById("summaryEstScenes");
const summaryTotalCredits = document.getElementById("summaryTotalCredits");

const btnRunPipeline = document.getElementById("btnRunPipeline");
const btnCancelPipeline = document.getElementById("btnCancelPipeline");

// Monitor & Output Elements
const jobStatusBadge = document.getElementById("jobStatusBadge");
const liveMilestoneText = document.getElementById("liveMilestoneText");
const liveProgressPct = document.getElementById("liveProgressPct");
const liveProgressFill = document.getElementById("liveProgressFill");
const progressBarAria = document.getElementById("progressBarAria");
const kaggleKernelLink = document.getElementById("kaggleKernelLink");
const btnClearLogs = document.getElementById("btnClearLogs");
const terminalConsole = document.getElementById("terminalConsole");

const finalFilmPanel = document.getElementById("finalFilmPanel");
const finalSummaryStats = document.getElementById("finalSummaryStats");
const masterVideoPlayer = document.getElementById("masterVideoPlayer");
const masterAssetUrlInput = document.getElementById("masterAssetUrlInput");
const btnCopyMasterUrl = document.getElementById("btnCopyMasterUrl");
const btnDownloadMasterFilm = document.getElementById("btnDownloadMasterFilm");
const btnDownloadAllScenes = document.getElementById("btnDownloadAllScenes");
const btnRetryFailedScenes = document.getElementById("btnRetryFailedScenes");

const storyboardCountLabel = document.getElementById("storyboardCountLabel");
const scenesStoryboardGrid = document.getElementById("scenesStoryboardGrid");

// Settings Elements
const settingsForm = document.getElementById("settingsForm");
const setKieApiKey = document.getElementById("setKieApiKey");
const btnToggleKieKey = document.getElementById("btnToggleKieKey");
const btnCheckKieBalance = document.getElementById("btnCheckKieBalance");
const kieBalanceDisplay = document.getElementById("kieBalanceDisplay");
const kieBalanceTimestamp = document.getElementById("kieBalanceTimestamp");

const setNvidiaApiKey = document.getElementById("setNvidiaApiKey");
const btnToggleNvidiaKey = document.getElementById("btnToggleNvidiaKey");
const btnLoadNvidiaModels = document.getElementById("btnLoadNvidiaModels");
const setNvidiaModelSelect = document.getElementById("setNvidiaModelSelect");
const nvidiaModelCountBadge = document.getElementById("nvidiaModelCountBadge");

const setKaggleUsername = document.getElementById("setKaggleUsername");
const setKaggleKey = document.getElementById("setKaggleKey");
const btnToggleKaggleKey = document.getElementById("btnToggleKaggleKey");

const setHfUsername = document.getElementById("setHfUsername");
const setHfToken = document.getElementById("setHfToken");
const setHfDatasetName = document.getElementById("setHfDatasetName");
const btnVerifyHfDataset = document.getElementById("btnVerifyHfDataset");
const hfVerifyStatusText = document.getElementById("hfVerifyStatusText");
const setRelayUrl = document.getElementById("setRelayUrl");

const historyListContainer = document.getElementById("historyListContainer");
const btnRefreshHistory = document.getElementById("btnRefreshHistory");
const toastContainer = document.getElementById("toastContainer");

// ---------------------------------------------------------------------
// 5. UI HELPERS & NAVIGATION
// ---------------------------------------------------------------------
function showToast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 4000);
}

function appendTerminalLog(line, level = "info") {
  const div = document.createElement("div");
  div.className = `log-line ${level}`;
  div.textContent = line;
  terminalConsole.appendChild(div);
  terminalConsole.scrollTop = terminalConsole.scrollHeight;
}

function switchTab(tabName) {
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const isMatch = panel.id === `tab-${tabName}`;
    panel.style.display = isMatch ? "block" : "none";
    panel.classList.toggle("active", isMatch);
  });
  if (tabName === "history" && currentUser) {
    loadUserFilmHistory();
  }
}

document.querySelectorAll(".nav-tab").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

btnGoToSettings.addEventListener("click", () => switchTab("settings"));

function updatePipelineStepRibbon(stage) {
  const order = ["input", "plan", "images", "videos"];
  const idx = order.indexOf(stage);
  order.forEach((key, i) => {
    const el = document.getElementById(`stepInd-${key}`);
    if (!el) return;
    el.classList.remove("active", "done");
    if (i < idx) el.classList.add("done");
    else if (i === idx) el.classList.add("active");
  });
}

// Password Show/Hide Toggles
function bindPasswordToggle(btn, inputEl) {
  btn.addEventListener("click", () => {
    const isPwd = inputEl.type === "password";
    inputEl.type = isPwd ? "text" : "password";
    btn.textContent = isPwd ? "Hide" : "Show";
  });
}
bindPasswordToggle(btnToggleKieKey, setKieApiKey);
bindPasswordToggle(btnToggleNvidiaKey, setNvidiaApiKey);
bindPasswordToggle(btnToggleKaggleKey, setKaggleKey);

// ---------------------------------------------------------------------
// 6. DYNAMIC MODEL DROPDOWNS & LIVE KIE.AI CREDIT COST CALCULATOR
// ---------------------------------------------------------------------
function getCurrentImageModelObj() {
  return KIE_IMAGE_MODELS.find((m) => m.id === imageModelSelect.value) || KIE_IMAGE_MODELS[0];
}

function getCurrentVideoModelObj() {
  return KIE_VIDEO_MODELS.find((m) => m.id === videoModelSelect.value) || KIE_VIDEO_MODELS[0];
}

function populateImageModelDropdown(selectedId = "nano-banana-2-lite") {
  imageModelSelect.innerHTML = "";
  KIE_IMAGE_MODELS.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    const baseCredit = m.creditsByRes[m.defaultRes] || Object.values(m.creditsByRes)[0];
    opt.textContent = `${m.name} — ${baseCredit} Credits/img`;
    if (m.id === selectedId) opt.selected = true;
    imageModelSelect.appendChild(opt);
  });
  syncImageModelPresets();
}

function populateVideoModelDropdown(selectedId = "grok-imagine/image-to-video") {
  videoModelSelect.innerHTML = "";
  KIE_VIDEO_MODELS.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    const rate = m.creditsPerSecByQuality[m.defaultQuality] || Object.values(m.creditsPerSecByQuality)[0];
    opt.textContent = `${m.name} — ${rate} Credits/s`;
    if (m.id === selectedId) opt.selected = true;
    videoModelSelect.appendChild(opt);
  });
  syncVideoModelPresets();
}

function syncImageModelPresets(preferredRes = null) {
  const imgModel = getCurrentImageModelObj();
  const prevRes = preferredRes || imageResolutionSelect.value || imgModel.defaultRes;
  imageResolutionSelect.innerHTML = "";
  imgModel.resolutions.forEach((res) => {
    const cost = imgModel.creditsByRes[res] || 4;
    const opt = document.createElement("option");
    opt.value = res;
    opt.textContent = `${res} (${cost} Credits / image)`;
    if (res === prevRes) opt.selected = true;
    imageResolutionSelect.appendChild(opt);
  });
  recalculateKieCreditCosts();
}

function syncVideoModelPresets(preferredOpts = {}) {
  const vidModel = getCurrentVideoModelObj();
  const prevAspect = preferredOpts.aspect || aspectRatioSelect.value || "16:9";
  const prevDur = Number(preferredOpts.duration || sceneDurationSelect.value || vidModel.defaultDuration || 6);
  const prevQual = preferredOpts.quality || videoQualitySelect.value || vidModel.defaultQuality;
  const prevMode = preferredOpts.mode || videoModeSelect.value || vidModel.defaultMode;

  // 1. Aspect Ratio
  aspectRatioSelect.innerHTML = "";
  vidModel.aspectRatios.forEach((ar) => {
    const opt = document.createElement("option");
    opt.value = ar;
    opt.textContent = ar === "16:9" ? "16:9 (Widescreen)" : ar === "9:16" ? "9:16 (Vertical)" : ar;
    if (ar === prevAspect) opt.selected = true;
    aspectRatioSelect.appendChild(opt);
  });

  // 2. Scene Duration
  sceneDurationSelect.innerHTML = "";
  vidModel.durations.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = String(d);
    opt.textContent = `${d}s per scene`;
    if (d === prevDur) opt.selected = true;
    sceneDurationSelect.appendChild(opt);
  });

  // 3. Video Quality / Resolution
  videoQualitySelect.innerHTML = "";
  vidModel.qualities.forEach((q) => {
    const rate = vidModel.creditsPerSecByQuality[q] || 10;
    const opt = document.createElement("option");
    opt.value = q;
    opt.textContent = `${q} (${rate} Credits/s)`;
    if (q === prevQual) opt.selected = true;
    videoQualitySelect.appendChild(opt);
  });

  // 4. Generation Mode
  videoModeSelect.innerHTML = "";
  vidModel.modes.forEach((mode) => {
    const opt = document.createElement("option");
    opt.value = mode;
    opt.textContent = mode;
    if (mode === prevMode) opt.selected = true;
    videoModeSelect.appendChild(opt);
  });

  recalculateKieCreditCosts();
}

function recalculateKieCreditCosts() {
  const imgModel = getCurrentImageModelObj();
  const vidModel = getCurrentVideoModelObj();

  const imgRes = imageResolutionSelect.value || imgModel.defaultRes;
  const imgCredits = imgModel.creditsByRes[imgRes] ?? 4;

  const vidQual = videoQualitySelect.value || vidModel.defaultQuality;
  const vidDur = Number(sceneDurationSelect.value || vidModel.defaultDuration || 6);
  const creditsPerSec = vidModel.creditsPerSecByQuality[vidQual] ?? 10;
  const vidCredits = creditsPerSec * vidDur;

  const totalPerScene = imgCredits + vidCredits;

  // Estimate number of scenes from story word count (minimum 3 scenes for estimate)
  const words = (storyInput.value || "").trim().split(/\s+/).filter(Boolean).length;
  const estScenes = words > 0 ? Math.max(2, Math.min(16, Math.ceil(words / 22))) : 4;
  const estTotalFilmCredits = totalPerScene * estScenes;
  const estUsd = (estTotalFilmCredits * 0.005).toFixed(2);

  // Update badges & breakdown
  imageModelCreditTag.textContent = `${imgCredits} Credits / img`;
  videoModelCreditTag.textContent = `${vidCredits} Credits / ${vidDur}s clip`;
  perSceneCostBadge.textContent = `${totalPerScene} Credits / scene`;

  summaryImgModelName.textContent = `${imgModel.name.replace(" (Default)", "")} @ ${imgRes}`;
  summaryImgCredits.textContent = `${imgCredits} Credits / scene`;

  summaryVidModelName.textContent = `${vidModel.name.split(" (")[0]} (${vidDur}s @ ${vidQual})`;
  summaryVidCredits.textContent = `${vidCredits} Credits / scene (${creditsPerSec} Cr/s)`;

  summaryEstScenes.textContent = `~${estScenes} scenes`;
  summaryTotalCredits.textContent = `${totalPerScene} Cr/scene • ~${estTotalFilmCredits} Credits total (~$${estUsd})`;
}

imageModelSelect.addEventListener("change", () => {
  syncImageModelPresets();
  scheduleDraftSave();
});
imageResolutionSelect.addEventListener("change", () => {
  recalculateKieCreditCosts();
  scheduleDraftSave();
});
videoModelSelect.addEventListener("change", () => {
  syncVideoModelPresets();
  scheduleDraftSave();
});
aspectRatioSelect.addEventListener("change", () => scheduleDraftSave());
sceneDurationSelect.addEventListener("change", () => {
  recalculateKieCreditCosts();
  scheduleDraftSave();
});
videoQualitySelect.addEventListener("change", () => {
  recalculateKieCreditCosts();
  scheduleDraftSave();
});
videoModeSelect.addEventListener("change", () => scheduleDraftSave());
storyInput.addEventListener("input", () => {
  recalculateKieCreditCosts();
  scheduleDraftSave();
});

function populateNvidiaDropdowns(modelsList, selectedModel) {
  const list = Array.isArray(modelsList) && modelsList.length > 0 ? modelsList : DEFAULT_NVIDIA_MODELS;
  const target = selectedModel || userCredentials.nvidia_model || list[0];

  [setNvidiaModelSelect, studioNvidiaModel].forEach((sel) => {
    sel.innerHTML = "";
    list.forEach((mId) => {
      const opt = document.createElement("option");
      opt.value = mId;
      opt.textContent = mId;
      if (mId === target) opt.selected = true;
      sel.appendChild(opt);
    });
  });
  nvidiaModelCountBadge.textContent = `${list.length} NVIDIA models loaded`;
}

studioNvidiaModel.addEventListener("change", () => {
  setNvidiaModelSelect.value = studioNvidiaModel.value;
  userCredentials.nvidia_model = studioNvidiaModel.value;
  scheduleDraftSave();
});

setNvidiaModelSelect.addEventListener("change", () => {
  studioNvidiaModel.value = setNvidiaModelSelect.value;
  userCredentials.nvidia_model = setNvidiaModelSelect.value;
});

// ---------------------------------------------------------------------
// 7. KIE.AI CREDIT BALANCE CHECKER & NVIDIA MODEL CATALOG FETCHER
// ---------------------------------------------------------------------
function getRelayBaseUrls() {
  const custom = (setRelayUrl.value || userCredentials.relay_url || "").trim().replace(/\/+$/, "");
  const urls = [];
  if (custom) urls.push(custom);
  if (!urls.includes("http://localhost:7860")) urls.push("http://localhost:7860");
  return urls;
}

async function checkKieCreditBalance(silent = false) {
  const apiKey = (setKieApiKey.value || userCredentials.kie_api_key || "").trim();
  if (!apiKey) {
    if (!silent) showToast("Please enter your personal Kie.ai API key first.");
    return;
  }

  btnCheckKieBalance.disabled = true;
  const originalText = btnCheckKieBalance.querySelector("span").textContent;
  btnCheckKieBalance.querySelector("span").textContent = "Checking...";

  try {
    let creditsValue = null;

    // Strategy 1: Direct call to Kie.ai credit endpoint
    try {
      const directResp = await fetch("https://api.kie.ai/api/v1/chat/credit", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });
      if (directResp.ok) {
        const directData = await directResp.json();
        if (directData.code === 200 || typeof directData.data !== "undefined") {
          creditsValue = directData.data;
        }
      }
    } catch (_) {
      // Fallback to Relay if CORS blocks direct fetch
    }

    // Strategy 2: Call via Cloud/Local Relay
    if (creditsValue === null) {
      for (const base of getRelayBaseUrls()) {
        try {
          const r = await fetch(`${base}/api/kie/credits`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kie_api_key: apiKey })
          });
          if (r.ok) {
            const d = await r.json();
            creditsValue = d.credits;
            break;
          } else {
            const errJson = await r.json().catch(() => ({}));
            if (errJson.detail) throw new Error(errJson.detail);
          }
        } catch (relayErr) {
          if (relayErr.message && relayErr.message.includes("Kie.ai Credit Check Error")) {
            throw relayErr;
          }
        }
      }
    }

    if (creditsValue === null || typeof creditsValue === "undefined") {
      throw new Error("Could not retrieve balance. Verify your Kie.ai API Key is valid.");
    }

    const formatted = Number(creditsValue).toLocaleString(undefined, { maximumFractionDigits: 2 });
    const nowStr = new Date().toLocaleTimeString();

    kieBalanceDisplay.textContent = `${formatted} Credits`;
    kieBalanceTimestamp.textContent = `Last updated at ${nowStr}`;
    headerCreditValue.textContent = formatted;

    userCredentials.kie_api_key = apiKey;
    userCredentials.kie_last_balance = formatted;
    userCredentials.kie_balance_updated_at = nowStr;

    if (currentUser) {
      await saveUserCredentialsToFirestore(true);
    }
    if (!silent) showToast(`Kie.ai Balance Updated: ${formatted} Credits`);
  } catch (err) {
    if (!silent) showToast(err.message || "Failed to check Kie.ai credit balance.");
    kieBalanceTimestamp.textContent = `Error: ${err.message}`;
  } finally {
    btnCheckKieBalance.disabled = false;
    btnCheckKieBalance.querySelector("span").textContent = originalText;
  }
}

btnCheckKieBalance.addEventListener("click", () => checkKieCreditBalance(false));
btnHeaderRefreshCredit.addEventListener("click", () => checkKieCreditBalance(false));

async function loadNvidiaModelsFromApi() {
  const nvKey = (setNvidiaApiKey.value || userCredentials.nvidia_api_key || "").trim();
  if (!nvKey) {
    showToast("Please enter your NVIDIA API Key (nvapi-...) first.");
    return;
  }

  btnLoadNvidiaModels.disabled = true;
  const labelSpan = btnLoadNvidiaModels.querySelector("span");
  const prevText = labelSpan.textContent;
  labelSpan.textContent = "Loading Models...";

  try {
    let loadedModels = null;

    // Try Relay first (since integrate.api.nvidia.com blocks browser CORS)
    for (const base of getRelayBaseUrls()) {
      try {
        const resp = await fetch(`${base}/api/nvidia/models`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nvidia_api_key: nvKey })
        });
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.models) && data.models.length > 0) {
            loadedModels = data.models;
            break;
          }
        } else {
          const err = await resp.json().catch(() => ({}));
          if (err.detail && err.detail.includes("NVIDIA API returned")) {
            throw new Error(err.detail);
          }
        }
      } catch (e) {
        if (e.message && e.message.includes("NVIDIA API returned")) throw e;
      }
    }

    // Try direct fetch if browser permits
    if (!loadedModels) {
      try {
        const direct = await fetch("https://integrate.api.nvidia.com/v1/models", {
          headers: { "Authorization": `Bearer ${nvKey}`, "Accept": "application/json" }
        });
        if (direct.ok) {
          const dJson = await direct.json();
          loadedModels = (dJson.data || []).map((x) => x.id).filter(Boolean).sort();
        }
      } catch (_) {}
    }

    if (!loadedModels || loadedModels.length === 0) {
      loadedModels = [...DEFAULT_NVIDIA_MODELS];
      showToast("Loaded curated NVIDIA NIM model catalog (60+ models ready on Kaggle).");
    } else {
      showToast(`Loaded ${loadedModels.length} live AI models from NVIDIA NIM!`);
    }

    userCredentials.nvidia_api_key = nvKey;
    userCredentials.nvidia_available_models = loadedModels;
    populateNvidiaDropdowns(loadedModels, setNvidiaModelSelect.value);

    if (currentUser) {
      await saveUserCredentialsToFirestore(true);
    }
  } catch (err) {
    showToast(err.message || "Could not load NVIDIA models.");
  } finally {
    btnLoadNvidiaModels.disabled = false;
    labelSpan.textContent = prevText;
  }
}

btnLoadNvidiaModels.addEventListener("click", loadNvidiaModelsFromApi);

// ---------------------------------------------------------------------
// 8. HUGGING FACE DATASET AUTO-CREATE & @TAG REFERENCE IMAGE UPLOADS
// ---------------------------------------------------------------------
async function verifyAndEnsureHfDataset(silent = false) {
  const hfUser = (setHfUsername.value || userCredentials.hf_username || "").trim();
  const hfToken = (setHfToken.value || userCredentials.hf_token || "").trim();
  const dsName = (setHfDatasetName.value || userCredentials.hf_dataset_name || "story-to-film-assets").trim();

  if (!hfUser || !hfToken) {
    if (!silent) showToast("Please enter both your Hugging Face Username and Write Token in Settings.");
    return null;
  }

  const repoId = dsName.includes("/") ? dsName : `${hfUser}/${dsName}`;
  if (!silent) {
    hfVerifyStatusText.textContent = `Ensuring dataset ${repoId} exists...`;
  }

  try {
    try {
      await createRepo({
        repo: { type: "dataset", name: repoId },
        accessToken: hfToken,
        private: false
      });
    } catch (err) {
      // 409 Conflict means the dataset already exists on the user's account
      if (!String(err.message || err).includes("409") && !String(err.message || err).toLowerCase().includes("already")) {
        // Fallback to Relay
        for (const base of getRelayBaseUrls()) {
          const r = await fetch(`${base}/api/hf/ensure-dataset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hf_username: hfUser, hf_token: hfToken, dataset_name: dsName })
          });
          if (r.ok) break;
        }
      }
    }

    if (!silent) {
      hfVerifyStatusText.textContent = `Dataset verified: https://huggingface.co/datasets/${repoId}`;
      showToast(`Hugging Face Dataset ready: ${repoId}`);
    }
    return repoId;
  } catch (e) {
    if (!silent) {
      hfVerifyStatusText.textContent = `Error: ${e.message}`;
      showToast(`HF Dataset Error: ${e.message}`);
    }
    return null;
  }
}

btnVerifyHfDataset.addEventListener("click", () => verifyAndEnsureHfDataset(false));

function validateReferenceTags() {
  tagValidationError.style.display = "none";
  tagValidationError.textContent = "";

  const seen = new Set();
  let hasError = false;
  let errMsg = "";

  referenceTags.forEach((item) => {
    const clean = (item.tag || "").trim();
    item.invalid = false;

    if (!clean) {
      item.invalid = true;
      hasError = true;
      errMsg = "Every uploaded reference image must have a @tag name (e.g., Dave, Mary, School).";
      return;
    }
    if (/\s/.test(clean) || !/^[a-zA-Z0-9_]+$/.test(clean)) {
      item.invalid = true;
      hasError = true;
      errMsg = `Invalid tag "@${clean}": tags must be one word with no spaces or special characters.`;
      return;
    }
    const lower = clean.toLowerCase();
    if (seen.has(lower)) {
      item.invalid = true;
      hasError = true;
      errMsg = `Duplicate tag "@${clean}": every reference image must have a unique tag name.`;
      return;
    }
    seen.add(lower);
  });

  if (hasError) {
    tagValidationError.textContent = errMsg;
    tagValidationError.style.display = "block";
  }

  document.querySelectorAll(".ref-tag-card").forEach((card) => {
    const id = card.dataset.id;
    const item = referenceTags.find((x) => x.id === id);
    if (item) {
      card.classList.toggle("invalid", Boolean(item.invalid));
    }
  });

  return !hasError;
}

function renderReferenceTagsGrid() {
  refTagsGrid.innerHTML = "";
  tagCountBadge.textContent = `${referenceTags.length} ${referenceTags.length === 1 ? "tag" : "tags"}`;

  referenceTags.forEach((item) => {
    const card = document.createElement("div");
    card.className = `ref-tag-card ${item.invalid ? "invalid" : ""}`;
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="ref-thumb-wrap">
        <img class="ref-thumb-img" src="${item.previewUrl || item.url}" alt="Reference @${item.tag}">
        <button type="button" class="ref-delete-btn" title="Remove reference image" aria-label="Remove reference image">&times;</button>
      </div>
      <div class="ref-tag-input-wrap">
        <span class="ref-at-prefix">@</span>
        <input type="text" class="ref-tag-input" value="${item.tag}" placeholder="TagName (1 word)" required>
      </div>
      <span class="ref-upload-state">${item.uploading ? "Uploading to HF Dataset..." : item.url ? "Synced to HF Dataset" : "Local preview (syncs on run)"}</span>
    `;

    const inputEl = card.querySelector(".ref-tag-input");
    inputEl.addEventListener("input", (e) => {
      item.tag = e.target.value.replace(/^@+/, "");
      validateReferenceTags();
      scheduleDraftSave();
    });

    const delBtn = card.querySelector(".ref-delete-btn");
    delBtn.addEventListener("click", () => {
      referenceTags = referenceTags.filter((x) => x.id !== item.id);
      renderReferenceTagsGrid();
      validateReferenceTags();
      scheduleDraftSave();
    });

    refTagsGrid.appendChild(card);
  });
}

async function uploadSingleReferenceFileToHf(file, suggestedTag) {
  const hfUser = (userCredentials.hf_username || setHfUsername.value || "").trim();
  const hfToken = (userCredentials.hf_token || setHfToken.value || "").trim();
  const dsName = (userCredentials.hf_dataset_name || setHfDatasetName.value || "story-to-film-assets").trim();

  if (!hfUser || !hfToken) {
    throw new Error("Add your Hugging Face Username & Token in Settings so reference images can be hosted.");
  }

  const repoId = await verifyAndEnsureHfDataset(true);
  if (!repoId) {
    throw new Error("Could not initialize Hugging Face Dataset repository.");
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const safeTag = (suggestedTag || "ref").replace(/[^a-zA-Z0-9_-]/g, "") || "ref";
  const remotePath = `references/${safeTag}_${Date.now()}.${ext}`;

  await uploadFile({
    repo: { type: "dataset", name: repoId },
    accessToken: hfToken,
    file: {
      path: remotePath,
      content: file
    },
    commitTitle: `Upload reference @${safeTag}`
  });

  return `https://huggingface.co/datasets/${repoId}/resolve/main/${remotePath}`;
}

async function handleReferenceFilesSelected(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  for (const file of files) {
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "");
    let candidateTag = baseName || `Ref${referenceTags.length + 1}`;
    // Ensure default tag is unique
    let suffix = 1;
    while (referenceTags.some((t) => t.tag.toLowerCase() === candidateTag.toLowerCase())) {
      candidateTag = `${baseName || "Ref"}${++suffix}`;
    }

    const previewUrl = URL.createObjectURL(file);
    const newItem = {
      id: "ref_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      tag: candidateTag,
      url: "",
      previewUrl,
      fileObj: file,
      uploading: true
    };
    referenceTags.push(newItem);
    renderReferenceTagsGrid();
    validateReferenceTags();

    try {
      const hfUrl = await uploadSingleReferenceFileToHf(file, candidateTag);
      newItem.url = hfUrl;
      newItem.uploading = false;
      renderReferenceTagsGrid();
      scheduleDraftSave();
    } catch (err) {
      newItem.uploading = false;
      renderReferenceTagsGrid();
      showToast(err.message);
    }
  }
}

refFileInput.addEventListener("change", (e) => {
  handleReferenceFilesSelected(e.target.files);
  refFileInput.value = "";
});

refDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  refDropzone.classList.add("dragover");
});
refDropzone.addEventListener("dragleave", () => {
  refDropzone.classList.remove("dragover");
});
refDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  refDropzone.classList.remove("dragover");
  if (e.dataTransfer?.files?.length) {
    handleReferenceFilesSelected(e.dataTransfer.files);
  }
});

// ---------------------------------------------------------------------
// 9. PERSISTENT USER SETTINGS & PROJECT DRAFT STORAGE IN FIRESTORE
// ---------------------------------------------------------------------
function updateMissingCredentialsBanner() {
  const hasAll =
    Boolean(userCredentials.kie_api_key) &&
    Boolean(userCredentials.nvidia_api_key) &&
    Boolean(userCredentials.kaggle_username) &&
    Boolean(userCredentials.kaggle_key) &&
    Boolean(userCredentials.hf_username) &&
    Boolean(userCredentials.hf_token);

  missingCredsBanner.style.display = hasAll ? "none" : "flex";
}

async function loadUserSettingsAndDraft(uid) {
  try {
    const credRef = doc(db, "users", uid, "settings", "credentials");
    const credSnap = await getDoc(credRef);
    if (credSnap.exists()) {
      const data = credSnap.data();
      userCredentials = { ...userCredentials, ...data };
    }

    // Populate Settings Form
    setKieApiKey.value = userCredentials.kie_api_key || "";
    setNvidiaApiKey.value = userCredentials.nvidia_api_key || "";
    setKaggleUsername.value = userCredentials.kaggle_username || "";
    setKaggleKey.value = userCredentials.kaggle_key || "";
    setHfUsername.value = userCredentials.hf_username || "";
    setHfToken.value = userCredentials.hf_token || "";
    setHfDatasetName.value = userCredentials.hf_dataset_name || "story-to-film-assets";
    setRelayUrl.value = userCredentials.relay_url || "http://localhost:7860";

    if (userCredentials.kie_last_balance) {
      headerCreditValue.textContent = userCredentials.kie_last_balance;
      kieBalanceDisplay.textContent = `${userCredentials.kie_last_balance} Credits`;
      kieBalanceTimestamp.textContent = userCredentials.kie_balance_updated_at
        ? `Last checked at ${userCredentials.kie_balance_updated_at}`
        : "Saved balance";
    }

    populateNvidiaDropdowns(userCredentials.nvidia_available_models, userCredentials.nvidia_model);
    updateMissingCredentialsBanner();

    // Auto-refresh Kie.ai balance if key exists
    if (userCredentials.kie_api_key) {
      checkKieCreditBalance(true);
    }

    // Load saved project draft
    const draftRef = doc(db, "users", uid, "drafts", "current");
    const draftSnap = await getDoc(draftRef);
    if (draftSnap.exists()) {
      const d = draftSnap.data();
      if (d.story) storyInput.value = d.story;
      if (Array.isArray(d.reference_tags)) {
        referenceTags = d.reference_tags.map((t, i) => ({
          id: t.id || `ref_saved_${i}`,
          tag: t.tag || `Tag${i + 1}`,
          url: t.url || "",
          previewUrl: t.url || "",
          uploading: false
        }));
        renderReferenceTagsGrid();
      }
      if (d.image_model) populateImageModelDropdown(d.image_model);
      if (d.image_resolution) syncImageModelPresets(d.image_resolution);
      if (d.video_model) populateVideoModelDropdown(d.video_model);
      syncVideoModelPresets({
        aspect: d.aspect_ratio,
        duration: d.scene_duration,
        quality: d.video_quality,
        mode: d.video_mode
      });
      if (d.active_job_id) {
        currentJobId = d.active_job_id;
        subscribeToJobUpdates(currentJobId);
      }
    }
  } catch (err) {
    console.warn("Failed to load user settings/draft:", err);
  }
}

async function saveUserCredentialsToFirestore(silent = false) {
  if (!currentUser) return;
  userCredentials.kie_api_key = setKieApiKey.value.trim();
  userCredentials.nvidia_api_key = setNvidiaApiKey.value.trim();
  userCredentials.nvidia_model = setNvidiaModelSelect.value || studioNvidiaModel.value;
  userCredentials.kaggle_username = setKaggleUsername.value.trim();
  userCredentials.kaggle_key = setKaggleKey.value.trim();
  userCredentials.hf_username = setHfUsername.value.trim();
  userCredentials.hf_token = setHfToken.value.trim();
  userCredentials.hf_dataset_name = setHfDatasetName.value.trim() || "story-to-film-assets";
  userCredentials.relay_url = setRelayUrl.value.trim() || "http://localhost:7860";

  const credRef = doc(db, "users", currentUser.uid, "settings", "credentials");
  await setDoc(credRef, {
    ...userCredentials,
    updated_at: new Date().toISOString()
  }, { merge: true });

  studioNvidiaModel.value = userCredentials.nvidia_model;
  updateMissingCredentialsBanner();

  if (!silent) {
    showToast("All credentials and model preferences saved to your private profile.");
  }
}

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await saveUserCredentialsToFirestore(false);
  if (userCredentials.kie_api_key) {
    checkKieCreditBalance(true);
  }
});

function scheduleDraftSave() {
  if (!currentUser) return;
  draftSaveIndicator.textContent = "Saving...";
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(async () => {
    try {
      const draftRef = doc(db, "users", currentUser.uid, "drafts", "current");
      const serializableTags = referenceTags
        .filter((t) => t.tag)
        .map((t) => ({ id: t.id, tag: t.tag, url: t.url || "" }));

      await setDoc(draftRef, {
        story: storyInput.value,
        reference_tags: serializableTags,
        nvidia_model: studioNvidiaModel.value,
        image_model: imageModelSelect.value,
        image_resolution: imageResolutionSelect.value,
        video_model: videoModelSelect.value,
        video_mode: videoModeSelect.value,
        aspect_ratio: aspectRatioSelect.value,
        scene_duration: Number(sceneDurationSelect.value || 6),
        video_quality: videoQualitySelect.value,
        active_job_id: currentJobId || "",
        updated_at: new Date().toISOString()
      }, { merge: true });
      draftSaveIndicator.textContent = "Draft saved";
    } catch (_) {
      draftSaveIndicator.textContent = "Local draft";
    }
  }, 700);
}

// ---------------------------------------------------------------------
// 10. LAUNCH KAGGLE T4 PIPELINE, REAL-TIME STREAMING & AUTO-DOWNLOAD
// ---------------------------------------------------------------------
function triggerBrowserFileDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function renderStoryboardScenes(scenes) {
  currentJobScenes = Array.isArray(scenes) ? scenes : [];
  storyboardCountLabel.textContent = `${currentJobScenes.length} ${currentJobScenes.length === 1 ? "scene" : "scenes"}`;

  if (!currentJobScenes.length) {
    scenesStoryboardGrid.innerHTML = `
      <div class="empty-state">
        <p>No active scenes yet. Launch a Story to Film run to stream planned scenes, reference frames, and rendered video clips here.</p>
      </div>`;
    return;
  }

  scenesStoryboardGrid.innerHTML = "";
  let anyFailed = false;

  currentJobScenes.forEach((sc) => {
    const scNum = sc.scene_number;
    const dlName = sc.download_filename || `${scNum}.Scene ${scNum} - ${sc.title || "Scene"}.mp4`;
    if (sc.image_status === "failed" || sc.video_status === "failed") {
      anyFailed = true;
    }

    // Auto-download scene video as soon as it finishes!
    if (sc.video_status === "done" && sc.video_url && !autoDownloadedSceneUrls.has(sc.video_url)) {
      autoDownloadedSceneUrls.add(sc.video_url);
      showToast(`Auto-downloading ${dlName}...`);
      triggerBrowserFileDownload(sc.video_url, dlName);
    }

    const tagsHtml = (sc.tags_used || [])
      .map((t) => `<span class="scene-tag-pill">${t}</span>`)
      .join("");

    const card = document.createElement("div");
    card.className = "scene-card";
    card.innerHTML = `
      <div class="scene-card-top">
        <span class="scene-title">${scNum}. Scene ${scNum} — ${sc.title || ""}</span>
        <div class="scene-tags-row">${tagsHtml}</div>
      </div>
      <div class="scene-prompts">
        <div><strong>Frame Prompt:</strong> ${sc.image_prompt || ""}</div>
        <div><strong>Motion Prompt:</strong> ${sc.video_prompt || ""}</div>
        ${sc.error ? `<div class="field-error">${sc.error}</div>` : ""}
      </div>
      <div class="scene-media-grid">
        <div class="scene-media-box">
          <div class="scene-media-label">
            <span>Starting Frame</span>
            <span class="tabular">${(sc.image_status || "pending").toUpperCase()}</span>
          </div>
          ${
            sc.image_url
              ? `<img src="${sc.image_url}" alt="Scene ${scNum} starting frame" loading="lazy">`
              : `<div class="empty-state"><span>${sc.image_status === "generating" ? "Generating on Kie.ai..." : "Queued"}</span></div>`
          }
        </div>
        <div class="scene-media-box">
          <div class="scene-media-label">
            <span>${dlName}</span>
            <span class="tabular">${(sc.video_status || "pending").toUpperCase()}</span>
          </div>
          ${
            sc.video_url
              ? `<video src="${sc.video_url}" controls playsinline preload="metadata"></video>`
              : `<div class="empty-state"><span>${sc.video_status === "generating" ? "Animating on Kie.ai..." : "Waiting for frame"}</span></div>`
          }
        </div>
      </div>
    `;
    scenesStoryboardGrid.appendChild(card);
  });

  btnRetryFailedScenes.style.display = anyFailed ? "inline-flex" : "none";
}

function subscribeToJobUpdates(jobId) {
  if (unsubscribeJobSnapshot) unsubscribeJobSnapshot();

  const jobRef = doc(db, "automations", jobId);
  unsubscribeJobSnapshot = onSnapshot(jobRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();

    const pct = Number(data.progress || 0);
    const status = (data.status || "running").toLowerCase();
    const milestone = data.current_milestone || data.message || "Processing on Kaggle T4...";

    liveProgressPct.textContent = `${pct}%`;
    liveProgressFill.style.width = `${pct}%`;
    progressBarAria.setAttribute("aria-valuenow", String(pct));
    liveMilestoneText.textContent = milestone;

    jobStatusBadge.textContent = status.toUpperCase();
    jobStatusBadge.className = `status-badge ${status}`;

    // Update top step ribbon based on progress percentage
    if (pct < 18) updatePipelineStepRibbon("plan");
    else if (pct < 50) updatePipelineStepRibbon("images");
    else updatePipelineStepRibbon("videos");

    if (data.logs_json) {
      try {
        const logs = JSON.parse(data.logs_json);
        if (Array.isArray(logs)) {
          terminalConsole.innerHTML = "";
          logs.forEach((line) => appendTerminalLog(line));
        }
      } catch (_) {}
    }

    if (data.scenes_json) {
      try {
        const parsedScenes = JSON.parse(data.scenes_json);
        renderStoryboardScenes(parsedScenes);
      } catch (_) {}
    }

    if (status === "running" || status === "queued") {
      btnRunPipeline.disabled = true;
      btnCancelPipeline.disabled = false;
    } else {
      btnRunPipeline.disabled = false;
      btnCancelPipeline.disabled = true;
    }

    if (status === "completed" && data.asset_url) {
      finalFilmPanel.style.display = "block";
      masterAssetUrlInput.value = data.asset_url;
      btnDownloadMasterFilm.href = data.asset_url;
      if (masterVideoPlayer.src !== data.asset_url) {
        masterVideoPlayer.src = data.asset_url;
        masterVideoPlayer.load();
      }
      const doneCount = currentJobScenes.filter((s) => s.video_status === "done").length;
      finalSummaryStats.textContent = `${doneCount}/${currentJobScenes.length || doneCount} Scenes Stitched`;
      checkKieCreditBalance(true);
    }
  });
}

async function launchStoryToFilmPipeline(retryOnly = false) {
  if (!currentUser) {
    showToast("Please sign in with Google first.");
    return;
  }

  const story = storyInput.value.trim();
  if (!story) {
    showToast("Please enter your story or script before launching.");
    storyInput.focus();
    return;
  }

  if (!validateReferenceTags()) {
    showToast("Please fix the @tag validation errors on your reference images.");
    return;
  }

  if (
    !userCredentials.kie_api_key ||
    !userCredentials.nvidia_api_key ||
    !userCredentials.kaggle_username ||
    !userCredentials.kaggle_key ||
    !userCredentials.hf_username ||
    !userCredentials.hf_token
  ) {
    showToast("Please complete your API keys & Kaggle/HF credentials in the Settings tab first.");
    switchTab("settings");
    return;
  }

  // Ensure any pending reference image uploads finish first
  for (const item of referenceTags) {
    if (!item.url && item.fileObj) {
      item.uploading = true;
      renderReferenceTagsGrid();
      item.url = await uploadSingleReferenceFileToHf(item.fileObj, item.tag);
      item.uploading = false;
      renderReferenceTagsGrid();
    }
  }

  const randomSuffix = Math.random().toString(36).slice(2, 10);
  currentJobId = `job_${Date.now()}_${randomSuffix}`;
  if (!retryOnly) {
    autoDownloadedSceneUrls.clear();
    finalFilmPanel.style.display = "none";
  }

  btnRunPipeline.disabled = true;
  btnCancelPipeline.disabled = false;
  updatePipelineStepRibbon("plan");

  const cleanTagsPayload = referenceTags.map((t) => ({
    tag: t.tag.replace(/^@+/, ""),
    url: t.url
  }));

  const launchPayload = {
    job_id: currentJobId,
    firebase_project_id: firebaseConfig.projectId,
    kaggle_username: userCredentials.kaggle_username,
    kaggle_key: userCredentials.kaggle_key,
    nvidia_api_key: userCredentials.nvidia_api_key,
    nvidia_model: studioNvidiaModel.value || userCredentials.nvidia_model,
    kie_api_key: userCredentials.kie_api_key,
    hf_username: userCredentials.hf_username,
    hf_token: userCredentials.hf_token,
    hf_dataset_name: userCredentials.hf_dataset_name || "story-to-film-assets",
    story,
    reference_tags: cleanTagsPayload,
    image_model: imageModelSelect.value,
    image_resolution: imageResolutionSelect.value,
    video_model: videoModelSelect.value,
    aspect_ratio: aspectRatioSelect.value,
    scene_duration: Number(sceneDurationSelect.value || 6),
    video_quality: videoQualitySelect.value,
    video_mode: videoModeSelect.value,
    retry_scenes_only: retryOnly,
    existing_scenes: retryOnly ? currentJobScenes : []
  };

  try {
    appendTerminalLog(`[Launch] Creating private job ${currentJobId} in Firestore...`);
    const jobDocRef = doc(db, "automations", currentJobId);
    await setDoc(jobDocRef, {
      owner_uid: currentUser.uid,
      job_id: currentJobId,
      title: story.slice(0, 64),
      status: "queued",
      step: "queued",
      message: "Dispatching kernel to your Kaggle T4 GPU account...",
      current_milestone: "Dispatching kernel to your Kaggle T4 GPU account...",
      progress: 2,
      cancel_requested: false,
      image_model: launchPayload.image_model,
      video_model: launchPayload.video_model,
      aspect_ratio: launchPayload.aspect_ratio,
      scene_duration: launchPayload.scene_duration,
      video_quality: launchPayload.video_quality,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    scheduleDraftSave();
    subscribeToJobUpdates(currentJobId);

    // Push Kernel to User's Kaggle Account via Relay
    let pushed = false;
    let lastRelayErr = "";
    for (const base of getRelayBaseUrls()) {
      try {
        const resp = await fetch(`${base}/api/kaggle/launch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(launchPayload)
        });
        if (resp.ok) {
          const rData = await resp.json();
          pushed = true;
          if (rData.kernel_url) {
            kaggleKernelLink.href = rData.kernel_url;
            kaggleKernelLink.style.display = "inline";
          }
          appendTerminalLog(`[Kaggle T4] Kernel pushed to ${rData.kernel_id}! Streaming live milestones...`);
          showToast("Kaggle T4 GPU Kernel launched! Streaming progress...");
          break;
        } else {
          const errJson = await resp.json().catch(() => ({}));
          lastRelayErr = errJson.detail || `HTTP ${resp.status}`;
        }
      } catch (e) {
        lastRelayErr = e.message;
      }
    }

    if (!pushed) {
      throw new Error(`Kaggle Dispatch Error: ${lastRelayErr || "Ensure relay service is reachable."}`);
    }
  } catch (err) {
    appendTerminalLog(`[Error] ${err.message}`, "error");
    showToast(err.message);
    btnRunPipeline.disabled = false;
    btnCancelPipeline.disabled = true;
  }
}

storyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  launchStoryToFilmPipeline(false);
});

btnRetryFailedScenes.addEventListener("click", () => {
  launchStoryToFilmPipeline(true);
});

btnCancelPipeline.addEventListener("click", async () => {
  if (!currentJobId) return;
  appendTerminalLog("[Cancel] Sending immediate termination signal to Kaggle watchdog...", "warn");
  try {
    const jobRef = doc(db, "automations", currentJobId);
    await updateDoc(jobRef, {
      cancel_requested: true,
      status: "cancelled",
      current_milestone: "Cancellation requested by user."
    });
    btnCancelPipeline.disabled = true;
    showToast("Cancellation signal sent to Kaggle worker.");
  } catch (err) {
    showToast(`Cancel error: ${err.message}`);
  }
});

btnClearLogs.addEventListener("click", () => {
  terminalConsole.innerHTML = "";
});

btnCopyMasterUrl.addEventListener("click", () => {
  if (masterAssetUrlInput.value) {
    navigator.clipboard.writeText(masterAssetUrlInput.value);
    showToast("Hugging Face Film URL copied to clipboard!");
  }
});

btnDownloadAllScenes.addEventListener("click", () => {
  const doneScenes = currentJobScenes.filter((s) => s.video_status === "done" && s.video_url);
  if (!doneScenes.length) {
    showToast("No completed scene videos available yet.");
    return;
  }
  doneScenes.forEach((sc, idx) => {
    setTimeout(() => {
      const dlName = sc.download_filename || `${sc.scene_number}.Scene ${sc.scene_number} - ${sc.title}.mp4`;
      triggerBrowserFileDownload(sc.video_url, dlName);
    }, idx * 450);
  });
  showToast(`Downloading ${doneScenes.length} numbered scene clips...`);
});

// ---------------------------------------------------------------------
// 11. MY PRIVATE FILMS (USER-ISOLATED JOB HISTORY)
// ---------------------------------------------------------------------
async function loadUserFilmHistory() {
  if (!currentUser) return;
  historyListContainer.innerHTML = `<div class="empty-state"><p>Loading your private film runs...</p></div>`;
  try {
    const q = query(
      collection(db, "automations"),
      where("owner_uid", "==", currentUser.uid)
    );
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((docSnap) => items.push(docSnap.data()));
    items.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));

    if (!items.length) {
      historyListContainer.innerHTML = `<div class="empty-state"><p>You haven't generated any films yet. Launch your first run in the Film Studio tab.</p></div>`;
      return;
    }

    historyListContainer.innerHTML = "";
    items.forEach((job) => {
      const card = document.createElement("div");
      card.className = "history-card";
      const dateStr = job.created_at ? new Date(job.created_at).toLocaleString() : "";
      card.innerHTML = `
        <div>
          <div class="scene-card-top">
            <strong>${job.title || job.job_id}</strong>
            <span class="status-badge ${(job.status || "").toLowerCase()}">${(job.status || "queued").toUpperCase()}</span>
          </div>
          <p class="field-helper" style="margin-top: 6px;">${dateStr} • ${job.video_model || ""} • ${job.aspect_ratio || "16:9"}</p>
          <p style="font-size: 0.84rem; color: var(--ink-secondary);">${job.current_milestone || ""}</p>
        </div>
        <div class="action-row">
          <button type="button" class="btn btn-secondary btn-sm btn-open-job">Open in Studio</button>
          ${
            job.asset_url
              ? `<a href="${job.asset_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Watch Film</a>`
              : ""
          }
        </div>
      `;
      card.querySelector(".btn-open-job").addEventListener("click", () => {
        currentJobId = job.job_id;
        subscribeToJobUpdates(currentJobId);
        switchTab("studio");
      });
      historyListContainer.appendChild(card);
    });
  } catch (err) {
    historyListContainer.innerHTML = `<div class="field-error">Failed to load history: ${err.message}</div>`;
  }
}

btnRefreshHistory.addEventListener("click", loadUserFilmHistory);

// ---------------------------------------------------------------------
// 12. AUTHENTICATION LIFECYCLE (GOOGLE SIGN-IN)
// ---------------------------------------------------------------------
btnGoogleSignIn.addEventListener("click", async () => {
  authErrorBox.style.display = "none";
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    // If Google OAuth provider needs one-time toggle in console or popup is blocked, offer seamless fallback
    console.warn("Google Sign-In Popup note:", err);
    if (
      err.code === "auth/operation-not-allowed" ||
      err.code === "auth/unauthorized-domain" ||
      err.code === "auth/popup-blocked"
    ) {
      try {
        await signInAnonymously(auth);
        showToast("Signed into isolated studio session.");
        return;
      } catch (_) {}
    }
    authErrorBox.textContent = `Sign-In Notice (${err.code || "auth"}): ${err.message}`;
    authErrorBox.style.display = "block";
  }
});

btnSignOut.addEventListener("click", async () => {
  if (unsubscribeJobSnapshot) unsubscribeJobSnapshot();
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authGate.style.display = "none";
    appShell.style.display = "block";
    userNameDisplay.textContent = user.displayName || user.email || `Director (${user.uid.slice(0, 6)})`;
    if (user.photoURL) {
      userAvatar.src = user.photoURL;
      userAvatar.style.display = "block";
    } else {
      userAvatar.style.display = "none";
    }
    populateImageModelDropdown();
    populateVideoModelDropdown();
    populateNvidiaDropdowns(DEFAULT_NVIDIA_MODELS, userCredentials.nvidia_model);
    loadUserSettingsAndDraft(user.uid);
  } else {
    authGate.style.display = "flex";
    appShell.style.display = "none";
  }
});

// Initialize dropdowns on load
populateImageModelDropdown();
populateVideoModelDropdown();
populateNvidiaDropdowns(DEFAULT_NVIDIA_MODELS, "meta/llama-3.3-70b-instruct");
