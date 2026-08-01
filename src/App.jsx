import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Megaphone, MapPin, Map, User, ChevronRight,
  ThumbsUp, MessageSquare, ShieldCheck, Zap, Menu, X, CheckCircle2,
  AlertCircle, LayoutDashboard, BarChart3, Filter, LogOut, Search,
  TrendingUp, FileText, Activity, ChevronLeft, Home, ArrowRight,
  Inbox, Award, Sparkles, Newspaper, Clock, Bell, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

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
const MiniStatCard = ({ label, value, icon: Icon, color, bg, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card-premium bg-white p-5 shadow-card hover:shadow-card-hover border border-slate-200/50 flex items-center gap-4"
  >
    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0 border border-slate-200/20`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-display">{label}</p>
      <p className={`text-2.5xl font-black ${color} font-display stat-number leading-none`}>{value}</p>
    </div>
  </motion.div>
);

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1F2937]/40 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card rounded-[1.75rem] w-full max-w-md relative z-10 p-8 sm:p-10 text-center"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-[#5B5FEF]/30 to-[#8B5CF6]/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] flex items-center justify-center shadow-blue-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight mb-1.5">Selamat Datang</h2>
          <p className="text-slate-500 text-sm mb-7 font-medium">Masuk untuk bergabung mewujudkan kota yang lebih baik.</p>

          <form onSubmit={(e) => { e.preventDefault(); onLogin({ email, isAdmin: email.toLowerCase().includes('admin') }); }} className="text-left">
            <div className="space-y-4 mb-6">
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
            <div className="mt-5 bg-[#5B5FEF]/5 border border-[#5B5FEF]/10 rounded-xl p-3.5">
              <p className="text-[11px] text-[#5B5FEF] font-semibold leading-relaxed">
                💡 Gunakan <b>'admin'</b> di email untuk mengakses panel Administrator.
              </p>
            </div>
          </form>
        </div>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1F2937]/40 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[1.75rem] w-full max-w-2xl overflow-hidden shadow-modal relative z-10 border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#5B5FEF] to-[#6C63FF] p-6 text-white flex justify-between items-center relative overflow-hidden shrink-0">
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1F2937]/40 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[1.75rem] w-full max-w-4xl overflow-hidden shadow-modal relative z-10 flex flex-col max-h-[90vh]">
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
// FOOTER (Indigo Gradient)
// ==========================================
const Footer = ({ onNavigate }) => {
  const footerLinks = [
    { label: 'Beranda', view: 'home' },
    { label: 'Semua Laporan', view: 'laporan' },
    { label: 'Peta Masalah', view: 'peta' },
    { label: 'Dashboard', view: 'dashboard' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#5B5FEF] via-[#6C63FF] to-[#8B5CF6] text-white">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.05] bg-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20"><Megaphone className="h-5 w-5 text-white" /></div>
              <span className="text-2xl font-black font-display tracking-tight">Civic<span className="text-white/90">Voice</span></span>
            </div>
            <p className="text-indigo-100/90 text-xs leading-relaxed max-w-sm font-medium">
              Platform partisipasi publik digital untuk melaporkan, memantau, dan mempercepat penyelesaian isu publik demi terwujudnya tata kelola kota yang responsif.
            </p>
            <div className="flex gap-2.5 mt-6">
              {['🌐', '📱', '💬'].map((icon, i) => (
                <div key={i} className="w-9 h-9 bg-white/10 hover:bg-white/25 rounded-xl flex items-center justify-center cursor-pointer transition-all text-sm border border-white/20 shadow-sm backdrop-blur-sm">
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
                    className="text-indigo-100/80 hover:text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 text-left"
                  >
                    <ChevronRight className="h-3 w-3" />{item.label}
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
                  <span className="text-indigo-100/80 hover:text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2">
                    <span>{item.icon}</span>{item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-indigo-100/70 font-semibold">
          <p>© 2026 CivicVoice. Seluruh Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">Dibuat dengan <Heart className="h-3 w-3 text-red-300 fill-red-300" /> untuk Kota Kita — <span className="text-white font-bold ml-1">CiTech Laos</span></p>
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
      whileHover={{ y: -6 }}
      className="bg-white rounded-[1.5rem] overflow-hidden flex flex-col h-full shadow-card hover:shadow-card-hover border border-slate-200/60 interactive-tilt preserve-3d"
    >
      <div className="relative h-52 shrink-0 cursor-pointer overflow-hidden group preserve-3d" onClick={() => onDetail(report)}>
        <img src={report.image} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 layer-z-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 layer-z-md"><CategoryBadge category={report.category} /></div>
        <div className="absolute top-4 right-4 layer-z-md"><StatusBadge status={report.status} /></div>
      </div>
      <div className="p-6 flex flex-col flex-1 preserve-3d">
        <h3 className="font-extrabold text-slate-900 text-lg mb-2 cursor-pointer hover:text-brand-blue transition-colors line-clamp-2 font-display leading-snug layer-z-md" onClick={() => onDetail(report)}>{report.title}</h3>
        <div className="flex items-center text-slate-400 text-xs font-semibold mb-3.5 layer-z-sm">
          <MapPin className="h-3.5 w-3.5 mr-1 text-brand-blue shrink-0" />{report.location}
        </div>
        <p className="text-slate-500 text-xs line-clamp-2 mb-6 flex-1 leading-relaxed font-medium layer-z-xs">{report.description || 'Tidak ada deskripsi detail.'}</p>
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-auto shrink-0 preserve-3d">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#5B5FEF] to-[#6C63FF] text-white px-4 py-2 text-sm font-black font-display shadow-blue layer-z-sm">
            <ThumbsUp className="h-4 w-4" />
            <span>{report.votes}</span>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider opacity-80">dukungan</span>
          </div>
          {report.status === 'Selesai' ? (
            <button disabled className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl text-xs font-bold cursor-not-allowed border border-emerald-100 flex items-center gap-1 layer-z-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onVote(report.id); }}
              className="btn-primary px-5 py-2 rounded-full text-xs font-bold shadow-blue layer-z-sm"
            >
              Dukung
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const HeroStatCard = ({ value, label, icon: Icon, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -6 }}
    className="bg-white rounded-[1.5rem] p-6 shadow-card hover:shadow-card-hover border border-slate-200/60"
  >
    <div className={`w-12 h-12 ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-blue`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div className="text-3.5xl font-black text-slate-900 font-display tracking-tight stat-number">{value}</div>
    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 font-display">{label}</div>
  </motion.div>
);

const WorkflowStep = ({ step, icon: Icon, title, desc, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -6 }}
    className="bg-white rounded-[1.5rem] p-7 border border-slate-200/60 shadow-card hover:shadow-card-hover group"
  >
    <div className="flex items-start justify-between mb-5">
      <div className={`w-12 h-12 ${color} border rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[10px] font-black text-slate-300 font-display tracking-widest">{step}</span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">{title}</h3>
    <p className="text-slate-500 text-xs leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const HomeView = ({ onReportClick, reports, onVote, onDetail, onNavigate }) => {
  const activeReports = reports.filter(r => r.status !== 'Selesai');
  const topReport = activeReports.length > 0 ? [...activeReports].sort((a, b) => b.votes - a.votes)[0] : null;
  const resolvedCount = reports.filter(r => r.status === 'Selesai').length;
  const popularReports = [...reports].sort((a, b) => b.votes - a.votes).slice(0, 3);
  const totalVotes = reports.reduce((sum, r) => sum + r.votes, 0);
  const latestNews = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const featured = topReport || reports[0];

  const workflows = [
    { step: '01', icon: Megaphone, title: 'Ajukan Laporan', desc: 'Laporkan masalah di sekitarmu lengkap dengan foto, lokasi, dan kronologi detail.', color: 'bg-indigo-50 text-[#5B5FEF] border-indigo-100/60' },
    { step: '02', icon: ThumbsUp, title: 'Kumpulkan Dukungan', desc: 'Warga memberikan dukungan untuk memvalidasi urgensi dan prioritas masalah.', color: 'bg-amber-50 text-amber-500 border-amber-100/60' },
    { step: '03', icon: ShieldCheck, title: 'Verifikasi Petugas', desc: 'Petugas meninjau dan memverifikasi kebenaran laporan secara transparan.', color: 'bg-emerald-50 text-emerald-500 border-emerald-100/60' },
    { step: '04', icon: CheckCircle2, title: 'Pantau Penyelesaian', desc: 'Ikuti progres penanganan secara real-time hingga status dinyatakan selesai.', color: 'bg-purple-50 text-purple-500 border-purple-100/60' },
  ];

  return (
    <div className="pt-16 page-enter">
      {/* HERO — 2 Kolom */}
      <section className="relative py-20 px-6 overflow-hidden bg-hero">
        <div className="absolute inset-0 pointer-events-none bg-pattern-grid" />
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-[#5B5FEF]/10 rounded-full blur-3xl blob pointer-events-none" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl blob blob-delay-2 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Kiri: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#5B5FEF]/15 px-4 py-2 rounded-full text-xs font-bold text-[#5B5FEF] mb-6 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Platform Civic-Tech Modern
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.05] font-display tracking-tight"
              >
                Suara Anda,<br />
                <span className="text-gradient font-black">Perubahan Nyata</span><br />
                Kota Kita
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base text-slate-500 max-w-lg mb-10 leading-relaxed font-medium"
              >
                Laporkan masalah lingkungan, infrastruktur, kesehatan, dan pendidikan di sekitar Anda secara langsung. Bersama wujudkan kota yang tanggap, transparan, dan berkelanjutan.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button onClick={onReportClick} className="btn-primary px-8 py-4 text-base rounded-2xl flex items-center justify-center gap-2 shadow-blue-lg">
                  <Megaphone className="h-5 w-5" /> Laporkan Sekarang
                </button>
                <button onClick={() => onNavigate('peta')} className="btn-secondary px-8 py-4 text-base rounded-2xl flex items-center justify-center gap-2">
                  <Map className="h-5 w-5 text-brand-blue" /> Lihat Peta Masalah
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 mt-10"
              >
                <div className="flex -space-x-3">
                  {['bg-[#5B5FEF]', 'bg-[#6C63FF]', 'bg-emerald-500', 'bg-amber-500'].map((c, i) => (
                    <div key={i} className={`w-10 h-10 ${c} rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white font-display`}>
                      {['A', 'B', 'S', 'D'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 font-display">1.200+ Warga Aktif</p>
                  <p className="text-xs text-slate-400 font-semibold">Telah berpartisipasi melaporkan</p>
                </div>
              </motion.div>
            </div>

            {/* Kanan: Ilustrasi */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-[#5B5FEF]/20 via-transparent to-[#8B5CF6]/20 rounded-[2.5rem] blur-2xl pointer-events-none" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-3d-lg border border-white/60">
                <img
                  src="/hero_smart_city.png"
                  alt="Ilustrasi Smart City"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5B5FEF]/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                  <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500/90 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 font-display leading-none">{resolvedCount} Selesai</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Ditangani tuntas</p>
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] rounded-xl flex items-center justify-center">
                      <ThumbsUp className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 font-display leading-none">{totalVotes} Dukungan</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Dari warga kota</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-5 -right-5 glass-card rounded-2xl px-4 py-3 float-slow">
                <p className="text-xs font-black text-[#5B5FEF] font-display flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> Real-time
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATISTIK — Card Modern */}
      <section className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <HeroStatCard value={reports.length} label="Total Laporan" icon={FileText} gradient="bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF]" />
            <HeroStatCard value={activeReports.length} label="Masalah Aktif" icon={Activity} gradient="bg-gradient-to-br from-amber-400 to-orange-500" delay={0.08} />
            <HeroStatCard value={resolvedCount} label="Selesai Ditangani" icon={CheckCircle2} gradient="bg-gradient-to-br from-emerald-400 to-green-600" delay={0.16} />
            <HeroStatCard value={totalVotes} label="Total Dukungan" icon={Heart} gradient="bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]" delay={0.24} />
          </div>
        </div>
      </section>

      {/* WORKFLOW — 4 Langkah Pastel */}
      <section className="py-20 px-6 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Alur Kerja Sistem</h2>
              <p className="text-slate-500 text-sm font-semibold mt-2">Empat langkah sederhana menuju kota yang lebih responsif.</p>
            </div>
            <span className="hidden md:flex items-center gap-2 text-xs font-bold text-[#5B5FEF] bg-[#5B5FEF]/5 border border-[#5B5FEF]/10 rounded-full px-4 py-2">
              <Sparkles className="h-3.5 w-3.5" /> Terintegrasi & Transparan
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflows.map((w, i) => <WorkflowStep key={w.step} {...w} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      {/* NEWS — Featured + List */}
      {featured && (
        <section className="py-20 px-6 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#5B5FEF] uppercase tracking-wider mb-3">
                  <Newspaper className="h-4 w-4" /> Berita & Update
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Kabar Terkini Warga</h2>
              </div>
              <button
                onClick={() => onNavigate('laporan')}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-[#5B5FEF] hover:gap-3 transition-all"
              >
                Lihat Semua Laporan <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                onClick={() => onDetail(featured)}
                className="lg:col-span-2 text-left bg-slate-900 rounded-[1.75rem] overflow-hidden shadow-3d-lg border border-slate-800 group relative"
              >
                <div className="flex flex-col md:flex-row h-full">
                  <div className="relative md:w-1/2 h-56 md:h-auto overflow-hidden">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent md:from-transparent md:bg-gradient-to-r md:from-slate-950/60" />
                  </div>
                  <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">🔥 Prioritas Utama</span>
                      <span className="text-slate-400 text-[10px] font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtDate(featured.createdAt)}</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-3 font-display leading-snug">{featured.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-3 font-medium">{featured.description}</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-white font-black font-display text-sm">
                        <ThumbsUp className="h-4 w-4 text-[#6C63FF]" /> {featured.votes} dukungan
                      </span>
                      <span className="text-xs font-bold text-[#6C63FF] flex items-center gap-1">
                        Baca Detail <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Side News List */}
              <div className="flex flex-col gap-6">
                {latestNews.map((r, i) => (
                  <motion.button
                    key={r.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    whileHover={{ x: 4 }}
                    onClick={() => onDetail(r)}
                    className="flex-1 text-left bg-white rounded-2xl border border-slate-200/60 shadow-card hover:shadow-card-hover p-4 flex gap-4 items-center"
                  >
                    <img src={r.image} alt={r.title} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5"><CategoryBadge category={r.category} /></div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{r.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {fmtDate(r.createdAt)}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LAPORAN POPULER */}
      <section className="py-20 px-6 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Laporan Terpopuler</h2>
              <p className="text-slate-500 text-sm font-semibold mt-2">Aspirasi publik dengan dukungan terbanyak minggu ini.</p>
            </div>
            <button
              onClick={() => onNavigate('laporan')}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-[#5B5FEF] hover:gap-3 transition-all"
            >
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularReports.map(r => <ReportCard key={r.id} report={r} onVote={onVote} onDetail={onDetail} />)}
          </div>
          {popularReports.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm font-semibold">Belum ada laporan publik.</p>
              <button onClick={onReportClick} className="btn-primary px-6 py-3 rounded-xl text-sm mt-4 shadow-blue">Buat Laporan Pertama</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#5B5FEF] via-[#6C63FF] to-[#8B5CF6] p-10 md:p-14 text-center text-white shadow-3d-lg"
          >
            <div className="absolute inset-0 opacity-[0.08] bg-pattern pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight mb-3">Siap Jadi Bagian dari Perubahan?</h2>
              <p className="text-indigo-100 text-sm md:text-base mb-8 font-medium max-w-xl mx-auto">Laporkan masalah di sekitarmu sekarang dan bantu kota kita menjadi lebih baik.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={onReportClick} className="bg-white text-[#5B5FEF] px-8 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-50 hover:-translate-y-0.5 transition-all shadow-xl flex items-center justify-center gap-2">
                  <Megaphone className="h-5 w-5" /> Laporkan Sekarang
                </button>
                <button onClick={() => onNavigate('laporan')} className="border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  Jelajahi Laporan <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
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
    <div className="pt-24 pb-24 bg-[#FAFAFA] min-h-screen px-6 page-enter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display tracking-tight">Semua Laporan Warga</h1>
            <p className="text-slate-500 text-sm font-semibold mt-2">Daftar aspirasi warga terpublikasi: {filtered.length} laporan aktif</p>
          </div>
          <button onClick={onReportClick} className="btn-primary px-6 py-3 text-xs rounded-2xl shadow-blue flex items-center gap-2 w-fit">
            <Megaphone className="h-4 w-4" /> Kirim Laporan Baru
          </button>
        </div>

        {/* Stat Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MiniStatCard label="Total Laporan" value={reports.length} icon={FileText} color="text-brand-blue" bg="bg-[#EEEDFF]" />
          <MiniStatCard label="Perlu Verifikasi" value={reports.filter(r => r.status === 'Dilaporkan').length} icon={AlertCircle} color="text-red-500" bg="bg-red-50" delay={0.05} />
          <MiniStatCard label="Dalam Proses" value={reports.filter(r => r.status === 'Diproses' || r.status === 'Diverifikasi').length} icon={Activity} color="text-blue-500" bg="bg-blue-50" delay={0.1} />
          <MiniStatCard label="Selesai Ditangani" value={reports.filter(r => r.status === 'Selesai').length} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50" delay={0.15} />
        </div>

        {/* Search + Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-card p-4 mb-8 flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci laporan atau lokasi..."
              className="input-premium pl-10 py-2.5 text-xs rounded-xl"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-premium md:w-48 py-2.5 text-xs font-semibold rounded-xl"
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
            className="input-premium md:w-48 py-2.5 text-xs font-semibold rounded-xl"
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
              className="btn-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-2 whitespace-nowrap rounded-xl"
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
              className="btn-secondary w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed text-slate-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full font-bold text-xs transition-all ${page === p ? 'bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] text-white shadow-blue' : 'btn-secondary text-slate-700 border-slate-200'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed text-slate-500"
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
      backgroundColor: ['#22C55E', '#5B5FEF', '#EF4444', '#8B5CF6'],
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
      backgroundColor: ['#EF4444', '#F59E0B', '#5B5FEF', '#22C55E'],
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
    { label: 'Total Laporan', value: reports.length, icon: FileText, color: 'text-brand-blue', bg: 'bg-[#EEEDFF]', border: 'border-indigo-100/50' },
    { label: 'Tahap Verifikasi', value: statusCount['Diverifikasi'], icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100/50' },
    { label: 'Dalam Proses', value: statusCount['Diproses'], icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100/50' },
    { label: 'Selesai Ditangani', value: statusCount['Selesai'], icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100/50' },
  ];

  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  const maxCategory = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;
  const categoryColors = {
    'Lingkungan': 'bg-emerald-500',
    'Infrastruktur': 'bg-[#5B5FEF]',
    'Kesehatan': 'bg-red-500',
    'Pendidikan': 'bg-purple-500',
  };
  const categoryIcons = { 'Lingkungan': '🌿', 'Infrastruktur': '🏗️', 'Kesehatan': '❤️', 'Pendidikan': '📚' };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthCount = {};
  reports.forEach(r => {
    const m = new Date(r.createdAt).getMonth();
    monthCount[m] = (monthCount[m] || 0) + 1;
  });
  const sortedMonths = Object.keys(monthCount).sort((a, b) => a - b).map(Number);

  const lineData = {
    labels: sortedMonths.map(m => monthNames[m]),
    datasets: [{
      label: 'Laporan Masuk',
      data: sortedMonths.map(m => monthCount[m]),
      borderColor: '#5B5FEF',
      backgroundColor: 'rgba(91, 95, 239, 0.08)',
      pointBackgroundColor: '#5B5FEF',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      tension: 0.4,
      fill: true,
    }]
  };

  const lineOptions = {
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

  const priorityReports = [...reports].sort((a, b) => b.votes - a.votes).slice(0, 4);
  const latestReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

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
              whileHover={{ y: -4 }}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <div className="chart-container shadow-card">
            <h3 className="font-extrabold text-slate-900 mb-6 text-sm uppercase tracking-wider font-display text-slate-400">Tren Laporan Per Bulan</h3>
            <div className="h-72"><Line data={lineData} options={lineOptions} /></div>
          </div>
          <div className="chart-container shadow-card">
            <h3 className="font-extrabold text-slate-900 mb-6 text-sm uppercase tracking-wider font-display text-slate-400">Status Penanganan</h3>
            <div className="h-72"><Bar data={barData} options={barOptions} /></div>
          </div>
          <div className="chart-container shadow-card">
            <h3 className="font-extrabold text-slate-900 mb-6 text-sm uppercase tracking-wider font-display text-slate-400">Distribusi Kategori</h3>
            <div className="h-72 flex justify-center"><Doughnut data={pieData} options={pieOptions} /></div>
          </div>
        </div>

        {/* Ranking + Prioritas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="chart-container shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider font-display text-slate-400">Ranking Kategori</h3>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="space-y-5">
              {sortedCategories.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <span className="text-sm">{categoryIcons[cat] || '📌'}</span>{cat}
                    </span>
                    <span className="text-xs font-black text-slate-500 font-display">{count} laporan</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCategory) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${categoryColors[cat] || 'bg-brand-blue'}`}
                    />
                  </div>
                </div>
              ))}
              {sortedCategories.length === 0 && <p className="text-slate-400 text-xs">Belum ada data kategori.</p>}
            </div>
          </div>

          <div className="chart-container shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider font-display text-slate-400">Laporan Prioritas</h3>
              <TrendingUp className="h-4 w-4 text-brand-blue" />
            </div>
            <div className="space-y-3">
              {priorityReports.map((r, idx) => (
                <div key={r.id} className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-blue-50/40 hover:border-blue-200/40 transition-colors">
                  <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black font-display text-xs ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-[#EEEDFF] text-brand-blue'}`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{r.title}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-brand-blue shrink-0" />{r.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-800 font-display flex items-center gap-1 justify-end">
                      <ThumbsUp className="h-3.5 w-3.5 text-brand-blue" />{r.votes}
                    </p>
                    <div className="mt-1.5"><StatusBadge status={r.status} /></div>
                  </div>
                </div>
              ))}
              {priorityReports.length === 0 && <p className="text-slate-400 text-xs">Belum ada laporan.</p>}
            </div>
          </div>
        </div>

        {/* Tabel Laporan Terbaru */}
        <div className="chart-container shadow-card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider font-display text-slate-400">Laporan Terbaru</h3>
            <FileText className="h-4 w-4 text-brand-blue" />
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">No</th>
                  <th className="pb-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Laporan</th>
                  <th className="pb-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Kategori</th>
                  <th className="pb-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Lokasi</th>
                  <th className="pb-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Dukungan</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestReports.map((r, idx) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 pr-4 text-xs font-black text-slate-400 font-display">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <img src={r.image} alt={r.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-56">{r.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-56">{r.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4"><CategoryBadge category={r.category} /></td>
                    <td className="py-4 pr-4">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-brand-blue shrink-0" />{r.location}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs font-black text-slate-800 font-display flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5 text-brand-blue" />{r.votes}
                      </span>
                    </td>
                    <td className="py-4"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
                {latestReports.length === 0 && (
                  <tr><td colSpan="6" className="py-8 text-center text-xs text-slate-400">Belum ada laporan terbaru.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] p-6 rounded-2xl text-white shadow-blue flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider font-display">Akumulasi Dukungan</p>
              <ThumbsUp className="h-4.5 w-4.5 text-indigo-200" />
            </div>
            <div>
              <p className="text-3.5xl font-black font-display stat-number">{totalVotes}</p>
              <p className="text-indigo-200/80 text-[10px] mt-1.5 font-semibold">Total vote dari warga untuk seluruh laporan</p>
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
    'Diproses': '#5B5FEF',
    'Selesai': '#22C55E',
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
    { label: 'Diproses', color: '#5B5FEF' },
    { label: 'Selesai', color: '#22C55E' },
  ];

  const statusSummary = {
    'Dilaporkan': filtered.filter(r => r.status === 'Dilaporkan').length,
    'Diverifikasi': filtered.filter(r => r.status === 'Diverifikasi').length,
    'Diproses': filtered.filter(r => r.status === 'Diproses').length,
    'Selesai': filtered.filter(r => r.status === 'Selesai').length,
  };

  return (
    <div className={`${hideSidebar ? 'h-full' : 'pt-24 h-screen'} w-full relative flex flex-col page-enter`}>
      {!hideSidebar && (
        <div className="px-6 pt-8 pb-5 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Peta Masalah Publik</h1>
              <p className="text-slate-500 text-xs font-semibold mt-1">Visualisasi spasial lokasi pengaduan warga secara real-time</p>
            </div>
            <div className="flex items-center gap-1.5 text-brand-blue font-bold text-xs uppercase tracking-wider w-fit">
              <Map className="h-4 w-4" /> {filtered.length} titik aktif
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStatCard label="Total Titik" value={filtered.length} icon={MapPin} color="text-brand-blue" bg="bg-[#EEEDFF]" />
            <MiniStatCard label="Dilaporkan" value={statusSummary['Dilaporkan']} icon={AlertCircle} color="text-red-500" bg="bg-red-50" delay={0.05} />
            <MiniStatCard label="Dalam Proses" value={statusSummary['Diproses'] + statusSummary['Diverifikasi']} icon={Activity} color="text-blue-500" bg="bg-blue-50" delay={0.1} />
            <MiniStatCard label="Selesai" value={statusSummary['Selesai']} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50" delay={0.15} />
          </div>
        </div>
      )}
      <div className={`flex flex-1 min-h-0 ${hideSidebar ? 'rounded-3xl overflow-hidden shadow-card border border-slate-200/50' : 'overflow-hidden'}`}>
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
                    <span className="text-[9px] font-extrabold text-brand-blue bg-[#EEEDFF]/70 border border-indigo-100/35 px-2 py-0.5 rounded-md uppercase tracking-wide">{r.category}</span>
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
            <div className="p-4 border-t border-slate-150 bg-[#EEEDFF]/40 shrink-0">
              <p className="text-[10px] text-[#5B5FEF] font-bold flex items-center gap-2 leading-relaxed">
                <MapPin className="h-4.5 w-4.5 text-brand-blue shrink-0" />
                Klik titik koordinat peta untuk melaporkan masalah secara spesifik.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative z-0 min-h-0">
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
    </div>
  );
};

// ==========================================
// VIEWS (Admin)
// ==========================================
const AdminSidebar = ({ active, setActive, onLogout }) => (
  <div className="w-64 admin-sidebar text-white flex flex-col h-screen fixed top-0 left-0 z-20">
    <div className="p-6 flex items-center gap-3 border-b border-white/10">
      <div className="bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] p-2.5 rounded-xl shadow-blue"><ShieldCheck className="h-4.5 w-4.5 text-white" /></div>
      <span className="text-xl font-black font-display tracking-tight">Admin<span className="text-[#6C63FF]">Hub</span></span>
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
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-xs ${active === item.id ? 'bg-gradient-to-r from-[#5B5FEF] to-[#6C63FF] text-white shadow-blue' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
          <item.icon className="h-4 w-4" /> {item.label}
        </button>
      ))}
    </div>
    <div className="p-4 border-t border-white/10">
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
      <div className="w-10 h-10 bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] rounded-xl flex items-center justify-center shadow-blue">
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

      {/* Stat Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MiniStatCard label="Total Laporan" value={reports.length} icon={FileText} color="text-brand-blue" bg="bg-[#EEEDFF]" />
        <MiniStatCard label="Perlu Verifikasi" value={reports.filter(r => r.status === 'Dilaporkan').length} icon={AlertCircle} color="text-red-500" bg="bg-red-50" delay={0.05} />
        <MiniStatCard label="Dalam Proses" value={reports.filter(r => r.status === 'Diproses' || r.status === 'Diverifikasi').length} icon={Activity} color="text-blue-500" bg="bg-blue-50" delay={0.1} />
        <MiniStatCard label="Selesai" value={reports.filter(r => r.status === 'Selesai').length} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50" delay={0.15} />
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
      <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
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
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAFA]">
      {/* Floating Glass Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-3">
        <div className="max-w-6xl mx-auto glass-nav rounded-2xl px-4 sm:px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-3 shrink-0">
            <div className="bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] p-2.5 rounded-xl shadow-blue">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 font-display tracking-tight">
              Civic<span className="text-gradient">Voice</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(v => (
              <button
                key={v.id}
                onClick={() => handleNavClick(v.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  currentView === v.id
                    ? 'bg-gradient-to-r from-[#5B5FEF] to-[#6C63FF] text-white shadow-blue'
                    : 'text-slate-600 hover:text-[#5B5FEF] hover:bg-white/80'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-slate-200/60 bg-white/60 hover:bg-white text-slate-500 hover:text-[#5B5FEF] transition-all shadow-sm relative" aria-label="Notifikasi">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full pulse-dot"></span>
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-2.5">
                <div className="flex items-center gap-2.5 bg-white/70 border border-slate-200/60 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B5FEF] to-[#6C63FF] flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{user.email.split('@')[0]}</span>
                </div>
                <button onClick={handleLogout} className="btn-danger border border-red-200 px-4 py-2 text-xs font-bold transition-all shadow-sm">Logout</button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden md:flex btn-primary px-5 py-2.5 rounded-full text-xs font-bold items-center gap-2"
              >
                <User className="h-4 w-4" /> Masuk Aplikasi
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-slate-200/60 bg-white/70 hover:bg-white transition-all shadow-sm"
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden max-w-6xl mx-auto mt-2 glass-nav rounded-2xl overflow-hidden"
            >
              <div className="p-3 space-y-1">
                {navItems.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleNavClick(v.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-3 ${
                      currentView === v.id ? 'bg-gradient-to-r from-[#5B5FEF] to-[#6C63FF] text-white shadow-blue' : 'text-slate-700 hover:bg-white/80'
                    }`}
                  >
                    {v.id === 'home' && <Home className="h-4.5 w-4.5" />}
                    {v.id === 'laporan' && <FileText className="h-4.5 w-4.5" />}
                    {v.id === 'peta' && <Map className="h-4.5 w-4.5" />}
                    {v.id === 'dashboard' && <BarChart3 className="h-4.5 w-4.5" />}
                    {v.label}
                  </button>
                ))}
                <div className="pt-2.5 border-t border-slate-200/60 mt-2.5">
                  {user ? (
                    <div>
                      <p className="text-xs text-slate-500 px-4 py-2 font-bold">{user.email}</p>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold text-red-500 hover:bg-red-50 transition-all flex items-center gap-3">
                        <LogOut className="h-4.5 w-4.5" /> Keluar Sesi
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setIsLoginModalOpen(true); setMobileMenuOpen(false); }} className="w-full btn-primary px-4 py-3 text-xs font-bold flex items-center gap-3 justify-center rounded-xl">
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
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24">
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
