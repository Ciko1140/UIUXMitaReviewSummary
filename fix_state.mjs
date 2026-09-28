import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// I will just redefine the state inside App and the global arrays!
const globals = `type MemoryCategory = "Tentang Ciko" | "Cara Kita Berinteraksi" | "Pengalaman Bersama" | "Topik Belum Selesai" | "Referensi Bersama"
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
content = content.replace('/* ---- Ikon', globals + '\n/* ---- Ikon');

content = content.replace('const [draft, setDraft] = useState("")', 'const [draft, setDraft] = useState("")\n  const [memories, setMemories] = useState<MemoryItem[]>(MOCK_MEMORIES)\n  const [memTab, setMemTab] = useState<MemoryCategory>("Tentang Ciko")\n  const [selMem, setSelMem] = useState<MemoryItem | null>(null)\n  const [editingMem, setEditingMem] = useState<MemoryItem | null>(null)\n  const [delMem, setDelMem] = useState<MemoryItem | null>(null)');

fs.writeFileSync('src/App.tsx', content);

