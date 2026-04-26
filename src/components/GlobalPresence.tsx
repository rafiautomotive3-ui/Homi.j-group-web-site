import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

const LOCATIONS = [
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, region: 'Middle East' },
  { name: 'Oman', lat: 21.4735, lon: 55.9754, region: 'Middle East' },
  { name: 'India', lat: 20.5937, lon: 78.9629, region: 'Asia' },
];

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const LocationMarker = ({ pos, isHighlighted, name }: { pos: THREE.Vector3, isHighlighted: boolean, name: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (ringRef.current) {
      const s = (hovered ? 1.3 : 1) * (1 + Math.sin(time * 4) * 0.2);
      ringRef.current.scale.set(s, s, s);
    }
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group 
      position={pos} 
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pin Head - Glassy/Glowy - Smaller size */}
      <mesh position={[0, 0, -0.15]}>
        <sphereGeometry args={[hovered ? 0.04 : 0.03, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : "#00d1ff"} 
          emissive={hovered ? "#ffffff" : "#00d1ff"} 
          emissiveIntensity={hovered ? 1.0 : 0.5} 
          metalness={0.2} 
          roughness={0.5} 
        />
      </mesh>
      
      {/* Pin Stem - Tapered - Thinner */}
      <mesh position={[0, 0, -0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.003, 0.012, 0.15, 16]} />
        <meshStandardMaterial color="#00d1ff" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Pulsing ring on surface - Smaller */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.05, 0.065, 32]} />
        <meshBasicMaterial color="#00d1ff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Label - Extremely small text */}
      <Html 
        position={[0, 0, name === 'Dubai' ? -0.3 : name === 'Oman' ? -0.15 : -0.25]} 
        center 
        distanceFactor={25}
      >
        <div 
          className={`px-1 py-0.25 rounded transition-all duration-500 select-none pointer-events-none uppercase tracking-[0.2em] font-bold
            ${hovered 
              ? 'text-[6px] scale-110 bg-black/90 backdrop-blur-md border border-electric-blue/40 text-white opacity-100 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
              : 'text-[2.5px] bg-black/10 backdrop-blur-[0.5px] border border-white/5 text-electric-blue opacity-70'}`}
        >
          {name}
        </div>
      </Html>
    </group>
  );
};

const Earth = ({ isInteractive }: { isInteractive: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  // High quality textures from public CDNs
  const [dayMap, nightMap, cloudMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
  ]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayMap },
        nightTexture: { value: nightMap },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          float intensity = dot(vNormal, sunDirection);
          vec3 dayColor = texture2D(dayTexture, vUv).rgb;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb;
          
          // High contrast black and white style transition
          float mixValue = smoothstep(-0.1, 0.1, intensity);
          vec3 finalColor = mix(nightColor * 0.5, dayColor, mixValue);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [dayMap, nightMap]);

  const cloudShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        cloudTexture: { value: cloudMap },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D cloudTexture;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          float intensity = dot(vNormal, sunDirection);
          vec4 cloudColor = texture2D(cloudTexture, vUv);
          
          // High contrast clouds
          float brightness = smoothstep(-0.2, 0.2, intensity);
          float finalAlpha = cloudColor.r * 0.5;
          vec3 finalRGB = vec3(1.0) * (0.05 + 0.95 * brightness);
          
          gl_FragColor = vec4(finalRGB, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }, [cloudMap]);

  // Target camera position to focus on India
  // initialCameraPos is the default view, targetCameraPos is the zoomed view
  const initialCameraPos = useMemo(() => new THREE.Vector3(0, 0.5, 6), []);
  const targetCameraPos = useMemo(() => new THREE.Vector3(0, 0.5, 4.2), []);

  useFrame(({ clock }) => {
    // Globe is now stable - no auto-rotation
    if (groupRef.current) {
      if (isInteractive) {
        // Smoothly move camera to focus on the region when interactive (zoomed)
        camera.position.lerp(targetCameraPos, 0.05);
      } else {
        // Return to initial focus
        camera.position.lerp(initialCameraPos, 0.05);
      }
    }
    
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const sunLon = (12 - utcHours) * 15;
    const sunPhi = 90 * (Math.PI / 180);
    const sunTheta = (sunLon + 180) * (Math.PI / 180);
    
    const sunDir = new THREE.Vector3(
      -Math.sin(sunPhi) * Math.cos(sunTheta),
      Math.cos(sunPhi),
      Math.sin(sunPhi) * Math.sin(sunTheta)
    ).normalize();
    
    shaderMaterial.uniforms.sunDirection.value.copy(sunDir);
    cloudShaderMaterial.uniforms.sunDirection.value.copy(sunDir);
  });

  return (
    <group ref={groupRef} rotation={[0, -2.95, 0]}>
      <mesh ref={earthRef} material={shaderMaterial}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[2.03, 64, 64]} />
        <primitive object={cloudShaderMaterial} attach="material" />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshPhongMaterial 
          color="#4ca9ff" 
          transparent={true} 
          opacity={0.1} 
          side={THREE.BackSide}
        />
      </mesh>

      {LOCATIONS.map((loc, i) => (
        <LocationMarker 
          key={i} 
          pos={latLonToVector3(loc.lat, loc.lon, 2)} 
          isHighlighted={true} 
          name={loc.name}
        />
      ))}
    </group>
  );
};

const GlobalPresence = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [isInteractive, setIsInteractive] = useState(false);

  return (
    <section id="global" className={`py-24 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/10 text-electric-blue text-sm font-bold uppercase tracking-widest mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
            Global Presence
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-5xl font-display font-bold tracking-tight mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Connecting the World Through <span className="text-electric-blue">Innovation</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`max-w-2xl mx-auto text-lg leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          >
            With strategic hubs in the Middle East and Asia, we provide cutting-edge engineering solutions to global industrial leaders.
          </motion.p>
        </div>

        <div 
          className={`h-[600px] w-full relative rounded-3xl overflow-hidden border border-white/5 bg-black/20 backdrop-blur-sm cursor-pointer group`}
          onDoubleClick={() => setIsInteractive(!isInteractive)}
        >
          <AnimatePresence>
            {!isInteractive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px] pointer-events-none"
              >
                <div className="bg-black/60 border border-white/10 px-6 py-3 rounded-full text-white text-sm font-medium flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-electric-blue animate-ping" />
                  Double-click to explore globe
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
            <Suspense fallback={
              <Html center>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
                  <div className="text-electric-blue font-bold tracking-widest uppercase text-xs">Initializing Globe...</div>
                </div>
              </Html>
            }>
              <Earth isInteractive={isInteractive} />
            </Suspense>
            <OrbitControls 
              enabled={isInteractive}
              enablePan={false} 
              enableZoom={true} 
              minDistance={4} 
              maxDistance={10}
              autoRotate={false}
            />
          </Canvas>

          {/* Legend */}
          <div className="absolute bottom-8 left-8 flex flex-col gap-4 z-10">
            <div className={`p-4 rounded-2xl border backdrop-blur-md ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/40 border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-electric-blue animate-pulse" />
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Operational Hubs</span>
              </div>
              <div className="space-y-2">
                {LOCATIONS.map((loc, i) => (
                  <div key={i} className="flex items-center justify-between gap-8">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{loc.name}</span>
                    <span className="text-[10px] font-bold text-electric-blue uppercase tracking-widest">{loc.region}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isInteractive && (
            <button 
              onClick={() => setIsInteractive(false)}
              className="absolute top-8 right-8 z-30 bg-black/60 hover:bg-black/80 border border-white/10 px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-all"
            >
              Lock Globe
            </button>
          )}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
};

export default GlobalPresence;
