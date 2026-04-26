import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText, CheckCircle2, Zap, Cpu, Layout, Activity, Settings, Lightbulb, ShieldCheck, ArrowUpRight, Mail, Phone, Loader2, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { HOMI_J_CONTENT } from '../constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  isAdmin: boolean;
}

const IconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-8 h-8" />,
  Zap: <Zap className="w-8 h-8" />,
  Layout: <Layout className="w-8 h-8" />,
  Activity: <Activity className="w-8 h-8" />,
  Settings: <Settings className="w-8 h-8" />,
  Lightbulb: <Lightbulb className="w-8 h-8" />,
  ShieldCheck: <ShieldCheck className="w-8 h-8" />,
};

export const BrochureModal = ({ isOpen, onClose, theme, isAdmin }: BrochureModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedBrochure, setUploadedBrochure] = useState<string | null>(null);
  const brochureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('homi_j_uploaded_brochure');
    if (saved) setUploadedBrochure(saved);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      alert('File is too large. Please upload a PDF smaller than 4.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedBrochure(base64);
      localStorage.setItem('homi_j_uploaded_brochure', base64);
      alert('Brochure uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete the uploaded brochure?')) {
      setUploadedBrochure(null);
      localStorage.removeItem('homi_j_uploaded_brochure');
    }
  };

  const handleDownloadUploaded = () => {
    if (!uploadedBrochure) return;
    const link = document.createElement('a');
    link.href = uploadedBrochure;
    link.download = 'HomiJProjects_Corporate_Brochure_Updated.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async () => {
    if (!brochureRef.current) return;
    
    setIsGenerating(true);
    try {
      // Create a clone of the brochure to render it fully without scroll constraints
      const element = brochureRef.current;
      
      // Ensure all images are loaded before capturing
      const images = element.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      
      await Promise.all(imagePromises);

      const canvas = await html2canvas(element, {
        scale: 1.5, // Reduced scale for better performance and smaller file size
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        scrollY: -window.scrollY, // Fix for scrolled elements
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible for rendering
          const clonedElement = clonedDoc.getElementById('brochure-content');
          if (clonedElement) {
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG for smaller size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      
      // Use Blob and URL.createObjectURL for more reliable downloads in some browsers/iframes
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'HomiJProjects_Corporate_Brochure.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF Generation failed:', error);
      // Fallback to print if jspdf fails
      alert('Automatic PDF generation failed. Opening print dialog instead...');
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .brochure-print-area, .brochure-print-area * {
                visibility: visible;
              }
              .brochure-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
              @page {
                size: A4;
                margin: 0;
              }
              .brochure-content-wrapper {
                overflow: visible !important;
                height: auto !important;
              }
              .glass {
                background: rgba(0,0,0,0.05) !important;
                border: 1px solid rgba(0,0,0,0.1) !important;
                backdrop-filter: none !important;
              }
              .gradient-text {
                background: none !important;
                -webkit-text-fill-color: #f97316 !important;
                color: #f97316 !important;
              }
              .bg-electric-blue {
                background-color: #f97316 !important;
              }
              .text-electric-blue {
                color: #f97316 !important;
              }
            }
          `}} />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-5xl h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border transition-colors duration-500 brochure-print-area ${
              theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header - Hidden in Print */}
            <div className={`p-6 border-b flex justify-between items-center transition-colors duration-500 no-print ${
              theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Corporate Brochure 2024
                  </h2>
                  <p className={`text-xs transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Homi.JProjects • Electrical & Automation Excellence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleUpload} 
                  className="hidden" 
                  accept=".pdf"
                />
                
                {uploadedBrochure ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleDownloadUploaded}
                      variant="outline" 
                      className="flex border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Updated
                    </Button>
                    {isAdmin && (
                      <>
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline" 
                          className="flex border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Update Version
                        </Button>
                        <Button 
                          onClick={handleDelete}
                          variant="outline" 
                          className="flex border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl p-2"
                          title="Delete Uploaded Brochure"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  isAdmin && (
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline" 
                      className="flex border-electric-blue/30 text-electric-blue hover:bg-electric-blue hover:text-white rounded-xl"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Version
                    </Button>
                  )
                )}

                {!uploadedBrochure && (
                  <Button 
                    onClick={handleDownload}
                    disabled={isGenerating}
                    variant="outline" 
                    className="flex border-electric-blue/30 text-electric-blue hover:bg-electric-blue hover:text-white rounded-xl"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate PDF'}
                  </Button>
                )}
                <button 
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 brochure-content-wrapper">
              {uploadedBrochure ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900/50 min-h-[70vh]">
                  <iframe 
                    src={uploadedBrochure} 
                    className="w-full h-full min-h-[75vh] border-none"
                    title="Uploaded Brochure Preview"
                  />
                  <div className="p-8 text-center no-print">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Custom Brochure Active
                    </h3>
                    <p className={`text-sm mb-6 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      You are viewing the custom brochure version. You can download it directly or delete it to revert to the standard version.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        onClick={handleDownloadUploaded}
                        className="bg-orange-500 hover:bg-orange-500/80 text-white px-8 py-6 rounded-xl font-bold"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        onClick={handleDelete}
                        variant="outline"
                        className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white px-8 py-6 rounded-xl font-bold"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete & Revert
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="brochure-content" ref={brochureRef} className="p-8 md:p-16 space-y-24 bg-inherit">
                  {/* Cover Page Style Section */}
                  <div className="text-center space-y-10 py-10">
                    <Badge variant="outline" className="border-orange-500/30 text-orange-500 px-6 py-2 rounded-full text-sm uppercase tracking-widest">
                      Official Engineering Portfolio
                    </Badge>
                    <h1 className={`text-6xl md:text-8xl font-bold leading-tight transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Empowering Projects with <span className="gradient-text">Excellence</span>
                    </h1>
                    <p className={`text-2xl max-w-3xl mx-auto leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {HOMI_J_CONTENT.hero.subtitle}
                    </p>
                    <div className="w-full h-[500px] rounded-[3rem] overflow-hidden border border-white/10 relative shadow-2xl">
                      <img 
                        src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070" 
                        alt="Engineering Excellence"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </div>


                {/* About Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Badge className="bg-orange-500 text-white">Our Identity</Badge>
                      <h3 className={`text-4xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Who We Are
                      </h3>
                    </div>
                    <p className={`text-lg leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {HOMI_J_CONTENT.about.description}
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {HOMI_J_CONTENT.about.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl glass border border-white/5">
                          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-orange-500" />
                          </div>
                          <span className={`font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {HOMI_J_CONTENT.stats.map((stat, i) => (
                      <div key={i} className={`p-8 rounded-[2rem] border transition-colors duration-500 flex flex-col items-center justify-center text-center ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="text-4xl font-bold text-orange-500 mb-2">{stat.value}</div>
                        <div className={`text-sm font-bold uppercase tracking-tighter transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</div>
                      </div>
                    ))}
                    <div className="col-span-2 p-8 rounded-[2rem] bg-orange-500 text-white text-center">
                      <div className="text-2xl font-bold mb-1">Global Reach</div>
                      <div className="text-sm opacity-80">Serving India & Middle East</div>
                    </div>
                  </div>
                </div>

                {/* Services Section */}
                <div className="space-y-16">
                  <div className="text-center space-y-4">
                    <Badge variant="outline" className="border-orange-500/30 text-orange-500">Core Competencies</Badge>
                    <h3 className={`text-4xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Our Expertise</h3>
                    <p className={`max-w-2xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Delivering high-precision engineering solutions across multiple industrial sectors.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {HOMI_J_CONTENT.services.map((service, i) => (
                      <div key={i} className={`p-10 rounded-[2.5rem] border transition-colors duration-500 flex flex-col h-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="text-orange-500 mb-8 p-4 bg-orange-500/10 w-fit rounded-2xl">
                          {IconMap[service.icon as keyof typeof IconMap]}
                        </div>
                        <h4 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{service.title}</h4>
                        <p className={`text-base leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{service.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clean Room Highlight */}
                <div className={`p-16 rounded-[4rem] relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-500/5'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Badge className="bg-orange-500 text-white">Specialized Division</Badge>
                        <h3 className={`text-4xl font-bold leading-tight transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Clean Room & Controlled Environments</h3>
                      </div>
                      <p className={`text-lg leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        We are industry leaders in providing turnkey electrical and automation solutions for high-precision medical, pharmaceutical, and electronic facilities.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['ISO Standards Compliance', 'Sterile Environment Control', 'Medical Grade Automation', 'ESD-Safe Infrastructure'].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span className={`text-sm font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10">
                      <img 
                        src="https://lh3.googleusercontent.com/d/1U_DlC5qjp0taJZQ8LP6XBDSCi5GXPkmJ" 
                        alt="Clean Room"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* Projects List */}
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4">
                      <Badge variant="outline" className="border-orange-500/30 text-orange-500">Track Record</Badge>
                      <h3 className={`text-4xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Major Projects</h3>
                    </div>
                    <p className={`max-w-xs text-sm transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      A selection of our high-impact industrial and automation projects worldwide.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HOMI_J_CONTENT.majorProjects.map((p, i) => (
                      <div key={i} className={`p-6 rounded-3xl border flex flex-col justify-between gap-6 transition-colors duration-500 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="space-y-2">
                          <div className={`text-xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.name}</div>
                          <div className={`text-sm transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{p.location}</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="px-3 py-1 border-orange-500/20 text-orange-500 text-[10px] uppercase font-bold tracking-widest">{p.type}</Badge>
                          <ArrowUpRight className="w-5 h-5 text-orange-500 opacity-50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Section */}
                <div className="text-center space-y-12 pt-10 pb-20">
                  <div className="space-y-4">
                    <h3 className={`text-4xl font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Partner with Excellence</h3>
                    <p className={`max-w-xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Integrating cutting-edge electrical and automation technologies to empower industrial growth since 2019.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8 justify-center">
                    <div className={`p-10 rounded-[2.5rem] border flex flex-col items-center gap-4 transition-colors duration-500 min-w-[240px] ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Phone className="text-white w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className={`text-xs uppercase font-bold tracking-widest transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Call Us</div>
                        <div className={`text-lg font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{HOMI_J_CONTENT.contact.phone}</div>
                      </div>
                    </div>
                    <div className={`p-10 rounded-[2.5rem] border flex flex-col items-center gap-4 transition-colors duration-500 min-w-[240px] ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Mail className="text-white w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className={`text-xs uppercase font-bold tracking-widest transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Email Us</div>
                        <div className={`text-lg font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{HOMI_J_CONTENT.contact.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm font-bold uppercase tracking-[0.3em] transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Headquarters</p>
                    <p className={`text-base max-w-md mx-auto leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {HOMI_J_CONTENT.contact.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

            {/* Mobile Download Button - Hidden in Print */}
            <div className={`p-4 border-t sm:hidden transition-colors duration-500 no-print ${
              theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
            }`}>
              <Button onClick={handleDownload} className="w-full bg-orange-500 hover:bg-orange-500/80 text-white font-bold py-6 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Download Brochure
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
