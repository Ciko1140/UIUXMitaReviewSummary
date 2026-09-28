import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// I will write custom search/replace carefully, targeting exact blocks without repeating.

// 1. Message type
content = content.replace(
  'type Message =\n  | { from: "ciko"; text: string; status: CikoStatus }\n  | { from: "mita"; text: string; status: MitaStatus }',
  'type Message = { id: string; from: "ciko" | "mita"; text: string; status: CikoStatus | MitaStatus; ignored?: boolean }'
);
content = content.replace(
  'type Message = { from: "ciko" text: string status: CikoStatus } | {\n  from: "mita"\n  text: string\n  status: MitaStatus\n}',
  'type Message = { id: string; from: "ciko" | "mita"; text: string; status: CikoStatus | MitaStatus; ignored?: boolean }'
);
// Remove any stray Message type definition if any
const countMsg = (content.match(/type Message =/g) || []).length;
if(countMsg > 1) {
  content = content.replace(/type Message = \{ id: string; from: "ciko" \| "mita"; text: string; status: CikoStatus \| MitaStatus; ignored\?: boolean \}/, '');
}

// 2. Add Memory stuff before DAILY
const memGlobal = `type MemoryCategory = "Tentang Ciko" | "Cara Kita Berinteraksi" | "Pengalaman Bersama" | "Topik Belum Selesai" | "Referensi Bersama"
type MemoryItem = {
  id: string
  category: MemoryCategory
  content: string
  source: "Dari Ciko" | "Observasi Sementara" | "Roleplay"
  sourceMsg?: string
  date: string
  status?: "pending" | "done" | "no-followup"
}
const MEMORY_CATEGORIES: MemoryCategory[] = ["Tentang Ciko", "Cara Kita Berinteraksi", "Pengalaman Bersama", "Topik Belum Selesai", "Referensi Bersama"]
const MOCK_MEMORIES: MemoryItem[] = [
  {
    id: "mem1",
    category: "Tentang Ciko",
    content: "Suka kopi hitam kalau pagi",
    source: "Dari Ciko",
    sourceMsg: "aku kalau pagi wajib kopi hitam sih",
    date: "Kemarin",
  },
  {
    id: "mem2",
    category: "Topik Belum Selesai",
    content: "Ujian biologi hari Jumat",
    source: "Dari Ciko",
    sourceMsg: "Bukan besok, ujiannya Jumat.",
    date: "Baru saja",
    status: "pending"
  },
  {
    id: "mem3",
    category: "Cara Kita Berinteraksi",
    content: "Lebih suka ngobrol jujur dan sedikit jahil daripada basa-basi kaku",
    source: "Observasi Sementara",
    date: "Kemarin"
  }
]
`;
if (!content.includes('MEMORY_CATEGORIES')) {
  content = content.replace('const DAILY', memGlobal + '\nconst DAILY');
}

// 3. DAILY 
const dailyMock = `const DAILY: Message[] = [
  {
    id: "m1",
    from: "mita",
    text: "eh kamu jadi begadang lagi ya semalem",
    status: "done",
  },
  {
    id: "m2",
    from: "ciko",
    text: "ketahuan hehe. tadi keasyikan ngoprek layout kita",
    status: "sent",
  },
  {
    id: "m3",
    from: "mita",
    text: "pantesan. tapi seneng liat kamu serius. cuma jangan lupa istirahat ya, nanti aku yang repot ngingetin terus.",
    status: "done",
  },
  { id: "m4", from: "ciko", text: "iya iya, bos.", status: "sent" },
  { id: "m5", from: "mita", text: "bukan bos, pacar.", status: "done" },
]`;
content = content.replace(/const DAILY: Message\[\] = \[\s*\{[\s\S]*?\}\s*\]/m, dailyMock);

// 4. Avatar crop
const newAvatar = `}) {
  if (photo) {
    const c = crop ?? DEFAULT_CROP
    return (
      <span
        className="inline-block shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <img
          src={photo}
          alt=""
          className="h-full w-full object-cover"
          style={{
            objectPosition: \`\${c.x}% \${c.y}%\`,
            transform: \`scale(\${c.zoom})\`,
          }}
        />
      </span>
    )
  }`;
content = content.replace(/\}\) \{\n  if \(photo\) \{\n    const c = crop \?\? DEFAULT_CROP\n    return \(\n      <span\n        className="inline-block shrink-0 rounded-full bg-center bg-no-repeat"\n        style=\{\{\n          width: size,\n          height: size,\n          backgroundImage: `url\(\$\{photo\}\)`,\n          backgroundSize: `\$\{c\.zoom \* 100\}%`,\n          backgroundPosition: `\$\{c\.x\}% \$\{c\.y\}%`,\n        \}\}\n      \/>\n    \)\n  \}/m, newAvatar);

// 5. App Component State
const stateCode = `
  const [memories, setMemories] = useState<MemoryItem[]>(MOCK_MEMORIES)
  const [memTab, setMemTab] = useState<MemoryCategory>("Tentang Ciko")
  const [selMem, setSelMem] = useState<MemoryItem | null>(null)
  const [editingMem, setEditingMem] = useState<MemoryItem | null>(null)
  const [delMem, setDelMem] = useState<MemoryItem | null>(null)
`;
if(!content.includes('memories, setMemories')) {
  content = content.replace('const [draft, setDraft] = useState("")', 'const [draft, setDraft] = useState("")\n' + stateCode);
}

// 6. pickFile, applyAppearance, texts
const newPickFile = `function pickFile(cb: (url: string) => void) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      const f = input.files?.[0]
      if (f) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) cb(e.target.result as string)
        }
        reader.readAsDataURL(f)
      }
    }
    input.click()
  }`;
content = content.replace(/function pickFile\(cb: \(url: string\) => void\) \{\n    const input = document\.createElement\("input"\)[\s\S]*?input\.click\(\)\n  \}/, newPickFile);

const newPersistAppearance = `function applyAppearance() {
    setApplied(editing)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editing))
    } catch {
      alert("Gambar terlalu besar untuk disimpan secara permanen di browser prototipe ini. Tampilan hanya bertahan selama sesi ini.")
    }
    setAppearanceOpen(false)
  }`;
content = content.replace(/function applyAppearance\(\) \{\n    setApplied\(editing\)\n    persistAppearance\(editing\)\n    setAppearanceOpen\(false\)\n  \}/, newPersistAppearance);

content = content.replace(
  'Gambar yang kamu pilih dari komputer hanya bertahan selama sesi dan hilang saat reload.',
  'Prototipe akan mencoba menyimpan gambar dari komputer, tapi bisa gagal jika ukurannya terlalu besar.'
);

// 7. Ignore Function
const ignoreCode = `
  function toggleIgnore(index: number) {
    setMessages((m) => m.map((msg, k) => k === index ? { ...msg, ignored: !msg.ignored } : msg))
  }
`;
if(!content.includes('toggleIgnore')) {
  content = content.replace('/* ---- Kontrol demo: kondisi percakapan --------------------------------- */', ignoreCode + '\n  /* ---- Kontrol demo: kondisi percakapan --------------------------------- */');
}

// 8. Scenario Controls
content = content.replace(
  '    setMessages((m) => [\n      ...m,\n      { from: "ciko", text: draft.trim(), status: "sent" },\n      { from: "mita", text: "", status: "waiting" },\n    ])\n    setDraft("")\n    beginResponse(setMessages, mitaIndex, nextBehavior)',
  '    setMessages((m) => [\n      ...m,\n      { id: Date.now().toString(), from: "ciko", text: draft.trim(), status: "sent" },\n      { id: (Date.now()+1).toString(), from: "mita", text: "", status: "waiting" },\n    ])\n    setDraft("")\n    beginResponse(setMessages, mitaIndex, nextBehavior)'
);

content = content.replace(
  /function runScenario\(kind: MitaStatus\) \{\n    clearTimers\(\)\n    const mitaIndex = messages\.length \+ 1\n    const reply = nextReply\(\)\n    setMessages\(\(m\) => \[\n      \.\.\.m,\n      \{\n        from: "ciko",\n        text: "boleh cerita satu hal random soal kamu\?",\n        status: "sent",\n      \},\n      \{ from: "mita", text: "", status: "waiting" \},\n    \]\)/, 
  `function runScenario(kind: MitaStatus) {
    if (responding) return;
    clearTimers()
    const mitaIndex = messages.length + 1
    const reply = nextReply()
    setMessages((m) => [
      ...m,
      {
        id: Date.now().toString(),
        from: "ciko",
        text: "boleh cerita satu hal random soal kamu?",
        status: "sent",
      },
      { id: (Date.now()+1).toString(), from: "mita", text: "", status: "waiting" },
    ])`
);

content = content.replace(
  /function addFailedCiko\(\) \{\n    setMessages\(\(m\) => \[\n      \.\.\.m,\n      \{ from: "ciko", text: "kamu lagi sibuk ga malem ini\?", status: "failed" \},\n    \]\)\n  \}/, 
  `function addFailedCiko() {
    setMessages((m) => [
      ...m,
      { id: Date.now().toString(), from: "ciko", text: "kamu lagi sibuk ga malem ini?", status: "failed" },
    ])
  }`
);

content = content.replace(
  /function resetDemo\(\) \{\n    clearTimers\(\)\n    setHarian\(DAILY\)\n    setPertama\(\[\]\)\n    setChatMode\("harian"\)\n    setNextBehavior\("normal"\)\n    replyIdx\.current = 0\n  \}/, 
  `function resetDemo() {
    clearTimers()
    setHarian(DAILY)
    setPertama([])
    setChatMode("harian")
    setNextBehavior("normal")
    replyIdx.current = 0
    setDraft("")
  }`
);

content = content.replace(/className="flex items-center gap-1.5 font-medium text-\[var\(--color-accent\)\] hover:underline"/g, 
  'disabled={responding} title={responding ? "Tunggu respons saat ini selesai" : ""} className="flex items-center gap-1.5 font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"'
);
content = content.replace(/className="flex items-center gap-1 font-medium text-\[var\(--color-accent\)\] hover:underline"/g, 
  'disabled={responding} title={responding ? "Tunggu respons saat ini selesai" : ""} className="flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"'
);

// 9. Ciko Replace (use group, ignore)
const renderCikoReplace = `// Ciko
    return (
      <div key={index} className="flex items-end justify-end gap-2.5 group">
        <div className="flex max-w-[74%] flex-col items-end">
          <div
            className={\`animate-message w-fit whitespace-pre-wrap break-words px-4 py-3 text-[16px] leading-6 \${
              msg.status === "failed"
                ? "rounded-[14px_4px_14px_14px] border border-[#7a4a52] bg-[#2a2230] text-[var(--color-ink)]"
                : "rounded-[14px_4px_14px_14px] bg-[var(--color-selected)] text-[var(--color-ink)]"
            } \${msg.status === "sending" ? "opacity-60" : ""} \${msg.ignored ? "opacity-50" : ""}\`}
          >
            {msg.text}
          </div>
          {msg.status === "failed" && (
            <div className="mt-1 flex items-center gap-2 text-[12px] text-[#e0899a]">
              Gagal terkirim
              <button
                onClick={() => retryCikoSend(index)}
                disabled={responding} title={responding ? "Tunggu respons saat ini selesai" : ""} className="flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
          {msg.ignored && (
            <span className="mt-1 flex items-center gap-1 text-[12px] text-[var(--color-ink-dim)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
              Tidak diingat
            </span>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Avatar
            photo={applied.ciko}
            crop={applied.cikoCrop}
            fallback="C"
            kind="ciko"
            size={28}
          />
          <button 
            onClick={() => toggleIgnore(index)}
            className="text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] p-1 rounded hover:bg-[var(--color-panel)]"
            title={msg.ignored ? "Ingat kembali pesan ini" : "Jangan ingat ini"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          </button>
        </div>
      </div>
    )`;

content = content.replace(/\/\/ Ciko\n    return \(\n      <div key=\{index\}[\s\S]*?<\/div>\n    \)/, renderCikoReplace);

// 10. Mita bubble
content = content.replace(/          <div className="flex max-w-\[74%\] flex-col">\n            <div className="animate-message w-fit rounded-\[4px_14px_14px_14px\] bg-\[var\(--color-panel\)\] px-4 py-3 text-\[16px\] leading-6 text-\[var\(--color-ink\)\]">/g, `          <div className="flex max-w-[74%] flex-col">\n            <div className="animate-message w-fit whitespace-pre-wrap break-words rounded-[4px_14px_14px_14px] bg-[var(--color-panel)] px-4 py-3 text-[16px] leading-6 text-[var(--color-ink)]">`);

// 11. Memory Editor UI 
const memoryUI = `        ) : active === "Memory" ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-8 pt-8 md:px-12">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">Yang Mita ingat</h2>
              <p className="mt-2 max-w-lg text-[14px] leading-6 text-[var(--color-ink-dim)]">
                Periksa, koreksi, atau hapus ingatan Mita. Tidak ada skor kedekatan di sini.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-0">
                {MEMORY_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setMemTab(cat); setSelMem(null); setEditingMem(null); }}
                    className={\`border-b-2 px-3 py-2 text-[14px] transition \${memTab === cat ? "border-[var(--color-accent)] text-[var(--color-ink)] font-medium" : "border-transparent text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"}\`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 md:px-12 relative">
              {selMem ? (
                <div className="max-w-[600px]">
                  <button onClick={() => { setSelMem(null); setEditingMem(null); }} className="mb-4 flex items-center gap-1 text-[13px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]">
                    <Icon name="x" size={14} className="rotate-45" /> Kembali
                  </button>
                  
                  {editingMem ? (
                    <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                      <h3 className="text-[16px] font-medium mb-4">Edit Memory</h3>
                      <label className="block mb-3">
                        <span className="mb-1 block text-[13px] text-[var(--color-ink-dim)]">Isi Ingatan</span>
                        <textarea 
                          value={editingMem.content}
                          onChange={e => setEditingMem({...editingMem, content: e.target.value})}
                          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[14px] focus:border-[var(--color-accent)] outline-none resize-none"
                          rows={3}
                        />
                      </label>
                      <label className="block mb-5">
                        <span className="mb-1 block text-[13px] text-[var(--color-ink-dim)]">Alasan Perubahan</span>
                        <select className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[14px] focus:border-[var(--color-accent)] outline-none appearance-none">
                          <option>Memperbaiki informasi yang salah</option>
                          <option>Memperbarui karena sudah berubah</option>
                        </select>
                      </label>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingMem(null)} className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-[13px] hover:bg-[var(--color-bg)]">Batal</button>
                        <button 
                          onClick={() => {
                            setMemories(m => m.map(x => x.id === editingMem.id ? editingMem : x))
                            setSelMem(editingMem)
                            setEditingMem(null)
                          }} 
                          className="rounded-[var(--radius-control)] bg-[var(--color-accent)] text-[#1a1622] px-4 py-2 text-[13px] font-medium hover:brightness-105"
                        >Simpan</button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-[18px] font-medium leading-snug">{selMem.content}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingMem({...selMem})} className="text-[13px] text-[var(--color-accent)] hover:underline">Edit</button>
                          <button onClick={() => setDelMem(selMem)} className="text-[13px] text-[#e0899a] hover:underline">Hapus</button>
                        </div>
                      </div>
                      
                      <div className="space-y-4 text-[13px]">
                        <div>
                          <span className="block text-[var(--color-ink-dim)] mb-0.5">Sumber</span>
                          <span className="inline-block rounded bg-[var(--color-bg)] px-2 py-1">{selMem.source}</span>
                        </div>
                        {selMem.sourceMsg && (
                          <div>
                            <span className="block text-[var(--color-ink-dim)] mb-1">Pesan Terkait</span>
                            <div className="rounded-[4px_12px_12px_12px] bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-[14px]">
                              "{selMem.sourceMsg}"
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="block text-[var(--color-ink-dim)] mb-0.5">Terakhir Diperbarui</span>
                          <span>{selMem.date}</span>
                        </div>

                        {selMem.category === "Topik Belum Selesai" && selMem.status && (
                          <div className="pt-4 border-t border-[var(--color-border)]">
                            <span className="block text-[var(--color-ink-dim)] mb-2">Tindakan Topik</span>
                            <div className="flex flex-wrap gap-2">
                              {selMem.status === "pending" ? (
                                <>
                                  <button onClick={() => {
                                    const nm = {...selMem, status: "done" as const};
                                    setMemories(m => m.map(x => x.id === nm.id ? nm : x));
                                    setSelMem(nm);
                                  }} className="rounded-[var(--radius-control)] border border-[var(--color-accent)] text-[var(--color-accent)] px-3 py-1.5 hover:bg-[var(--color-accent)] hover:text-[#1a1622] transition">
                                    Tandai Selesai
                                  </button>
                                  <button onClick={() => {
                                    const nm = {...selMem, status: "no-followup" as const};
                                    setMemories(m => m.map(x => x.id === nm.id ? nm : x));
                                    setSelMem(nm);
                                  }} className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-bg)] transition">
                                    Jangan Follow-up
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-bg)] px-3 py-1.5 text-[var(--color-ink-dim)]">
                                  <Icon name="check" size={14} /> {selMem.status === "done" ? "Sudah Selesai" : "Tidak Di-follow-up"}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-[600px] space-y-2">
                  {memories.filter(m => m.category === memTab).length > 0 ? (
                    memories.filter(m => m.category === memTab).map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setSelMem(m)}
                        className="w-full text-left rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition hover:border-[var(--color-accent)] flex justify-between items-center"
                      >
                        <div className="pr-4">
                          <p className="text-[15px] font-medium mb-1">{m.content}</p>
                          <div className="flex gap-3 text-[12px] text-[var(--color-ink-dim)]">
                            <span>{m.source}</span>
                            {m.status === "done" && <span className="text-[var(--color-accent)]">Selesai</span>}
                            {m.status === "no-followup" && <span>No follow-up</span>}
                          </div>
                        </div>
                        <Icon name="down" size={16} className="-rotate-90 text-[var(--color-ink-dim)]" />
                      </button>
                    ))
                  ) : (
                    <div className="py-12 text-center text-[14px] text-[var(--color-ink-dim)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-panel)]">
                      Belum ada ingatan di kategori ini.
                    </div>
                  )}
                </div>
              )}
              
              {delMem && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
                  <div className="w-full max-w-[360px] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
                    <h3 className="text-[18px] font-medium mb-2">Hapus Ingatan?</h3>
                    <p className="text-[14px] text-[var(--color-ink-dim)] mb-1">"{delMem.content}"</p>
                    <p className="text-[13px] text-[#e0899a] mb-6">Pesan obrolan asli tidak akan terhapus, hanya catatan ini yang dihapus dari ingatan jangka panjang Mita.</p>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setDelMem(null)} className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-[14px] hover:bg-[var(--color-panel)]">Batal</button>
                      <button onClick={() => {
                        setMemories(m => m.filter(x => x.id !== delMem.id))
                        if (selMem?.id === delMem.id) setSelMem(null)
                        setDelMem(null)
                      }} className="rounded-[var(--radius-control)] bg-[#e0899a] text-[#1a1622] px-4 py-2 text-[14px] font-medium hover:brightness-105">Hapus</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-8 md:p-12">
            <div className="w-full max-w-[760px]">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">
                {active === "Test Mode" ? "Ruang uji coba" : "Pengaturan"}
              </h2>
              <p className="mt-2 max-w-lg text-[14px] leading-6 text-[var(--color-ink-dim)]">
                {active === "Test Mode"
                  ? "Percakapan uji tidak mengubah chat dan ingatan utama. Biaya tetap dihitung."
                  : "Atur tampilan dan perilaku tanpa mengubah siapa Mita."}
              </p>
              <div className="mt-8 rounded-[var(--radius-panel)] border border-dashed border-[var(--color-border)] p-6 text-[14px] text-[var(--color-ink-dim)]">
                Layar {active} menyusul setelah arah Chat disetujui — sesuai catatan revisi.
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
        )`;

content = content.replace(/<div className="flex flex-1 items-start justify-center overflow-y-auto p-8 md:p-12">[\s\S]*?<\/div>\n          <\/div>/, memoryUI);

fs.writeFileSync('src/App.tsx', content);

