import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const Report = sequelize.define('Report', {
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  votes: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
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

const initialData = [
  {
    title: "Sampah Menumpuk di Jl. Sudirman",
    category: "Lingkungan",
    location: "Jakarta Pusat",
    votes: 85,
    status: "Proses",
    coords: [-6.202394, 106.824005],
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Lampu Jalan Mati Total Area Menteng",
    category: "Infrastruktur",
    location: "Kec. Menteng",
    votes: 120,
    status: "Diterima",
    coords: [-6.195000, 106.832000],
    image: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Lubang Jalan Berbahaya",
    category: "Infrastruktur",
    location: "Jl. Diponegoro",
    votes: 210,
    status: "Selesai",
    coords: [-6.198000, 106.840000],
    image: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=400"
  },
  {
    title: "Kurangnya Fasilitas Kesehatan",
    category: "Kesehatan",
    location: "Kel. Kebon Jeruk",
    votes: 45,
    status: "Pending",
    coords: [-6.190000, 106.760000],
    image: "https://images.unsplash.com/photo-1585644131572-91890886c52a?auto=format&fit=crop&q=80&w=400"
  }
];

const seedDB = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Connected to SQLite for seeding...');
    
    await Report.bulkCreate(initialData);
    console.log('Successfully seeded SQLite database with initial reports.');
    
    await sequelize.close();
    console.log('SQLite connection closed.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

seedDB();
