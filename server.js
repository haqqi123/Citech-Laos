import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// SQLite Connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// Report Model
const Report = sequelize.define('Report', {
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  votes: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Dilaporkan' },
  coords: { 
    type: DataTypes.TEXT, 
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('coords');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(val) {
      this.setDataValue('coords', JSON.stringify(val));
    }
  },
  image: { type: DataTypes.TEXT, defaultValue: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=400' }
});

// Sync Database — alter:true adds new columns without dropping existing data
sequelize.sync({ alter: true })
  .then(() => console.log('✅ SQLite Database & Tables Synced'))
  .catch(err => console.error('❌ SQLite Sync Error:', err));

// 1. GET /reports - Ambil semua laporan
app.get('/reports', async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [['createdAt', 'DESC']] });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST /reports - Tambah laporan baru
app.post('/reports', async (req, res) => {
  const { title, category, location, description, coords, image } = req.body;
  
  if (!title || !category || !coords) {
    return res.status(400).json({ message: 'Title, category, and coords are required' });
  }

  try {
    const newReport = await Report.create({
      title,
      category,
      location: location || '',
      description: description || '',
      coords,
      image,
      status: 'Dilaporkan',
      votes: 0
    });
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. POST /reports/:id/vote - Tambah jumlah vote
app.post('/reports/:id/vote', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (report) {
      report.votes += 1;
      await report.save();
      res.json(report);
    } else {
      res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. POST /reports/:id/status - Update status laporan
app.post('/reports/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Dilaporkan', 'Diverifikasi', 'Diproses', 'Selesai'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }
  try {
    const report = await Report.findByPk(req.params.id);
    if (report) {
      report.status = status;
      await report.save();
      res.json(report);
    } else {
      res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. GET /stats - Statistik
app.get('/stats', async (req, res) => {
  try {
    const totalReports = await Report.count();
    
    // Group by category
    const reports = await Report.findAll();
    const counts = {};
    reports.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    // Find most popular category
    let mostPopularCategory = "";
    let maxCount = 0;
    for (const cat in counts) {
      if (counts[cat] > maxCount) {
        maxCount = counts[cat];
        mostPopularCategory = cat;
      }
    }

    // Status breakdown
    const statusCounts = {};
    reports.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    res.json({
      totalReports,
      mostPopularCategory,
      categoryDistribution: counts,
      statusDistribution: statusCounts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server CivicVoice berjalan di http://localhost:${PORT}`);
});
