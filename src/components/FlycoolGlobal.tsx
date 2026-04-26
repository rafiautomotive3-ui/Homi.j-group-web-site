import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  HardHat, 
  DraftingCompass, 
  Cpu, 
  Zap, 
  Building2, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Plane,
  PhoneCall,
  MessageSquare,
  Globe2,
  Search,
  MapPin,
  Mail,
  Clock,
  Upload,
  FileText,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
  Settings,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { HomiJLogo } from './HomiJLogo';
import { db, storage, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Job {
  id: string;
  title: string;
  country: string;
  description: string;
  createdAt: any;
  status: 'open' | 'closed';
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  mobileNumber: string;
  domain: string;
  yearsOfExperience: string;
  additionalDescription: string;
  resumeUrl: string;
  createdAt: any;
}

const RafiqLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 group ${className}`}>
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M32 32 h6 v36 h-6 z M44 32 h8 c10 0 18 8 18 18 s-8 18-18 18 h-8 v-6 h8 c6 0 12-5 12-12 s-6-12-12-12 h-8 z" fill="currentColor" />
      </svg>
    </div>
    <span className="text-sm font-medium tracking-wide">
      Designed by <span className="text-orange-500 font-bold group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-300">Rafiq</span>
    </span>
  </div>
);

const HomiJGlobalConsultancy = ({ 
  theme, 
  isAdmin, 
  toggleTheme, 
  onOpenAdmin, 
  onLogout,
  onOpenBrochure,
  onOpenCareer
}: { 
  theme: 'dark' | 'light', 
  isAdmin: boolean, 
  toggleTheme: () => void,
  onOpenAdmin: () => void,
  onLogout: () => void,
  onOpenBrochure: () => void,
  onOpenCareer: () => void
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isViewingApplications, setIsViewingApplications] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin && isViewingApplications) {
      const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Application[];
        setApplications(appsData);
      });
      return () => unsubscribe();
    }
  }, [isAdmin, isViewingApplications]);

  const handleDeleteApplication = async (appId: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await deleteDoc(doc(db, 'applications', appId));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };
  
  // Application Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    domain: '',
    yearsOfExperience: '',
    additionalDescription: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    country: '',
    description: ''
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !resumeFile) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Validate File Size (< 10MB)
      if (resumeFile.size > 10 * 1024 * 1024) {
        throw new Error("Resume file size must be less than 10MB.");
      }
      if (resumeFile.type !== 'application/pdf') {
        throw new Error("Resume must be in PDF format.");
      }

      // 2. Upload Resume to Firebase Storage
      const storageRef = ref(storage, `resumes/${Date.now()}_${resumeFile.name}`);
      const uploadResult = await uploadBytes(storageRef, resumeFile);
      const resumeUrl = await getDownloadURL(uploadResult.ref);

      // 3. Save Application to Firestore
      await addDoc(collection(db, 'applications'), {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        candidateName: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        domain: formData.domain,
        yearsOfExperience: formData.yearsOfExperience,
        additionalDescription: formData.additionalDescription,
        resumeUrl,
        createdAt: serverTimestamp()
      });

      setSubmitSuccess(true);
      setSmsSent(true);
      setFormData({ 
        name: '', 
        email: '', 
        mobileNumber: '', 
        domain: '', 
        yearsOfExperience: '', 
        additionalDescription: '' 
      });
      setResumeFile(null);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSmsSent(false);
        setIsApplying(false);
        setSelectedJob(null);
      }, 5000);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setSubmitError(error.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.country || !newJob.description) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        ...newJob,
        status: 'open',
        createdAt: serverTimestamp()
      });
      setNewJob({ title: '', country: '', description: '' });
      setIsAddingJob(false);
    } catch (error) {
      console.error("Error adding job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob || !editingJob.title || !editingJob.country || !editingJob.description) return;

    setIsSubmitting(true);
    try {
      const { id, ...updateData } = editingJob;
      await updateDoc(doc(db, 'jobs', id), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      setEditingJob(null);
      setIsEditingJob(false);
    } catch (error) {
      console.error("Error updating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job opening?")) return;
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const services = [
    {
      title: "Manpower Supply Consultancy",
      description: "Strategic recruitment and placement of highly skilled engineering and technical personnel for global projects.",
      icon: <Users className="w-6 h-6" />,
      details: ["Talent Acquisition", "Technical Screening", "Global Deployment", "Contract Management"]
    },
    {
      title: "Civil Engineering Talent",
      description: "Specialized staffing for civil design and modeling roles, ensuring project precision from the ground up.",
      icon: <DraftingCompass className="w-6 h-6" />,
      details: ["Revit Engineers", "BIM Modellers", "Civil Designers", "Draftsmen"]
    },
    {
      title: "Electrical & Systems Design",
      description: "Expert manpower for electrical infrastructure and systems design across industrial and commercial sectors.",
      icon: <Zap className="w-6 h-6" />,
      details: ["Electrical Designers", "System Integrators", "Automation Engineers", "Technical Draftsmen"]
    },
    {
      title: "Construction Works",
      description: "Comprehensive manpower solutions for all types of construction and infrastructure development projects.",
      icon: <Building2 className="w-6 h-6" />,
      details: ["Site Supervisors", "Quality Control", "Safety Officers", "Skilled Labor"]
    }
  ];

  const GLOBAL_REGIONS = ["Middle East", "Southeast Asia", "Europe", "North America", "Africa", "Central Asia", "Australia", "South America"];
  const GLOBAL_PARTNERS = ["Aramco", "SABIC", "ADNOC", "Petrofac", "Bechtel", "Fluor", "TechnipFMC", "Saipem", "L&T Construction", "Hyundai E&C", "Samsung C&T", "GS Engineering", "Worley", "Wood Group", "KBR", "Jacobs"];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10 py-4 ${theme === 'dark' ? 'bg-[#0a0a0a]/80' : 'bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-electric-blue hover:text-white transition-colors group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">Welcome Page</span>
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <a href="#job-openings" className="text-sm font-bold uppercase tracking-widest hover:text-electric-blue transition-colors">Careers</a>
              <a href="#services" className="text-sm font-bold uppercase tracking-widest hover:text-electric-blue transition-colors">Services</a>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className={`transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <HomiJLogo className="scale-90" theme={theme} showText={true} subText="Global" variant="hg" />
            </div>
          </div>
        </div>
      </nav>

      {/* Scrolling Job Bar */}
      <div className={`fixed top-[73px] left-0 right-0 z-40 py-2 overflow-hidden border-b border-white/5 backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100/80'}`}>
        <div className="flex whitespace-nowrap animate-marquee">
          {jobs.length > 0 ? [...jobs, ...jobs].map((job, i) => (
            <div key={`${job.id}-${i}`} className="flex items-center gap-4 px-8 border-r border-white/10">
              <Badge variant="outline" className="border-electric-blue/30 text-electric-blue text-[10px] py-0">New Opening</Badge>
              <span className="font-bold text-sm">{job.title}</span>
              <span className="text-gray-500 text-xs">in</span>
              <span className="text-electric-blue text-sm">{job.country}</span>
              <span className="text-[10px] text-gray-500">({job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'Just now'})</span>
            </div>
          )) : (
            <div className="px-8 text-gray-500 italic text-sm">No current job openings available. Check back soon!</div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-blue/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
          
          {/* Flight Path Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <motion.path
              d="M-100,200 Q400,100 1100,300"
              stroke="url(#blue-grad)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            <motion.path
              d="M-100,500 Q500,600 1100,400"
              stroke="url(#blue-grad)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
            />
            <defs>
              <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d1ff" stopOpacity="0" />
                <stop offset="50%" stopColor="#00d1ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#00d1ff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 border-electric-blue/30 text-electric-blue px-4 py-1 rounded-full bg-electric-blue/5">
                Homi.J Global Consultancy Talent Solutions
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight">
                Strategic <span className="text-electric-blue">Manpower</span> Supply & Consultancy
              </h1>
              <p className={`text-xl mb-10 leading-relaxed ${theme === 'dark' ? 'text-gray-400 glow-blue' : 'text-gray-600'}`}>
                Homi.J Global Consultancy specializes in providing high-caliber technical personnel for civil, electrical, and construction projects worldwide. We bridge the gap between complex engineering needs and expert talent.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#job-openings">
                  <Button size="lg" className="bg-electric-blue hover:bg-electric-blue/80 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-electric-blue/20">
                    View Job Openings
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 font-bold px-8 py-6 rounded-xl">
                  Our Expertise
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              <div className="glass rounded-3xl p-4 overflow-hidden shadow-2xl border border-white/10 relative">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  className="rounded-2xl w-full h-[400px] object-cover opacity-80"
                >
                  <source src="https://drive.google.com/uc?id=1INLxytlIuNNY99ggAI_7SsXoEX4rxoh4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl border-l-4 border-l-electric-blue shadow-xl">
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-xs uppercase tracking-widest text-gray-400">Skilled Personnel</div>
              </div>
              <div className="absolute -top-6 -right-6 glass p-6 rounded-2xl border-l-4 border-l-green-500 shadow-xl">
                <div className="text-2xl font-bold text-white mb-1">Global</div>
                <div className="text-xs uppercase tracking-widest text-gray-400">Deployment Ready</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bidirectional Scrolling Global Network */}
      <section className={`py-12 border-y overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <p className={`text-center uppercase tracking-[0.3em] text-[10px] font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Our Global Network & Partnerships</p>
        </div>
        
        <div className="space-y-8">
          {/* Row 1: Right to Left */}
          <div className="flex whitespace-nowrap animate-marquee">
            {[...GLOBAL_REGIONS, ...GLOBAL_REGIONS, ...GLOBAL_REGIONS].map((region, i) => (
              <div key={i} className="flex items-center gap-4 px-12">
                <Globe2 className="w-5 h-5 text-electric-blue/50" />
                <span className={`text-2xl md:text-4xl font-display font-bold opacity-40 hover:opacity-100 transition-opacity cursor-default ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {region}
                </span>
              </div>
            ))}
          </div>

          {/* Row 2: Left to Right */}
          <div className="flex whitespace-nowrap animate-marquee-reverse">
            {[...GLOBAL_PARTNERS, ...GLOBAL_PARTNERS, ...GLOBAL_PARTNERS].map((partner, i) => (
              <div key={i} className="flex items-center gap-4 px-12">
                <Briefcase className="w-5 h-5 text-electric-blue/50" />
                <span className={`text-2xl md:text-4xl font-display font-bold opacity-40 hover:opacity-100 transition-opacity cursor-default ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings Section - THE NEW PART */}
      <section id="job-openings" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 border-electric-blue/30 text-electric-blue">Careers</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Current <span className="text-electric-blue">Job Openings</span></h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400 glow-blue' : 'text-gray-600'}`}>
                Join our global team of experts. We are looking for talented individuals to drive engineering excellence.
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search by role or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-electric-blue/50' : 'bg-white border-gray-200 text-gray-900 focus:border-electric-blue'}`}
                />
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 text-right">Admin Controls</span>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsViewingApplications(true)}
                      variant="outline"
                      className="border-electric-blue/30 text-electric-blue hover:bg-electric-blue/10 font-bold rounded-xl"
                    >
                      <FileText className="w-5 h-5 mr-2" /> Applications
                    </Button>
                    <Button 
                      onClick={() => setIsAddingJob(true)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Job
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-electric-blue animate-spin" />
              <p className="text-gray-500">Loading opportunities...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className={`h-full border-white/5 hover:border-electric-blue/30 transition-all duration-300 group ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-lg'}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-electric-blue/10 text-electric-blue">
                            {job.status}
                          </Badge>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingJob(job);
                                  setIsEditingJob(true);
                                }}
                                className="p-2 text-electric-blue hover:bg-electric-blue/10 rounded-lg transition-all"
                                title="Edit Job"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete Job"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-electric-blue transition-colors">{job.title}</CardTitle>
                      <div className="flex flex-col gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-electric-blue" />
                          {job.country}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Posted on:</span> {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 line-clamp-3 mb-6">
                        {job.description}
                      </p>
                      <Button 
                        onClick={() => {
                          setSelectedJob(job);
                          setIsApplying(true);
                        }}
                        className="w-full bg-electric-blue/10 hover:bg-electric-blue text-electric-blue hover:text-white font-bold transition-all"
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {isApplying && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplying(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl p-8 md:p-10 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'}`}
            >
              <button 
                onClick={() => setIsApplying(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <Badge className="bg-electric-blue/10 text-electric-blue mb-4">Applying for</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedJob.title}</h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.country}
                </div>
              </div>

              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Thanks for applying!</h3>
                    <p className="text-gray-400">Your application has been successfully submitted to our talent team.</p>
                    {smsSent && (
                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 flex-shrink-0" />
                        <span>A confirmation message has been sent to your mobile number.</span>
                      </div>
                    )}
                  </div>
                  <Button onClick={() => setIsApplying(false)} className="bg-electric-blue text-white px-8 py-3 rounded-xl">
                    Close
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleApply} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-electric-blue' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-electric-blue'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-electric-blue' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-electric-blue'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Mobile Number</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                        placeholder="+91 00000 00000"
                        className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-electric-blue' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-electric-blue'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Domain / Expertise</label>
                      <input 
                        required
                        type="text" 
                        value={formData.domain}
                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                        placeholder="e.g. Civil Engineering"
                        className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-electric-blue' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-electric-blue'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Years of Experience</label>
                    <input 
                      required
                      type="number" 
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                      placeholder="e.g. 5"
                      className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-electric-blue' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-electric-blue'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Additional Description</label>
                    <textarea 
                      rows={3}
                      value={formData.additionalDescription}
                      onChange={(e) => setFormData({...formData, additionalDescription: e.target.value})}
                      placeholder="Tell us more about your background..."
                      className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-electric-blue' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-electric-blue'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Upload Resume (PDF only, max 10MB)</label>
                    <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${resumeFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-electric-blue/50 hover:bg-white/5'}`}>
                      <input 
                        required
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-3 text-green-500">
                          <FileText className="w-8 h-8" />
                          <div className="text-left">
                            <div className="font-bold text-sm truncate max-w-[200px]">{resumeFile.name}</div>
                            <div className="text-xs opacity-70">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                          <div className="text-sm font-medium">Click or drag PDF to upload</div>
                          <div className="text-xs text-gray-500">Maximum file size: 10MB</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                      <AlertCircle className="w-5 h-5" />
                      {submitError}
                    </div>
                  )}

                  <Button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white font-bold py-6 text-lg rounded-2xl shadow-xl shadow-electric-blue/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : 'Submit Application'}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Applications Viewer Modal (Admin Only) */}
      <AnimatePresence>
        {isViewingApplications && isAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewingApplications(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl p-8 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Job Applications</h2>
                  <p className="text-gray-500">Review candidate profiles and resumes.</p>
                </div>
                <button 
                  onClick={() => setIsViewingApplications(false)}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div 
                      key={app.id}
                      className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-electric-blue/30' : 'bg-gray-50 border-gray-200 hover:border-electric-blue/30'}`}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold">{app.candidateName}</h4>
                            <Badge variant="outline" className="border-electric-blue/30 text-electric-blue">
                              {app.jobTitle || 'Unknown Job'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Globe2 className="w-4 h-4" />
                              {app.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneCall className="w-4 h-4" />
                              {app.mobileNumber}
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              {app.domain}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleString() : 'Just now'}
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <p className="text-sm"><span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mr-2">Experience:</span> {app.yearsOfExperience} Years</p>
                            <p className="text-sm"><span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mr-2">Additional Info:</span> {app.additionalDescription || 'None'}</p>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 justify-end">
                          <a 
                            href={app.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button className="bg-electric-blue hover:bg-electric-blue/80 text-white font-bold rounded-xl">
                              <FileText className="w-4 h-4 mr-2" /> View Resume
                            </Button>
                          </a>
                          <Button 
                            onClick={() => handleDeleteApplication(app.id)}
                            variant="ghost" 
                            className="text-red-500 hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No applications yet</h3>
                  <p className="text-gray-500">When candidates apply, they will appear here.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Job Modal (Admin Only) */}
      <AnimatePresence>
        {isEditingJob && editingJob && isAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingJob(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl p-8 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'}`}
            >
              <h2 className="text-2xl font-bold mb-6">Edit Job Opening</h2>
              <form onSubmit={handleUpdateJob} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Job Title</label>
                  <input 
                    required
                    type="text" 
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                    placeholder="e.g. BIM Modeller"
                    className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Country</label>
                  <input 
                    required
                    type="text" 
                    value={editingJob.country}
                    onChange={(e) => setEditingJob({...editingJob, country: e.target.value})}
                    placeholder="e.g. Oman"
                    className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Job Description</label>
                  <textarea 
                    required
                    rows={5}
                    value={editingJob.description}
                    onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                    placeholder="Enter detailed job description..."
                    className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Status</label>
                  <select 
                    value={editingJob.status}
                    onChange={(e) => setEditingJob({...editingJob, status: e.target.value as 'open' | 'closed'})}
                    className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <Button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-white font-bold py-4 rounded-xl"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Opening'}
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setIsEditingJob(false)}
                    variant="ghost" 
                    className="flex-1 text-gray-500"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Job Modal (Admin Only) */}
      <AnimatePresence>
        {isAddingJob && isAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingJob(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl p-8 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'}`}
            >
              <h2 className="text-2xl font-bold mb-6">Add New Job Opening</h2>
              <form onSubmit={handleAddJob} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Job Title</label>
                  <input 
                    required
                    type="text" 
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g. BIM Modeller"
                    className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Country</label>
                  <input 
                    required
                    type="text" 
                    value={newJob.country}
                    onChange={(e) => setNewJob({...newJob, country: e.target.value})}
                    placeholder="e.g. Oman"
                    className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Job Description</label>
                  <textarea 
                    required
                    rows={5}
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Enter detailed job description..."
                    className={`w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Opening'}
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setIsAddingJob(false)}
                    variant="ghost" 
                    className="flex-1 text-gray-500"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Services Grid */}
      <section id="services" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Specialized <span className="text-electric-blue">Focus</span></h2>
            <p className={`max-w-2xl mx-auto text-lg ${theme === 'dark' ? 'text-gray-400 glow-blue' : 'text-gray-600'}`}>
              From specialized BIM modeling to large-scale construction manpower, we provide the expertise your project demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full border-white/5 hover:border-electric-blue/30 transition-all duration-500 group ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-xl'}`}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue mb-6 group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                    <CardTitle className="text-2xl mb-4 group-hover:text-electric-blue transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {service.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-electric-blue" />
                          <span className="text-sm font-medium text-gray-400">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Highlight */}
      <section className={`py-32 relative overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-5">
          <Globe2 className="absolute -right-20 -top-20 w-[600px] h-[600px] text-electric-blue" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-electric-blue/30 text-electric-blue">Expert Talent Pool</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">Specialized Technical <span className="text-electric-blue">Roles</span></h2>
              <p className={`text-lg mb-10 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                We maintain a vast database of pre-screened professionals ready to join your engineering and design teams worldwide.
              </p>
              
              <div className="space-y-4">
                {[
                  { role: "Revit Engineers", desc: "Expertise in 3D modeling and documentation." },
                  { role: "BIM Modellers", desc: "Specialized in Building Information Modeling." },
                  { role: "Civil Designers", desc: "Precision design for infrastructure projects." },
                  { role: "Electrical Designers", desc: "Complex systems and circuit design." },
                  { role: "Draftsmen", desc: "High-quality technical drawings and plans." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-colors group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-white/50'}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue group-hover:bg-electric-blue group-hover:text-white transition-all">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.role}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" alt="Industrial" className="rounded-2xl h-64 w-full object-cover shadow-xl" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070" alt="Engineering" className="rounded-2xl h-48 w-full object-cover shadow-xl" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-4">
                  <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2070" alt="Construction" className="rounded-2xl h-48 w-full object-cover shadow-xl" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070" alt="Site" className="rounded-2xl h-64 w-full object-cover shadow-xl" referrerPolicy="no-referrer" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent pointer-events-none rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass p-16 rounded-[3rem] text-center border-electric-blue/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full" />
            
            <h2 className="text-3xl md:text-5xl font-bold mb-8 relative z-10">Ready to Scale Your <span className="text-electric-blue">Team</span>?</h2>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto relative z-10">
              Whether you need a single BIM modeler or a full construction crew, Homi.J Global provides the right talent at the right time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button size="lg" className="bg-electric-blue hover:bg-electric-blue/80 text-white font-bold px-12 py-8 text-xl rounded-2xl shadow-xl shadow-electric-blue/20">
                Contact Global Sales
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => {
                  const element = document.getElementById('job-openings');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-white/10 hover:bg-white/5 font-bold px-12 py-8 text-xl rounded-2xl"
              >
                View Talent Pool
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-20 border-t transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <HomiJLogo className="scale-90" theme={theme} showText={true} subText="Global" />
              </div>
              <p className={`max-w-sm leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Global Talent Solutions & Manpower Supply. Connecting expert engineering talent with major infrastructure projects worldwide.
              </p>
            </div>
            
            <div>
              <h4 className={`font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Resources</h4>
              <ul className={`space-y-4 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                <li>
                  <button 
                    onClick={onOpenBrochure}
                    className={`hover:text-electric-blue transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
                  >
                    Brochures
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onOpenCareer}
                    className={`hover:text-electric-blue transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
                  >
                    Careers
                  </button>
                </li>
                <li>
                  {isAdmin ? (
                    <button 
                      onClick={onLogout}
                      className="text-sm text-red-500 hover:text-red-400 transition-colors font-bold"
                    >
                      Admin Logout
                    </button>
                  ) : (
                    <button 
                      onClick={onOpenAdmin}
                      className={`hover:text-electric-blue transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
                    >
                      Admin Login
                    </button>
                  )}
                </li>
              </ul>
            </div>
          </div>
          
          <div className={`flex flex-col md:flex-row justify-between items-center pt-12 border-t gap-6 transition-colors duration-500 ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className={`text-sm transition-colors duration-500 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
                © {new Date().getFullYear()} Homi.J Global Consultancy. All rights reserved.
              </p>
              <div className="flex items-center gap-2 group">
                <HomiJLogo className="w-6 h-6" theme={theme} />
                <span className="text-sm font-medium tracking-wide">
                  Designed by <span className="text-orange-500 font-bold group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-300">Rafiq</span>
                </span>
              </div>
            </div>
            <div className="flex gap-6">
              <Globe2 className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`} />
              <PhoneCall className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`} />
              <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomiJGlobalConsultancy;
