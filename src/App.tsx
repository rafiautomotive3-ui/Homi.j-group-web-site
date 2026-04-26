/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import HomiJGlobalConsultancy from './components/FlycoolGlobal';
import { OmejeDairy } from './components/OmejeDairy';
import { HomiJLogo } from './components/HomiJLogo';
import { auth } from './firebase';
import { 
  Zap, 
  Cpu, 
  Layout, 
  Activity, 
  Settings, 
  Lightbulb, 
  Menu, 
  X, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Linkedin,
  Twitter,
  Instagram,
  Sun,
  Moon,
  ShieldCheck,
  Plus,
  Trash2,
  Globe2,
  Briefcase,
  Plane,
  ArrowRight,
  Milk,
  Home
} from 'lucide-react';

// Sound Utilities
const playClickSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

const playFlySound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
  audio.volume = 0.15;
  audio.play().catch(() => {});
};
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HOMI_J_CONTENT } from './constants';
import { AIAssistant } from './components/AIAssistant';
import { BrochureModal } from './components/BrochureModal';
import { CareerModal } from './components/CareerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import GlobalPresence from './components/GlobalPresence';

const IconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Layout: <Layout className="w-6 h-6" />,
  Activity: <Activity className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />,
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
};

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const BuffaloHead = () => {
  const meshRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={meshRef} scale={0.4}>
      {/* Main Head */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.2, 1.2]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {/* Snout */}
      <mesh position={[0, -0.2, 0.7]}>
        <boxGeometry args={[0.7, 0.6, 0.6]} />
        <meshStandardMaterial color="#2a1d15" />
      </mesh>
      {/* Horns */}
      <group position={[0, 0.5, 0]}>
        <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.1, 0.2, 0.8]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
        <mesh position={[0.6, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.1, 0.2, 0.8]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      </group>
      {/* Eyes */}
      <mesh position={[-0.3, 0.2, 0.6]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.6]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
};

const CustomCursor = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isDairyPage = location.pathname.startsWith('/dairy');

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') !== null ||
        target.closest('a') !== null
      );
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  if (isDairyPage) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] flex items-center justify-center"
      animate={{
        x: position.x - 12,
        y: position.y - 12,
        scale: isPointer ? 1.8 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300,
        mass: 0.4
      }}
    >
      {/* Multicolor Ring */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          background: 'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)',
          backgroundSize: '400% 400%',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          rotate: [0, 360],
        }}
        transition={{
          backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
          rotate: { duration: 4, repeat: Infinity, ease: "linear" }
        }}
      />
      
      {/* Inner Glow */}
      <motion.div 
        className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
        animate={{
          scale: isPointer ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Trailing Glow */}
      <motion.div 
        className="absolute inset-[-10px] rounded-full opacity-20 blur-md"
        style={{
          background: 'conic-gradient(from 0deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)',
        }}
        animate={{
          rotate: [360, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
};

const ServiceIcon = ({ iconName, index }: { iconName: string, index: number }) => {
  const gradients = [
    'from-blue-500 to-cyan-400',
    'from-orange-500 to-yellow-400',
    'from-emerald-500 to-teal-400',
    'from-rose-500 to-pink-400',
    'from-indigo-500 to-purple-400',
    'from-amber-500 to-orange-400',
  ];
  
  const glowColors = [
    'shadow-blue-500/20',
    'shadow-orange-500/20',
    'shadow-emerald-500/20',
    'shadow-rose-500/20',
    'shadow-indigo-500/20',
    'shadow-amber-500/20',
  ];

  const gradient = gradients[index % gradients.length];
  const glow = glowColors[index % glowColors.length];

  return (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${gradient} shadow-lg ${glow} group-hover:scale-110 transition-transform duration-500`}>
      <div className="text-white drop-shadow-md">
        {IconMap[iconName]}
      </div>
    </div>
  );
};

const Logo = ({ className = "", theme = 'dark', subText = "Projects" }: { className?: string, theme?: 'dark' | 'light', subText?: string }) => (
  <HomiJLogo className={className} theme={theme} showText={true} subText={subText} variant="text" />
);

const SelectionScreen = ({ theme, onOpenAdmin, isAdmin, onLogout }: { theme: 'dark' | 'light', onOpenAdmin: () => void, isAdmin: boolean, onLogout: () => void }) => {
  useEffect(() => {
    // Automatically logout when returning to welcome page
    if (isAdmin) {
      onLogout();
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-gray-50'}`}>
      <CustomCursor theme={theme} />
      
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-[#050505]/80 to-transparent backdrop-blur-[2px]">
        <Logo className="scale-90 origin-left" theme={theme} subText="Projects" />
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={isAdmin ? onLogout : onOpenAdmin}
            className={`border-white/10 hover:bg-white/5 text-[9px] h-7 px-2.5 font-bold uppercase tracking-widest transition-all ${isAdmin ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'text-white'}`}
          >
            {isAdmin ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>

      {/* Admin Login Button (Desktop) */}
      <div className="hidden md:block absolute top-6 right-6 z-50">
        {isAdmin ? (
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
          >
            Admin Logout
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={onOpenAdmin}
            className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
          >
            Admin Login
          </Button>
        )}
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue/20 blur-[120px] rounded-full" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="hidden md:flex items-center justify-center mb-6">
          <HomiJLogo className="scale-150" theme={theme} variant="text" />
        </div>
        <h1 className={`text-3xl md:text-7xl font-bold mb-4 tracking-tight transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Welcome to <span className="text-orange-500">Homi.J</span> Group
        </h1>
        <p className={`max-w-xl mx-auto font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-base md:text-lg`}>
          Engineering Excellence & Global Talent Solutions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
        {/* Homi.J Projects Option */}
        <Link to="/projects" className="group">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative h-full p-10 rounded-[2.5rem] border transition-all duration-500 overflow-hidden flex flex-col items-center text-center ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-orange-500/50' : 'bg-white border-gray-200 shadow-2xl hover:border-orange-500/50'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:from-orange-500/40 group-hover:to-green-500/40 transition-all duration-500" 
              />
              <div className="relative z-10 w-full h-full bg-white/5 rounded-3xl flex items-center justify-center shadow-xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <HomiJLogo className="scale-125" theme={theme} variant="text" />
              </div>
            </div>

            <h2 className={`text-2xl md:text-3xl font-bold mb-4 group-hover:text-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Homi.J Projects</h2>
            <p className={`mb-8 leading-relaxed font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400 glow-orange' : 'text-gray-500'} text-sm md:text-base`}>
              Leading Electrical & Automation Contracting. Specializing in industrial infrastructure, clean rooms, and precision engineering.
            </p>
            
            <div className="mt-auto flex items-center gap-3 text-orange-500 font-bold group-hover:gap-5 transition-all">
              Explore Projects <ArrowRight className="w-6 h-6" />
            </div>
          </motion.div>
        </Link>

        {/* Homi.J Global Consultancy Option */}
        <Link to="/global" className="group">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative h-full p-10 rounded-[2.5rem] border transition-all duration-500 overflow-hidden flex flex-col items-center text-center ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-electric-blue/50' : 'bg-white border-gray-200 shadow-2xl hover:border-electric-blue/50'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-electric-blue/20 to-blue-500/20 rounded-3xl blur-xl group-hover:from-electric-blue/40 group-hover:to-blue-500/40 transition-all duration-500" 
              />
              <div 
                onMouseEnter={playFlySound}
                className="relative z-10 w-full h-full bg-white/5 rounded-3xl flex items-center justify-center shadow-xl border border-white/10 group-hover:scale-110 transition-transform duration-500"
              >
                <HomiJLogo className="scale-125" theme={theme} variant="hg" />
              </div>
            </div>

            <h2 className={`text-2xl md:text-3xl font-bold mb-4 group-hover:text-electric-blue transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Homi.J Global Consultancy</h2>
            <p className={`mb-8 leading-relaxed font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400 glow-blue' : 'text-gray-500'} text-sm md:text-base`}>
              Global Talent Solutions & Manpower Supply. Connecting expert engineering talent with major infrastructure projects worldwide.
            </p>
            
            <div className="mt-auto flex items-center gap-3 text-electric-blue font-bold group-hover:gap-5 transition-all">
              Global Careers <ArrowRight className="w-6 h-6" />
            </div>
          </motion.div>
        </Link>

        {/* Omeje Dairy Management Option */}
        <Link to="/dairy" className="group">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative h-full p-10 rounded-[2.5rem] border transition-all duration-500 overflow-hidden flex flex-col items-center text-center ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-orange-500/50' : 'bg-white border-gray-200 shadow-2xl hover:border-orange-500/50'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-orange-600/20 rounded-3xl blur-xl group-hover:from-orange-500/40 group-hover:to-orange-600/40 transition-all duration-500" 
              />
              <div className="relative z-10 w-full h-full bg-white/5 rounded-3xl flex items-center justify-center shadow-xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <Milk className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <h2 className={`text-2xl md:text-3xl font-bold mb-4 group-hover:text-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>homi.j Cattle management system</h2>
            <p className={`mb-8 leading-relaxed font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400 glow-orange' : 'text-gray-500'} text-sm md:text-base`}>
              Smart Cattle & Livestock Management. Tracking health, nutrition, and production for sustainable dairy excellence.
            </p>
            
            <div className="mt-auto flex items-center gap-3 text-orange-500 font-bold group-hover:gap-5 transition-all">
              Manage Cattle <ArrowRight className="w-6 h-6" />
            </div>
          </motion.div>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
            <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-yellow-500' : ''}`} />
            Day Mode (6AM-7PM)
          </div>
          <div className="w-px h-4 bg-gray-800" />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
            <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-500' : ''}`} />
            Night Mode (7PM-6AM)
          </div>
        </div>
        <div className="text-gray-500 text-sm font-medium">
          © {new Date().getFullYear()} Homi.J Group. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ theme, toggleTheme, onOpenBrochure }: { theme: 'dark' | 'light', toggleTheme: () => void, onOpenBrochure: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Services', 'About', 'Global', 'Projects', 'Clients', 'Contact'];

  const navLinkClasses = (item: string) => `
    text-sm font-medium transition-all duration-300 relative group
    ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}
    hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]
  `;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? (theme === 'dark' ? 'bg-[#0a0a0a]/80' : 'bg-white/80') + ' backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-bold uppercase tracking-widest text-xs">
              <Home className="w-4 h-4" />
              Welcome Page
            </Button>
          </Link>
          <Link to="/">
            <Logo theme={theme} subText="Projects" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            item === 'Global' ? (
              <Link key={item} to="/global" className={navLinkClasses(item)}>
                {item}
              </Link>
            ) : (
              <a key={item} href={`#${item.toLowerCase()}`} className={navLinkClasses(item)}>
                {item}
              </a>
            )
          ))}
          <button 
            onClick={onOpenBrochure}
            className={navLinkClasses('Brochure')}
          >
            Brochure
          </button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className={`transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <a href="#contact">
            <Button variant="outline" className="border-electric-blue/50 text-electric-blue hover:bg-electric-blue hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,209,255,0.4)]">
              Get in Touch
            </Button>
          </a>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <button className={theme === 'dark' ? 'text-white' : 'text-black'} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-full left-0 right-0 border-b border-white/10 p-6 md:hidden ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'}`}
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                item === 'Global' ? (
                  <Link 
                    key={item} 
                    to="/global" 
                    className={`text-lg font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ) : (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className={`text-lg font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                )
              ))}
              <button 
                onClick={() => {
                  onOpenBrochure();
                  setIsMobileMenuOpen(false);
                }}
                className={`text-lg font-medium text-left transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                Brochure
              </button>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white font-bold hover:shadow-[0_0_15px_rgba(0,209,255,0.4)]">Get in Touch</Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-6 border-orange-500/30 text-orange-500 px-4 py-1 rounded-full bg-orange-500/5">
            Leading Electrical & Automation Contracting
          </Badge>
          <h1 className={`text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {HOMI_J_CONTENT.hero.title.split(' ').map((word, i) => (
              <span key={i} className={i > 3 ? 'gradient-text' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>
          <p className={`text-xl max-w-2xl mx-auto mb-10 leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {HOMI_J_CONTENT.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href={`https://wa.me/918978617793?text=${encodeURIComponent("📞 Service Call Request :\nName: \nPhone: \nDetails: ")}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-lg rounded-xl glow transition-all duration-300 shadow-lg shadow-orange-500/20">
                {HOMI_J_CONTENT.hero.cta}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="#projects">
              <Button size="lg" variant="ghost" className={`font-bold px-8 py-6 text-lg rounded-xl transition-colors duration-500 ${theme === 'dark' ? 'text-white hover:bg-white/5' : 'text-gray-900 hover:bg-gray-100'}`}>
                View Our Work
              </Button>
            </a>
            <a href="#clients">
              <Button size="lg" variant="ghost" className="text-orange-500 hover:bg-orange-500/10 px-8 py-6 text-lg rounded-xl border border-orange-500/20">
                Our Clients
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="glass rounded-3xl p-4 overflow-hidden shadow-2xl relative">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              className="rounded-2xl w-full h-[400px] md:h-[600px] object-cover opacity-80"
            >
              <source src="https://drive.google.com/uc?id=1INLxytlIuNNY99ggAI_7SsXoEX4rxoh4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent transition-colors duration-500 ${theme === 'dark' ? 'from-[#0a0a0a]' : 'from-white'}`} />
          </div>
          
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
            {HOMI_J_CONTENT.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass p-6 rounded-2xl text-center"
              >
                <div className="text-3xl font-bold text-electric-blue mb-1">{stat.value}</div>
                <div className={`text-xs uppercase tracking-widest transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Services = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <section id="services" className={`py-32 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-electric-blue/30 text-electric-blue px-4 py-1 rounded-full bg-electric-blue/5">
              Our Core Expertise
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight text-green-500">
              <motion.span
                className="inline-block"
                initial={{ textShadow: "0 0 0px rgba(34, 197, 94, 0)" }}
                whileInView={{ 
                  textShadow: [
                    "0 0 0px rgba(34, 197, 94, 0)",
                    "0 0 30px rgba(34, 197, 94, 0.6)",
                    "0 0 10px rgba(34, 197, 94, 0.2)"
                  ]
                }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
                whileHover={{ scale: 1.02, textShadow: "0 0 20px rgba(34, 197, 94, 0.4)" }}
              >
                Precision Engineering for <br />
                Industrial Excellence
              </motion.span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className={`text-lg leading-relaxed mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-300 glow-orange' : 'text-gray-700'}`}>
              We provide end-to-end electrical and automation services that drive efficiency and reliability in modern industrial environments.
            </p>
            <div className="h-1 w-20 bg-orange-500 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {HOMI_J_CONTENT.services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className={`backdrop-blur-sm border-white/5 hover:border-orange-500/30 transition-all duration-500 h-full overflow-hidden relative group ${theme === 'dark' ? 'bg-[#111]/50' : 'bg-white shadow-xl'}`}>
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative z-10">
                  <ServiceIcon iconName={service.icon} index={i} />
                  <CardTitle className={`text-2xl mb-3 group-hover:text-orange-500 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <motion.span
                      className="inline-block"
                      initial={{ textShadow: "0 0 0px rgba(249, 115, 22, 0)" }}
                      whileInView={{ 
                        textShadow: [
                          "0 0 0px rgba(249, 115, 22, 0)",
                          "0 0 20px rgba(249, 115, 22, 0.8)",
                          "0 0 8px rgba(249, 115, 22, 0.4)"
                        ]
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: i * 0.1 + 0.5 }}
                      whileHover={{ scale: 1.05, textShadow: "0 0 25px rgba(249, 115, 22, 1)" }}
                    >
                      {service.title}
                    </motion.span>
                  </CardTitle>
                  <CardDescription className={`text-base leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-300 glow-orange' : 'text-gray-600'}`}>
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 mt-auto">
                  <a 
                    href={`https://wa.me/918978617793?text=${encodeURIComponent(`📞 Service Call Request :\nName: \nPhone: \nDetails: Inquiry about ${service.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button 
                      variant="link" 
                      className="p-0 text-orange-500 hover:text-white transition-all group-hover:translate-x-2 font-bold"
                    >
                      Explore Service <ArrowUpRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mt-24 glass p-12 rounded-[2.5rem] text-center border-orange-500/10 transition-colors duration-500`}
        >
          <h3 className={`text-3xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Need a Custom Engineering Solution?</h3>
          <p className={`mb-8 max-w-xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Our team of expert engineers is ready to help you design and implement the perfect automation strategy for your facility.
          </p>
          <a 
            href={`https://wa.me/918978617793?text=${encodeURIComponent("📞 Service Call Request :\nName: \nPhone: \nDetails: ")}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-7 text-lg rounded-2xl glow shadow-lg shadow-orange-500/20">
              Schedule a Consultation
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const Projects = ({ theme, projects, setProjects, isAdmin }: { theme: 'dark' | 'light', projects: any[], setProjects: React.Dispatch<React.SetStateAction<any[]>>, isAdmin: boolean }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', location: '', type: 'Industrial' });

  const handleAddProject = () => {
    if (newProject.name && newProject.location) {
      setProjects(prev => [...prev, newProject]);
      setNewProject({ name: '', location: '', type: 'Industrial' });
      setIsAdding(false);
    }
  };

  const handleDeleteProject = (index: number) => {
    if (!isAdmin) return;
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <section id="projects" className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-500 px-4 py-1 rounded-full bg-orange-500/5">
            Our Portfolio
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-orange-500">
            <motion.span
              className="inline-block"
              initial={{ textShadow: "0 0 0px rgba(249, 115, 22, 0)" }}
              whileInView={{ 
                textShadow: [
                  "0 0 0px rgba(249, 115, 22, 0)",
                  "0 0 30px rgba(249, 115, 22, 0.6)",
                  "0 0 10px rgba(249, 115, 22, 0.2)"
                ]
              }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
              whileHover={{ scale: 1.02, textShadow: "0 0 20px rgba(249, 115, 22, 0.4)" }}
            >
              Major Projects
            </motion.span>
          </h2>
          <p className={`max-w-2xl mx-auto text-lg transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            A showcase of our most significant engineering achievements across diverse industries and geographies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Homi.J Global Special Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="relative group"
          >
            <Link to="/global">
              <Card className={`border-electric-blue/30 hover:border-electric-blue transition-all duration-500 h-full overflow-hidden relative group bg-gradient-to-br from-electric-blue/10 to-transparent ${theme === 'dark' ? 'bg-[#111]/50' : 'bg-white shadow-xl'}`}>
                <div className="absolute top-0 right-0 p-4">
                  <Badge className="bg-electric-blue text-white animate-pulse">New Division</Badge>
                </div>
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-electric-blue/20 flex items-center justify-center text-electric-blue mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Globe2 className="w-8 h-8" />
                  </div>
                  <CardTitle className={`text-2xl mb-3 group-hover:text-electric-blue transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Homi.J Global Consultancy
                  </CardTitle>
                  <CardDescription className={`text-base leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Specialized Manpower Supply Consultancy for Civil, Electrical, and Construction works worldwide.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-2 text-electric-blue font-bold group-hover:translate-x-2 transition-transform">
                    Explore Global Services <ChevronRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {projects.map((project, i) => (
              <motion.div
                key={`${project.name}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <Card className={`border-white/10 hover:border-orange-500/50 transition-all duration-300 h-full group ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-lg'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/5 text-gray-400 group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-colors">
                          {project.type}
                        </Badge>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteProject(i)}
                            className="md:opacity-0 md:group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <CardTitle className={`text-xl mb-2 group-hover:text-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{project.name}</CardTitle>
                    <div className={`flex items-center gap-2 text-sm group-hover:text-orange-500/70 transition-colors ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <MapPin className="w-4 h-4 text-orange-500/50" />
                      {project.location}
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Project Card */}
          {isAdmin && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
            >
              {isAdding ? (
                <Card className={`border-dashed border-green-500/50 transition-all duration-300 h-full ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-lg'}`}>
                  <CardHeader className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Project Name</label>
                      <input 
                        type="text" 
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        placeholder="e.g. Smart Factory"
                        className={`w-full p-3 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Location</label>
                      <input 
                        type="text" 
                        value={newProject.location}
                        onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                        placeholder="e.g. Dubai, UAE"
                        className={`w-full p-3 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Type</label>
                      <select 
                        value={newProject.type}
                        onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                        className={`w-full p-3 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      >
                        {['Industrial', 'Automation', 'Pharmaceutical', 'Healthcare', 'Government', 'Educational', 'Utility'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleAddProject} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold">Apply</Button>
                      <Button onClick={() => setIsAdding(false)} variant="ghost" className="text-gray-500">Cancel</Button>
                    </div>
                  </CardHeader>
                </Card>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  className={`w-full h-full min-h-[200px] border-2 border-dashed border-green-500/30 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-green-500/60 hover:bg-green-500/5 transition-all group`}
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <div className={`font-bold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Project</div>
                    <div className="text-sm text-gray-500">Click to expand portfolio</div>
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

const CleanRoomGallery = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <section className="py-32 relative overflow-hidden bg-orange-500/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-500">Specialized Expertise</Badge>
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Clean Room & Controlled Environments
          </h2>
          <p className={`max-w-2xl mx-auto text-lg transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            We specialize in delivering high-performance electrical and automation infrastructure for critical clean room facilities.
          </p>
        </div>

        <div className="flex justify-center">
          {HOMI_J_CONTENT.cleanRoomImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl aspect-video"
            >
              <img 
                src={img.url} 
                alt={img.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = ({ theme, onOpenBrochure }: { theme: 'dark' | 'light', onOpenBrochure: () => void }) => {
  return (
    <section id="about" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070" 
                alt="Precision Engineering Team" 
                className="w-full h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-500/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/20 blur-[80px] rounded-full" />
            
            <div className={`absolute bottom-10 right-10 glass p-6 rounded-2xl max-w-xs border-l-4 border-l-orange-500 transition-colors duration-500`}>
              <p className={`text-sm font-medium italic transition-colors duration-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                "Reliability is not just a promise; it's our foundation."
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-500">About Homi.JProjects</Badge>
            <h2 className={`text-4xl md:text-5xl font-bold mb-8 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{HOMI_J_CONTENT.about.title}</h2>
            <p className={`text-lg mb-10 leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {HOMI_J_CONTENT.about.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {HOMI_J_CONTENT.about.highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className={`font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{highlight}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="glass p-6 rounded-2xl border-l-4 border-l-orange-500">
                <h4 className={`text-xl font-bold mb-3 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Our Mission</h4>
                <p className={`text-sm leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {HOMI_J_CONTENT.about.mission}
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border-l-4 border-l-green-500">
                <h4 className={`text-xl font-bold mb-3 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Our Vision</h4>
                <p className={`text-sm leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {HOMI_J_CONTENT.about.vision}
                </p>
              </div>
            </div>

            <Button 
              onClick={onOpenBrochure}
              className={`mt-12 font-bold px-8 py-6 rounded-xl transition-colors duration-500 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black'}`}
            >
              Download Corporate Brochure
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Clients = ({ theme }: { theme: 'dark' | 'light' }) => {
  // Duplicate the list for an infinite marquee effect
  const duplicatedClients = [...HOMI_J_CONTENT.clients, ...HOMI_J_CONTENT.clients, ...HOMI_J_CONTENT.clients];

  return (
    <section id="clients" className={`py-20 border-y transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <p className={`text-center uppercase tracking-[0.3em] text-xs font-bold transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Trusted by Industry Leaders</p>
      </div>
      
      <div className="relative flex">
        {/* Left to right marquee */}
        <motion.div 
          className="flex gap-12 md:gap-20 items-center whitespace-nowrap"
          animate={{
            x: ["-50%", "0%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {duplicatedClients.map((client, i) => (
            <motion.span 
              key={i} 
              className={`text-2xl md:text-3xl font-display font-bold cursor-default transition-colors inline-block ${theme === 'dark' ? 'text-white hover:text-orange-500' : 'text-gray-900 hover:text-orange-500'}`}
              whileHover={{ scale: 1.15, color: "#f97316" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {client}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Contact = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <section id="contact" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-[3rem] p-8 md:p-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className={`text-4xl md:text-5xl font-bold mb-8 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Partner with Us for Engineering Excellence</h2>
              <p className={`text-lg mb-12 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Get in touch with our experts today for personalized assistance and solutions tailored to your needs.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500">
                    <MapPin />
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Our Office</h4>
                    <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{HOMI_J_CONTENT.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500">
                    <Mail />
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email Us</h4>
                    <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{HOMI_J_CONTENT.contact.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500">
                    <Phone />
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Call Us</h4>
                    <a href="tel:+918978617793" className={`transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400 hover:text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
                      {HOMI_J_CONTENT.contact.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => { 
              e.preventDefault(); 
              const form = e.target as HTMLFormElement;
              const name = (form.elements[0] as HTMLInputElement).value;
              const phone = (form.elements[2] as HTMLInputElement).value;
              const details = (form.elements[4] as HTMLTextAreaElement).value;
              const subject = "📞 Service Call Request";
              const body = `Name: ${name}\nPhone: ${phone}\nDetails: ${details}`;
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${HOMI_J_CONTENT.contact.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              window.open(gmailUrl, '_blank');
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ml-1 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Full Name *</label>
                  <input required type="text" className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ml-1 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Company Name</label>
                  <input type="text" className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} placeholder="Your Organization" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ml-1 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number *</label>
                  <input required type="tel" className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ml-1 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
                  <input type="email" className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ml-1 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Service / Supply Description *</label>
                <textarea required className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 h-32 focus:outline-none focus:border-orange-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} placeholder="Describe the services or supplies you require..."></textarea>
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 text-lg font-bold rounded-xl shadow-lg shadow-orange-500/20">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const RafiqLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 group ${className}`}>
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer Circle */}
        <circle 
          cx="50" cy="50" r="48" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          className="opacity-30"
        />
        {/* Inner Circle */}
        <circle 
          cx="50" cy="50" r="42" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
        />
        {/* Stylized D - Double Line Effect */}
        <path 
          d="M32 32 h6 v36 h-6 z M44 32 h8 c10 0 18 8 18 18 s-8 18-18 18 h-8 v-6 h8 c6 0 12-5 12-12 s-6-12-12-12 h-8 z" 
          fill="currentColor"
        />
      </svg>
    </div>
    <span className="text-sm font-medium tracking-wide">
      Designed by <span className="text-orange-500 font-bold group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-300">Rafiq</span>
    </span>
  </div>
);

const Footer = ({ theme, onOpenBrochure, onOpenCareer, onOpenAdmin, isAdmin, onLogout }: { theme: 'dark' | 'light', onOpenBrochure: () => void, onOpenCareer: () => void, onOpenAdmin: () => void, isAdmin: boolean, onLogout: () => void }) => {
  return (
    <footer className={`py-20 border-t transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-6" theme={theme} subText="Projects" />
            <p className={`max-w-sm leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              Integrating cutting-edge electrical and automation technologies to empower industrial growth since 2019.
            </p>
          </div>
          
          <div>
            <h4 className={`font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contact Us</h4>
            <ul className={`space-y-4 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-sm">{HOMI_J_CONTENT.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                <a href={`mailto:${HOMI_J_CONTENT.contact.email}`} className={`text-sm hover:text-orange-500 transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}>
                  {HOMI_J_CONTENT.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                <a href="tel:+918978617793" className={`text-sm hover:text-orange-500 transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}>
                  {HOMI_J_CONTENT.contact.phone}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className={`font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Resources</h4>
            <ul className={`space-y-4 transition-colors duration-500 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              <li>
                <button 
                  onClick={onOpenBrochure}
                  className={`hover:text-orange-500 transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
                >
                  Brochures
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenCareer}
                  className={`hover:text-orange-500 transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
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
              © {new Date().getFullYear()} Homi.JProjects. All rights reserved.
            </p>
            <RafiqLogo className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
          </div>
          <div className="flex gap-6">
            <a 
              href={HOMI_J_CONTENT.social.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`transition-colors flex items-center gap-2 group ${theme === 'dark' ? 'text-gray-600 hover:text-electric-blue' : 'text-gray-500 hover:text-electric-blue'}`}
            >
              <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            <a href="#" className={`transition-colors ${theme === 'dark' ? 'text-gray-600 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className={`transition-colors ${theme === 'dark' ? 'text-gray-600 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AppContent = ({ 
  theme, 
  toggleTheme, 
  isBrochureOpen, 
  setIsBrochureOpen, 
  isCareerOpen, 
  setIsCareerOpen, 
  isAdminLoginOpen, 
  setIsAdminLoginOpen, 
  isAdmin, 
  handleAdminLogin, 
  handleAdminLogout, 
  projects, 
  setProjects 
}: any) => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen selection:bg-orange-500 selection:text-white transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
      <CustomCursor theme={theme} />
      <Navbar theme={theme} toggleTheme={toggleTheme} onOpenBrochure={() => setIsBrochureOpen(true)} />
      <div className="fixed bottom-8 left-8 z-50">
        <Link to="/">
          <Button className="rounded-full px-6 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Welcome Page
          </Button>
        </Link>
      </div>
      <main>
        <Hero theme={theme} />
        <Clients theme={theme} />
        <GlobalPresence theme={theme} />
        <Services theme={theme} />
        <Projects 
          theme={theme} 
          projects={projects} 
          setProjects={setProjects} 
          isAdmin={isAdmin}
        />
        <CleanRoomGallery theme={theme} />
        <About theme={theme} onOpenBrochure={() => setIsBrochureOpen(true)} />
        <Contact theme={theme} />
      </main>
      <Footer 
        theme={theme} 
        onOpenBrochure={() => setIsBrochureOpen(true)} 
        onOpenCareer={() => setIsCareerOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        isAdmin={isAdmin}
        onLogout={handleAdminLogout}
      />
      <AIAssistant theme={theme} />
    </div>
  );
};

const HomiJGlobalConsultancyWrapper = ({ 
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
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen selection:bg-electric-blue selection:text-white transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
      <CustomCursor theme={theme} />
      <div className="fixed bottom-8 left-8 z-50">
        <Link to="/">
          <Button className="rounded-full px-6 h-12 bg-electric-blue hover:bg-electric-blue/80 text-white font-bold shadow-lg shadow-electric-blue/20 flex items-center gap-2 group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Welcome Page
          </Button>
        </Link>
      </div>
      <HomiJGlobalConsultancy 
        theme={theme} 
        isAdmin={isAdmin} 
        toggleTheme={toggleTheme}
        onOpenAdmin={onOpenAdmin}
        onLogout={onLogout}
        onOpenBrochure={onOpenBrochure}
        onOpenCareer={onOpenCareer}
      />
    </div>
  );
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

const AnimatedAppRoutes = (props: any) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <SelectionScreen 
              theme={props.theme} 
              onOpenAdmin={() => props.setIsAdminLoginOpen(true)}
              isAdmin={props.isAdmin}
              onLogout={props.handleAdminLogout}
            />
          </PageTransition>
        } />
        <Route path="/projects" element={
          <PageTransition>
            <AppContent 
              theme={props.theme}
              toggleTheme={props.toggleTheme}
              isBrochureOpen={props.isBrochureOpen}
              setIsBrochureOpen={props.setIsBrochureOpen}
              isCareerOpen={props.isCareerOpen}
              setIsCareerOpen={props.setIsCareerOpen}
              isAdminLoginOpen={props.isAdminLoginOpen}
              setIsAdminLoginOpen={props.setIsAdminLoginOpen}
              isAdmin={props.isAdmin}
              handleAdminLogin={props.handleAdminLogin}
              handleAdminLogout={props.handleAdminLogout}
              projects={props.projects}
              setProjects={props.setProjects}
            />
          </PageTransition>
        } />
        <Route 
          path="/global" 
          element={
            <PageTransition>
              <HomiJGlobalConsultancyWrapper 
                theme={props.theme} 
                isAdmin={props.isAdmin} 
                toggleTheme={props.toggleTheme} 
                onOpenAdmin={() => props.setIsAdminLoginOpen(true)}
                onLogout={props.handleAdminLogout}
                onOpenBrochure={() => props.setIsBrochureOpen(true)}
                onOpenCareer={() => props.setIsCareerOpen(true)}
              />
            </PageTransition>
          } 
        />
        <Route path="/dairy" element={
          <PageTransition>
            <OmejeDairy theme={props.theme} isAdmin={props.isAdmin} />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isCareerOpen, setIsCareerOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasManuallyToggled, setHasManuallyToggled] = useState(false);
  const [projects, setProjects] = useState(HOMI_J_CONTENT.majorProjects);

  const ADMIN_EMAILS = ['rafiautomotive3@gmail.com', 'homejeprojects@gmail.com'];

  // Load admin status from sessionStorage on mount
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('homi_j_is_admin') === 'true';
    setIsAdmin(adminStatus);

    // Also listen for Firebase Auth changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        sessionStorage.setItem('homi_j_is_admin', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('homi_j_is_admin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('homi_j_is_admin');
  };

  // Inactivity logout (20 minutes)
  useEffect(() => {
    if (!isAdmin) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleAdminLogout();
        alert("You have been logged out due to 20 minutes of inactivity.");
      }, 20 * 60 * 1000); // 20 minutes
    };

    const events = ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAdmin]);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('homi_j_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    localStorage.setItem('homi_j_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const handleClick = () => playClickSound();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Automatic theme switching based on time
  useEffect(() => {
    if (hasManuallyToggled) return;

    const updateThemeBasedOnTime = () => {
      const hour = new Date().getHours();
      // 6 AM to 7 PM (19:00) is Day Mode (Light)
      // 7 PM to 6 AM is Night Mode (Dark)
      const isDayTime = hour >= 6 && hour < 19;
      setTheme(isDayTime ? 'light' : 'dark');
    };

    updateThemeBasedOnTime();
    
    // Check every minute in case the user stays on the page across the threshold
    const interval = setInterval(updateThemeBasedOnTime, 60000);
    return () => clearInterval(interval);
  }, [hasManuallyToggled]);

  const toggleTheme = () => {
    setHasManuallyToggled(true);
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <CustomCursor theme={theme} />
      <AnimatedAppRoutes
        theme={theme}
        isBrochureOpen={isBrochureOpen}
        setIsBrochureOpen={setIsBrochureOpen}
        isCareerOpen={isCareerOpen}
        setIsCareerOpen={setIsCareerOpen}
        isAdminLoginOpen={isAdminLoginOpen}
        setIsAdminLoginOpen={setIsAdminLoginOpen}
        isAdmin={isAdmin}
        handleAdminLogin={handleAdminLogin}
        handleAdminLogout={handleAdminLogout}
        projects={projects}
        setProjects={setProjects}
        toggleTheme={toggleTheme}
      />

      <BrochureModal 
        isOpen={isBrochureOpen} 
        onClose={() => setIsBrochureOpen(false)} 
        theme={theme} 
        isAdmin={isAdmin}
      />

      <CareerModal
        isOpen={isCareerOpen}
        onClose={() => setIsCareerOpen(false)}
        theme={theme}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
        theme={theme}
      />
    </Router>
  );
}

