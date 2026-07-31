import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Megaphone, MapPin, Map, User, ChevronRight,
  ThumbsUp, MessageSquare, ShieldCheck, Zap, Menu, X, CheckCircle2,
  AlertCircle, LayoutDashboard, BarChart3, Filter, LogOut, Search,
  TrendingUp, FileText, Activity, ChevronLeft, Home, ArrowRight,
  Inbox, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ThreeHeroCanvas from './components/ThreeHeroCanvas';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);


// ==========================================
// DUMMY DATA
// ==========================================
const initialReports = [
  { id: 1, title: 'Tumpukan Sampah di Pasar', category: 'Lingkungan', location: 'Pasar Baru', votes: 125, status: 'Dilaporkan', coords: [-6.21, 106.82], image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400', description: 'Sampah menggunung sejak minggu lalu dan mulai menimbulkan bau tidak sedap yang mengganggu warga sekitar.', createdAt: '2026-05-20T10:00:00Z' },
  { id: 2, title: 'Jalan Berlubang Dalam', category: 'Infrastruktur', location: 'Jalan Sudirman', votes: 340, status: 'Diproses', coords: [-6.22, 106.81], image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400', description: 'Lubang cukup besar membahayakan pengendara motor saat malam hari, sering terjadi kecelakaan kecil.', createdAt: '2026-05-21T08:30:00Z' },
  { id: 3, title: 'Fasilitas Puskesmas Rusak', category: 'Kesehatan', location: 'Kelurahan Melati', votes: 85, status: 'Dilaporkan', coords: [-6.20, 106.84], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400', description: 'Atap ruang tunggu puskesmas bocor parah saat hujan turun, membuat pasien tidak nyaman.', createdAt: '2026-05-22T14:15:00Z' },
  { id: 4, title: 'Perpustakaan Desa Tutup', category: 'Pendidikan', location: 'Desa Sukamaju', votes: 45, status: 'Selesai', coords: [-6.23, 106.83], image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400', description: 'Perpustakaan desa sudah tutup 3 bulan tanpa alasan jelas, anak-anak kesulitan mencari buku bacaan.', createdAt: '2026-05-15T09:00:00Z' },
  { id: 5, title: 'Lampu Jalan Mati Total', category: 'Infrastruktur', location: 'Komplek Anggrek', votes: 110, status: 'Diproses', coords: [-6.19, 106.81], image: 'https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?auto=format&fit=crop&q=80&w=400', description: 'Sudah 4 hari lampu jalan padam, jalanan jadi sangat gelap dan rawan tindak kriminalitas.', createdAt: '2026-05-23T19:20:00Z' },
  { id: 6, title: 'Banjir Cileuncang Tiap Hujan', category: 'Lingkungan', location: 'Perempatan Merdeka', votes: 410, status: 'Dilaporkan', coords: [-6.24, 106.80], image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=400', description: 'Drainase mampet menyebabkan banjir selutut walau hujan hanya sebentar. Menimbulkan kemacetan panjang.', createdAt: '2026-05-26T16:45:00Z' },
  { id: 7, title: 'Antrean IGD Membludak', category: 'Kesehatan', location: 'RSUD Kota', votes: 190, status: 'Diproses', coords: [-6.21, 106.85], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400', description: 'Antrean IGD sangat panjang karena dokter jaga kurang. Pasien darurat harus menunggu lama.', createdAt: '2026-05-24T11:10:00Z' },
  { id: 8, title: 'Gedung Sekolah Retak Parah', category: 'Pendidikan', location: 'SDN 01 Pagi', votes: 275, status: 'Dilaporkan', coords: [-6.18, 106.83], image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=400', description: 'Dinding ruang kelas 6 retak parah, murid dan guru merasa tidak aman saat proses belajar mengajar.', createdAt: '2026-05-25T07:50:00Z' },
  { id: 9, title: 'Pohon Tumbang Tutup Jalan', category: 'Lingkungan', location: 'Jalan Diponegoro', votes: 150, status: 'Selesai', coords: [-6.22, 106.86], image: 'https://images.unsplash.com/photo-1601224855422-9218d6a8f1dd?auto=format&fit=crop&q=80&w=400', description: 'Pohon beringin tua tumbang menghalangi jalan utama setelah badai kemarin sore.', createdAt: '2026-05-18T15:30:00Z' },
  { id: 10, title: 'JPO Keropos Berbahaya', category: 'Infrastruktur', location: 'Halte Trans', votes: 295, status: 'Dilaporkan', coords: [-6.25, 106.82], image: 'https://images.unsplash.com/photo-1519782555577-fb69f0bd9881?auto=format&fit=crop&q=80&w=400', description: 'Tangga Jembatan Penyeberangan Orang keropos dan bergoyang saat dilewati. Sangat membahayakan pejalan kaki.', createdAt: '2026-05-26T08:15:00Z' },
];

const dummyComments = [
  { id: 1, user: 'Budi Santoso', text: 'Semoga cepat ditangani, ini sudah sangat mengganggu aktivitas warga.', time: '2 jam yang lalu' },
  { id: 2, user: 'Siti Aminah', text: 'Saya juga sering lewat sini, memang kondisinya sudah sangat parah. Tolong segera!', time: '5 jam yang lalu' },
];

// ==========================================
// SHARED SMALL COMPONENTS
// ==========================================
const CategoryBadge = ({ category }) => {
  const styles = {
    'Lingkungan': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    'Infrastruktur': 'bg-blue-50 text-blue-700 border-blue-200/50',
    'Kesehatan': 'bg-red-50 text-red-700 border-red-200/50',
    'Pendidikan': 'bg-purple-50 text-purple-700 border-purple-200/50',
  };
  const icons = {
    'Lingkungan': '🌿',
    'Infrastruktur': '🏗️',
    'Kesehatan': '❤️',
    'Pendidikan': '📚',
  };
  return (
    <span className={`${styles[category] || 'bg-slate-50 text-slate-700 border-slate-200'} border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm badge-icon-hover`}>
      <span className="text-sm leading-none">{icons[category] || '📌'}</span>
      <span>{category}</span>
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Dilaporkan': 'bg-slate-50 text-slate-600 border-slate-200',
    'Diverifikasi': 'bg-amber-50 text-amber-700 border-amber-200/50',
    'Diproses': 'bg-blue-50 text-blue-700 border-blue-200/50',
    'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  };
  const dotColor = {
    'Dilaporkan': 'bg-slate-400 text-slate-400',
    'Diverifikasi': 'bg-amber-500 text-amber-500',
    'Diproses': 'bg-blue-500 text-blue-500',
    'Selesai': 'bg-emerald-500 text-emerald-500',
  };
  return (
    <span className={`${styles[status] || styles['Dilaporkan']} border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || 'bg-slate-400'} ${status !== 'Selesai' ? 'pulse-dot' : ''}`}></span>
      <span>{status}</span>
    </span>
  );
};

// Empty state component
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
  >
    <div className="w-16 h-16 bg-slate-100/80 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-200/40">
      <Icon className="h-7 w-7 text-slate-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{description}</p>
    {action}
  </motion.div>
);

// ==========================================
// MODALS
// ==========================================
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-modal relative z-10 border border-slate-100">
        <div className="bg-gradient-to-br from-brand-blue to-brand-indigo p-8 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-white/15 p-1.5 rounded-lg backdrop-blur-sm"><ShieldCheck className="h-4 w-4" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">CivicVoice SecLog</span>
            </div>
            <h2 className="text-2xl font-bold font-display">Selamat Datang</h2>
            <p className="text-blue-100/80 text-xs mt-1">Gunakan 'admin' di email untuk akses Administrator</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin({ email, isAdmin: email.toLowerCase().includes('admin') }); }} className="p-8">
          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input required type="email" placeholder="contoh: admin@civicvoice.id" className="input-premium" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Sandi</label>
              <input required type="password" placeholder="••••••••" className="input-premium" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3.5 shadow-blue-lg font-bold text-sm tracking-wide">
            Masuk Ke Aplikasi
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const createEmptyReportForm = (coords) => ({
    title: '',
    category: 'Lingkungan',
    location: '',
    description: '',
    coords: coords || [-6.20, 106.81],
    image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=400'
  });

const ReportModal = ({ isOpen, onClose, onSubmit, initialCoords }) => {
  const [formData, setFormData] = useState(() => createEmptyReportForm(initialCoords));

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-modal relative z-10 border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-brand-blue to-brand-indigo p-6 text-white flex justify-between items-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <h2 className="text-xl font-bold font-display">Buat Laporan Baru</h2>
            <p className="text-blue-100/85 text-xs mt-1 font-medium">Sampaikan masalah di sekitar Anda untuk perubahan kota</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Laporan *</label>
              <input required type="text" placeholder="Contoh: Lampu Penerangan Jalan Mati Total" className="input-premium" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori *</label>
              <select className="input-premium" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option>Lingkungan</option>
                <option>Infrastruktur</option>
                <option>Kesehatan</option>
                <option>Pendidikan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Lokasi Laporan *</label>
              <input required type="text" placeholder="Kelurahan, nama jalan, atau detail area" className="input-premium" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Kronologi *</label>
              <textarea required rows="4" placeholder="Jelaskan detail permasalahan, dampak, dan kondisi terkini di lapangan..." className="input-premium resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            {initialCoords && (
              <div className="md:col-span-2 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100/70 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800">Koordinat Penanda Peta Dipilih</p>
                  <p className="text-[11px] font-medium text-emerald-600/90 mt-0.5">{initialCoords[0].toFixed(6)}, {initialCoords[1].toFixed(6)}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 pt-4 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Batal</button>
            <button type="submit" className="btn-primary flex-1 py-3 shadow-blue flex items-center justify-center gap-2">
              <Megaphone className="h-4 w-4" /> Kirim Laporan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DetailModal = ({ report, isOpen, onClose, onVote }) => {
  if (!isOpen || !report) return null;
  const timelineSteps = ['Dilaporkan', 'Diverifikasi', 'Diproses', 'Selesai'];
  const currentStepIndex = timelineSteps.indexOf(report.status) !== -1 ? timelineSteps.indexOf(report.status) : 0;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-modal relative z-10 flex flex-col max-h-[90vh]">
        <div className="relative h-64 shrink-0 overflow-hidden">
          <img src={report.image} alt={report.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent"></div>
          <button onClick={onClose} className="absolute top-6 right-6 bg-black/35 hover:bg-black/55 p-2.5 rounded-full text-white backdrop-blur-md transition-all shadow-sm"><X className="h-4 w-4" /></button>
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex gap-2 mb-3.5"><CategoryBadge category={report.category} /><StatusBadge status={report.status} /></div>
            <h2 className="text-2xl md:text-3.5xl font-bold text-white mb-2 font-display tracking-tight leading-tight">{report.title}</h2>
            <p className="text-white/80 text-xs font-semibold flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-blue" />{report.location}</p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
          <div className="p-8 lg:w-2/3 overflow-y-auto border-r border-slate-100 space-y-8">
            <div>
              <h4 className="font-bold text-slate-900 font-display mb-3 text-base uppercase tracking-wider text-slate-400">Deskripsi Laporan</h4>
              {report.description ? (
                <p className="text-slate-600 bg-slate-50/80 border border-slate-100 p-5 rounded-2xl leading-relaxed text-sm font-medium">{report.description}</p>
              ) : (
                <p className="text-slate-400 bg-slate-50/80 border border-slate-100 p-5 rounded-2xl italic text-xs">Belum ada deskripsi untuk laporan ini.</p>
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 font-display mb-6 text-base uppercase tracking-wider text-slate-400">Progress Penanganan</h4>
              <div className="relative pl-2">
                <div className="timeline-line"></div>
                <div className="timeline-progress" style={{ height: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}></div>
                <div className="space-y-6">
                  {timelineSteps.map((step, idx) => (
                    <div key={step} className="relative flex items-center gap-6 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${idx <= currentStepIndex ? 'bg-brand-blue text-white shadow-blue' : 'bg-slate-100 text-slate-300'}`}>
                        {idx <= currentStepIndex ? <CheckCircle2 className="h-4.5 w-4.5" /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                      </div>
                      <div className={`flex-1 p-4 rounded-2xl border transition-all ${idx === currentStepIndex ? 'bg-blue-50/60 border-blue-200 shadow-sm' : 'bg-white border-transparent'}`}>
                        <h5 className={`font-bold text-sm ${idx <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'}`}>{step}</h5>
                        {idx === currentStepIndex && <p className="text-[10px] text-brand-blue mt-0.5 font-bold uppercase tracking-wider">Status saat ini</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 lg:w-1/3 bg-slate-50 overflow-y-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm text-center">
              <div className="text-4.5xl font-black text-slate-900 font-display mb-0.5 tracking-tight stat-number">{report.votes}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dukungan Warga</div>
              {report.status === 'Selesai' ? (
                <button disabled className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-2 cursor-not-allowed border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" /> Masalah Diselesaikan
                </button>
              ) : (
                <button onClick={() => onVote(report.id)} className="w-full btn-primary py-3 shadow-blue text-xs flex justify-center items-center gap-2">
                  <ThumbsUp className="h-4 w-4" /> Dukung Laporan
                </button>
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 font-display mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                <MessageSquare className="h-4 w-4 text-brand-blue" /> Komentar ({dummyComments.length})
              </h4>
              <div className="space-y-3">
                {dummyComments.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-900">{c.user}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.text}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{c.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// FOOTER COMPONENT
// ==========================================
const Footer = ({ onNavigate }) => {
  const footerLinks = [
    { label: 'Beranda', view: 'home' },
    { label: 'Semua Laporan', view: 'laporan' },
    { label: 'Peta Masalah', view: 'peta' },
    { label: 'Dashboard', view: 'dashboard' },
  ];

  return (
  <footer className="bg-slate-900 text-white border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-blue p-2.5 rounded-xl"><Megaphone className="h-5 w-5 text-white" /></div>
            <span className="text-2xl font-black font-display tracking-tight">Civic<span className="text-brand-blue">Voice</span></span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
            Platform partisipasi publik digital untuk melaporkan, memantau, dan mempercepat penyelesaian isu publik demi terwujudnya tata kelola kota yang responsif.
          </p>
          <div className="flex gap-2.5 mt-6">
            {['🌐','📱','💬'].map((icon, i) => (
              <div key={i} className="w-9 h-9 bg-slate-800 hover:bg-brand-blue hover:text-white rounded-xl flex items-center justify-center cursor-pointer transition-all text-sm border border-slate-700/50 shadow-sm">
                {icon}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider font-display">Tautan Navigasi</h4>
          <ul className="space-y-2.5">
            {footerLinks.map(item => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.view)}
                  className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="h-3 w-3 text-brand-blue" />{item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider font-display">Kategori Laporan</h4>
          <ul className="space-y-2.5">
            {[{label:'Lingkungan',icon:'🌿'},{label:'Infrastruktur',icon:'🏗️'},{label:'Kesehatan',icon:'❤️'},{label:'Pendidikan',icon:'📚'}].map(item => (
              <li key={item.label}>
                <span className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2">
                  <span>{item.icon}</span>{item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
        <p>© 2026 CivicVoice. Seluruh Hak Cipta Dilindungi.</p>
        <p className="flex items-center gap-1">Kolaborasi Bersama <span className="text-brand-blue font-bold ml-1">CiTech Laos</span></p>
      </div>
    </div>
  </footer>
  );
};

// ==========================================
// VIEWS (Public)
// ==========================================
const ReportCard = ({ report, onVote, onDetail }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = (x - xc) / xc;
    const dy = (y - yc) / yc;
    
    const tiltX = dy * -12;
    const tiltY = dx * 12;
    
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium overflow-hidden flex flex-col h-full shadow-card hover:shadow-card-hover interactive-tilt preserve-3d"
    >
      <div className="relative h-52 shrink-0 cursor-pointer overflow-hidden group preserve-3d" onClick={() => onDetail(report)}>
        <img src={report.image} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 layer-z-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 layer-z-md"><CategoryBadge category={report.category} /></div>
        <div className="absolute top-4 right-4 layer-z-md"><StatusBadge status={report.status} /></div>
      </div>
      <div className="p-6 flex flex-col flex-1 preserve-3d">
        <h3 className="font-extrabold text-slate-900 text-lg mb-2 cursor-pointer hover:text-brand-blue transition-colors line-clamp-2 font-display leading-snug layer-z-md" onClick={() => onDetail(report)}>{report.title}</h3>
        <div className="flex items-center text-slate-400 text-xs font-semibold mb-3.5 layer-z-sm">
          <MapPin className="h-3.5 w-3.5 mr-1 text-brand-blue shrink-0" />{report.location}
        </div>
        <p className="text-slate-500 text-xs line-clamp-2 mb-6 flex-1 leading-relaxed font-medium layer-z-xs">{report.description || 'Tidak ada deskripsi detail.'}</p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto shrink-0 preserve-3d">
          <div className="flex items-center gap-1.5 font-black text-lg text-slate-800 font-display layer-z-sm">
            <ThumbsUp className="h-4.5 w-4.5 text-brand-blue" />
            <span>{report.votes}</span>
          </div>
          {report.status === 'Selesai' ? (
            <button disabled className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl text-xs font-bold cursor-not-allowed border border-emerald-100 flex items-center gap-1 layer-z-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onVote(report.id); }}
              className="btn-secondary px-5 py-2 rounded-xl text-xs font-bold layer-z-sm"
            >
              Dukung
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const StatCounter = ({ value, label, icon: Icon, color }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = (x - xc) / xc;
    const dy = (y - yc) / yc;
    
    const tiltX = dy * -15;
    const tiltY = dx * 15;
    
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 shadow-sm interactive-tilt shadow-3d-sm preserve-3d cursor-pointer"
    >
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm layer-z-sm`}>
        <Icon className="h-5.5 w-5.5 text-white" />
      </div>
      <div className="text-2.5xl font-black text-slate-900 font-display tracking-tight stat-number layer-z-md">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 layer-z-xs">{label}</div>
    </motion.div>
  );
};


const HomeView = ({ onReportClick, reports, onVote, onDetail, onNavigate }) => {
  const activeReports = reports.filter(r => r.status !== 'Selesai');
  const topReport = activeReports.length > 0 ? [...activeReports].sort((a, b) => b.votes - a.votes)[0] : null;
  const resolvedCount = reports.filter(r => r.status === 'Selesai').length;
  const popularReports = [...reports].sort((a, b) => b.votes - a.votes).slice(0, 3);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    // 1. Hero text parallax
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".bg-hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    heroTl.to(".hero-3d-title", {
      y: -50,
      z: 80,
      opacity: 0.8,
      rotationX: 10,
      duration: 1
    }, 0);

    heroTl.to(".hero-3d-subtitle", {
      y: -25,
      z: 40,
      opacity: 0.9,
      rotationX: 5,
      duration: 1
    }, 0);

    heroTl.to(".hero-3d-buttons", {
      y: 10,
      z: 20,
      duration: 1
    }, 0);

    heroTl.to(".hero-3d-stats", {
      y: -70,
      z: 110,
      rotationX: 15,
      duration: 1
    }, 0);

    // 2. Multi-layered Scroll 3D Tilting Sections
    const sections = gsap.utils.toArray(".scroll-3d-section");
    sections.forEach((sec) => {
      gsap.fromTo(sec, 
        { rotateX: 5, transformOrigin: "50% 100%" },
        { 
          rotateX: -5, 
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );
    });

    // 3. Spotlight Card Parallax & Tilt
    if (document.querySelector(".spotlight-card-3d")) {
      gsap.fromTo(".spotlight-card-3d", 
        { transform: "perspective(1000px) translateZ(-40px) rotateY(-4deg)" },
        {
          transform: "perspective(1000px) translateZ(80px) rotateY(4deg)",
          scrollTrigger: {
            trigger: ".spotlight-card-3d",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Spotlight card mouse tilt handler
  const spotlightRef = useRef(null);
  const handleSpotlightMouseMove = (e) => {
    if (!spotlightRef.current) return;
    const card = spotlightRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = (x - xc) / xc;
    const dy = (y - yc) / yc;
    
    const tiltX = dy * -8;
    const tiltY = dx * 8;
    
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleSpotlightMouseLeave = () => {
    if (!spotlightRef.current) return;
    spotlightRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div className="pt-20 page-enter perspective-container">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-hero perspective-container">
        {/* Procedural Three.js Hero Canvas */}
        <ThreeHeroCanvas />

        {/* Subtle Background Grid & Spinning System (Globe representation) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-[spin_80s_linear_infinite] pointer-events-none hide-mobile">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500/40 rounded-full shadow-sm"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-brand-purple/40 rounded-full shadow-sm"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500/40 rounded-full shadow-sm"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-pink-500/40 rounded-full shadow-sm"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dashed border-indigo-500/10 rounded-full animate-[spin_50s_linear_infinite] pointer-events-none hide-mobile" style={{ animationDirection: 'reverse' }}></div>

        {/* Floating background shapes & particles */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl blob pointer-events-none" />
        <div className="absolute bottom-12 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl blob blob-delay-2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Glowing floating particles */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-blue-500/30 rounded-full particle-1 pointer-events-none hide-mobile" style={{ animationDelay: '0s' }} />
        <div className="absolute top-2/3 left-12 w-1.5 h-1.5 bg-indigo-500/25 rounded-full particle-2 pointer-events-none hide-mobile" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-purple-500/25 rounded-full particle-1 pointer-events-none hide-mobile" style={{ animationDelay: '3s' }} />
        <div className="absolute top-3/4 right-16 w-2 h-2 bg-emerald-500/30 rounded-full particle-2 pointer-events-none hide-mobile" style={{ animationDelay: '4.5s' }} />

        <div className="max-w-7xl mx-auto relative z-10 preserve-3d">
          <div className="text-center mb-16 preserve-3d">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-blue-50/85 border border-blue-200/50 px-4 py-2 rounded-full text-xs font-bold text-brand-blue mb-6 shadow-sm backdrop-blur-md uppercase tracking-wider layer-z-xs"
            >
              <Zap className="h-3.5 w-3.5 animate-pulse" />
              Platform Smart Civic Reporting
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4.5xl md:text-6xl font-black text-slate-900 mb-6 leading-none font-display tracking-tight hero-3d-title layer-z-lg"
            >
              Suara Anda, <span className="text-gradient font-black">Perubahan</span>
              <br className="hidden md:block" /> <span className="text-slate-800 font-extrabold">Nyata Kota Kita</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium hero-3d-subtitle layer-z-md"
            >
              Laporkan masalah lingkungan, infrastruktur, kesehatan, dan pendidikan di sekitar Anda secara langsung. Bersama wujudkan kota yang tanggap, transparan, dan berkelanjutan.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center hero-3d-buttons layer-z-sm"
            >
              <button onClick={onReportClick} className="btn-primary px-8 py-4 text-base rounded-2xl flex items-center justify-center gap-2 shadow-blue-lg">
                <Megaphone className="h-5 w-5" /> Laporkan Sekarang
              </button>
              <button onClick={() => onNavigate('peta')} className="btn-secondary px-8 py-4 text-base rounded-2xl flex items-center justify-center gap-2">
                <Map className="h-5 w-5 text-brand-blue" /> Lihat Peta Masalah
              </button>
            </motion.div>
          </div>

          {/* Stats Row with floating premium effects */}
          <div className="grid grid-cols-3 gap-5 max-w-lg mx-auto hero-3d-stats preserve-3d">
            <div className="float preserve-3d" style={{ animationDelay: '0s' }}>
              <StatCounter value={reports.length} label="Total Laporan" icon={FileText} color="bg-brand-blue" />
            </div>
            <div className="float preserve-3d" style={{ animationDelay: '0.6s' }}>
              <StatCounter value={activeReports.length} label="Masalah Aktif" icon={Activity} color="bg-amber-500" />
            </div>
            <div className="float preserve-3d" style={{ animationDelay: '1.2s' }}>
              <StatCounter value={resolvedCount} label="Selesai Ditangani" icon={CheckCircle2} color="bg-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Top Report Spotlight */}
      {topReport && (
        <section className="py-12 px-6 bg-white scroll-3d-section perspective-container">
          <div className="max-w-7xl mx-auto preserve-3d">
            <motion.div
              ref={spotlightRef}
              onMouseMove={handleSpotlightMouseMove}
              onMouseLeave={handleSpotlightMouseLeave}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-hero-dark rounded-[2.5rem] overflow-hidden shadow-3d-lg border border-slate-800 spotlight-card-3d interactive-tilt preserve-3d transition-transform"
            >
              <div className="flex flex-col md:flex-row preserve-3d">
                <div className="p-10 md:w-3/5 flex flex-col justify-center relative overflow-hidden preserve-3d">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 preserve-3d">
                    <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/25 px-4 py-1.5 rounded-full text-xs font-bold text-red-400 mb-6 w-fit uppercase tracking-wider layer-z-md">
                      🔥 Prioritas Penanganan Tertinggi
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight font-display tracking-tight layer-z-lg">{topReport.title}</h2>
                    <p className="text-slate-400 mb-4 flex items-center gap-2 text-xs font-semibold layer-z-sm"><MapPin className="h-4 w-4 text-brand-blue" />{topReport.location}</p>
                    <p className="text-slate-350 text-xs md:text-sm mb-8 leading-relaxed font-medium line-clamp-3 layer-z-xs">{topReport.description}</p>
                    <div className="flex items-center gap-5 preserve-3d">
                      <button onClick={() => onDetail(topReport)} className="btn-secondary px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 border-none text-xs rounded-xl font-bold shadow-md layer-z-sm">
                        Detail Kronologi <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </button>
                      <div className="flex items-center gap-2 text-white text-xs font-bold font-display layer-z-sm">
                        <ThumbsUp className="h-4.5 w-4.5 text-brand-blue" />
                        <span>{topReport.votes} dukungan warga</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/5 h-72 md:h-auto relative overflow-hidden preserve-3d">
                  <img src={topReport.image} alt={topReport.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 layer-z-sm" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent md:from-transparent md:bg-gradient-to-l md:from-slate-950/40" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Popular Reports */}
      <section className="py-20 px-6 bg-slate-50/50 scroll-3d-section perspective-container">
        <div className="max-w-7xl mx-auto preserve-3d">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Laporan Terpopuler</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">Aspirasi publik dengan dukungan terbanyak minggu ini</p>
            </div>
            <div className="flex items-center gap-1.5 text-brand-blue font-bold text-xs cursor-pointer hover:gap-2.5 transition-all uppercase tracking-wider" onClick={() => onNavigate('laporan')}>
              Lihat Laporan Lain <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 preserve-3d">
            {popularReports.map(r => <ReportCard key={r.id} report={r} onVote={onVote} onDetail={onDetail} />)}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-white scroll-3d-section perspective-container">
        <div className="max-w-7xl mx-auto text-center preserve-3d">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 font-display tracking-tight">Alur Kerja Sistem</h2>
          <p className="text-slate-500 text-xs font-semibold mb-16 max-w-sm mx-auto">Tiga tahapan integrasi untuk akselerasi penyelesaian masalah</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 preserve-3d">
            {[
              { step: '01', icon: Megaphone, title: 'Ajukan Laporan', desc: 'Identifikasi masalah di sekitarmu, ambil foto, pin lokasi peta, dan isi detail kronologi laporan.', color: 'bg-blue-50 text-blue-600 border-blue-100/50' },
              { step: '02', icon: ThumbsUp, title: 'Kumpulkan Dukungan', desc: 'Warga memberikan vote dukungan untuk memvalidasi urgensi laporan demi prioritas utama.', color: 'bg-amber-50 text-amber-600 border-amber-100/50' },
              { step: '03', icon: CheckCircle2, title: 'Monitor Penyelesaian', desc: 'Pantau status penanganan oleh instansi berwenang secara transparan hingga status selesai.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100/50' },
            ].map((item, i) => {
              const cardRef = useRef(null);

              const handleStepMouseMove = (e) => {
                if (!cardRef.current) return;
                const card = cardRef.current;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = (x - xc) / xc;
                const dy = (y - yc) / yc;
                
                const tiltX = dy * -10;
                const tiltY = dx * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
              };

              const handleStepMouseLeave = () => {
                if (!cardRef.current) return;
                cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
              };

              return (
                <motion.div
                  ref={cardRef}
                  onMouseMove={handleStepMouseMove}
                  onMouseLeave={handleStepMouseLeave}
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-premium bg-slate-50/40 p-8 text-center border border-slate-200/40 hover:shadow-card-hover interactive-tilt preserve-3d"
                >
                  <div className={`w-14 h-14 ${item.color} border rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm layer-z-sm`}>
                    <item.icon className="h-6.5 w-6.5" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display layer-z-xs">{item.step}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5 font-display layer-z-md">{item.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium layer-z-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

const REPORTS_PER_PAGE = 6;

const LaporanView = ({ onReportClick, reports, onVote, onDetail }) => {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return reports.filter(r =>
      (filterCat === 'Semua' || r.category === filterCat) &&
      (filterStatus === 'Semua' || r.status === filterStatus) &&
      (search === '' || r.title.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase()))
    );
  }, [reports, filterCat, filterStatus, search]);

  const totalPages = Math.ceil(filtered.length / REPORTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * REPORTS_PER_PAGE, page * REPORTS_PER_PAGE);

  return (
    <div className="pt-28 pb-24 bg-slate-50/50 min-h-screen px-6 page-enter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display tracking-tight">Semua Laporan Warga</h1>
            <p className="text-slate-500 text-xs font-semibold mt-1">Daftar aspirasi warga terpublikasi: {filtered.length} laporan aktif</p>
          </div>
          <button onClick={onReportClick} className="btn-primary px-6 py-3 text-xs rounded-xl shadow-blue flex items-center gap-2 w-fit">
            <Megaphone className="h-4 w-4" /> Kirim Laporan Baru
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci laporan atau lokasi..."
              className="input-premium pl-10 py-2.5 text-xs"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-premium md:w-48 py-2.5 text-xs font-semibold"
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setPage(1); }}
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Lingkungan">🌿 Lingkungan</option>
            <option value="Infrastruktur">🏗️ Infrastruktur</option>
            <option value="Kesehatan">❤️ Kesehatan</option>
            <option value="Pendidikan">📚 Pendidikan</option>
          </select>
          <select
            className="input-premium md:w-48 py-2.5 text-xs font-semibold"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="Semua">Semua Status</option>
            <option value="Dilaporkan">Dilaporkan</option>
            <option value="Diverifikasi">Diverifikasi</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
          {(search || filterCat !== 'Semua' || filterStatus !== 'Semua') && (
            <button
              onClick={() => { setSearch(''); setFilterCat('Semua'); setFilterStatus('Semua'); setPage(1); }}
              className="btn-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-2 whitespace-nowrap"
            >
              <X className="h-4 w-4" /> Atur Ulang
            </button>
          )}
        </div>

        {/* Grid */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginated.map(r => <ReportCard key={r.id} report={r} onVote={onVote} onDetail={onDetail} />)}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Laporan Tidak Ditemukan"
            description="Maaf, tidak ada laporan publik yang cocok dengan kriteria pencarian dan penyaringan Anda saat ini."
            action={
              <button
                onClick={() => { setSearch(''); setFilterCat('Semua'); setFilterStatus('Semua'); setPage(1); }}
                className="btn-primary px-6 py-2.5 text-xs"
              >
                Reset Filter
              </button>
            }
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed text-slate-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${page === p ? 'bg-brand-blue text-white shadow-blue' : 'btn-secondary text-slate-700 border-slate-200'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed text-slate-500"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardView = ({ reports }) => {
  const categoryCount = reports.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryCount),
    datasets: [{
      data: Object.values(categoryCount),
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#a855f7'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const statusCount = {
    'Dilaporkan': reports.filter(r => r.status === 'Dilaporkan').length,
    'Diverifikasi': reports.filter(r => r.status === 'Diverifikasi').length,
    'Diproses': reports.filter(r => r.status === 'Diproses').length,
    'Selesai': reports.filter(r => r.status === 'Selesai').length,
  };

  const barData = {
    labels: ['Dilaporkan', 'Diverifikasi', 'Diproses', 'Selesai'],
    datasets: [{
      label: 'Jumlah Laporan',
      data: [statusCount['Dilaporkan'], statusCount['Diverifikasi'], statusCount['Diproses'], statusCount['Selesai']],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
      borderRadius: 8,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 10, weight: 'bold' }, color: '#94a3b8' },
        grid: { color: '#f1f5f9' },
      },
      x: { 
        ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' },
        grid: { display: false } 
      }
    }
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 15, usePointStyle: true, pointStyleWidth: 9, font: { size: 10, weight: 'bold' }, color: '#475569' }
      }
    }
  };

  const totalVotes = reports.reduce((sum, r) => sum + r.votes, 0);

  const statCards = [
    { label: 'Total Laporan', value: reports.length, icon: FileText, color: 'text-brand-blue', bg: 'bg-blue-50', border: 'border-blue-100/50' },
    { label: 'Tahap Verifikasi', value: statusCount['Diverifikasi'], icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100/50' },
    { label: 'Dalam Proses', value: statusCount['Diproses'], icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100/50' },
    { label: 'Selesai Ditangani', value: statusCount['Selesai'], icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100/50' },
  ];

  return (
    <div className="pb-20 min-h-screen px-6 page-enter">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Dashboard Analitik</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Ringkasan statistik penanganan pengaduan warga kota</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`card-premium bg-white p-6 shadow-card hover:shadow-card-hover border border-slate-200/50`}
            >
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-4 border border-slate-200/20`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-display">{card.label}</p>
              <p className={`text-3.5xl font-black ${card.color} font-display stat-number`}>{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="chart-container shadow-card">
            <h3 className="font-extrabold text-slate-900 mb-6 text-sm uppercase tracking-wider font-display text-slate-400">Distribusi Kategori</h3>
            <div className="h-72 flex justify-center"><Pie data={pieData} options={pieOptions} /></div>
          </div>
          <div className="chart-container shadow-card">
            <h3 className="font-extrabold text-slate-900 mb-6 text-sm uppercase tracking-wider font-display text-slate-400">Status Penanganan</h3>
            <div className="h-72"><Bar data={barData} options={barOptions} /></div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-brand-blue to-brand-indigo p-6 rounded-2xl text-white shadow-blue flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider font-display">Akumulasi Dukungan</p>
              <ThumbsUp className="h-4.5 w-4.5 text-blue-300" />
            </div>
            <div>
              <p className="text-3.5xl font-black font-display stat-number">{totalVotes}</p>
              <p className="text-blue-200/80 text-[10px] mt-1.5 font-semibold">Total vote dari warga untuk seluruh laporan</p>
            </div>
          </div>
          <div className="card-premium bg-white p-6 shadow-card hover:shadow-card-hover border border-slate-200/50 flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Kategori Dominan</p>
              <Award className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-800 font-display">
                {Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
              </p>
              <p className="text-slate-400 text-[10px] mt-1.5 font-semibold font-display font-medium">Sektor yang paling krusial dilaporkan</p>
            </div>
          </div>
          <div className="card-premium bg-white p-6 shadow-card hover:shadow-card-hover border border-slate-200/50 flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Rasio Penyelesaian</p>
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2.5xl font-extrabold text-emerald-600 font-display">
                {reports.length > 0 ? Math.round((statusCount['Selesai'] / reports.length) * 100) : 0}%
              </p>
              <p className="text-slate-400 text-[10px] mt-1.5 font-semibold font-display">Persentase laporan berstatus selesai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAP
// ==========================================
const MapController = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);

  return null;
};

const LocationPicker = ({ onLocationSelected }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelected) onLocationSelected([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

const MapPage = ({ reports, onDetail, onLocationSelected, hideSidebar = false }) => {
  const [filterCat, setFilterCat] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [mapCenter, setMapCenter] = useState([-6.22, 106.82]);

  const filtered = reports.filter(r =>
    (filterCat === 'Semua' || r.category === filterCat) &&
    (filterStatus === 'Semua' || r.status === filterStatus)
  );

  const markerColors = {
    'Dilaporkan': '#ef4444',
    'Diverifikasi': '#f59e0b',
    'Diproses': '#3b82f6',
    'Selesai': '#10b981',
  };

  const getMarkerIcon = (r) => L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
      ">
        <div style="
          background-color: ${markerColors[r.status] || '#6b7280'};
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">
          ${r.category === 'Lingkungan' ? '🌿' : r.category === 'Infrastruktur' ? '🏗️' : r.category === 'Kesehatan' ? '❤️' : '📚'}
        </div>
        ${r.status !== 'Selesai' ? `<div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid ${markerColors[r.status] || '#6b7280'};
          opacity: 0.45;
          animation: marker-ripple 2s ease-out infinite;
        "></div>` : ''}
      </div>
    `,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

  const legendItems = [
    { label: 'Dilaporkan', color: '#ef4444' },
    { label: 'Diverifikasi', color: '#f59e0b' },
    { label: 'Diproses', color: '#3b82f6' },
    { label: 'Selesai', color: '#10b981' },
  ];

  return (
    <div className={`${hideSidebar ? 'h-[calc(100vh-5rem)] rounded-3xl overflow-hidden shadow-card border border-slate-200/50' : 'pt-20 h-screen'} w-full relative flex page-enter`}>
      {!hideSidebar && (
        <div className="w-80 bg-white border-r border-slate-100 flex flex-col h-full z-10 shadow-nav">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2 font-display">
              <Filter className="h-4.5 w-4.5 text-brand-blue" /> Filter Laporan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block font-display">Sektor Laporan</label>
                <select
                  className="input-premium p-2.5 text-xs font-semibold"
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Lingkungan">🌿 Lingkungan</option>
                  <option value="Infrastruktur">🏗️ Infrastruktur</option>
                  <option value="Kesehatan">❤️ Kesehatan</option>
                  <option value="Pendidikan">📚 Pendidikan</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block font-display">Status Laporan</label>
                <select
                  className="input-premium p-2.5 text-xs font-semibold"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Dilaporkan">Dilaporkan</option>
                  <option value="Diverifikasi">Diverifikasi</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 font-display">Legenda Status</p>
              <div className="grid grid-cols-2 gap-2">
                {legendItems.map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 sidebar-scroll">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Tidak Ada Laporan</p>
                <p className="text-[10px] text-slate-400 mt-1">Ubah filter untuk melihat data</p>
              </div>
            ) : (
              filtered.map(r => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setMapCenter(r.coords)}
                  className="bg-white p-4 rounded-2xl border border-slate-150 cursor-pointer hover:border-brand-blue hover:shadow-sm hover:translate-x-0.5 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-extrabold text-brand-blue bg-blue-50/70 border border-blue-100/35 px-2 py-0.5 rounded-md uppercase tracking-wide">{r.category}</span>
                    <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: markerColors[r.status] || '#6b7280' }}></span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2 mb-1 leading-normal">{r.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1"><MapPin className="h-3 w-3 text-brand-blue shrink-0" /> {r.location}</p>
                  <div className="flex items-center gap-1 mt-2.5 text-[10px] text-slate-400 font-bold font-display">
                    <ThumbsUp className="h-3 w-3 text-brand-blue" /> {r.votes} warga
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {onLocationSelected && (
            <div className="p-4 border-t border-slate-150 bg-blue-50/40 shrink-0">
              <p className="text-[10px] text-blue-700 font-bold flex items-center gap-2 leading-relaxed">
                <MapPin className="h-4.5 w-4.5 text-brand-blue shrink-0" />
                Klik titik koordinat peta untuk melaporkan masalah secara spesifik.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative z-0">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController center={mapCenter} />
          <LocationPicker onLocationSelected={onLocationSelected} />
          {filtered.map(r => (
            <Marker key={r.id} position={r.coords} icon={getMarkerIcon(r)}>
              <Popup className="custom-popup">
                <div>
                  <div className="relative h-28 overflow-hidden shrink-0">
                    <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2.5 left-3">
                      <CategoryBadge category={r.category} />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-snug font-display">{r.title}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1"><MapPin className="h-3 w-3 text-brand-blue" />{r.location}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-2">
                      <StatusBadge status={r.status} />
                      <span className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5"><ThumbsUp className="h-3 w-3 text-brand-blue" />{r.votes}</span>
                    </div>
                    <button onClick={() => onDetail && onDetail(r)} className="w-full btn-primary py-2 text-[10px] rounded-xl font-bold mt-1 shadow-sm">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

// ==========================================
// VIEWS (Admin)
// ==========================================
const AdminSidebar = ({ active, setActive, onLogout }) => (
  <div className="w-64 admin-sidebar text-white flex flex-col h-screen fixed top-0 left-0 z-20">
    <div className="p-6 flex items-center gap-3 border-b border-slate-800">
      <div className="bg-brand-blue p-2.5 rounded-xl shadow-lg shadow-blue-500/25"><ShieldCheck className="h-4.5 w-4.5 text-white" /></div>
      <span className="text-xl font-black font-display tracking-tight">Admin<span className="text-brand-blue">Hub</span></span>
    </div>
    <div className="p-4 flex-1 space-y-1.5">
      {[
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'laporan', icon: MessageSquare, label: 'Laporan Masuk' },
        { id: 'peta', icon: Map, label: 'Peta Live' },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-xs ${active === item.id ? 'bg-brand-blue text-white shadow-blue' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <item.icon className="h-4 w-4" /> {item.label}
        </button>
      ))}
    </div>
    <div className="p-4 border-t border-slate-800">
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl font-bold transition-all text-xs">
        <LogOut className="h-4 w-4" /> Keluar Sesi
      </button>
    </div>
  </div>
);

const AdminHeader = ({ title, subtitle, user }) => (
  <div className="glass border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
    <div>
      <h2 className="text-lg font-black text-slate-900 font-display tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right hidden md:block">
        <p className="text-xs font-bold text-slate-800 leading-tight">{user?.email || 'Administrator'}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Sistem Admin</p>
      </div>
      <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-blue">
        <ShieldCheck className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

const AdminLaporan = ({ reports, onUpdateStatus }) => {
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');

  const filtered = reports.filter(r =>
    (filter === 'Semua' || r.status === filter) &&
    (search === '' || r.title.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 page-enter">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">Manajemen Laporan</h2>
          <p className="text-slate-500 text-xs font-semibold">Tinjau, validasi, dan kelola perkembangan status pengaduan.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengaduan warga..."
              className="input-premium pl-9 py-2 text-xs w-60"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-premium w-auto py-2 text-xs font-semibold bg-white"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="Dilaporkan">Dilaporkan</option>
            <option value="Diverifikasi">Diverifikasi</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Tidak Ada Laporan Pengaduan"
          description="Sistem tidak mendeteksi adanya data pengaduan untuk penyaringan saat ini."
        />
      ) : (
        <div className="card-premium bg-white shadow-card border border-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4.5">Detail Laporan</th>
                  <th className="px-6 py-4.5">Sektor</th>
                  <th className="px-6 py-4.5">Status Terkini</th>
                  <th className="px-6 py-4.5">Vote Warga</th>
                  <th className="px-6 py-4.5 text-center">Tindakan Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5">
                      <p className="font-extrabold text-slate-900 leading-snug">{r.title}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand-blue" /> {r.location}</p>
                    </td>
                    <td className="px-6 py-4.5"><CategoryBadge category={r.category} /></td>
                    <td className="px-6 py-4.5"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <ThumbsUp className="h-3.5 w-3.5 text-brand-blue" />
                        <span>{r.votes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {['Diverifikasi', 'Diproses', 'Selesai'].map(s => (
                          <button
                            key={s}
                            disabled={r.status === s || r.status === 'Selesai'}
                            onClick={() => onUpdateStatus(r.id, s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                              r.status === s || r.status === 'Selesai'
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100/50'
                                : 'bg-white border border-slate-200 hover:border-brand-blue text-slate-600 hover:text-brand-blue hover:shadow-sm'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN APP
// ==========================================
const VIEW_PATHS = {
  home: '/',
  laporan: '/laporan',
  peta: '/map',
  dashboard: '/dashboard',
};

const PATH_VIEWS = {
  '/': 'home',
  '/laporan': 'laporan',
  '/reports': 'laporan',
  '/map': 'peta',
  '/peta': 'peta',
  '/dashboard': 'dashboard',
};

const getViewFromPath = () => {
  if (typeof window === 'undefined') return 'home';
  return PATH_VIEWS[window.location.pathname] || 'home';
};

function App() {
  const [currentView, setCurrentView] = useState(getViewFromPath);
  const [adminView, setAdminView] = useState('dashboard');
  const [reports, setReports] = useState(initialReports);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [notification, setNotification] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleVote = useCallback((id) => {
    const r = reports.find(x => x.id === id);
    if (r && r.status === 'Selesai') { showNotification('Laporan Selesai tidak dapat didukung.'); return; }
    setReports(prev => prev.map(x => x.id === id ? { ...x, votes: x.votes + 1 } : x));
    if (selectedReport?.id === id) setSelectedReport(prev => ({ ...prev, votes: prev.votes + 1 }));
    showNotification('Dukungan berhasil diberikan! 👍');
  }, [reports, selectedReport]);

  const handleUpdateStatus = useCallback((id, status) => {
    setReports(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (selectedReport?.id === id) setSelectedReport(prev => ({ ...prev, status }));
    showNotification(`Status diperbarui menjadi "${status}" ✅`);
  }, [selectedReport]);

  const handleLogin = (u) => {
    setUser(u);
    setIsLoginModalOpen(false);
    showNotification(u.isAdmin ? '🛡️ Berhasil masuk sebagai Admin' : '✅ Berhasil masuk');
  };

  const handleLogout = () => {
    setUser(null);
    handleNavClick('home');
    setAdminView('dashboard');
    showNotification('Berhasil keluar 👋');
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    const path = VIEW_PATHS[view] || '/';
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'laporan', label: 'Laporan' },
    { id: 'peta', label: 'Peta' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  useEffect(() => {
    const handlePopState = () => setCurrentView(getViewFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ========================
  // ADMIN LAYOUT
  // ========================
  if (user?.isAdmin) {
    const adminTitles = {
      dashboard: { title: 'Dashboard Analytics', subtitle: 'Kalkulasi visual dan ringkasan data statistik.' },
      laporan: { title: 'Manajemen Pengaduan', subtitle: 'Tindakan cepat dan monitoring penyelesaian aduan warga.' },
      peta: { title: 'Peta Spasial Real-time', subtitle: 'Lokasi visual laporan publik di seluruh wilayah.' },
    };

    return (
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <AdminSidebar active={adminView} setActive={setAdminView} onLogout={handleLogout} />
        <div className="flex-1 ml-64 overflow-x-hidden flex flex-col min-h-screen">
          <AdminHeader
            title={adminTitles[adminView]?.title}
            subtitle={adminTitles[adminView]?.subtitle}
            user={user}
          />
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {adminView === 'dashboard' && (
                <motion.div key="admin-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <DashboardView reports={reports} />
                </motion.div>
              )}
              {adminView === 'laporan' && (
                <motion.div key="admin-lap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AdminLaporan reports={reports} onUpdateStatus={handleUpdateStatus} />
                </motion.div>
              )}
              {adminView === 'peta' && (
                <motion.div key="admin-peta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                  <div className="h-[calc(100vh-9rem)]">
                    <MapPage reports={reports} hideSidebar={true} onDetail={setSelectedReport} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-8 right-8 z-[3000] toast text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold flex items-center gap-3 text-sm"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <DetailModal report={selectedReport} isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} onVote={handleVote} />
      </div>
    );
  }

  // ========================
  // PUBLIC LAYOUT
  // ========================
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass shadow-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-3 shrink-0">
            <div className="bg-brand-blue p-2.5 rounded-xl shadow-blue">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 font-display tracking-tight">Civic<span className="text-brand-blue">Voice</span></span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1.5">
            {navItems.map(v => (
              <button
                key={v.id}
                onClick={() => handleNavClick(v.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
                  currentView === v.id
                    ? 'bg-brand-blue/5 text-brand-blue border border-brand-blue/10'
                    : 'text-slate-600 hover:text-brand-blue hover:bg-slate-100 border border-transparent'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.email}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Masyarakat</p>
                </div>
                <button onClick={handleLogout} className="btn-danger border border-red-200 px-4 py-2 text-xs font-bold transition-all shadow-sm">Logout</button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden md:flex btn-secondary px-5 py-2.5 text-xs font-bold items-center gap-2"
              >
                <User className="h-4 w-4 text-brand-blue" /> Masuk Aplikasi
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-lg"
            >
              <div className="px-4 py-4 space-y-1.5">
                {navItems.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleNavClick(v.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-3 uppercase tracking-wider ${
                      currentView === v.id ? 'bg-brand-blue/5 text-brand-blue border border-brand-blue/10' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v.id === 'home' && <Home className="h-4.5 w-4.5 text-brand-blue" />}
                    {v.id === 'laporan' && <FileText className="h-4.5 w-4.5 text-brand-blue" />}
                    {v.id === 'peta' && <Map className="h-4.5 w-4.5 text-brand-blue" />}
                    {v.id === 'dashboard' && <BarChart3 className="h-4.5 w-4.5 text-brand-blue" />}
                    {v.label}
                  </button>
                ))}
                <div className="pt-2.5 border-t border-slate-100 mt-2.5">
                  {user ? (
                    <div>
                      <p className="text-xs text-slate-500 px-4 py-2 font-bold">{user.email}</p>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold text-red-500 hover:bg-red-50 transition-all flex items-center gap-3 uppercase tracking-wider">
                        <LogOut className="h-4.5 w-4.5" /> Keluar Sesi
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setIsLoginModalOpen(true); setMobileMenuOpen(false); }} className="w-full btn-primary px-4 py-3 text-xs font-bold flex items-center gap-3 justify-center">
                      <User className="h-4.5 w-4.5" /> Masuk Aplikasi
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeView
                onReportClick={() => setIsReportModalOpen(true)}
                reports={reports}
                onVote={handleVote}
                onDetail={setSelectedReport}
                onNavigate={handleNavClick}
              />
            </motion.div>
          )}
          {currentView === 'laporan' && (
            <motion.div key="laporan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <LaporanView
                onReportClick={() => setIsReportModalOpen(true)}
                reports={reports}
                onVote={handleVote}
                onDetail={setSelectedReport}
              />
            </motion.div>
          )}
          {currentView === 'peta' && (
            <motion.div key="peta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <MapPage
                reports={reports}
                onDetail={setSelectedReport}
                onLocationSelected={c => { setPendingCoords(c); setIsReportModalOpen(true); }}
              />
            </motion.div>
          )}
          {currentView === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20">
              <DashboardView reports={reports} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      <ReportModal
        key={`${isReportModalOpen}-${pendingCoords ? pendingCoords.join(',') : 'default'}`}
        isOpen={isReportModalOpen}
        onClose={() => { setIsReportModalOpen(false); setPendingCoords(null); }}
        onSubmit={(data) => {
          setReports(prev => [{ id: Date.now(), ...data, votes: 0, status: 'Dilaporkan', createdAt: new Date().toISOString() }, ...prev]);
          setIsReportModalOpen(false);
          setPendingCoords(null);
          showNotification('Laporan berhasil dikirim! 🎉');
        }}
        initialCoords={pendingCoords}
      />
      <DetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onVote={handleVote}
      />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[3000] toast text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold flex items-center gap-3 text-sm max-w-xs"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
