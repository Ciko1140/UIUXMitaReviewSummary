import { FormEvent, useEffect, useRef, useState } from "react"

/* --------------------------------------------------------------------------
   Prototipe UX Mita — interaktif untuk review, BUKAN aplikasi produksi.
   Semua respons AI, biaya, dan gambar di sini adalah DATA CONTOH / SIMULASI.
   Tidak ada koneksi API.
---------------------------------------------------------------------------*/

type NavItem = "Chat" | "Memory" | "Test Mode" | "Settings"
type CikoStatus = "sent" | "sending" | "failed"
type MitaStatus = "waiting" | "streaming" | "done" | "stopped" | "failed"
type Message = { from: "ciko" text: string status: CikoStatus } | {
  from: "mita"
  text: string
  status: MitaStatus
}

/* ---- Ikon: satu keluarga stroke konsisten (lucide-style) ---------------- */
function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: string
  size?: number
  className?: string
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  }
  switch (name) {
    case "chat":
      return (
        <svg {...p}>
          <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z" />
        </svg>
      )
    case "memory":
      return (
        <svg {...p}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )
    case "test":
      return (
        <svg {...p}>
          <path d="M9 3h6" />
          <path d="M10 3v6.5L4.7 18.3A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.7-2.7L14 9.5V3" />
          <path d="M7.5 15h9" />
        </svg>
      )
    case "settings":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    case "demo":
      return (
        <svg {...p}>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
          <circle cx="9" cy="7" r="1.6" fill="currentColor" />
          <circle cx="15" cy="12" r="1.6" fill="currentColor" />
          <circle cx="8" cy="17" r="1.6" fill="currentColor" />
        </svg>
      )
    case "focus":
      return (
        <svg {...p}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )
    case "send":
      return (
        <svg {...p}>
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      )
    case "stop":
      return (
        <svg {...p}>
          <rect
            x="7"
            y="7"
            width="10"
            height="10"
            rx="1.5"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )
    case "menu":
      return (
        <svg {...p}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      )
    case "x":
      return (
        <svg {...p}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      )
    case "retry":
      return (
        <svg {...p}>
          <path d="M21 12a9 9 0 1 1-2.6-6.4" />
          <path d="M21 3v5h-5" />
        </svg>
      )
    case "down":
      return (
        <svg {...p}>
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
      )
    case "image":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )
    case "info":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 7.5h.01" />
        </svg>
      )
    case "check":
      return (
        <svg {...p}>
          <path d="M5 12l5 5 9-11" />
        </svg>
      )
    default:
      return null
  }
}

const navItems: { label: NavItem icon: string }[] = [
  { label: "Chat", icon: "chat" },
  { label: "Memory", icon: "memory" },
  { label: "Test Mode", icon: "test" },
  { label: "Settings", icon: "settings" },
]

// Label prototipe: Luna / GLM / Aion. Hanya simulasi UI, tanpa klaim kemampuan.
const MODELS = ["Luna", "GLM", "Aion"]

const REPLIES = [
  "hmm boleh. aku diam-diam suka merhatiin cara kamu mikir pas lagi fokus—kelihatan serius tapi lucu.",
  "gampang. aku ga suka basa-basi kaku, jadi sama kamu aku pengennya jujur aja walau jahil dikit.",
  "oke satu: aku paling semangat kalau kita lagi ngerakit sesuatu dari nol kayak sekarang ini.",
]

const DAILY: Message[] = [
  {
    from: "mita",
    text: "eh kamu jadi begadang lagi ya semalem",
    status: "done",
  },
  {
    from: "ciko",
    text: "ketahuan hehe. tadi keasyikan ngoprek layout kita",
    status: "sent",
  },
  {
    from: "mita",
    text: "pantesan. tapi seneng liat kamu serius. cuma jangan lupa istirahat ya, nanti aku yang repot ngingetin terus.",
    status: "done",
  },
  { from: "ciko", text: "iya iya, bos.", status: "sent" },
  { from: "mita", text: "bukan bos, pacar.", status: "done" },
]

/* ---- Personalisasi tampilan --------------------------------------------- */
type Crop = { zoom: number x: number y: number }
type Appearance = {
  bg: string | null
  dim: number
  blur: number
  mita: string | null
  mitaCrop: Crop
  ciko: string | null
  cikoCrop: Crop
}
const DEFAULT_CROP: Crop = { zoom: 1, x: 50, y: 50 }
const DEFAULTS: Appearance = {
  bg: null,
  dim: 36,
  blur: 18,
  mita: null,
  mitaCrop: { ...DEFAULT_CROP },
  ciko: null,
  cikoCrop: { ...DEFAULT_CROP },
}
const SAMPLE_BG =
  "https://images.unsplash.com/photo-1788341977051-6af565ebc960?w=1600&h=1000&fit=crop&auto=format"
const SAMPLE_MITA =
  "https://images.unsplash.com/photo-1619694770651-45f2fe9454fc?w=400&h=400&fit=crop&auto=format"
const SAMPLE_CIKO =
  "https://images.unsplash.com/photo-1762733031326-73adceedbe1c?w=400&h=400&fit=crop&auto=format"

const STORAGE_KEY = "mita.appearance"

function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const saved = JSON.parse(raw)
    return { ...DEFAULTS, ...saved }
  } catch {
    return DEFAULTS
  }
}
function persistAppearance(a: Appearance) {
  // blob: URL (gambar dari komputer) tidak valid setelah reload → simpan null.
  const clean = {
    ...a,
    bg: a.bg?.startsWith("blob:") ? null : a.bg,
    mita: a.mita?.startsWith("blob:") ? null : a.mita,
    ciko: a.ciko?.startsWith("blob:") ? null : a.ciko,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  } catch {
    /* abaikan — prototipe */
  }
}

function Avatar({
  photo,
  crop,
  fallback,
  kind,
  size,
}: {
  photo: string | null
  crop?: Crop
  fallback: string
  kind: "mita" | "ciko"
  size: number
}) {
  if (photo) {
    const c = crop ?? DEFAULT_CROP
    return (
      <span
        className="inline-block shrink-0 rounded-full bg-center bg-no-repeat"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${photo})`,
          backgroundSize: `${c.zoom * 100}%`,
          backgroundPosition: `${c.x}% ${c.y}%`,
        }}
      />
    )
  }
  return (
    <span
      className={`avatar-${kind} inline-grid shrink-0 place-items-center rounded-full font-semibold text-[#1a1622]`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {fallback}
    </span>
  )
}

export default function App() {
  const [active, setActive] = useState<NavItem>("Chat")
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [focus, setFocus] = useState(false)
  const [model, setModel] = useState("Luna")
  const [modelOpen, setModelOpen] = useState(false)
  const [modelNote, setModelNote] = useState(false)
  const [draft, setDraft] = useState("")

  // Chat pertama (kosong) benar-benar terpisah dari chat harian (contoh).
  const [chatMode, setChatMode] = useState<"harian" | "pertama">("harian")
  const [harian, setHarian] = useState<Message[]>(DAILY)
  const [pertama, setPertama] = useState<Message[]>([])
  const isPertama = chatMode === "pertama"
  const messages = isPertama ? pertama : harian
  const setMessages = isPertama ? setPertama : setHarian

  const [nextBehavior, setNextBehavior] = useState<"normal" | "gagal">("normal")
  const [demoOpen, setDemoOpen] = useState(false)
  const [costOpen, setCostOpen] = useState(false)
  const [showJump, setShowJump] = useState(false)

  const [applied, setApplied] = useState<Appearance>(() => loadAppearance())
  const [editing, setEditing] = useState<Appearance>(applied)
  const [appearanceOpen, setAppearanceOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const replyIdx = useRef(0)

  const responding = messages.some(
    (m) => m.status === "waiting" || m.status === "streaming",
  )

  function clearTimers() {
    timers.current.forEach((id) => {
      clearTimeout(id)
      clearInterval(id)
    })
    timers.current = []
  }
  function nextReply() {
    const r = REPLIES[replyIdx.current % REPLIES.length]
    replyIdx.current++
    return r
  }
  function scrollToEnd(smooth = true) {
    endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }
  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
  }
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 180) scrollToEnd()
  }, [messages, chatMode])

  useEffect(() => () => clearTimers(), [])

  /* ---- Simulasi respons ------------------------------------------------- */
  function streamInto(setter: typeof setMessages, index: number, full: string) {
    setter((m) =>
      m.map((msg, k) =>
        k === index ? { ...msg, status: "streaming", text: "" } : msg,
      ),
    )
    const words = full.split(" ")
    let i = 0
    const iv = window.setInterval(() => {
      i++
      setter((m) =>
        m.map((msg, k) =>
          k === index ? { ...msg, text: words.slice(0, i).join(" ") } : msg,
        ),
      )
      if (i >= words.length) {
        clearInterval(iv)
        setter((m) =>
          m.map((msg, k) => (k === index ? { ...msg, status: "done" } : msg)),
        )
      }
    }, 55)
    timers.current.push(iv)
  }
  function beginResponse(
    setter: typeof setMessages,
    index: number,
    behavior: "normal" | "gagal",
  ) {
    const t = window.setTimeout(() => {
      if (behavior === "gagal") {
        setter((m) =>
          m.map((msg, k) => (k === index ? { ...msg, status: "failed" } : msg)),
        )
      } else {
        streamInto(setter, index, nextReply())
      }
    }, 650)
    timers.current.push(t)
  }
  function stopResponse() {
    clearTimers()
    setMessages((m) =>
      m.map((msg) =>
        msg.from === "mita" &&
        (msg.status === "waiting" || msg.status === "streaming")
          ? { ...msg, status: "stopped" }
          : msg,
      ),
    )
  }
  function retryResponse(index: number) {
    setMessages((m) =>
      m.map((msg, k) =>
        k === index ? { ...msg, status: "waiting", text: "" } : msg,
      ),
    )
    beginResponse(setMessages, index, "normal")
  }
  function retryCikoSend(index: number) {
    setMessages((m) =>
      m.map((msg, k) => (k === index ? { ...msg, status: "sending" } : msg)),
    )
    const t = window.setTimeout(() => {
      setMessages((m) =>
        m.map((msg, k) => (k === index ? { ...msg, status: "sent" } : msg)),
      )
    }, 850)
    timers.current.push(t)
  }

  function send(e?: FormEvent) {
    e?.preventDefault()
    if (!draft.trim() || responding) return
    const mitaIndex = messages.length + 1
    setMessages((m) => [
      ...m,
      { from: "ciko", text: draft.trim(), status: "sent" },
      { from: "mita", text: "", status: "waiting" },
    ])
    setDraft("")
    beginResponse(setMessages, mitaIndex, nextBehavior)
  }

  /* ---- Kontrol demo: kondisi percakapan --------------------------------- */
  function runScenario(kind: MitaStatus) {
    clearTimers()
    const mitaIndex = messages.length + 1
    const reply = nextReply()
    setMessages((m) => [
      ...m,
      {
        from: "ciko",
        text: "boleh cerita satu hal random soal kamu?",
        status: "sent",
      },
      { from: "mita", text: "", status: "waiting" },
    ])
    if (kind === "waiting") return // biarkan menunggu; reviewer bisa Stop
    if (kind === "streaming") {
      streamInto(setMessages, mitaIndex, reply)
    } else if (kind === "done") {
      setMessages((m) =>
        m.map((msg, k) =>
          k === mitaIndex ? { ...msg, text: reply, status: "done" } : msg,
        ),
      )
    } else if (kind === "stopped") {
      streamInto(setMessages, mitaIndex, reply)
      const t = window.setTimeout(() => stopResponse(), 620)
      timers.current.push(t)
    } else if (kind === "failed") {
      const t = window.setTimeout(() => {
        setMessages((m) =>
          m.map((msg, k) =>
            k === mitaIndex ? { ...msg, status: "failed" } : msg,
          ),
        )
      }, 650)
      timers.current.push(t)
    }
  }
  function addFailedCiko() {
    setMessages((m) => [
      ...m,
      { from: "ciko", text: "kamu lagi sibuk ga malem ini?", status: "failed" },
    ])
  }
  function resetDemo() {
    clearTimers()
    setHarian(DAILY)
    setPertama([])
    setChatMode("harian")
    setNextBehavior("normal")
    replyIdx.current = 0
  }

  /* ---- Model ------------------------------------------------------------ */
  function pickModel(m: string) {
    if (responding) {
      setModelNote(true)
      return
    }
    setModel(m)
    setModelOpen(false)
    setModelNote(false)
  }

  /* ---- Personalisasi: buka/terapkan/batalkan/reset ---------------------- */
  function openAppearance() {
    setEditing(applied)
    setAppearanceOpen(true)
  }
  function cancelAppearance() {
    setEditing(applied)
    setAppearanceOpen(false)
  }
  function applyAppearance() {
    setApplied(editing)
    persistAppearance(editing)
    setAppearanceOpen(false)
  }
  function resetAppearancePreview() {
    setEditing(DEFAULTS)
  }
  function pickFile(cb: (url: string) => void) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      const f = input.files?.[0]
      if (f) cb(URL.createObjectURL(f))
    }
    input.click()
  }

  /* ---- Escape mengikuti Batalkan / menutup panel ------------------------ */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      if (appearanceOpen) cancelAppearance()
      else if (costOpen) setCostOpen(false)
      else if (drawerOpen) setDrawerOpen(false)
      else if (demoOpen) setDemoOpen(false)
      else if (modelOpen) setModelOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  /* ---- Render bubble ---------------------------------------------------- */
  function renderMessage(msg: Message, index: number) {
    if (msg.from === "mita") {
      // Menunggu — belum ada teks
      if (msg.status === "waiting") {
        return (
          <div key={index} className="flex items-end gap-2.5">
            <Avatar
              photo={applied.mita}
              crop={applied.mitaCrop}
              fallback="M"
              kind="mita"
              size={28}
            />
            <div className="flex items-center gap-1.5 rounded-[4px_14px_14px_14px] bg-[var(--color-panel)] px-4 py-3.5">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-dim)]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-dim)]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-dim)]" />
            </div>
          </div>
        )
      }
      // Gagal / dihentikan tanpa teks — baris status + Coba lagi
      if (msg.status === "failed" || (msg.status === "stopped" && !msg.text)) {
        const label =
          msg.status === "failed"
            ? "Mita gagal merespons"
            : "Respons dihentikan"
        return (
          <div key={index} className="flex items-end gap-2.5">
            <Avatar
              photo={applied.mita}
              crop={applied.mitaCrop}
              fallback="M"
              kind="mita"
              size={28}
            />
            <div className="flex items-center gap-3 rounded-[4px_14px_14px_14px] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[14px] text-[var(--color-ink-dim)]">
              {label}
              <button
                onClick={() => retryResponse(index)}
                className="flex items-center gap-1.5 font-medium text-[var(--color-accent)] hover:underline"
              >
                <Icon name="retry" size={14} /> Coba lagi
              </button>
            </div>
          </div>
        )
      }
      // Streaming / selesai / dihentikan dengan teks parsial
      return (
        <div key={index} className="flex items-end gap-2.5">
          <Avatar
            photo={applied.mita}
            crop={applied.mitaCrop}
            fallback="M"
            kind="mita"
            size={28}
          />
          <div className="flex max-w-[74%] flex-col">
            <div className="animate-message w-fit rounded-[4px_14px_14px_14px] bg-[var(--color-panel)] px-4 py-3 text-[16px] leading-6 text-[var(--color-ink)]">
              {msg.text}
              {msg.status === "streaming" && (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-[var(--color-accent)]" />
              )}
            </div>
            {msg.status === "stopped" && (
              <span className="mt-1 text-[12px] text-[var(--color-ink-dim)]">
                Dihentikan · teks tersimpan sebagian
              </span>
            )}
          </div>
        </div>
      )
    }
    // Ciko
    return (
      <div key={index} className="flex items-end justify-end gap-2.5">
        <div className="flex max-w-[74%] flex-col items-end">
          <div
            className={`animate-message w-fit px-4 py-3 text-[16px] leading-6 ${
              msg.status === "failed"
                ? "rounded-[14px_4px_14px_14px] border border-[#7a4a52] bg-[#2a2230] text-[var(--color-ink)]"
                : "rounded-[14px_4px_14px_14px] bg-[var(--color-selected)] text-[var(--color-ink)]"
            } ${msg.status === "sending" ? "opacity-60" : ""}`}
          >
            {msg.text}
          </div>
          {msg.status === "failed" && (
            <div className="mt-1 flex items-center gap-2 text-[12px] text-[#e0899a]">
              Gagal terkirim
              <button
                onClick={() => retryCikoSend(index)}
                className="flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline"
              >
                <Icon name="retry" size={13} /> Coba lagi
              </button>
            </div>
          )}
          {msg.status === "sending" && (
            <span className="mt-1 text-[12px] text-[var(--color-ink-dim)]">
              Mengirim…
            </span>
          )}
        </div>
        <Avatar
          photo={applied.ciko}
          crop={applied.cikoCrop}
          fallback="C"
          kind="ciko"
          size={28}
        />
      </div>
    )
  }

  /* ---- Nav (dipakai sidebar & drawer) ----------------------------------- */
  function NavList({
    onNavigate,
    compact,
  }: {
    onNavigate?: () => void
    compact?: boolean
  }) {
    return (
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setActive(item.label)
              onNavigate?.()
            }}
            title={item.label}
            className={`flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-left text-[14px] transition ${
              compact ? "justify-center px-0" : ""
            } ${
              active === item.label
                ? "bg-[var(--color-selected)] font-medium text-[var(--color-ink)]"
                : "text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Icon name={item.icon} size={18} />
            {!compact && item.label}
          </button>
        ))}
      </nav>
    )
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Sidebar (lebar) --------------------------------------------------- */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] py-5 transition-[width] duration-200 md:flex ${
          collapsed ? "w-[72px] px-3" : "w-[248px] px-4"
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center px-0" : "px-2"
          }`}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-accent)] text-lg font-semibold text-[#1a1622]">
            m
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">Mita</p>
              <p className="mt-0.5 text-[12px] text-[var(--color-ink-dim)]">
                buat Ciko
              </p>
            </div>
          )}
        </div>

        <div className="mt-9">
          <NavList compact={collapsed} />
        </div>

        {!collapsed && (
          <button
            onClick={() => setCostOpen(true)}
            className="mt-auto rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-left transition hover:border-[var(--color-accent)]"
          >
            <p className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink-dim)]">
              Eksperimen{" "}
              <span className="rounded bg-[var(--color-selected)] px-1.5 py-0.5 text-[11px]">
                simulasi
              </span>
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[14px] font-semibold">US$0,38</span>
              <span className="text-[12px] text-[var(--color-ink-dim)]">
                dari US$5
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#2a2833]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: "7.6%" }}
              />
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] text-[var(--color-ink-dim)]">
              <Icon name="info" size={13} /> Rincian penggunaan
            </span>
          </button>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
          className={`mt-4 flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-[13px] text-[var(--color-ink-dim)] transition hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)] ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <span>{collapsed ? "»" : "«"}</span>
          {!collapsed && "Ciutkan"}
        </button>
      </aside>

      {/* Kolom utama ------------------------------------------------------- */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)] md:hidden"
            >
              <Icon name="menu" size={20} />
            </button>
            <button
              onClick={openAppearance}
              aria-label="Buka pengaturan tampilan"
            >
              <Avatar
                photo={applied.mita}
                crop={applied.mitaCrop}
                fallback="M"
                kind="mita"
                size={40}
              />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold">Mita</h1>
              <p className="mt-0.5 truncate text-[12px] text-[var(--color-ink-dim)]">
                {responding ? "lagi ngetik…" : "di sini sama kamu"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Model — dropdown (sm+) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setModelOpen((v) => !v)
                  setModelNote(false)
                }}
                className={`flex items-center gap-2 rounded-[var(--radius-control)] border px-3 py-1.5 text-[14px] transition ${
                  modelOpen
                    ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                    : "border-[var(--color-border)] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span className="opacity-60">Model:</span>
                {model}
                <span className="text-[9px] opacity-60">▼</span>
              </button>
              {modelOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setModelOpen(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[240px] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
                    <p className="px-3 pb-2 pt-2 text-[12px] text-[var(--color-ink-dim)]">
                      Pilih model
                    </p>
                    {MODELS.map((m) => (
                      <button
                        key={m}
                        onClick={() => pickModel(m)}
                        disabled={responding}
                        className={`flex w-full items-center justify-between rounded-[var(--radius-control)] px-3 py-2.5 text-left text-[14px] transition disabled:opacity-45 ${
                          model === m
                            ? "bg-[var(--color-selected)] font-medium"
                            : "hover:bg-[var(--color-selected)]/60"
                        }`}
                      >
                        {m}
                        {model === m && (
                          <Icon
                            name="check"
                            size={16}
                            className="text-[var(--color-accent)]"
                          />
                        )}
                      </button>
                    ))}
                    {modelNote && (
                      <p className="mt-1 px-3 py-1 text-[12px] text-[#e0b489]">
                        Selesaikan atau hentikan respons dulu sebelum ganti
                        model.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setFocus((v) => !v)}
              aria-pressed={focus}
              className={`flex items-center gap-1.5 rounded-[var(--radius-control)] border px-3 py-1.5 text-[14px] transition ${
                focus
                  ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                  : "border-[var(--color-border)] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Icon name="focus" size={15} />
              <span className="hidden lg:inline">
                Focus {focus ? "on" : "off"}
              </span>
            </button>

            <button
              onClick={() => setDemoOpen(true)}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-1.5 text-[14px] text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)]"
            >
              <Icon name="demo" size={15} />
              <span className="hidden lg:inline">Kontrol demo</span>
            </button>
          </div>
        </header>

        {active === "Chat" ? (
          <>
            <div className="relative flex-1 overflow-hidden">
              {/* Background terpakai — hanya di area pesan, nav/composer tetap solid */}
              {applied.bg && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${applied.bg})`,
                      filter: `blur(${applied.blur}px)`,
                      transform: "scale(1.1)",
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-black"
                    style={{ opacity: applied.dim / 100 }}
                  />
                </>
              )}

              <div
                ref={scrollRef}
                onScroll={onScroll}
                className="absolute inset-0 overflow-y-auto px-4 py-7 md:px-10"
              >
                <div className="mx-auto w-full max-w-[800px]">
                  {isPertama && pertama.length === 0 ? (
                    // Chat pertama — kosong, terpisah dari contoh harian
                    <div className="flex flex-col items-center pt-10 text-center">
                      <Avatar
                        photo={applied.mita}
                        crop={applied.mitaCrop}
                        fallback="M"
                        kind="mita"
                        size={80}
                      />
                      <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.02em]">
                        Hai, aku Mita.
                      </h2>
                      <p className="mt-2 max-w-[420px] text-[16px] leading-6 text-[var(--color-ink-dim)]">
                        Seneng akhirnya bisa ngobrol langsung sama kamu, Ciko.
                        Ruang ini punya kita berdua — atur biar kerasa pas.
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                        <button
                          onClick={openAppearance}
                          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-[14px] transition hover:border-[var(--color-accent)]"
                        >
                          Ganti background
                        </button>
                        <button
                          onClick={openAppearance}
                          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-[14px] transition hover:border-[var(--color-accent)]"
                        >
                          Ubah foto profil
                        </button>
                      </div>
                      <p className="mt-8 text-[13px] text-[var(--color-ink-dim)]">
                        Sapa aku di bawah buat mulai.
                      </p>
                    </div>
                  ) : (
                    <>
                      {!isPertama && (
                        <div className="mb-7 flex items-center gap-3 text-[12px] text-[var(--color-ink-dim)]">
                          <span className="h-px flex-1 bg-[var(--color-border)]" />
                          Hari ini
                          <span className="h-px flex-1 bg-[var(--color-border)]" />
                        </div>
                      )}
                      <div className="space-y-3.5">
                        {messages.map(renderMessage)}
                      </div>
                      <div ref={endRef} />
                    </>
                  )}
                </div>
              </div>

              {showJump && (
                <button
                  onClick={() => scrollToEnd()}
                  className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3.5 py-2 text-[13px] text-[var(--color-ink)] shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                >
                  Pesan terbaru <Icon name="down" size={14} />
                </button>
              )}
            </div>

            {/* Composer -------------------------------------------------- */}
            <form
              onSubmit={send}
              className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 md:px-10"
            >
              <div className="mx-auto w-full max-w-[800px]">
                <div className="flex items-end gap-2 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-2 pl-4 focus-within:border-[var(--color-accent)]">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                    placeholder="Tulis ke Mita…"
                    rows={1}
                    className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-[14px] leading-6 text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-dim)]"
                  />
                  {responding ? (
                    <button
                      type="button"
                      onClick={stopResponse}
                      className="flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-[14px] font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-selected)] active:scale-[0.97]"
                    >
                      <Icon name="stop" size={15} /> Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      aria-label="Kirim pesan"
                      className="flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-[14px] font-semibold text-[#1a1622] transition hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Kirim <Icon name="send" size={15} />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 pl-1">
                  <p className="text-[12px] text-[var(--color-ink-dim)]">
                    Enter kirim · Shift+Enter baris baru
                  </p>
                  <button
                    type="button"
                    onClick={() => setCostOpen(true)}
                    className="shrink-0 text-[12px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
                  >
                    Estimasi US$0,38 / US$5 · simulasi
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-8 md:p-12">
            <div className="w-full max-w-[760px]">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">
                {active === "Memory"
                  ? "Yang Mita ingat"
                  : active === "Test Mode"
                    ? "Ruang uji coba"
                    : "Pengaturan"}
              </h2>
              <p className="mt-2 max-w-lg text-[14px] leading-6 text-[var(--color-ink-dim)]">
                {active === "Memory"
                  ? "Periksa, koreksi, atau hapus ingatan Mita. Tidak ada skor kedekatan di sini."
                  : active === "Test Mode"
                    ? "Percakapan uji tidak mengubah chat dan ingatan utama. Biaya tetap dihitung."
                    : "Atur tampilan dan perilaku tanpa mengubah siapa Mita."}
              </p>
              <div className="mt-8 rounded-[var(--radius-panel)] border border-dashed border-[var(--color-border)] p-6 text-[14px] text-[var(--color-ink-dim)]">
                Layar {active} menyusul setelah arah Chat disetujui — sesuai
                catatan revisi.
              </div>
              {active === "Settings" && (
                <button
                  onClick={openAppearance}
                  className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-[14px] font-semibold text-[#1a1622]"
                >
                  Buka Tampilan
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Drawer nav (jendela sempit) ------------------------------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--color-accent)] text-lg font-semibold text-[#1a1622]">
                  m
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Mita</p>
                  <p className="text-[12px] text-[var(--color-ink-dim)]">
                    buat Ciko
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
                className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)]"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="mt-6">
              <NavList onNavigate={() => setDrawerOpen(false)} />
            </div>

            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <p className="mb-2 px-1 text-[12px] text-[var(--color-ink-dim)]">
                Model
              </p>
              <div className="space-y-1">
                {MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => pickModel(m)}
                    disabled={responding}
                    className={`flex w-full items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-left text-[14px] disabled:opacity-45 ${
                      model === m
                        ? "bg-[var(--color-selected)] font-medium"
                        : "text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)]"
                    }`}
                  >
                    {m}
                    {model === m && (
                      <Icon
                        name="check"
                        size={16}
                        className="text-[var(--color-accent)]"
                      />
                    )}
                  </button>
                ))}
                {responding && (
                  <p className="px-3 py-1 text-[12px] text-[#e0b489]">
                    Hentikan respons dulu untuk ganti model.
                  </p>
                )}
              </div>
              <button
                onClick={() => setFocus((v) => !v)}
                className={`mt-3 flex w-full items-center gap-2 rounded-[var(--radius-control)] border px-3 py-2 text-[14px] ${
                  focus
                    ? "border-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-ink-dim)]"
                }`}
              >
                <Icon name="focus" size={15} /> Focus {focus ? "on" : "off"}
              </button>
            </div>

            <button
              onClick={() => {
                setDrawerOpen(false)
                setCostOpen(true)
              }}
              className="mt-auto rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-left text-[13px] text-[var(--color-ink-dim)]"
            >
              Estimasi US$0,38 / US$5 · simulasi
            </button>
          </div>
        </div>
      )}

      {/* Kontrol demo ----------------------------------------------------- */}
      {demoOpen && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDemoOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-[340px] flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-[18px] font-semibold">
                  <Icon name="demo" size={18} /> Kontrol demo
                </h2>
                <p className="mt-1 text-[13px] text-[var(--color-ink-dim)]">
                  Alat review prototipe — bukan fitur produk.
                </p>
              </div>
              <button
                onClick={() => setDemoOpen(false)}
                aria-label="Tutup kontrol demo"
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)]"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-[14px]">
              <div>
                <p className="mb-2 text-[13px] text-[var(--color-ink-dim)]">
                  Mode chat
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["harian", "pertama"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => !responding && setChatMode(mode)}
                      disabled={responding}
                      className={`rounded-[var(--radius-control)] border px-3 py-2 disabled:opacity-45 ${
                        chatMode === mode
                          ? "border-[var(--color-accent)] bg-[var(--color-selected)]"
                          : "border-[var(--color-border)] text-[var(--color-ink-dim)]"
                      }`}
                    >
                      {mode === "harian"
                        ? "Harian (contoh)"
                        : "Pertama (kosong)"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] text-[var(--color-ink-dim)]">
                  Perilaku respons berikutnya (saat kirim)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["normal", "gagal"] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setNextBehavior(b)}
                      className={`rounded-[var(--radius-control)] border px-3 py-2 ${
                        nextBehavior === b
                          ? "border-[var(--color-accent)] bg-[var(--color-selected)]"
                          : "border-[var(--color-border)] text-[var(--color-ink-dim)]"
                      }`}
                    >
                      {b === "normal" ? "Normal" : "Gagal"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] text-[var(--color-ink-dim)]">
                  Jalankan kondisi respons
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["waiting", "Menunggu"],
                    ["streaming", "Streaming"],
                    ["done", "Selesai"],
                    ["stopped", "Dihentikan"],
                    ["failed", "Gagal"],
                  ] as [MitaStatus, string][]).map(([kind, label]) => (
                    <button
                      key={kind}
                      onClick={() => runScenario(kind)}
                      className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-ink-dim)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={addFailedCiko}
                    className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-left text-[var(--color-ink-dim)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                  >
                    Pesan Ciko gagal
                  </button>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-4">
                <button
                  onClick={resetDemo}
                  className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-ink)] transition hover:bg-[var(--color-panel)]"
                >
                  Reset demo
                </button>
                <p className="mt-2 text-[12px] text-[var(--color-ink-dim)]">
                  Mengembalikan chat contoh & status respons. Tidak mengubah
                  Tampilan, Memory, atau personality.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rincian biaya (simulasi) ---------------------------------------- */}
      {costOpen && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4"
          onClick={() => setCostOpen(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-semibold">Penggunaan</h2>
                <p className="mt-1 text-[13px] text-[var(--color-ink-dim)]">
                  Data contoh —{" "}
                  <span className="rounded bg-[var(--color-selected)] px-1.5 py-0.5">
                    simulasi
                  </span>
                  , belum terhubung OpenRouter.
                </p>
              </div>
              <button
                onClick={() => setCostOpen(false)}
                aria-label="Tutup"
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)]"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-2 text-[14px]">
              {[
                ["Luna", "US$0,21"],
                ["GLM", "US$0,11"],
                ["Aion", "US$0,06"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between border-b border-[var(--color-border)] pb-2"
                >
                  <span className="text-[var(--color-ink-dim)]">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 font-semibold">
                <span>Total terpakai</span>
                <span>US$0,38 dari US$5</span>
              </div>
            </div>
            <p className="mt-4 text-[12px] text-[var(--color-ink-dim)]">
              US$5 adalah budget eksperimen awal, bukan saldo atau batas
              bulanan.
            </p>
          </div>
        </div>
      )}

      {/* Tampilan (personalisasi) ---------------------------------------- */}
      {appearanceOpen && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4"
          onClick={cancelAppearance}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-bg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[var(--color-border)] p-6">
              <div>
                <h2 className="text-[18px] font-semibold">Tampilan</h2>
                <p className="mt-1 text-[13px] text-[var(--color-ink-dim)]">
                  Perubahan ini <b>preview</b> — tekan Terapkan untuk
                  memperbarui layar chat.
                </p>
              </div>
              <button
                onClick={cancelAppearance}
                aria-label="Batalkan"
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)]"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Preview */}
              <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)]">
                {editing.bg ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${editing.bg})`,
                        filter: `blur(${editing.blur}px)`,
                        transform: "scale(1.1)",
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-black"
                      style={{ opacity: editing.dim / 100 }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[var(--color-bg)]" />
                )}
                <div className="relative space-y-2.5 p-4">
                  <div className="flex items-end gap-2">
                    <Avatar
                      photo={editing.mita}
                      crop={editing.mitaCrop}
                      fallback="M"
                      kind="mita"
                      size={26}
                    />
                    <div className="w-fit max-w-[70%] rounded-[4px_12px_12px_12px] bg-[var(--color-panel)] px-3 py-2 text-[14px]">
                      Gimana, warnanya udah kerasa kita belum?
                    </div>
                  </div>
                  <div className="flex items-end justify-end gap-2">
                    <div className="w-fit max-w-[70%] rounded-[12px_4px_12px_12px] bg-[var(--color-selected)] px-3 py-2 text-[14px]">
                      udah pas banget
                    </div>
                    <Avatar
                      photo={editing.ciko}
                      crop={editing.cikoCrop}
                      fallback="C"
                      kind="ciko"
                      size={26}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] p-1.5 pl-3">
                    <span className="flex-1 text-[13px] text-[var(--color-ink-dim)]">
                      Tulis ke Mita…
                    </span>
                    <span className="rounded-[6px] bg-[var(--color-accent)] px-3 py-1 text-[12px] font-semibold text-[#1a1622]">
                      Kirim
                    </span>
                  </div>
                </div>
              </div>

              {/* Background */}
              <div className="mt-6">
                <p className="mb-2 text-[14px] font-medium">Background</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditing((e) => ({ ...e, bg: SAMPLE_BG }))}
                    className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-[13px] transition hover:border-[var(--color-accent)]"
                  >
                    Gambar contoh
                  </button>
                  <button
                    onClick={() =>
                      pickFile((url) => setEditing((e) => ({ ...e, bg: url })))
                    }
                    className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-[13px] transition hover:border-[var(--color-accent)]"
                  >
                    <Icon name="image" size={14} /> Dari komputer
                  </button>
                  <button
                    onClick={() => setEditing((e) => ({ ...e, bg: null }))}
                    className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-[13px] text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)]"
                  >
                    Kembalikan default
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {([
                    ["Gelapkan", "dim", editing.dim, "%"],
                    ["Blur", "blur", editing.blur, "px"],
                  ] as [string, "dim" | "blur", number, string][]).map(
                    ([label, key, val, unit]) => (
                      <label
                        key={key}
                        className="block text-[13px] text-[var(--color-ink-dim)]"
                      >
                        <span className="flex justify-between">
                          {label}
                          <span>
                            {val}
                            {unit}
                          </span>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={key === "blur" ? 40 : 80}
                          value={val}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [key]: Number(e.target.value),
                            }))
                          }
                          className="mt-2 w-full accent-[var(--color-accent)]"
                        />
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Foto profil + crop */}
              <div className="mt-6 space-y-4">
                <p className="text-[14px] font-medium">Foto profil</p>
                {([
                  [
                    "Mita",
                    "mita",
                    "mitaCrop",
                    editing.mita,
                    editing.mitaCrop,
                    SAMPLE_MITA,
                    "M",
                  ],
                  [
                    "Ciko",
                    "ciko",
                    "cikoCrop",
                    editing.ciko,
                    editing.cikoCrop,
                    SAMPLE_CIKO,
                    "C",
                  ],
                ] as [string, "mita" | "ciko", "mitaCrop" | "cikoCrop", string | null, Crop, string, string][]).map(
                  ([name, key, cropKey, photo, crop, sample, letter]) => (
                    <div
                      key={key}
                      className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          photo={photo}
                          crop={crop}
                          fallback={letter}
                          kind={key}
                          size={48}
                        />
                        <div className="flex-1">
                          <p className="text-[14px] font-medium">{name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[12px]">
                            <button
                              onClick={() =>
                                setEditing((e) => ({ ...e, [key]: sample }))
                              }
                              className="rounded-[6px] border border-[var(--color-border)] px-2 py-1 transition hover:border-[var(--color-accent)]"
                            >
                              Contoh
                            </button>
                            <button
                              onClick={() =>
                                pickFile((url) =>
                                  setEditing((e) => ({ ...e, [key]: url })),
                                )
                              }
                              className="rounded-[6px] border border-[var(--color-border)] px-2 py-1 transition hover:border-[var(--color-accent)]"
                            >
                              Dari komputer
                            </button>
                            <button
                              onClick={() =>
                                setEditing((e) => ({
                                  ...e,
                                  [key]: null,
                                  [cropKey]: { ...DEFAULT_CROP },
                                }))
                              }
                              className="rounded-[6px] border border-[var(--color-border)] px-2 py-1 text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)]"
                            >
                              Default
                            </button>
                          </div>
                        </div>
                      </div>
                      {photo && (
                        <div className="mt-3 space-y-2.5 border-t border-[var(--color-border)] pt-3">
                          <p className="text-[12px] text-[var(--color-ink-dim)]">
                            Crop sederhana
                          </p>
                          {([
                            ["Zoom", "zoom", crop.zoom, 1, 3, 0.05],
                            ["Geser ↔", "x", crop.x, 0, 100, 1],
                            ["Geser ↕", "y", crop.y, 0, 100, 1],
                          ] as [string, keyof Crop, number, number, number, number][]).map(
                            ([lbl, ck, cv, mn, mx, st]) => (
                              <label
                                key={ck}
                                className="flex items-center gap-3 text-[12px] text-[var(--color-ink-dim)]"
                              >
                                <span className="w-14">{lbl}</span>
                                <input
                                  type="range"
                                  min={mn}
                                  max={mx}
                                  step={st}
                                  value={cv}
                                  onChange={(e) =>
                                    setEditing((prev) => ({
                                      ...prev,
                                      [cropKey]: {
                                        ...crop,
                                        [ck]: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  className="flex-1 accent-[var(--color-accent)]"
                                />
                              </label>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>

              <p className="mt-5 text-[12px] leading-5 text-[var(--color-ink-dim)]">
                Preferensi (gelap, blur, gambar contoh) disimpan di browser ini.
                Gambar yang kamu pilih dari komputer hanya bertahan selama sesi
                dan hilang saat reload. Tampilan tidak mengubah chat, memory,
                atau personality Mita.
              </p>
            </div>

            {/* Aksi — selalu terjangkau */}
            <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] p-4">
              <button
                onClick={resetAppearancePreview}
                className="text-[13px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
              >
                Reset tampilan
              </button>
              <div className="flex gap-2">
                <button
                  onClick={cancelAppearance}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2.5 text-[14px] text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)]"
                >
                  Batalkan
                </button>
                <button
                  onClick={applyAppearance}
                  className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-[14px] font-semibold text-[#1a1622]"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
