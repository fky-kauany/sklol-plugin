var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/sklol/index.ts
import "./style.css";

// ../shared/src/mods.ts
/*!
 * A lista de skins da comunidade, que vem das fontes que o jogador adicionou (manifestos, veja
 * sources.ts). O LOCAL busca, valida e entrega ao plugin só o que a lista mostra: o plugin
 * nunca fala com a fonte direto (sem CORS, o client nem conseguiria ler a resposta).
 */
var MODS_MAX_PAGE = 1e3;
var MODS_MAX_SEARCH = 100;
var SOURCE_ID = /^[a-z0-9][a-z0-9._-]{2,63}$/;
var isSourceId = (id) => typeof id === "string" && SOURCE_ID.test(id);
var MOD_SORTS = ["relevance", "updated", "downloads"];
var DEFAULT_SORT = "relevance";
var MOD_CATEGORIES = [
  "skins",
  "maps",
  "fonts",
  "ui",
  "sounds",
  "other"
];
var DEFAULT_CATEGORY = "skins";
var ALL_CATEGORY = "other";
var isModCategory = (value) => MOD_CATEGORIES.includes(value);
var modsPath = (source, page, search = "", sort = DEFAULT_SORT, category = DEFAULT_CATEGORY) => `/mods?source=${encodeURIComponent(source)}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${sort === DEFAULT_SORT ? "" : `&sort=${sort}`}${category === DEFAULT_CATEGORY ? "" : `&category=${category}`}`;
var normalizeSearch = (input) => input.trim().replace(/\s+/g, " ");
var MOD_ID = /^[\w-]{1,64}$/;
var isModId = (id) => typeof id === "string" && MOD_ID.test(id);
var MAX_URL = 2048;
function isHttpsUrl(input) {
  if (typeof input !== "string" || input.length > MAX_URL) return false;
  try {
    const url = new URL(input);
    return url.protocol === "https:" && !url.username && !url.password && (url.port === "" || url.port === "443");
  } catch {
    return false;
  }
}
var isThumbnailUrl = isHttpsUrl;
var isChampionId = (value) => typeof value === "number" && Number.isInteger(value) && value > 0 && value < 1e4;

// ../shared/src/champions.ts
var key = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
function parseChampionSummary(input) {
  if (!Array.isArray(input) || input.length > 1e3) {
    throw new Error("lista de campe\xF5es inv\xE1lida");
  }
  return input.flatMap((item) => {
    const { id, name, alias } = item ?? {};
    return isChampionId(id) && typeof name === "string" && typeof alias === "string" ? [{ id, name, alias }] : [];
  });
}
function championIdByName(name, champions) {
  const wanted = key(name);
  if (!wanted) return null;
  const found = champions.find(
    (c) => key(c.name) === wanted || key(c.alias) === wanted
  );
  return found?.id ?? null;
}

// ../shared/src/saved.ts
var SAVED_THUMBNAIL_ROUTE = /^\/saved\/([\w-]{1,64})\/thumbnail$/;
var savedPath = (modId) => modId ? `/saved/${modId}` : "/saved";
var MAX_SAVED_BODY = 8 * 1024;
var MAX_SAVED = 200;
function parseSavedList(input) {
  const { ids, championId } = input ?? {};
  if (!Array.isArray(ids) || ids.length > MAX_SAVED || !ids.every(isModId)) {
    throw new Error("lista de skins salvas inv\xE1lida");
  }
  return isChampionId(championId) ? { ids, championId } : { ids };
}
var appliedPath = (modId) => `/installed/${modId}/applied`;
var MAX_IMAGE_DATA_URL = 700 * 1024;
var MAX_THUMBNAIL_BODY = MAX_IMAGE_DATA_URL + 1024;
var IMAGE_DATA_URL = /^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/;
var isImageDataUrl = (value) => typeof value === "string" && value.length <= MAX_IMAGE_DATA_URL && IMAGE_DATA_URL.test(value);
var isInstalledThumbnail = (value) => value === "" || isThumbnailUrl(value) || isImageDataUrl(value);
var importPath = (category, fileName) => `/installed/import?category=${category}&name=${encodeURIComponent(fileName.slice(0, 200))}`;
var MAX_IMPORT = 200 * 1024 * 1024;
var editPath = (modId) => `/installed/${modId}`;
var MAX_EDIT_BODY = MAX_THUMBNAIL_BODY + 1024;
var MAX_MOD_NAME = 120;
var normalizeModName = (raw) => raw.replace(/\p{Cc}/gu, " ").replace(/\s+/g, " ").trim();
var IMAGE_PREVIEW_PATH = "/images/preview";
var MAX_IMAGE_PREVIEW_BODY = 4 * 1024;
var LOCAL_THUMBNAIL = /^\/saved\/[\w-]{1,64}\/thumbnail\?v=\d{1,16}$/;
var isCount = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
var isInstalled = (value) => {
  const m = value;
  return !!m && isSourceId(m.source) && isModId(m.id) && typeof m.name === "string" && typeof m.publisher === "string" && isModCategory(m.category) && (m.championId === null || isChampionId(m.championId)) && Array.isArray(m.champions) && m.champions.every((c) => typeof c === "string") && isInstalledThumbnail(m.thumbnail) && isCount(m.savedAt) && isCount(m.updatedAt) && isCount(m.downloads) && typeof m.nsfw === "boolean" && typeof m.applied === "boolean" && !!m.local && (m.local.thumbnail === "" || LOCAL_THUMBNAIL.test(m.local.thumbnail)) && typeof m.local.renamed === "boolean" && typeof m.local.customImage === "boolean";
};
function parseInstalledList(input) {
  const { mods } = input ?? {};
  if (!Array.isArray(mods) || mods.length > MAX_SAVED || !mods.every(isInstalled)) {
    throw new Error("lista de mods instalados inv\xE1lida");
  }
  return { mods };
}

// ../shared/src/selection.ts
var isId = (n) => typeof n === "number" && Number.isInteger(n) && n > 0;
var ownedBy = (id, championId) => Math.floor(id / 1e3) === championId;

// ../shared/src/customs.ts
var MAX_CUSTOMS = 20;
var MAX_NAME = 40;
var ASSET_PATH = /^\/lol-game-data\/assets\/[\w./-]+$/;
var customsPath = (championId) => `/${championId}/customs`;
function parseAsset(input) {
  if (typeof input !== "string" || !ASSET_PATH.test(input) || input.includes("..")) {
    throw new Error("imagem inv\xE1lida");
  }
  return input;
}
function parseCustomSkins(input, championId) {
  if (!Array.isArray(input) || input.length > MAX_CUSTOMS) {
    throw new Error("lista de skins custom inv\xE1lida");
  }
  const seen = /* @__PURE__ */ new Set();
  return input.map((item) => {
    const { id, name, splashPath, tilePath, thumbnailPath } = item ?? {};
    if (!isId(id) || !ownedBy(id, championId) || id === championId * 1e3 || seen.has(id)) {
      throw new Error("skin custom inv\xE1lida");
    }
    if (typeof name !== "string" || !name.trim() || name.length > MAX_NAME) {
      throw new Error("nome da skin custom inv\xE1lido");
    }
    seen.add(id);
    if (thumbnailPath !== void 0 && !(typeof thumbnailPath === "string" && SAVED_THUMBNAIL_ROUTE.test(thumbnailPath))) {
      throw new Error("miniatura inv\xE1lida");
    }
    return {
      id,
      name,
      splashPath: parseAsset(splashPath),
      tilePath: parseAsset(tilePath),
      ...thumbnailPath ? { thumbnailPath } : {}
    };
  });
}

// ../shared/src/details.ts
var modDetailsPath = (source, id) => `/mods/details?source=${encodeURIComponent(source)}&id=${encodeURIComponent(id)}`;
var MAX_OPEN_BODY = 4 * 1024;
var DESCRIPTION_FORMATS = ["text", "markdown", "html"];
var MAX_DETAILS_IMAGES = 20;
var MAX_DETAILS_LIST = 10;
var MAX_DESCRIPTION = 8e3;
var str = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
var num = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
var urlOrEmpty = (value) => isHttpsUrl(value) ? value : "";
var texts = (value, max) => Array.isArray(value) ? value.filter((v) => typeof v === "string" && v.trim() !== "").slice(0, MAX_DETAILS_LIST).map((v) => v.slice(0, max)) : [];
function parseModDetails(input) {
  const d = input ?? {};
  if (!isSourceId(d.source) || !isModId(d.id)) {
    throw new Error("detalhe inv\xE1lido");
  }
  const format = DESCRIPTION_FORMATS.find((f) => f === d.descriptionFormat);
  return {
    source: d.source,
    id: d.id,
    name: str(d.name, 120),
    summary: str(d.summary, 300),
    description: str(d.description, MAX_DESCRIPTION),
    descriptionFormat: format ?? "text",
    images: Array.isArray(d.images) ? d.images.filter(isHttpsUrl).slice(0, MAX_DETAILS_IMAGES) : [],
    version: str(d.version, 32),
    patch: str(d.patch, 16),
    status: str(d.status, 32),
    license: str(d.license, 64),
    publishedAt: num(d.publishedAt),
    updatedAt: num(d.updatedAt),
    downloads: num(d.downloads),
    views: num(d.views),
    likes: num(d.likes),
    champions: texts(d.champions, 40),
    tags: texts(d.tags, 40),
    category: isModCategory(d.category) ? d.category : null,
    contributors: Array.isArray(d.contributors) ? d.contributors.slice(0, MAX_DETAILS_LIST).flatMap((item) => {
      const c = item ?? {};
      const name = str(c.name, 40);
      return name ? [{ name, avatar: urlOrEmpty(c.avatar), role: str(c.role, 24) }] : [];
    }) : [],
    links: Array.isArray(d.links) ? d.links.slice(0, MAX_DETAILS_LIST).flatMap((item) => {
      const l = item ?? {};
      return isHttpsUrl(l.url) ? [{ url: l.url, label: str(l.label, 60), kind: str(l.kind, 24) }] : [];
    }) : [],
    preview: urlOrEmpty(d.preview),
    page: urlOrEmpty(d.page)
  };
}

// ../shared/src/plugin.ts
/*!
 * A atualização do plugin do Pengu (o próprio SkLoL dentro do client), pelo modal de
 * configurações da loja. O plugin publicado mora no repositório PLUGIN_REPO, com os arquivos do
 * build (`index.js`, `style.css`, `assets/`) na raiz. A versão é o commit: o LOCAL compara o
 * último commit da branch principal com o que instalou (guardado no `version.json` da pasta do
 * plugin) e, pra atualizar, baixa o código daquele commit e troca a pasta inteira.
 *
 * Rota do LOCAL: GET /plugin diz o instalado e o último; POST /plugin instala o último e devolve
 * o mesmo formato, já atualizado.
 */
var COMMIT_SHA = /^[0-9a-f]{40}$/;
var pluginOutdated = ({ installed: installed4, latest }) => latest !== null && latest.sha !== installed4;
function parsePluginStatus(input) {
  const s = input ?? {};
  const installed4 = s.installed;
  if (installed4 !== null && (typeof installed4 !== "string" || !COMMIT_SHA.test(installed4))) {
    throw new Error("commit instalado inv\xE1lido");
  }
  let latest = null;
  if (s.latest !== null) {
    const l = s.latest ?? {};
    if (typeof l.sha !== "string" || !COMMIT_SHA.test(l.sha) || typeof l.message !== "string" || typeof l.date !== "number") {
      throw new Error("\xFAltimo commit inv\xE1lido");
    }
    latest = { sha: l.sha, message: l.message, date: l.date };
  }
  return { installed: installed4, latest };
}

// ../shared/src/protocol.ts
var LOCAL_PORT = 5e4;

// ../shared/src/settings.ts
/*!
 * As opções do settings.json do SkLoLLauncher que o plugin mostra e muda (no modal de
 * configurações da loja). O nome de cada uma aqui é o do plugin; no arquivo, é o nome da
 * propriedade no Settings.cs (veja SETTINGS_KEYS).
 *
 * Rota do LOCAL: GET /settings lê, PUT /settings { <opção>: boolean } muda só as que vierem e
 * devolve todas.
 */
var SETTINGS_KEYS = {
  hideEnemyCustomSkins: "HideEnemyCustomSkins",
  autoRestartCore: "AutoRestartCore",
  devTools: "DevTools"
};
var DEFAULT_SETTINGS = {
  hideEnemyCustomSkins: false,
  autoRestartCore: true,
  devTools: false
};
var OPTIONS = Object.keys(SETTINGS_KEYS);
function parseAppSettings(input) {
  const s = input ?? {};
  const out = { ...DEFAULT_SETTINGS };
  for (const key2 of OPTIONS) {
    if (typeof s[key2] !== "boolean") throw new Error("op\xE7\xF5es inv\xE1lidas");
    out[key2] = s[key2];
  }
  return out;
}

// ../shared/src/sources.ts
var IMPORTED_SOURCE = "sklol.importados";
var MAX_SOURCES_BODY = 4 * 1024;
var MAX_MANIFEST_BYTES = 256 * 1024;
var isInfo = (value) => {
  const s = value;
  return !!s && isSourceId(s.id) && typeof s.name === "string" && typeof s.version === "string" && typeof s.origin === "string" && Array.isArray(s.hosts) && s.hosts.every((h) => typeof h === "string");
};
function parseSourcesList(input) {
  const { sources: sources2 } = input ?? {};
  if (!Array.isArray(sources2) || !sources2.every(isInfo)) {
    throw new Error("lista de fontes inv\xE1lida");
  }
  return { sources: sources2 };
}
function parseSourcesPreview(input) {
  const { token } = input ?? {};
  if (typeof token !== "string" || !/^[\w-]{8,64}$/.test(token)) {
    throw new Error("pr\xE9via inv\xE1lida");
  }
  return { token, ...parseSourcesList(input) };
}

// src/sklol/utils.ts
var Logger = class {
  constructor(args) {
    this.args = args;
  }
  log(...msg) {
    if (this.args) {
      console.log(...this.args, ...msg);
    } else {
      console.log(...msg);
    }
  }
  info(...msg) {
    if (this.args) {
      console.info(...this.args, ...msg);
    } else {
      console.info(...msg);
    }
  }
  warn(...msg) {
    if (this.args) {
      console.warn(...this.args, ...msg);
    } else {
      console.warn(...msg);
    }
  }
  error(...msg) {
    if (this.args) {
      console.error(...this.args, ...msg);
    } else {
      console.error(...msg);
    }
  }
  test(...msg) {
    if (this.args) {
      console.log(...this.args, ...msg);
    } else {
      console.log(...msg);
    }
  }
  static genArgs(name, color) {
    const s = `
        background: ${color};
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: bold;
      `;
    return [`%c${name}`, s];
  }
};
var print = new Logger(Logger.genArgs("SkLoL", "#0f0f0f"));
function sleep(ms) {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, ms);
  });
}

// src/sklol/bridge.ts
var URL2 = `ws://127.0.0.1:${LOCAL_PORT}`;
var RETRY_MIN_MS = 1e3;
var RETRY_MAX_MS = 15e3;
var started = false;
var socket;
var retryMs = RETRY_MIN_MS;
var lastSelection;
function send(message) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}
function connect() {
  const ws = new WebSocket(URL2);
  socket = ws;
  ws.onopen = () => {
    retryMs = RETRY_MIN_MS;
    print.info("conectado ao LOCAL");
    if (lastSelection) send({ type: "select", selection: lastSelection });
  };
  ws.onclose = () => {
    if (socket !== ws) return;
    socket = void 0;
    setTimeout(connect, retryMs + Math.random() * 500);
    retryMs = Math.min(retryMs * 2, RETRY_MAX_MS);
  };
}
function startBridge() {
  if (started) return;
  started = true;
  connect();
}
function sendSelection(selection) {
  const last = lastSelection;
  if (last?.championId === selection.championId && last.skinId === selection.skinId && last.chromaId === selection.chromaId) {
    return;
  }
  lastSelection = selection;
  send({ type: "select", selection });
}
function clearSelection() {
  lastSelection = void 0;
}

// src/sklol/store/html.ts
var esc = (text) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
var CORNERS = "background:linear-gradient(var(--corner),var(--corner)) top left/var(--arm) 2px,linear-gradient(var(--corner),var(--corner)) top left/2px var(--arm),linear-gradient(var(--corner),var(--corner)) top right/var(--arm) 2px,linear-gradient(var(--corner),var(--corner)) top right/2px var(--arm),linear-gradient(var(--corner),var(--corner)) bottom left/var(--arm) 2px,linear-gradient(var(--corner),var(--corner)) bottom left/2px var(--arm),linear-gradient(var(--corner),var(--corner)) bottom right/var(--arm) 2px,linear-gradient(var(--corner),var(--corner)) bottom right/2px var(--arm);background-repeat:no-repeat";
var DISCORD_PATH = '<path d="M19.3 5.3A17 17 0 0 0 15 4l-.5 1a15.6 15.6 0 0 0-5 0L9 4a17 17 0 0 0-4.3 1.3C2 9.3 1.3 13.2 1.6 17a17 17 0 0 0 5.2 2.6l1.1-1.8a11 11 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 10.8 0l.4.3a11 11 0 0 1-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.2-2.8-11.7ZM8.5 14.7c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Zm7 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Z"/>';
var BUTTON_STYLE = `.sklol-btn{transition:transform .18s cubic-bezier(.2,.8,.3,1.2),filter .18s}.sklol-btn:hover,.sklol-btn:focus-visible{transform:translateY(-2px);filter:drop-shadow(0 4px 10px rgba(200,170,110,.28))}.sklol-btn:active{transform:translateY(0) scale(.97);filter:none;transition-duration:.06s}.sklol-btn .rp-button-text svg{transition:transform .18s}.sklol-btn:hover .rp-button-text svg{transform:translateY(1px) scale(1.1)}`;
function flatButton({
  label,
  aria = label,
  attrs = "",
  style = "",
  className = "",
  content
}) {
  return `<div class="lol-uikit-flat-button-normal title-on-hover sklol-btn${className ? ` ${esc(className)}` : ""}" role="button" tabindex="0" aria-label="${esc(aria)}"${attrs ? ` ${attrs}` : ""}${style ? ` style="${esc(style)}"` : ""}><div class="lol-uikit-flat-button-wrapper"><div class="lol-uikit-flat-button-extra"></div><div class="lol-uikit-flat-button-inner"><div class="lol-uikit-flat-button"><div class="lol-uikit-flat-button-bg"></div><div class="lol-uikit-flat-button-border-idle"></div><div class="lol-uikit-flat-button-border-transition"></div><div class="lol-uikit-flat-button-flare"></div><div class="lol-uikit-flat-button-glow"></div><div class="lol-uikit-flat-button-sheen-wrapper"><div class="lol-uikit-flat-button-sheen"></div></div><div class="lol-uikit-flat-button-content-wrapper"><div class="rp-button-content-wrapper "><span class="rp-button-text">${content ?? esc(label)}</span></div></div></div></div></div></div>`;
}

// src/sklol/store/local-image.ts
var LOCAL_URL = `http://127.0.0.1:${LOCAL_PORT}`;
var TIMEOUT_MS = 5e3;
var COVER_IMAGE = "//plugins/sklol/assets/cover-template.png";
var LocalImageError = class extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
};
async function fetchLocalImage(path, init2 = {}, timeoutMs = TIMEOUT_MS) {
  let response;
  try {
    response = await fetch(`${LOCAL_URL}${path}`, {
      ...init2,
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch {
    throw new LocalImageError("local_unreachable");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const code = body?.error;
    throw new LocalImageError(typeof code === "string" ? code : "bad_response");
  }
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new LocalImageError("image_not_image");
  }
  return blob;
}
var loaded = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
var localImageNow = (path) => loaded.get(path);
function loadLocalImage(path) {
  const done = loaded.get(path);
  if (done !== void 0) return Promise.resolve(done);
  let request = pending.get(path);
  if (!request) {
    request = fetchLocalImage(path).then(
      (blob) => URL.createObjectURL(blob),
      (error) => {
        console.warn(
          "SkLoL: a imagem do mod n\xE3o veio do LOCAL:",
          path,
          error.message
        );
        return null;
      }
    ).then((url) => {
      loaded.set(path, url);
      pending.delete(path);
      return url;
    });
    pending.set(path, request);
  }
  return request;
}
var isLocalImage = (src) => src.startsWith("/saved/");
function modImage(mod) {
  if (mod.local?.thumbnail) return mod.local.thumbnail;
  if (mod.source === IMPORTED_SOURCE) {
    return mod.thumbnail.startsWith("data:image/") ? mod.thumbnail : "";
  }
  if (mod.local?.customImage) return "";
  return mod.thumbnail;
}
function imageAttrs(src) {
  if (!src) return `src="${COVER_IMAGE}" data-sklol-img`;
  if (isLocalImage(src)) {
    const ready = localImageNow(src);
    const now = ready === void 0 ? "" : `src="${esc(ready ?? COVER_IMAGE)}" `;
    return `${now}data-sklol-img data-sklol-local="${esc(src)}"`;
  }
  return `src="${esc(src)}" data-sklol-img`;
}
function hydrate(scope) {
  for (const img of scope.querySelectorAll(
    "img[data-sklol-local]"
  )) {
    const path = img.dataset.sklolLocal ?? "";
    if (img.getAttribute("src")) continue;
    void loadLocalImage(path).then((url) => {
      if (img.dataset.sklolLocal === path) img.src = url ?? COVER_IMAGE;
    });
  }
}
function watchImages(doc, root) {
  const win = doc.defaultView ?? window;
  const onError = (event) => {
    const img = event.target;
    if (img?.tagName !== "IMG" || !img.hasAttribute("data-sklol-img")) return;
    if (img.getAttribute("src") === COVER_IMAGE) return;
    img.src = COVER_IMAGE;
  };
  root.addEventListener("error", onError, true);
  const observer = new win.MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        const el = node;
        if (el.matches("img[data-sklol-local]")) hydrate(el.parentNode ?? el);
        else hydrate(el);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  hydrate(root);
  return () => {
    observer.disconnect();
    root.removeEventListener("error", onError, true);
  };
}

// src/sklol/custom-skins.ts
var LOCAL_URL2 = `http://127.0.0.1:${LOCAL_PORT}`;
var TIMEOUT_MS2 = 2e3;
var IMAGE_TIMEOUT_MS = 5e3;
function customSkin(championId, { id, name, splashPath, tilePath }) {
  return {
    awUnlocked: false,
    championId,
    childSkins: [],
    chromaPreviewPath: null,
    disabled: true,
    emblems: [],
    groupSplash: "",
    id,
    isBase: false,
    isChampionUnlocked: false,
    name,
    ownership: {
      loyaltyReward: false,
      owned: false,
      rental: { rented: false },
      xboxGPReward: false
    },
    productType: null,
    rarityGemPath: "",
    skinAugments: {},
    splashPath,
    splashVideoPath: null,
    stillObtainable: false,
    tilePath,
    unlocked: false
  };
}
var cache = /* @__PURE__ */ new Map();
var pending2 = /* @__PURE__ */ new Map();
var versions = /* @__PURE__ */ new Map();
var blobs = /* @__PURE__ */ new Map();
var retired = /* @__PURE__ */ new Map();
async function loadImage(path, urls) {
  try {
    const blob = await fetchLocalImage(path, {}, IMAGE_TIMEOUT_MS);
    const url = URL.createObjectURL(blob);
    urls.push(url);
    return url;
  } catch (error) {
    print.warn("miniatura n\xE3o veio do LOCAL:", path, error.message);
  }
}
async function fetchCustoms(championId) {
  const version = versions.get(championId) ?? 0;
  try {
    const res = await fetch(`${LOCAL_URL2}${customsPath(championId)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS2)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const urls = [];
    const skins = await Promise.all(
      parseCustomSkins(await res.json(), championId).map(async (info2) => {
        const image = info2.thumbnailPath ? await loadImage(info2.thumbnailPath, urls) : void 0;
        return customSkin(
          championId,
          image ? { ...info2, splashPath: image, tilePath: image } : info2
        );
      })
    );
    if ((versions.get(championId) ?? 0) !== version) {
      for (const url of urls) URL.revokeObjectURL(url);
      return skins.length ? skins : void 0;
    }
    cache.set(championId, skins);
    blobs.set(championId, urls);
    return skins.length ? skins : void 0;
  } catch (error) {
    print.warn(
      "skins custom n\xE3o vieram do LOCAL:",
      championId,
      error.message
    );
  }
}
var Customs = class _Customs {
  // Só o que já foi carregado. Sem custom, ou ainda não carregado, é undefined.
  static get(championId) {
    const skins = cache.get(championId);
    return skins?.length ? skins : void 0;
  }
  // Esquece o que foi carregado do campeão, pra o próximo `load` pedir de novo ao LOCAL. É
  // o que muda quando o jogador salva ou tira uma skin da loja. O carrossel só troca a lista
  // no próximo Champion Select.
  static invalidate(championId) {
    versions.set(championId, (versions.get(championId) ?? 0) + 1);
    cache.delete(championId);
    pending2.delete(championId);
    for (const url of retired.get(championId) ?? []) URL.revokeObjectURL(url);
    retired.set(championId, blobs.get(championId) ?? []);
    blobs.delete(championId);
  }
  // Pede ao LOCAL, ou devolve o que já foi carregado. Undefined se não há custom pro campeão
  // ou se o LOCAL não respondeu.
  static load(championId) {
    if (cache.has(championId)) return Promise.resolve(_Customs.get(championId));
    let request = pending2.get(championId);
    if (!request) {
      const current3 = fetchCustoms(
        championId
      ).finally(() => {
        if (pending2.get(championId) === current3) pending2.delete(championId);
      });
      request = current3;
      pending2.set(championId, current3);
    }
    return request;
  }
};

// src/sklol/database.ts
var _Database_static, skinKey_fn, defaultSkinFor_fn, defaultChromaFor_fn, setSkinFor_fn, setChromaFor_fn;
var Database = class {
  // Modo em uso pro campeão. O último modo escolhido vale pra todos, mas só quem tem
  // skin custom usa: os outros ficam sempre no normal.
  static carouselMode(championId) {
    if (!Customs.get(championId)) return "normal";
    return DataStore.get("carousel_mode") === "custom" ? "custom" : "normal";
  }
  static setCarouselMode(mode) {
    DataStore.set("carousel_mode", mode);
  }
  // Sem `mode`, usa o modo em uso do campeão.
  static defaultSkinFor(championId, mode = this.carouselMode(championId)) {
    let skinId = __privateMethod(this, _Database_static, defaultSkinFor_fn).call(this, championId, mode);
    if (!skinId) {
      skinId = championId * 1e3;
    }
    const chromaId = __privateMethod(this, _Database_static, defaultChromaFor_fn).call(this, championId, skinId);
    return { skinId, chromaId };
  }
  static setSkinFor({
    championId,
    skinId,
    chromaId,
    mode = this.carouselMode(championId)
  }) {
    __privateMethod(this, _Database_static, setSkinFor_fn).call(this, championId, mode, skinId);
    __privateMethod(this, _Database_static, setChromaFor_fn).call(this, championId, skinId, chromaId);
  }
  static getChromaFor(championId, skinId) {
    return __privateMethod(this, _Database_static, defaultChromaFor_fn).call(this, championId, skinId);
  }
};
_Database_static = new WeakSet();
skinKey_fn = function(championId, mode) {
  return mode === "custom" ? `skin_custom_${championId}` : `skin_${championId}`;
};
defaultSkinFor_fn = function(championId, mode) {
  return DataStore.get(__privateMethod(this, _Database_static, skinKey_fn).call(this, championId, mode));
};
defaultChromaFor_fn = function(championId, skinId) {
  if (!skinId) return;
  const KEY3 = `chroma_${championId}_${skinId}`;
  return DataStore.get(KEY3);
};
setSkinFor_fn = function(championId, mode, skinId) {
  DataStore.set(__privateMethod(this, _Database_static, skinKey_fn).call(this, championId, mode), skinId);
};
setChromaFor_fn = function(championId, skinId, chromaId) {
  if (!skinId) return;
  const KEY3 = `chroma_${championId}_${skinId}`;
  DataStore.set(KEY3, chromaId);
};
__privateAdd(Database, _Database_static);

// src/sklol/skin.ts
async function waitCarouselSkins() {
  const carousel = window?.__UNLK_carousel;
  for (let i = 0; i < 30; i++) {
    const skins = carousel?.get("carouselSkins");
    if (skins?.length) {
      return skins;
    }
    await sleep(10);
  }
  return [];
}
async function scrollToSkinId(skinId) {
  const carousel = window?.__UNLK_carousel;
  if (!carousel) return print.error("carrossel n\xE3o capturado");
  for (let x = 0; x < 30; x++) {
    const skins = await waitCarouselSkins();
    const viewSkinIndex = carousel.get("viewSkinIndex");
    const targetIndex = skins.findIndex(
      (s) => s.id === skinId
    );
    if (targetIndex !== -1) {
      carousel.scroll(viewSkinIndex, targetIndex);
      print.info("scrollou para \xEDndice:", targetIndex);
      return;
    }
    await sleep(10);
  }
  print.error("skin n\xE3o encontrada:", skinId);
}
var clientSkins = /* @__PURE__ */ new Map();
var CUSTOM_MODE_CLASS = "sklol-custom-mode";
function markCarouselMode(mode) {
  document.documentElement.classList.toggle(
    CUSTOM_MODE_CLASS,
    mode === "custom"
  );
}
async function showCarouselSkins(championId, mode, custom) {
  const carousel = window?.__UNLK_carousel;
  if (!carousel) return print.error("carrossel n\xE3o capturado");
  for (let x = 0; x < 100; x++) {
    const skins = carousel.get("carouselSkins");
    if (skins?.some((s) => s.championId === championId)) {
      if (typeof skins.replace !== "function") {
        return print.error("carouselSkins n\xE3o tem replace do Ember");
      }
      if (!skins.some((s) => custom.includes(s))) {
        clientSkins.set(championId, [...skins]);
      }
      const normal = clientSkins.get(championId);
      const base = normal?.find((s) => s.isBase);
      if (!normal || !base) return print.error("skin base n\xE3o encontrada");
      const target = mode === "normal" ? normal : [base, ...custom];
      markCarouselMode(mode);
      if (skins.length === target.length && target.every((s, i) => skins[i] === s)) {
        return;
      }
      skins.replace(0, skins.length, target);
      const from = carousel.get("viewSkinIndex");
      const to = target.indexOf(base);
      if (from !== to) carousel.scroll(from, to);
      print.info("carrossel:", mode, target.length, "skins");
      return;
    }
    await sleep(30);
  }
  print.error("skins do campe\xE3o n\xE3o apareceram no carrossel:", championId);
}
function getViewSkin() {
  const pai = window.__UNLK_carousel?.get("parentView");
  const skin = pai?.get("viewSkin");
  return skin;
}
async function getSkinDataById(skinId) {
  for (let x = 0; x < 20; x++) {
    const carousel = window?.__UNLK_carousel;
    if (!carousel) return print.error("carrossel n\xE3o capturado");
    const skins = await waitCarouselSkins();
    const skinData = skins.find((s) => s.id === skinId);
    if (skinData) {
      return skinData;
    }
    await sleep(10);
  }
  return;
}

// src/sklol/chroma.ts
var URL_SOM_CHROMA = "/fe/lol-champ-select/sounds/sfx-cs-button-chromas-click.ogg";
var audioChroma = null;
var info = {
  map: "SR"
};
function showChromaModal() {
  const me = Players.me;
  if (!me.championId) return;
  const skin = getViewSkin();
  if (!skin) return;
  const chromas = Chroma.getChromas(skin.id);
  if (!chromas) return;
  const selChroma = chromas.find((c) => c.id === me.chromaId);
  const chromaUrl = selChroma?.chromaPreviewPath || chromas[0].chromaPreviewPath;
  const skinName = selChroma?.name || skin.name;
  const root = document.body;
  if (root) {
    let createButton2 = function(chroma) {
      const chromaEl = document.createElement("div");
      chromaEl.className = "ember-view";
      chromaEl.setAttribute("id", `${chroma.id}`);
      const x = document.createElement("div");
      x.className = "chroma-skin-button";
      if (me.chromaId === chroma.id) {
        x.classList.add("selected");
      }
      chromaEl.appendChild(x);
      const xImg = document.createElement("div");
      xImg.className = "contents";
      if (chroma.colors) {
        xImg.style = `background:linear-gradient(135deg, ${chroma.colors[0]} 0%, ${chroma.colors[0]} 50%, ${chroma.colors[1]} 50%, ${chroma.colors[1]} 100%)`;
      } else if (chroma.buttonPath) {
        xImg.style.background = `url(${chroma.buttonPath}) no-repeat center / contain`;
      }
      x.appendChild(xImg);
      chromaEl.addEventListener("mouseenter", () => {
        chromaImg.style = `background-image: url('${chroma.chromaPath}')`;
        skinNameEl.textContent = chroma.name;
      });
      chromaEl.addEventListener("mouseleave", () => {
        chromaImg.style = `background-image: url('${chromaUrl}')`;
        skinNameEl.textContent = skinName;
      });
      chromaEl.addEventListener("click", () => {
        if (!skin) return;
        const me2 = Players.me;
        if (me2.chromaId === chroma.id) return;
        if (chroma.id === skin.id && me2.chromaId === void 0) return;
        me2.chromaId = chroma.id === skin.id ? void 0 : chroma.id;
        if (me2.championId && chroma.id) {
        }
        tocarSomChroma();
        if (backdrop) backdrop.remove();
      });
      return chromaEl;
    };
    var createButton = createButton2;
    const bd = document.getElementById("sklol-backdrop");
    if (bd) bd.remove();
    const backdrop = document.createElement("lol-uikit-full-page-backdrop");
    backdrop.id = "sklol-backdrop";
    backdrop.className = "flyout-container";
    backdrop.style = "background: none;";
    const frame = document.createElement("lol-uikit-flyout-frame");
    frame.className = "flyout";
    frame.style = "position: absolute; overflow: visible; top: 178px; left: 486.5px;";
    frame.setAttribute("orientation", "top");
    frame.setAttribute("animated", "false");
    frame.setAttribute("show", "true");
    backdrop.appendChild(frame);
    const content = document.createElement("lc-flyout-content");
    frame.appendChild(content);
    const embed = document.createElement("div");
    embed.className = "champ-select-chroma-modal chroma-view ember-view";
    content.appendChild(embed);
    const preview = document.createElement("div");
    preview.className = "chroma-information";
    let mapId = "Classic_SRU";
    if (info.map === "ARAM") mapId = "ARAM";
    preview.style = `background-image: url('lol-game-data/assets/content/src/LeagueClient/GameModeAssets/${mapId}/img/champ-select-flyout-background.jpg')`;
    embed.appendChild(preview);
    const chromaImg = document.createElement("div");
    chromaImg.className = "chroma-information-image";
    chromaImg.style = `background-image: url('${chromaUrl}')`;
    preview.appendChild(chromaImg);
    const skinNameEl = document.createElement("div");
    skinNameEl.className = "child-skin-name";
    skinNameEl.textContent = skinName;
    preview.appendChild(skinNameEl);
    const scrollable = document.createElement("lol-uikit-scrollable");
    scrollable.className = "chroma-selection";
    scrollable.setAttribute("overflow-masks", "enabled");
    scrollable.setAttribute("scrolled-bottom", "false");
    scrollable.setAttribute("scrolled-top", "true");
    embed.appendChild(scrollable);
    for (const chroma of chromas) {
      const button = createButton2({
        ...chroma,
        chromaPath: chroma.chromaPreviewPath
        // TODO:
      });
      scrollable.appendChild(button);
    }
    backdrop.addEventListener("click", () => {
      backdrop.remove();
    });
    root.appendChild(backdrop);
  }
}
var Chroma = class _Chroma {
  static getChromas(skinId) {
    function getPreview(baseId, id) {
      return `//plugins/sklol/assets/skins/${baseId}/${id}/preview.png`;
    }
    function getButton(baseId, id) {
      return `//plugins/sklol/assets/skins/${baseId}/${id}/button.png`;
    }
    function getAdditionalSkin(baseId) {
      const skin = ADDITIONAL[baseId];
      if (!skin) return null;
      return skin.chromas.map(([id, name]) => ({
        id,
        name: name ?? skin.baseName,
        chromaPreviewPath: getPreview(baseId, id),
        ...id !== baseId && {
          buttonPath: getButton(baseId, id)
        }
      }));
    }
    let chromas = getAdditionalSkin(skinId);
    if (!chromas) {
      const skinData = getViewSkin();
      if (!skinData) return [];
      const childSkins = skinData.childSkins;
      if (!childSkins || childSkins.length === 0) return [];
      chromas = [
        {
          id: skinData.id,
          chromaPreviewPath: skinData.chromaPreviewPath,
          name: skinData.name
        },
        ...childSkins
      ];
    }
    return chromas;
  }
  static async renderChromaButton() {
    const me = Players.me;
    if (!me?.skinId) return;
    const chromas = _Chroma.getChromas(me.skinId);
    await sleep(0);
    const el = document.querySelector(`[style*="37.5%"]`);
    if (!el) return;
    let chroma = document.querySelector(".sklol.chroma-button");
    if (!chroma) {
      chroma = createOpenModalButton();
      el.append(chroma);
    }
    updateButtonBackground(el);
    if (chromas.length > 0) {
      chroma.style.display = "Block";
    } else {
      chroma.style.display = "None";
    }
  }
};
function tocarSomChroma() {
  try {
    if (!audioChroma) {
      audioChroma = new Audio(URL_SOM_CHROMA);
      audioChroma.volume = 0.3;
    } else {
      audioChroma.currentTime = 0;
    }
    audioChroma.play().catch(() => {
    });
  } catch {
  }
}
function createOpenModalButton() {
  const contentEl = document.createElement("div");
  contentEl.className = "content";
  const innerEl = document.createElement("div");
  innerEl.className = "inner-mask inner-shadow";
  innerEl.style.cssText = "width: calc(100% - 4px); height: calc(100% - 4px); left: 2px; top: 2px;";
  const frameEl = document.createElement("div");
  frameEl.className = "frame-color";
  frameEl.style.padding = "2px";
  frameEl.appendChild(contentEl);
  frameEl.appendChild(innerEl);
  const outerEl = document.createElement("div");
  outerEl.className = "outer-mask interactive";
  outerEl.appendChild(frameEl);
  const el = document.createElement("div");
  el.addEventListener("click", () => {
    showChromaModal();
  });
  el.className = `sklol chroma-button chroma-selection {{if item.selectedChildSkin 'selected'}} uikit-framed-icon ember-view`;
  el.appendChild(outerEl);
  return el;
}
function updateButtonBackground(el) {
  const contentEl = el.querySelector("div.content");
  if (!contentEl) return;
  const plr = Players.me;
  if (!plr) return;
  if (!plr.chromaId) {
    contentEl.style.background = "";
    return;
  }
  if (!plr.skinId) return;
  const chromas = Chroma.getChromas(plr.skinId);
  const chromaData = chromas?.find((c) => c.id === plr.chromaId);
  if (chromaData) {
    const colors = chromaData?.colors;
    if (colors) {
      const background = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`;
      contentEl.style = `background: ${background}`;
    } else if (chromaData.buttonPath) {
      const background = `url(${chromaData.buttonPath}) no-repeat center / contain`;
      contentEl.style = `background: ${background}`;
    }
  }
}
var ADDITIONAL = {
  103085: {
    baseName: "Ahri Lenda Ascendida",
    chromas: [
      [103085],
      [103086, "Ahri Lenda Imortalizada"],
      [103087, "Ahri Lenda Imortalizada Edi\xE7\xE3o Autografada"]
    ]
  },
  222060: {
    baseName: "Jinx Fragmentada de Arcane",
    chromas: [[222060], [222998], [222999]]
  },
  25080: {
    baseName: "Morgana Imperatriz Majestosa",
    chromas: [[25080], [25999]]
  },
  82054: {
    baseName: "Sahn-Uzal Mordekaiser",
    chromas: [[82054], [82998], [82999]]
  },
  99007: {
    baseName: "Lux Elementalista",
    chromas: [
      [99007, "Lux Elementalista (Luz)"],
      [99991, "Lux Elementalista (Ar)"],
      [99992, "Lux Elementalista (Escurid\xE3o)"],
      [99993, "Lux Elementalista (Gelo)"],
      [99994, "Lux Elementalista (Magma)"],
      [99995, "Lux Elementalista (M\xEDstica)"],
      [99996, "Lux Elementalista (Natureza)"],
      [99997, "Lux Elementalista (Tempestade)"],
      [99998, "Lux Elementalista (\xC1gua)"],
      [99999, "Lux Elementalista (Fogo)"]
    ]
  },
  37006: {
    baseName: "DJ Sona",
    chromas: [[37006]]
  },
  145070: {
    baseName: "Lenda Imortalizada Kai'Sa",
    chromas: [
      [145070],
      [145071, "Lenda Ascendida Kai'Sa"],
      [145999, "Lenda Imortalizada Kai'Sa"]
    ]
  },
  234043: {
    baseName: "Viego Reinado Espectral",
    chromas: [
      [234043],
      [234994, "Viego Reinado Espectral (Nightshade)"],
      [234995, "Viego Reinado Espectral (Helios)"],
      [234996, "Viego Reinado Espectral (Thundershock)"],
      [234997, "Viego Reinado Espectral (Quarrel-Ender)"],
      [234998, "Viego Reinado Espectral (Prisma Bella)"],
      [234999, "Viego Reinado Espectral (Ironheart)"]
    ]
  },
  147001: {
    baseName: "Seraphine K/DA ALL OUT",
    chromas: [[147001], [147002], [147003]]
  },
  875066: {
    baseName: "Sett Serpente Radiante",
    chromas: [[875066], [875998], [875999]]
  }
};

// src/sklol/magic-party.ts
function waitForElement(selector) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el2 = document.querySelector(selector);
      if (el2) {
        observer.disconnect();
        resolve(el2);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
var MagicParty = {
  async clearParty() {
    await waitForElement(".your-party div.party .summoner-wrapper");
    const divs = document.querySelectorAll(
      `.your-party div.party .summoner-wrapper`
    );
    for (const div of divs) {
      const show2 = div.querySelector(".image-magic-background");
      if (!show2) continue;
      show2.removeAttribute("style");
    }
  },
  async refreshParty() {
    await waitForElement(".your-party div.party .summoner-wrapper");
    const divs = document.querySelectorAll(
      `.your-party div.party .summoner-wrapper`
    );
    for (const div of divs) {
      const cidEl = div.querySelector(
        `.champion-icons > .portrait-icon`
      );
      if (!cidEl) continue;
      const show2 = div.querySelector(".image-magic-background");
      if (!show2) continue;
      const REGEX = /\/champion-icons\/(.*)\.png"/gm;
      const [, cid] = REGEX.exec(cidEl.style.backgroundImage) || [];
      if (!cid) {
        show2.removeAttribute("style");
        continue;
      }
      const championId = parseInt(cid);
      const me = Players.me;
      const p = Players.get(championId);
      if (me.championId === championId) {
        show2.style.backgroundImage = `url(${me.splashUrl})`;
      } else if (p) {
        show2.style.backgroundImage = `url(${p.splashUrl})`;
      }
    }
  }
};

// src/sklol/queue.ts
var debounce;
var _players;
var Players = class {
  static clear() {
    clearSelection();
    this.me.championId = void 0;
    this.me.skinId = void 0;
    this.me.chromaId = void 0;
    this.me.splashUrl = void 0;
    this.me.team = void 0;
    this.me.magicTime = false;
    __privateSet(this, _players, []);
    MagicParty.clearParty();
  }
  static get(championId) {
    return __privateGet(this, _players).find((p) => p.championId === championId);
  }
  static set(players) {
    __privateSet(this, _players, players);
    if (this.me.magicTime) {
      MagicParty.refreshParty();
    }
  }
};
_players = new WeakMap();
__privateAdd(Players, _players, []);
Players.me = new Proxy({ magicTime: false }, {
  set(target, prop, value) {
    if (target[prop] === value) return true;
    target[prop] = value;
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      Chroma.renderChromaButton();
      if (target.championId && target.skinId) {
        Database.setSkinFor({
          championId: target.championId,
          skinId: target.skinId,
          chromaId: target.chromaId
        });
        if (target.magicTime) {
          MagicParty.refreshParty();
        }
        sendSelection({
          championId: target.championId,
          skinId: target.skinId,
          chromaId: target.chromaId
        });
      }
    }, 1);
    return true;
  }
});

// src/sklol/carousel-mode.ts
function carouselHasChampion(championId) {
  const skins = window.__UNLK_carousel?.get("carouselSkins");
  return !!skins?.some((s) => s.championId === championId);
}
async function applyCarouselMode(championId) {
  const custom = await Customs.load(championId);
  const mode = Database.carouselMode(championId);
  if (custom) await showCarouselSkins(championId, mode, custom);
  else markCarouselMode("normal");
  let { skinId, chromaId } = Database.defaultSkinFor(championId, mode);
  let skinData = await getSkinDataById(skinId);
  if (!skinData && carouselHasChampion(championId)) {
    skinId = championId * 1e3;
    chromaId = Database.getChromaFor(championId, skinId);
    skinData = await getSkinDataById(skinId);
  }
  await scrollToSkinId(skinId);
  if (Database.carouselMode(championId) !== mode) return;
  const me = Players.me;
  if (me.championId !== championId) return;
  me.skinId = skinId;
  me.chromaId = chromaId;
  me.splashUrl = skinData?.splashPath;
}

// src/sklol/i18n/en.ts
var en = {
  // ------------------------------------------------------------ common
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.next": "Next",
  "common.retry": "Try again",
  "common.wait": "Please wait",
  "common.somethingWrong": "Something went wrong. Try again.",
  // ------------------------------------------------------------ categories, sort, tabs
  "category.skins": "Skins",
  "category.maps": "Maps",
  "category.fonts": "Fonts",
  "category.ui": "UI",
  "category.sounds": "Sounds",
  "category.other": "Other",
  "category.all": "All",
  "sort.relevance": "Relevance",
  "sort.updated": "Release date",
  "sort.downloads": "Downloads",
  "tab.store": "Store",
  "tab.installed": "Installed",
  // ------------------------------------------------------------ sidebar
  "sidebar.search": "Search",
  "sidebar.searchInstalled": "Search installed",
  "sidebar.searchAria": "Search mods",
  "sidebar.sources": "Mod Sources",
  "sidebar.sourcesAria": "Add sources",
  "sidebar.import": "Import mod",
  "sidebar.importAria": "Import a mod ({extensions})",
  // ------------------------------------------------------------ cards and badges
  "badge.installed": "\u2713 INSTALLED",
  "badge.installedTitle": "Installed. A skin shows up in its champion's custom skins.",
  "badge.applied": "\u2713 APPLIED",
  "badge.appliedTitle": "Applied: it goes into your matches.",
  "badge.error": "ERROR",
  "badge.nsfwTitle": "Adult content. Hover to see the thumbnail.",
  "badge.imported": "IMPORTED",
  "badge.importedTitle": "Imported from a file on your computer: it doesn't come from a source.",
  "source.imported": "Imported",
  "age.minutes": "{count}m",
  "age.hours": "{count}h",
  "age.days": "{count}d",
  "age.weeks": "{count}w",
  "age.months": "{count}mo",
  // ------------------------------------------------------------ time in words (modal)
  "time.ago": "{time} ago",
  "time.minutes": "{count} min",
  "time.hours.one": "{count} hour",
  "time.hours.other": "{count} hours",
  "time.days.one": "{count} day",
  "time.days.other": "{count} days",
  "time.weeks.one": "{count} week",
  "time.weeks.other": "{count} weeks",
  "time.months.one": "{count} month",
  "time.months.other": "{count} months",
  "time.years.one": "{count} year",
  "time.years.other": "{count} years",
  // ------------------------------------------------------------ the list (errors and empty)
  "list.error.local_unreachable": "SkLoL isn't running on this computer.",
  "list.error.mods_unavailable": "The skin list isn't available right now.",
  "list.error.saved_unavailable": "The installed mods list isn't available right now.",
  "list.error.invalid_search": "That search isn't valid.",
  "list.error.unknown_source": "This source is no longer installed.",
  "list.error.bad_source": "This source's manifest points to a server it didn't declare.",
  "list.error.rate_limited": "Too many requests. Try again in {seconds} s.",
  "list.error.search_blocked": "{source} didn't accept that search. Try other words.",
  "list.error.fallback": "Couldn't load the mods right now.",
  "empty.error.title": "Something went wrong",
  "empty.noSource.title": "No sources",
  "empty.noSource.text": 'No sources added. Use the "Mod Sources" button on the side to add one.',
  "empty.search.title": "Nothing found",
  "empty.nothing.title": "Nothing here",
  "empty.orOther": " or another category",
  "empty.in": " in {category}",
  "empty.store.search": 'No mods found for "{query}". Try other words{orOther}.',
  "empty.store.all": "The {source} source has no mods with the selected filters.",
  "empty.store.category": "The {source} source has no mods in {category}.",
  "empty.installed.none.title": "No mods installed",
  "empty.installed.none.text": 'No mods installed here. Install from the Store, use "Import mod" or drag a {extensions} file onto this screen.',
  "empty.installed.search": 'None of your installed mods{where} match "{query}". Try other words{orOther}.',
  "empty.installed.count.one": "{count} installed mod",
  "empty.installed.count.other": "{count} installed mods",
  "empty.installed.all": "You have {have}, but none with the selected filters (sources and NSFW).",
  "empty.installed.category": "You have {have}, but none{where} with the selected filters.",
  "drop.title": "Drop to import",
  // ------------------------------------------------------------ install (LOCAL errors)
  "saved.error.no_champion": "Couldn't recognize this skin's champion: the source doesn't say and it isn't in the skin's files.",
  "saved.error.no_release": "This mod has no file to download.",
  "saved.error.too_many": "You've already installed the maximum number of mods.",
  "saved.error.too_many_for_champion": "You've already installed the maximum number of skins for this champion.",
  "saved.error.local_unreachable": "SkLoL isn't running on this computer.",
  "saved.error.rate_limited": "Too many requests. Try again in a moment.",
  "saved.error.upstream_unreachable": "Couldn't reach the mod's website.",
  "saved.error.upstream_error": "The mod's website returned an error. Try again in a moment.",
  "saved.error.unknown_source": "This mod's source is no longer installed.",
  "saved.error.id_conflict": "A mod with this id is already installed, from another source.",
  "saved.error.invalid_mod": "This mod doesn't have a valid id for the source.",
  "saved.error.invalid_package": "This mod's file isn't a package SkLoL understands.",
  "saved.error.fallback": "Couldn't install this mod.",
  "applied.error.fallback": "Couldn't apply this mod.",
  // ------------------------------------------------------------ import
  "import.error.invalid_package": "This file isn't a mod SkLoL understands (.fantome, .zip or .modpkg).",
  "import.error.no_champion": `Couldn't find this skin's champion in its files. If it isn't a champion skin, pick another category (like "Other").`,
  "import.error.too_many": "You've already installed the maximum number of mods.",
  "import.error.too_many_for_champion": "You've already installed the maximum number of skins for this champion.",
  "import.error.too_large": "The file is over the 200 MB limit.",
  "import.error.invalid_category": "Pick a category.",
  "import.error.local_unreachable": "SkLoL isn't running on this computer.",
  "import.error.storage_error": "Couldn't save the mod list.",
  "import.error.fallback": "Couldn't import this mod.",
  "import.title": "Import mod",
  "import.step.category": "Category",
  "import.step.image": "Image",
  "import.stepOf": "Step {step} of 2",
  "import.sub.category": "Select the category of the mod you want to import",
  "import.sub.image": "Choose the mod's image in the installed tab",
  "import.busy": "Importing\u2026 This may take a few seconds.",
  "import.whichCategory": "Which category does this mod belong to?",
  "import.imageLabel": "Mod image",
  "import.preparing": "Preparing the image\u2026",
  "import.swapImage": "Change image",
  "import.swapImageAria": "Change the image",
  "import.removeImage": "Remove the image",
  "import.pickImage": "Choose an image",
  "import.dropHere": "Drag an image here",
  "import.dropSub": "or click to choose \xB7 PNG, JPG, WEBP or GIF",
  "import.orLink": "Or use a link",
  "import.linkAria": "Image link",
  "import.use": "Use",
  "import.useAria": "Use the link",
  "import.hint": "The image is optional and becomes 16:9, like the card. You can also paste it with {keys}.",
  "import.import": "Import",
  "import.importWithout": "Import without image",
  "import.pasted": "Pasted image",
  "import.image.type": "This file isn't a PNG, JPG, WEBP or GIF image.",
  "import.image.size": "The image is over 20 MB.",
  "import.image.read": "Couldn't open this image.",
  "import.imageFailed": "The mod was imported, but the image wasn't saved: {reason} You can pick another one later in Edit mod.",
  // ------------------------------------------------------------ imagem de um link (baixada pelo LOCAL)
  "image.downloading": "Downloading the image\u2026",
  "image.fallbackNote": "Without an image, the mod uses SkLoL's default cover.",
  "image.error.invalid_thumbnail": "Use an https link to an image.",
  "image.error.image_unreachable": "Couldn't download the image from this link: the site didn't respond.",
  "image.error.image_http_error": "The site refused the image at this link. Check the address.",
  "image.error.image_not_image": "This link isn't a PNG, JPG, WEBP or GIF image.",
  "image.error.image_too_large": "The image at this link is over the 12 MB limit.",
  "image.error.local_unreachable": "SkLoL isn't running on this computer.",
  "image.error.fallback": "Couldn't download the image from this link.",
  // ------------------------------------------------------------ editar um mod (só neste computador)
  "edit.title": "Edit mod",
  "edit.sub": "Local edit \xB7 this computer only",
  "edit.localTag": "Local",
  "edit.localNote": "Changes stay on this computer only. The mod's source and original file don't change.",
  "edit.nameLabel": "Change name",
  "edit.namePlaceholder": "Mod name",
  "edit.imageLabel": "Change image",
  "edit.save": "Save",
  "edit.saving": "Saving\u2026",
  "edit.error.invalid_name": "Give the mod a name (up to 120 characters).",
  "edit.error.not_found": "This mod isn't installed anymore.",
  "edit.error.storage_error": "Couldn't save the change.",
  "edit.error.local_unreachable": "SkLoL isn't running on this computer.",
  "edit.error.fallback": "Couldn't save the edit.",
  // ------------------------------------------------------------ the mod modal
  "modal.kicker.skins.new": "New skin",
  "modal.kicker.skins": "Champion skin",
  "modal.kicker.maps.new": "New map",
  "modal.kicker.maps": "Map",
  "modal.kicker.fonts.new": "New font",
  "modal.kicker.fonts": "Font",
  "modal.kicker.ui.new": "New interface",
  "modal.kicker.ui": "Interface",
  "modal.kicker.sounds.new": "New sounds",
  "modal.kicker.sounds": "Sounds",
  "modal.kicker.other.new": "New mod",
  "modal.kicker.other": "Mod",
  "modal.tagline.skins": "Get a new look for your Champion!",
  "modal.tagline.maps": "Give the map a new face!",
  "modal.tagline.fonts": "Change the game's fonts!",
  "modal.tagline.ui": "Refresh the game's interface!",
  "modal.tagline.sounds": "Hear your matches in a new way!",
  "modal.tagline.other": "Customize your game!",
  "modal.type.skins": "Champion Skin",
  "modal.type.maps": "Map",
  "modal.type.fonts": "Font",
  "modal.type.ui": "Interface",
  "modal.type.sounds": "Sounds",
  "modal.type.other": "Mod",
  "modal.status.working": "Working",
  "modal.status.broken": "Broken",
  "modal.status.outdated": "Outdated",
  "modal.role.owner": "Owner",
  "modal.role.author": "Creator",
  "modal.role.creator": "Creator",
  "modal.role.artist": "Artist",
  "modal.role.member": "Contributor",
  "modal.role.collaborator": "Contributor",
  "modal.role.contributor": "Contributor",
  "modal.seeDetails": "See details",
  "modal.prevImage": "Previous image",
  "modal.nextImage": "Next image",
  "modal.image": "Image {n}",
  "modal.zoom": "Zoom in",
  "modal.prev": "Previous",
  "modal.next": "Next",
  "modal.gallery.skin": "Skin gallery",
  "modal.gallery.mod": "Mod gallery",
  "modal.about.skin": "About the skin",
  "modal.about.mod": "About the mod",
  "modal.imported": "Mod imported from your computer.",
  "modal.noDescription": "The source didn't provide a description.",
  "modal.waiting": "Please wait\u2026",
  "modal.install": "Install",
  "modal.uninstall": "Uninstall",
  "modal.moreOptions": "More options",
  "modal.openPage": "Open the mod's page",
  "modal.downloadInstall": "Download and install",
  "modal.stat.version": "Version",
  "modal.stat.patch": "Patch",
  "modal.stat.released": "Released",
  "modal.views": "Views",
  "modal.downloads": "Downloads",
  "modal.section.about": "About",
  "modal.section.details": "Details",
  "modal.section.contributors": "Contributors",
  "modal.section.links": "Links",
  "modal.row.status": "Status",
  "modal.row.updated": "Updated",
  "modal.row.published": "Published",
  "modal.row.license": "License",
  "modal.row.origin": "Origin",
  "modal.origin.imported": "Imported",
  "modal.preview": "Preview",
  "modal.edit": "Edit mod",
  "discord.label": "Join the SkLoL Discord",
  "menu.label": "{name} actions",
  "menu.enable": "Enable",
  "menu.disable": "Disable",
  "modal.editAria": "Edit this mod's name and image (on this computer only)",
  "modal.origin.importedText": "Installed from a file on your computer: it has no release date or downloads.",
  // ------------------------------------------------------------ sources
  "sources.title": "Mod Sources",
  "sources.sub": "Where the store's mods come from",
  "sources.add": "Add a source",
  "sources.reading": "Reading\u2026",
  "sources.hosts": "Servers it accesses",
  "sources.noneHint": "Paste a manifest URL above to get started.",
  "sources.terms": "SkLoL doesn't host, index or distribute skins, and comes with no sources. Each source is a manifest you add on your own, from a URL you chose. You're responsible for the sources you add and for what you download from them: respect the terms of use and the rights of each site and each author. SkLoL isn't endorsed by Riot Games.",
  "sources.placeholder": "Manifest or index URL (https://...)",
  "sources.read": "Read",
  "sources.brings": "This URL brings:",
  "sources.accessNote": "Once installed, SkLoL only accesses the servers listed above for these sources.",
  "sources.confirm": "I've read the notice and want to install",
  "sources.installed": "Installed",
  "sources.none": "No sources added.",
  "sources.update": "Update",
  "sources.remove": "Remove",
  "sources.error.local_unreachable": "SkLoL isn't running on this computer.",
  "sources.error.invalid_url": "Use an https URL (or http://127.0.0.1 for a manifest on your computer).",
  "sources.error.source_unreachable": "Couldn't read that URL.",
  "sources.error.invalid_manifest": "This file isn't a valid source manifest.",
  "sources.error.preview_expired": "The preview expired. Read the URL again.",
  "sources.error.too_many_sources": "You already have too many sources installed.",
  "sources.error.unknown_source": "This source is no longer installed.",
  "sources.error.storage_error": "Couldn't save the source list.",
  // ------------------------------------------------------------ installed panel (Ctrl+M)
  "panel.title": "Installed mods",
  "panel.hint": "Click a map, font, UI or sound to apply or remove it. It takes effect from your next match.",
  "panel.skinHint": "Skins aren't applied here: pick the skin in Champion Select, in the champion's custom skins.",
  // ------------------------------------------------------------ carousel
  "tutorial.line1": "Drag up",
  "tutorial.line2": "to see custom skins!",
  // ------------------------------------------------------------ settings
  "sidebar.settings": "Settings",
  "settings.title": "Settings",
  "settings.sub": "SkLoL options, saved instantly",
  "settings.section.champSelect": "Champion Select",
  "settings.section.match": "Matches",
  "settings.section.app": "App",
  "settings.tutorial": "Carousel tutorial",
  "settings.tutorial.hint": "Shows the animated mouse that teaches you to drag the carousel to the custom skins.",
  "settings.hideEnemyCustomSkins": "Hide enemies' custom skins",
  "settings.hideEnemyCustomSkins.hint": "Enemies show up with in-game skins, never custom ones. Your allies' stay.",
  "settings.autoRestartCore": "Restart SkLoL if it crashes",
  "settings.autoRestartCore.hint": "If SkLoL closes on its own because of an error, it comes back in a few seconds.",
  "settings.devTools": "Client DevTools (F12)",
  "settings.devTools.hint": "Opens the client's developer console. Only for plugin developers.",
  "settings.when.now": "Instant",
  "settings.when.nextMatch": "Next match",
  "settings.when.nextClient": "On client restart",
  "settings.saving": "Saving\u2026",
  "settings.saved": "Saved",
  "settings.file": "Saved to SkLoL's settings.json",
  "settings.error.unavailable": "settings.json isn't available. Open SkLoL from the installed app to change these options.",
  "settings.error.local_unreachable": "SkLoL didn't respond. Make sure it's open and try again.",
  "settings.error.save": "Couldn't save. Try again.",
  "settings.error.load": "Couldn't read the options. Update SkLoL and open this again.",
  "settings.section.update": "Updates",
  "settings.plugin": "SkLoL plugin",
  "settings.when.reload": "Reloads the client",
  "settings.plugin.checking": "Checking for updates\u2026",
  "settings.plugin.upToDate": "You're on the latest commit ({commit}).",
  "settings.plugin.latest": "Up to date",
  "settings.plugin.available": "New version available: {commit}",
  "settings.plugin.unknown": "The installed version is unknown. The latest is {commit}.",
  "settings.plugin.offline": "Couldn't reach GitHub right now.",
  "settings.plugin.update": "Update",
  "settings.plugin.check": "Check again",
  "settings.plugin.updating": "Updating\u2026",
  "settings.plugin.updatingTo": "Downloading {commit} from GitHub\u2026",
  "settings.plugin.reloading": "Plugin updated to {commit}. Reloading the client\u2026",
  "settings.plugin.error.plugin_unavailable": "Updating only works with SkLoL opened from the installed app.",
  "settings.plugin.error.github_unreachable": "Couldn't download from GitHub. Check your connection and try again.",
  "settings.plugin.error.bad_archive": "The plugin repository doesn't have a valid version right now. The installed plugin didn't change.",
  "settings.plugin.error.write_failed": "Couldn't save the new plugin. The installed plugin didn't change.",
  "settings.plugin.error.fallback": "Couldn't update the plugin. Try again."
};

// src/sklol/i18n/es.ts
var es = {
  // ------------------------------------------------------------ común
  "common.close": "Cerrar",
  "common.cancel": "Cancelar",
  "common.back": "Volver",
  "common.next": "Siguiente",
  "common.retry": "Intentar de nuevo",
  "common.wait": "Espera",
  "common.somethingWrong": "Algo sali\xF3 mal. Int\xE9ntalo de nuevo.",
  // ------------------------------------------------------------ categorías, orden, pestañas
  "category.skins": "Skins",
  "category.maps": "Mapas",
  "category.fonts": "Fuentes",
  "category.ui": "UI",
  "category.sounds": "Sonidos",
  "category.other": "Otros",
  "category.all": "Todos",
  "sort.relevance": "Relevancia",
  "sort.updated": "Fecha de lanzamiento",
  "sort.downloads": "Descargas",
  "tab.store": "Tienda",
  "tab.installed": "Instalados",
  // ------------------------------------------------------------ barra lateral
  "sidebar.search": "Buscar",
  "sidebar.searchInstalled": "Buscar en instalados",
  "sidebar.searchAria": "Buscar mods",
  "sidebar.sources": "Fuentes de mods",
  "sidebar.sourcesAria": "Agregar fuentes",
  "sidebar.import": "Importar mod",
  "sidebar.importAria": "Importar un mod ({extensions})",
  // ------------------------------------------------------------ tarjetas e insignias
  "badge.installed": "\u2713 INSTALADO",
  "badge.installedTitle": "Instalado. Una skin aparece en las skins personalizadas de su campe\xF3n.",
  "badge.applied": "\u2713 APLICADO",
  "badge.appliedTitle": "Aplicado: entra en tus partidas.",
  "badge.error": "ERROR",
  "badge.nsfwTitle": "Contenido adulto. Pasa el mouse para ver la miniatura.",
  "badge.imported": "IMPORTADO",
  "badge.importedTitle": "Importado desde un archivo de tu computadora: no viene de una fuente.",
  "source.imported": "Importados",
  "age.minutes": "{count}min",
  "age.hours": "{count}h",
  "age.days": "{count}d",
  "age.weeks": "{count}sem",
  "age.months": "{count}mes",
  // ------------------------------------------------------------ tiempo en palabras (modal)
  "time.ago": "hace {time}",
  "time.minutes": "{count} min",
  "time.hours.one": "{count} hora",
  "time.hours.other": "{count} horas",
  "time.days.one": "{count} d\xEDa",
  "time.days.other": "{count} d\xEDas",
  "time.weeks.one": "{count} semana",
  "time.weeks.other": "{count} semanas",
  "time.months.one": "{count} mes",
  "time.months.other": "{count} meses",
  "time.years.one": "{count} a\xF1o",
  "time.years.other": "{count} a\xF1os",
  // ------------------------------------------------------------ la lista (errores y vacía)
  "list.error.local_unreachable": "SkLoL no se est\xE1 ejecutando en esta computadora.",
  "list.error.mods_unavailable": "La lista de skins no est\xE1 disponible ahora.",
  "list.error.saved_unavailable": "La lista de mods instalados no est\xE1 disponible ahora.",
  "list.error.invalid_search": "Esa b\xFAsqueda no es v\xE1lida.",
  "list.error.unknown_source": "Esta fuente ya no est\xE1 instalada.",
  "list.error.bad_source": "El manifiesto de esta fuente apunta a un servidor que no declar\xF3.",
  "list.error.rate_limited": "Demasiadas solicitudes. Int\xE9ntalo de nuevo en {seconds} s.",
  "list.error.search_blocked": "{source} no acept\xF3 esa b\xFAsqueda. Prueba con otras palabras.",
  "list.error.fallback": "No pude cargar los mods ahora.",
  "empty.error.title": "Algo sali\xF3 mal",
  "empty.noSource.title": "Ninguna fuente",
  "empty.noSource.text": 'No hay fuentes agregadas. Usa el bot\xF3n "Fuentes de mods" al lado para agregar una.',
  "empty.search.title": "No se encontr\xF3 nada",
  "empty.nothing.title": "Nada por aqu\xED",
  "empty.orOther": " u otra categor\xEDa",
  "empty.in": " en {category}",
  "empty.store.search": 'No se encontraron mods para "{query}". Prueba con otras palabras{orOther}.',
  "empty.store.all": "La fuente {source} no tiene mods con los filtros marcados.",
  "empty.store.category": "La fuente {source} no tiene mods en {category}.",
  "empty.installed.none.title": "Ning\xFAn mod instalado",
  "empty.installed.none.text": 'No hay mods instalados aqu\xED. Instala desde la Tienda, usa "Importar mod" o arrastra un archivo {extensions} a esta pantalla.',
  "empty.installed.search": 'Ninguno de tus mods instalados{where} coincide con "{query}". Prueba con otras palabras{orOther}.',
  "empty.installed.count.one": "{count} mod instalado",
  "empty.installed.count.other": "{count} mods instalados",
  "empty.installed.all": "Tienes {have}, pero ninguno con los filtros marcados (fuentes y NSFW).",
  "empty.installed.category": "Tienes {have}, pero ninguno{where} con los filtros marcados.",
  "drop.title": "Suelta para importar",
  // ------------------------------------------------------------ instalar (errores del LOCAL)
  "saved.error.no_champion": "No reconoc\xED el campe\xF3n de esta skin: la fuente no lo dice y no est\xE1 en sus archivos.",
  "saved.error.no_release": "Este mod no tiene archivo para descargar.",
  "saved.error.too_many": "Ya instalaste el m\xE1ximo de mods.",
  "saved.error.too_many_for_champion": "Ya instalaste el m\xE1ximo de skins de este campe\xF3n.",
  "saved.error.local_unreachable": "SkLoL no se est\xE1 ejecutando en esta computadora.",
  "saved.error.rate_limited": "Demasiadas solicitudes. Int\xE9ntalo de nuevo en un momento.",
  "saved.error.upstream_unreachable": "No pude conectar con el sitio del mod.",
  "saved.error.upstream_error": "El sitio del mod dio un error. Int\xE9ntalo de nuevo en un momento.",
  "saved.error.unknown_source": "La fuente de este mod ya no est\xE1 instalada.",
  "saved.error.id_conflict": "Ya hay un mod instalado con este id, de otra fuente.",
  "saved.error.invalid_mod": "Este mod no tiene un id v\xE1lido para la fuente.",
  "saved.error.invalid_package": "El archivo de este mod no es un paquete que SkLoL entienda.",
  "saved.error.fallback": "No pude instalar este mod.",
  "applied.error.fallback": "No pude aplicar este mod.",
  // ------------------------------------------------------------ importar
  "import.error.invalid_package": "Este archivo no es un mod que SkLoL entienda (.fantome, .zip o .modpkg).",
  "import.error.no_champion": 'No encontr\xE9 el campe\xF3n de esta skin en sus archivos. Si no es una skin de campe\xF3n, elige otra categor\xEDa (como "Otros").',
  "import.error.too_many": "Ya instalaste el m\xE1ximo de mods.",
  "import.error.too_many_for_champion": "Ya instalaste el m\xE1ximo de skins de este campe\xF3n.",
  "import.error.too_large": "El archivo supera el l\xEDmite de 200 MB.",
  "import.error.invalid_category": "Elige una categor\xEDa.",
  "import.error.local_unreachable": "SkLoL no se est\xE1 ejecutando en esta computadora.",
  "import.error.storage_error": "No pude guardar la lista de mods.",
  "import.error.fallback": "No pude importar este mod.",
  "import.title": "Importar mod",
  "import.step.category": "Categor\xEDa",
  "import.step.image": "Imagen",
  "import.stepOf": "Paso {step} de 2",
  "import.sub.category": "Selecciona la categor\xEDa del mod que quieres importar",
  "import.sub.image": "Elige la imagen del mod en la pesta\xF1a de instalados",
  "import.busy": "Importando\u2026 Esto puede tardar unos segundos.",
  "import.whichCategory": "\xBFEn qu\xE9 categor\xEDa entra este mod?",
  "import.imageLabel": "Imagen del mod",
  "import.preparing": "Preparando la imagen\u2026",
  "import.swapImage": "Cambiar imagen",
  "import.swapImageAria": "Cambiar la imagen",
  "import.removeImage": "Quitar la imagen",
  "import.pickImage": "Elegir una imagen",
  "import.dropHere": "Arrastra una imagen aqu\xED",
  "import.dropSub": "o haz clic para elegir \xB7 PNG, JPG, WEBP o GIF",
  "import.orLink": "O usa un enlace",
  "import.linkAria": "Enlace de la imagen",
  "import.use": "Usar",
  "import.useAria": "Usar el enlace",
  "import.hint": "La imagen es opcional y queda en 16:9, como la tarjeta. Tambi\xE9n puedes pegarla con {keys}.",
  "import.import": "Importar",
  "import.importWithout": "Importar sin imagen",
  "import.pasted": "Imagen pegada",
  "import.image.type": "Este archivo no es una imagen PNG, JPG, WEBP o GIF.",
  "import.image.size": "La imagen supera los 20 MB.",
  "import.image.read": "No pude abrir esta imagen.",
  "import.imageFailed": "El mod se import\xF3, pero la imagen no se guard\xF3: {reason} Puedes elegir otra despu\xE9s en Editar mod.",
  // ------------------------------------------------------------ imagem de um link (baixada pelo LOCAL)
  "image.downloading": "Descargando la imagen\u2026",
  "image.fallbackNote": "Sin imagen, el mod usa la portada predeterminada de SkLoL.",
  "image.error.invalid_thumbnail": "Usa un enlace https de una imagen.",
  "image.error.image_unreachable": "No pude descargar la imagen de este enlace: el sitio no respondi\xF3.",
  "image.error.image_http_error": "El sitio rechaz\xF3 la imagen de este enlace. Revisa la direcci\xF3n.",
  "image.error.image_not_image": "Este enlace no es una imagen PNG, JPG, WEBP o GIF.",
  "image.error.image_too_large": "La imagen de este enlace supera el l\xEDmite de 12 MB.",
  "image.error.local_unreachable": "SkLoL no se est\xE1 ejecutando en esta computadora.",
  "image.error.fallback": "No pude descargar la imagen de este enlace.",
  // ------------------------------------------------------------ editar um mod (só neste computador)
  "edit.title": "Editar mod",
  "edit.sub": "Edici\xF3n local \xB7 solo en esta computadora",
  "edit.localTag": "Local",
  "edit.localNote": "Los cambios quedan solo en esta computadora. La fuente del mod y el archivo original no cambian.",
  "edit.nameLabel": "Cambiar nombre",
  "edit.namePlaceholder": "Nombre del mod",
  "edit.imageLabel": "Cambiar imagen",
  "edit.save": "Guardar",
  "edit.saving": "Guardando\u2026",
  "edit.error.invalid_name": "Ponle un nombre al mod (hasta 120 caracteres).",
  "edit.error.not_found": "Este mod ya no est\xE1 instalado.",
  "edit.error.storage_error": "No pude guardar el cambio.",
  "edit.error.local_unreachable": "SkLoL no se est\xE1 ejecutando en esta computadora.",
  "edit.error.fallback": "No pude guardar la edici\xF3n.",
  // ------------------------------------------------------------ el modal del mod
  "modal.kicker.skins.new": "Nueva skin",
  "modal.kicker.skins": "Skin de campe\xF3n",
  "modal.kicker.maps.new": "Nuevo mapa",
  "modal.kicker.maps": "Mapa",
  "modal.kicker.fonts.new": "Nueva fuente",
  "modal.kicker.fonts": "Fuente",
  "modal.kicker.ui.new": "Nueva interfaz",
  "modal.kicker.ui": "Interfaz",
  "modal.kicker.sounds.new": "Nuevos sonidos",
  "modal.kicker.sounds": "Sonidos",
  "modal.kicker.other.new": "Nuevo mod",
  "modal.kicker.other": "Mod",
  "modal.tagline.skins": "\xA1Consigue un nuevo aspecto para tu Campe\xF3n!",
  "modal.tagline.maps": "\xA1Dale una nueva cara al mapa!",
  "modal.tagline.fonts": "\xA1Cambia las fuentes del juego!",
  "modal.tagline.ui": "\xA1Renueva la interfaz del juego!",
  "modal.tagline.sounds": "\xA1Escucha tus partidas de una forma nueva!",
  "modal.tagline.other": "\xA1Personaliza tu juego!",
  "modal.type.skins": "Skin de Campe\xF3n",
  "modal.type.maps": "Mapa",
  "modal.type.fonts": "Fuente",
  "modal.type.ui": "Interfaz",
  "modal.type.sounds": "Sonidos",
  "modal.type.other": "Mod",
  "modal.status.working": "Funcionando",
  "modal.status.broken": "Roto",
  "modal.status.outdated": "Desactualizado",
  "modal.role.owner": "Due\xF1o",
  "modal.role.author": "Creador",
  "modal.role.creator": "Creador",
  "modal.role.artist": "Artista",
  "modal.role.member": "Colaborador",
  "modal.role.collaborator": "Colaborador",
  "modal.role.contributor": "Colaborador",
  "modal.seeDetails": "Ver detalles",
  "modal.prevImage": "Imagen anterior",
  "modal.nextImage": "Imagen siguiente",
  "modal.image": "Imagen {n}",
  "modal.zoom": "Ampliar",
  "modal.prev": "Anterior",
  "modal.next": "Siguiente",
  "modal.gallery.skin": "Galer\xEDa de la skin",
  "modal.gallery.mod": "Galer\xEDa del mod",
  "modal.about.skin": "Sobre la skin",
  "modal.about.mod": "Sobre el mod",
  "modal.imported": "Mod importado desde tu computadora.",
  "modal.noDescription": "La fuente no trajo una descripci\xF3n.",
  "modal.waiting": "Espera\u2026",
  "modal.install": "Instalar",
  "modal.uninstall": "Desinstalar",
  "modal.moreOptions": "M\xE1s opciones",
  "modal.openPage": "Abrir la p\xE1gina del mod",
  "modal.downloadInstall": "Descargar e instalar",
  "modal.stat.version": "Versi\xF3n",
  "modal.stat.patch": "Parche",
  "modal.stat.released": "Lanzado",
  "modal.views": "Visualizaciones",
  "modal.downloads": "Descargas",
  "modal.section.about": "Acerca de",
  "modal.section.details": "Detalles",
  "modal.section.contributors": "Colaboradores",
  "modal.section.links": "Enlaces",
  "modal.row.status": "Estado",
  "modal.row.updated": "Actualizado",
  "modal.row.published": "Publicado",
  "modal.row.license": "Licencia",
  "modal.row.origin": "Origen",
  "modal.origin.imported": "Importado",
  "modal.preview": "Vista previa",
  "modal.edit": "Editar mod",
  "discord.label": "Unirse al Discord de SkLoL",
  "menu.label": "Acciones de {name}",
  "menu.enable": "Activar",
  "menu.disable": "Desactivar",
  "modal.editAria": "Editar el nombre y la imagen de este mod (solo en esta computadora)",
  "modal.origin.importedText": "Instalado desde un archivo de tu computadora: no tiene fecha de publicaci\xF3n ni descargas.",
  // ------------------------------------------------------------ fuentes
  "sources.title": "Fuentes de mods",
  "sources.sub": "De d\xF3nde vienen los mods de la tienda",
  "sources.add": "Agregar fuente",
  "sources.reading": "Leyendo\u2026",
  "sources.hosts": "Servidores a los que accede",
  "sources.noneHint": "Pega arriba la URL de un manifiesto para empezar.",
  "sources.terms": "SkLoL no aloja, no indexa ni distribuye skins, y no viene con ninguna fuente. Cada fuente es un manifiesto que agregas por tu cuenta, desde una URL que elegiste. Eres responsable de las fuentes que agregas y de lo que descargas de ellas: respeta los t\xE9rminos de uso y los derechos de cada sitio y de cada autor. SkLoL no est\xE1 respaldado por Riot Games.",
  "sources.placeholder": "URL del manifiesto o del \xEDndice (https://...)",
  "sources.read": "Leer",
  "sources.brings": "Esta URL trae:",
  "sources.accessNote": "Al instalar, SkLoL solo accede a los servidores listados arriba para estas fuentes.",
  "sources.confirm": "Le\xED el aviso y quiero instalar",
  "sources.installed": "Instaladas",
  "sources.none": "No hay fuentes agregadas.",
  "sources.update": "Actualizar",
  "sources.remove": "Quitar",
  "sources.error.local_unreachable": "SkLoL no se est\xE1 ejecutando en esta computadora.",
  "sources.error.invalid_url": "Usa una URL https (o http://127.0.0.1 para un manifiesto en tu computadora).",
  "sources.error.source_unreachable": "No pude leer esa URL.",
  "sources.error.invalid_manifest": "Este archivo no es un manifiesto de fuente v\xE1lido.",
  "sources.error.preview_expired": "La vista previa expir\xF3. Lee la URL de nuevo.",
  "sources.error.too_many_sources": "Ya tienes demasiadas fuentes instaladas.",
  "sources.error.unknown_source": "Esta fuente ya no est\xE1 instalada.",
  "sources.error.storage_error": "No pude guardar la lista de fuentes.",
  // ------------------------------------------------------------ panel de instalados (Ctrl+M)
  "panel.title": "Mods instalados",
  "panel.hint": "Haz clic en un mapa, fuente, UI o sonido para aplicarlo o quitarlo. Vale desde la pr\xF3xima partida.",
  "panel.skinHint": "Las skins no se aplican aqu\xED: elige la skin en la Selecci\xF3n de campe\xF3n, en las skins personalizadas del campe\xF3n.",
  // ------------------------------------------------------------ carrusel
  "tutorial.line1": "Arrastra hacia arriba",
  "tutorial.line2": "\xA1para ver skins personalizadas!",
  // ------------------------------------------------------------ ajustes
  "sidebar.settings": "Ajustes",
  "settings.title": "Ajustes",
  "settings.sub": "Opciones de SkLoL, guardadas al instante",
  "settings.section.champSelect": "Selecci\xF3n de campe\xF3n",
  "settings.section.match": "Partidas",
  "settings.section.app": "Aplicaci\xF3n",
  "settings.tutorial": "Tutorial del carrusel",
  "settings.tutorial.hint": "Muestra el rat\xF3n animado que ense\xF1a a arrastrar el carrusel hacia las skins personalizadas.",
  "settings.hideEnemyCustomSkins": "Ocultar skins personalizadas de los enemigos",
  "settings.hideEnemyCustomSkins.hint": "Los enemigos aparecen con las skins del juego, nunca con las personalizadas. Las de tus aliados se mantienen.",
  "settings.autoRestartCore": "Reiniciar SkLoL si se cierra",
  "settings.autoRestartCore.hint": "Si SkLoL se cierra solo por un error, vuelve en unos segundos.",
  "settings.devTools": "DevTools del cliente (F12)",
  "settings.devTools.hint": "Abre la consola de desarrollador del cliente. Solo para quien desarrolla plugins.",
  "settings.when.now": "Al instante",
  "settings.when.nextMatch": "Pr\xF3xima partida",
  "settings.when.nextClient": "Al reabrir el cliente",
  "settings.saving": "Guardando\u2026",
  "settings.saved": "Guardado",
  "settings.file": "Guardado en el settings.json de SkLoL",
  "settings.error.unavailable": "El settings.json no est\xE1 disponible. Abre SkLoL desde la aplicaci\xF3n instalada para cambiar estas opciones.",
  "settings.error.local_unreachable": "SkLoL no respondi\xF3. Comprueba que est\xE9 abierto e int\xE9ntalo de nuevo.",
  "settings.error.save": "No se pudo guardar. Int\xE9ntalo de nuevo.",
  "settings.error.load": "No se pudieron leer las opciones. Actualiza SkLoL y vuelve a abrir.",
  "settings.section.update": "Actualizaci\xF3n",
  "settings.plugin": "Plugin de SkLoL",
  "settings.when.reload": "Recarga el cliente",
  "settings.plugin.checking": "Buscando actualizaciones\u2026",
  "settings.plugin.upToDate": "Tienes el \xFAltimo commit ({commit}).",
  "settings.plugin.latest": "Al d\xEDa",
  "settings.plugin.available": "Nueva versi\xF3n disponible: {commit}",
  "settings.plugin.unknown": "No s\xE9 qu\xE9 versi\xF3n est\xE1 instalada. La \xFAltima es {commit}.",
  "settings.plugin.offline": "No pude conectar con GitHub ahora.",
  "settings.plugin.update": "Actualizar",
  "settings.plugin.check": "Buscar de nuevo",
  "settings.plugin.updating": "Actualizando\u2026",
  "settings.plugin.updatingTo": "Descargando {commit} de GitHub\u2026",
  "settings.plugin.reloading": "Plugin actualizado a {commit}. Recargando el cliente\u2026",
  "settings.plugin.error.plugin_unavailable": "La actualizaci\xF3n solo funciona con SkLoL abierto desde la aplicaci\xF3n instalada.",
  "settings.plugin.error.github_unreachable": "No pude descargar de GitHub. Revisa tu conexi\xF3n e int\xE9ntalo de nuevo.",
  "settings.plugin.error.bad_archive": "El repositorio del plugin no tiene una versi\xF3n v\xE1lida ahora. El plugin instalado no cambi\xF3.",
  "settings.plugin.error.write_failed": "No pude guardar el plugin nuevo. El plugin instalado no cambi\xF3.",
  "settings.plugin.error.fallback": "No pude actualizar el plugin. Int\xE9ntalo de nuevo."
};

// src/sklol/i18n/pt.ts
var pt = {
  // ------------------------------------------------------------ comum
  "common.close": "Fechar",
  "common.cancel": "Cancelar",
  "common.back": "Voltar",
  "common.next": "Pr\xF3ximo",
  "common.retry": "Tentar de novo",
  "common.wait": "Aguarde",
  "common.somethingWrong": "Algo deu errado. Tente de novo.",
  // ------------------------------------------------------------ categorias, ordem, abas
  "category.skins": "Skins",
  "category.maps": "Mapas",
  "category.fonts": "Fonts",
  "category.ui": "UI",
  "category.sounds": "Sons",
  "category.other": "Outros",
  "category.all": "Todos",
  "sort.relevance": "Relev\xE2ncia",
  "sort.updated": "Data de lan\xE7amento",
  "sort.downloads": "Downloads",
  "tab.store": "Loja",
  "tab.installed": "Instalados",
  // ------------------------------------------------------------ barra lateral
  "sidebar.search": "Busca",
  "sidebar.searchInstalled": "Buscar nos instalados",
  "sidebar.searchAria": "Buscar mods",
  "sidebar.sources": "Fontes de Mods",
  "sidebar.sourcesAria": "Adicionar fontes",
  "sidebar.import": "Importar mod",
  "sidebar.importAria": "Importar um mod ({extensions})",
  // ------------------------------------------------------------ cards e selos
  "badge.installed": "\u2713 INSTALADO",
  "badge.installedTitle": "Instalado. Uma skin aparece nas skins custom do campe\xE3o dela.",
  "badge.applied": "\u2713 APLICADO",
  "badge.appliedTitle": "Aplicado: vai para as suas partidas.",
  "badge.error": "ERRO",
  "badge.nsfwTitle": "Conte\xFAdo adulto. Passe o mouse para ver a miniatura.",
  "badge.imported": "IMPORTADO",
  "badge.importedTitle": "Importado de um arquivo do seu computador: n\xE3o vem de uma fonte.",
  "source.imported": "Importados",
  "age.minutes": "{count}min",
  "age.hours": "{count}h",
  "age.days": "{count}d",
  "age.weeks": "{count}sem",
  "age.months": "{count}m\xEAs",
  // ------------------------------------------------------------ tempo por extenso (modal)
  "time.ago": "h\xE1 {time}",
  "time.minutes": "{count} min",
  "time.hours.one": "{count} hora",
  "time.hours.other": "{count} horas",
  "time.days.one": "{count} dia",
  "time.days.other": "{count} dias",
  "time.weeks.one": "{count} semana",
  "time.weeks.other": "{count} semanas",
  "time.months.one": "{count} m\xEAs",
  "time.months.other": "{count} meses",
  "time.years.one": "{count} ano",
  "time.years.other": "{count} anos",
  // ------------------------------------------------------------ a lista (erros e vazia)
  "list.error.local_unreachable": "O SkLoL n\xE3o est\xE1 rodando neste computador.",
  "list.error.mods_unavailable": "A lista de skins n\xE3o est\xE1 dispon\xEDvel agora.",
  "list.error.saved_unavailable": "A lista de mods instalados n\xE3o est\xE1 dispon\xEDvel agora.",
  "list.error.invalid_search": "Essa busca n\xE3o \xE9 v\xE1lida.",
  "list.error.unknown_source": "Essa fonte n\xE3o est\xE1 mais instalada.",
  "list.error.bad_source": "O manifesto dessa fonte aponta para um servidor que ele n\xE3o declarou.",
  "list.error.rate_limited": "Muitas requisi\xE7\xF5es. Tente de novo em {seconds} s.",
  "list.error.search_blocked": "O {source} n\xE3o aceitou essa busca. Tente outras palavras.",
  "list.error.fallback": "N\xE3o consegui carregar os mods agora.",
  "empty.error.title": "Algo deu errado",
  "empty.noSource.title": "Nenhuma fonte",
  "empty.noSource.text": 'Nenhuma fonte adicionada. Use o bot\xE3o "Fontes de Mods" ao lado para adicionar uma.',
  "empty.search.title": "Nada encontrado",
  "empty.nothing.title": "Nada por aqui",
  "empty.orOther": " ou outra categoria",
  "empty.in": " em {category}",
  "empty.store.search": 'Nenhum mod encontrado para "{query}". Tente outras palavras{orOther}.',
  "empty.store.all": "A fonte {source} n\xE3o tem mods com os filtros marcados.",
  "empty.store.category": "A fonte {source} n\xE3o tem mods em {category}.",
  "empty.installed.none.title": "Nenhum mod instalado",
  "empty.installed.none.text": 'Nenhum mod instalado aqui. Instale pela Loja, use "Importar mod" ou arraste um arquivo {extensions} para esta tela.',
  "empty.installed.search": 'Nenhum dos seus mods instalados{where} corresponde a "{query}". Tente outras palavras{orOther}.',
  "empty.installed.count.one": "{count} mod instalado",
  "empty.installed.count.other": "{count} mods instalados",
  "empty.installed.all": "Voc\xEA tem {have}, mas nenhum com os filtros marcados (fontes e NSFW).",
  "empty.installed.category": "Voc\xEA tem {have}, mas nenhum{where} com os filtros marcados.",
  "drop.title": "Solte para importar",
  // ------------------------------------------------------------ instalar (erros do LOCAL)
  "saved.error.no_champion": "N\xE3o reconheci o campe\xE3o dessa skin: a fonte n\xE3o diz e ele n\xE3o est\xE1 nos arquivos dela.",
  "saved.error.no_release": "Esse mod n\xE3o tem arquivo para baixar.",
  "saved.error.too_many": "Voc\xEA j\xE1 instalou o m\xE1ximo de mods.",
  "saved.error.too_many_for_champion": "Voc\xEA j\xE1 instalou o m\xE1ximo de skins desse campe\xE3o.",
  "saved.error.local_unreachable": "O SkLoL n\xE3o est\xE1 rodando neste computador.",
  "saved.error.rate_limited": "Muitas requisi\xE7\xF5es. Tente de novo daqui a pouco.",
  "saved.error.upstream_unreachable": "N\xE3o consegui falar com o site do mod.",
  "saved.error.upstream_error": "O site do mod deu erro. Tente de novo daqui a pouco.",
  "saved.error.unknown_source": "A fonte desse mod n\xE3o est\xE1 mais instalada.",
  "saved.error.id_conflict": "J\xE1 h\xE1 um mod instalado com esse id, de outra fonte.",
  "saved.error.invalid_mod": "Esse mod n\xE3o tem um id v\xE1lido para a fonte.",
  "saved.error.invalid_package": "O arquivo desse mod n\xE3o \xE9 um pacote que o SkLoL entende.",
  "saved.error.fallback": "N\xE3o consegui instalar esse mod.",
  "applied.error.fallback": "N\xE3o consegui aplicar esse mod.",
  // ------------------------------------------------------------ importar
  "import.error.invalid_package": "Esse arquivo n\xE3o \xE9 um mod que o SkLoL entende (.fantome, .zip ou .modpkg).",
  "import.error.no_champion": 'N\xE3o achei o campe\xE3o dessa skin nos arquivos dela. Se n\xE3o for uma skin de campe\xE3o, escolha outra categoria (como "Outros").',
  "import.error.too_many": "Voc\xEA j\xE1 instalou o m\xE1ximo de mods.",
  "import.error.too_many_for_champion": "Voc\xEA j\xE1 instalou o m\xE1ximo de skins desse campe\xE3o.",
  "import.error.too_large": "O arquivo passa do limite de 200 MB.",
  "import.error.invalid_category": "Escolha uma categoria.",
  "import.error.local_unreachable": "O SkLoL n\xE3o est\xE1 rodando neste computador.",
  "import.error.storage_error": "N\xE3o consegui gravar a lista de mods.",
  "import.error.fallback": "N\xE3o consegui importar esse mod.",
  "import.title": "Importar mod",
  "import.step.category": "Categoria",
  "import.step.image": "Imagem",
  "import.stepOf": "Etapa {step} de 2",
  "import.sub.category": "Selecione a categoria do mod que deseja importar",
  "import.sub.image": "Escolha a imagem do mod na aba de instalados",
  "import.busy": "Importando\u2026 Isso pode levar alguns segundos.",
  "import.whichCategory": "Em que categoria esse mod entra?",
  "import.imageLabel": "Imagem do mod",
  "import.preparing": "Preparando a imagem\u2026",
  "import.swapImage": "Trocar imagem",
  "import.swapImageAria": "Trocar a imagem",
  "import.removeImage": "Tirar a imagem",
  "import.pickImage": "Escolher uma imagem",
  "import.dropHere": "Arraste uma imagem aqui",
  "import.dropSub": "ou clique para escolher \xB7 PNG, JPG, WEBP ou GIF",
  "import.orLink": "Ou use um link",
  "import.linkAria": "Link da imagem",
  "import.use": "Usar",
  "import.useAria": "Usar o link",
  "import.hint": "A imagem \xE9 opcional e fica em 16:9, como o card. Tamb\xE9m d\xE1 para colar com {keys}.",
  "import.import": "Importar",
  "import.importWithout": "Importar sem imagem",
  "import.pasted": "Imagem colada",
  "import.image.type": "Esse arquivo n\xE3o \xE9 uma imagem PNG, JPG, WEBP ou GIF.",
  "import.image.size": "A imagem passa de 20 MB.",
  "import.image.read": "N\xE3o consegui abrir essa imagem.",
  "import.imageFailed": "O mod foi importado, mas a imagem n\xE3o ficou: {reason} D\xE1 para escolher outra depois, em Editar mod.",
  // ------------------------------------------------------------ imagem de um link (baixada pelo LOCAL)
  "image.downloading": "Baixando a imagem\u2026",
  "image.fallbackNote": "Sem imagem, o mod usa a capa padr\xE3o do SkLoL.",
  "image.error.invalid_thumbnail": "Use um link https de uma imagem.",
  "image.error.image_unreachable": "N\xE3o consegui baixar a imagem desse link: o site n\xE3o respondeu.",
  "image.error.image_http_error": "O site recusou a imagem desse link. Confira o endere\xE7o.",
  "image.error.image_not_image": "Esse link n\xE3o \xE9 de uma imagem PNG, JPG, WEBP ou GIF.",
  "image.error.image_too_large": "A imagem desse link passa do limite de 12 MB.",
  "image.error.local_unreachable": "O SkLoL n\xE3o est\xE1 rodando neste computador.",
  "image.error.fallback": "N\xE3o consegui baixar a imagem desse link.",
  // ------------------------------------------------------------ editar um mod (só neste computador)
  "edit.title": "Editar mod",
  "edit.sub": "Edi\xE7\xE3o local \xB7 s\xF3 neste computador",
  "edit.localTag": "Local",
  "edit.localNote": "As mudan\xE7as ficam s\xF3 neste computador. A fonte do mod e o arquivo original n\xE3o mudam.",
  "edit.nameLabel": "Alterar nome",
  "edit.namePlaceholder": "Nome do mod",
  "edit.imageLabel": "Alterar imagem",
  "edit.save": "Salvar",
  "edit.saving": "Salvando\u2026",
  "edit.error.invalid_name": "D\xEA um nome ao mod (at\xE9 120 caracteres).",
  "edit.error.not_found": "Esse mod n\xE3o est\xE1 mais instalado.",
  "edit.error.storage_error": "N\xE3o consegui gravar a mudan\xE7a.",
  "edit.error.local_unreachable": "O SkLoL n\xE3o est\xE1 rodando neste computador.",
  "edit.error.fallback": "N\xE3o consegui salvar a edi\xE7\xE3o.",
  // ------------------------------------------------------------ o modal do mod
  "modal.kicker.skins.new": "Nova skin",
  "modal.kicker.skins": "Skin de campe\xE3o",
  "modal.kicker.maps.new": "Novo mapa",
  "modal.kicker.maps": "Mapa",
  "modal.kicker.fonts.new": "Nova fonte",
  "modal.kicker.fonts": "Fonte",
  "modal.kicker.ui.new": "Nova interface",
  "modal.kicker.ui": "Interface",
  "modal.kicker.sounds.new": "Novos sons",
  "modal.kicker.sounds": "Sons",
  "modal.kicker.other.new": "Novo mod",
  "modal.kicker.other": "Mod",
  "modal.tagline.skins": "Garanta um novo visual para seu Campe\xE3o!",
  "modal.tagline.maps": "D\xEA uma nova cara ao mapa!",
  "modal.tagline.fonts": "Troque as fontes do jogo!",
  "modal.tagline.ui": "Renove a interface do jogo!",
  "modal.tagline.sounds": "Ou\xE7a suas partidas de um jeito novo!",
  "modal.tagline.other": "Personalize o seu jogo!",
  "modal.type.skins": "Skin de Campe\xE3o",
  "modal.type.maps": "Mapa",
  "modal.type.fonts": "Fonte",
  "modal.type.ui": "Interface",
  "modal.type.sounds": "Sons",
  "modal.type.other": "Mod",
  "modal.status.working": "Funcionando",
  "modal.status.broken": "Quebrado",
  "modal.status.outdated": "Desatualizado",
  "modal.role.owner": "Dono",
  "modal.role.author": "Criador",
  "modal.role.creator": "Criador",
  "modal.role.artist": "Artista",
  "modal.role.member": "Colaborador",
  "modal.role.collaborator": "Colaborador",
  "modal.role.contributor": "Colaborador",
  "modal.seeDetails": "Ver detalhes",
  "modal.prevImage": "Imagem anterior",
  "modal.nextImage": "Pr\xF3xima imagem",
  "modal.image": "Imagem {n}",
  "modal.zoom": "Ampliar",
  "modal.prev": "Anterior",
  "modal.next": "Pr\xF3xima",
  "modal.gallery.skin": "Galeria da skin",
  "modal.gallery.mod": "Galeria do mod",
  "modal.about.skin": "Sobre a skin",
  "modal.about.mod": "Sobre o mod",
  "modal.imported": "Mod importado do seu computador.",
  "modal.noDescription": "A fonte n\xE3o trouxe uma descri\xE7\xE3o.",
  "modal.waiting": "Aguarde\u2026",
  "modal.install": "Instalar",
  "modal.uninstall": "Desinstalar",
  "modal.moreOptions": "Mais op\xE7\xF5es",
  "modal.openPage": "Abrir a p\xE1gina do mod",
  "modal.downloadInstall": "Baixar e instalar",
  "modal.stat.version": "Vers\xE3o",
  "modal.stat.patch": "Patch",
  "modal.stat.released": "Lan\xE7ado",
  "modal.views": "Visualiza\xE7\xF5es",
  "modal.downloads": "Downloads",
  "modal.section.about": "Sobre",
  "modal.section.details": "Detalhes",
  "modal.section.contributors": "Contribuidores",
  "modal.section.links": "Links",
  "modal.row.status": "Status",
  "modal.row.updated": "Atualizado",
  "modal.row.published": "Publicado",
  "modal.row.license": "Licen\xE7a",
  "modal.row.origin": "Origem",
  "modal.origin.imported": "Importado",
  "modal.preview": "Pr\xE9via",
  "modal.edit": "Editar mod",
  "discord.label": "Entrar no Discord do SkLoL",
  "menu.label": "A\xE7\xF5es de {name}",
  "menu.enable": "Ativar",
  "menu.disable": "Desativar",
  "modal.editAria": "Editar o nome e a imagem deste mod (s\xF3 neste computador)",
  "modal.origin.importedText": "Instalado a partir de um arquivo do seu computador: n\xE3o tem data de publica\xE7\xE3o nem downloads.",
  // ------------------------------------------------------------ fontes
  "sources.title": "Fontes de Mods",
  "sources.sub": "De onde v\xEAm os mods da loja",
  "sources.add": "Adicionar fonte",
  "sources.reading": "Lendo\u2026",
  "sources.hosts": "Servidores que ela acessa",
  "sources.noneHint": "Cole acima a URL de um manifesto para come\xE7ar.",
  "sources.terms": "O SkLoL n\xE3o hospeda, n\xE3o indexa e n\xE3o distribui skins, e n\xE3o vem com nenhuma fonte. Cada fonte \xE9 um manifesto que voc\xEA adiciona por conta pr\xF3pria, de uma URL que voc\xEA escolheu. Voc\xEA \xE9 respons\xE1vel pelas fontes que adiciona e pelo que baixa delas: respeite os termos de uso e os direitos de cada site e de cada autor. O SkLoL n\xE3o \xE9 endossado pela Riot Games.",
  "sources.placeholder": "URL do manifesto ou do \xEDndice (https://...)",
  "sources.read": "Ler",
  "sources.brings": "Esta URL traz:",
  "sources.accessNote": "Ao instalar, o SkLoL passa a acessar s\xF3 os servidores listados acima para essas fontes.",
  "sources.confirm": "Li o aviso e quero instalar",
  "sources.installed": "Instaladas",
  "sources.none": "Nenhuma fonte adicionada.",
  "sources.update": "Atualizar",
  "sources.remove": "Remover",
  "sources.error.local_unreachable": "O SkLoL n\xE3o est\xE1 rodando neste computador.",
  "sources.error.invalid_url": "Use uma URL https (ou http://127.0.0.1 para um manifesto no seu computador).",
  "sources.error.source_unreachable": "N\xE3o consegui ler essa URL.",
  "sources.error.invalid_manifest": "Esse arquivo n\xE3o \xE9 um manifesto de fonte v\xE1lido.",
  "sources.error.preview_expired": "A pr\xE9via expirou. Leia a URL de novo.",
  "sources.error.too_many_sources": "Voc\xEA j\xE1 tem fontes demais instaladas.",
  "sources.error.unknown_source": "Essa fonte n\xE3o est\xE1 mais instalada.",
  "sources.error.storage_error": "N\xE3o consegui gravar a lista de fontes.",
  // ------------------------------------------------------------ painel dos instalados (Ctrl+M)
  "panel.title": "Mods instalados",
  "panel.hint": "Clique num mapa, fonte, UI ou som para aplicar ou tirar. Vale a partir da pr\xF3xima partida.",
  "panel.skinHint": "Skins n\xE3o se aplicam aqui: escolha a skin no Champion Select, nas skins custom do campe\xE3o.",
  // ------------------------------------------------------------ carrossel
  "tutorial.line1": "Arraste pra cima",
  "tutorial.line2": "pra ver skins custom!",
  // ------------------------------------------------------------ configurações
  "sidebar.settings": "Configura\xE7\xF5es",
  "settings.title": "Configura\xE7\xF5es",
  "settings.sub": "Ajustes do SkLoL, salvos na hora",
  "settings.section.champSelect": "Champion Select",
  "settings.section.match": "Partidas",
  "settings.section.app": "Aplicativo",
  "settings.tutorial": "Tutorial do carrossel",
  "settings.tutorial.hint": "Mostra o mouse animado que ensina a arrastar o carrossel pras skins custom.",
  "settings.hideEnemyCustomSkins": "Esconder skins custom dos inimigos",
  "settings.hideEnemyCustomSkins.hint": "Os inimigos aparecem com as skins do jogo, nunca com as custom. As dos aliados continuam.",
  "settings.autoRestartCore": "Religar o SkLoL se ele cair",
  "settings.autoRestartCore.hint": "Se o SkLoL fechar sozinho por um erro, ele volta em alguns segundos.",
  "settings.devTools": "DevTools do client (F12)",
  "settings.devTools.hint": "Abre o console de desenvolvedor do client. S\xF3 pra quem desenvolve plugins.",
  "settings.when.now": "Na hora",
  "settings.when.nextMatch": "Pr\xF3xima partida",
  "settings.when.nextClient": "Ao reabrir o client",
  "settings.saving": "Salvando\u2026",
  "settings.saved": "Salvo",
  "settings.file": "Salvo no settings.json do SkLoL",
  "settings.error.unavailable": "O settings.json n\xE3o est\xE1 dispon\xEDvel. Abra o SkLoL pelo aplicativo instalado para mudar estas op\xE7\xF5es.",
  "settings.error.local_unreachable": "O SkLoL n\xE3o respondeu. Confira se ele est\xE1 aberto e tente de novo.",
  "settings.error.save": "N\xE3o consegui salvar. Tente de novo.",
  "settings.error.load": "N\xE3o consegui ler as op\xE7\xF5es. Atualize o SkLoL e abra de novo.",
  "settings.section.update": "Atualiza\xE7\xE3o",
  "settings.plugin": "Plugin do SkLoL",
  "settings.when.reload": "Recarrega o client",
  "settings.plugin.checking": "Procurando atualiza\xE7\xF5es\u2026",
  "settings.plugin.upToDate": "Voc\xEA est\xE1 no \xFAltimo commit ({commit}).",
  "settings.plugin.latest": "Em dia",
  "settings.plugin.available": "Nova vers\xE3o dispon\xEDvel: {commit}",
  "settings.plugin.unknown": "N\xE3o sei qual vers\xE3o est\xE1 instalada. A \xFAltima \xE9 {commit}.",
  "settings.plugin.offline": "N\xE3o consegui falar com o GitHub agora.",
  "settings.plugin.update": "Atualizar",
  "settings.plugin.check": "Procurar de novo",
  "settings.plugin.updating": "Atualizando\u2026",
  "settings.plugin.updatingTo": "Baixando {commit} do GitHub\u2026",
  "settings.plugin.reloading": "Plugin atualizado para {commit}. Recarregando o client\u2026",
  "settings.plugin.error.plugin_unavailable": "A atualiza\xE7\xE3o s\xF3 funciona com o SkLoL aberto pelo aplicativo instalado.",
  "settings.plugin.error.github_unreachable": "N\xE3o consegui baixar do GitHub. Confira a internet e tente de novo.",
  "settings.plugin.error.bad_archive": "O reposit\xF3rio do plugin n\xE3o tem uma vers\xE3o v\xE1lida agora. O plugin instalado n\xE3o mudou.",
  "settings.plugin.error.write_failed": "N\xE3o consegui gravar o plugin novo. O plugin instalado n\xE3o mudou.",
  "settings.plugin.error.fallback": "N\xE3o consegui atualizar o plugin. Tente de novo."
};

// src/sklol/i18n/index.ts
var DICTIONARIES = { pt, en, es };
var TAGS = { pt: "pt-BR", en: "en-US", es: "es-ES" };
var current = "pt";
function localeOf(code) {
  const lang = (code ?? "").toLowerCase().slice(0, 2);
  return lang === "pt" || lang === "es" ? lang : "en";
}
var localeTag = () => TAGS[current];
function setLocale(locale) {
  current = locale;
}
var REGION_LOCALE = "/riotclient/region-locale";
var TIMEOUT_MS3 = 1e4;
async function initLocale() {
  try {
    const response = await fetch(REGION_LOCALE, {
      signal: AbortSignal.timeout(TIMEOUT_MS3)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    if (typeof body?.locale !== "string") throw new Error("sem locale");
    setLocale(localeOf(body.locale));
    print.info("idioma do client:", body.locale, "->", current);
  } catch (error) {
    const fallback = globalThis.document?.documentElement?.lang || globalThis.navigator?.language;
    setLocale(localeOf(fallback));
    print.warn(
      "n\xE3o li o idioma do client:",
      error.message,
      "-> usando",
      current
    );
  }
}
function fill(text, vars) {
  if (!vars) return text;
  return text.replace(
    /\{(\w+)\}/g,
    (match, name) => name in vars ? String(vars[name]) : match
  );
}
function t(key2, vars) {
  return fill(DICTIONARIES[current][key2] ?? pt[key2], vars);
}
var hasKey = (key2) => key2 in pt;
function tOr(key2, fallback, vars) {
  return hasKey(key2) ? t(key2, vars) : fallback;
}
function tn(base, count, vars) {
  const key2 = `${base}.${count === 1 ? "one" : "other"}`;
  return tOr(key2, String(count), { count, ...vars });
}

// src/sklol/carousel-tutorial.ts
var DISMISS_AFTER = 2;
var POLL_MS = 1e3;
var TRAVEL = 64;
var ABOVE = -36;
var MOUSE_HEIGHT = 42;
var html = () => `<div class="sklol-drag-hint-trail sklol-drag-hint-trail-down"></div><div class="sklol-drag-hint-trail sklol-drag-hint-trail-up"></div><div class="sklol-drag-hint-mouse"><svg viewBox="0 0 28 42" width="28" height="42" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sklol-hint-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a323b" stop-opacity=".92"/><stop offset="1" stop-color="#0d1216" stop-opacity=".92"/></linearGradient></defs><path class="sklol-drag-hint-body" d="M14 1C7 1 2 6 2 13v16c0 7 5 12 12 12s12-5 12-12V13C26 6 21 1 14 1z" fill="url(#sklol-hint-body)"/><path class="sklol-drag-hint-left" d="M14 1C7 1 2 6 2 13v6h12z"/><path class="sklol-drag-hint-lines" d="M14 1v18M2 19h24" fill="none"/><rect class="sklol-drag-hint-wheel" x="12.5" y="6" width="3" height="7" rx="1.5"/></svg><div class="sklol-drag-hint-ripple"></div></div><div class="sklol-drag-hint-text">${t("tutorial.line1")}<br>${t("tutorial.line2")}</div>`;
var overlay = null;
var timer;
var drags = 0;
var dismissed = false;
var findCarousel = () => document.querySelector(".skin-carousel");
var findHost = () => document.querySelector(
  ".champion-select.ember-view .champion-select-main-container"
);
var ENABLED_KEY = "carousel_tutorial";
var carouselTutorialEnabled = () => DataStore.get(ENABLED_KEY) !== false;
function setCarouselTutorialEnabled(enabled) {
  DataStore.set(ENABLED_KEY, enabled);
  if (!enabled) hide();
}
var carouselTutorialActive = () => !dismissed && carouselTutorialEnabled();
function place(root, carousel, host) {
  const rect = carousel.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const ref = root.offsetParent ?? host;
  const base = ref.getBoundingClientRect();
  const left = rect.left - base.left + ref.scrollLeft;
  const top = rect.top - base.top + ref.scrollTop;
  root.style.left = `${Math.round(left + rect.width / 2)}px`;
  root.style.top = `${Math.max(0, Math.round(top - ABOVE - MOUSE_HEIGHT / 2))}px`;
  return true;
}
var HOST_CLASS = "sklol-drag-hint-host";
function hide() {
  overlay?.parentElement?.classList.remove(HOST_CLASS);
  overlay?.remove();
  overlay = null;
}
function dismissCarouselTutorial() {
  drags++;
  if (drags >= DISMISS_AFTER) dismissed = true;
  hide();
}
function show(carousel, host) {
  const root = document.createElement("div");
  root.className = "sklol-drag-hint";
  root.setAttribute("aria-hidden", "true");
  root.style.setProperty("--sklol-hint-travel", `${TRAVEL}px`);
  root.innerHTML = html();
  host.appendChild(root);
  if (!place(root, carousel, host)) return root.remove();
  host.classList.add(HOST_CLASS);
  overlay = root;
}
function checkCarouselTutorial() {
  const carousel = findCarousel();
  const host = findHost();
  if (overlay) {
    if (!carousel || !host || overlay.parentElement !== host || !place(overlay, carousel, host))
      hide();
    return;
  }
  if (!carousel || !host || !carouselTutorialActive()) return;
  const championId = window.__UNLK_carousel?.get("carouselSkins")?.[0]?.championId;
  if (!championId || !Customs.get(championId)) return;
  show(carousel, host);
}
var installed = false;
function installCarouselTutorial() {
  if (installed) return;
  installed = true;
  timer = setInterval(checkCarouselTutorial, POLL_MS);
}

// src/sklol/carousel-drag.ts
var MIN_DRAG = 60;
function dragDirection(dx, dy) {
  if (Math.abs(dy) < MIN_DRAG || Math.abs(dy) < Math.abs(dx) * 1.5) return null;
  return dy > 0 ? "down" : "up";
}
var installed2 = false;
function installCarouselDrag() {
  if (installed2) return;
  installed2 = true;
  let start = null;
  window.addEventListener(
    "pointerdown",
    (e) => {
      const inCarousel = e.button === 0 && e.target instanceof Element && e.target.closest(".skin-carousel");
      start = inCarousel ? { x: e.clientX, y: e.clientY } : null;
    },
    true
  );
  window.addEventListener(
    "pointercancel",
    () => {
      start = null;
    },
    true
  );
  window.addEventListener(
    "pointerup",
    async (e) => {
      const from = start;
      start = null;
      if (!from) return;
      const direction = dragDirection(e.clientX - from.x, e.clientY - from.y);
      if (!direction) return;
      const swallowClick = (click) => click.stopPropagation();
      window.addEventListener("click", swallowClick, {
        capture: true,
        once: true
      });
      setTimeout(
        () => window.removeEventListener("click", swallowClick, true),
        50
      );
      const championId = window.__UNLK_carousel?.get("carouselSkins")?.[0]?.championId;
      if (!championId) return;
      if (!await Customs.load(championId)) return;
      dismissCarouselTutorial();
      const current3 = Database.carouselMode(championId);
      Database.setCarouselMode(current3 === "custom" ? "normal" : "custom");
      applyCarouselMode(championId);
    },
    true
  );
}

// src/sklol/store/details-api.ts
var LOCAL_URL3 = `http://127.0.0.1:${LOCAL_PORT}`;
var TIMEOUT_MS4 = 2e4;
async function fetchDetails(source, id) {
  try {
    const response = await fetch(`${LOCAL_URL3}${modDetailsPath(source, id)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS4)
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const code = body?.error;
      if (code !== "no_details") {
        print.warn("store: detalhe do mod n\xE3o veio:", id, code);
      }
      return null;
    }
    return parseModDetails(body);
  } catch (error) {
    print.warn("store: detalhe do mod n\xE3o veio:", id, error.message);
    return null;
  }
}
async function openLink(url) {
  try {
    await fetch(`${LOCAL_URL3}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(TIMEOUT_MS4)
    });
  } catch (error) {
    print.warn("store: n\xE3o abri o link:", error.message);
  }
}

// src/sklol/store/tooltip.ts
var TOOLTIP_STYLE = `.sklol-btn.title-on-hover:hover:after,.sklol-btn.title-on-hover:after{content:none!important;display:none!important}.sklol-tooltip{position:fixed;left:0;top:0;z-index:2147483000;box-sizing:border-box;width:max-content;max-width:min(360px,calc(100vw - 16px));padding:5px 7px;border-radius:5px;color:#fff;background:#000;box-shadow:0 2px 8px rgba(0,0,0,.5);font:400 12px/1.35 'LoL Body',Helvetica,Arial,sans-serif;text-indent:0;text-transform:none;letter-spacing:normal;white-space:normal;overflow-wrap:anywhere;pointer-events:none;opacity:0;transition:opacity .12s ease}.sklol-tooltip.shown{opacity:1}@media (prefers-reduced-motion:reduce){.sklol-tooltip{transition:none}}`;
var EDGE = 8;
var GAP = 6;
var RIGHT_INSET = 5;
var SELECTOR = ".sklol-btn.title-on-hover[aria-label]";
function createTooltip(doc) {
  const win = doc.defaultView ?? window;
  let tip = null;
  let owner = null;
  function element() {
    if (tip?.isConnected) return tip;
    tip = doc.createElement("div");
    tip.className = "sklol-tooltip";
    tip.setAttribute("role", "tooltip");
    tip.setAttribute("aria-hidden", "true");
    doc.body.append(tip);
    return tip;
  }
  function place2(button, el) {
    const rect = button.getBoundingClientRect();
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const viewW = win.innerWidth;
    const viewH = win.innerHeight;
    let left = rect.right - RIGHT_INSET - width;
    left = Math.min(Math.max(left, EDGE), Math.max(EDGE, viewW - EDGE - width));
    let top = Math.max(EDGE, rect.bottom + GAP);
    if (top + height > viewH - EDGE) {
      const above = rect.top - GAP - height;
      top = above >= EDGE ? above : Math.max(EDGE, viewH - EDGE - height);
    }
    el.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }
  function show2(button) {
    const text = button.getAttribute("aria-label") ?? "";
    if (!text) return hide2();
    owner = button;
    const el = element();
    el.textContent = text;
    el.classList.remove("shown");
    place2(button, el);
    el.classList.add("shown");
  }
  function hide2() {
    owner = null;
    tip?.classList.remove("shown");
  }
  return {
    show: show2,
    hide: hide2,
    owner: () => owner,
    destroy() {
      tip?.remove();
      tip = null;
      owner = null;
    }
  };
}
function bindTooltips(doc) {
  const win = doc.defaultView ?? window;
  const tooltip = createTooltip(doc);
  const { show: show2, hide: hide2 } = tooltip;
  const buttonOf = (target) => target?.closest?.(SELECTOR) ?? null;
  const onOver = (event) => {
    const button = buttonOf(event.target);
    const owner = tooltip.owner();
    if (button && button !== owner) show2(button);
    else if (!button && owner) hide2();
  };
  const onOut = (event) => {
    const owner = tooltip.owner();
    if (!owner) return;
    const next = event.relatedTarget;
    if (!next || !owner.contains(next)) hide2();
  };
  const onFocus = (event) => {
    const button = buttonOf(event.target);
    if (button && button.matches(":focus-visible")) show2(button);
  };
  const onBlur = (event) => {
    const owner = tooltip.owner();
    if (owner && owner === buttonOf(event.target)) hide2();
  };
  const onDismiss = () => {
    if (tooltip.owner()) hide2();
  };
  doc.addEventListener("mouseover", onOver);
  doc.addEventListener("mouseout", onOut);
  doc.addEventListener("focusin", onFocus);
  doc.addEventListener("focusout", onBlur);
  doc.addEventListener("mousedown", onDismiss, true);
  doc.addEventListener("scroll", onDismiss, true);
  win.addEventListener("resize", onDismiss);
  win.addEventListener("blur", onDismiss);
  return () => {
    doc.removeEventListener("mouseover", onOver);
    doc.removeEventListener("mouseout", onOut);
    doc.removeEventListener("focusin", onFocus);
    doc.removeEventListener("focusout", onBlur);
    doc.removeEventListener("mousedown", onDismiss, true);
    doc.removeEventListener("scroll", onDismiss, true);
    win.removeEventListener("resize", onDismiss);
    win.removeEventListener("blur", onDismiss);
    tooltip.destroy();
  };
}

// src/sklol/discord-button.ts
var DISCORD_INVITE = "https://discord.gg/kfB4xS2Phd";
var SELECTOR2 = 'button[data-dd-action-name="button.social.report_bug"]';
var MARK = "sklol-discord";
var ICON = `<span class="sklol-discord-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">${DISCORD_PATH}</svg></span>`;
var RECHECK_MS = 250;
var BLOCKED = [
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "pointerdown",
  "pointerup",
  "mouseover",
  "mouseout",
  "mouseenter",
  "mouseleave",
  "pointerover",
  "pointerout",
  "pointerenter",
  "pointerleave"
];
function patch(button) {
  button.classList.add(MARK);
  const label = t("discord.label");
  if (button.getAttribute("aria-label") !== label) {
    button.setAttribute("aria-label", label);
  }
  if (!button.querySelector(":scope > .sklol-discord-icon")) {
    button.insertAdjacentHTML("beforeend", ICON);
  }
}
function installDiscordButton(doc = document) {
  const win = doc.defaultView ?? window;
  const tooltip = createTooltip(doc);
  const buttonOf = (event) => event.target?.closest?.(
    `${SELECTOR2}.${MARK}`
  ) ?? null;
  function onEvent(event) {
    const button = buttonOf(event);
    if (!button) return;
    event.stopImmediatePropagation();
    switch (event.type) {
      case "click":
        event.preventDefault();
        tooltip.hide();
        void openLink(DISCORD_INVITE);
        return;
      case "mouseover":
        if (tooltip.owner() !== button) tooltip.show(button);
        return;
      case "mouseout": {
        const next = event.relatedTarget;
        if (!next || !button.contains(next)) tooltip.hide();
        return;
      }
    }
  }
  for (const type of BLOCKED) win.addEventListener(type, onEvent, true);
  const style = doc.createElement("style");
  style.dataset.sklol = "tooltip";
  style.textContent = TOOLTIP_STYLE;
  function check() {
    if (!style.isConnected) (doc.head ?? doc.documentElement).append(style);
    for (const button of doc.querySelectorAll(SELECTOR2)) {
      patch(button);
    }
    if (tooltip.owner() && !tooltip.owner()?.isConnected) tooltip.hide();
  }
  let queued = false;
  const run = () => {
    if (!queued) return;
    queued = false;
    check();
  };
  const observer = new win.MutationObserver(() => {
    if (queued) return;
    queued = true;
    win.requestAnimationFrame(run);
    win.setTimeout(run, RECHECK_MS);
  });
  const start = () => {
    observer.observe(doc.documentElement, { childList: true, subtree: true });
    check();
  };
  if (doc.body) start();
  else doc.addEventListener("DOMContentLoaded", start, { once: true });
  return () => {
    observer.disconnect();
    for (const type of BLOCKED) win.removeEventListener(type, onEvent, true);
    tooltip.destroy();
    style.remove();
  };
}

// src/sklol/hooks.ts
function hookSkins(rcp) {
  rcp.whenReady("rcp-fe-ember-libs").then(async (api) => {
    const ember = await api.getEmber();
    print.info("Ember pronto", ember.VERSION);
    ember.Component.reopen({
      didInsertElement(...args) {
        this._super(...args);
        const el = this.element || this.get("element");
        if (el?.classList.contains("skin-carousel")) {
          window.__UNLK_carousel = this;
        }
      },
      willDestroyElement(...args) {
        this._super(...args);
        const el = this.element || this.get("element");
        if (el?.classList.contains("skin-carousel") && window.__UNLK_carousel === this) {
          window.__UNLK_carousel = null;
        }
      }
    });
    print.info("hook instalado");
  });
}

// src/sklol/skin-observer.ts
var listenMap = /* @__PURE__ */ new WeakSet();
async function tryLi(str2) {
  let x = 0;
  while (x < 3) {
    const el = document.querySelector(str2);
    if (el) return el;
    await sleep(50);
    x++;
  }
}
function onSkinClick() {
  const me = Players.me;
  if (!me.championId || !me.skinId) return;
  const skinData = getViewSkin();
  if (!skinData) return;
  if (me.skinId !== skinData.id) {
    const chromaId = Database.getChromaFor(me.championId, skinData.id);
    me.skinId = skinData.id;
    me.splashUrl = skinData.splashPath;
    me.chromaId = chromaId;
  }
}
async function observerSkinChange() {
  const container = await tryLi(
    ".skin-selection-carousel.enabled.did-transition"
  );
  if (!container || listenMap.has(container)) return;
  listenMap.add(container);
  container.addEventListener("click", onSkinClick);
}

// src/sklol/store/champions.ts
var SUMMARY = "/lol-game-data/assets/v1/champion-summary.json";
var TIMEOUT_MS5 = 1e4;
var loaded2 = null;
function loadChampions() {
  loaded2 ?? (loaded2 = fetch(SUMMARY, { signal: AbortSignal.timeout(TIMEOUT_MS5) }).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).then(parseChampionSummary).catch((error) => {
    loaded2 = null;
    throw error;
  }));
  return loaded2;
}
async function championOf(mod) {
  const name = mod.champions[0];
  if (!name) return void 0;
  try {
    return championIdByName(name, await loadChampions()) ?? void 0;
  } catch (error) {
    print.warn("store: n\xE3o li a lista de campe\xF5es:", error.message);
    return void 0;
  }
}

// src/sklol/store/favorites.ts
var KEY = "sklol_favorites";
var MAX = 500;
function pengu() {
  return typeof DataStore === "undefined" ? null : DataStore;
}
var keyOf = (source, id) => `${source}:${id}`;
function createFavorites(storage = pengu()) {
  const raw = storage?.get(KEY);
  const saved = new Set(
    Array.isArray(raw) ? raw.filter((k) => typeof k === "string").slice(0, MAX) : []
  );
  const listeners = /* @__PURE__ */ new Set();
  return {
    has: (source, id) => saved.has(keyOf(source, id)),
    /** Marca ou desmarca. Devolve se ficou marcado. */
    toggle(source, id) {
      const key2 = keyOf(source, id);
      if (saved.has(key2)) saved.delete(key2);
      else if (saved.size < MAX) saved.add(key2);
      try {
        storage?.set(KEY, [...saved]);
      } catch {
      }
      for (const fn of [...listeners]) fn();
      return saved.has(key2);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    }
  };
}

// src/sklol/store/installed-store.ts
var LOCAL_URL4 = `http://127.0.0.1:${LOCAL_PORT}`;
var LIST_TIMEOUT_MS = 15e3;
var IMPORT_TIMEOUT_MS = 5 * 6e4;
var EDIT_TIMEOUT_MS = 3e4;
var InstalledApiError = class extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
};
async function call(path, init2, timeout) {
  let response;
  try {
    response = await fetch(`${LOCAL_URL4}${path}`, {
      ...init2,
      cache: "no-store",
      signal: AbortSignal.timeout(timeout)
    });
  } catch {
    throw new InstalledApiError("local_unreachable");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const code = payload?.error;
    throw new InstalledApiError(
      typeof code === "string" ? code : "bad_response"
    );
  }
  try {
    return parseInstalledList(payload).mods;
  } catch {
    throw new InstalledApiError("bad_response");
  }
}
var localInstalledApi = {
  list: () => call("/installed", { method: "GET" }, LIST_TIMEOUT_MS),
  setApplied: (id, applied) => call(
    appliedPath(id),
    { method: applied ? "PUT" : "DELETE" },
    LIST_TIMEOUT_MS
  ),
  importFile: (file, category, name) => call(
    importPath(category, name),
    {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: file
    },
    IMPORT_TIMEOUT_MS
  ),
  edit: (id, changes) => call(
    editPath(id),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes)
    },
    EDIT_TIMEOUT_MS
  )
};
function createInstalledList(api = localInstalledApi, onEdited = () => {
}) {
  let state = { mods: [], loaded: false, error: null };
  const listeners = /* @__PURE__ */ new Set();
  let pending3 = null;
  const applying = /* @__PURE__ */ new Set();
  const applyErrors = /* @__PURE__ */ new Map();
  const set = (next) => {
    state = { ...state, ...next };
    for (const fn of [...listeners]) fn();
  };
  const find = (mod) => state.mods.find((m) => m.id === mod.id && m.source === mod.source);
  function refresh() {
    pending3 ?? (pending3 = api.list().then(
      (mods) => set({ mods, loaded: true, error: null }),
      (error) => set({
        loaded: state.loaded,
        error: error.code ?? "bad_response"
      })
    ).finally(() => {
      pending3 = null;
    }));
    return pending3;
  }
  return {
    getState: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    refresh,
    /** O mod instalado que é esse card (o mesmo id, da mesma fonte), se há um. */
    find,
    /**
     * Como `find`, mas lê do LOCAL antes se o mod ainda não está na lista (instalado agora há
     * pouco, ou a lista nem foi lida: a Loja não a lê sozinha).
     */
    async resolve(mod) {
      if (!find(mod)) await refresh();
      return find(mod);
    },
    /** Se o mod (que não é skin) vai pras partidas, ou está mudando, ou falhou. */
    applyStatus(id) {
      if (applying.has(id)) return "busy";
      if (applyErrors.has(id)) return "failed";
      return state.mods.some((m) => m.id === id && m.applied) ? "applied" : "idle";
    },
    /** O código do erro da última tentativa de aplicar esse mod. */
    applyError: (id) => applyErrors.get(id),
    /**
     * Aplica o mod, ou desaplica se já estava. Uma skin não se aplica aqui (ela vai quando é
     * escolhida no Champion Select): não faz nada.
     */
    async toggleApplied(id) {
      const mod = state.mods.find((m) => m.id === id);
      if (!mod || mod.category === "skins" || applying.has(id)) return;
      applying.add(id);
      applyErrors.delete(id);
      set({});
      try {
        const mods = await api.setApplied(id, !mod.applied);
        applying.delete(id);
        set({ mods, loaded: true, error: null });
      } catch (error) {
        applying.delete(id);
        applyErrors.set(
          id,
          error.code ?? "bad_response"
        );
        set({});
      }
    },
    /**
     * Importa um arquivo. Lança InstalledApiError com o motivo, se o LOCAL recusar. Com
     * `thumbnail` (um link https, que o LOCAL baixa, ou uma data URL WebP), dá ao mod novo essa
     * imagem, depois de importado. Devolve se a imagem ficou (e o código, se não): o mod entra
     * mesmo se ela não ficar, e importar de novo o duplicaria.
     */
    async importFile(file, category, name, thumbnail = "") {
      const known = new Set(state.mods.map((m) => m.id));
      const mods = await api.importFile(file, category, name);
      set({ mods, loaded: true, error: null });
      if (!thumbnail) return { imageSaved: true };
      const created = mods.find((m) => !known.has(m.id));
      if (!created) return { imageSaved: false };
      try {
        set({ mods: await api.edit(created.id, { thumbnail }) });
        return { imageSaved: true };
      } catch (error) {
        const code = error.code ?? "bad_response";
        console.warn(`SkLoL: a imagem do mod importado n\xE3o ficou (${code})`);
        return { imageSaved: false, imageError: code };
      }
    },
    /**
     * A edição local de um mod (nome e imagem). Lança InstalledApiError com o motivo; se der
     * certo, a lista já é a nova.
     */
    async edit(id, changes) {
      set({ mods: await api.edit(id, changes), loaded: true, error: null });
      const edited = state.mods.find((m) => m.id === id);
      if (edited) onEdited(edited);
    }
  };
}
var START_INSTALLED_VIEW = {
  excluded: [],
  sort: DEFAULT_SORT,
  nsfw: false,
  category: DEFAULT_CATEGORY
};
var installedToMod = (m) => ({
  source: m.source,
  id: m.id,
  name: m.name,
  thumbnail: m.thumbnail,
  champions: m.champions,
  championIds: m.championId === null ? [] : [m.championId],
  publisher: m.publisher,
  updatedAt: m.updatedAt,
  downloads: m.downloads,
  likes: 0,
  gilded: false,
  nsfw: m.nsfw,
  category: m.category,
  local: m.local
});
var SORTERS = {
  // A "relevância" dos instalados: o que foi instalado por último primeiro.
  relevance: (a, b) => b.savedAt - a.savedAt,
  updated: (a, b) => b.updatedAt - a.updatedAt || b.savedAt - a.savedAt,
  downloads: (a, b) => b.downloads - a.downloads || b.savedAt - a.savedAt
};
function createInstalledStore(list2, initial = START_INSTALLED_VIEW) {
  let view2 = { ...initial, excluded: [...initial.excluded] };
  let search = "";
  let generation = 0;
  let disposed = false;
  const listeners = /* @__PURE__ */ new Set();
  function build() {
    const { mods: all, loaded: loaded3, error } = list2.getState();
    const wanted = search.toLowerCase();
    const mods = all.filter(
      (m) => (view2.category === ALL_CATEGORY || m.category === view2.category) && !view2.excluded.includes(m.source) && (view2.nsfw || !m.nsfw) && (!wanted || [m.name, m.publisher, ...m.champions].some(
        (text) => text.toLowerCase().includes(wanted)
      ))
    ).sort(SORTERS[view2.sort]).map(installedToMod);
    const waiting = !loaded3 && !error;
    return {
      mods,
      total: mods.length,
      hasMore: waiting,
      loading: waiting,
      error: error && !loaded3 ? { code: error } : null,
      search,
      source: null,
      sort: view2.sort,
      nsfw: view2.nsfw,
      category: view2.category,
      generation
    };
  }
  let snapshot = build();
  function emit() {
    if (disposed) return;
    generation++;
    snapshot = build();
    for (const fn of [...listeners]) fn();
  }
  const unsubscribe = list2.subscribe(emit);
  const change = (next) => {
    if (disposed) return Promise.resolve();
    view2 = { ...view2, ...next };
    emit();
    return Promise.resolve();
  };
  return {
    getState: () => snapshot,
    /** A vista de agora, pra ser lembrada. */
    view: () => ({ ...view2, excluded: [...view2.excluded] }),
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    /** A primeira leitura. Depois, a lista só muda quando alguém a atualiza. */
    loadNext() {
      const { loaded: loaded3, error } = list2.getState();
      return disposed || loaded3 || error ? Promise.resolve() : list2.refresh();
    },
    retry: () => disposed ? Promise.resolve() : list2.refresh(),
    search(text) {
      const next = normalizeSearch(text);
      if (disposed || next.toLowerCase() === search.toLowerCase()) {
        return Promise.resolve();
      }
      search = next;
      emit();
      return Promise.resolve();
    },
    setSort: (sort) => sort === view2.sort ? Promise.resolve() : change({ sort }),
    setNsfw: (nsfw) => nsfw === view2.nsfw ? Promise.resolve() : change({ nsfw }),
    setCategory: (category) => category === view2.category ? Promise.resolve() : change({ category }),
    /** Marca ou desmarca uma fonte. */
    setSourceShown(source, shown2) {
      const excluded = view2.excluded.filter((s) => s !== source);
      if (!shown2) excluded.push(source);
      return change({ excluded });
    },
    dispose() {
      disposed = true;
      unsubscribe();
      listeners.clear();
    }
  };
}

// src/sklol/store/format.ts
var MINUTE = 6e4;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var isRecent = (timestamp, now = Date.now()) => timestamp > 0 && now - timestamp < 7 * DAY;
function formatAge(timestamp, now = Date.now()) {
  if (!timestamp) return "";
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < HOUR)
    return t("age.minutes", {
      count: Math.max(1, Math.floor(elapsed / MINUTE))
    });
  if (elapsed < DAY)
    return t("age.hours", { count: Math.floor(elapsed / HOUR) });
  if (elapsed < 14 * DAY)
    return t("age.days", { count: Math.floor(elapsed / DAY) });
  if (elapsed < 60 * DAY)
    return t("age.weeks", { count: Math.floor(elapsed / (7 * DAY)) });
  return t("age.months", { count: Math.floor(elapsed / (30 * DAY)) });
}
function formatAgo(timestamp, now = Date.now()) {
  if (!timestamp) return "";
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < HOUR)
    return t("time.minutes", {
      count: Math.max(1, Math.floor(elapsed / MINUTE))
    });
  if (elapsed < DAY) return tn("time.hours", Math.floor(elapsed / HOUR));
  if (elapsed < 7 * DAY) return tn("time.days", Math.floor(elapsed / DAY));
  if (elapsed < 30 * DAY)
    return tn("time.weeks", Math.floor(elapsed / (7 * DAY)));
  if (elapsed < 365 * DAY)
    return tn("time.months", Math.floor(elapsed / (30 * DAY)));
  return tn("time.years", Math.floor(elapsed / (365 * DAY)));
}
var compact = /* @__PURE__ */ new Map();
function formatCount(value) {
  const tag = localeTag();
  if (!compact.has(tag)) {
    try {
      compact.set(
        tag,
        new Intl.NumberFormat(tag, {
          notation: "compact",
          maximumFractionDigits: 1
        })
      );
    } catch {
      compact.set(tag, null);
    }
  }
  const format = compact.get(tag);
  return format ? format.format(value) : String(value);
}
function formatVersion(raw) {
  const found = /v?(\d+)\.(\d+)(?:\.(\d+))?/i.exec(raw) ?? /(?:^|[^a-z0-9])v(\d+)(?![\d.])/i.exec(raw) ?? /^\s*(\d+)\s*$/.exec(raw);
  if (!found) return "";
  const [, major, minor = "0", patch2 = "0"] = found;
  return [major, minor, patch2].map(Number).join(".");
}

// src/sklol/store/messages.ts
var savedError = (code) => tOr(`saved.error.${code}`, t("saved.error.fallback"));
var importError = (code) => tOr(`import.error.${code}`, t("import.error.fallback"));
var imageError = (code) => tOr(`image.error.${code}`, t("image.error.fallback"));
var editError = (code) => tOr(
  `edit.error.${code}`,
  tOr(`image.error.${code}`, t("edit.error.fallback"))
);
var IMPORT_EXTENSIONS = [".fantome", ".zip", ".modpkg"];
var isImportable = (name) => IMPORT_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));

// src/sklol/store/image-picker.ts
var icon = (paths, size2, width) => `<svg width="${size2}" height="${size2}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
var DROP_ICON = icon(
  '<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5"/><path d="M4 15v4h16v-4"/>',
  34,
  1.5
);
var LINK_ICON = icon(
  '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  15,
  2
);
var CHECK_ICON = icon('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 14, 2.4);
var SMALL_CLOSE = icon('<path d="M6 6l12 12M18 6 6 18"/>', 14, 2);
var IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
var MAX_IMAGE_FILE = 20 * 1024 * 1024;
var IMAGE_WIDTH = 960;
var IMAGE_HEIGHT = 540;
var PREVIEW_TIMEOUT_MS = 25e3;
async function toWebp(doc, file) {
  const win = doc.defaultView ?? window;
  const url = win.URL.createObjectURL(file);
  try {
    const img = new win.Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const canvas = doc.createElement("canvas");
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx || !img.naturalWidth || !img.naturalHeight)
      throw new Error("sem canvas");
    const scale = Math.max(
      IMAGE_WIDTH / img.naturalWidth,
      IMAGE_HEIGHT / img.naturalHeight
    );
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (IMAGE_WIDTH - w) / 2, (IMAGE_HEIGHT - h) / 2, w, h);
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const data = canvas.toDataURL("image/webp", quality);
      if (!isImageDataUrl(data)) throw new Error("sem WebP");
      if (data.length <= MAX_IMAGE_DATA_URL) return data;
    }
    throw new Error("grande demais");
  } finally {
    win.URL.revokeObjectURL(url);
  }
}
function createImagePicker(doc, { root, render, initial = null, emptyHint = t("import.dropSub") }) {
  let chosen = initial;
  let reading = "";
  let error = "";
  let urlDraft = "";
  let closed = false;
  let token = 0;
  const previews = [];
  function dropHtml(overlay2 = "") {
    if (reading) {
      return `<div class="sklol-import-drop loading" data-sklol="drop"><div style="position: relative; width: 32px; height: 32px;"><div class="loading-spinner"></div></div><small>${t(reading === "link" ? "image.downloading" : "import.preparing")}</small></div>`;
    }
    if (chosen) {
      return `<div class="sklol-import-drop has-image" role="button" tabindex="0" aria-label="${t("import.swapImageAria")}" data-action="pick-image" data-sklol="drop"><img ${imageAttrs(chosen.src)} alt="" referrerpolicy="no-referrer" decoding="async" draggable="false" data-sklol="preview"><div class="sklol-import-drop-swap">${DROP_ICON}${t("import.swapImage")}</div><div class="sklol-import-remove" role="button" tabindex="0" aria-label="${t("import.removeImage")}" title="${t("import.removeImage")}" data-action="remove-image">${SMALL_CLOSE}</div>${overlay2}</div>`;
    }
    return `<div class="sklol-import-drop" role="button" tabindex="0" aria-label="${t("import.pickImage")}" data-action="pick-image" data-sklol="drop">${DROP_ICON}<strong>${t("import.dropHere")}</strong><small>${esc(emptyHint)}</small></div>`;
  }
  function linkHtml() {
    const chosenHtml = chosen && chosen.kind !== "current" ? `<div class="sklol-import-chosen">${CHECK_ICON}<span>${esc(chosen.label)}</span></div>` : "";
    return `<div class="sklol-import-label">${t("import.orLink")}</div><div class="sklol-import-url"><input class="sklol-import-input" type="url" placeholder="https://\u2026" value="${esc(urlDraft)}" spellcheck="false" autocomplete="off" aria-label="${t("import.linkAria")}" data-sklol="url"${reading ? " disabled" : ""}>${flatButton({ label: t("import.use"), aria: t("import.useAria"), attrs: 'data-action="use-link"', content: `${LINK_ICON}${t("import.use")}` })}</div>${chosenHtml}${error ? `<div class="sklol-panel-error" role="alert">${esc(error)}</div>` : ""}`;
  }
  async function useFile(image) {
    if (!IMAGE_TYPES.includes(image.type)) {
      error = t("import.image.type");
      return render();
    }
    if (image.size > MAX_IMAGE_FILE) {
      error = t("import.image.size");
      return render();
    }
    const mine = ++token;
    reading = "file";
    error = "";
    render();
    try {
      const src = await toWebp(doc, image);
      if (closed || mine !== token) return;
      chosen = { kind: "file", src, label: image.name || t("import.pasted") };
    } catch {
      if (closed || mine !== token) return;
      error = t("import.image.read");
    }
    reading = "";
    render();
  }
  async function useLink(raw) {
    const url = raw.trim();
    if (!isHttpsUrl(url)) {
      error = imageError("invalid_thumbnail");
      return render();
    }
    const mine = ++token;
    reading = "link";
    error = "";
    render();
    try {
      const blob = await fetchLocalImage(
        IMAGE_PREVIEW_PATH,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        },
        PREVIEW_TIMEOUT_MS
      );
      if (closed || mine !== token) return;
      const src = URL.createObjectURL(blob);
      previews.push(src);
      chosen = {
        kind: "link",
        url,
        src,
        label: url.replace(/^https:\/\//, "")
      };
    } catch (caught) {
      if (closed || mine !== token) return;
      error = imageError(
        caught instanceof LocalImageError ? caught.code : void 0
      );
    }
    reading = "";
    render();
  }
  function pick() {
    const input = doc.createElement("input");
    input.type = "file";
    input.accept = IMAGE_TYPES.join(",");
    input.style.display = "none";
    input.addEventListener(
      "change",
      () => {
        const picked = input.files?.[0];
        input.remove();
        if (picked) void useFile(picked);
      },
      { once: true }
    );
    doc.body.append(input);
    input.click();
  }
  let depth = 0;
  const dropZone = () => root.querySelector('[data-sklol="drop"]');
  return {
    get chosen() {
      return chosen;
    },
    /** Preparando um arquivo ou baixando um link: a caixa espera pra salvar. */
    get busy() {
      return reading !== "";
    },
    /**
     * O que vai pro LOCAL: a data URL de um arquivo, o link, vazio pra tirar a imagem, ou
     * `undefined` se a imagem não mudou.
     */
    value() {
      if (chosen?.kind === "file") return chosen.src;
      if (chosen?.kind === "link") return chosen.url;
      if (chosen?.kind === "current") return void 0;
      return initial ? "" : void 0;
    },
    dropHtml,
    linkHtml,
    /** Um clique numa ação da escolha. Devolve se era dela. */
    action(action, event) {
      switch (action) {
        case "pick-image":
          if (!reading) pick();
          return true;
        case "remove-image":
          event.stopPropagation();
          token++;
          chosen = null;
          error = "";
          render();
          return true;
        case "use-link":
          void useLink(urlDraft);
          return true;
      }
      return false;
    },
    /** O campo do link mudou. */
    onInput(event) {
      const input = event.target;
      if (input.dataset?.sklol === "url") urlDraft = input.value;
    },
    /** Enter no campo do link. Devolve se era dele. */
    onKey(event) {
      const target = event.target;
      if (event.key !== "Enter" || target?.dataset?.sklol !== "url") {
        return false;
      }
      event.preventDefault();
      void useLink(urlDraft);
      return true;
    },
    /** Colar uma imagem, ou o link dela (fora do campo do link, que fica com o texto). */
    onPaste(event) {
      const data = event.clipboardData;
      const image = [...data?.files ?? []].find(
        (f) => f.type.startsWith("image/")
      );
      if (image) {
        event.preventDefault();
        void useFile(image);
        return;
      }
      if (event.target?.dataset?.sklol === "url")
        return;
      const text = data?.getData("text/plain")?.trim() ?? "";
      if (isHttpsUrl(text)) {
        event.preventDefault();
        urlDraft = text;
        void useLink(text);
      }
    },
    /** Arrastar por cima: a área de soltar acende. */
    onDrag(event) {
      const e = event;
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter") depth++;
      if (e.type === "dragleave") depth = Math.max(0, depth - 1);
      if (e.type === "dragover" && e.dataTransfer)
        e.dataTransfer.dropEffect = "copy";
      dropZone()?.classList.toggle("over", depth > 0);
    },
    /** Soltou: um arquivo, ou uma imagem arrastada de uma página (que vem como link). */
    onDrop(event) {
      const e = event;
      e.preventDefault();
      e.stopPropagation();
      depth = 0;
      dropZone()?.classList.remove("over");
      const image = [...e.dataTransfer?.files ?? []][0];
      if (image) return void useFile(image);
      const link = e.dataTransfer?.getData("text/uri-list").split(/\r?\n/)[0]?.trim() ?? "";
      if (link) void useLink(link);
    },
    /** A caixa fechou: nada que ainda estava sendo preparado muda mais nada. */
    dispose() {
      closed = true;
      for (const url of previews) URL.revokeObjectURL(url);
    }
  };
}

// src/sklol/store/settings-panel.ts
var LOCAL_URL5 = `http://127.0.0.1:${LOCAL_PORT}`;
var TIMEOUT_MS6 = 1e4;
var SAVED_MS = 1800;
var SettingsApiError = class extends Error {
};
async function call2(method, body) {
  let response;
  try {
    response = await fetch(`${LOCAL_URL5}/settings`, {
      method,
      ...body ? {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      } : {},
      signal: AbortSignal.timeout(TIMEOUT_MS6)
    });
  } catch {
    throw new SettingsApiError("local_unreachable");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload?.error;
    throw new SettingsApiError(
      typeof error === "string" ? error : "bad_response"
    );
  }
  try {
    return parseAppSettings(payload);
  } catch {
    throw new SettingsApiError("bad_response");
  }
}
var localSettingsApi = {
  get: () => call2("GET"),
  set: (patch2) => call2("PUT", patch2)
};
var PLUGIN_UPDATE_TIMEOUT_MS = 3 * 6e4;
var RELOAD_DELAY_MS = 1500;
async function callPlugin(method) {
  let response;
  try {
    response = await fetch(`${LOCAL_URL5}/plugin`, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(
        method === "POST" ? PLUGIN_UPDATE_TIMEOUT_MS : TIMEOUT_MS6
      )
    });
  } catch {
    throw new SettingsApiError("local_unreachable");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload?.error;
    throw new SettingsApiError(
      typeof error === "string" ? error : "bad_response"
    );
  }
  try {
    return parsePluginStatus(payload);
  } catch {
    throw new SettingsApiError("bad_response");
  }
}
var localPluginApi = {
  status: () => callPlugin("GET"),
  update: () => callPlugin("POST")
};
var icon2 = (paths, size2 = 20, width = 1.8) => `<svg width="${size2}" height="${size2}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
var GEAR = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>';
var GEAR_ICON = icon2(GEAR, 18, 1.7);
var ICON2 = {
  emblem: icon2(GEAR, 28, 1.6),
  close: icon2('<path d="M6 6l12 12M18 6 6 18"/>', 22, 1.6),
  // O mouse do tutorial.
  mouse: icon2(
    '<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v3"/>'
  ),
  // O olho riscado: as skins custom dos inimigos não aparecem.
  eyeOff: icon2(
    '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c5 0 8.5 4.3 9.5 7a13 13 0 0 1-2.6 3.8M6.4 6.4C4.4 7.8 3 9.9 2.5 12c1 2.7 4.5 7 9.5 7 1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'
  ),
  // A seta que volta: religa sozinho.
  restart: icon2(
    '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/><path d="M12 8v4l2.5 2"/>'
  ),
  // Os sinais de código: o console do client.
  code: icon2('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
  // As seções.
  swords: icon2(
    '<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2"/>',
    14
  ),
  map: icon2(
    '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5z"/><path d="M9 4v13M15 6.5v13"/>',
    14
  ),
  app: icon2(
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.1M10 6.5h.1"/>',
    14
  ),
  clock: icon2(
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    11,
    2
  ),
  file: icon2(
    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    14
  ),
  check: icon2('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 14, 2.4),
  // A seção de atualização (a seta pra baixo) e o cartão do plugin (as setas que giram).
  download: icon2(
    '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v3h16v-3"/>',
    14
  ),
  sync: icon2(
    '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/>'
  ),
  alert: icon2(
    '<path d="M12 3 2.5 20h19z"/><path d="M12 9.5v4.5M12 17v.1"/>',
    16
  )
};
var SETTINGS_STYLE = `.sklol-set-open{flex:none;align-self:stretch;margin:0!important}.sklol-set-open .lol-uikit-flat-button-wrapper,.sklol-set-open .lol-uikit-flat-button-inner,.sklol-set-open .lol-uikit-flat-button{height:100%;box-sizing:border-box}.sklol-set-open,.sklol-set-open .lol-uikit-flat-button-wrapper,.sklol-set-open .lol-uikit-flat-button-inner,.sklol-set-open .lol-uikit-flat-button{min-width:0!important}.sklol-set-open .lol-uikit-flat-button{width:auto!important;min-width:30px!important;aspect-ratio:1/1;padding:0!important}.sklol-set-open .lol-uikit-flat-button-content-wrapper,.sklol-set-open .rp-button-content-wrapper{justify-content:center;padding:0!important}.sklol-set-open .rp-button-text{display:flex;align-items:center;justify-content:center}.sklol-set-open .rp-button-text svg{transition:transform .5s cubic-bezier(.2,.8,.3,1)!important}.sklol-set-open:hover .rp-button-text svg,.sklol-set-open:focus-visible .rp-button-text svg{transform:rotate(90deg)!important}.sklol-set-bottom{display:flex;align-items:center;gap:8px;margin-block:auto 40px}.sklol-set-bottom>.lol-uikit-flat-button-normal:not(.sklol-set-open){flex:1;min-width:0;margin:0!important}.sklol-set-box{width:640px;display:flex;flex-direction:column}.sklol-set-body{flex:1;min-height:0;margin-right:-14px;padding-right:14px;overflow-x:hidden;overflow-y:auto}.sklol-set-body::-webkit-scrollbar{width:6px}.sklol-set-body::-webkit-scrollbar-thumb{background:#785a28;border-radius:3px}.sklol-set-label svg{flex:none;color:#c8aa6e}.sklol-set-list{display:flex;flex-direction:column;gap:10px;margin:0 0 22px;padding:0;list-style:none}.sklol-set-card{--corner:#785a28;position:relative;display:flex;gap:14px;align-items:center;padding:12px 14px;cursor:pointer;outline:none;background:linear-gradient(90deg,rgba(30,35,40,.9),rgba(10,20,30,.9));border:1px solid #463714;transition:border-color .2s,box-shadow .2s,background .2s;animation:sklol-src-in .25s ease-out both}.sklol-set-card::before{content:"";position:absolute;inset:-1px;pointer-events:none;--arm:8px;${CORNERS}}.sklol-set-card:hover,.sklol-set-card:focus-visible{--corner:#c8aa6e;border-color:#785a28;box-shadow:0 6px 16px rgba(0,0,0,.35),inset 0 0 18px rgba(200,170,110,.06)}.sklol-set-card.on{--corner:#0ac8b9;border-color:rgba(3,151,171,.55);background:radial-gradient(70% 120% at 100% 50%,rgba(10,200,185,.08),transparent 70%),linear-gradient(90deg,rgba(20,35,42,.92),rgba(8,22,32,.92))}.sklol-set-list .sklol-set-card:nth-child(2){animation-delay:.04s}.sklol-set-card.disabled{cursor:default;opacity:.5;pointer-events:none}.sklol-set-icon{flex:none;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;color:#c8aa6e;background:radial-gradient(circle,#1e2328 0%,#010a13 75%);border:1px solid #785a28;box-shadow:0 0 0 2px #010a13,0 0 0 3px #463714;transition:color .2s,border-color .2s,box-shadow .2s}.sklol-set-card.on .sklol-set-icon{color:#0ac8b9;border-color:#0397ab;box-shadow:0 0 0 2px #010a13,0 0 0 3px rgba(3,151,171,.45),0 0 12px rgba(10,200,185,.25)}.sklol-set-info{flex:1;min-width:0}.sklol-set-name{display:flex;flex-wrap:wrap;align-items:center;gap:8px;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:14px;font-weight:700;letter-spacing:.04em}.sklol-set-when{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;color:#a09b8c;font-family:'LoL Body',sans-serif;font-size:10px;font-weight:400;letter-spacing:.06em;text-transform:uppercase;border:1px solid #3c3222;background:#010a13}.sklol-set-when svg{color:#785a28}.sklol-set-hint{margin-top:4px;color:#7e7e7e;font-size:12px;line-height:1.45}.sklol-set-switch{position:relative;flex:none;width:42px;height:22px;box-sizing:border-box;border-radius:11px;background:#010a13;border:1px solid #463714;box-shadow:inset 0 1px 4px rgba(0,0,0,.6);transition:background .2s,border-color .2s,box-shadow .2s}.sklol-set-switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#a09b8c,#5b5a56);box-shadow:0 1px 3px rgba(0,0,0,.6);transition:transform .22s cubic-bezier(.2,.8,.3,1.2),background .2s,box-shadow .2s}.sklol-set-card:hover .sklol-set-switch{border-color:#785a28}.sklol-set-card.on .sklol-set-switch{background:linear-gradient(90deg,rgba(3,151,171,.55),rgba(10,200,185,.35));border-color:#0ac8b9;box-shadow:inset 0 1px 4px rgba(0,0,0,.4),0 0 10px rgba(10,200,185,.35)}.sklol-set-card.on .sklol-set-switch::after{transform:translateX(20px);background:radial-gradient(circle at 35% 30%,#f0e6d2,#cdfafa);box-shadow:0 0 8px rgba(10,200,185,.7)}.sklol-set-card.saving .sklol-set-switch::after{animation:sklol-set-pulse .8s ease-in-out infinite}@keyframes sklol-set-pulse{50%{opacity:.45}}.sklol-set-foot{display:flex;align-items:center;gap:8px;padding-top:14px;color:#5b5a56;font-size:11px;border-top:1px solid transparent;border-image:linear-gradient(90deg,transparent,#463714 15%,#463714 85%,transparent) 1}.sklol-set-foot svg{color:#785a28}.sklol-set-status{display:inline-flex;align-items:center;gap:6px;margin-left:auto;color:#0ac8b9;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:0;transition:opacity .25s}.sklol-set-status.show{opacity:1}.sklol-set-status.busy{color:#a09b8c}.sklol-set-loading{display:flex;align-items:center;justify-content:center;height:120px}.sklol-set-error{margin:-10px 0 18px}.sklol-set-card.sklol-set-plugin{cursor:default}.sklol-set-plugin .sklol-set-hint{overflow-wrap:anywhere}.sklol-set-plugin>.lol-uikit-flat-button-normal{flex:none;margin:0!important}.sklol-set-plugin .rp-button-text{display:inline-flex;align-items:center;gap:8px;letter-spacing:.08em}.sklol-set-sha{padding:0 4px;color:#cdbe91;font-family:Consolas,monospace;font-size:11px;background:#010a13;border:1px solid #3c3222}.sklol-set-latest{display:inline-flex;align-items:center;gap:6px;flex:none;color:#0ac8b9;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.sklol-set-working{display:inline-flex;align-items:center;gap:10px;flex:none;color:#a09b8c;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.sklol-set-working .sklol-set-spin{position:relative;width:22px;height:22px}.sklol-set-plugin.updating .sklol-set-icon svg{animation:sklol-set-spin 1.1s linear infinite}@keyframes sklol-set-spin{to{transform:rotate(360deg)}}.sklol-set-plugin .sklol-panel-error{margin:8px 0 0}@media (prefers-reduced-motion:reduce){.sklol-set-plugin.updating .sklol-set-icon svg{animation:none}}@media (prefers-reduced-motion:reduce){.sklol-set-card{animation:none}.sklol-set-open .rp-button-text svg,.sklol-set-switch,.sklol-set-switch::after{transition:none}}`;
var SECTIONS = [
  {
    title: "settings.section.champSelect",
    icon: ICON2.swords,
    rows: [{ id: "tutorial", icon: ICON2.mouse, when: "now" }]
  },
  {
    title: "settings.section.match",
    icon: ICON2.map,
    rows: [
      { id: "hideEnemyCustomSkins", icon: ICON2.eyeOff, when: "nextMatch" }
    ]
  },
  {
    title: "settings.section.app",
    icon: ICON2.app,
    rows: [
      { id: "autoRestartCore", icon: ICON2.restart, when: "now" },
      { id: "devTools", icon: ICON2.code, when: "nextClient" }
    ]
  }
];
function pluginError(error) {
  const code = error instanceof SettingsApiError ? error.message : "";
  if (code === "local_unreachable")
    return t("settings.error.local_unreachable");
  return tOr(
    `settings.plugin.error.${code}`,
    t("settings.plugin.error.fallback")
  );
}
var shortSha = (sha) => `<code class="sklol-set-sha">${esc(sha.slice(0, 7))}</code>`;
function describe(error, fallback) {
  const code = error instanceof SettingsApiError ? error.message : "";
  if (code === "settings_unavailable") return t("settings.error.unavailable");
  if (code === "local_unreachable")
    return t("settings.error.local_unreachable");
  return t(`settings.error.${fallback}`);
}
function openSettingsPanel(doc, host, api = localSettingsApi, {
  plugin = localPluginApi,
  // O plugin roda no documento principal do client: recarregá-lo recarrega os plugins.
  reload = () => window.location.reload()
} = {}) {
  const panel2 = doc.createElement("div");
  panel2.className = "sklol-panel";
  let settings = null;
  let loading = true;
  let loadError = "";
  let saveError = "";
  const saving = /* @__PURE__ */ new Set();
  let savedTimer;
  let justSaved = false;
  let pluginStatus = null;
  let pluginPhase = "checking";
  let pluginErr = "";
  let reloadTimer;
  panel2.innerHTML = `<div class="sklol-import-box sklol-set-box" role="dialog" aria-label="${t("settings.title")}"><div class="sklol-import-head"><div class="sklol-import-emblem">${ICON2.emblem}</div><div><h3 class="sklol-import-title">${t("settings.title")}</h3><div class="sklol-import-sub">${t("settings.sub")}</div></div><a class="sklol-import-close" href="#" role="button" aria-label="${t("common.close")}" data-action="close">${ICON2.close}</a></div><div class="sklol-set-body" data-sklol="settings-body"></div><div class="sklol-set-foot">${ICON2.file}<span>${t("settings.file")}</span><span class="sklol-set-status" data-sklol="settings-status" aria-live="polite"></span></div></div>`;
  const body = panel2.querySelector('[data-sklol="settings-body"]');
  const status = panel2.querySelector(
    '[data-sklol="settings-status"]'
  );
  const optionValue = (id) => id === "tutorial" ? carouselTutorialEnabled() : settings?.[id];
  function card2(row) {
    const value = optionValue(row.id);
    const on = value === true;
    const disabled = value === void 0;
    const classes = `sklol-set-card${on ? " on" : ""}${disabled ? " disabled" : ""}${saving.has(row.id) ? " saving" : ""}`;
    const name = t(`settings.${row.id}`);
    return `<li class="${classes}" role="switch" tabindex="${disabled ? -1 : 0}" aria-checked="${on}" aria-disabled="${disabled}" aria-label="${esc(name)}" data-action="toggle" data-option="${row.id}"><div class="sklol-set-icon">${row.icon}</div><div class="sklol-set-info"><div class="sklol-set-name">${name}<span class="sklol-set-when">${ICON2.clock}${t(`settings.when.${row.when}`)}</span></div><div class="sklol-set-hint">${t(`settings.${row.id}.hint`)}</div></div><div class="sklol-set-switch" aria-hidden="true"></div></li>`;
  }
  function render() {
    if (!body) return;
    body.innerHTML = SECTIONS.map((section, i) => {
      const label = `<div class="sklol-import-label sklol-set-label">${section.icon}${t(section.title)}</div>`;
      const fromLocal = i > 0;
      if (fromLocal && loading) {
        return i === 1 ? `${label}<div class="sklol-set-loading"><div style="position: relative; width: 32px; height: 32px;"><div class="loading-spinner"></div></div></div>` : "";
      }
      const error = fromLocal && i === 1 && loadError ? `<div class="sklol-panel-error sklol-set-error">${ICON2.alert}${esc(loadError)}</div>` : "";
      return `${label}${error}<ul class="sklol-set-list">${section.rows.map(card2).join("")}</ul>`;
    }).join("") + pluginSection();
    renderStatus();
  }
  function pluginSection() {
    const label = `<div class="sklol-import-label sklol-set-label">${ICON2.download}${t("settings.section.update")}</div>`;
    const latest = pluginStatus?.latest ?? null;
    const outdated = pluginStatus !== null && pluginOutdated(pluginStatus);
    const spinner2 = `<div class="sklol-set-spin"><div class="loading-spinner"></div></div>`;
    const button = (action, text) => flatButton({
      label: text,
      attrs: `data-action="${action}"`,
      content: `${action === "plugin-update" ? ICON2.download : ""}<span>${text}</span>`
    });
    let hint = "";
    let side = "";
    if (pluginPhase === "checking") {
      hint = t("settings.plugin.checking");
      side = `<div class="sklol-set-working">${spinner2}</div>`;
    } else if (pluginPhase === "updating") {
      hint = latest ? t("settings.plugin.updatingTo", { commit: shortSha(latest.sha) }) : t("settings.plugin.updating");
      side = `<div class="sklol-set-working">${spinner2}${t("settings.plugin.updating")}</div>`;
    } else if (pluginPhase === "reloading") {
      hint = t("settings.plugin.reloading", {
        commit: shortSha(pluginStatus?.installed ?? "")
      });
      side = `<span class="sklol-set-latest">${ICON2.check}${t("settings.plugin.latest")}</span>`;
    } else if (!latest) {
      hint = pluginStatus ? t("settings.plugin.offline") : "";
      side = button("plugin-check", t("settings.plugin.check"));
    } else if (outdated) {
      const ago = formatAgo(latest.date);
      const details = [
        latest.message && esc(latest.message),
        ago && esc(t("time.ago", { time: ago }))
      ].filter(Boolean).join(" \xB7 ");
      hint = `${t(
        pluginStatus?.installed ? "settings.plugin.available" : "settings.plugin.unknown",
        { commit: shortSha(latest.sha) }
      )}${details ? `<br>${details}` : ""}`;
      side = button("plugin-update", t("settings.plugin.update"));
    } else {
      hint = t("settings.plugin.upToDate", { commit: shortSha(latest.sha) });
      side = `<span class="sklol-set-latest">${ICON2.check}${t("settings.plugin.latest")}</span>`;
    }
    const error = pluginErr ? `<div class="sklol-panel-error">${ICON2.alert}${esc(pluginErr)}</div>` : "";
    const classes = `sklol-set-card sklol-set-plugin${outdated && pluginPhase === "idle" ? " on" : ""}${pluginPhase === "updating" ? " updating" : ""}`;
    return `${label}<ul class="sklol-set-list"><li class="${classes}" aria-busy="${pluginPhase === "checking" || pluginPhase === "updating"}"><div class="sklol-set-icon">${ICON2.sync}</div><div class="sklol-set-info"><div class="sklol-set-name">${t("settings.plugin")}<span class="sklol-set-when">${ICON2.clock}${t("settings.when.reload")}</span></div><div class="sklol-set-hint" aria-live="polite">${hint}</div>${error}</div>${side}</li></ul>`;
  }
  function checkPlugin() {
    pluginPhase = "checking";
    pluginErr = "";
    render();
    plugin.status().then((status2) => {
      pluginStatus = status2;
    }).catch((error) => {
      pluginErr = pluginError(error);
    }).finally(() => {
      pluginPhase = "idle";
      if (!closed) render();
    });
  }
  async function updatePlugin() {
    if (pluginPhase !== "idle") return;
    pluginPhase = "updating";
    pluginErr = "";
    render();
    try {
      pluginStatus = await plugin.update();
      pluginPhase = "reloading";
      if (!closed) reloadTimer = setTimeout(reload, RELOAD_DELAY_MS);
    } catch (error) {
      pluginErr = pluginError(error);
      pluginPhase = "idle";
    }
    if (!closed) render();
  }
  function renderStatus() {
    if (!status) return;
    const busy = saving.size > 0;
    status.className = `sklol-set-status${busy || justSaved || saveError ? " show" : ""}${busy ? " busy" : ""}`;
    status.style.color = saveError && !busy ? "#ff9aa8" : "";
    status.innerHTML = busy ? t("settings.saving") : saveError ? `${ICON2.alert}${esc(saveError)}` : `${ICON2.check}${t("settings.saved")}`;
  }
  function flashSaved() {
    justSaved = true;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => {
      justSaved = false;
      renderStatus();
    }, SAVED_MS);
  }
  async function toggle(id) {
    if (saving.has(id)) return;
    saveError = "";
    if (id === "tutorial") {
      setCarouselTutorialEnabled(!carouselTutorialEnabled());
      flashSaved();
      return render();
    }
    const current3 = settings;
    if (!current3) return;
    settings = { ...current3, [id]: !current3[id] };
    saving.add(id);
    render();
    try {
      settings = await api.set({ [id]: !current3[id] });
      flashSaved();
    } catch (error) {
      settings = { ...settings ?? current3, [id]: current3[id] };
      saveError = describe(error, "save");
    } finally {
      saving.delete(id);
      if (!closed) render();
    }
  }
  function onClick(event) {
    const target = event.target;
    if (target === panel2) return close();
    const button = target.closest("[data-action]");
    const action = button?.dataset.action;
    if (button?.tagName === "A") event.preventDefault();
    if (action === "close") return close();
    if (action === "toggle") void toggle(button?.dataset.option);
    if (action === "plugin-update") void updatePlugin();
    if (action === "plugin-check") checkPlugin();
  }
  function onKey(event) {
    const e = event;
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    const target = e.target;
    if ((e.key === "Enter" || e.key === " ") && target?.matches?.("[data-action]")) {
      e.preventDefault();
      target.click();
    }
  }
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(savedTimer);
    clearTimeout(reloadTimer);
    panel2.removeEventListener("click", onClick);
    panel2.removeEventListener("keydown", onKey);
    panel2.remove();
  }
  render();
  panel2.addEventListener("click", onClick);
  panel2.addEventListener("keydown", onKey);
  host.append(panel2);
  panel2.querySelector('[data-action="toggle"]')?.focus();
  checkPlugin();
  api.get().then((loaded3) => {
    settings = loaded3;
  }).catch((error) => {
    loadError = describe(error, "load");
  }).finally(() => {
    loading = false;
    if (!closed) render();
  });
  return { close };
}

// src/sklol/store/sidebar.ts
var sortLabel = (sort) => t(`sort.${sort}`);
var categoryLabel = (category) => t(`category.${category}`);
var sidebarLabel = (category) => category === ALL_CATEGORY ? t("category.all") : categoryLabel(category);
var SIDEBAR_CATEGORIES = [
  ALL_CATEGORY,
  ...MOD_CATEGORIES.filter((c) => c !== ALL_CATEGORY)
];
var START_VIEW = {
  source: null,
  sort: DEFAULT_SORT,
  nsfw: false,
  category: DEFAULT_CATEGORY
};
var remembered = { ...START_VIEW };
var rememberedInstalled = { ...START_INSTALLED_VIEW };
var rememberedTab = "store";
var initialView = () => ({ ...remembered });
var initialInstalledView = () => ({
  ...rememberedInstalled,
  excluded: [...rememberedInstalled.excluded]
});
var initialTab = () => rememberedTab;
var rememberView = (view2) => {
  remembered = { ...view2 };
};
var rememberInstalledView = (view2) => {
  rememberedInstalled = { ...view2, excluded: [...view2.excluded] };
};
var rememberTab = (tab) => {
  rememberedTab = tab;
};
function radio(category, selected) {
  const icon7 = selected ? "radio-button-checked" : "radio-button";
  return `<a class="radio-button-wrapper${selected ? " selected" : ""}" href="#" data-category="${category}"><i class="${icon7}"></i><span>${sidebarLabel(category)}</span></a>`;
}
var categoriesInner = (selected) => SIDEBAR_CATEGORIES.map((c) => radio(c, c === selected)).join("");
function filters(...boxes) {
  return `<div class="filters">${boxes.join("")}</div>`;
}
function checkbox(id, attribute, label, checked) {
  return `<div class="checkbox-wrapper"><input type="checkbox" id="${esc(id)}" ${attribute}${checked ? " checked" : ""}><label for="${esc(id)}">${esc(label)}</label><span>${esc(label)}</span></div>`;
}
var sourcesInner = (sources2) => sources2.map(
  (s) => checkbox(
    `sklol-source-${s.id}`,
    `data-source="${esc(s.id)}"`,
    s.name,
    s.checked
  )
).join("");
var sourcesKey = (sources2) => sources2.map((s) => `${s.id}\0${s.name}`).join("");
function bottomButton(tab) {
  return tab === "store" ? `<div class="sklol-set-bottom">${flatButton({
    label: t("sidebar.sources"),
    aria: t("sidebar.sourcesAria"),
    attrs: 'data-action="sources"'
  })}${flatButton({
    label: t("sidebar.settings"),
    attrs: 'data-action="settings"',
    className: "sklol-set-open",
    content: GEAR_ICON
  })}</div>` : flatButton({
    label: t("sidebar.import"),
    aria: t("sidebar.importAria", {
      extensions: IMPORT_EXTENSIONS.join(", ")
    }),
    attrs: 'data-action="import"',
    style: "margin-block: auto 40px;"
  });
}
var arrow = (active) => `<i class="${active ? "sort-down-arrow" : "sort-down-arrow-inactive"}"></i>`;
function sortItem(sort, selected) {
  const cls = selected ? "ui-dropdown-option ui-dropdown-option-selected" : "ui-dropdown-option";
  return `<li class="lol-uikit-dropdown-option" data-sort="${sort}"><span class="${cls}"><span>${sortLabel(sort)}${arrow(selected)}</span></span></li>`;
}
function sortInner(sort) {
  const items = MOD_SORTS.map((known) => sortItem(known, known === sort)).join(
    ""
  );
  return `<dt class="ui-dropdown-current"><div class="ui-dropdown-current-content"><span>${sortLabel(sort)}${arrow(true)}</span></div></dt><dd class="ui-dropdown-options-container"><ul class="ui-dropdown-options">${items}</ul></dd>`;
}
function sortDropdown(sort) {
  return `<div class="filters dropdown-filters"><div class="lol-uikit-framed-dropdown" tabindex="-1" data-sklol="sort"><div class="ui-dropdown" data-sklol="sort-inner">${sortInner(sort)}</div></div></div>`;
}
function tabsHtml(active) {
  const tabs = ["store", "installed"].map(
    (tab) => `<a class="sklol-tab${tab === active ? " active" : ""}" href="#" role="tab" aria-selected="${tab === active}" data-tab="${tab}">${t(`tab.${tab}`)}</a>`
  ).join("");
  return `<nav class="sklol-tabs" role="tablist">${tabs}</nav>`;
}
var SIDEBAR_STYLE = `.sklol-tabs{position:relative;display:flex;gap:4px;margin:0 0 14px;padding:3px;border:1px solid #3c3222;background:linear-gradient(180deg,rgba(30,35,40,.7),rgba(1,10,19,.85))}.sklol-tabs::before{content:"";position:absolute;inset:-1px;pointer-events:none;--corner:#785a28;--arm:7px;${CORNERS}}.sklol-tab{position:relative;flex:1;padding:7px 0 6px;color:#a09b8c;font-family:'LoL Display','Beaufort for LOL',serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-align:center;text-transform:uppercase;text-decoration:none;cursor:pointer;transition:color .2s,background .2s,text-shadow .2s}.sklol-tab::after{content:"";position:absolute;left:10%;right:10%;bottom:0;height:2px;background:linear-gradient(90deg,transparent,#c8aa6e,transparent);transform:scaleX(0);transition:transform .25s ease}.sklol-tab:hover{color:#f0e6d2;background:rgba(200,170,110,.06)}.sklol-tab:hover::after{transform:scaleX(.5)}.sklol-tab.active{color:#f0e6d2;background:linear-gradient(180deg,rgba(60,50,34,.55),rgba(1,10,19,.2));text-shadow:0 0 8px rgba(200,170,110,.45)}.sklol-tab.active::after{transform:scaleX(1)}.filters.categories .radio-button-wrapper{padding-top:7.5px!important;padding-bottom:7.5px!important}.sklol-sidebar .radio-button-wrapper{position:relative;white-space:nowrap;transition:color .15s,background .2s}.sklol-sidebar .radio-button-wrapper>*{transition:transform .2s ease}.sklol-sidebar .radio-button-wrapper::before{content:"";position:absolute;left:0;top:15%;bottom:15%;width:2px;background:#c8aa6e;box-shadow:0 0 6px rgba(200,170,110,.7);transform:scaleY(0);transition:transform .2s ease}.sklol-sidebar .radio-button-wrapper:hover>*,.sklol-sidebar .radio-button-wrapper.selected>*{transform:translateX(6px)}.sklol-sidebar .radio-button-wrapper:hover{background:linear-gradient(90deg,rgba(200,170,110,.10),transparent 80%)}.sklol-sidebar .radio-button-wrapper:hover::before{transform:scaleY(.6)}.sklol-sidebar .radio-button-wrapper.selected{background:linear-gradient(90deg,rgba(10,200,185,.10),transparent 80%)}.sklol-sidebar .radio-button-wrapper.selected::before{background:#0ac8b9;box-shadow:0 0 6px rgba(10,200,185,.7);transform:scaleY(1)}.sklol-sidebar .radio-button-wrapper:active i{transform:translateX(6px) scale(.85)}.sklol-sidebar input.search{transition:border-color .2s,box-shadow .2s,background-color .2s}.sklol-sidebar input.search:hover{border-color:#785a28}.sklol-sidebar input.search:focus{border-color:#c8aa6e;box-shadow:0 0 0 1px rgba(200,170,110,.25),0 0 12px rgba(200,170,110,.18)}.sklol-sidebar .checkbox-wrapper{white-space:nowrap;transition:background .2s}.sklol-sidebar .checkbox-wrapper>*{transition:transform .2s ease}.sklol-sidebar .checkbox-wrapper:hover>*{transform:translateX(4px)}.sklol-sidebar .checkbox-wrapper:hover{background:linear-gradient(90deg,rgba(200,170,110,.08),transparent 80%)}.sklol-sidebar .lol-uikit-framed-dropdown{transition:filter .2s}.sklol-sidebar .lol-uikit-framed-dropdown:hover{filter:drop-shadow(0 0 6px rgba(200,170,110,.25))}.sklol-sidebar .ui-dropdown-options-container{transform-origin:top}.sklol-sidebar .ui-dropdown .ui-dropdown-options{overflow:hidden!important}.sklol-sidebar .lol-uikit-framed-dropdown.active .ui-dropdown-options-container{animation:sklol-drop-in .16s ease-out}.sklol-sidebar .lol-uikit-dropdown-option{transition:background .15s}.sklol-sidebar .lol-uikit-dropdown-option>span{transition:transform .15s ease}.sklol-sidebar .lol-uikit-dropdown-option:hover>span{transform:translateX(4px)}.sklol-sidebar .lol-uikit-dropdown-option:hover{background:linear-gradient(90deg,rgba(200,170,110,.12),transparent)}@keyframes sklol-drop-in{from{opacity:0;transform:scaleY(.9) translateY(-4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.sklol-sidebar *,.sklol-tabs *{transition:none!important;animation:none!important}}`;
function sidebarHtml(model, { tabs = true, bottom = true } = {}) {
  const { sort, nsfw, category, sources: sources2 } = model.state();
  const categories = `<div class="filters categories">${categoriesInner(category)}</div>`;
  const placeholder = t(
    model.tab === "installed" ? "sidebar.searchInstalled" : "sidebar.search"
  );
  const search = `<input class="search" type="search" placeholder="${placeholder}" value="" maxlength="${MODS_MAX_SEARCH}" autocomplete="off" spellcheck="false" aria-label="${t("sidebar.searchAria")}">`;
  const adult = filters(checkbox("sklol-nsfw", "data-nsfw", "NSFW", nsfw));
  return `<div class="sidebar sklol-sidebar"><div class="sidebar-content">${tabs ? tabsHtml(model.tab) : ""}${categories}${search}<div class="sidebar-filters search-enabled">${sortDropdown(sort)}<div class="filters" data-sklol="sources">${sourcesInner(sources2)}</div>${adult}</div>${bottom ? bottomButton(model.tab) : ""}</div></div>`;
}
function bindSidebar(root, model, { onManage, onSettings, onImport, onNavigate } = {}) {
  const sourcesBox = root.querySelector('[data-sklol="sources"]');
  const sourceBoxes = () => [
    ...sourcesBox?.querySelectorAll("input[data-source]") ?? []
  ];
  const nsfwBox = root.querySelector("input[data-nsfw]");
  const dropdown = root.querySelector('[data-sklol="sort"]');
  const dropdownInner = root.querySelector(
    '[data-sklol="sort-inner"]'
  );
  const categoriesBox = root.querySelector(".filters.categories");
  const tabs = root.querySelector(".sklol-tabs");
  const first = model.state();
  let paintedSort = first.sort;
  let paintedCategory = first.category;
  let paintedSources = sourcesKey(first.sources);
  function paint() {
    const { sort, nsfw, category, sources: sources2 } = model.state();
    if (sourcesBox && sourcesKey(sources2) !== paintedSources) {
      sourcesBox.innerHTML = sourcesInner(sources2);
      paintedSources = sourcesKey(sources2);
    }
    for (const box of sourceBoxes()) {
      box.checked = sources2.find((s) => s.id === box.dataset.source)?.checked ?? false;
    }
    if (nsfwBox) nsfwBox.checked = nsfw;
    if (categoriesBox && category !== paintedCategory) {
      categoriesBox.innerHTML = categoriesInner(category);
      paintedCategory = category;
    }
    if (dropdownInner && sort !== paintedSort) {
      dropdownInner.innerHTML = sortInner(sort);
      paintedSort = sort;
    }
  }
  const onSourceChange = (event) => {
    const box = event.target;
    const wanted = box.dataset.source;
    if (wanted) model.toggleSource(wanted, box.checked);
    paint();
  };
  const onSourcesClick = (event) => {
    const target = event.target;
    const wrapper = target.closest(".checkbox-wrapper");
    if (wrapper && !target.closest("input, label")) {
      wrapper.querySelector("input")?.click();
    }
  };
  const onNsfwChange = (event) => {
    model.setNsfw(event.target.checked);
    paint();
  };
  const onBoxWrapperClick = (event) => {
    if (event.target.closest("input, label")) return;
    event.currentTarget.querySelector("input")?.click();
  };
  const nsfwWrapper = nsfwBox?.closest(".checkbox-wrapper");
  const onCategoryClick = (event) => {
    const item = event.target.closest(
      "[data-category]"
    );
    if (!item) return;
    event.preventDefault();
    const category = MOD_CATEGORIES.find((c) => c === item.dataset.category);
    if (category) model.setCategory(category);
    paint();
  };
  const onTabClick = (event) => {
    const item = event.target.closest("[data-tab]");
    if (!item) return;
    event.preventDefault();
    const tab = ["store", "installed"].find(
      (t2) => t2 === item.dataset.tab
    );
    if (tab && tab !== model.tab) onNavigate?.(tab);
  };
  const onDropdownClick = (event) => {
    const item = event.target.closest(
      "li[data-sort]"
    );
    if (item) {
      const sort = MOD_SORTS.find((known) => known === item.dataset.sort);
      if (sort) model.setSort(sort);
      paint();
    }
    dropdown?.classList.toggle("active");
  };
  const onDropdownFocusOut = (event) => {
    const next = event.relatedTarget;
    if (!next || !dropdown?.contains(next))
      dropdown?.classList.remove("active");
  };
  const onDropdownKey = (event) => {
    if (event.key === "Escape") {
      dropdown?.classList.remove("active");
    }
  };
  const manage = root.querySelector('[data-action="sources"]');
  const importer = root.querySelector('[data-action="import"]');
  const gear = root.querySelector('[data-action="settings"]');
  const onManageClick = () => onManage?.();
  const onSettingsClick = () => onSettings?.();
  const onGearKey = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSettings?.();
  };
  const onImportClick = () => onImport?.();
  sourcesBox?.addEventListener("change", onSourceChange);
  sourcesBox?.addEventListener("click", onSourcesClick);
  manage?.addEventListener("click", onManageClick);
  gear?.addEventListener("click", onSettingsClick);
  gear?.addEventListener("keydown", onGearKey);
  importer?.addEventListener("click", onImportClick);
  nsfwBox?.addEventListener("change", onNsfwChange);
  nsfwWrapper?.addEventListener("click", onBoxWrapperClick);
  categoriesBox?.addEventListener("click", onCategoryClick);
  tabs?.addEventListener("click", onTabClick);
  dropdown?.addEventListener("click", onDropdownClick);
  dropdown?.addEventListener("focusout", onDropdownFocusOut);
  dropdown?.addEventListener("keydown", onDropdownKey);
  const unsubscribe = model.subscribe(paint);
  return {
    destroy() {
      unsubscribe();
      sourcesBox?.removeEventListener("change", onSourceChange);
      sourcesBox?.removeEventListener("click", onSourcesClick);
      manage?.removeEventListener("click", onManageClick);
      gear?.removeEventListener("click", onSettingsClick);
      gear?.removeEventListener("keydown", onGearKey);
      importer?.removeEventListener("click", onImportClick);
      nsfwBox?.removeEventListener("change", onNsfwChange);
      nsfwWrapper?.removeEventListener("click", onBoxWrapperClick);
      categoriesBox?.removeEventListener("click", onCategoryClick);
      tabs?.removeEventListener("click", onTabClick);
      dropdown?.removeEventListener("click", onDropdownClick);
      dropdown?.removeEventListener("focusout", onDropdownFocusOut);
      dropdown?.removeEventListener("keydown", onDropdownKey);
    }
  };
}

// src/sklol/store/import-dialog.ts
var IMPORT_STYLE = `@keyframes sklol-import-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}.sklol-import-box{position:relative;width:780px;max-width:calc(100% - 48px);max-height:90%;overflow:hidden;box-sizing:border-box;padding:22px 30px 26px;color:#a09b8c;font-family:'LoL Body',sans-serif;font-size:13px;background:radial-gradient(120% 90% at 85% -10%,rgba(10,200,185,.10),transparent 55%),linear-gradient(180deg,#0a1a2a 0%,#06101b 45%,#010a13 100%);border:1px solid #785a28;box-shadow:0 0 0 1px #010a13,0 0 0 3px rgba(70,55,20,.7),0 24px 60px rgba(0,0,0,.7);animation:sklol-import-in .22s ease-out}.sklol-import-box::before{content:"";position:absolute;inset:4px;pointer-events:none;--corner:#c8aa6e;--arm:22px;${CORNERS}}.sklol-import-head{position:relative;display:flex;align-items:center;gap:18px;padding:0 40px 18px 0;margin-bottom:22px;border-bottom:1px solid transparent;border-image:linear-gradient(90deg,transparent,#463714 15%,#785a28 50%,#463714 85%,transparent) 1}.sklol-import-emblem{flex:none;display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;color:#0ac8b9;background:radial-gradient(circle,#0b2a3a 0%,#031520 70%);border:2px solid #c8aa6e;box-shadow:0 0 0 3px #010a13,0 0 0 4px #785a28,inset 0 0 14px rgba(10,200,185,.35)}.sklol-import-emblem svg{filter:drop-shadow(0 0 4px rgba(10,200,185,.6))}.sklol-import-title{margin:0;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:26px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;line-height:1.1}.sklol-import-sub{margin-top:6px;color:#a09b8c;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.sklol-import-close{position:absolute;top:2px;right:0;display:flex;padding:4px;color:#a09b8c;cursor:pointer;transition:color .15s}.sklol-import-close svg{transition:transform .15s}.sklol-import-close:hover{color:#f0e6d2}.sklol-import-close:hover svg{transform:rotate(90deg)}.sklol-import-file{position:relative;display:flex;align-items:center;gap:18px;padding:16px 22px;margin:0 0 24px;background:linear-gradient(90deg,rgba(30,35,40,.9),rgba(10,20,30,.9));border:1px solid #463714}.sklol-import-file::before{content:"";position:absolute;inset:-1px;pointer-events:none;--corner:#785a28;--arm:10px;${CORNERS}}.sklol-import-file svg{flex:none;color:#c8aa6e}.sklol-import-file-name{color:#f0e6d2;font-size:15px;word-break:break-all}.sklol-import-file-size{display:block;margin-top:3px;color:#7e7e7e;font-size:12px}.sklol-import-label{display:flex;align-items:center;gap:14px;margin-bottom:14px;color:#a09b8c;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}.sklol-import-label::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#463714,transparent)}.sklol-import-cats{display:grid;grid-template-columns:repeat(${MOD_CATEGORIES.length},1fr);gap:12px;margin:0 0 26px}.sklol-import-cat{--corner:#785a28;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:118px;color:#c8aa6e;text-decoration:none;cursor:pointer;background:linear-gradient(180deg,rgba(30,35,40,.55),rgba(1,10,19,.85));border:1px solid #3c3222;outline:none;transition:transform .15s ease,border-color .15s,background .15s,box-shadow .15s,color .15s}.sklol-import-cat::before{content:"";position:absolute;inset:-1px;pointer-events:none;--arm:9px;${CORNERS};transition:filter .15s}.sklol-import-cat span{color:#cdbe91;font-family:'LoL Display','Beaufort for LOL',serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;transition:color .15s}.sklol-import-cat svg{transition:transform .15s,filter .15s}.sklol-import-cat:hover,.sklol-import-cat:focus-visible{--corner:#c8aa6e;transform:translateY(-3px);border-color:#785a28;background:linear-gradient(180deg,rgba(60,50,34,.45),rgba(1,10,19,.85));box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 0 18px rgba(200,170,110,.08);color:#f0e6d2}.sklol-import-cat:hover span,.sklol-import-cat:focus-visible span{color:#f0e6d2}.sklol-import-cat:hover svg,.sklol-import-cat:focus-visible svg{transform:scale(1.08);filter:drop-shadow(0 0 6px rgba(200,170,110,.55))}.sklol-import-cat:active{transform:translateY(-1px)}.sklol-import-cat.selected{--corner:#0ac8b9;color:#cdfafa;border-color:#0397ab;background:radial-gradient(90% 80% at 50% 100%,rgba(10,200,185,.18),transparent 70%),linear-gradient(180deg,rgba(5,40,55,.6),rgba(1,10,19,.9));box-shadow:0 0 0 1px rgba(10,200,185,.35),0 0 18px rgba(10,200,185,.35),inset 0 0 22px rgba(10,200,185,.15)}.sklol-import-cat.selected span{color:#f0e6d2}.sklol-import-cat.selected svg{filter:drop-shadow(0 0 6px rgba(10,200,185,.7))}.sklol-import-cat.selected::after{content:"";position:absolute;left:50%;bottom:-6px;width:9px;height:9px;margin-left:-5px;background:#010a13;border:1px solid #0ac8b9;transform:rotate(45deg);box-shadow:0 0 8px rgba(10,200,185,.7)}.sklol-import-cats.busy .sklol-import-cat{pointer-events:none;opacity:.5}.sklol-import-actions{display:flex;gap:14px;justify-content:flex-end}.sklol-import-actions .lol-uikit-flat-button-normal{min-width:150px}.sklol-import-busy{display:flex;align-items:center;justify-content:flex-end;gap:12px;min-height:32px;color:#a09b8c}.sklol-drop{position:fixed;inset:0;z-index:1050;display:none;align-items:center;justify-content:center;background:rgba(1,10,19,.78);pointer-events:none}.sklol-drop.active{display:flex}.sklol-drop div{padding:36px 56px;border:2px dashed #c8aa6e;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:20px;letter-spacing:.06em;text-align:center;text-transform:uppercase;background:rgba(1,10,19,.6)}.sklol-drop span{display:block;margin-top:8px;color:#a09b8c;font-family:'LoL Body',sans-serif;font-size:13px;letter-spacing:0;text-transform:none}`;
var size = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
var icon3 = (paths, size2 = 40, width = 1.5) => `<svg width="${size2}" height="${size2}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
var CATEGORY_ICONS = {
  skins: icon3(
    '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6z"/><path d="M7.5 11.5 10.5 13.2M16.5 11.5 13.5 13.2M12 3v5.5M10 17.5h4"/>'
  ),
  maps: icon3(
    '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>'
  ),
  fonts: icon3(
    '<path d="M4 20 9.5 5h1L16 20M6.2 14.5h7.6"/><path d="M15.5 9h5M18 9v11M16.5 20h3"/>'
  ),
  ui: icon3(
    '<rect x="3" y="4" width="18" height="14" rx="1"/><rect x="5.5" y="6.5" width="13" height="9"/><path d="M9 21h6M12 18v3"/>'
  ),
  sounds: icon3(
    '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18.2 6.5a7.5 7.5 0 0 1 0 11"/>'
  ),
  other: icon3(
    '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9M8 5.2l8 4.6"/>'
  )
};
var FILE_ICON = icon3(
  '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15h6M9 18h4"/>',
  34
);
var EMBLEM_ICON = icon3(
  '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 14v5h14v-5"/>',
  28,
  1.8
);
var CLOSE_ICON = icon3('<path d="M6 6l12 12M18 6 6 18"/>', 22, 1.6);
var IMAGE_ICON = icon3(
  '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m3 17 5.5-5 4 3.5L16 12l5 4.5"/>',
  28,
  1.8
);
var IMPORT_STEP_STYLE = `@keyframes sklol-stage-next{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}@keyframes sklol-stage-back{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}@keyframes sklol-drop-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes sklol-img-in{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}.sklol-import-stage.next{animation:sklol-stage-next .25s ease-out}.sklol-import-stage.back{animation:sklol-stage-back .25s ease-out}.sklol-import-steps{display:flex;align-items:center;gap:10px;margin-left:auto;color:#5b5a56;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}.sklol-import-step{display:flex;align-items:center;gap:8px;transition:color .2s}.sklol-import-step i{width:9px;height:9px;border:1px solid #785a28;background:#010a13;transform:rotate(45deg);transition:background .2s,border-color .2s,box-shadow .2s}.sklol-import-step.done{color:#a09b8c}.sklol-import-step.done i{background:#c8aa6e;border-color:#c8aa6e}.sklol-import-step.current{color:#f0e6d2}.sklol-import-step.current i{background:#0ac8b9;border-color:#0ac8b9;box-shadow:0 0 8px rgba(10,200,185,.7)}.sklol-import-steps b{width:30px;height:1px;background:linear-gradient(90deg,#785a28,#463714)}.sklol-import-file-cat{display:flex;align-items:center;gap:8px;margin-left:auto;padding:5px 12px;color:#cdfafa;font-family:'LoL Display','Beaufort for LOL',serif;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid #0397ab;background:rgba(5,40,55,.5);box-shadow:inset 0 0 12px rgba(10,200,185,.12)}.sklol-import-file-cat svg{width:18px;height:18px;color:#0ac8b9}.sklol-import-media{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:22px;margin:0 0 26px}.sklol-import-drop{--corner:#785a28;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;aspect-ratio:16/9;overflow:hidden;box-sizing:border-box;padding:12px;text-align:center;color:#a09b8c;cursor:pointer;outline:none;background:radial-gradient(80% 70% at 50% 100%,rgba(10,200,185,.06),transparent 70%),linear-gradient(180deg,rgba(30,35,40,.55),rgba(1,10,19,.85));border:1px dashed #785a28;transition:border-color .2s,box-shadow .2s,transform .2s}.sklol-import-drop::before{content:"";position:absolute;inset:-1px;z-index:2;pointer-events:none;--arm:12px;${CORNERS}}.sklol-import-drop>svg{color:#c8aa6e;transition:transform .2s,filter .2s}.sklol-import-drop strong{color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:14px;letter-spacing:.08em;text-transform:uppercase}.sklol-import-drop small{color:#7e7e7e;font-size:11px;letter-spacing:.04em}.sklol-import-drop:hover,.sklol-import-drop:focus-visible{--corner:#c8aa6e;border-color:#c8aa6e;box-shadow:0 6px 18px rgba(0,0,0,.4),inset 0 0 22px rgba(200,170,110,.08)}.sklol-import-drop:hover>svg,.sklol-import-drop:focus-visible>svg{transform:translateY(-3px);filter:drop-shadow(0 0 6px rgba(200,170,110,.55))}.sklol-import-drop.over{--corner:#0ac8b9;border-style:solid;border-color:#0ac8b9;transform:scale(1.015);box-shadow:0 0 0 1px rgba(10,200,185,.35),0 0 18px rgba(10,200,185,.35),inset 0 0 26px rgba(10,200,185,.15)}.sklol-import-drop.over>svg{color:#0ac8b9;animation:sklol-drop-bob .8s ease-in-out infinite;filter:drop-shadow(0 0 6px rgba(10,200,185,.7))}.sklol-import-drop.has-image{border-style:solid;padding:0}.sklol-import-drop.has-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:sklol-img-in .3s ease-out}.sklol-import-drop-swap{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:13px;letter-spacing:.1em;text-transform:uppercase;background:rgba(1,10,19,.62);opacity:0;transition:opacity .2s}.sklol-import-drop.has-image:hover .sklol-import-drop-swap,.sklol-import-drop.has-image.over .sklol-import-drop-swap{opacity:1}.sklol-import-remove{position:absolute;top:8px;right:8px;z-index:3;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;color:#a09b8c;background:radial-gradient(circle,#0b2a3a 0%,#031520 70%);border:1px solid #785a28;box-shadow:0 0 0 2px #010a13;cursor:pointer;transition:color .15s,border-color .15s}.sklol-import-remove svg{transition:transform .15s}.sklol-import-remove:hover{color:#f0e6d2;border-color:#c8aa6e}.sklol-import-remove:hover svg{transform:rotate(90deg)}.sklol-import-drop.loading{pointer-events:none}.sklol-import-side{display:flex;flex-direction:column;gap:12px;min-width:0}.sklol-import-side .sklol-import-label{margin-bottom:0}.sklol-import-url{display:flex;gap:8px}.sklol-import-input{flex:1;min-width:0;height:32px;padding:0 10px;box-sizing:border-box;color:#f0e6d2;font:13px 'LoL Body',sans-serif;background:#010a13;border:1px solid #463714;outline:none;transition:border-color .2s,box-shadow .2s}.sklol-import-input::placeholder{color:#5b5a56}.sklol-import-input:hover{border-color:#785a28}.sklol-import-input:focus{border-color:#c8aa6e;box-shadow:0 0 0 1px rgba(200,170,110,.25),0 0 12px rgba(200,170,110,.18)}.sklol-import-url .lol-uikit-flat-button-normal{min-width:72px}.sklol-import-url .rp-button-text{display:inline-flex;align-items:center;gap:6px}.sklol-import-chosen{display:flex;align-items:center;gap:8px;padding:8px 10px;color:#cdfafa;font-size:12px;border:1px solid rgba(3,151,171,.6);background:rgba(5,40,55,.45);animation:sklol-img-in .25s ease-out}.sklol-import-chosen svg{flex:none;color:#0ac8b9}.sklol-import-chosen span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sklol-import-hint{color:#7e7e7e;font-size:12px;line-height:1.55}.sklol-import-hint kbd{padding:1px 5px;color:#cdbe91;font:11px 'LoL Body',sans-serif;border:1px solid #463714;background:#010a13}@media (prefers-reduced-motion:reduce){.sklol-import-stage,.sklol-import-drop,.sklol-import-drop *{animation:none!important;transition:none!important}}`;
function openImportDialog(doc, host, file, list2, { category: initial, onDone }) {
  const panel2 = doc.createElement("div");
  panel2.className = "sklol-panel";
  let category = initial;
  let step = 1;
  let moved = null;
  let busy = false;
  let error = "";
  let imageFailed = "";
  let closed = false;
  panel2.innerHTML = `<div class="sklol-import-box" role="dialog" aria-label="${t("import.title")}"><div class="sklol-import-head" data-sklol="import-head"></div><div data-sklol="import-body"></div></div>`;
  const head = panel2.querySelector('[data-sklol="import-head"]');
  const body = panel2.querySelector('[data-sklol="import-body"]');
  const picker = createImagePicker(doc, {
    root: panel2,
    render: () => render()
  });
  const stopImages = watchImages(doc, panel2);
  function headHtml() {
    const stepper = [t("import.step.category"), t("import.step.image")].map((label, i) => {
      const state = i + 1 < step ? "done" : i + 1 === step ? "current" : "";
      return `<span class="sklol-import-step ${state}"><i></i>${label}</span>`;
    }).join("<b></b>");
    const sub = t(step === 1 ? "import.sub.category" : "import.sub.image");
    return `<div class="sklol-import-emblem">${step === 1 ? EMBLEM_ICON : IMAGE_ICON}</div><div><h3 class="sklol-import-title">${t("import.title")}</h3><div class="sklol-import-sub">${sub}</div></div><div class="sklol-import-steps" aria-label="${t("import.stepOf", { step })}">${stepper}</div><a class="sklol-import-close" href="#" role="button" aria-label="${t("common.close")}" data-action="cancel">${CLOSE_ICON}</a>`;
  }
  function fileHtml() {
    const tag = step === 2 ? `<span class="sklol-import-file-cat">${CATEGORY_ICONS[category]}${categoryLabel(category)}</span>` : "";
    return `<div class="sklol-import-file">${FILE_ICON}<div><span class="sklol-import-file-name">${esc(file.name)}</span><span class="sklol-import-file-size">${size(file.size)}</span></div>${tag}</div>`;
  }
  function busyHtml() {
    return `<div class="sklol-import-busy"><div style="position: relative; width: 32px; height: 32px;"><div class="loading-spinner"></div></div>${t("import.busy")}</div>`;
  }
  function categoryHtml() {
    const cards = MOD_CATEGORIES.map((c) => {
      const selected = c === category;
      return `<a class="sklol-import-cat${selected ? " selected" : ""}" href="#" role="radio" aria-checked="${selected}" data-category="${c}">${CATEGORY_ICONS[c]}<span>${categoryLabel(c)}</span></a>`;
    }).join("");
    const actions = `<div class="sklol-import-actions">${flatButton({ label: t("common.cancel"), attrs: 'data-action="cancel"' })}${flatButton({ label: t("common.next"), attrs: 'data-action="next"' })}</div>`;
    return `<div class="sklol-import-label">${t("import.whichCategory")}</div><div class="sklol-import-cats" role="radiogroup">${cards}</div>${error ? `<div class="sklol-panel-error">${esc(error)}</div>` : ""}${actions}`;
  }
  function imageHtml() {
    const side = `<div class="sklol-import-side">${picker.linkHtml()}<div class="sklol-import-hint">${t("import.hint", { keys: "<kbd>Ctrl</kbd>+<kbd>V</kbd>" })}</div></div>`;
    const actions = imageFailed ? `<div class="sklol-import-actions">${flatButton({ label: t("common.close"), attrs: 'data-action="done"' })}</div>` : busy ? busyHtml() : `<div class="sklol-import-actions">${flatButton({ label: t("common.back"), attrs: 'data-action="back"' })}${flatButton({ label: t(picker.chosen ? "import.import" : "import.importWithout"), attrs: 'data-action="import"' })}</div>`;
    const message = imageFailed || error;
    return `<div class="sklol-import-label">${t("import.imageLabel")}</div><div class="sklol-import-media">${picker.dropHtml()}${side}</div>${message ? `<div class="sklol-panel-error" role="alert">${esc(message)}</div>` : ""}${actions}`;
  }
  function render() {
    if (closed) return;
    if (head) head.innerHTML = headHtml();
    if (!body) return;
    const stage = step === 1 ? categoryHtml() : imageHtml();
    body.innerHTML = `${fileHtml()}<div class="sklol-import-stage${moved ? ` ${moved}` : ""}">${stage}</div>`;
    moved = null;
  }
  function go(next) {
    if (busy || next === step) return;
    moved = next > step ? "next" : "back";
    step = next;
    error = "";
    render();
  }
  function select(next) {
    category = next;
    for (const card2 of panel2.querySelectorAll("[data-category]")) {
      const selected = card2.dataset.category === next;
      card2.classList.toggle("selected", selected);
      card2.setAttribute("aria-checked", String(selected));
    }
  }
  async function run() {
    if (busy || picker.busy) return;
    busy = true;
    error = "";
    render();
    try {
      const result = await list2.importFile(
        file,
        category,
        file.name,
        picker.value() ?? ""
      );
      busy = false;
      onDone?.(category);
      if (result.imageSaved) return close();
      imageFailed = t("import.imageFailed", {
        reason: editError(result.imageError)
      });
      return render();
    } catch (caught) {
      const code = caught instanceof InstalledApiError ? caught.code : "bad_response";
      error = importError(code);
      if (code === "no_champion" || code === "invalid_category") {
        moved = "back";
        step = 1;
      }
    }
    busy = false;
    render();
  }
  function onClick(event) {
    const target = event.target;
    if (target === panel2) {
      if (!busy) close();
      return;
    }
    const radio2 = target.closest("[data-category]");
    if (radio2) {
      event.preventDefault();
      const next = MOD_CATEGORIES.find((c) => c === radio2.dataset.category);
      if (next && !busy) select(next);
      return;
    }
    const actionEl = target.closest("[data-action]");
    if (actionEl?.tagName === "A") event.preventDefault();
    const action = actionEl?.dataset.action;
    if (!busy && !imageFailed && picker.action(action, event)) return;
    switch (action) {
      case "cancel":
      case "done":
        if (!busy) close();
        return;
      case "next":
        return go(2);
      case "back":
        return go(1);
      case "import":
        return void run();
    }
  }
  const onInput = (event) => picker.onInput(event);
  function onKey(event) {
    const e = event;
    if (e.key === "Escape" && !busy) {
      e.stopPropagation();
      close();
      return;
    }
    if (picker.onKey(e)) return;
    const target = e.target;
    if ((e.key === "Enter" || e.key === " ") && target?.matches?.('[role="button"][data-action]') && panel2.contains(target)) {
      e.preventDefault();
      target.click();
    }
  }
  function onPaste(event) {
    if (step !== 2 || busy || imageFailed) return;
    picker.onPaste(event);
  }
  const blocked = (event) => {
    if (!busy && !imageFailed) return false;
    event.preventDefault();
    event.stopPropagation();
    return true;
  };
  const onDrag = (event) => {
    if (step !== 2 || blocked(event)) return;
    picker.onDrag(event);
  };
  const onDrop = (event) => {
    if (step !== 2 || blocked(event)) return;
    picker.onDrop(event);
  };
  function close() {
    if (closed) return;
    closed = true;
    picker.dispose();
    stopImages();
    panel2.removeEventListener("click", onClick);
    panel2.removeEventListener("input", onInput);
    for (const type of ["dragenter", "dragover", "dragleave"]) {
      panel2.removeEventListener(type, onDrag);
    }
    panel2.removeEventListener("drop", onDrop);
    doc.removeEventListener("keydown", onKey, true);
    doc.removeEventListener("paste", onPaste);
    panel2.remove();
  }
  render();
  panel2.addEventListener("click", onClick);
  panel2.addEventListener("input", onInput);
  for (const type of ["dragenter", "dragover", "dragleave"]) {
    panel2.addEventListener(type, onDrag);
  }
  panel2.addEventListener("drop", onDrop);
  doc.addEventListener("keydown", onKey, true);
  doc.addEventListener("paste", onPaste);
  host.append(panel2);
  return { close };
}

// src/sklol/store/edit-dialog.ts
var icon4 = (paths, size2, width = 1.8) => `<svg width="${size2}" height="${size2}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
var EMBLEM_ICON2 = icon4(
  '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4M4 20l4-.5"/>',
  28
);
var CLOSE_ICON2 = icon4('<path d="M6 6l12 12M18 6 6 18"/>', 22, 1.6);
var LOCAL_ICON = icon4(
  '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>',
  16
);
var EDIT_STYLE = `.sklol-edit-box{overflow-y:auto}.sklol-edit-box::-webkit-scrollbar{width:6px}.sklol-edit-box::-webkit-scrollbar-thumb{background:#785a28}.sklol-edit-tag{display:inline-flex;align-items:center;gap:6px;margin-left:auto;padding:5px 12px;color:#cdfafa;font-family:'LoL Display','Beaufort for LOL',serif;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;border:1px solid #0397ab;background:rgba(5,40,55,.5);box-shadow:inset 0 0 12px rgba(10,200,185,.12);white-space:nowrap}.sklol-edit-tag svg{color:#0ac8b9}.sklol-edit-note{position:relative;display:flex;align-items:center;gap:12px;margin:0 0 22px;padding:12px 16px;color:#a09b8c;font-size:12px;line-height:1.5;background:linear-gradient(90deg,rgba(10,200,185,.08),rgba(10,20,30,.6) 60%);border:1px solid #1e3a44;border-left:2px solid #0ac8b9}.sklol-edit-note svg{flex:none;color:#0ac8b9}.sklol-edit-note strong{color:#f0e6d2;font-weight:700}.sklol-edit-field{display:flex;flex-direction:column;gap:8px}.sklol-edit-field .sklol-import-input{width:100%;height:36px;font-size:14px}.sklol-edit-field .sklol-import-input.invalid{border-color:#e84057;box-shadow:0 0 0 1px rgba(232,64,87,.25)}.sklol-edit-count{align-self:flex-end;color:#5b5a56;font-size:11px;letter-spacing:.04em}.sklol-edit-count.over{color:#e84057}.sklol-edit-side{display:flex;flex-direction:column;gap:14px;min-width:0}.sklol-edit-side .sklol-import-label{margin-bottom:0}.sklol-edit-media-col{display:flex;flex-direction:column;gap:10px;min-width:0}.sklol-edit-media-col .sklol-import-label{margin-bottom:0}.sklol-edit-box .sklol-import-actions .rp-button-text{display:inline-flex;align-items:center;gap:8px}.sklol-edit-box .sklol-import-busy{justify-content:flex-end}.sklol-edit-box .sklol-import-drop.has-image{--corner:#c8aa6e}.sklol-edit-preview-name{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:18px 14px 10px;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:15px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;text-shadow:0 1px 6px rgba(0,0,0,.9);background:linear-gradient(0deg,rgba(1,10,19,.92),rgba(1,10,19,0));pointer-events:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sklol-edit-preview-name::before{content:"";position:absolute;left:14px;top:10px;width:36px;height:1px;background:linear-gradient(90deg,#c8aa6e,transparent)}@media (max-width:820px){.sklol-edit-box .sklol-import-media{grid-template-columns:1fr}.sklol-edit-box{padding:18px 20px 22px}.sklol-edit-box .sklol-import-title{font-size:22px}}@media (max-height:620px){.sklol-edit-note{margin-bottom:14px}.sklol-edit-box .sklol-import-head{margin-bottom:14px;padding-bottom:12px}}`;
function openEditDialog(doc, host, mod, list2, { onSaved, onClose } = {}) {
  const panel2 = doc.createElement("div");
  panel2.className = "sklol-panel";
  panel2.innerHTML = `<div class="sklol-import-box sklol-edit-box" role="dialog" aria-modal="true" aria-label="${esc(t("edit.title"))}"><div class="sklol-import-head"><div class="sklol-import-emblem">${EMBLEM_ICON2}</div><div><h3 class="sklol-import-title">${t("edit.title")}</h3><div class="sklol-import-sub">${t("edit.sub")}</div></div><span class="sklol-edit-tag" title="${esc(t("edit.localNote"))}">${LOCAL_ICON}${t("edit.localTag")}</span><a class="sklol-import-close" href="#" role="button" aria-label="${t("common.close")}" data-action="cancel">${CLOSE_ICON2}</a></div><div data-sklol="edit-body"></div></div>`;
  const body = panel2.querySelector('[data-sklol="edit-body"]');
  const current3 = modImage(installedToMod(mod));
  const picker = createImagePicker(doc, {
    root: panel2,
    render: () => renderMedia(),
    initial: current3 ? { kind: "current", src: current3, label: mod.name } : null,
    emptyHint: t("image.fallbackNote")
  });
  const stopImages = watchImages(doc, panel2);
  let name = mod.name;
  let busy = false;
  let error = "";
  let closed = false;
  const cleanName = () => normalizeModName(name);
  const nameValid = () => {
    const clean = cleanName();
    return clean.length > 0 && clean.length <= MAX_MOD_NAME;
  };
  function changes() {
    const edit = {};
    if (cleanName() !== mod.name) edit.name = cleanName();
    const image = picker.value();
    if (image !== void 0) edit.thumbnail = image;
    return edit;
  }
  function mediaHtml() {
    const caption = picker.chosen ? `<div class="sklol-edit-preview-name">${esc(cleanName() || mod.name)}</div>` : "";
    const drop = picker.dropHtml(caption);
    return `<div class="sklol-edit-media-col"><div class="sklol-import-label">${t("edit.imageLabel")}</div>${drop}</div>`;
  }
  function sideHtml() {
    const length = cleanName().length;
    const invalid = !nameValid();
    return `<div class="sklol-edit-side"><div class="sklol-edit-field"><label class="sklol-import-label" for="sklol-edit-name">${t("edit.nameLabel")}</label><input id="sklol-edit-name" class="sklol-import-input${invalid ? " invalid" : ""}" type="text" maxlength="${MAX_MOD_NAME + 20}" value="${esc(name)}" placeholder="${esc(t("edit.namePlaceholder"))}" spellcheck="false" autocomplete="off" data-sklol="name"${busy ? " disabled" : ""}${invalid ? ' aria-invalid="true"' : ""}><span class="sklol-edit-count${length > MAX_MOD_NAME ? " over" : ""}" data-sklol="count">${length}/${MAX_MOD_NAME}</span></div>${picker.linkHtml()}<div class="sklol-import-hint">${t("import.hint", { keys: "<kbd>Ctrl</kbd>+<kbd>V</kbd>" })}</div></div>`;
  }
  function actionsHtml() {
    if (busy) {
      return `<div class="sklol-import-busy"><div style="position: relative; width: 32px; height: 32px;"><div class="loading-spinner"></div></div>${t("edit.saving")}</div>`;
    }
    return `<div class="sklol-import-actions">${flatButton({ label: t("common.cancel"), attrs: 'data-action="cancel"' })}${flatButton({ label: t("edit.save"), attrs: 'data-action="save"' })}</div>`;
  }
  function render() {
    if (closed || !body) return;
    body.innerHTML = `<div class="sklol-edit-note">${LOCAL_ICON}<span>${t("edit.localNote")}</span></div><div class="sklol-import-media"><div data-sklol="media">${mediaHtml()}</div><div data-sklol="side">${sideHtml()}</div></div><div data-sklol="status">${statusHtml()}</div>`;
  }
  const statusHtml = () => `${error ? `<div class="sklol-panel-error" role="alert">${esc(error)}</div>` : ""}${actionsHtml()}`;
  function renderMedia() {
    if (closed) return;
    const media = panel2.querySelector('[data-sklol="media"]');
    if (media) media.innerHTML = mediaHtml();
    const side = panel2.querySelector('[data-sklol="side"]');
    const link = side?.querySelector(".sklol-import-url");
    if (!side || !link) return render();
    const field = side.querySelector(".sklol-edit-field");
    const template = doc.createElement("template");
    template.innerHTML = sideHtml();
    const fresh = template.content.firstElementChild;
    if (!field || !fresh) return render();
    while (field.nextSibling) field.nextSibling.remove();
    for (const node of [...fresh.childNodes].slice(1)) side.append(node);
  }
  function renderStatus() {
    const status = panel2.querySelector('[data-sklol="status"]');
    if (status) status.innerHTML = statusHtml();
  }
  function paintName(input2) {
    name = input2.value;
    const length = cleanName().length;
    const invalid = !nameValid();
    input2.classList.toggle("invalid", invalid);
    if (invalid) input2.setAttribute("aria-invalid", "true");
    else input2.removeAttribute("aria-invalid");
    const count = panel2.querySelector('[data-sklol="count"]');
    if (count) {
      count.textContent = `${length}/${MAX_MOD_NAME}`;
      count.classList.toggle("over", length > MAX_MOD_NAME);
    }
    const caption = panel2.querySelector(
      ".sklol-edit-preview-name"
    );
    if (caption) caption.textContent = cleanName() || mod.name;
  }
  async function save() {
    if (busy || picker.busy) return;
    if (!nameValid()) {
      error = editError("invalid_name");
      panel2.querySelector('[data-sklol="name"]')?.focus();
      return renderStatus();
    }
    const edit = changes();
    if (edit.name === void 0 && edit.thumbnail === void 0) return close();
    busy = true;
    error = "";
    render();
    try {
      await list2.edit(mod.id, edit);
      const saved = list2.getState().mods.find((m) => m.id === mod.id);
      busy = false;
      close();
      if (saved) onSaved?.(saved);
      return;
    } catch (caught) {
      error = editError(
        caught instanceof InstalledApiError ? caught.code : void 0
      );
    }
    busy = false;
    render();
  }
  function onClick(event) {
    const target = event.target;
    if (target === panel2) {
      if (!busy) close();
      return;
    }
    const actionEl = target.closest("[data-action]");
    if (actionEl?.tagName === "A") event.preventDefault();
    const action = actionEl?.dataset.action;
    if (busy) return;
    if (picker.action(action, event)) return;
    if (action === "cancel") return close();
    if (action === "save") return void save();
  }
  function onInput(event) {
    const input2 = event.target;
    if (input2.dataset?.sklol === "name") return paintName(input2);
    picker.onInput(event);
  }
  function onKey(event) {
    const e = event;
    if (e.key === "Escape") {
      e.stopPropagation();
      if (!busy) close();
      return;
    }
    if (busy || picker.onKey(e)) return;
    const target = e.target;
    if (e.key === "Enter" && target?.dataset?.sklol === "name") {
      e.preventDefault();
      return void save();
    }
    if ((e.key === "Enter" || e.key === " ") && target?.matches?.('[role="button"][data-action]') && panel2.contains(target)) {
      e.preventDefault();
      target.click();
    }
  }
  const onPaste = (event) => {
    const target = event.target;
    if (!busy && target?.dataset?.sklol !== "name") picker.onPaste(event);
  };
  const onDrag = (event) => {
    if (busy) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    picker.onDrag(event);
  };
  const onDrop = (event) => {
    if (busy) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    picker.onDrop(event);
  };
  function close() {
    if (closed) return;
    closed = true;
    picker.dispose();
    stopImages();
    panel2.removeEventListener("click", onClick);
    panel2.removeEventListener("input", onInput);
    for (const type of ["dragenter", "dragover", "dragleave"]) {
      panel2.removeEventListener(type, onDrag);
    }
    panel2.removeEventListener("drop", onDrop);
    doc.removeEventListener("keydown", onKey, true);
    doc.removeEventListener("paste", onPaste);
    panel2.remove();
    onClose?.();
  }
  render();
  panel2.addEventListener("click", onClick);
  panel2.addEventListener("input", onInput);
  for (const type of ["dragenter", "dragover", "dragleave"]) {
    panel2.addEventListener(type, onDrag);
  }
  panel2.addEventListener("drop", onDrop);
  doc.addEventListener("keydown", onKey, true);
  doc.addEventListener("paste", onPaste);
  host.append(panel2);
  const input = panel2.querySelector('[data-sklol="name"]');
  input?.focus();
  input?.select();
  return { close };
}

// src/sklol/store/mod-menu.ts
var MOD_MENU_STYLE = `@keyframes sklol-cm-in{from{opacity:0;transform:translateY(-4px) scale(.97)}to{opacity:1;transform:none}}.sklol-context-menu{position:fixed;z-index:1200;min-width:224px;max-width:300px;padding:6px;box-sizing:border-box;font-family:'LoL Body','Spiegel',sans-serif;color:#cdbe91;background:radial-gradient(120% 80% at 100% 0%,rgba(10,200,185,.13),transparent 55%),radial-gradient(90% 70% at 0% 100%,rgba(200,170,110,.09),transparent 60%),repeating-linear-gradient(135deg,rgba(200,170,110,.025) 0 1px,transparent 1px 10px),linear-gradient(180deg,rgba(14,30,44,.97),rgba(4,12,20,.98));border:1px solid #785a28;box-shadow:0 0 0 1px #010a13,0 0 0 2px rgba(70,55,20,.6),0 16px 36px rgba(0,0,0,.65),inset 0 1px 0 rgba(240,230,210,.06);backdrop-filter:blur(6px);transform-origin:top left;animation:sklol-cm-in .14s ease-out}.sklol-context-menu::before{content:"";position:absolute;inset:3px;pointer-events:none;--corner:#c8aa6e;--arm:8px;${CORNERS}}.sklol-cm-head{padding:5px 10px 9px;margin-bottom:4px;color:#c8aa6e;font-family:'LoL Display','Beaufort for LOL',serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid transparent;border-image:linear-gradient(90deg,#785a28,rgba(120,90,40,0)) 1}.sklol-cm-item{position:relative;display:flex;align-items:center;gap:11px;padding:6px 10px 6px 8px;font-size:13px;font-weight:600;letter-spacing:.03em;cursor:pointer;outline:none;transition:color .15s,background .15s}.sklol-cm-item::before{content:"";position:absolute;left:0;top:7px;bottom:7px;width:2px;background:#c8aa6e;opacity:0;transform:scaleY(.4);transition:opacity .15s,transform .15s}.sklol-cm-icon{flex:none;display:flex;align-items:center;justify-content:center;width:26px;height:26px;color:#c8aa6e;background:linear-gradient(180deg,rgba(30,35,40,.9),rgba(1,10,19,.9));border:1px solid #463714;transition:color .15s,border-color .15s,box-shadow .15s}.sklol-cm-item:hover,.sklol-cm-item:focus{color:#f0e6d2;background:linear-gradient(90deg,rgba(200,170,110,.16),rgba(200,170,110,0) 85%)}.sklol-cm-item:hover::before,.sklol-cm-item:focus::before{opacity:1;transform:none}.sklol-cm-item:hover .sklol-cm-icon,.sklol-cm-item:focus .sklol-cm-icon{color:#0ac8b9;border-color:#0397ab;box-shadow:0 0 8px rgba(10,200,185,.35)}.sklol-cm-sep{height:1px;margin:4px 8px;background:linear-gradient(90deg,transparent,#463714,transparent)}.sklol-cm-item.danger{color:#d9a0a6}.sklol-cm-item.danger .sklol-cm-icon{color:#e84057;border-color:#3a1219}.sklol-cm-item.danger:hover,.sklol-cm-item.danger:focus{color:#ffd9de;background:linear-gradient(90deg,rgba(232,64,87,.18),rgba(232,64,87,0) 85%)}.sklol-cm-item.danger::before{background:#e84057}.sklol-cm-item.danger:hover .sklol-cm-icon,.sklol-cm-item.danger:focus .sklol-cm-icon{color:#ff5c73;border-color:#7a2230;box-shadow:0 0 8px rgba(232,64,87,.4)}@media (prefers-reduced-motion:reduce){.sklol-context-menu{animation:none}.sklol-cm-item,.sklol-cm-item::before,.sklol-cm-icon{transition:none}}`;
var icon5 = (paths) => `<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
var ICONS = {
  page: icon5(
    '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  ),
  install: icon5(
    '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v3h16v-3"/>'
  ),
  enable: icon5('<path d="M12 3v8"/><path d="M6.3 7a8 8 0 1 0 11.4 0"/>'),
  disable: icon5('<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>'),
  edit: icon5('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  uninstall: icon5(
    '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>'
  )
};
var EDGE2 = 4;
function modMenuItems(mod, saved, installed4, page) {
  const items = [];
  if (mod.source !== IMPORTED_SOURCE && page !== null) {
    items.push({
      action: "open-page",
      label: t("modal.openPage"),
      icon: ICONS.page
    });
  }
  const status = saved.status(mod.id);
  const entry = installed4.find(mod);
  if ((status === "idle" || status === "failed") && !entry) {
    items.push({
      action: "install",
      label: t("modal.install"),
      icon: ICONS.install
    });
  }
  if (status !== "saved") return items;
  if (mod.category !== "skins" && entry && installed4.applyStatus(mod.id) !== "busy") {
    items.push({
      action: "apply",
      label: t(entry.applied ? "menu.disable" : "menu.enable"),
      icon: entry.applied ? ICONS.disable : ICONS.enable
    });
  }
  items.push(
    { action: "edit", label: t("modal.edit"), icon: ICONS.edit },
    { action: "uninstall", label: t("modal.uninstall"), icon: ICONS.uninstall }
  );
  return items;
}
function createModMenu(doc, { host, saved, installed: installed4 }) {
  const win = doc.defaultView ?? window;
  let current3 = null;
  let editor = null;
  let destroyed = false;
  const pages = /* @__PURE__ */ new Map();
  function pageOf(mod) {
    const key2 = `${mod.source}\0${mod.id}`;
    let found = pages.get(key2);
    if (!found) {
      found = fetchDetails(mod.source, mod.id).then((details) => {
        const page = details?.page || null;
        if (!page) pages.delete(key2);
        return page;
      });
      pages.set(key2, found);
    }
    return found;
  }
  const itemsOf = (root) => [
    ...root.querySelectorAll("[data-action]")
  ];
  function render() {
    if (!current3) return;
    const { mod, root, page } = current3;
    const items = modMenuItems(mod, saved, installed4, page);
    if (!items.length) return close();
    const focused = root.querySelector("[data-action]:focus")?.dataset.action;
    const list2 = items.map(({ action, label, icon: icon7 }) => {
      const danger = action === "uninstall";
      const sep = danger ? '<div class="sklol-cm-sep" role="separator"></div>' : "";
      return `${sep}<div class="sklol-cm-item${danger ? " danger" : ""}" role="menuitem" tabindex="-1" data-action="${action}"><span class="sklol-cm-icon">${icon7}</span><span>${esc(label)}</span></div>`;
    }).join("");
    root.innerHTML = `<div class="sklol-cm-head" aria-hidden="true">${esc(mod.name)}</div>${list2}`;
    if (focused) {
      (root.querySelector(`[data-action="${focused}"]`) ?? itemsOf(root)[0])?.focus();
    }
  }
  function close() {
    const was = current3;
    current3 = null;
    if (!was) return;
    was.stop();
    was.root.remove();
  }
  async function edit(mod) {
    if (editor) return;
    const entry = await installed4.resolve(mod);
    if (!entry || destroyed || editor) return;
    editor = openEditDialog(doc, host, entry, installed4, {
      onClose: () => {
        editor = null;
      }
    });
  }
  function run(mod, action) {
    close();
    switch (action) {
      case "open-page":
        void pageOf(mod).then((page) => {
          if (page) void openLink(page);
        });
        return;
      case "install":
        if (saved.status(mod.id) === "idle" || saved.status(mod.id) === "failed")
          void saved.toggle(mod);
        return;
      case "apply":
        return void installed4.toggleApplied(mod.id);
      case "edit":
        return void edit(mod);
      case "uninstall":
        if (saved.status(mod.id) === "saved") void saved.toggle(mod);
        return;
    }
  }
  function open(mod, event) {
    close();
    if (destroyed || !modMenuItems(mod, saved, installed4).length) return;
    event.preventDefault();
    const imported = mod.source === IMPORTED_SOURCE;
    const root = doc.createElement("div");
    root.className = "sklol-context-menu";
    root.setAttribute("role", "menu");
    root.setAttribute("aria-label", t("menu.label", { name: mod.name }));
    const outside = (e) => {
      if (!e.composedPath().includes(root)) close();
    };
    const onKey = (e) => {
      const key2 = e.key;
      if (key2 === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        return close();
      }
      const items = itemsOf(root);
      const at = items.findIndex((item) => e.composedPath().includes(item));
      if (key2 === "ArrowDown" || key2 === "ArrowUp") {
        e.preventDefault();
        const step = key2 === "ArrowDown" ? 1 : -1;
        const next = at < 0 ? step > 0 ? 0 : -1 : at + step;
        items[(next + items.length) % items.length]?.focus();
      } else if ((key2 === "Enter" || key2 === " ") && at >= 0) {
        e.preventDefault();
        items[at]?.click();
      }
    };
    const onClick = (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      e.stopPropagation();
      if (action) run(mod, action);
    };
    doc.addEventListener("mousedown", outside, true);
    doc.addEventListener("wheel", close, true);
    doc.addEventListener("keydown", onKey, true);
    win.addEventListener("blur", close);
    win.addEventListener("resize", close);
    root.addEventListener("click", onClick);
    root.addEventListener("contextmenu", (e) => e.preventDefault());
    const unsubscribeSaved = saved.subscribe(render);
    const unsubscribeInstalled = installed4.subscribe(render);
    current3 = {
      mod,
      root,
      page: imported ? null : void 0,
      stop() {
        doc.removeEventListener("mousedown", outside, true);
        doc.removeEventListener("wheel", close, true);
        doc.removeEventListener("keydown", onKey, true);
        win.removeEventListener("blur", close);
        win.removeEventListener("resize", close);
        unsubscribeSaved();
        unsubscribeInstalled();
      }
    };
    render();
    root.style.left = `${event.clientX}px`;
    root.style.top = `${event.clientY}px`;
    host.append(root);
    const box = root.getBoundingClientRect();
    if (event.clientX + box.width > win.innerWidth - EDGE2) {
      root.style.left = `${Math.max(EDGE2, event.clientX - box.width)}px`;
    }
    if (event.clientY + box.height > win.innerHeight - EDGE2) {
      root.style.top = `${Math.max(EDGE2, event.clientY - box.height)}px`;
    }
    if (!installed4.getState().loaded || saved.status(mod.id) === "saved" && !installed4.find(mod)) {
      void installed4.refresh();
    }
    if (!imported) {
      const opened = current3;
      void pageOf(mod).then((page) => {
        if (current3 !== opened || !current3) return;
        current3.page = page;
        render();
      });
    }
  }
  return {
    open,
    destroy() {
      destroyed = true;
      close();
      editor?.close();
    }
  };
}

// src/sklol/store/mod-modal.ts
var THUMBS_PER_PAGE = 5;
var AUTOPLAY_MS = 6e3;
var NEW_FOR_MS = 14 * 24 * 60 * 6e4;
var kickerOf = (category, fresh) => t(fresh ? `modal.kicker.${category}.new` : `modal.kicker.${category}`);
var taglineOf = (category) => t(`modal.tagline.${category}`);
var typeOf = (category) => t(`modal.type.${category}`);
var STATUS_COLORS = {
  working: "#0acf83",
  broken: "#e84057",
  outdated: "#f0b232"
};
var svg = (size2, body, fill2 = false) => `<svg width="${size2}" height="${size2}" viewBox="0 0 24 24" aria-hidden="true" ${fill2 ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
var ICON3 = {
  download: svg(
    16,
    '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v3h16v-3"/>'
  ),
  chevronDown: svg(14, '<path d="m6 9 6 6 6-6"/>'),
  chevronLeft: svg(28, '<path d="m15 4-8 8 8 8"/>'),
  chevronRight: svg(28, '<path d="m9 4 8 8-8 8"/>'),
  smallLeft: svg(12, '<path d="m15 5-7 7 7 7"/>'),
  smallRight: svg(12, '<path d="m9 5 7 7-7 7"/>'),
  eye: svg(
    14,
    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
  ),
  dl: svg(
    14,
    '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'
  ),
  dots: svg(
    18,
    '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    true
  ),
  crown: svg(12, '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5Z"/>', true),
  play: svg(
    16,
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3Z" fill="currentColor"/>'
  ),
  link: svg(
    15,
    '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'
  ),
  discord: svg(18, DISCORD_PATH, true),
  close: svg(16, '<path d="M6 6l12 12M18 6 6 18"/>'),
  edit: svg(15, '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  type: {
    skins: svg(
      22,
      '<path d="M12 2c-4 0-7 3-7 7v5l3 3v4h8v-4l3-3V9c0-4-3-7-7-7Z"/><path d="M9 11h2M13 11h2M12 2v6"/>'
    ),
    maps: svg(
      22,
      '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z"/><path d="M9 4v14M15 6v14"/>'
    ),
    fonts: svg(
      22,
      '<path d="M4 20 10 4l6 16"/><path d="M6.5 14h7"/><path d="M17 20v-7"/>'
    ),
    ui: svg(
      22,
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>'
    ),
    sounds: svg(
      22,
      '<path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13"/>'
    ),
    other: svg(
      22,
      '<path d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4v-4a2 2 0 1 0 0-4Z"/>'
    )
  }
};
function descriptionText(details, doc) {
  const raw = details.description;
  let text = raw;
  if (details.descriptionFormat === "html") {
    const Parser = doc.defaultView?.DOMParser ?? globalThis.DOMParser;
    if (Parser) {
      const parsed = new Parser().parseFromString(raw, "text/html");
      for (const br of [...parsed.body.querySelectorAll("br")])
        br.replaceWith("\n");
      for (const li of [...parsed.body.querySelectorAll("li")])
        li.prepend("\u2022 ");
      for (const block of [
        ...parsed.body.querySelectorAll("p,div,h1,h2,h3,h4,h5,h6,li,hr,tr")
      ]) {
        block.append("\n");
      }
      text = parsed.body.textContent ?? "";
    } else {
      text = raw.replace(/<[^>]*>/g, " ");
    }
  } else if (details.descriptionFormat === "markdown") {
    text = raw.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/^\s{0,3}#{1,6}\s*/gm, "").replace(/^\s{0,3}>\s?/gm, "").replace(/^\s*[-*+]\s+/gm, "\u2022 ").replace(/(\*\*|__)(.+?)\1/g, "$2").replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?!\w)/g, "$1$2").replace(/`{1,3}/g, "");
  }
  return text.split("\n").map((line) => line.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
var skel = (width, height, style = "") => `<span class="sklol-skel" style="width:${width};height:${height}px;${style}" aria-hidden="true"></span>`;
var statusOf = (raw) => {
  const key2 = raw.toLowerCase();
  return [tOr(`modal.status.${key2}`, raw), STATUS_COLORS[key2] ?? "#a09b8c"];
};
var roleOf = (raw) => tOr(
  `modal.role.${raw.toLowerCase()}`,
  raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : ""
);
var isOwner = (raw) => raw.toLowerCase() === "owner";
var licenseOf = (raw) => raw.replace(/_/g, "-");
var linkLabel = (url, label, kind) => {
  if (label) return label;
  if (kind) return kind.charAt(0).toUpperCase() + kind.slice(1);
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
var MODAL_STYLE = `@keyframes sklol-shimmer{from{background-position:150% 0}to{background-position:-50% 0}}@keyframes sklol-reveal{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}.sklol-skel{display:block;max-width:100%;border-radius:2px;background:linear-gradient(90deg,rgba(60,50,34,.35) 20%,rgba(200,170,110,.2) 50%,rgba(60,50,34,.35) 80%) 0 0/200% 100%,#0e1a24;animation:sklol-shimmer 1.4s ease-in-out infinite;pointer-events:none}.sklol-type .sklol-skel,.sklol-counter .sklol-skel{display:inline-block}.sklol-thumb.sklol-skel{border-color:#3c3222;border-radius:0}.sklol-avatar.sklol-skel{border-radius:50%}.sklol-hero.sklol-skel{border-radius:0;pointer-events:auto}.sklol-rows .sklol-skel{align-self:center}.sklol-links .sklol-skel{border:1px solid #3c3222;box-sizing:border-box}.sklol-reveal{animation:sklol-reveal .3s ease-out both}@media (prefers-reduced-motion:reduce){.sklol-skel,.sklol-reveal{animation:none}}@keyframes sklol-modal-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}.sklol-modal{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(1,10,19,.82);font-family:'LoL Body','Spiegel',sans-serif}.sklol-modal-frame{position:relative;width:min(1180px,calc(100vw - 48px));box-shadow:0 0 0 1px #010a13,0 0 0 3px rgba(70,55,20,.7),0 24px 60px rgba(0,0,0,.7);animation:sklol-modal-in .22s ease-out}.sklol-modal-frame::before{content:"";position:absolute;inset:4px;z-index:1;pointer-events:none;--corner:#c8aa6e;--arm:22px;${CORNERS}}.sklol-modal-box{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px;max-height:calc(100vh - 48px);overflow-y:auto;overflow-x:hidden;padding:18px;box-sizing:border-box;color:#a09b8c;background:radial-gradient(120% 90% at 85% -10%,rgba(10,200,185,.10),transparent 55%),linear-gradient(180deg,#0a1a2a 0%,#06101b 45%,#010a13 100%);border:1px solid #785a28}.sklol-modal-box::-webkit-scrollbar{width:6px}.sklol-modal-box::-webkit-scrollbar-thumb{background:#785a28}.sklol-modal-close{position:absolute;top:-14px;right:-14px;z-index:2;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle,#0b2a3a 0%,#031520 70%);border:2px solid #785a28;box-shadow:0 0 0 2px #010a13;color:#a09b8c;cursor:pointer;transition:color .15s,border-color .15s,box-shadow .15s}.sklol-modal-close svg{transition:transform .15s}.sklol-modal-close:hover,.sklol-modal-close:focus-visible{color:#f0e6d2;border-color:#c8aa6e;box-shadow:0 0 0 2px #010a13,0 0 10px rgba(200,170,110,.45);outline:none}.sklol-modal-close:hover svg{transform:rotate(90deg)}.sklol-modal-main{min-width:0}.sklol-hero::after{content:"";position:absolute;inset:4px;pointer-events:none;--corner:#c8aa6e;--arm:16px;${CORNERS}}.sklol-hero{position:relative;aspect-ratio:16/9;overflow:hidden;border:1px solid #785a28;box-shadow:0 0 0 1px #010a13,0 0 0 2px #463714;background:#010a13 url('/fe/lol-store/storefront/addon/public/img/bg-chroma-card.jpg') center/cover}.sklol-hero.zoomable{cursor:zoom-in}.sklol-zoom{position:fixed;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;background:rgba(1,10,19,.94);cursor:zoom-out}.sklol-zoom img{max-width:calc(100vw - 48px);max-height:calc(100vh - 48px);object-fit:contain;box-shadow:0 0 40px rgba(0,0,0,.7)}.sklol-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .45s ease}.sklol-hero-img.active{opacity:1}.sklol-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(1,10,19,.88) 0%,rgba(1,10,19,.55) 38%,rgba(1,10,19,0) 68%),linear-gradient(0deg,rgba(1,10,19,.6) 0%,rgba(1,10,19,0) 30%);pointer-events:none}.sklol-hero-text{position:absolute;left:52px;top:50%;transform:translateY(-50%);max-width:52%}.sklol-kicker{color:#c8aa6e;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}.sklol-hero-title{margin:0;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:34px;font-weight:700;line-height:1.08;letter-spacing:.02em;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.6);overflow-wrap:anywhere}.sklol-hero-tagline{margin:10px 0 20px;color:#f0e6d2;font-size:14px;line-height:1.4;text-shadow:0 1px 6px rgba(0,0,0,.8)}.sklol-hero-arrow{position:absolute;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:36px;height:56px;color:#c8aa6e;cursor:pointer;filter:drop-shadow(0 1px 4px rgba(0,0,0,.8))}.sklol-hero-arrow:hover{color:#f0e6d2}.sklol-hero-arrow.prev{left:6px}.sklol-hero-arrow.next{right:6px}.sklol-hero-dots{position:absolute;left:0;right:0;bottom:14px;display:flex;justify-content:center;gap:9px}.sklol-dot{width:7px;height:7px;border-radius:50%;background:#5b5a56;cursor:pointer;box-shadow:0 0 0 1px rgba(1,10,19,.6)}.sklol-dot{transition:background .15s,transform .15s}.sklol-dot:hover{background:#a09b8c}.sklol-dot.active{background:#c8aa6e;transform:scale(1.25);box-shadow:0 0 0 1px rgba(1,10,19,.6),0 0 6px rgba(200,170,110,.7)}.sklol-gallery-head{display:flex;align-items:center;gap:12px;margin:16px 0 10px}.sklol-h3{margin:0;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:18px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}.sklol-rule{flex:1;height:1px;background:linear-gradient(90deg,#785a28,#463714 40%,transparent)}.sklol-pager{position:relative;display:flex;align-items:center;gap:10px;padding:3px 10px;border:1px solid #463714;color:#a09b8c;font-size:12px;background:linear-gradient(90deg,rgba(30,35,40,.9),rgba(10,20,30,.9))}.sklol-pager::before{content:"";position:absolute;inset:-1px;pointer-events:none;--corner:#785a28;--arm:5px;${CORNERS}}.sklol-pager [data-action]{display:flex;color:#c8aa6e;cursor:pointer}.sklol-pager [data-action]:hover{color:#f0e6d2}.sklol-pager .disabled{opacity:.3;pointer-events:none}.sklol-gallery{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.sklol-thumb{position:relative;aspect-ratio:16/9;overflow:hidden;border:1px solid #3c3222;cursor:pointer;background:#1e2328;box-sizing:border-box;transition:transform .15s ease,border-color .15s,box-shadow .15s}.sklol-thumb img{transition:transform .25s ease,filter .15s;filter:brightness(.85)}.sklol-thumb img{width:100%;height:100%;object-fit:cover;display:block}.sklol-thumb:hover{transform:translateY(-3px);border-color:#c8aa6e;box-shadow:0 6px 18px rgba(0,0,0,.45),0 0 10px rgba(200,170,110,.25)}.sklol-thumb:hover img{transform:scale(1.06);filter:none}.sklol-thumb.active{border-color:#0ac8b9;box-shadow:0 0 0 1px rgba(10,200,185,.35),0 0 14px rgba(10,200,185,.35)}.sklol-thumb.active img{filter:none}.sklol-about{margin-top:18px}.sklol-about .sklol-gallery-head{margin-top:0}.sklol-desc{color:#a09b8c;font-size:13px;line-height:1.6;white-space:pre-line;overflow-wrap:anywhere}.sklol-muted{color:#5b5a56;font-size:12px}.sklol-side::before{content:"";position:absolute;inset:-1px;pointer-events:none;--corner:#785a28;--arm:10px;${CORNERS}}.sklol-side{position:relative;display:flex;flex-direction:column;gap:0;padding:16px;border:1px solid #463714;background:linear-gradient(180deg,rgba(30,35,40,.9),rgba(10,20,30,.9));align-self:start;font-size:12px;color:#a09b8c}.sklol-dl-row{position:relative;display:flex;gap:4px}.sklol-dl-row>.lol-uikit-flat-button-normal:first-child{flex:1}.sklol-dl-row .rp-button-text{display:inline-flex;align-items:center;gap:8px;letter-spacing:.08em}.sklol-dl-more{width:36px;min-width:36px}.sklol-modal-error{margin-top:8px;color:#e84057;font-size:12px}.sklol-edit-open{display:block;margin-top:8px}.sklol-edit-open .rp-button-text{display:inline-flex;align-items:center;gap:8px;letter-spacing:.08em}.sklol-origin{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin:14px 0 0;padding:12px;border:1px solid #1e3a44;border-left:2px solid #0ac8b9;background:linear-gradient(90deg,rgba(10,200,185,.08),rgba(1,10,19,.6) 70%)}.sklol-origin .hextech-ui-badge{position:static}.sklol-origin p{margin:0;color:#a09b8c;font-size:12px;line-height:1.5}.sklol-stats3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 0;text-align:center}.sklol-stats3>div{position:relative;padding:9px 4px;border:1px solid #3c3222;background:linear-gradient(180deg,rgba(30,35,40,.55),rgba(1,10,19,.85))}.sklol-stats3>div::before{content:"";position:absolute;inset:-1px;pointer-events:none;--corner:#785a28;--arm:6px;${CORNERS}}.sklol-stats3 strong{display:block;color:#f0e6d2;font-size:13px}.sklol-stats3 span{display:block;margin-top:2px;font-size:10px;letter-spacing:.08em;text-transform:uppercase}.sklol-counters{display:flex;align-items:center;gap:14px;padding:10px 0 0}.sklol-counter{display:inline-flex;align-items:center;gap:5px;color:#a09b8c}.sklol-counter svg{color:#a09b8c}.sklol-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:#a09b8c;cursor:pointer;border-radius:2px}.sklol-icon-btn:hover{color:#f0e6d2;background:rgba(200,170,110,.08)}.sklol-counters .sklol-icon-btn:first-of-type{margin-left:auto}.sklol-section{padding:14px 0 12px}.sklol-section:last-child{border-bottom:0;padding-bottom:0}.sklol-section-title{display:flex;align-items:center;gap:12px;margin-bottom:12px;color:#a09b8c;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}.sklol-section-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#463714,transparent)}.sklol-type{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.sklol-type-name{display:inline-flex;align-items:center;gap:8px;margin-right:4px;color:#f0e6d2;font-weight:700}.sklol-type-name svg{color:#c8aa6e}.sklol-pill{padding:2px 9px;border-radius:10px;font-size:11px;color:#f0e6d2;border:1px solid #a61e33;background:rgba(166,30,51,.25)}.sklol-pill.tag{border-color:#8b3a8f;background:rgba(139,58,143,.25)}.sklol-rows{display:grid;grid-template-columns:86px 1fr;row-gap:9px;align-items:center}.sklol-rows>span:nth-child(odd){font-size:10px;letter-spacing:.08em;text-transform:uppercase}.sklol-rows>span:nth-child(even){color:#f0e6d2}.sklol-status{display:inline-flex;align-items:center;gap:7px}.sklol-status i{width:9px;height:9px;border-radius:50%}.sklol-license{text-decoration:underline dotted #785a28;text-underline-offset:3px}.sklol-person{display:flex;align-items:center;gap:10px}.sklol-person+.sklol-person{margin-top:10px}.sklol-avatar{flex:none;width:42px;height:42px;border-radius:50%;overflow:hidden;border:2px solid #c8aa6e;box-shadow:0 0 0 2px #010a13,0 0 0 3px #785a28;background:#1e2328;display:flex;align-items:center;justify-content:center;color:#c8aa6e;font-weight:700;font-size:16px}.sklol-avatar img{width:100%;height:100%;object-fit:cover}.sklol-person strong{display:block;color:#f0e6d2;font-size:13px}.sklol-role{display:inline-flex;align-items:center;gap:4px;margin-top:2px;color:#c8aa6e}.sklol-links{display:flex;flex-direction:column;gap:8px}.sklol-links .lol-uikit-flat-button-normal{display:block;width:100%}.sklol-links .rp-button-text{display:inline-flex;align-items:center;gap:8px;text-transform:none;letter-spacing:.02em}.sklol-link-discord .lol-uikit-flat-button-bg{background:#1c2657!important}.sklol-link-discord .rp-button-text{color:#dfe3ff!important}.sklol-link-discord .lol-uikit-flat-button-border-idle,.sklol-link-discord .lol-uikit-flat-button-border-transition{border-color:#5865f2!important;border-image:none!important}.sklol-menu{position:absolute;right:0;top:calc(100% + 4px);z-index:3;min-width:190px;padding:4px 0;background:linear-gradient(180deg,#0a1a2a,#010a13);border:1px solid #785a28;box-shadow:0 0 0 1px #010a13,0 6px 18px rgba(0,0,0,.6);animation:sklol-modal-in .12s ease-out}.sklol-menu [data-action]{padding:8px 12px;color:#a09b8c;cursor:pointer;font-size:12px}.sklol-menu [data-action]{transition:color .15s,background .15s}.sklol-menu [data-action]:hover{color:#f0e6d2;background:linear-gradient(90deg,rgba(200,170,110,.14),transparent)}.sklol-counters{position:relative}@media (max-width:820px){.sklol-modal-box{grid-template-columns:1fr}.sklol-hero-title{font-size:26px}}`;
function openModModal(doc, host, mod, { saved, installed: installed4, onClose }) {
  const win = doc.defaultView ?? window;
  const imported = mod.source === IMPORTED_SOURCE;
  const root = doc.createElement("div");
  root.className = "sklol-modal";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", mod.name);
  let details = null;
  let loading = !imported;
  let index = 0;
  let menu = false;
  let zoom = null;
  let hovering = false;
  let closed = false;
  let editor = null;
  const installedEntry = () => installed4.find(mod);
  const shown2 = () => {
    const entry = installedEntry();
    return entry ? {
      ...mod,
      name: entry.local.renamed ? entry.name : mod.name,
      local: entry.local
    } : mod;
  };
  const category = () => {
    const found = details?.category ?? mod.category;
    return isModCategory(found) ? found : "skins";
  };
  const images = () => {
    const current3 = shown2();
    const own = modImage(current3);
    const gallery = details?.images ?? [];
    if (imported) return own ? [own] : [];
    if (current3.local?.customImage) return own ? [own, ...gallery] : gallery;
    if (gallery.length) return gallery;
    return own ? [own] : [];
  };
  function heroHtml() {
    const list2 = images();
    const current3 = shown2();
    const name = current3.local?.renamed ? current3.name : details?.name || current3.name;
    const published = details?.publishedAt || 0;
    const fresh = published > 0 && Date.now() - published < NEW_FOR_MS;
    const tagline = details?.summary || taglineOf(category());
    const slides = list2.length || loading ? list2.map(
      (src, i) => `<img class="sklol-hero-img${i === index ? " active" : ""}" data-slide="${i}" ${imageAttrs(src)} alt="" referrerpolicy="no-referrer" decoding="async" draggable="false">`
    ).join("") : `<img class="sklol-hero-img active" src="${COVER_IMAGE}" alt="" decoding="async" draggable="false">`;
    const arrows = list2.length > 1 ? `<div class="sklol-hero-arrow prev" role="button" tabindex="0" aria-label="${t("modal.prevImage")}" data-action="prev">${ICON3.chevronLeft}</div><div class="sklol-hero-arrow next" role="button" tabindex="0" aria-label="${t("modal.nextImage")}" data-action="next">${ICON3.chevronRight}</div>` : "";
    const dots = list2.length > 1 ? `<div class="sklol-hero-dots">${list2.map((_, i) => `<div class="sklol-dot${i === index ? " active" : ""}" role="button" aria-label="${t("modal.image", { n: i + 1 })}" data-action="go" data-index="${i}"></div>`).join("")}</div>` : "";
    const more = flatButton({
      label: t("modal.seeDetails"),
      attrs: 'data-action="details"',
      content: `${t("modal.seeDetails")} ${ICON3.smallRight}`
    });
    const kicker = loading ? skel("110px", 12, "margin-bottom:2px") : esc(kickerOf(category(), fresh));
    const taglineHtml = loading ? `<div class="sklol-hero-tagline">${skel("85%", 13)}${skel("55%", 13, "margin-top:7px")}</div>` : `<p class="sklol-hero-tagline">${esc(tagline)}</p>`;
    return `<div class="sklol-hero${list2.length ? " zoomable" : ""}${loading && !list2.length ? " sklol-skel" : ""}" data-sklol="hero"${list2.length ? ` data-action="zoom" title="${t("modal.zoom")}"` : ""}>${slides}<div class="sklol-hero-shade"></div><div class="sklol-hero-text"><div class="sklol-kicker">${kicker}</div><h2 class="sklol-hero-title">${esc(name)}</h2>${taglineHtml}${more}</div>${arrows}${dots}</div>`;
  }
  function galleryInner() {
    const list2 = images();
    const page = Math.floor(index / THUMBS_PER_PAGE);
    const from = page * THUMBS_PER_PAGE;
    return list2.slice(from, from + THUMBS_PER_PAGE).map(
      (src, offset) => `<div class="sklol-thumb${from + offset === index ? " active" : ""}" role="button" aria-label="${t("modal.image", { n: from + offset + 1 })}" data-action="go" data-index="${from + offset}"><img ${imageAttrs(src)} alt="" referrerpolicy="no-referrer" loading="lazy" decoding="async" draggable="false"></div>`
    ).join("");
  }
  function pagerHtml() {
    const list2 = images();
    const at = list2.length ? index + 1 : 0;
    return `<div class="${index === 0 ? "disabled" : ""}" role="button" aria-label="${t("modal.prev")}" data-action="prev">${ICON3.smallLeft}</div><span>${at} / ${list2.length}</span><div class="${index >= list2.length - 1 ? "disabled" : ""}" role="button" aria-label="${t("modal.next")}" data-action="next">${ICON3.smallRight}</div>`;
  }
  function mainHtml() {
    const skin = category() === "skins";
    const galleryTitle = `<h3 class="sklol-h3">${t(skin ? "modal.gallery.skin" : "modal.gallery.mod")}</h3><div class="sklol-rule"></div>`;
    const gallery = loading ? `<div class="sklol-gallery-head">${galleryTitle}${skel("64px", 22)}</div><div class="sklol-gallery">${'<div class="sklol-thumb sklol-skel"></div>'.repeat(THUMBS_PER_PAGE)}</div>` : images().length ? `<div class="sklol-gallery-head">${galleryTitle}<div class="sklol-pager" data-sklol="pager">${pagerHtml()}</div></div><div class="sklol-gallery" data-sklol="gallery">${galleryInner()}</div>` : "";
    const text = details ? descriptionText(details, doc) : "";
    const about = loading ? `<div class="sklol-desc">${["96%", "88%", "92%", "70%", "40%"].map((w, i) => skel(w, 12, i ? "margin-top:9px" : "")).join("")}</div>` : text ? `<div class="sklol-desc">${esc(text)}</div>` : `<div class="sklol-muted">${t(imported ? "modal.imported" : "modal.noDescription")}</div>`;
    return `<div class="sklol-modal-main">${heroHtml()}${gallery}<section class="sklol-about" data-sklol="about"><div class="sklol-gallery-head"><h3 class="sklol-h3">${t(skin ? "modal.about.skin" : "modal.about.mod")}</h3><div class="sklol-rule"></div></div>${about}</section></div>`;
  }
  function downloadHtml() {
    const status = saved.status(mod.id);
    const content = status === "busy" ? `<span>${t("modal.waiting")}</span>` : status === "saved" ? `<span>${t("modal.uninstall")}</span>` : `${ICON3.download}<span>${t(status === "failed" ? "common.retry" : "modal.install")}</span>`;
    const main = flatButton({
      label: t(status === "saved" ? "modal.uninstall" : "modal.install"),
      attrs: 'data-action="download"',
      content
    });
    const chevron = flatButton({
      label: t("modal.moreOptions"),
      attrs: 'data-action="menu"',
      className: "sklol-dl-more",
      content: ICON3.chevronDown
    });
    const error = status === "failed" ? `<div class="sklol-modal-error">${esc(savedError(saved.reason(mod.id)))}</div>` : "";
    const edit = status === "saved" ? flatButton({
      label: t("modal.edit"),
      aria: t("modal.editAria"),
      attrs: 'data-action="edit"',
      className: "sklol-edit-open",
      content: `${ICON3.edit}<span>${t("modal.edit")}</span>`
    }) : "";
    return `<div class="sklol-dl-row">${main}${imported ? "" : chevron}${menu ? menuHtml() : ""}</div>${error}${edit}`;
  }
  function menuHtml() {
    const installed5 = saved.status(mod.id) === "saved";
    const page = details?.page;
    return `<div class="sklol-menu" role="menu">${page ? `<div role="menuitem" data-action="open-page">${t("modal.openPage")}</div>` : ""}<div role="menuitem" data-action="download">${t(installed5 ? "modal.uninstall" : "modal.downloadInstall")}</div></div>`;
  }
  function sideHtml() {
    const cat = category();
    const released = formatAgo(details?.publishedAt || 0);
    const value = (text) => loading ? skel("60%", 13, "margin:1px auto 2px") : esc(text || "\u2014");
    const stats = `<div class="sklol-stats3"><div><strong>${value(formatVersion(details?.version ?? ""))}</strong><span>${t("modal.stat.version")}</span></div><div><strong>${value(details?.patch ?? "")}</strong><span>${t("modal.stat.patch")}</span></div><div><strong>${value(released)}</strong><span>${t("modal.stat.released")}</span></div></div>`;
    const views = loading ? skel("26px", 10) : esc(details ? formatCount(details.views) : "\u2014");
    const downloads = formatCount(details?.downloads ?? mod.downloads);
    const counters = `<div class="sklol-counters"><span class="sklol-counter" title="${t("modal.views")}">${ICON3.eye}${views}</span><span class="sklol-counter" title="${t("modal.downloads")}">${ICON3.dl}${esc(downloads)}</span>${imported ? "" : `<div class="sklol-icon-btn" role="button" tabindex="0" aria-label="${t("modal.moreOptions")}" title="${t("modal.moreOptions")}" data-action="menu">${ICON3.dots}</div>`}</div>`;
    const champions = details?.champions.length ? details.champions : mod.champions;
    const pills = [
      ...champions.slice(0, 4).map((c) => `<span class="sklol-pill">${esc(c)}</span>`),
      ...(details?.tags ?? []).slice(0, 4).map((t2) => `<span class="sklol-pill tag">${esc(t2)}</span>`)
    ].join("");
    const tagSkel = loading ? skel("54px", 18, "border-radius:10px") + skel("68px", 18, "border-radius:10px") : "";
    const numbers = imported ? `<div class="sklol-origin"><span class="hextech-ui-badge background-grey sklol-origin-badge" title="${esc(t("badge.importedTitle"))}"><span class="badge-text">${esc(t("badge.imported"))}</span></span><p>${esc(t("modal.origin.importedText"))}</p></div>` : `${stats}${counters}`;
    const about = `<div class="sklol-section"><div class="sklol-section-title">${t("modal.section.about")}</div><div class="sklol-type"><span class="sklol-type-name">${ICON3.type[cat]}${typeOf(cat)}</span>${pills}${tagSkel}</div></div>`;
    const rows = [];
    if (details?.status) {
      const [label, color] = statusOf(details.status);
      rows.push(
        `<span>${t("modal.row.status")}</span>`,
        `<span class="sklol-status"><i style="background:${color}"></i>${esc(label)}</span>`
      );
    }
    const updated = imported ? "" : formatAgo(details?.updatedAt || mod.updatedAt);
    if (updated)
      rows.push(
        `<span>${t("modal.row.updated")}</span>`,
        `<span>${esc(t("time.ago", { time: updated }))}</span>`
      );
    const published = formatAgo(details?.publishedAt || 0);
    if (published)
      rows.push(
        `<span>${t("modal.row.published")}</span>`,
        `<span>${esc(t("time.ago", { time: published }))}</span>`
      );
    if (details?.license) {
      rows.push(
        `<span>${t("modal.row.license")}</span>`,
        `<span class="sklol-license">${esc(licenseOf(details.license))}</span>`
      );
    }
    if (imported)
      rows.push(
        `<span>${t("modal.row.origin")}</span>`,
        `<span>${t("modal.origin.imported")}</span>`
      );
    const skelRows = ["72%", "58%", "64%", "80%"].map((w) => `${skel("54px", 9)}${skel(w, 12)}`).join("");
    const detailsSection = loading || rows.length ? `<div class="sklol-section"><div class="sklol-section-title">${t("modal.section.details")}</div><div class="sklol-rows">${loading ? skelRows : rows.join("")}</div></div>` : "";
    const people = details?.contributors.length ? details.contributors : mod.publisher ? [{ name: mod.publisher, avatar: "", role: "owner" }] : [];
    const skelPerson = `<div class="sklol-person"><div class="sklol-avatar sklol-skel"></div><div style="flex:1">${skel("55%", 13)}${skel("32%", 10, "margin-top:6px")}</div></div>`;
    const contributors = loading ? `<div class="sklol-section"><div class="sklol-section-title">${t("modal.section.contributors")}</div>${skelPerson}</div>` : people.length ? `<div class="sklol-section"><div class="sklol-section-title">${t("modal.section.contributors")}</div>${people.map((p) => {
      const avatar = p.avatar ? `<img src="${esc(p.avatar)}" alt="" referrerpolicy="no-referrer" decoding="async">` : esc(p.name.charAt(0).toUpperCase());
      const role = roleOf(p.role);
      return `<div class="sklol-person"><div class="sklol-avatar">${avatar}</div><div><strong>${esc(p.name)}</strong>${role ? `<span class="sklol-role">${isOwner(p.role) ? ICON3.crown : ""}${esc(role)}</span>` : ""}</div></div>`;
    }).join("")}</div>` : "";
    const linkButtons = (details?.links ?? []).map((l) => {
      const discord = l.kind === "discord" || /(^|\.)discord\.(gg|com)$/.test(hostOf(l.url));
      return flatButton({
        label: linkLabel(l.url, l.label, l.kind),
        attrs: `data-action="link" data-url="${esc(l.url)}"`,
        className: discord ? "sklol-link-discord" : "",
        content: `${discord ? ICON3.discord : ICON3.link}<span>${esc(linkLabel(l.url, l.label, l.kind))}</span>`
      });
    });
    if (details?.preview) {
      linkButtons.push(
        flatButton({
          label: t("modal.preview"),
          attrs: `data-action="link" data-url="${esc(details.preview)}"`,
          content: `${ICON3.play}<span>${t("modal.preview")}</span>`
        })
      );
    }
    const links = loading ? `<div class="sklol-section"><div class="sklol-section-title">${t("modal.section.links")}</div><div class="sklol-links">${skel("100%", 32)}${skel("100%", 32)}</div></div>` : linkButtons.length ? `<div class="sklol-section"><div class="sklol-section-title">${t("modal.section.links")}</div><div class="sklol-links">${linkButtons.join("")}</div></div>` : "";
    return `<aside class="sklol-side" data-sklol="side">${downloadHtml()}${numbers}${about}${detailsSection}${contributors}${links}</aside>`;
  }
  function render() {
    zoom = null;
    root.innerHTML = `<div class="sklol-modal-frame"><div class="sklol-modal-close" role="button" tabindex="0" aria-label="${t("common.close")}" data-action="close">${ICON3.close}</div><div class="sklol-modal-box">${mainHtml()}${sideHtml()}</div></div>`;
  }
  function reveal() {
    const box = root.querySelector(".sklol-modal-box");
    if (!box) return render();
    const top = box.scrollTop;
    box.innerHTML = mainHtml() + sideHtml();
    box.scrollTop = top;
    for (const part of box.children) part.classList.add("sklol-reveal");
  }
  function renderSide() {
    const side = root.querySelector('[data-sklol="side"]');
    if (!side) return render();
    const template = doc.createElement("template");
    template.innerHTML = sideHtml();
    const fresh = template.content.firstElementChild;
    if (fresh) side.replaceWith(fresh);
  }
  function go(next) {
    const count = images().length;
    if (count === 0) return;
    const previousPage = Math.floor(index / THUMBS_PER_PAGE);
    index = (next % count + count) % count;
    for (const img of root.querySelectorAll("[data-slide]")) {
      img.classList.toggle("active", Number(img.dataset.slide) === index);
    }
    for (const dot of root.querySelectorAll(".sklol-dot")) {
      dot.classList.toggle("active", Number(dot.dataset.index) === index);
    }
    const gallery = root.querySelector('[data-sklol="gallery"]');
    if (gallery) {
      if (Math.floor(index / THUMBS_PER_PAGE) !== previousPage) {
        gallery.innerHTML = galleryInner();
      } else {
        for (const thumb of gallery.querySelectorAll(
          ".sklol-thumb"
        )) {
          thumb.classList.toggle(
            "active",
            Number(thumb.dataset.index) === index
          );
        }
      }
    }
    const pager = root.querySelector('[data-sklol="pager"]');
    if (pager) pager.innerHTML = pagerHtml();
    if (zoom) zoom.innerHTML = zoomImg(images()[index] ?? "");
  }
  const zoomImg = (src) => `<img ${imageAttrs(src)} alt="" referrerpolicy="no-referrer" decoding="async" draggable="false">`;
  function openZoom() {
    const src = images()[index];
    if (!src || zoom) return;
    zoom = doc.createElement("div");
    zoom.className = "sklol-zoom";
    zoom.dataset.action = "unzoom";
    zoom.innerHTML = zoomImg(src);
    root.append(zoom);
  }
  function closeZoom() {
    zoom?.remove();
    zoom = null;
  }
  let timer2 = 0;
  const restartTimer = () => {
    if (timer2) win.clearInterval(timer2);
    timer2 = win.setInterval(() => {
      if (!hovering && !zoom && images().length > 1) go(index + 1);
    }, AUTOPLAY_MS);
  };
  async function openEditor() {
    if (editor) return;
    const entry = await installed4.resolve(mod);
    if (!entry || closed || editor) return;
    editor = openEditDialog(doc, host, entry, installed4, {
      onClose: () => {
        editor = null;
        root.querySelector('[data-action="edit"]')?.focus();
      }
    });
  }
  async function toggleInstall() {
    const wasInstalled = saved.status(mod.id) === "saved";
    await saved.toggle(mod);
    if (imported && wasInstalled && saved.status(mod.id) === "idle") close();
  }
  function onClick(event) {
    const target = event.target;
    if (target === root) return close();
    const button = target.closest("[data-action]");
    const action = button?.dataset.action;
    if (menu && action !== "menu") {
      menu = false;
      renderSide();
    }
    if (!action || !button) return;
    event.stopPropagation();
    switch (action) {
      case "close":
        return close();
      case "prev":
        restartTimer();
        return go(index - 1);
      case "next":
        restartTimer();
        return go(index + 1);
      case "go":
        restartTimer();
        return go(Number(button.dataset.index));
      case "zoom":
        return openZoom();
      case "unzoom":
        return closeZoom();
      case "details":
        return root.querySelector('[data-sklol="about"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
      case "download":
        return void toggleInstall();
      case "edit":
        return void openEditor();
      case "menu":
        menu = !menu;
        return renderSide();
      case "open-page":
        if (details?.page) void openLink(details.page);
        return;
      case "link": {
        const url = button.dataset.url;
        if (url) void openLink(url);
        return;
      }
    }
  }
  function onKey(event) {
    if (editor) return;
    const key2 = event.key;
    if (key2 === "Escape") {
      event.stopPropagation();
      if (zoom) return closeZoom();
      if (menu) {
        menu = false;
        return renderSide();
      }
      return close();
    }
    if (key2 === "ArrowLeft") go(index - 1);
    if (key2 === "ArrowRight") go(index + 1);
    if ((key2 === "Enter" || key2 === " ") && event.target instanceof win.HTMLElement) {
      const el = event.target;
      if (el.matches('[role="button"][data-action]')) {
        event.preventDefault();
        el.click();
      }
    }
  }
  const onOver = (event) => {
    hovering = !!event.target.closest?.('[data-sklol="hero"]');
  };
  const unsubscribeSaved = saved.subscribe(() => {
    if (!closed) renderSide();
  });
  const editKey = () => {
    const entry = installedEntry();
    return entry ? `${entry.name}\0${entry.local.thumbnail}\0${entry.local.customImage}` : "";
  };
  let painted = editKey();
  const unsubscribeInstalled = installed4.subscribe(() => {
    const key2 = editKey();
    if (closed || key2 === painted) return;
    painted = key2;
    index = 0;
    const box = root.querySelector(".sklol-modal-box");
    if (!box) return render();
    const top = box.scrollTop;
    box.innerHTML = mainHtml() + sideHtml();
    box.scrollTop = top;
  });
  const stopImages = watchImages(doc, root);
  function close() {
    if (closed) return;
    closed = true;
    if (timer2) win.clearInterval(timer2);
    editor?.close();
    unsubscribeSaved();
    unsubscribeInstalled();
    stopImages();
    root.removeEventListener("click", onClick);
    root.removeEventListener("mouseover", onOver);
    doc.removeEventListener("keydown", onKey, true);
    root.remove();
    onClose?.();
  }
  render();
  root.addEventListener("click", onClick);
  root.addEventListener("mouseover", onOver);
  doc.addEventListener("keydown", onKey, true);
  host.append(root);
  restartTimer();
  root.querySelector(".sklol-modal-close")?.focus();
  if (!imported) {
    void fetchDetails(mod.source, mod.id).then((found) => {
      if (closed) return;
      details = found;
      loading = false;
      if (index >= images().length) index = 0;
      reveal();
    });
  }
  return { close };
}
function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// src/sklol/store/mods-store.ts
var LOCAL_URL6 = `http://127.0.0.1:${LOCAL_PORT}`;
var ModsError = class extends Error {
  constructor(code, retryAfter) {
    super(code);
    this.code = code;
    this.retryAfter = retryAfter;
  }
};
var isPage = (value) => {
  const page = value;
  return !!page && Array.isArray(page.mods) && typeof page.total === "number" && typeof page.hasMore === "boolean" && Number.isInteger(page.page);
};
async function fetchFromLocal(page, signal, search, source, sort = DEFAULT_SORT, category = DEFAULT_CATEGORY) {
  let response;
  try {
    response = await fetch(
      `${LOCAL_URL6}${modsPath(source, page, search, sort, category)}`,
      {
        signal,
        cache: "no-store"
      }
    );
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ModsError("local_unreachable");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const { error, retryAfter } = body ?? {};
    throw new ModsError(
      typeof error === "string" ? error : "error",
      typeof retryAfter === "number" ? retryAfter : void 0
    );
  }
  if (!isPage(body)) throw new ModsError("bad_response");
  return body;
}
function createModsStore(fetchPage = fetchFromLocal, initial = {}) {
  let mods = [];
  const seen = /* @__PURE__ */ new Set();
  const listeners = /* @__PURE__ */ new Set();
  let search = "";
  let source = initial.source ?? null;
  let sort = initial.sort ?? DEFAULT_SORT;
  let nsfw = initial.nsfw ?? false;
  let category = initial.category ?? DEFAULT_CATEGORY;
  let generation = 0;
  let nextPage = 0;
  let total = 0;
  let hasMore = true;
  let loading = false;
  let error = null;
  let disposed = false;
  let controller = null;
  const build = () => ({
    mods,
    total,
    hasMore,
    loading,
    error,
    search,
    source,
    sort,
    nsfw,
    category,
    generation
  });
  let snapshot = build();
  function emit() {
    snapshot = build();
    for (const listener of listeners) listener();
  }
  async function loadNext() {
    if (disposed || loading || !hasMore || error || source === null) return;
    const request = new AbortController();
    const mine = generation;
    controller = request;
    loading = true;
    emit();
    try {
      const page = await fetchPage(
        nextPage,
        request.signal,
        search,
        source,
        sort,
        category
      );
      if (disposed || mine !== generation) return;
      for (const mod of page.mods) {
        if (!nsfw && mod.nsfw) continue;
        if (seen.has(mod.id)) continue;
        seen.add(mod.id);
        mods.push(mod);
      }
      nextPage = page.page + 1;
      total = page.total;
      hasMore = page.hasMore && nextPage <= MODS_MAX_PAGE;
    } catch (caught) {
      if (disposed || mine !== generation) return;
      error = caught instanceof ModsError ? { code: caught.code, retryAfter: caught.retryAfter } : { code: "error" };
    } finally {
      if (controller === request) controller = null;
      if (!disposed && mine === generation) {
        loading = false;
        emit();
      }
    }
  }
  function reset() {
    controller?.abort();
    controller = null;
    generation++;
    mods = [];
    seen.clear();
    nextPage = 0;
    total = 0;
    hasMore = source !== null;
    loading = false;
    error = null;
    emit();
  }
  return {
    getState: () => snapshot,
    /** Devolve a função que desfaz a inscrição. */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Busca a próxima página, se não houver um pedido em andamento nem um erro pendente. */
    loadNext,
    /**
     * Troca a busca: cancela o pedido em andamento, esvazia a lista e começa da página 0. O
     * mesmo texto (depois de normalizado) não faz nada, então quem chama pode mandar a cada
     * tecla sem se preocupar. Vazio volta pra lista toda.
     */
    search(text) {
      const next = normalizeSearch(text);
      if (disposed || next.toLowerCase() === search.toLowerCase()) {
        return Promise.resolve();
      }
      search = next;
      reset();
      return loadNext();
    },
    /**
     * Troca a fonte das skins: a lista é refeita do zero, com a mesma busca e a mesma
     * ordenação. A mesma fonte não faz nada. `null` esvazia a lista (não há fonte).
     */
    setSource(next) {
      if (disposed || next === source && (next !== null || !hasMore)) {
        return Promise.resolve();
      }
      source = next;
      reset();
      return loadNext();
    },
    /** Troca a categoria: a lista é refeita do zero. A mesma categoria não faz nada. */
    setCategory(next) {
      if (disposed || next === category) return Promise.resolve();
      category = next;
      reset();
      return loadNext();
    },
    /** Troca o campo de ordenação: a lista é refeita do zero. O mesmo campo não faz nada. */
    setSort(next) {
      if (disposed || next === sort) return Promise.resolve();
      sort = next;
      reset();
      return loadNext();
    },
    /**
     * Liga ou desliga as skins de conteúdo adulto. Muda o que entra na lista, então ela é
     * refeita do zero (as páginas vêm do cache do LOCAL). O mesmo valor não faz nada.
     */
    setNsfw(show2) {
      if (disposed || show2 === nsfw) return Promise.resolve();
      nsfw = show2;
      reset();
      return loadNext();
    },
    /** Depois de um erro, limpa e tenta a mesma página de novo. */
    retry() {
      if (!error) return Promise.resolve();
      error = null;
      return loadNext();
    },
    /** Encerra: cancela o pedido em andamento, e nada mais é atualizado. */
    dispose() {
      disposed = true;
      controller?.abort();
      controller = null;
      listeners.clear();
    }
  };
}

// src/sklol/store/search-box.ts
function bindSearchBox(input, { onSearch, delay = 350 }) {
  let timer2;
  let composing = false;
  function cancel() {
    if (timer2 !== void 0) clearTimeout(timer2);
    timer2 = void 0;
  }
  function fire() {
    cancel();
    onSearch(input.value);
  }
  function later() {
    cancel();
    timer2 = setTimeout(fire, delay);
  }
  const onInput = (event) => {
    if (composing || event.isComposing) return;
    if (input.value === "") fire();
    else later();
  };
  const onKeyDown = (event) => {
    if (event.key !== "Enter" || composing || event.isComposing) return;
    event.stopPropagation();
    fire();
  };
  const onCompositionStart = () => {
    composing = true;
    cancel();
  };
  const onCompositionEnd = () => {
    composing = false;
    later();
  };
  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("compositionstart", onCompositionStart);
  input.addEventListener("compositionend", onCompositionEnd);
  return {
    /** Cancela a espera pendente e solta os ouvintes. */
    destroy() {
      cancel();
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeyDown);
      input.removeEventListener("compositionstart", onCompositionStart);
      input.removeEventListener("compositionend", onCompositionEnd);
    }
  };
}

// src/sklol/store/sources-store.ts
var LOCAL_URL7 = `http://127.0.0.1:${LOCAL_PORT}`;
var TIMEOUT_MS7 = 3e4;
var SourcesApiError = class extends Error {
  constructor(code, detail) {
    super(detail ? `${code}: ${detail}` : code);
    this.code = code;
    this.detail = detail;
  }
};
async function call3(method, path, body) {
  let response;
  try {
    response = await fetch(`${LOCAL_URL7}${path}`, {
      method,
      ...body ? {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      } : {},
      signal: AbortSignal.timeout(TIMEOUT_MS7)
    });
  } catch {
    throw new SourcesApiError("local_unreachable");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const { error, detail } = payload ?? {};
    throw new SourcesApiError(
      typeof error === "string" ? error : "bad_response",
      typeof detail === "string" ? detail : void 0
    );
  }
  return payload;
}
var list = async (method, path, body) => {
  const payload = await call3(method, path, body);
  try {
    return parseSourcesList(payload).sources;
  } catch {
    throw new SourcesApiError("bad_response");
  }
};
var localSourcesApi = {
  list: () => list("GET", "/sources"),
  async preview(url) {
    const payload = await call3("POST", "/sources", { url });
    try {
      return parseSourcesPreview(payload);
    } catch {
      throw new SourcesApiError("bad_response");
    }
  },
  confirm: (token) => list("POST", "/sources/confirm", { token }),
  update: (id) => list("POST", `/sources/${encodeURIComponent(id)}/update`),
  remove: (id) => list("DELETE", `/sources/${encodeURIComponent(id)}`)
};
function createSourcesStore(api = localSourcesApi) {
  let state = { sources: [], loaded: false };
  const listeners = /* @__PURE__ */ new Set();
  const set = (sources2) => {
    state = { sources: sources2, loaded: true };
    for (const fn of [...listeners]) fn();
  };
  return {
    getState: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    /** O nome de uma fonte, pra mensagens. */
    name: (id) => state.sources.find((s) => s.id === id)?.name ?? "site",
    /** Lê do LOCAL. Sem resposta, mantém o que já sabia. */
    async refresh() {
      try {
        set(await api.list());
      } catch (error) {
        print.warn("store: n\xE3o li as fontes:", error.message);
        if (!state.loaded) set([]);
      }
    },
    preview: (url) => api.preview(url),
    async confirm(token) {
      set(await api.confirm(token));
    },
    async update(id) {
      set(await api.update(id));
    },
    async remove(id) {
      set(await api.remove(id));
    }
  };
}

// src/sklol/store/sources-panel.ts
var icon6 = (paths, size2 = 16, width = 1.8) => `<svg width="${size2}" height="${size2}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
var ICON4 = {
  // O plugue: uma fonte ligada à loja.
  emblem: icon6(
    '<path d="M9 3v4M15 3v4M6.5 7h11v3a5.5 5.5 0 0 1-11 0zM12 15.5V21"/>',
    28
  ),
  close: icon6('<path d="M6 6l12 12M18 6 6 18"/>', 22, 1.6),
  shield: icon6(
    '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6z"/><path d="M12 8v4.5M12 15.5v.1"/>',
    20
  ),
  link: icon6(
    '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'
  ),
  search: icon6(
    '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    15,
    2
  ),
  server: icon6(
    '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.1M7 16.5h.1"/>',
    12,
    2
  ),
  source: icon6(
    '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
    22,
    1.6
  ),
  lock: icon6(
    '<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    15
  ),
  refresh: icon6(
    '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/>'
  ),
  trash: icon6(
    '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>'
  ),
  check: icon6('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 15, 2.4)
};
var PANEL_STYLE = `.sklol-panel{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(1,10,19,.75)}.sklol-panel-error{display:flex;align-items:center;gap:8px;margin:10px 0;padding:8px 12px;color:#ff9aa8;font-family:'LoL Body',sans-serif;font-size:12px;line-height:1.45;border-left:2px solid #e84057;background:linear-gradient(90deg,rgba(232,64,87,.12),transparent)}.sklol-sidebar,.sklol-sidebar .sidebar-content{height:100%;box-sizing:border-box}.sklol-sidebar .sidebar-content{display:flex;flex-direction:column}@keyframes sklol-src-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.sklol-src-box{display:flex;flex-direction:column}.sklol-src-body{flex:1;min-height:0;margin-right:-14px;padding-right:14px;overflow-x:hidden;overflow-y:auto}.sklol-src-body::-webkit-scrollbar{width:6px}.sklol-src-body::-webkit-scrollbar-thumb{background:#785a28;border-radius:3px}.sklol-src-notice{display:flex;gap:14px;align-items:flex-start;margin:0 0 22px;padding:12px 16px;color:#a09b8c;font-size:12px;line-height:1.55;background:linear-gradient(90deg,rgba(200,170,110,.08),rgba(1,10,19,.2));border-left:2px solid #c8aa6e}.sklol-src-notice svg{flex:none;margin-top:1px;color:#c8aa6e;filter:drop-shadow(0 0 4px rgba(200,170,110,.4))}.sklol-src-add{display:flex;gap:10px;margin:0 0 6px}.sklol-src-field{position:relative;flex:1;min-width:0}.sklol-src-field svg{position:absolute;left:11px;top:50%;margin-top:-8px;color:#785a28;pointer-events:none;transition:color .2s}.sklol-src-field input{width:100%;height:36px;padding:0 12px 0 36px;box-sizing:border-box;color:#f0e6d2;font:13px 'LoL Body',sans-serif;background:#010a13;border:1px solid #463714;outline:none;transition:border-color .2s,box-shadow .2s}.sklol-src-field input::placeholder{color:#5b5a56}.sklol-src-field input:hover{border-color:#785a28}.sklol-src-field input:focus{border-color:#c8aa6e;box-shadow:0 0 0 1px rgba(200,170,110,.25),0 0 12px rgba(200,170,110,.18)}.sklol-src-field:focus-within svg{color:#c8aa6e}.sklol-src-field input:disabled{opacity:.6}.sklol-src-add .lol-uikit-flat-button-normal{min-width:110px}.sklol-src-add .rp-button-text,.sklol-src-preview-actions .rp-button-text{display:inline-flex;align-items:center;gap:7px}.sklol-src-reading{display:flex;align-items:center;justify-content:center;gap:10px;min-width:110px;color:#a09b8c;font-size:12px}.sklol-src-preview{--corner:#0ac8b9;position:relative;margin:14px 0 22px;padding:14px 16px 16px;border:1px solid #0397ab;background:radial-gradient(90% 80% at 50% 0%,rgba(10,200,185,.10),transparent 70%),linear-gradient(180deg,rgba(5,40,55,.5),rgba(1,10,19,.85));box-shadow:0 0 0 1px rgba(10,200,185,.25),0 0 18px rgba(10,200,185,.18);animation:sklol-src-in .25s ease-out}.sklol-src-preview::before{content:"";position:absolute;inset:-1px;pointer-events:none;--arm:10px;${CORNERS}}.sklol-src-preview-title{margin-bottom:10px;color:#cdfafa;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.sklol-src-note{display:flex;align-items:center;gap:8px;margin:12px 0 14px;color:#a09b8c;font-size:12px;line-height:1.45}.sklol-src-note svg{flex:none;color:#0ac8b9}.sklol-src-preview-actions{display:flex;gap:12px;justify-content:flex-end}.sklol-src-preview-actions .lol-uikit-flat-button-normal{min-width:140px}.sklol-src-list{display:flex;flex-direction:column;gap:10px;margin:0 0 6px;padding:0;list-style:none}.sklol-src-card{--corner:#785a28;position:relative;display:flex;gap:14px;align-items:flex-start;padding:12px 14px;background:linear-gradient(90deg,rgba(30,35,40,.9),rgba(10,20,30,.9));border:1px solid #463714;transition:border-color .2s,box-shadow .2s,transform .2s;animation:sklol-src-in .25s ease-out both}.sklol-src-card::before{content:"";position:absolute;inset:-1px;pointer-events:none;--arm:8px;${CORNERS}}.sklol-src-card:hover{--corner:#c8aa6e;border-color:#785a28;box-shadow:0 6px 16px rgba(0,0,0,.35),inset 0 0 18px rgba(200,170,110,.06)}.sklol-src-card:nth-child(2){animation-delay:.04s}.sklol-src-card:nth-child(3){animation-delay:.08s}.sklol-src-preview .sklol-src-card{background:rgba(1,10,19,.6);border-color:rgba(3,151,171,.5)}.sklol-src-icon{flex:none;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;color:#c8aa6e;background:radial-gradient(circle,#1e2328 0%,#010a13 75%);border:1px solid #785a28;box-shadow:0 0 0 2px #010a13,0 0 0 3px #463714}.sklol-src-info{flex:1;min-width:0}.sklol-src-name{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.sklol-src-name strong{color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:15px;font-weight:700;letter-spacing:.04em}.sklol-src-version{padding:1px 7px;color:#cdbe91;font-size:11px;border:1px solid #463714;background:#010a13}.sklol-src-id{color:#5b5a56;font-size:11px}.sklol-src-hosts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.sklol-src-host{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;color:#a09b8c;font-size:11px;border:1px solid #3c3222;background:rgba(1,10,19,.6)}.sklol-src-host svg{color:#785a28}.sklol-src-origin{margin-top:6px;color:#5b5a56;font-size:11px;word-break:break-all}.sklol-src-actions{flex:none;display:flex;gap:6px}.sklol-src-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;color:#a09b8c;background:radial-gradient(circle,#0b2a3a 0%,#031520 70%);border:1px solid #785a28;cursor:pointer;outline:none;transition:color .15s,border-color .15s,box-shadow .15s,transform .15s}.sklol-src-btn svg{transition:transform .3s ease}.sklol-src-btn:hover,.sklol-src-btn:focus-visible{color:#f0e6d2;border-color:#c8aa6e;box-shadow:0 0 10px rgba(200,170,110,.35);transform:translateY(-2px)}.sklol-src-btn:active{transform:none}.sklol-src-btn[data-action="update"]:hover svg{transform:rotate(180deg)}.sklol-src-btn.danger:hover,.sklol-src-btn.danger:focus-visible{color:#ff9aa8;border-color:#e84057;box-shadow:0 0 10px rgba(232,64,87,.35)}.sklol-src-busy .sklol-src-btn,.sklol-src-busy .sklol-src-add .lol-uikit-flat-button-normal{pointer-events:none;opacity:.45}.sklol-src-count{margin-left:-4px;padding:0 7px;color:#010a13;font-size:11px;letter-spacing:0;background:#c8aa6e;border-radius:8px}.sklol-src-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:22px 16px;text-align:center;color:#7e7e7e;font-size:12px;border:1px dashed #463714;background:rgba(1,10,19,.4)}.sklol-src-empty svg{color:#785a28}.sklol-src-empty strong{color:#cdbe91;font-family:'LoL Display','Beaufort for LOL',serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase}@media (prefers-reduced-motion:reduce){.sklol-src-preview,.sklol-src-card{animation:none}.sklol-src-btn,.sklol-src-btn svg{transition:none}}`;
function describe2(error) {
  const fallback = t("common.somethingWrong");
  if (!(error instanceof SourcesApiError)) return fallback;
  const text = tOr(`sources.error.${error.code}`, fallback);
  return error.detail ? `${text} (${error.detail})` : text;
}
function sourceCard(source, actions) {
  const id = esc(source.id);
  const hosts = source.hosts.map((h) => `<span class="sklol-src-host">${ICON4.server}${esc(h)}</span>`).join("");
  const buttons = actions ? `<div class="sklol-src-actions"><div class="sklol-src-btn" role="button" tabindex="0" aria-label="${t("sources.update")}" title="${t("sources.update")}" data-action="update" data-id="${id}">${ICON4.refresh}</div><div class="sklol-src-btn danger" role="button" tabindex="0" aria-label="${t("sources.remove")}" title="${t("sources.remove")}" data-action="remove" data-id="${id}">${ICON4.trash}</div></div>` : "";
  return `<li class="sklol-src-card"><div class="sklol-src-icon">${ICON4.source}</div><div class="sklol-src-info"><div class="sklol-src-name"><strong>${esc(source.name)}</strong><span class="sklol-src-version">v${esc(source.version)}</span><span class="sklol-src-id">${id}</span></div><div class="sklol-src-hosts" title="${t("sources.hosts")}">${hosts}</div><div class="sklol-src-origin">${esc(source.origin)}</div></div>${buttons}</li>`;
}
function openSourcesPanel(doc, host, sources2) {
  const panel2 = doc.createElement("div");
  panel2.className = "sklol-panel";
  let preview = null;
  let busy = false;
  let error = "";
  let url = "";
  panel2.innerHTML = `<div class="sklol-import-box sklol-src-box" role="dialog" aria-label="${t("sources.title")}"><div class="sklol-import-head"><div class="sklol-import-emblem">${ICON4.emblem}</div><div><h3 class="sklol-import-title">${t("sources.title")}</h3><div class="sklol-import-sub">${t("sources.sub")}</div></div><a class="sklol-import-close" href="#" role="button" aria-label="${t("common.close")}" data-action="close">${ICON4.close}</a></div><div class="sklol-src-body" data-sklol="sources-body"></div></div>`;
  const body = panel2.querySelector('[data-sklol="sources-body"]');
  const box = panel2.querySelector(".sklol-src-box");
  function render() {
    if (!body) return;
    const installed4 = sources2.getState().sources;
    const notice = `<div class="sklol-src-notice">${ICON4.shield}<p style="margin:0">${esc(t("sources.terms"))}</p></div>`;
    const read = busy ? `<div class="sklol-src-reading"><div style="position: relative; width: 22px; height: 22px;"><div class="loading-spinner"></div></div>${t("sources.reading")}</div>` : flatButton({
      label: t("sources.read"),
      attrs: 'data-action="preview"',
      content: `${ICON4.search}${t("sources.read")}`
    });
    const add = `<div class="sklol-import-label">${t("sources.add")}</div><div class="sklol-src-add"><label class="sklol-src-field">${ICON4.link}<input type="url" placeholder="${t("sources.placeholder")}" data-sklol="source-url" spellcheck="false" autocomplete="off" aria-label="${t("sources.placeholder")}" value="${esc(url)}"${busy ? " disabled" : ""}></label>${read}</div>${error ? `<div class="sklol-panel-error">${esc(error)}</div>` : ""}`;
    const previewHtml = preview ? `<div class="sklol-src-preview"><div class="sklol-src-preview-title">${t("sources.brings")}</div><ul class="sklol-src-list">${preview.sources.map((s) => sourceCard(s, false)).join("")}</ul><div class="sklol-src-note">${ICON4.lock}${t("sources.accessNote")}</div><div class="sklol-src-preview-actions">${flatButton({ label: t("common.cancel"), attrs: 'data-action="cancel"' })}${flatButton({ label: t("sources.confirm"), attrs: 'data-action="confirm"', content: `${ICON4.check}${t("sources.confirm")}` })}</div></div>` : "";
    const list2 = installed4.length ? `<ul class="sklol-src-list">${installed4.map((s) => sourceCard(s, true)).join("")}</ul>` : `<div class="sklol-src-empty">${icon6('<path d="M9 3v4M15 3v4M6.5 7h11v3a5.5 5.5 0 0 1-11 0zM12 15.5V21"/>', 26, 1.6)}<strong>${t("sources.none")}</strong>${t("sources.noneHint")}</div>`;
    const installedHtml = `<div class="sklol-import-label">${t("sources.installed")}${installed4.length ? `<span class="sklol-src-count">${installed4.length}</span>` : ""}</div>${list2}`;
    body.innerHTML = `${notice}${add}${previewHtml}${installedHtml}`;
    box?.classList.toggle("sklol-src-busy", busy);
  }
  async function run(action) {
    if (busy) return;
    busy = true;
    error = "";
    render();
    try {
      await action();
    } catch (caught) {
      error = describe2(caught);
    } finally {
      busy = false;
      render();
    }
  }
  function onClick(event) {
    const target = event.target;
    if (target === panel2) return close();
    const button = target.closest("[data-action]");
    const action = button?.dataset.action;
    if (button?.tagName === "A") event.preventDefault();
    if (!action) return;
    if (action === "close") return close();
    if (busy) return;
    const id = button?.dataset.id ?? "";
    if (action === "cancel") {
      preview = null;
      return render();
    }
    if (action === "preview") {
      const wanted = url.trim();
      if (!wanted) {
        panel2.querySelector('[data-sklol="source-url"]')?.focus();
        return;
      }
      void run(async () => {
        preview = null;
        preview = await sources2.preview(wanted);
      });
    }
    if (action === "confirm" && preview) {
      const { token } = preview;
      void run(async () => {
        await sources2.confirm(token);
        preview = null;
        url = "";
      });
    }
    if (action === "update") void run(() => sources2.update(id));
    if (action === "remove") void run(() => sources2.remove(id));
  }
  function onInput(event) {
    const target = event.target;
    if (target.dataset.sklol === "source-url") url = target.value;
  }
  function onKey(event) {
    const e = event;
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    const target = e.target;
    if (e.key === "Enter" && target?.matches?.('[data-sklol="source-url"]')) {
      e.preventDefault();
      panel2.querySelector('[data-action="preview"]')?.click();
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && target?.matches?.('[role="button"][data-action]')) {
      e.preventDefault();
      target.click();
    }
  }
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    panel2.removeEventListener("click", onClick);
    panel2.removeEventListener("keydown", onKey);
    panel2.removeEventListener("input", onInput);
    panel2.remove();
  }
  render();
  panel2.addEventListener("click", onClick);
  panel2.addEventListener("keydown", onKey);
  panel2.addEventListener("input", onInput);
  host.append(panel2);
  panel2.querySelector('[data-sklol="source-url"]')?.focus();
  return { close };
}

// src/sklol/store/virtual-window.ts
/*!
 * A conta da lista virtual, sem DOM: dado onde a rolagem está, quais linhas precisam existir.
 * Fica separada do elemento pra poder ser testada só com números.
 */
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
function computeWindow({
  scrollTop,
  viewportHeight,
  rowHeight,
  rowCount,
  overscan
}) {
  if (rowCount <= 0 || rowHeight <= 0) {
    return { first: 0, last: -1, before: 0, after: 0 };
  }
  const top = Math.max(0, scrollTop);
  const height = Math.max(viewportHeight, rowHeight);
  const firstVisible = Math.floor(top / rowHeight);
  const lastVisible = Math.ceil((top + height) / rowHeight) - 1;
  const first = clamp(firstVisible - overscan, 0, rowCount - 1);
  const last = clamp(lastVisible + overscan, first, rowCount - 1);
  return {
    first,
    last,
    before: first * rowHeight,
    after: (rowCount - 1 - last) * rowHeight
  };
}
function nearEnd({
  scrollTop,
  viewportHeight,
  rowHeight,
  rowCount,
  prefetchRows
}) {
  const remaining = rowCount * rowHeight - (scrollTop + viewportHeight);
  return remaining <= prefetchRows * rowHeight;
}

// src/sklol/store/virtual-grid.ts
var ATTACH_TIMEOUT_MS = 2e3;
function statusOf2(state) {
  if (state.error) return "error";
  if (state.hasMore) return "loading";
  return state.mods.length === 0 ? "empty" : null;
}
function createVirtualGrid({
  doc,
  scroller,
  store,
  columns,
  rowHeight,
  overscan = 2,
  prefetchRows = 3,
  fallbackHeight,
  renderCard,
  renderStatus,
  onSelect,
  onMenu
}) {
  const win = doc.defaultView ?? window;
  const top = doc.createElement("div");
  const list2 = doc.createElement("div");
  const bottom = doc.createElement("div");
  scroller.replaceChildren(top, list2, bottom);
  scroller.style.overflowAnchor = "none";
  const rows = /* @__PURE__ */ new Map();
  const template = doc.createElement("template");
  let frame = 0;
  let destroyed = false;
  let attached = false;
  const createdAt = Date.now();
  let generation = store.getState().generation;
  let heightBefore = -1;
  let heightAfter = -1;
  let viewport = fallbackHeight;
  function rowHtml(index, state, itemRows) {
    const style = `height: ${rowHeight}px;`;
    if (index < itemRows) {
      const from = index * columns;
      const cards = state.mods.slice(from, from + columns).map((mod, offset) => renderCard(mod, from + offset)).join("");
      return `<div class="item-row" style="${style}">${cards}</div>`;
    }
    const kind = statusOf2(state) ?? "empty";
    const height = itemRows === 0 ? viewport : rowHeight;
    return `<div class="item-row" role="status" style="height: ${height}px; display: flex; align-items: center; justify-content: center;">${renderStatus(kind, state)}</div>`;
  }
  function signature(index, state, itemRows) {
    if (index < itemRows) {
      return `items:${Math.min(columns, state.mods.length - index * columns)}`;
    }
    return `status:${statusOf2(state)}:${state.error?.code ?? ""}:${itemRows === 0 ? viewport : ""}`;
  }
  function build(index, state, itemRows) {
    template.innerHTML = rowHtml(index, state, itemRows);
    const row = template.content.firstElementChild;
    row.dataset.signature = signature(index, state, itemRows);
    return row;
  }
  function update() {
    frame = 0;
    if (destroyed) return;
    if (!scroller.isConnected) {
      if (attached) destroy();
      else if (Date.now() - createdAt < ATTACH_TIMEOUT_MS) schedule();
      return;
    }
    attached = true;
    const state = store.getState();
    if (state.generation !== generation) {
      generation = state.generation;
      for (const row of rows.values()) row.remove();
      rows.clear();
      scroller.scrollTop = 0;
    }
    const itemRows = Math.ceil(state.mods.length / columns);
    const rowCount = itemRows + (statusOf2(state) ? 1 : 0);
    const scrollTop = scroller.scrollTop;
    const viewportHeight = scroller.clientHeight || fallbackHeight;
    viewport = viewportHeight;
    const view2 = computeWindow({
      scrollTop,
      viewportHeight,
      rowHeight,
      rowCount,
      overscan
    });
    if (view2.before !== heightBefore) {
      top.style.height = `${view2.before}px`;
      heightBefore = view2.before;
    }
    if (view2.after !== heightAfter) {
      bottom.style.height = `${view2.after}px`;
      heightAfter = view2.after;
    }
    for (const [index, row] of rows) {
      if (index < view2.first || index > view2.last) {
        row.remove();
        rows.delete(index);
      }
    }
    let cursor = list2.firstElementChild;
    for (let index = view2.first; index <= view2.last; index++) {
      let row = rows.get(index);
      if (row && row.dataset.signature !== signature(index, state, itemRows)) {
        const fresh = build(index, state, itemRows);
        row.replaceWith(fresh);
        rows.set(index, fresh);
        row = fresh;
      }
      if (row) {
        cursor = row.nextElementSibling;
        continue;
      }
      row = build(index, state, itemRows);
      rows.set(index, row);
      list2.insertBefore(row, cursor);
    }
    if (state.hasMore && !state.loading && !state.error && nearEnd({
      scrollTop,
      viewportHeight,
      rowHeight,
      rowCount: itemRows,
      prefetchRows
    })) {
      store.loadNext();
    }
  }
  function schedule() {
    if (frame || destroyed) return;
    frame = win.requestAnimationFrame(update);
  }
  function modAt(event) {
    const card2 = event.target.closest("[data-index]");
    if (!card2 || !scroller.contains(card2)) return void 0;
    return store.getState().mods[Number(card2.dataset.index)];
  }
  function onClick(event) {
    const target = event.target;
    if (target.closest("[data-action=retry]")) {
      event.stopPropagation();
      store.retry();
      return;
    }
    const mod = modAt(event);
    if (!mod) return;
    event.stopPropagation();
    onSelect(mod);
  }
  function onContextMenu(event) {
    const mod = onMenu && modAt(event);
    if (!mod) return;
    event.stopPropagation();
    onMenu(mod, event);
  }
  scroller.addEventListener("scroll", schedule, { passive: true });
  scroller.addEventListener("click", onClick, true);
  scroller.addEventListener("contextmenu", onContextMenu, true);
  const observer = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(schedule) : null;
  observer?.observe(scroller);
  const unsubscribe = store.subscribe(schedule);
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (frame) win.cancelAnimationFrame(frame);
    scroller.removeEventListener("scroll", schedule);
    scroller.removeEventListener("click", onClick, true);
    scroller.removeEventListener("contextmenu", onContextMenu, true);
    observer?.disconnect();
    unsubscribe();
    store.dispose();
    rows.clear();
  }
  schedule();
  return { destroy };
}

// src/sklol/store/page.ts
var CHROMA_CARD = "/fe/lol-store/storefront/addon/public/img/bg-chroma-card.jpg";
var DOWNLOAD_ICON = "//plugins/sklol/assets/store/download.svg";
var EMPTY_STYLE = `@keyframes sklol-empty-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes sklol-empty-ring{0%{opacity:.8;transform:scale(.92)}100%{opacity:0;transform:scale(1.3)}}.sklol-empty{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:460px;padding:0 16px;text-align:center;animation:sklol-empty-in .35s ease-out both}.sklol-empty-emblem{position:relative;display:flex;align-items:center;justify-content:center;width:66px;height:66px;margin-bottom:8px;border-radius:50%;color:#c8aa6e;background:radial-gradient(circle,#1e2328 0%,#010a13 75%);border:2px solid #785a28;box-shadow:0 0 0 3px #010a13,0 0 0 4px #463714,inset 0 0 16px rgba(200,170,110,.15)}.sklol-empty-emblem::after{content:"";position:absolute;inset:-9px;border:1px solid rgba(200,170,110,.4);border-radius:50%;animation:sklol-empty-ring 2.4s ease-out infinite;pointer-events:none}.sklol-empty-emblem svg{width:30px;height:30px;filter:drop-shadow(0 0 5px rgba(200,170,110,.45))}.sklol-empty.error .sklol-empty-emblem{color:#e84057;border-color:#7a2230;box-shadow:0 0 0 3px #010a13,0 0 0 4px #3a1219,inset 0 0 16px rgba(232,64,87,.15)}.sklol-empty.error .sklol-empty-emblem::after{border-color:rgba(232,64,87,.4)}.sklol-empty.error .sklol-empty-emblem svg{filter:drop-shadow(0 0 5px rgba(232,64,87,.45))}.sklol-empty-title{color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:18px;font-weight:700;letter-spacing:.08em;line-height:1.2;text-transform:uppercase}.sklol-empty-rule{width:90px;height:1px;background:linear-gradient(90deg,transparent,#c8aa6e,transparent)}.sklol-status-text{max-width:420px;color:#a09b8c;font-family:'LoL Body','Spiegel',sans-serif;font-size:13px;letter-spacing:.02em;line-height:1.55;text-align:center}.sklol-empty .sklol-retry{margin:8px 0 0}`;
var CARD_STYLE = `@keyframes sklol-card-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes sklol-badge-pop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.08)}100%{opacity:1;transform:none}}@keyframes sklol-badge-pulse{50%{opacity:.55}}[data-sklol=scroller] .item-row{overflow:visible}[data-sklol=scroller] .item{position:relative;animation:sklol-card-in .3s ease-out both;transition:transform .2s cubic-bezier(.2,.8,.3,1.2),box-shadow .2s,filter .2s}[data-sklol=scroller] .item:nth-child(2){animation-delay:.04s}[data-sklol=scroller] .item:nth-child(3){animation-delay:.08s}[data-sklol=scroller] .item:hover{z-index:1;transform:translateY(-4px);box-shadow:0 10px 22px rgba(0,0,0,.55),0 0 14px rgba(200,170,110,.22)}[data-sklol=scroller] .item:active{transform:translateY(-1px) scale(.985);transition-duration:.08s}[data-sklol=scroller] .item-image img{transition:transform .35s ease}[data-sklol=scroller] .item:hover .item-image img{transform:scale(1.06)}[data-sklol=scroller] .sklol-nsfw:hover .item-image img{transform:scale(1.06)}.sklol-card-frame{position:absolute;inset:0;z-index:2;pointer-events:none;border:1px solid #785a28;opacity:0;transition:opacity .2s,border-color .2s}.sklol-card-frame::before{content:"";position:absolute;inset:3px;--corner:#c8aa6e;--arm:12px;${CORNERS}}[data-sklol=scroller] .item:hover .sklol-card-frame{opacity:1;border-color:#c8aa6e}[data-sklol=scroller] .item-name{transition:color .2s,text-shadow .2s}[data-sklol=scroller] .item:hover .item-name{color:#f0e6d2;text-shadow:0 0 8px rgba(200,170,110,.5)}[data-sklol=scroller] .sklol-saved{animation:sklol-badge-pop .28s ease-out both}[data-sklol=scroller] .sklol-saved-busy{animation:sklol-badge-pop .28s ease-out both,sklol-badge-pulse 1s ease-in-out .3s infinite}@media (prefers-reduced-motion:reduce){[data-sklol=scroller] *{animation:none!important;transition:none!important}}`;
var STYLE = `<style>.item-download{display:inline-block;width:14px;height:14px;vertical-align:middle;background:url('${DOWNLOAD_ICON}') center/contain no-repeat}.item-row .item{cursor:pointer;pointer-events:auto}${EMPTY_STYLE}.sklol-retry{margin-left:16px}.sklol-nsfw .item-image img{filter:blur(18px);transform:scale(1.15);transition:filter .5s ease,transform .5s ease}.sklol-nsfw:hover .item-image img{filter:blur(0);transform:scale(1)}.sklol-saved-ok,.sklol-applied{background:#0acf83;color:#010a13}.hextech-ui-badge.sklol-origin-badge{background:linear-gradient(180deg,#0b3a47,#06232c);color:#cdfafa;box-shadow:inset 0 0 0 1px #0397ab,0 0 6px rgba(10,200,185,.25)}.sklol-saved-busy .badge-text{letter-spacing:1px}${CARD_STYLE}${BUTTON_STYLE}${PANEL_STYLE}${SETTINGS_STYLE}${SIDEBAR_STYLE}${MODAL_STYLE}${MOD_MENU_STYLE}${IMPORT_STYLE}${IMPORT_STEP_STYLE}${EDIT_STYLE}${TOOLTIP_STYLE}</style>`;
var CARD_WIDTH = 260;
var CARD_HEIGHT = 146;
var COLUMNS = 3;
var ROW_HEIGHT = 155;
var GRID_HEIGHT = 570;
function badge(mod) {
  const age = formatAge(mod.updatedAt);
  if (!age) return "";
  const recent = isRecent(mod.updatedAt);
  return `<div class="hextech-ui-badge background-${recent ? "yellow" : "grey"} ${recent ? "clock-dark" : "clock"}"><span class="badge-text">${esc(age)}</span></div>`;
}
function originBadge() {
  return `<div class="hextech-ui-badge background-grey sklol-origin-badge" title="${esc(t("badge.importedTitle"))}"><span class="badge-text">${esc(t("badge.imported"))}</span></div>`;
}
function nsfwBadge(mod) {
  if (!mod.nsfw) return "";
  return `<div class="hextech-ui-badge background-grey sklol-nsfw-badge" title="${esc(t("badge.nsfwTitle"))}" style="background: #a61e33;"><span class="badge-text">+18</span></div>`;
}
function savedBadge(status, reason) {
  if (status === "idle") return "";
  const [text, cls, title] = status === "saved" ? [t("badge.installed"), "sklol-saved-ok", t("badge.installedTitle")] : status === "busy" ? ["\u2026", "background-grey sklol-saved-busy", t("common.wait")] : [t("badge.error"), "background-red", savedError(reason)];
  return `<div class="hextech-ui-badge sklol-saved ${cls}" title="${esc(title)}"><span class="badge-text">${text}</span></div>`;
}
function card(mod, index, left, { width, height } = { width: CARD_WIDTH, height: CARD_HEIGHT }) {
  const image = `<img ${imageAttrs(modImage(mod))} alt="" referrerpolicy="no-referrer" decoding="async" draggable="false" style="display: block; width: 100%; height: ${height}px; object-fit: cover;">`;
  const subtitle = mod.champions.join(", ") || mod.publisher;
  const imported = mod.source === IMPORTED_SOURCE;
  const right = imported ? originBadge() : badge(mod);
  const pricing = imported ? "" : `<div class="item-pricing"><div class="item-price"><i class="item-download"></i><div class="price-text price-rp"><span>${formatCount(mod.downloads)}</span></div></div></div>`;
  return `<div class="item${mod.nsfw ? " sklol-nsfw" : ""}" data-index="${index}" data-mod-id="${esc(mod.id)}" title="${esc(mod.name)}" style="width: ${width}px; height: ${height}px; overflow: hidden;"><div data-testid="item-badges" class="item-badges"><div data-testid="left-badges" class="badges-group left-aligned">${left}</div><div data-testid="right-badges" class="badges-group right-aligned">${nsfwBadge(mod)}${right}</div></div><span class="label"></span><i class="sklol-card-frame" aria-hidden="true"></i><div class="item-image composite"><div style="background-image: url('${CHROMA_CARD}');"></div><div>${image}</div></div><div class="item-overlay"><div class="item-info"><p class="item-name">${esc(mod.name)}</p><div class="item-price-container clearfix" style="justify-content: flex-start; padding-left: 4px; padding-right: 4px; box-sizing: border-box;">${pricing}<div class="action-text" style="color: #a09b8c;">${esc(subtitle)}</div></div></div></div></div>`;
}
function leftBadge(id, saved, tab, installed4) {
  const status = saved.status(id);
  if (tab === "installed" && status === "saved")
    return appliedBadge(id, installed4);
  return savedBadge(status, saved.reason(id));
}
function appliedBadge(id, installed4) {
  const status = installed4.applyStatus(id);
  if (status === "idle") return "";
  const [text, cls, title] = status === "applied" ? [t("badge.applied"), "sklol-applied", t("badge.appliedTitle")] : status === "busy" ? ["\u2026", "background-grey sklol-saved-busy", t("common.wait")] : [
    t("badge.error"),
    "background-red",
    installed4.applyError(id) ? savedError(installed4.applyError(id)) : t("applied.error.fallback")
  ];
  return `<div class="hextech-ui-badge sklol-saved ${cls}" title="${esc(title)}"><span class="badge-text">${text}</span></div>`;
}
var NOT_RETRYABLE = /* @__PURE__ */ new Set(["search_blocked", "invalid_search"]);
function describe3(error, source) {
  return tOr(`list.error.${error.code}`, t("list.error.fallback"), {
    seconds: error.retryAfter ?? 60,
    source
  });
}
var emptyIcon = (paths) => `<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
var EMPTY_ICONS = {
  // A lupa com um traço: a busca não achou nada.
  search: emptyIcon(
    '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M8 10.5h5"/>'
  ),
  // O plugue solto: nenhuma fonte ligada.
  source: emptyIcon(
    '<path d="M9 3v4M15 3v4M6.5 7h11v3a5.5 5.5 0 0 1-11 0zM12 15.5V21"/>'
  ),
  // A bandeja vazia de receber: nada instalado ainda.
  installed: emptyIcon(
    '<path d="M3 13.5 5.5 5h13l2.5 8.5V19H3z"/><path d="M3 13.5h5l1.5 2.5h5l1.5-2.5h5M12 8v4.5M9.8 10.3 12 12.5l2.2-2.2"/>'
  ),
  // O alerta: algo deu errado.
  error: emptyIcon(
    '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.2v.1"/>'
  )
};
function emptyState(icon7, title, text, { extra = "", error = false } = {}) {
  return `<div class="sklol-empty${error ? " error" : ""}"><div class="sklol-empty-emblem">${icon7}</div><strong class="sklol-empty-title">${title}</strong><i class="sklol-empty-rule"></i><span class="sklol-status-text">${text}</span>${extra}</div>`;
}
var orOther = (category) => category === ALL_CATEGORY ? "" : t("empty.orOther");
var spinner = `<div style="position: relative; width: 40px; height: 40px;"><div class="loading-spinner"></div></div>`;
function errorStatus(state, sources2) {
  const error = state.error;
  if (!error) return "";
  const retry = NOT_RETRYABLE.has(error.code) ? "" : flatButton({
    label: t("common.retry"),
    attrs: 'data-action="retry"',
    className: "sklol-retry"
  });
  const text = esc(describe3(error, sources2.name(state.source)));
  if (state.mods.length > 0) {
    return `<span class="sklol-status-text">${text}</span>${retry}`;
  }
  return emptyState(EMPTY_ICONS.error, t("empty.error.title"), text, {
    extra: retry,
    error: true
  });
}
function storeStatus(kind, state, sources2) {
  if (kind === "empty" && state.source === null) {
    return emptyState(
      EMPTY_ICONS.source,
      t("empty.noSource.title"),
      t("empty.noSource.text")
    );
  }
  if (kind === "loading") return spinner;
  if (kind === "empty" || !state.error) {
    const source = esc(sources2.name(state.source));
    if (state.search) {
      return emptyState(
        EMPTY_ICONS.search,
        t("empty.search.title"),
        t("empty.store.search", {
          query: esc(state.search),
          orOther: orOther(state.category)
        })
      );
    }
    return emptyState(
      CATEGORY_ICONS[state.category],
      t("empty.nothing.title"),
      state.category === ALL_CATEGORY ? t("empty.store.all", { source }) : t("empty.store.category", {
        source,
        category: categoryLabel(state.category)
      })
    );
  }
  return errorStatus(state, sources2);
}
function installedStatus(kind, state, sources2, installedCount) {
  if (kind === "loading") return spinner;
  if (kind === "empty" || !state.error) {
    if (installedCount === 0) {
      return emptyState(
        EMPTY_ICONS.installed,
        t("empty.installed.none.title"),
        t("empty.installed.none.text", {
          extensions: IMPORT_EXTENSIONS.join(", ")
        })
      );
    }
    const where = state.category === ALL_CATEGORY ? "" : t("empty.in", { category: categoryLabel(state.category) });
    if (state.search) {
      return emptyState(
        EMPTY_ICONS.search,
        t("empty.search.title"),
        t("empty.installed.search", {
          where,
          query: esc(state.search),
          orOther: orOther(state.category)
        })
      );
    }
    const have = tn("empty.installed.count", installedCount);
    return emptyState(
      CATEGORY_ICONS[state.category],
      t("empty.nothing.title"),
      state.category === ALL_CATEGORY ? t("empty.installed.all", { have }) : t("empty.installed.category", { have, where })
    );
  }
  return errorStatus(state, sources2);
}
function gridShell(height = GRID_HEIGHT) {
  return `<div class="item-page-items-container-wrapper"><div class="items-container"><div class="items-grid-wrap"><div class="items-grid clearfix"><div data-sklol="scroller" style="height: ${height}px; overflow-x: hidden; overflow-y: scroll;"></div></div></div></div><div class="items-container-loading-overlay"></div></div>`;
}
function storeModel(store, sources2) {
  return {
    tab: "store",
    state() {
      const { sort, nsfw, category, source } = store.getState();
      return {
        sort,
        nsfw,
        category,
        sources: sources2.getState().sources.map((s) => ({
          id: s.id,
          name: s.name,
          checked: s.id === source
        }))
      };
    },
    subscribe(fn) {
      const a = store.subscribe(fn);
      const b = sources2.subscribe(fn);
      return () => {
        a();
        b();
      };
    },
    setSort: (sort) => void store.setSort(sort),
    setNsfw: (show2) => void store.setNsfw(show2),
    setCategory: (category) => void store.setCategory(category),
    toggleSource(id, checked) {
      if (!checked) return;
      if (sources2.getState().sources.some((s) => s.id === id)) {
        void store.setSource(id);
      }
    }
  };
}
function installedModel(store, list2, sources2) {
  const names = () => {
    const out = /* @__PURE__ */ new Map();
    for (const s of sources2.getState().sources) out.set(s.id, s.name);
    for (const m of list2.getState().mods) {
      if (m.source !== IMPORTED_SOURCE && !out.has(m.source))
        out.set(m.source, m.source);
    }
    out.set(IMPORTED_SOURCE, t("source.imported"));
    return out;
  };
  return {
    tab: "installed",
    state() {
      const view2 = store.view();
      return {
        sort: view2.sort,
        nsfw: view2.nsfw,
        category: view2.category,
        sources: [...names()].map(([id, name]) => ({
          id,
          name,
          checked: !view2.excluded.includes(id)
        }))
      };
    },
    subscribe(fn) {
      const a = store.subscribe(fn);
      const b = sources2.subscribe(fn);
      return () => {
        a();
        b();
      };
    },
    setSort: (sort) => void store.setSort(sort),
    setNsfw: (show2) => void store.setNsfw(show2),
    setCategory: (category) => void store.setCategory(category),
    toggleSource: (id, checked) => void store.setSourceShown(id, checked)
  };
}
function renderStorePage(doc, onSelect, saved, sources2, view2 = initialView(), extras = {}) {
  const installed4 = extras.installed ?? createInstalledList();
  let tab = extras.tab ?? initialTab();
  let modal = null;
  let panel2 = null;
  const unbindTooltips = bindTooltips(doc);
  const openMod = (mod) => {
    onSelect(mod);
    modal?.close();
    modal = openModModal(doc, doc.body, mod, {
      saved,
      installed: installed4,
      onClose: () => {
        modal = null;
      }
    });
  };
  let inner = tab === "installed" ? buildInstalled() : buildStore(view2);
  const fragment = inner.fragment;
  let nodes = [...fragment.childNodes];
  function navigate(next) {
    if (next === tab) return;
    tab = next;
    rememberTab(tab);
    const parent = nodes[0]?.parentNode;
    panel2?.close();
    inner.destroy();
    inner = tab === "installed" ? buildInstalled() : buildStore(initialView());
    const fresh = [...inner.fragment.childNodes];
    if (parent) {
      parent.insertBefore(inner.fragment, nodes[0] ?? null);
      for (const node of nodes) node.parentNode?.removeChild(node);
    }
    nodes = fresh;
  }
  function mount(store, model, status, actions) {
    const template = doc.createElement("template");
    template.innerHTML = sidebarHtml(model) + gridShell() + STYLE;
    const content = template.content;
    const scroller = content.querySelector(
      "[data-sklol=scroller]"
    );
    if (!scroller) throw new Error("a grade n\xE3o tem \xE1rea de rolagem");
    const menu = createModMenu(doc, { host: doc.body, saved, installed: installed4 });
    const grid = createVirtualGrid({
      doc,
      scroller,
      store,
      columns: COLUMNS,
      rowHeight: ROW_HEIGHT,
      fallbackHeight: GRID_HEIGHT,
      renderCard: (mod, index) => card(mod, index, leftBadge(mod.id, saved, model.tab, installed4)),
      renderStatus: status,
      onSelect: openMod,
      onMenu: (mod, event) => menu.open(mod, event)
    });
    const stopImages = watchImages(doc, scroller);
    const input = content.querySelector("input.search");
    const box = input ? bindSearchBox(input, { onSearch: (text) => void store.search(text) }) : null;
    const sidebar = bindSidebar(content, model, {
      ...actions,
      onNavigate: navigate
    });
    const paintSaved = () => {
      for (const el of scroller.querySelectorAll(
        "[data-mod-id]"
      )) {
        const id = el.dataset.modId ?? "";
        const group = el.querySelector('[data-testid="left-badges"]');
        if (group) group.innerHTML = leftBadge(id, saved, model.tab, installed4);
      }
    };
    const unsubscribe = saved.subscribe(paintSaved);
    const unsubscribeApplied = installed4.subscribe(paintSaved);
    void saved.refresh();
    return {
      fragment: content,
      destroy() {
        unsubscribe();
        unsubscribeApplied();
        menu.destroy();
        stopImages();
        sidebar.destroy();
        box?.destroy();
        grid.destroy();
      }
    };
  }
  function buildStore(startView) {
    const store = createModsStore(void 0, startView);
    const model = storeModel(store, sources2);
    const openPanel = () => {
      panel2?.close();
      panel2 = openSourcesPanel(doc, doc.body, sources2);
    };
    const openSettings = () => {
      panel2?.close();
      panel2 = openSettingsPanel(doc, doc.body);
    };
    const page = mount(
      store,
      model,
      (kind, state) => storeStatus(kind, state, sources2),
      { onManage: openPanel, onSettings: openSettings }
    );
    const syncSource = () => {
      const { sources: list2, loaded: loaded3 } = sources2.getState();
      if (!loaded3) return;
      const current3 = store.getState().source;
      if (list2.some((s) => s.id === current3)) return;
      void store.setSource(list2[0]?.id ?? null);
    };
    const unsubscribeSources = sources2.subscribe(syncSource);
    syncSource();
    void sources2.refresh();
    const unsubscribeView = store.subscribe(() => {
      const { source, sort, nsfw, category } = store.getState();
      rememberView({ source, sort, nsfw, category });
    });
    return {
      fragment: page.fragment,
      destroy() {
        unsubscribeView();
        unsubscribeSources();
        panel2?.close();
        page.destroy();
      }
    };
  }
  function buildInstalled() {
    const store = createInstalledStore(installed4, initialInstalledView());
    const model = installedModel(store, installed4, sources2);
    let dialog = null;
    const importFile = (file) => {
      dialog?.close();
      modal?.close();
      const current3 = store.view().category;
      dialog = openImportDialog(doc, doc.body, file, installed4, {
        // "Outros" é a lista toda: uma escolha de verdade começa em Skins.
        category: current3 === "other" ? "skins" : current3,
        // O mod aparece na aba da categoria dele, e o selo de instalado fica certo.
        onDone: (category) => {
          void store.setCategory(category);
          void saved.refresh();
        }
      });
    };
    const pickFile = () => {
      const input = doc.createElement("input");
      input.type = "file";
      input.accept = IMPORT_EXTENSIONS.join(",");
      input.style.display = "none";
      input.addEventListener(
        "change",
        () => {
          const file = input.files?.[0];
          input.remove();
          if (file) importFile(file);
        },
        { once: true }
      );
      doc.body.append(input);
      input.click();
    };
    const page = mount(
      store,
      model,
      (kind, state) => installedStatus(kind, state, sources2, installed4.getState().mods.length),
      { onImport: pickFile }
    );
    const drop = doc.createElement("div");
    drop.className = "sklol-drop";
    drop.innerHTML = `<div>${t("drop.title")}<span>${IMPORT_EXTENSIONS.join(", ")}</span></div>`;
    doc.body.append(drop);
    let depth = 0;
    const hasFiles = (event) => [...event.dataTransfer?.types ?? []].includes("Files");
    const onDragEnter = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth++;
      drop.classList.add("active");
    };
    const onDragOver = (event) => {
      const e = event;
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };
    const onDragLeave = (event) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) drop.classList.remove("active");
    };
    const onDrop = (event) => {
      const e = event;
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      drop.classList.remove("active");
      const file = [...e.dataTransfer?.files ?? []].find(
        (f) => isImportable(f.name)
      );
      if (file) importFile(file);
    };
    doc.addEventListener("dragenter", onDragEnter);
    doc.addEventListener("dragover", onDragOver);
    doc.addEventListener("dragleave", onDragLeave);
    doc.addEventListener("drop", onDrop);
    void sources2.refresh();
    const unsubscribeSaved = saved.subscribe(() => void installed4.refresh());
    const unsubscribeView = store.subscribe(
      () => rememberInstalledView(store.view())
    );
    void installed4.refresh();
    return {
      fragment: page.fragment,
      destroy() {
        unsubscribeView();
        unsubscribeSaved();
        dialog?.close();
        doc.removeEventListener("dragenter", onDragEnter);
        doc.removeEventListener("dragover", onDragOver);
        doc.removeEventListener("dragleave", onDragLeave);
        doc.removeEventListener("drop", onDrop);
        drop.remove();
        page.destroy();
      }
    };
  }
  return {
    fragment,
    destroy() {
      modal?.close();
      panel2?.close();
      inner.destroy();
      unbindTooltips();
    }
  };
}

// src/sklol/store/store-style.ts
var KEY2 = "sklol_store_css";
var MIN_LENGTH = 2e3;
var cached = null;
function absolutize(css, base) {
  return css.replace(
    /url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
    (match, _quote, url) => {
      if (/^(data:|blob:|#)/.test(url)) return match;
      try {
        return `url("${new URL(url, base).href}")`;
      } catch {
        return match;
      }
    }
  );
}
function captureStoreStyle(doc) {
  const parts = [];
  for (const sheet of [...doc.styleSheets]) {
    const owner = sheet.ownerNode;
    if (owner?.closest?.("[data-sklol-page]")) continue;
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const base = sheet.href ?? doc.baseURI;
    for (const rule of [...rules]) parts.push(absolutize(rule.cssText, base));
  }
  const css = parts.join("\n").replace(/:root\b/g, ":host");
  if (css.length < MIN_LENGTH || css === cached) return;
  cached = css;
  try {
    localStorage.setItem(KEY2, css);
  } catch (error) {
    print.warn("store: n\xE3o guardei o CSS da loja:", error.message);
  }
}
function storeStyle() {
  if (cached === null) {
    try {
      cached = localStorage.getItem(KEY2) ?? "";
    } catch {
      cached = "";
    }
  }
  return cached;
}

// src/sklol/store/mods-panel.ts
var view = { ...START_INSTALLED_VIEW, category: ALL_CATEGORY };
var SIDEBAR_WIDTH = 190;
var GRID_HEIGHT2 = 505;
var CARD = { width: 236, height: 133 };
var ROW_HEIGHT2 = 142;
var PANEL_CSS = `:host{all:initial}@keyframes sklol-mp-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}@keyframes sklol-mp-fade{from{opacity:0}to{opacity:1}}@keyframes sklol-mp-glow{0%,100%{opacity:.55}50%{opacity:1}}.sklol-mp{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:radial-gradient(60% 60% at 50% 50%,rgba(1,10,19,.6),rgba(1,10,19,.9));font-family:'LoL Body','Spiegel',sans-serif;color:#a09b8c;font-size:12px;animation:sklol-mp-fade .2s ease-out}.sklol-mp-frame{position:relative;display:flex;flex-direction:column;width:1000px;height:630px;padding:20px 20px 22px;box-sizing:border-box;background:radial-gradient(70% 55% at 88% -8%,rgba(10,200,185,.13),transparent 60%),radial-gradient(55% 45% at 0% 108%,rgba(200,170,110,.10),transparent 60%),repeating-linear-gradient(135deg,rgba(200,170,110,.025) 0 1px,transparent 1px 14px),linear-gradient(180deg,rgba(10,26,42,.92) 0%,rgba(6,16,27,.96) 45%,#010a13 100%),#010a13 url(/fe/lol-store/background.png) no-repeat;border:1px solid #785a28;box-shadow:0 0 0 1px #010a13,0 0 0 3px rgba(70,55,20,.75),0 0 0 4px #010a13,0 0 0 5px rgba(120,90,40,.35),0 28px 70px rgba(0,0,0,.75);animation:sklol-mp-in .24s ease-out}.sklol-mp-frame::before{content:"";position:absolute;inset:4px;pointer-events:none;--corner:#c8aa6e;--arm:26px;${CORNERS}}.sklol-mp-frame::after{content:"";position:absolute;inset:9px;pointer-events:none;border:1px solid rgba(120,90,40,.22)}.sklol-mp-orn{position:absolute;left:50%;z-index:1;width:10px;height:10px;margin-left:-6px;background:#010a13;border:1px solid #c8aa6e;transform:rotate(45deg);box-shadow:0 0 0 3px #010a13,0 0 10px rgba(200,170,110,.55);pointer-events:none}.sklol-mp-orn::after{content:"";position:absolute;inset:2px;background:#0ac8b9;box-shadow:0 0 6px rgba(10,200,185,.9);animation:sklol-mp-glow 2.6s ease-in-out infinite}.sklol-mp-orn.top{top:-6px}.sklol-mp-orn.bottom{bottom:-6px}.sklol-mp-orn-line{position:absolute;left:50%;z-index:1;width:260px;height:1px;margin-left:-130px;background:linear-gradient(90deg,transparent,#c8aa6e 35%,#c8aa6e 65%,transparent);pointer-events:none}.sklol-mp-orn-line.top{top:-1px}.sklol-mp-orn-line.bottom{bottom:-1px}.sklol-mp-close{position:absolute;top:-14px;right:-14px;z-index:3;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle,#0b2a3a 0%,#031520 70%);border:2px solid #785a28;box-shadow:0 0 0 2px #010a13;color:#a09b8c;cursor:pointer;transition:color .15s,border-color .15s,box-shadow .15s}.sklol-mp-close svg{transition:transform .15s}.sklol-mp-close:hover,.sklol-mp-close:focus-visible{color:#f0e6d2;border-color:#c8aa6e;box-shadow:0 0 0 2px #010a13,0 0 10px rgba(200,170,110,.45);outline:none}.sklol-mp-close:hover svg{transform:rotate(90deg)}.sklol-mp-head{position:relative;display:flex;align-items:center;gap:16px;margin:0 6px 16px;padding:0 0 14px;border-bottom:1px solid transparent;border-image:linear-gradient(90deg,transparent,#463714 12%,#785a28 50%,#463714 88%,transparent) 1}.sklol-mp-emblem{flex:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;color:#0ac8b9;background:radial-gradient(circle,#0b2a3a 0%,#031520 70%);border:2px solid #c8aa6e;box-shadow:0 0 0 3px #010a13,0 0 0 4px #785a28,inset 0 0 12px rgba(10,200,185,.35)}.sklol-mp-emblem svg{filter:drop-shadow(0 0 4px rgba(10,200,185,.6))}.sklol-mp-titles{min-width:0}.sklol-mp-head h2{margin:0;color:#f0e6d2;font-family:'LoL Display','Beaufort for LOL',serif;font-size:22px;font-weight:700;letter-spacing:.08em;line-height:1.1;text-transform:uppercase;white-space:nowrap;text-shadow:0 0 12px rgba(200,170,110,.25)}.sklol-mp-hint{display:block;margin-top:5px;color:#a09b8c;font-size:12px;line-height:1.4;transition:color .2s}.sklol-mp-hint.warn{color:#f0b232;animation:sklol-mp-fade .2s ease-out}.sklol-mp .item-page{display:flex!important;gap:16px;position:relative!important;inset:auto!important;width:auto!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;float:none!important;overflow:visible!important}.sklol-mp .sidebar{flex:none!important;width:${SIDEBAR_WIDTH}px!important;position:relative!important;inset:auto!important;height:${GRID_HEIGHT2}px!important;margin:0!important;float:none!important}.sklol-mp .sidebar::after{content:"";position:absolute;top:0;bottom:0;right:-9px;width:1px;background:linear-gradient(180deg,transparent,#785a28 20%,#785a28 80%,transparent);pointer-events:none}.sklol-mp .item-page-items-container-wrapper{flex:1!important;min-width:0!important;position:relative!important;inset:auto!important;width:auto!important;height:auto!important;margin:0!important;float:none!important}.sklol-mp .item-row .item{cursor:pointer}.sklol-mp .sidebar-content{margin:0!important}.sklol-mp .radio-button-wrapper{display:flex!important}.sklol-mp [data-sklol=scroller]::-webkit-scrollbar{width:12px;background:transparent}.sklol-mp [data-sklol=scroller]::-webkit-scrollbar-track{background:linear-gradient(90deg,transparent 5px,rgba(120,90,40,.25) 5px,rgba(120,90,40,.25) 7px,transparent 7px)}.sklol-mp [data-sklol=scroller]::-webkit-scrollbar-thumb{background-clip:padding-box;background-color:#785a28;border:3px solid transparent;border-radius:6px;min-height:32px}.sklol-mp [data-sklol=scroller]::-webkit-scrollbar-thumb:hover{background-color:#c8aa6e}@media (prefers-reduced-motion:reduce){.sklol-mp,.sklol-mp-frame,.sklol-mp-orn::after,.sklol-mp-hint.warn{animation:none}}`;
var FALLBACK_CSS = `.sklol-mp .sidebar-content{display:flex;flex-direction:column;gap:10px;height:100%}.sklol-mp .filters{display:flex;flex-direction:column;gap:6px;padding-bottom:10px;border-bottom:1px solid #1e2328}.sklol-mp .filters:last-child{border-bottom:0}.sklol-mp .radio-button-wrapper{display:flex;align-items:center;gap:8px;color:#a09b8c;text-decoration:none;cursor:pointer;font-size:12px;letter-spacing:.04em;text-transform:uppercase}.sklol-mp .radio-button-wrapper i{width:10px;height:10px;border:1px solid #785a28;transform:rotate(45deg)}.sklol-mp .radio-button-wrapper.selected{color:#f0e6d2}.sklol-mp .radio-button-wrapper.selected i{background:#c8aa6e}.sklol-mp input.search{height:28px;padding:0 8px;background:#010a13;border:1px solid #3c3c41;color:#f0e6d2;font:inherit;outline:0}.sklol-mp input.search:focus{border-color:#785a28}.sklol-mp .checkbox-wrapper{display:flex;align-items:center;gap:8px;cursor:pointer}.sklol-mp .checkbox-wrapper label{display:none}.sklol-mp .checkbox-wrapper input{margin:0;accent-color:#c8aa6e}.sklol-mp .lol-uikit-framed-dropdown{position:relative;border:1px solid #3c3c41;background:#1e2328;color:#f0e6d2;cursor:pointer}.sklol-mp .ui-dropdown{margin:0}.sklol-mp .ui-dropdown-current{padding:6px 8px}.sklol-mp .ui-dropdown-options-container{display:none;position:absolute;left:-1px;right:-1px;top:100%;z-index:3;margin:0;background:#010a13;border:1px solid #785a28}.sklol-mp .lol-uikit-framed-dropdown.active .ui-dropdown-options-container{display:block}.sklol-mp .ui-dropdown-options{list-style:none;margin:0;padding:4px 0}.sklol-mp .lol-uikit-dropdown-option{padding:6px 8px;color:#a09b8c}.sklol-mp .lol-uikit-dropdown-option:hover{color:#f0e6d2;background:#1e2328}.sklol-mp .item-row{display:flex;gap:10px;box-sizing:border-box;padding-bottom:9px}.sklol-mp .item{position:relative;flex:none;border:1px solid #3c3c41;box-sizing:border-box}.sklol-mp .item:hover{border-color:#785a28}.sklol-mp .item-image{position:absolute;inset:0}.sklol-mp .item-image>div{position:absolute;inset:0;background-size:cover}.sklol-mp .item-badges{position:absolute;left:6px;right:6px;top:6px;z-index:2;display:flex;justify-content:space-between}.sklol-mp .badges-group{display:flex;gap:4px}.sklol-mp .hextech-ui-badge{padding:2px 7px;border-radius:9px;font-size:10px;font-weight:700;letter-spacing:.06em;background:#3c3c41;color:#f0e6d2}.sklol-mp .background-red{background:#a61e33}.sklol-mp .item-overlay{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:6px 8px;background:linear-gradient(0deg,rgba(1,10,19,.95),rgba(1,10,19,0))}.sklol-mp .item-name{margin:0 0 2px;color:#f0e6d2;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sklol-mp .item-price-container{display:flex;gap:10px;align-items:center}.sklol-mp .item-price{display:flex;gap:4px;align-items:center;color:#a09b8c}`;
var EMBLEM_ICON3 = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5"/></svg>`;
var CLOSE_ICON3 = `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
function openShell(doc, {
  title,
  hint = "",
  mount,
  onClose
}) {
  const host = doc.createElement("div");
  host.setAttribute("data-sklol-mods-panel", "");
  const shadow = host.attachShadow({ mode: "open" });
  const copied = storeStyle();
  shadow.innerHTML = `<style data-sklol="store-css"></style><style>${copied ? "" : FALLBACK_CSS}${PANEL_CSS}</style>${STYLE}<div class="sklol-mp" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sklol-mp-frame"><i class="sklol-mp-orn-line top"></i><i class="sklol-mp-orn top"></i><i class="sklol-mp-orn-line bottom"></i><i class="sklol-mp-orn bottom"></i><div class="sklol-mp-close" role="button" tabindex="0" aria-label="${t("common.close")}" data-sklol-close>${CLOSE_ICON3}</div><div class="sklol-mp-head"><div class="sklol-mp-emblem">${EMBLEM_ICON3}</div><div class="sklol-mp-titles"><h2>${esc(title)}</h2>${hint ? `<span class="sklol-mp-hint">${esc(hint)}</span>` : ""}</div></div><div id="root"><div class="container item-page"></div></div></div></div>`;
  const overlay2 = shadow.querySelector(".sklol-mp");
  const page = shadow.querySelector(".item-page");
  if (!overlay2 || !page) throw new Error("o painel n\xE3o montou");
  const storeCss = shadow.querySelector('[data-sklol="store-css"]');
  if (storeCss) storeCss.textContent = copied;
  const mounted = mount({
    page,
    overlay: overlay2,
    hint: shadow.querySelector(".sklol-mp-hint")
  });
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    mounted.destroy();
    doc.removeEventListener("keydown", onKey, true);
    host.remove();
    onClose?.();
  }
  const inner = () => !!overlay2.querySelector(".sklol-modal, .sklol-panel, .sklol-context-menu");
  function onKey(event) {
    if (event.key !== "Escape" || inner()) return;
    event.stopPropagation();
    close();
  }
  overlay2.addEventListener("click", (event) => {
    const target = event.target;
    if (target === overlay2 || target.closest("[data-sklol-close]")) close();
  });
  doc.addEventListener("keydown", onKey, true);
  doc.body.append(host);
  return { close };
}
function openModsPanel(doc, { installed: installed4, sources: sources2, saved, onClose }) {
  return openShell(doc, {
    title: t("panel.title"),
    hint: t("panel.hint"),
    onClose,
    mount: ({ page, overlay: overlay2, hint }) => {
      const store = createInstalledStore(installed4, view);
      const model = installedModel(store, installed4, sources2);
      const left = (mod) => mod.category === "skins" ? "" : appliedBadge(mod.id, installed4);
      const template = doc.createElement("template");
      template.innerHTML = sidebarHtml(model, { tabs: false, bottom: false }) + gridShell(GRID_HEIGHT2);
      const content = template.content;
      const scroller = content.querySelector(
        "[data-sklol=scroller]"
      );
      if (!scroller) throw new Error("a grade n\xE3o tem \xE1rea de rolagem");
      let hintTimer = 0;
      const win = doc.defaultView ?? window;
      function warnSkin() {
        if (!hint) return;
        const message = hint;
        message.textContent = t("panel.skinHint");
        message.classList.add("warn");
        win.clearTimeout(hintTimer);
        hintTimer = win.setTimeout(() => {
          message.textContent = t("panel.hint");
          message.classList.remove("warn");
        }, 4e3);
      }
      const menu = createModMenu(doc, { host: overlay2, saved, installed: installed4 });
      const grid = createVirtualGrid({
        doc,
        scroller,
        store,
        columns: COLUMNS,
        rowHeight: ROW_HEIGHT2,
        fallbackHeight: GRID_HEIGHT2,
        renderCard: (mod, index) => card(mod, index, left(mod), CARD),
        renderStatus: (kind, state) => installedStatus(
          kind,
          state,
          sources2,
          installed4.getState().mods.length
        ),
        onSelect: (mod) => {
          if (mod.category === "skins") return warnSkin();
          void installed4.toggleApplied(mod.id);
        },
        onMenu: (mod, event) => menu.open(mod, event)
      });
      const stopImages = watchImages(doc, scroller);
      const input = content.querySelector("input.search");
      const box = input ? bindSearchBox(input, { onSearch: (text) => void store.search(text) }) : null;
      const sidebar = bindSidebar(content, model);
      page.append(content);
      const paintBadges = () => {
        for (const el of scroller.querySelectorAll(
          "[data-mod-id]"
        )) {
          const mod = store.getState().mods.find((m) => m.id === el.dataset.modId);
          const group = el.querySelector('[data-testid="left-badges"]');
          if (mod && group) group.innerHTML = left(mod);
        }
      };
      const unsubscribeList = installed4.subscribe(paintBadges);
      const unsubscribeSaved = saved.subscribe(() => void installed4.refresh());
      const unsubscribeView = store.subscribe(() => {
        view = store.view();
      });
      void installed4.refresh();
      void saved.refresh();
      void sources2.refresh();
      return {
        destroy() {
          win.clearTimeout(hintTimer);
          unsubscribeList();
          unsubscribeSaved();
          unsubscribeView();
          menu.destroy();
          stopImages();
          sidebar.destroy();
          box?.destroy();
          grid.destroy();
          store.dispose();
        }
      };
    }
  });
}

// src/sklol/store/saved-store.ts
var LOCAL_URL8 = `http://127.0.0.1:${LOCAL_PORT}`;
var TIMEOUT_MS8 = 3e4;
var SAVE_TIMEOUT_MS = 5 * 6e4;
var SavedApiError = class extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
};
async function call4(method, modId, body) {
  let response;
  try {
    response = await fetch(`${LOCAL_URL8}${savedPath(modId)}`, {
      method,
      ...body ? {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      } : {},
      signal: AbortSignal.timeout(
        method === "PUT" ? SAVE_TIMEOUT_MS : TIMEOUT_MS8
      )
    });
  } catch {
    throw new SavedApiError("local_unreachable");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const code = payload?.error;
    throw new SavedApiError(typeof code === "string" ? code : "bad_response");
  }
  try {
    return parseSavedList(payload);
  } catch {
    throw new SavedApiError("bad_response");
  }
}
var localSavedApi = {
  list: async () => (await call4("GET")).ids,
  save: (mod) => call4("PUT", mod.id, mod),
  remove: (modId) => call4("DELETE", modId)
};
function createSavedStore(api, onChange = () => {
}, findChampion = async () => void 0) {
  let saved = /* @__PURE__ */ new Set();
  const busy = /* @__PURE__ */ new Set();
  const failed = /* @__PURE__ */ new Map();
  const listeners = /* @__PURE__ */ new Set();
  const notify = () => {
    for (const fn of [...listeners]) fn();
  };
  const status = (modId) => busy.has(modId) ? "busy" : failed.has(modId) ? "failed" : saved.has(modId) ? "saved" : "idle";
  return {
    status,
    reason: (modId) => failed.get(modId),
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    async refresh() {
      try {
        saved = new Set(await api.list());
        notify();
      } catch (error) {
        print.warn("store: n\xE3o li as skins salvas:", error.message);
      }
    },
    async toggle(mod) {
      if (busy.has(mod.id)) return;
      const removing = saved.has(mod.id);
      busy.add(mod.id);
      failed.delete(mod.id);
      notify();
      try {
        const skin = (mod.category ?? "skins") === "skins";
        const known = mod.championIds[0] ?? (skin ? await findChampion(mod) : void 0);
        const result = await (removing ? api.remove(mod.id) : api.save({
          ...mod,
          championIds: known === void 0 ? [] : [known]
        }));
        saved = new Set(result.ids);
        const championId = result.championId ?? known;
        if (championId !== void 0) onChange(championId);
      } catch (error) {
        const code = error.code ?? "bad_response";
        print.warn("store: n\xE3o consegui atualizar a skin salva:", mod.id, code);
        failed.set(mod.id, code);
      } finally {
        busy.delete(mod.id);
        notify();
      }
    }
  };
}

// src/sklol/store/index.ts
var CONTAINER = "div.container.clearfix";
var NAV_SELECTOR = "#root nav.navbar > ul.nav-tabs";
var NAV_XPATH = '//*[@id="root"]/div/div[1]/nav/ul';
var ITEM_ID = "sklol-store-test";
var RECHECK_MS2 = 250;
var POLL_MS2 = 1e3;
var BUTTON_LABEL = "MODS";
var savedMods = createSavedStore(
  localSavedApi,
  (championId) => Customs.invalidate(championId),
  championOf
);
var sources = createSourcesStore();
var installed3 = createInstalledList(void 0, (mod) => {
  if (mod.championId !== null) Customs.invalidate(mod.championId);
});
var favorites = createFavorites();
var current2 = null;
var PAGE_ATTRIBUTE = "data-sklol-page";
var shown = null;
function leaveStore() {
  current2?.destroy();
  current2 = null;
  const was = shown;
  shown = null;
  if (!was) return;
  was.host.remove();
  if (was.display) {
    was.container.style.setProperty("display", was.display, was.priority);
  } else {
    was.container.style.removeProperty("display");
  }
  print.log("store: sa\xED da tela de mods, o container do app voltou a aparecer");
}
function showStore(doc) {
  const matches = [...doc.querySelectorAll(CONTAINER)];
  print.log(
    "store: procurando",
    CONTAINER,
    "->",
    matches.length,
    "encontrados:",
    matches
  );
  const nav = findNav(doc);
  const container = matches.find(
    (el) => !el.hasAttribute(PAGE_ATTRIBUTE) && (!nav || !el.contains(nav))
  );
  if (!container) {
    print.warn(
      "store: n\xE3o achei o container.",
      `div#root: ${!!doc.querySelector("div#root")},`,
      `${CONTAINER}: ${matches.length}`,
      `(com o menu dentro: ${matches.filter((el) => nav && el.contains(nav)).length})`
    );
    return;
  }
  print.log(
    "store: achei o container com",
    container.children.length,
    "elementos:",
    container
  );
  if (shown && shown.container !== container) leaveStore();
  if (!shown) {
    const host = doc.createElement("div");
    host.className = "container clearfix item-page";
    host.setAttribute(PAGE_ATTRIBUTE, "");
    shown = {
      container,
      host,
      display: container.style.getPropertyValue("display"),
      priority: container.style.getPropertyPriority("display")
    };
    container.style.setProperty("display", "none", "important");
    container.after(host);
  }
  captureStoreStyle(doc);
  current2?.destroy();
  current2 = renderStorePage(
    doc,
    // O clique abre o modal do mod (a página cuida dele). Instalar é o botão de lá.
    (mod) => print.log("store: mod aberto:", mod.name, mod),
    savedMods,
    sources,
    initialView(),
    { installed: installed3, favorites }
  );
  shown.host.replaceChildren(current2.fragment);
  print.log("store: montei a p\xE1gina de skins");
}
function findNav(doc) {
  return doc.querySelector(NAV_SELECTOR) ?? doc.evaluate(
    NAV_XPATH,
    doc,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}
function setLabel(item, label) {
  const walker = item.ownerDocument.createTreeWalker(
    item,
    NodeFilter.SHOW_TEXT
  );
  const texts2 = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent?.trim()) texts2.push(node);
  }
  if (!texts2.length) {
    (item.querySelector("a") ?? item).textContent = label;
    return;
  }
  texts2[0].data = label;
  for (const extra of texts2.slice(1)) extra.data = "";
}
function createItem(doc, nav) {
  const items = [...nav.children].filter((child) => child.id !== ITEM_ID);
  const template = items.find((child) => !child.classList.contains("active")) ?? items[0];
  if (!template) return null;
  const item = template.cloneNode(true);
  item.id = ITEM_ID;
  for (const el of [item, ...item.querySelectorAll(".active")]) {
    el.classList.remove("active");
  }
  setLabel(item, BUTTON_LABEL);
  let restore = null;
  item.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!item.classList.contains("active")) {
      const others = [
        ...nav.querySelectorAll(":scope > li.active")
      ];
      for (const li of others) li.classList.remove("active");
      item.classList.add("active");
      restore = () => {
        item.classList.remove("active");
        for (const li of others) li.classList.add("active");
        restore = null;
      };
    }
    showStore(doc);
  });
  nav.addEventListener(
    "click",
    (event) => {
      if (item.contains(event.target)) return;
      restore?.();
      leaveStore();
    },
    true
  );
  return item;
}
function ensureButton(doc) {
  if (shown && (!shown.container.isConnected || !shown.host.isConnected)) {
    leaveStore();
  }
  const nav = findNav(doc);
  if (!nav) return;
  const current3 = doc.getElementById(ITEM_ID);
  if (current3?.parentElement === nav) {
    if (nav.lastElementChild !== current3) nav.appendChild(current3);
    return;
  }
  const item = createItem(doc, nav);
  if (!item) return;
  nav.appendChild(item);
  print.log(
    "store: bot\xE3o colocado no menu, que agora tem",
    nav.children.length,
    "itens:",
    nav
  );
}
function observeDocument(doc, onChange) {
  let queued = false;
  const run = () => {
    if (!queued) return;
    queued = false;
    onChange();
  };
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(run);
    setTimeout(run, RECHECK_MS2);
  }).observe(doc.documentElement, { childList: true, subtree: true });
  onChange();
}
var seenFrames = /* @__PURE__ */ new WeakSet();
var watchedDocs = /* @__PURE__ */ new WeakSet();
function watchDocument(doc) {
  if (watchedDocs.has(doc)) return;
  watchedDocs.add(doc);
  doc.addEventListener("keydown", onPanelKey, true);
  observeDocument(doc, () => ensureButton(doc));
}
function reportFrame(frame, when) {
  let doc = null;
  try {
    doc = frame.contentDocument;
  } catch {
  }
  if (!doc) {
    print.log(
      `store: iframe ${when}, conte\xFAdo n\xE3o acess\xEDvel (outra origem, ou ainda vazio):`,
      frame.src
    );
    return;
  }
  print.log(
    `store: iframe ${when}, acess\xEDvel. url: ${doc.location.href},`,
    `#root: ${!!doc.querySelector("#root")},`,
    `nav ul: ${doc.querySelectorAll("nav ul").length}`
  );
  watchDocument(doc);
}
function inspectFrames() {
  for (const frame of document.querySelectorAll("iframe")) {
    if (seenFrames.has(frame)) continue;
    seenFrames.add(frame);
    print.log(
      "store: iframe novo. src:",
      frame.src || "(sem src)",
      "id:",
      frame.id,
      "class:",
      frame.className,
      frame
    );
    reportFrame(frame, "criado");
    frame.addEventListener("load", () => reportFrame(frame, "carregou"));
  }
}
function recheckFrames() {
  for (const frame of document.querySelectorAll("iframe")) {
    let doc = null;
    try {
      doc = frame.contentDocument;
    } catch {
    }
    if (!doc?.documentElement) continue;
    if (!watchedDocs.has(doc)) {
      print.warn(
        "store: documento de iframe que nenhum aviso trouxe, vigiando agora:",
        frame.src
      );
      seenFrames.add(frame);
      watchDocument(doc);
    }
    try {
      ensureButton(doc);
    } catch (error) {
      print.warn("store: n\xE3o consegui p\xF4r o bot\xE3o:", error.message);
    }
  }
}
var panel = null;
function togglePanel() {
  if (panel) return panel.close();
  panel = openModsPanel(document, {
    installed: installed3,
    sources,
    saved: savedMods,
    onClose: () => {
      panel = null;
    }
  });
  print.log("store: painel dos instalados aberto");
}
function onPanelKey(event) {
  const e = event;
  if (!e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || e.repeat) return;
  if (e.key.toLowerCase() !== "m") return;
  e.preventDefault();
  e.stopPropagation();
  try {
    togglePanel();
  } catch (error) {
    print.warn("store: n\xE3o abri o painel:", error.message);
  }
}
function initStore() {
  document.addEventListener("keydown", onPanelKey, true);
  const start = () => {
    print.log("store: esperando o menu", NAV_SELECTOR);
    observeDocument(document, () => {
      inspectFrames();
      ensureButton(document);
    });
    setInterval(recheckFrames, POLL_MS2);
  };
  if (document.body) return start();
  document.addEventListener("DOMContentLoaded", start, { once: true });
}

// src/sklol/index.ts
async function init({ socket: socket2, rcp }) {
  void initLocale();
  startBridge();
  hookSkins(rcp);
  installCarouselDrag();
  installCarouselTutorial();
  initStore();
  installDiscordButton();
  socket2.observe("/lol-champ-select/v1/session", async ({ data }) => {
    if (!data) return markCarouselMode("normal");
    const meCellId = data.localPlayerCellId;
    const plr = data.myTeam.find((p) => p.cellId === meCellId);
    if (!plr) return;
    const me = Players.me;
    if (data.gameId !== me.gameId) {
      Players.clear();
      me.team = plr.team;
      me.gameId = data.gameId;
      me.puuid = plr.puuid;
      const region = data.chatDetails?.mucJwtDto?.targetRegion;
      if (region) {
        const roomId = `${region}-${data.gameId}`;
        print.log(`Sala ${roomId}, time ${plr.team}`);
        print.log(
          "Colega simulado (aliado; use o outro time pra inimigo):",
          `bun --env-file=.env packages/backend/tests/scripts/fake-player.ts ${roomId} ${plr.team} <campe\xE3o> <skin>`
        );
      }
    }
    if (plr.championId !== me.championId && plr.championId !== 0) {
      me.championId = plr.championId;
      await applyCarouselMode(plr.championId);
      print.log("Campe\xE3o selecionado:", plr.championId, me.skinId);
      observerSkinChange();
    }
    if (data.timer.phase === "FINALIZATION") {
      if (me.magicTime) return;
      me.magicTime = true;
      MagicParty.refreshParty();
    }
  });
}
export {
  init
};
