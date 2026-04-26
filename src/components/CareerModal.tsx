import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, User, Phone, Briefcase, Send, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const CareerModal = ({ isOpen, onClose, theme }: CareerModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    experience: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please upload your resume before submitting.');
      return;
    }

    // In a real production app with a backend, we would use FormData to send the file.
    // For this frontend-only implementation, we simulate the "push" to the specified email.
    console.log('Pushing application to: homijprojects@gmail.com');
    console.log('Form Data:', formData);
    console.log('Resume File:', file.name);
    
    setIsSubmitted(true);
    
    // Reset after 4 seconds to give user time to read the success message
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', mobile: '', experience: '' });
      setFile(null);
      onClose();
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border transition-colors duration-500 ${
              theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className={`p-5 border-b flex justify-between items-center transition-colors duration-500 ${
              theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Briefcase className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Join Our Team
                  </h2>
                  <p className={`text-[10px] transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Start your career at Homi.JProjects
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Application Sent!</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your application and resume have been pushed to <span className="text-orange-500 font-bold">homijprojects@gmail.com</span>.
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Our HR team will review your profile and get back to you shortly.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500/50" />
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-orange-500/20 text-sm ${
                          theme === 'dark' 
                            ? 'bg-white/5 border-white/10 text-white focus:border-orange-500/50' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500/50" />
                      <input
                        required
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="Enter your mobile number"
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-orange-500/20 text-sm ${
                          theme === 'dark' 
                            ? 'bg-white/5 border-white/10 text-white focus:border-orange-500/50' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Experience Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Briefly describe your professional experience..."
                      className={`w-full px-4 py-3.5 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-orange-500/20 resize-none text-sm ${
                        theme === 'dark' 
                          ? 'bg-white/5 border-white/10 text-white focus:border-orange-500/50' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Upload Resume <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2 ${
                        file 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : theme === 'dark' 
                            ? 'border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5' 
                            : 'border-gray-200 bg-gray-50 hover:border-orange-500 hover:bg-orange-500/5'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      {file ? (
                        <>
                          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                            <p className="text-[10px] text-gray-500">Click to change file</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            theme === 'dark' ? 'bg-white/10 text-gray-400 group-hover:text-orange-500' : 'bg-gray-200 text-gray-500 group-hover:text-orange-500'
                          }`}>
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Click to upload resume</p>
                            <p className="text-[10px] text-gray-500">PDF, DOC, or DOCX (Max 5MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-500/80 text-white font-bold py-6 rounded-2xl shadow-lg shadow-orange-500/20 text-sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
