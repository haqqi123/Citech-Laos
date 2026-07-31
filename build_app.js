const fs = require('fs');

const appContent = `import React, { useState, useMemo, useEffect } from 'react';
import { 
  Megaphone, MapPin, Map, User, ChevronRight, Leaf, HardHat, HeartPulse, GraduationCap, 
  ThumbsUp, MessageSquare, ShieldCheck, Globe, Zap, Menu, X, Camera, Clock, CheckCircle2, 
  AlertCircle, LayoutDashboard, BarChart3, Filter, LogOut, Settings, Search, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// DUMMY DATA
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

const CategoryBadge = ({ category }) => {
  const styles = {
    'Lingkungan': 'bg-green-100 text-green-700 border-green-200',
    'Infrastruktur': 'bg-blue-100 text-blue-700 border-blue-200',
    'Kesehatan': 'bg-red-100 text-red-700 border-red-200',
    'Pendidikan': 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return <span className={\`\${styles[category] || 'bg-slate-100 text-slate-700'} border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider\`}>{category}</span>;
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Dilaporkan': 'bg-slate-100 text-slate-700 border-slate-200',
    'Diverifikasi': 'bg-amber-100 text-amber-700 border-amber-200',
    'Diproses': 'bg-blue-100 text-blue-700 border-blue-200',
    'Selesai': 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={\`\${styles[status] || styles['Dilaporkan']} border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm\`}>
      <span className={\`w-1.5 h-1.5 rounded-full \${status === 'Selesai' ? 'bg-green-500' : 'bg-current animate-pulse'}\`}></span>
      {status}
    </span>
  );
};

// ==========================================
// MODALS
// ==========================================
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10">
        <div className="bg-brand-blue p-8 text-white flex justify-between items-center">
          <div><h2 className="text-2xl font-bold">Masuk</h2><p className="text-blue-100 text-sm mt-1">Gunakan 'admin' di email untuk akses Admin</p></div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin({ email, isAdmin: email.includes('admin') }); }} className="p-8">
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input required type="email" placeholder="admin@contoh.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-blue/20 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-blue/20 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">Login</button>
        </form>
      </motion.div>
    </div>
  );
};

const ReportModal = ({ isOpen, onClose, onSubmit, initialCoords }) => {
  const [formData, setFormData] = useState({ title: '', category: 'Lingkungan', location: '', description: '', coords: initialCoords || [-6.20, 106.81], image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=400' });
  useEffect(() => { if (initialCoords) setFormData(prev => ({ ...prev, coords: initialCoords })); }, [initialCoords]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-100">
        <div className="bg-gradient-to-r from-brand-blue to-blue-600 p-8 text-white flex justify-between items-center">
          <div><h2 className="text-2xl font-bold">Buat Laporan Baru</h2></div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Judul</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
            <div><label className="block text-sm font-semibold mb-2">Kategori</label><select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}><option>Lingkungan</option><option>Infrastruktur</option><option>Kesehatan</option><option>Pendidikan</option></select></div>
            <div><label className="block text-sm font-semibold mb-2">Lokasi</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-semibold mb-2">Deskripsi</label><textarea rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea></div>
          </div>
          <div className="mt-8 flex gap-4"><button type="button" onClick={onClose} className="flex-1 bg-white border py-3.5 rounded-xl">Batal</button><button type="submit" className="flex-1 bg-brand-blue text-white py-3.5 rounded-xl">Kirim</button></div>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        <div className="relative h-64 shrink-0">
          <img src={report.image} alt={report.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <button onClick={onClose} className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white"><X className="h-5 w-5" /></button>
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex gap-2 mb-3"><CategoryBadge category={report.category} /><StatusBadge status={report.status} /></div>
            <h2 className="text-3xl font-bold text-white mb-2">{report.title}</h2>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
          <div className="p-8 lg:w-2/3 overflow-y-auto border-r border-slate-100">
            <div className="mb-8"><h4 className="font-bold text-slate-900 mb-3 text-lg">Deskripsi Laporan</h4><p className="text-slate-600 bg-slate-50 p-5 rounded-2xl">{report.description}</p></div>
            <div className="mb-8"><h4 className="font-bold text-slate-900 mb-6 text-lg">Progress Penanganan</h4>
              <div className="relative">
                <div className="absolute top-5 left-6 bottom-5 w-0.5 bg-slate-100"></div>
                <div className="absolute top-5 left-6 w-0.5 bg-brand-blue" style={{ height: \`\${(currentStepIndex / 3) * 100}%\` }}></div>
                <div className="space-y-6">
                  {timelineSteps.map((step, idx) => (
                    <div key={step} className="relative flex items-center gap-6 z-10">
                      <div className={\`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm \${idx <= currentStepIndex ? 'bg-brand-blue text-white' : 'bg-slate-100'}\`}>
                        {idx <= currentStepIndex ? <CheckCircle2 className="h-5 w-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>}
                      </div>
                      <div className={\`flex-1 p-4 rounded-2xl border \${idx === currentStepIndex ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-transparent'}\`}>
                        <h5 className={\`font-bold text-sm \${idx <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'}\`}>{step}</h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 lg:w-1/3 bg-slate-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 text-center">
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{report.votes}</div>
              <div className="text-xs font-bold text-slate-400 uppercase mb-4">Dukungan Warga</div>
              {report.status === 'Selesai' ? (
                <button disabled className="w-full bg-slate-100 text-slate-400 py-3.5 rounded-xl font-bold flex justify-center gap-2 cursor-not-allowed"><CheckCircle2 className="h-5 w-5" /> Selesai</button>
              ) : (
                <button onClick={() => onVote(report.id)} className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold flex justify-center gap-2"><ThumbsUp className="h-5 w-5" /> Dukung</button>
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-brand-blue" /> Komentar</h4>
              <div className="space-y-4">
                {dummyComments.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100"><p className="text-sm font-bold">{c.user}</p><p className="text-xs text-slate-600 mt-1">{c.text}</p></div>
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
// VIEWS (Public)
// ==========================================
const ReportCard = ({ report, onVote, onDetail }) => (
  <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full">
    <div className="relative h-56 shrink-0 cursor-pointer" onClick={() => onDetail(report)}>
      <img src={report.image} alt={report.title} className="w-full h-full object-cover" />
      <div className="absolute top-4 left-4"><CategoryBadge category={report.category} /></div>
      <div className="absolute top-4 right-4"><StatusBadge status={report.status} /></div>
    </div>
    <div className="p-6 flex flex-col flex-1">
      <h3 className="font-bold text-slate-900 text-xl mb-3 cursor-pointer hover:text-brand-blue line-clamp-2" onClick={() => onDetail(report)}>{report.title}</h3>
      <div className="flex items-center text-slate-500 text-sm mb-4"><MapPin className="h-4 w-4 mr-1.5 text-brand-blue" />{report.location}</div>
      <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">{report.description}</p>
      <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2 font-extrabold text-lg"><ThumbsUp className="h-5 w-5 text-brand-blue" /> {report.votes}</div>
        {report.status === 'Selesai' ? (
          <button disabled className="bg-slate-100 text-slate-400 px-6 py-2 rounded-xl text-sm font-bold cursor-not-allowed">Selesai</button>
        ) : (
          <button onClick={() => onVote(report.id)} className="bg-slate-50 hover:bg-brand-blue hover:text-white text-slate-700 px-6 py-2 rounded-xl text-sm font-bold transition-all border border-slate-200">Vote</button>
        )}
      </div>
    </div>
  </div>
);

const HomeView = ({ onReportClick, reports, onVote, onDetail }) => {
  const activeReports = reports.filter(r => r.status !== 'Selesai');
  const topReport = activeReports.length > 0 ? [...activeReports].sort((a,b) => b.votes - a.votes)[0] : null;
  return (
    <div className="pt-20">
      <section className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto text-center"><h1 className="text-5xl font-extrabold text-slate-900 mb-6">Suara Anda, <span className="text-brand-blue">Perubahan Kota</span></h1>
        <button onClick={onReportClick} className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold shadow-xl mx-auto flex gap-2"><Megaphone className="h-5 w-5"/> Laporkan Sekarang</button>
        </div>
      </section>
      {topReport && (
        <section className="py-12 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 text-white flex justify-between items-center gap-10">
            <div>
              <div className="bg-brand-red inline-block px-4 py-1 rounded-full text-xs font-bold mb-4">🔥 Masalah Utama Minggu Ini</div>
              <h2 className="text-4xl font-extrabold mb-4">{topReport.title}</h2>
              <button onClick={() => onDetail(topReport)} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold">Lihat Detail</button>
            </div>
            <img src={topReport.image} className="w-1/3 h-64 object-cover rounded-3xl" alt="top" />
          </div>
        </section>
      )}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto"><h2 className="text-3xl font-extrabold mb-12">Laporan Populer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{reports.sort((a,b)=>b.votes-a.votes).slice(0,3).map(r=><ReportCard key={r.id} report={r} onVote={onVote} onDetail={onDetail}/>)}</div>
        </div>
      </section>
    </div>
  );
};

const LaporanView = ({ onReportClick, reports, onVote, onDetail }) => (
  <div className="pt-28 pb-24 bg-slate-50 min-h-screen px-4">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-12">Semua Laporan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{reports.map(r=><ReportCard key={r.id} report={r} onVote={onVote} onDetail={onDetail}/>)}</div>
    </div>
  </div>
);

const DashboardView = ({ reports }) => (
  <div className="pt-28 pb-20 bg-slate-50 min-h-screen px-4">
    <div className="max-w-7xl mx-auto"><h1 className="text-3xl font-extrabold mb-12">Dashboard Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border"><p className="text-sm font-bold text-slate-400">Total Laporan</p><p className="text-4xl font-extrabold">{reports.length}</p></div>
        <div className="bg-white p-6 rounded-3xl border"><p className="text-sm font-bold text-slate-400">Selesai</p><p className="text-4xl font-extrabold">{reports.filter(r=>r.status==='Selesai').length}</p></div>
      </div>
    </div>
  </div>
);

// Peta Shared Component
const MapPage = ({ reports, onVote, onDetail, onLocationSelected, pendingCoords, hideSidebar = false }) => {
  const [filterCat, setFilterCat] = useState('Semua');
  const filtered = reports.filter(r => filterCat === 'Semua' || r.category === filterCat);
  const getMarkerIcon = (r) => L.divIcon({html: \`<div style="background-color: \${r.status==='Dilaporkan'?'#ef4444':r.status==='Diproses'?'#f59e0b':'#10b981'}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white;"></div>\`, className: '', iconSize: [30,30]});
  const Picker = () => { useMapEvents({click(e) { if(onLocationSelected) onLocationSelected([e.latlng.lat, e.latlng.lng]); }}); return null; };
  return (
    <div className={\`\${hideSidebar ? 'h-full rounded-3xl overflow-hidden' : 'pt-20 h-screen'} w-full relative flex\`}>
      {!hideSidebar && <div className="w-80 bg-white border-r p-6"><h3 className="font-bold mb-4">Filter</h3><select className="w-full border p-2 rounded" value={filterCat} onChange={(e)=>setFilterCat(e.target.value)}><option>Semua</option><option>Lingkungan</option></select></div>}
      <div className="flex-1 relative z-0">
        <MapContainer center={[-6.22, 106.82]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <Picker />
          {filtered.map(r => <Marker key={r.id} position={r.coords} icon={getMarkerIcon(r)}><Popup><button onClick={()=>onDetail&&onDetail(r)}>Detail</button></Popup></Marker>)}
        </MapContainer>
      </div>
    </div>
  );
};

// ==========================================
// VIEWS (Admin)
// ==========================================
const AdminSidebar = ({ active, setActive, onLogout }) => (
  <div className="w-72 bg-slate-900 text-white flex flex-col h-screen fixed top-0 left-0">
    <div className="p-8 flex items-center gap-3 border-b border-slate-800">
      <ShieldCheck className="h-8 w-8 text-brand-blue" />
      <span className="text-2xl font-extrabold tracking-tight">Admin<span className="text-brand-blue">Hub</span></span>
    </div>
    <div className="p-6 flex-1 space-y-2">
      {[{id:'dashboard', icon:LayoutDashboard, label:'Dashboard'}, {id:'laporan', icon:MessageSquare, label:'Laporan'}, {id:'peta', icon:Map, label:'Peta Live'}].map(item => (
        <button key={item.id} onClick={() => setActive(item.id)} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${active === item.id ? 'bg-brand-blue text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
          <item.icon className="h-5 w-5" /> {item.label}
        </button>
      ))}
    </div>
    <div className="p-6 border-t border-slate-800">
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl font-bold transition-all">
        <LogOut className="h-5 w-5" /> Logout
      </button>
    </div>
  </div>
);

const AdminLaporan = ({ reports, onUpdateStatus }) => {
  const [filter, setFilter] = useState('Semua');
  const filtered = reports.filter(r => filter === 'Semua' || r.status === filter);
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-3xl font-extrabold text-slate-900 mb-1">Manajemen Laporan</h2><p className="text-slate-500">Kelola dan update progres laporan masyarakat.</p></div>
        <select className="border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-700 bg-white" value={filter} onChange={(e)=>setFilter(e.target.value)}>
          <option value="Semua">Semua Status</option><option value="Dilaporkan">Dilaporkan</option><option value="Diverifikasi">Diverifikasi</option><option value="Diproses">Diproses</option><option value="Selesai">Selesai</option>
        </select>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50"><tr className="text-xs uppercase font-bold text-slate-400 tracking-wider"><th className="px-6 py-5">Info Laporan</th><th className="px-6 py-5">Kategori</th><th className="px-6 py-5">Status</th><th className="px-6 py-5 text-center">Aksi Status</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4"><p className="font-bold text-slate-900">{r.title}</p><p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3"/> {r.location}</p></td>
                <td className="px-6 py-4"><CategoryBadge category={r.category} /></td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    {['Diverifikasi', 'Diproses', 'Selesai'].map(s => (
                      <button key={s} disabled={r.status === s || r.status === 'Selesai'} onClick={() => onUpdateStatus(r.id, s)} className={\`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all \${r.status===s||r.status==='Selesai'?'bg-slate-100 text-slate-300 cursor-not-allowed':'bg-white border border-slate-200 hover:border-brand-blue text-slate-600 hover:text-brand-blue'}\`}>
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
  );
};

// ==========================================
// MAIN APP
// ==========================================
function App() {
  const [currentView, setCurrentView] = useState('home');
  const [adminView, setAdminView] = useState('dashboard');
  const [reports, setReports] = useState(initialReports);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [notification, setNotification] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [user, setUser] = useState(null);

  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  
  const handleVote = (id) => {
    const r = reports.find(x => x.id === id);
    if(r && r.status === 'Selesai') { showNotification("Laporan Selesai tidak dapat divote."); return; }
    setReports(prev => prev.map(x => x.id === id ? {...x, votes: x.votes+1} : x));
    if(selectedReport?.id === id) setSelectedReport(prev => ({...prev, votes: prev.votes+1}));
    showNotification("Vote berhasil!");
  };

  const handleUpdateStatus = (id, status) => {
    setReports(prev => prev.map(x => x.id === id ? {...x, status} : x));
    showNotification(\`Status diperbarui menjadi \${status}\`);
  };

  const handleLogin = (u) => { setUser(u); setIsLoginModalOpen(false); showNotification(u.isAdmin ? "Berhasil login sebagai Admin" : "Berhasil login"); };
  const handleLogout = () => { setUser(null); setCurrentView('home'); showNotification("Berhasil logout"); };

  // Admin Layout
  if (user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <AdminSidebar active={adminView} setActive={setAdminView} onLogout={handleLogout} />
        <div className="flex-1 ml-72 overflow-x-hidden">
          {adminView === 'dashboard' && <DashboardView reports={reports} />}
          {adminView === 'laporan' && <AdminLaporan reports={reports} onUpdateStatus={handleUpdateStatus} />}
          {adminView === 'peta' && <div className="p-8 h-screen"><MapPage reports={reports} hideSidebar={true} /></div>}
        </div>
        <AnimatePresence>{notification && <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="fixed bottom-8 right-8 z-[3000] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl font-semibold">{notification}</motion.div>}</AnimatePresence>
      </div>
    );
  }

  // Public Layout
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <nav className="fixed top-0 w-full z-50 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <button onClick={() => setCurrentView('home')} className="flex items-center gap-3">
            <div className="bg-brand-blue p-2.5 rounded-xl"><Megaphone className="h-5 w-5 text-white" /></div>
            <span className="text-2xl font-extrabold text-slate-900">Civic<span className="text-brand-blue">Voice</span></span>
          </button>
          <div className="hidden md:flex space-x-8">
            {['home','laporan','peta','dashboard'].map(v => (
              <button key={v} onClick={() => setCurrentView(v)} className={\`capitalize text-sm font-bold transition-colors \${currentView===v?'text-brand-blue':'text-slate-600 hover:text-brand-blue'}\`}>{v}</button>
            ))}
          </div>
          <button onClick={() => setIsLoginModalOpen(true)} className="bg-white border border-slate-200 px-6 py-2 rounded-full font-bold text-sm hover:border-brand-blue hover:text-brand-blue flex items-center gap-2"><User className="h-4 w-4"/> Login</button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {currentView === 'home' && <HomeView onReportClick={()=>setIsReportModalOpen(true)} reports={reports} onVote={handleVote} onDetail={setSelectedReport} />}
        {currentView === 'laporan' && <LaporanView onReportClick={()=>setIsReportModalOpen(true)} reports={reports} onVote={handleVote} onDetail={setSelectedReport} />}
        {currentView === 'peta' && <MapPage reports={reports} onVote={handleVote} onDetail={setSelectedReport} onLocationSelected={c=>{setPendingCoords(c); setIsReportModalOpen(true);}} pendingCoords={pendingCoords} />}
        {currentView === 'dashboard' && <DashboardView reports={reports} />}
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      <ReportModal isOpen={isReportModalOpen} onClose={() => {setIsReportModalOpen(false); setPendingCoords(null);}} onSubmit={(data) => {
        setReports([{id:Date.now(), ...data, votes:0, status:'Dilaporkan', createdAt: new Date().toISOString()}, ...reports]);
        setIsReportModalOpen(false); showNotification("Laporan terkirim");
      }} initialCoords={pendingCoords} />
      <DetailModal report={selectedReport} isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} onVote={handleVote} />

      <AnimatePresence>{notification && <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="fixed bottom-8 right-8 z-[3000] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl font-semibold flex gap-2 items-center"><CheckCircle2 className="h-5 w-5 text-green-400"/> {notification}</motion.div>}</AnimatePresence>
    </div>
  );
}

export default App;
`;

// fs.writeFileSync('./src/App.jsx', appContent);
// console.log("WARNING: build_app.js writing is disabled to protect the advanced 3D / Leaflet App.jsx version.");

