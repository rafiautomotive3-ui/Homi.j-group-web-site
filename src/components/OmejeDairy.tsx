import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Milk, 
  Beef, 
  Footprints, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Thermometer, 
  Scale, 
  ShieldCheck, 
  Barcode, 
  Calendar as CalendarIcon, 
  DollarSign,
  ChevronRight,
  ArrowLeft,
  Camera,
  Heart,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Utensils,
  Settings,
  Lock,
  Printer,
  Scan,
  Maximize2,
  RotateCcw,
  History,
  Info,
  Home,
  Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy, 
  Timestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { HomiJLogo } from './HomiJLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subMonths, isAfter } from 'date-fns';
import { Link } from 'react-router-dom';

interface Animal {
  id: string;
  name: string;
  type: 'cow' | 'buffalo' | 'sheep';
  breed: string;
  purchasePrice: number;
  purchaseDate: any;
  sellingPrice?: number;
  sellingDate?: any;
  insuranceNumber?: string;
  barcode?: string;
  imageUrl?: string;
  status: 'active' | 'sold' | 'deceased';
  createdAt: any;
}

interface HealthRecord {
  id: string;
  type: 'vaccination' | 'deworming' | 'checkup' | 'treatment';
  description: string;
  date: any;
  temperature?: number;
  weight?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

interface MilkRecord {
  id: string;
  date: any;
  quantity: number;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the whole app, but we log it
};

export const OmejeDairy = ({ theme, isAdmin }: { theme: 'dark' | 'light', isAdmin: boolean }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'cow' | 'buffalo' | 'sheep'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showMilkModal, setShowMilkModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [loading, setLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
  const [permissionError, setPermissionError] = useState(false);

  // Fetch Animals
  useEffect(() => {
    const q = query(collection(db, 'livestock'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const animalData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
      setAnimals(animalData);
      setLoading(false);
      setPermissionError(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'livestock');
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Records for Selected Animal
  useEffect(() => {
    if (!selectedAnimal || !isAdmin) return;

    const healthPath = `livestock/${selectedAnimal.id}/health`;
    const milkPath = `livestock/${selectedAnimal.id}/milk`;

    const healthQ = query(
      collection(db, healthPath), 
      orderBy('date', 'desc')
    );
    const milkQ = query(
      collection(db, milkPath), 
      orderBy('date', 'asc')
    );

    const unsubHealth = onSnapshot(healthQ, (snapshot) => {
      setHealthRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthRecord)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, healthPath);
    });

    const unsubMilk = onSnapshot(milkQ, (snapshot) => {
      setMilkRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MilkRecord)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, milkPath);
    });

    return () => {
      unsubHealth();
      unsubMilk();
    };
  }, [selectedAnimal, isAdmin]);

  const filteredAnimals = animals.filter(a => activeTab === 'all' || a.type === activeTab);

  const stats = {
    total: animals.length,
    cows: animals.filter(a => a.type === 'cow').length,
    buffaloes: animals.filter(a => a.type === 'buffalo').length,
    sheep: animals.filter(a => a.type === 'sheep').length,
    active: animals.filter(a => a.status === 'active').length,
  };

  const calculateGrowth = (days: number) => {
    if (healthRecords.length < 2) return 0;
    const sorted = [...healthRecords].filter(r => r.weight).sort((a, b) => b.date.toDate() - a.date.toDate());
    if (sorted.length < 2) return 0;
    
    const latest = sorted[0];
    const threshold = subMonths(new Date(), days / 30);
    const past = sorted.find(r => r.date.toDate() <= threshold) || sorted[sorted.length - 1];
    
    if (!latest.weight || !past.weight) return 0;
    return (latest.weight - past.weight).toFixed(1);
  };

  const handleBarcodeScanned = async (decodedText: string) => {
    setShowScanner(false);
    const animal = animals.find(a => a.barcode === decodedText || a.name === decodedText);
    if (animal) {
      setSelectedAnimal(animal);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#22c55e', '#ffffff']
      });
    } else {
      alert(`No animal found with barcode: ${decodedText}`);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const renderDashboard = () => {
    if (!isAdmin || permissionError) {
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Access Restricted</h2>
          <p className="max-w-md text-gray-500 mb-8">
            You must be logged in as an administrator to access the Omeje Dairy Management system.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="rounded-full px-8 h-12 bg-white text-black hover:bg-gray-200"
          >
            Return to Home
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Livestock Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              type: 'cow', 
              name: 'Jersey Cattle', 
              img: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
              desc: 'High-yield milk production management'
            },
            { 
              type: 'buffalo', 
              name: 'Water Buffalo', 
              img: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=800&q=80',
              desc: 'Premium quality dairy and health tracking'
            },
            { 
              type: 'sheep', 
              name: 'Livestock Sheep', 
              img: 'https://images.unsplash.com/photo-1484557918186-7b4e571d4b12?auto=format&fit=crop&w=800&q=80',
              desc: 'Growth monitoring and vaccination records'
            }
          ].map((item, i) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => setActiveTab(item.type as any)}
              className="group relative h-64 rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/10"
            >
              <img 
                src={item.img} 
                alt={item.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.desc}
                </p>
                <div className={`mt-4 w-10 h-1 rounded-full bg-orange-500 transition-all duration-300 ${activeTab === item.type ? 'w-20' : 'group-hover:w-16'}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Livestock', value: stats.total, icon: Activity, color: 'text-blue-500' },
          { label: 'Cows', value: stats.cows, icon: Milk, color: 'text-orange-500' },
          { label: 'Buffaloes', value: stats.buffaloes, icon: Milk, color: 'text-emerald-500' },
          { label: 'Sheep', value: stats.sheep, icon: Footprints, color: 'text-purple-500' },
          { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-6 rounded-3xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 shadow-sm'}`}
          >
            <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Animal List */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowScanner(true)} 
                variant="outline" 
                className="rounded-full border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
              >
                <Scan className="w-4 h-4 mr-2" /> Scan Barcode
              </Button>
              {isAdmin && (
                <Button onClick={() => setShowAddModal(true)} className="rounded-full bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Animal
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAnimals.map((animal) => (
                <motion.div
                  key={animal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedAnimal(animal)}
                  className={`group relative p-4 rounded-3xl border cursor-pointer transition-all duration-300 ${
                    selectedAnimal?.id === animal.id 
                      ? 'border-green-500 bg-green-500/5' 
                      : theme === 'dark' ? 'border-white/10 hover:border-white/30 bg-white/5' : 'border-gray-200 hover:border-gray-400 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0">
                      {animal.imageUrl ? (
                        <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          {animal.type === 'sheep' ? <Footprints /> : <Milk />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg">{animal.name}</h3>
                        <Badge variant="outline" className={`capitalize ${animal.type === 'cow' ? 'border-orange-500 text-orange-500' : ''}`}>{animal.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{animal.breed}</p>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                        <span className="flex items-center gap-1"><Barcode className="w-3 h-3" /> {animal.barcode || 'N/A'}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {animal.purchasePrice}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="w-full md:w-96">
          <AnimatePresence mode="wait">
            {selectedAnimal ? (
              <motion.div
                key={selectedAnimal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass p-8 rounded-[2.5rem] border sticky top-24 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 shadow-xl'}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Animal Profile</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedAnimal(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-8">
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gray-800">
                    {selectedAnimal.imageUrl ? (
                      <img src={selectedAnimal.imageUrl} alt={selectedAnimal.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Camera className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className={selectedAnimal.status === 'active' ? 'bg-orange-500' : 'bg-gray-500'}>
                        {selectedAnimal.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Breed</div>
                      <div className="font-bold">{selectedAnimal.breed}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Insurance</div>
                      <div className="font-bold text-xs truncate">{selectedAnimal.insuranceNumber || 'Not Covered'}</div>
                    </div>
                  </div>

                  {/* QR Code Display & Print */}
                  <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/10 flex flex-col items-center text-center no-print">
                    <div className="bg-white p-4 rounded-2xl mb-4 shadow-xl">
                      <QRCodeSVG 
                        value={selectedAnimal.barcode || selectedAnimal.id} 
                        size={120}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="font-mono font-bold text-orange-500 mb-2">{selectedAnimal.barcode}</div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full h-10 px-6 font-bold uppercase border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                      onClick={handlePrint}
                    >
                      <Printer className="w-4 h-4 mr-2" /> Print QR Code
                    </Button>
                  </div>

                  {/* Hidden Print Section */}
                  <div className="hidden print-section">
                    <div className="bg-white p-8 rounded-3xl border-4 border-black flex flex-col items-center">
                      <h1 className="text-4xl font-bold mb-4">HOMI.J DAIRY</h1>
                      <QRCodeSVG 
                        value={selectedAnimal.barcode || selectedAnimal.id} 
                        size={300}
                        level="H"
                        includeMargin={true}
                      />
                      <div className="mt-6 text-center">
                        <div className="text-5xl font-black uppercase tracking-tighter">{selectedAnimal.name}</div>
                        <div className="text-2xl font-bold text-gray-600 mt-2">{selectedAnimal.breed} • {selectedAnimal.type}</div>
                        <div className="text-3xl font-mono mt-4 bg-black text-white px-6 py-2 rounded-full">{selectedAnimal.barcode}</div>
                      </div>
                    </div>
                  </div>

                  {/* Animal History Graphs */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-2"><History className="w-4 h-4 text-blue-500" /> Performance History</h4>
                      <Badge variant="outline" className="text-[10px] font-bold">ANALYTICS</Badge>
                    </div>

                    {/* Weight History */}
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                      <div className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                        <Scale className="w-3 h-3" /> Weight Trend (kg)
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={healthRecords.filter(r => r.weight).reverse()}>
                            <defs>
                              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(val) => format(val.toDate(), 'MMM dd')}
                              tick={{ fontSize: 10, fill: '#666' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 10, fill: '#666' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                              labelFormatter={(val) => format(val.toDate(), 'MMM dd, yyyy')}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Milk History */}
                    {(selectedAnimal.type === 'cow' || selectedAnimal.type === 'buffalo') && (
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                        <div className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                          <Milk className="w-3 h-3" /> Milk Production (L)
                        </div>
                        <div className="h-40 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={milkRecords}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(val) => format(val.toDate(), 'MMM dd')}
                                tick={{ fontSize: 10, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fontSize: 10, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                labelFormatter={(val) => format(val.toDate(), 'MMM dd, yyyy')}
                              />
                              <Line type="monotone" dataKey="quantity" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Milk Production Calendar Tracking */}
                  {(selectedAnimal.type === 'cow' || selectedAnimal.type === 'buffalo') && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold flex items-center gap-2"><Milk className="w-4 h-4 text-orange-500" /> Daily Production</h4>
                        <Badge variant="outline" className="text-[10px] font-bold">CALENDAR VIEW</Badge>
                      </div>

                      <div className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <Calendar 
                          onChange={(val) => setSelectedDate(val as Date)} 
                          value={selectedDate}
                          className="w-full border-none bg-transparent font-sans"
                          tileClassName={({ date }) => {
                            const record = milkRecords.find(r => format(r.date.toDate(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                            if (record) return 'bg-orange-500/20 text-orange-500 font-bold rounded-lg';
                            return '';
                          }}
                        />
                      </div>

                      <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm font-bold">{format(selectedDate, 'MMMM dd, yyyy')}</div>
                          {milkRecords.find(r => format(r.date.toDate(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) ? (
                            <Badge className="bg-green-500">Produced</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-500 border-red-500/50">No Production</Badge>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 rounded-2xl h-12 bg-orange-600 hover:bg-orange-700 font-bold"
                            onClick={() => setShowMilkModal(true)}
                          >
                            {milkRecords.find(r => format(r.date.toDate(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) ? 'Update Liters' : 'Log Liters'}
                          </Button>
                        </div>
                      </div>

                      {/* Production Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Days Produced</div>
                          <div className="text-xl font-bold text-green-500">{milkRecords.length} Days</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Avg Daily</div>
                          <div className="text-xl font-bold text-orange-500">
                            {milkRecords.length > 0 
                              ? (milkRecords.reduce((acc, curr) => acc + curr.quantity, 0) / milkRecords.length).toFixed(1) 
                              : 0} L
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Health Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2"><Stethoscope className="w-4 h-4 text-emerald-500" /> Health Events</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {healthRecords.map((record) => (
                        <div key={record.id} className="flex gap-3 items-start">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            record.type === 'vaccination' ? 'bg-blue-500' : 
                            record.type === 'deworming' ? 'bg-purple-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-bold capitalize">{record.type}</div>
                              {record.condition && (
                                <Badge variant="outline" className={`text-[8px] h-4 px-1 capitalize ${
                                  record.condition === 'excellent' ? 'border-green-500 text-green-500' :
                                  record.condition === 'good' ? 'border-blue-500 text-blue-500' :
                                  record.condition === 'fair' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'
                                }`}>
                                  {record.condition}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500">{format(record.date.toDate(), 'MMM dd, yyyy')}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{record.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Purchase Price</span>
                      <span className="font-bold">${selectedAnimal.purchasePrice}</span>
                    </div>
                    {selectedAnimal.sellingPrice && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-500">Selling Price</span>
                        <span className="font-bold text-green-500">${selectedAnimal.sellingPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                  <Activity className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl mb-2">Select an Animal</h3>
                <p className="text-sm">Choose an animal from the list to view detailed health, production, and financial records.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div 
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}
      style={{ cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23f97316" stroke="white" stroke-width="1.5"><path d="M4 2L11 22L14 15L21 18L23 16L16 9L22 6L4 2Z"/></svg>'), auto` }}
    >
      {/* Welcome Page Button */}
      <div className="fixed bottom-8 left-8 z-50">
        <Link to="/">
          <Button className="rounded-full px-6 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Welcome Page
          </Button>
        </Link>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${theme === 'dark' ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HomiJLogo theme={theme} title="homi.j" subText="Cattle" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-400">System Online</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          renderDashboard()
        )}
      </main>

      {/* Add Animal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-2xl bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-2xl text-gray-900`}
            >
              <h2 className="text-2xl font-bold mb-6">Add New Livestock</h2>
              <AddAnimalForm 
                onClose={() => setShowAddModal(false)} 
                theme="light" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Health Record Modal */}
      <AnimatePresence>
        {showHealthModal && selectedAnimal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHealthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md glass p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            >
              <h2 className="text-2xl font-bold mb-6">Log Health Event</h2>
              <AddHealthForm 
                animalId={selectedAnimal.id}
                onClose={() => setShowHealthModal(false)} 
                theme={theme} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Milk Record Modal */}
      <AnimatePresence>
        {showMilkModal && selectedAnimal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMilkModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md glass p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            >
              <h2 className="text-2xl font-bold mb-6">Log Milk Production</h2>
              <AddMilkForm 
                animalId={selectedAnimal.id}
                onClose={() => setShowMilkModal(false)} 
                theme={theme} 
                initialDate={selectedDate}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg glass p-8 rounded-[2.5rem] border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Scan className="text-orange-500" /> Barcode Scanner
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowScanner(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex gap-3">
                  <Info className="text-orange-500 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold text-orange-500">Scanning Instructions:</p>
                    <ul className="list-disc list-inside text-gray-400 mt-1 space-y-1">
                      <li>Grant camera access when prompted</li>
                      <li>Align the animal's barcode within the frame</li>
                      <li>Ensure good lighting for faster detection</li>
                      <li>Switch between front/rear cameras if needed</li>
                    </ul>
                  </div>
                </div>

                <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/10">
                  <BarcodeScanner onScan={handleBarcodeScanned} />
                </div>

                <p className="text-center text-xs text-gray-500">
                  The camera will automatically start scanning. Please hold steady.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BarcodeScanner = ({ onScan }: { onScan: (text: string) => void }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>('');

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Prefer back camera
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
        setActiveCameraId(backCamera ? backCamera.id : devices[0].id);
      }
    }).catch(err => console.error("Error getting cameras", err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, []);

  useEffect(() => {
    if (!activeCameraId) return;

    if (scannerRef.current) {
      scannerRef.current.stop().then(() => startScanner()).catch(() => startScanner());
    } else {
      startScanner();
    }
  }, [activeCameraId]);

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    html5QrCode.start(
      activeCameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 150 }
      },
      (decodedText) => {
        onScan(decodedText);
      },
      () => {}
    ).catch(err => console.error("Error starting scanner", err));
  };

  return (
    <div className="w-full h-full relative">
      <div id="reader" className="w-full h-full"></div>
      {cameras.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {cameras.map((camera, i) => (
            <Button 
              key={camera.id}
              size="sm"
              variant={activeCameraId === camera.id ? 'default' : 'secondary'}
              onClick={() => setActiveCameraId(camera.id)}
              className="rounded-full text-[10px] h-8"
            >
              {camera.label.includes('back') || camera.label.includes('rear') ? 'Rear' : camera.label.includes('front') ? 'Front' : `Cam ${i+1}`}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddHealthForm = ({ animalId, onClose, theme }: { animalId: string, onClose: () => void, theme: 'dark' | 'light' }) => {
  const [formData, setFormData] = useState({
    type: 'checkup',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    temperature: '',
    weight: '',
    condition: 'good'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Database access requires Google Login. Please login with Google in the Admin panel.");
      return;
    }
    try {
      addDoc(collection(db, `livestock/${animalId}/health`), {
        ...formData,
        animalId,
        temperature: formData.temperature ? Number(formData.temperature) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        date: Timestamp.fromDate(new Date(formData.date)),
        createdAt: Timestamp.now()
      }).catch(err => console.error("Background sync error:", err));
      onClose();
    } catch (error) {
      console.error("Error adding health record:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Event Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
          >
            <option value="vaccination">Vaccination</option>
            <option value="deworming">Deworming</option>
            <option value="checkup">General Checkup</option>
            <option value="treatment">Treatment</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Condition</label>
          <select
            value={formData.condition}
            onChange={e => setFormData({...formData, condition: e.target.value as any})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-green-500 transition-colors h-24 resize-none ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
          placeholder="Details of the event..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Temp (°C)</label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={e => setFormData({...formData, temperature: e.target.value})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            placeholder="38.5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={e => setFormData({...formData, weight: e.target.value})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            placeholder="450"
          />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-14">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-2xl h-14 bg-green-600 hover:bg-green-700">Save Record</Button>
      </div>
    </form>
  );
};

const AddMilkForm = ({ animalId, onClose, theme, initialDate }: { animalId: string, onClose: () => void, theme: 'dark' | 'light', initialDate?: Date }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    date: format(initialDate || new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Database access requires Google Login. Please login with Google in the Admin panel.");
      return;
    }
    try {
      // Check if record exists for this date
      const q = query(
        collection(db, `livestock/${animalId}/milk`),
        where('date', '==', Timestamp.fromDate(new Date(formData.date)))
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Update existing
        updateDoc(doc(db, `livestock/${animalId}/milk`, snapshot.docs[0].id), {
          quantity: Number(formData.quantity),
          updatedAt: Timestamp.now()
        }).catch(err => console.error("Background sync error:", err));
      } else {
        // Add new
        addDoc(collection(db, `livestock/${animalId}/milk`), {
          animalId,
          quantity: Number(formData.quantity),
          date: Timestamp.fromDate(new Date(formData.date)),
          createdAt: Timestamp.now()
        }).catch(err => console.error("Background sync error:", err));
      }
      onClose();
    } catch (error) {
      console.error("Error adding milk record:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Quantity (Liters)</label>
        <input
          required
          type="number"
          step="0.1"
          value={formData.quantity}
          onChange={e => setFormData({...formData, quantity: e.target.value})}
          className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
          placeholder="12.5"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Date</label>
        <input
          required
          type="date"
          value={formData.date}
          onChange={e => setFormData({...formData, date: e.target.value})}
          className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
        />
      </div>
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-14">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-2xl h-14 bg-orange-600 hover:bg-orange-700">Save Record</Button>
      </div>
    </form>
  );
};

const AddAnimalForm = ({ onClose, theme }: { onClose: () => void, theme: 'dark' | 'light' }) => {
  const [hasInsurance, setHasInsurance] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cow',
    breed: '',
    purchasePrice: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    insuranceNumber: '',
    barcode: `BC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (hasInsurance && !formData.insuranceNumber) {
      setError("Insurance number is mandatory when insurance is enabled.");
      return;
    }
    if (!auth.currentUser) {
      setError("Database access requires Google Login. Please login with Google in the Admin panel.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const price = parseFloat(formData.purchasePrice.toString().replace(/,/g, ''));
      if (isNaN(price)) {
        throw new Error("Invalid purchase price");
      }

      // Optimistic UI: Don't await the network request, let Firestore handle local cache immediately
      addDoc(collection(db, 'livestock'), {
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        purchasePrice: price,
        purchaseDate: Timestamp.fromDate(new Date(formData.purchaseDate)),
        insuranceNumber: formData.insuranceNumber || '',
        barcode: formData.barcode,
        imageUrl: formData.imageUrl || '',
        status: 'active',
        createdAt: Timestamp.now()
      }).catch(err => {
        console.error("Background sync error:", err);
        // We could show a toast here in a real app
      });
      
      onClose();
    } catch (err: any) {
      console.error("Error preparing animal data:", err);
      setError(err.message || "Failed to prepare animal data.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name / ID Code <span className="text-red-500">*</span></label>
          <input
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            placeholder="e.g. COW-001"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Type <span className="text-red-500">*</span></label>
          <select
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
          >
            <option value="cow">Cow</option>
            <option value="buffalo">Buffalo</option>
            <option value="sheep">Sheep</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Breed <span className="text-red-500">*</span></label>
          <input
            required
            value={formData.breed}
            onChange={e => setFormData({...formData, breed: e.target.value})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            placeholder="e.g. Holstein"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Purchase Price <span className="text-red-500">*</span></label>
          <input
            required
            type="number"
            value={formData.purchasePrice}
            onChange={e => setFormData({...formData, purchasePrice: e.target.value})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Purchase Date <span className="text-red-500">*</span></label>
          <input
            required
            type="date"
            value={formData.purchaseDate}
            onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Generated Barcode</label>
          <div className={`w-full p-4 rounded-2xl border bg-orange-500/5 border-orange-500/20 text-orange-500 font-mono font-bold flex items-center justify-between`}>
            {formData.barcode}
            <Barcode className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Has Insurance? <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant={hasInsurance ? 'default' : 'outline'} 
              onClick={() => setHasInsurance(true)}
              className="flex-1 rounded-xl"
            >Yes</Button>
            <Button 
              type="button" 
              variant={!hasInsurance ? 'default' : 'outline'} 
              onClick={() => {
                setHasInsurance(false);
                setFormData({...formData, insuranceNumber: ''});
              }}
              className="flex-1 rounded-xl"
            >No</Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-widest text-gray-500 ${hasInsurance ? '' : 'opacity-30'}`}>
            Insurance Number {hasInsurance && <span className="text-red-500">*</span>}
          </label>
          <input
            disabled={!hasInsurance}
            required={hasInsurance}
            value={formData.insuranceNumber}
            onChange={e => setFormData({...formData, insuranceNumber: e.target.value})}
            className={`w-full p-4 rounded-2xl border bg-transparent outline-none focus:border-orange-500 transition-colors ${
              !hasInsurance ? 'opacity-30 cursor-not-allowed' : ''
            } ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
            placeholder={hasInsurance ? "Enter code..." : "Disabled"}
          />
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-2xl h-14">Cancel</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 rounded-2xl h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </div>
          ) : (
            'Save Animal'
          )}
        </Button>
      </div>
    </form>
  );
};

const X = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    onClick={onClick}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
