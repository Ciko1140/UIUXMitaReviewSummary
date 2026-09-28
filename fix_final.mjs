import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix 1: retryResponse - disable when responding
content = content.replace(
  'className="flex items-center gap-1.5 font-medium text-[var(--color-accent)] hover:underline"',
  'disabled={responding} title={responding ? "Tunggu respons saat ini selesai" : ""} className="flex items-center gap-1.5 font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"'
);

// Fix retryCikoSend - disable when responding
content = content.replace(
  'onClick={() => retryCikoSend(index)}\n                className="flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline"',
  'onClick={() => retryCikoSend(index)}\n                disabled={responding} title={responding ? "Tunggu respons saat ini selesai" : ""} className="flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"'
);

// Fix 2: runScenario disable when responding
content = content.replace(
  'function runScenario(kind: MitaStatus) {',
  'function runScenario(kind: MitaStatus) {\n    if (responding) return;'
);

// Fix 3: resetDemo clear draft
content = content.replace(
  'setNextBehavior("normal")\n    replyIdx.current = 0',
  'setNextBehavior("normal")\n    replyIdx.current = 0\n    setDraft("")'
);

// Fix 4: Appearance description text
content = content.replace(
  'Gambar yang kamu pilih dari komputer hanya bertahan selama sesi dan hilang saat reload.',
  'Prototipe akan mencoba menyimpan gambar dari komputer, tapi bisa gagal jika ukurannya terlalu besar.'
);

// Fix 5 & 6: Memory Editor Implementation & Jangan ingat ini
const newMemoryCode = `
type MemoryCategory = "Tentang Ciko" | "Cara Kita Berinteraksi" | "Pengalaman Bersama" | "Topik Belum Selesai" | "Referensi Bersama"
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

content = content.replace('/* ---- Personalisasi tampilan --------------------------------------------- */', newMemoryCode + '\n/* ---- Personalisasi tampilan --------------------------------------------- */');

const stateCode = `
  const [memories, setMemories] = useState<MemoryItem[]>(MOCK_MEMORIES)
  const [memTab, setMemTab] = useState<MemoryCategory>("Tentang Ciko")
  const [selMem, setSelMem] = useState<MemoryItem | null>(null)
  const [editingMem, setEditingMem] = useState<MemoryItem | null>(null)
  const [delMem, setDelMem] = useState<MemoryItem | null>(null)
`;

content = content.replace('const [draft, setDraft] = useState("")', 'const [draft, setDraft] = useState("")\n' + stateCode);

const ignoreCode = `
  function toggleIgnore(index: number) {
    setMessages((m) => m.map((msg, k) => k === index ? { ...msg, ignored: !msg.ignored } : msg))
  }
`;

content = content.replace('/* ---- Kontrol demo: kondisi percakapan --------------------------------- */', ignoreCode + '\n  /* ---- Kontrol demo: kondisi percakapan --------------------------------- */');

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
        <div className="flex flex-col items-center gap-1">
          <Avatar
            photo={applied.ciko}
            crop={applied.cikoCrop}
            fallback="C"
            kind="ciko"
            size={28}
          />
          <button 
            onClick={() => toggleIgnore(index)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] p-1 rounded hover:bg-[var(--color-panel)]"
            title={msg.ignored ? "Ingat kembali pesan ini" : "Jangan ingat ini"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          </button>
        </div>
      </div>
    )`;

content = content.replace(/\/\/ Ciko\n    return \(\n      <div key={index}[\s\S]*?<\/div>\n    \)/, renderCikoReplace);

const memoryUITemplate = `
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
`;

content = content.replace(/<div className="flex flex-1 items-start justify-center overflow-y-auto p-8 md:p-12">[\s\S]*?<\/div>\n        \)}/, (match) => {
  return `{active === "Memory" ? (\n${memoryUITemplate}\n        ) : (\n${match}\n        )}`;
});

fs.writeFileSync('src/App.tsx', content);
