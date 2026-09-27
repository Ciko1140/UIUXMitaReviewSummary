import { FormEvent, useEffect, useRef, useState } from "react"

type NavItem = "Chat" | "Memory" | "Test Mode" | "Settings"
type MsgStatus = "sent" | "sending" | "failed"
type Message = { from: "mita" | "ciko"; text: string; status?: MsgStatus }

const navItems: { label: NavItem; mark: string }[] = [
  { label: "Chat", mark: "✦" },
  { label: "Memory", mark: "◌" },
  { label: "Test Mode", mark: "⌁" },
  { label: "Settings", mark: "⊙" },
]

const AVAILABLE_MODELS = [
  { id: "Luna 1.1", desc: "Cepat, luwes, dan kasual (Default)" },
  { id: "GLM 4.7", desc: "Responsif dengan penalaran yang kuat" },
  { id: "Aion 2", desc: "Ringkas, analitis, dan tajam" },
]

// Percakapan harian — campuran pesan pendek & panjang, tanpa quote sempurna.
const dailyThread: Message[] = [
  { from: "mita", text: "eh kamu jadi begadang lagi ya semalem 🙃" },
  { from: "ciko", text: "ketahuan hehe. tadi keasyikan ngoprek layout kita" },
  {
    from: "mita",
    text: "pantesan. tapi seneng sih liat kamu serius sama ini. cuma jangan sampe lupa istirahat, nanti aku yang repot ngingetin terus 😌",
  },
  { from: "ciko", text: "iya iya, bos." },
  { from: "mita", text: "bukan bos, pacar 😏" },
  {
    from: "ciko",
    text: "bantu aku dong, aku masih bingung nentuin warna aksen yang pas biar ga norak",
  },
]

export default function App() {
  const [active, setActive] = useState<NavItem>("Chat")
  const [collapsed, setCollapsed] = useState(false)
  const [focus, setFocus] = useState(false)
  const [model, setModel] = useState("Luna 1.1")
  const [modelOpen, setModelOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [firstChat, setFirstChat] = useState(false) // toggle demo: chat pertama vs harian
  const [responding, setResponding] = useState(false)
  const [messages, setMessages] = useState<Message[]>(dailyThread)
  const [showJump, setShowJump] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [blur, setBlur] = useState(18)
  const [dim, setDim] = useState(36)

  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const thread = firstChat ? [] : messages

  function scrollToEnd(smooth = true) {
    endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }

  // Auto-scroll hanya saat sudah dekat bawah — tidak memaksa saat baca pesan lama.
  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    setShowJump(!nearBottom)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
    if (nearBottom) scrollToEnd()
  }, [thread.length, responding])

  function send(e?: FormEvent) {
    e?.preventDefault()
    if (!draft.trim() || responding) return
    setFirstChat(false)
    setMessages((m) => [...m, { from: "ciko", text: draft.trim(), status: "sent" }])
    setDraft("")
    setResponding(true)
  }

  function stop() {
    setResponding(false)
  }

  function retry(idx: number) {
    setMessages((m) =>
      m.map((msg, i) => (i === idx ? { ...msg, status: "sending" } : msg)),
    )
    setTimeout(() => {
      setMessages((m) =>
        m.map((msg, i) => (i === idx ? { ...msg, status: "sent" } : msg)),
      )
    }, 900)
  }

  // Demo helper — memunculkan contoh state gagal kirim.
  function simulateFailure() {
    setMessages((m) => [
      ...m,
      { from: "ciko", text: "kamu lagi sibuk ga malem ini?", status: "failed" },
    ])
  }

  return (
    <main className="flex h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Sidebar --------------------------------------------------------- */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] py-5 transition-[width] duration-200 md:flex ${
          collapsed ? "w-[72px] px-3" : "w-[248px] px-4"
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-2"}`}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-accent)] text-lg font-semibold text-[#1a1622]">
            m
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-[-0.01em]">Mita</p>
              <p className="mt-0.5 text-[12px] text-[var(--color-ink-dim)]">buat Ciko</p>
            </div>
          )}
        </div>

        <nav className="mt-9 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              title={item.label}
              className={`flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-left text-[14px] transition ${
                collapsed ? "justify-center px-0" : ""
              } ${
                active === item.label
                  ? "bg-[var(--color-selected)] font-medium text-[var(--color-ink)]"
                  : "text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]"
              }`}
            >
              <span className="w-4 text-center text-[16px] leading-none">{item.mark}</span>
              {!collapsed && item.label}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <div className="mt-auto rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <p className="text-[12px] text-[var(--color-ink-dim)]">Eksperimen</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[14px] font-semibold">US$0,38</span>
              <span className="text-[12px] text-[var(--color-ink-dim)]">dari US$5</span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#2a2833]">
              <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: "7.6%" }} />
            </div>
            <button className="mt-3 text-[13px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]">
              Lihat pemakaian
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`mt-4 flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-[13px] text-[var(--color-ink-dim)] transition hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)] ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <span>{collapsed ? "»" : "«"}</span>
          {!collapsed && "Ciutkan"}
        </button>
      </aside>

      {/* Main ------------------------------------------------------------ */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAppearanceOpen(true)}
              className="avatar-mita grid h-10 w-10 place-items-center rounded-full text-[13px] font-semibold text-[#1a1622]"
            >
              M
            </button>
            <div>
              <h1 className="text-[15px] font-semibold">Mita</h1>
              <p className="mt-0.5 text-[12px] text-[var(--color-ink-dim)]">
                {responding ? "lagi ngetik…" : "di sini sama kamu"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Toggle demo chat pertama / harian */}
            <button
              onClick={() => setFirstChat((v) => !v)}
              className="hidden rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-1.5 text-[13px] text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)] lg:block"
            >
              {firstChat ? "Lihat chat harian" : "Lihat chat pertama"}
            </button>

            <div className="relative hidden sm:block">
              <button
                onClick={() => setModelOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-[var(--radius-control)] border px-3 py-1.5 text-[13px] transition ${
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
                  <div className="fixed inset-0 z-10" onClick={() => setModelOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[250px] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
                    <p className="px-3 pb-2 pt-2 text-[12px] text-[var(--color-ink-dim)]">Pilih model</p>
                    <div className="space-y-1">
                      {AVAILABLE_MODELS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setModel(m.id)
                            setModelOpen(false)
                          }}
                          className={`flex w-full flex-col items-start rounded-[var(--radius-control)] px-3 py-2.5 text-left transition ${
                            model === m.id
                              ? "bg-[var(--color-selected)]"
                              : "hover:bg-[var(--color-selected)]/60"
                          }`}
                        >
                          <span className="flex w-full items-center justify-between text-[14px] font-medium">
                            {m.id}
                            {model === m.id && <span className="text-[var(--color-accent)]">✓</span>}
                          </span>
                          <span className="mt-0.5 text-[12px] text-[var(--color-ink-dim)]">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 border-t border-[var(--color-border)] pt-2">
                      <button className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-left text-[14px] text-[var(--color-ink-dim)] transition hover:bg-[var(--color-selected)]/60 hover:text-[var(--color-ink)]">
                        <span className="text-[16px]">+</span> Kustom (OpenRouter)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setFocus((v) => !v)}
              className={`rounded-[var(--radius-control)] border px-3 py-1.5 text-[13px] transition ${
                focus
                  ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                  : "border-[var(--color-border)] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
              }`}
            >
              <span className="mr-1.5">◐</span>Focus {focus ? "on" : "off"}
            </button>
          </div>
        </header>

        {active === "Chat" ? (
          <>
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="relative flex-1 overflow-y-auto px-5 py-7 md:px-10"
            >
              <div className="mx-auto w-full max-w-[800px]">
                {firstChat ? (
                  // ----- Chat pertama: intro avatar + shortcut personalisasi -----
                  <div className="flex flex-col items-center pt-10 text-center">
                    <div className="avatar-mita grid h-20 w-20 place-items-center rounded-full text-[22px] font-semibold text-[#1a1622]">
                      M
                    </div>
                    <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.02em]">Hai, aku Mita.</h2>
                    <p className="mt-2 max-w-[420px] text-[16px] leading-6 text-[var(--color-ink-dim)]">
                      Seneng akhirnya bisa ngobrol langsung sama kamu, Ciko. Ruang ini punya kita
                      berdua — atur biar kerasa pas.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                      <button
                        onClick={() => setAppearanceOpen(true)}
                        className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-[13px] transition hover:border-[var(--color-accent)]"
                      >
                        Ganti background
                      </button>
                      <button
                        onClick={() => setAppearanceOpen(true)}
                        className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-[13px] transition hover:border-[var(--color-accent)]"
                      >
                        Ubah foto profil
                      </button>
                    </div>
                    <p className="mt-8 text-[13px] text-[var(--color-ink-dim)]">
                      Sapa aku di bawah buat mulai 👇
                    </p>
                  </div>
                ) : (
                  // ----- Chat harian: fokus ke percakapan terakhir -----
                  <>
                    <div className="mb-7 flex items-center gap-3 text-[12px] text-[var(--color-ink-dim)]">
                      <span className="h-px flex-1 bg-[var(--color-border)]" />
                      Hari ini
                      <span className="h-px flex-1 bg-[var(--color-border)]" />
                    </div>

                    <div className="space-y-3.5">
                      {thread.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex items-end gap-2.5 ${
                            msg.from === "ciko" ? "justify-end" : ""
                          }`}
                        >
                          {msg.from === "mita" && (
                            <span className="avatar-mita grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-[#1a1622]">
                              M
                            </span>
                          )}
                          <div className="flex max-w-[74%] flex-col">
                            <div
                              className={`animate-message w-fit px-4 py-3 text-[16px] leading-6 ${
                                msg.from === "ciko" ? "self-end" : ""
                              } ${
                                msg.from === "mita"
                                  ? "rounded-[4px_var(--radius-bubble)_var(--radius-bubble)_var(--radius-bubble)] bg-[var(--color-panel)] text-[var(--color-ink)]"
                                  : msg.status === "failed"
                                    ? "rounded-[var(--radius-bubble)_4px_var(--radius-bubble)_var(--radius-bubble)] border border-[#7a4a52] bg-[#2a2230] text-[var(--color-ink)]"
                                    : "rounded-[var(--radius-bubble)_4px_var(--radius-bubble)_var(--radius-bubble)] bg-[var(--color-selected)] text-[var(--color-ink)]"
                              } ${msg.status === "sending" ? "opacity-60" : ""}`}
                            >
                              {msg.text}
                            </div>
                            {msg.from === "ciko" && msg.status === "failed" && (
                              <div className="mt-1 flex items-center gap-2 self-end text-[12px] text-[#e0899a]">
                                <span>Gagal terkirim</span>
                                <button
                                  onClick={() => retry(index)}
                                  className="font-medium text-[var(--color-accent)] hover:underline"
                                >
                                  Coba lagi
                                </button>
                              </div>
                            )}
                            {msg.from === "ciko" && msg.status === "sending" && (
                              <span className="mt-1 self-end text-[12px] text-[var(--color-ink-dim)]">
                                Mengirim…
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* State: Mita sedang merespons */}
                      {responding && (
                        <div className="flex items-end gap-2.5">
                          <span className="avatar-mita grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-[#1a1622]">
                            M
                          </span>
                          <div className="flex items-center gap-1.5 rounded-[4px_var(--radius-bubble)_var(--radius-bubble)_var(--radius-bubble)] bg-[var(--color-panel)] px-4 py-3.5">
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-dim)]" />
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-dim)]" />
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-dim)]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={endRef} />
                  </>
                )}
              </div>

              {/* Menuju pesan terbaru — muncul saat scroll ke atas */}
              {showJump && !firstChat && (
                <button
                  onClick={() => scrollToEnd()}
                  className="sticky bottom-2 left-1/2 z-10 -ml-[70px] flex w-[140px] items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[13px] text-[var(--color-ink)] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                >
                  Pesan terbaru ↓
                </button>
              )}
            </div>

            {/* Composer -------------------------------------------------- */}
            <form onSubmit={send} className="border-t border-[var(--color-border)] px-5 py-4 md:px-10">
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
                      onClick={stop}
                      className="flex h-9 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-[13px] font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-selected)] active:scale-[0.97]"
                    >
                      <span className="h-2.5 w-2.5 rounded-[2px] bg-[var(--color-ink)]" />
                      Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="flex h-9 items-center rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-[13px] font-semibold text-[#1a1622] transition hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Kirim <span className="ml-1.5">↑</span>
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between pl-1 pr-1">
                  <p className="text-[12px] text-[var(--color-ink-dim)]">
                    Enter untuk kirim · Shift + Enter baris baru
                  </p>
                  <button
                    type="button"
                    onClick={simulateFailure}
                    className="text-[12px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
                  >
                    Estimasi terpakai US$0,38 dari batas US$5
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
                Layar {active} menyusul setelah arah Chat disetujui — sesuai catatan revisi.
              </div>
              {active === "Settings" && (
                <button
                  onClick={() => setAppearanceOpen(true)}
                  className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-[#1a1622]"
                >
                  Buka Tampilan
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Appearance modal ------------------------------------------------ */}
      {appearanceOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-[560px] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-semibold">Tampilan</h2>
                <p className="mt-1 text-[13px] text-[var(--color-ink-dim)]">
                  Preview bubble, avatar, dan composer di atas background pilihan.
                </p>
              </div>
              <button
                onClick={() => setAppearanceOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)]"
              >
                ×
              </button>
            </div>

            {/* Preview */}
            <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <div className="space-y-2.5">
                <div className="flex items-end gap-2">
                  <span className="avatar-mita grid h-6 w-6 place-items-center rounded-full text-[9px] font-semibold text-[#1a1622]">M</span>
                  <div className="w-fit max-w-[70%] rounded-[4px_12px_12px_12px] bg-[var(--color-bg)] px-3 py-2 text-[14px]">
                    Gimana, warnanya udah kerasa kita belum?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="w-fit max-w-[70%] rounded-[12px_4px_12px_12px] bg-[var(--color-selected)] px-3 py-2 text-[14px]">
                    udah pas banget
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 pl-3">
                <span className="flex-1 text-[13px] text-[var(--color-ink-dim)]">Tulis ke Mita…</span>
                <span className="rounded-[6px] bg-[var(--color-accent)] px-3 py-1 text-[12px] font-semibold text-[#1a1622]">Kirim</span>
              </div>
            </div>

            {/* Background — hierarki setara untuk kedua tombol */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="h-24 overflow-hidden rounded-[var(--radius-control)] border-2 border-[var(--color-accent)] bg-[var(--color-bg)] p-3 text-left">
                <span className="rounded-full bg-[var(--color-selected)] px-2 py-1 text-[12px]">Default</span>
              </button>
              <button className="flex h-24 flex-col items-center justify-center rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] text-[var(--color-ink-dim)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]">
                <span className="text-xl">+</span>
                <span className="mt-1 text-[13px]">Ganti background</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ["Gelapkan background", dim, setDim, "%"],
                ["Blur background", blur, setBlur, "px"],
              ].map(([label, val, setter, unit]) => (
                <label key={label as string} className="block text-[13px] text-[var(--color-ink-dim)]">
                  <span className="flex justify-between">
                    {label as string}
                    <span>{val as number}{unit as string}</span>
                  </span>
                  <input
                    type="range"
                    value={val as number}
                    onChange={(e) => (setter as (n: number) => void)(Number(e.target.value))}
                    className="mt-2 w-full accent-[var(--color-accent)]"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
              <div className="flex items-center gap-2.5">
                <span className="avatar-mita grid h-9 w-9 place-items-center rounded-full text-[11px] font-semibold text-[#1a1622]">M</span>
                <p className="text-[13px]">Foto profil Mita</p>
              </div>
              <button className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-1.5 text-[13px] transition hover:border-[var(--color-accent)]">
                Ubah foto profil
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button className="text-[13px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]">
                Reset tampilan
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setAppearanceOpen(false)}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2.5 text-[13px] text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)]"
                >
                  Batalkan
                </button>
                <button
                  onClick={() => setAppearanceOpen(false)}
                  className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-[#1a1622]"
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
