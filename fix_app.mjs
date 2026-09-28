import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The file is about 800 lines. I will inject the Memory code.
// Since I want to maintain the high quality of the UI, I'll carefully craft the replacement string for the Memory tab.

const memoryCode = `
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

const MOCK_MEMORIES: MemoryItem[] = [
  {
    id: "mem1",
    category: "Tentang Ciko",
    content: "Sering begadang ngoprek layout",
    source: "Dari Ciko",
    sourceMsg: "tadi keasyikan ngoprek layout kita",
    date: "Baru saja",
  },
  {
    id: "mem2",
    category: "Tentang Ciko",
    content: "Besok ada ujian",
    source: "Dari Ciko",
    sourceMsg: "besok aku ada ujian pagi",
    date: "Kemarin",
  },
  {
    id: "mem3",
    category: "Topik Belum Selesai",
    content: "Tanya gimana hasil ujiannya",
    source: "Observasi Sementara",
    date: "Kemarin",
    status: "pending"
  },
]
`;

content = content.replace('/* ---- Personalisasi tampilan --------------------------------------------- */', memoryCode + '\n/* ---- Personalisasi tampilan --------------------------------------------- */');

// Add memories state inside App component
const statesToInject = `
  const [memories, setMemories] = useState<MemoryItem[]>(MOCK_MEMORIES)
  const [memTab, setMemTab] = useState<MemoryCategory>("Tentang Ciko")
  const [selMem, setSelMem] = useState<MemoryItem | null>(null)
  const [editMem, setEditMem] = useState<MemoryItem | null>(null)
  const [editReason, setEditReason] = useState("Memperbaiki informasi yang salah")
`;

content = content.replace('const [draft, setDraft] = useState("")', 'const [draft, setDraft] = useState("")\n' + statesToInject);

// Menu "Jangan ingat ini" and Ignore toggle function
const ignoreFn = `
  function toggleIgnore(index: number) {
    setMessages(m => m.map((msg, k) => {
      if (k === index) {
        return { ...msg, ignored: !msg.ignored }
      }
      return msg;
    }))
    // Simulasi menghapus memory jika ciko bilang besok ujian dll
    if (index === 1) { // just a mock logic for demo
       setMemories(m => m.filter(x => x.id !== 'mem1'))
    }
  }
`;
content = content.replace('/* ---- Kontrol demo: kondisi percakapan --------------------------------- */', ignoreFn + '\n  /* ---- Kontrol demo: kondisi percakapan --------------------------------- */');

fs.writeFileSync('src/App.tsx', content);
