"use client";

import React, { useLayoutEffect, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// 1. PROCEDURAL 3D AIRPLANE (No external .glb needed!)
// ----------------------------------------------------
const ProceduralAirplane = () => {
  const propRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (propRef.current) {
      propRef.current.rotation.z += 0.8; // Spin propeller
    }
  });

  return (
    <group rotation={[0.1, -Math.PI / 4, 0]} scale={0.6}>
      {/* Fuselage */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.2, 4]} />
        <meshStandardMaterial color="#00d4ff" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Wings */}
      <mesh castShadow position={[0, -0.2, 0.5]}>
        <boxGeometry args={[5, 0.1, 1.2]} />
        <meshStandardMaterial color="#7b61ff" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Tail Fin */}
      <mesh castShadow position={[0, 0.8, -1.6]}>
        <boxGeometry args={[0.2, 1.2, 0.8]} />
        <meshStandardMaterial color="#ff6b35" roughness={0.4} />
      </mesh>
      {/* Horizontal Stabilizer */}
      <mesh castShadow position={[0, 0.2, -1.6]}>
        <boxGeometry args={[1.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#7b61ff" />
      </mesh>
      {/* Cockpit / Canopy */}
      <mesh castShadow position={[0, 0.7, 0.2]}>
        <boxGeometry args={[0.8, 0.6, 1]} />
        <meshStandardMaterial color="#0a111c" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Nose */}
      <mesh castShadow position={[0, 0, 2.2]}>
        <boxGeometry args={[0.8, 0.8, 0.4]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      {/* Propeller */}
      <mesh ref={propRef} position={[0, 0, 2.45]}>
        <boxGeometry args={[0.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#e8edf5" />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// 2. BACKGROUND LOW-POLY SHAPES
// ----------------------------------------------------
const BackgroundShapes = () => {
  return (
    <>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={2} position={[-5, 3, -8]}>
        <mesh>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#7b61ff" wireframe opacity={0.3} transparent />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={[6, -2, -10]}>
        <mesh>
          <octahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#00d4ff" wireframe opacity={0.2} transparent />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={2} floatIntensity={1.5} position={[-6, -6, -5]}>
        <mesh>
          <tetrahedronGeometry args={[1.8, 0]} />
          <meshStandardMaterial color="#ff6b35" wireframe opacity={0.2} transparent />
        </mesh>
      </Float>
    </>
  );
};

// ----------------------------------------------------
// 3. 3D SCENE MANAGER
// ----------------------------------------------------
const SceneManager = ({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement> }) => {
  const planeGroup = useRef<THREE.Group>(null);
  
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: scrollRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          if (planeGroup.current) {
            const p = self.progress;
            // Airplane scroll-based path
            planeGroup.current.position.y = 2 - (p * 12);
            planeGroup.current.rotation.y = p * Math.PI * 2;
            planeGroup.current.position.x = Math.sin(p * Math.PI * 4) * 4;
            planeGroup.current.rotation.z = Math.sin(p * Math.PI * 4) * 0.5;
            planeGroup.current.position.z = Math.cos(p * Math.PI * 2) * 2;
          }
        }
      });
    }, scrollRef);
    return () => ctx.revert();
  }, [scrollRef]);

  return (
    <>
       <ambientLight intensity={1.5} />
       <directionalLight position={[10, 10, 5]} intensity={2} />
       <BackgroundShapes />
       <group ref={planeGroup} position={[0, 2, 0]}>
         <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
           <ProceduralAirplane />
         </Float>
       </group>
    </>
  );
};

// ----------------------------------------------------
// 4. CUSTOM CURSOR
// ----------------------------------------------------
const Cursor = () => {
  const curRef = useRef<HTMLDivElement>(null);
  const curRRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const handleMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('mousemove', handleMove);

    let reqId: number;
    const loop = () => {
      if (curRef.current && curRRef.current) {
        curRef.current.style.transform = "translate(" + mx + "px, " + my + "px) translate(-50%, -50%)";
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        curRRef.current.style.transform = "translate(" + rx + "px, " + ry + "px) translate(-50%, -50%)";
      }
      reqId = requestAnimationFrame(loop);
    };
    loop();
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(reqId);
    };
  }, []);
  
  return (
    <>
      <div ref={curRef} className="cur" />
      <div ref={curRRef} className="cur-r" />
    </>
  );
};

// ----------------------------------------------------
// 5. MAIN PAGE COMPONENT
// ----------------------------------------------------
const PROJECTS = [
  { id: "01", title: "Prognostics & Health Management", org: "Personal Project · Oct – Dec 2025", desc: "End-to-end ML pipeline predicting engine Remaining Useful Life (RUL) on the NASA C-MAPSS dataset. Custom Asymmetric Loss Function reduces safety violations from 12.4% to 1.09%.", tags: ["LSTM", "Python", "MLflow", "DVC"] },
  { id: "02", title: "Single-Pilot Simulator Displays", org: "FSR — TU Darmstadt · Apr – Sep 2025", desc: "Modular GUI for single-pilot cockpit operations built with PySide6. Multi-threaded UDP network layer streams real-time telemetry from X-Plane 12 at 50 Hz.", tags: ["PySide6", "X-Plane SDK", "UDP", "HMI"] },
  { id: "03", title: "Runway Incursion Analysis", org: "Boeing × FSR · Oct 2024 – Mar 2025", desc: "Processed 30 years of runway incursion data to find collision avoidance patterns. Structured safety logic aligned with RTCA DO-323.", tags: ["Safety Analysis", "RTCA DO-323", "Pandas"] },
  { id: "04", title: "Height-Adjustable Mower Unit", org: "TU Darmstadt · Apr – Sep 2024", desc: "Active stabilisation control logic for a mechatronic mowing system using MATLAB/Simulink. Physical prototypes designed in Fusion 360.", tags: ["MATLAB", "Simulink", "Fusion 360", "3D Printing"] }
];

export default function Page() {
  const mainRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Bar & Reveal Animations
  useLayoutEffect(() => {
    const handleScroll = () => {
      if (progRef.current) {
        const scrolled = window.scrollY;
        const max = document.body.scrollHeight - window.innerHeight;
        progRef.current.style.width = ((scrolled / max) * 100) + "%";
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let ctx = gsap.context(() => {
      // Reveal generic elements
      gsap.utils.toArray('.rv').forEach((el: any) => {
        gsap.fromTo(el, 
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
          }
        );
      });

      // 3D Flip effect for project cards
      gsap.utils.toArray('.proj-card-3d').forEach((card: any) => {
        gsap.fromTo(card, 
          { rotationX: -45, rotationY: 15, opacity: 0, y: 150, scale: 0.9 },
          {
            rotationX: 0, rotationY: 0, opacity: 1, y: 0, scale: 1,
            scrollTrigger: {
              trigger: card,
              start: "top 95%",
              end: "top 60%",
              scrub: 1,
            }
          }
        );
      });
    }, mainRef);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={mainRef} className="app-container">
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      <Cursor />
      <div ref={progRef} className="scroll-prog" />

      {/* 3D Background Canvas */}
      <div className="canvas-wrapper">
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
          <SceneManager scrollRef={mainRef} />
        </Canvas>
      </div>

      {/* Background Decor */}
      <div className="bg-grid"></div>
      <div className="orb o1"></div>
      <div className="orb o2"></div>
      <div className="orb o3"></div>

      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-logo">HM</div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#education">Education</a></li>
        </ul>
      </nav>

      <div className="content-layer">
        
        {/* Hero Section */}
        <section id="hero" className="section-hero">
          <div className="hero-content">
            <div className="h-eye rv">Aerospace &amp; AI Engineer · Darmstadt, Germany</div>
            <h1 className="h-name rv"><span className="l1">Hardik</span><span className="l2">Madaan</span></h1>
            <p className="h-sub rv">M.Sc. Aerospace Engineering at TU Darmstadt. Building safety-critical AI systems, ML pipelines &amp; intelligent flight interfaces where aerospace meets machine intelligence.</p>
            <div className="h-ctas rv">
              <a href="#projects" className="btn-p">View Projects</a>
              <a href="#contact" className="btn-o">Get in Touch</a>
            </div>
          </div>
          <div className="scroll-hint rv">
            <div className="scroll-line"></div>
            Scroll to explore
          </div>
        </section>

        {/* Marquee */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            <span className="marquee-item">Machine Learning</span><span className="marquee-item">Aerospace Engineering</span>
            <span className="marquee-item">HMI Design</span><span className="marquee-item">Safety-Critical AI</span>
            <span className="marquee-item">MLOps · DVC · MLflow</span><span className="marquee-item">Flight Systems</span>
            <span className="marquee-item">Machine Learning</span><span className="marquee-item">Aerospace Engineering</span>
            <span className="marquee-item">HMI Design</span><span className="marquee-item">Safety-Critical AI</span>
          </div>
        </div>

        {/* Projects Section */}
        <section id="projects" className="section-projects">
          <div className="s-inner">
            <div className="s-label rv" data-n="01">Project Showcase</div>
            <h2 className="s-title rv">Interactive<br/><span className="text-grad">code &amp; results.</span></h2>
            
            <div className="proj-list">
              {PROJECTS.map((proj, idx) => (
                <div key={proj.id} className="proj-card-3d">
                  <div className="proj-content">
                    <div className="proj-num-big">{proj.id}</div>
                    <div className="proj-info">
                      <h3 className="proj-title-big">{proj.title}</h3>
                      <div className="proj-org-badge">{proj.org}</div>
                      <p className="proj-desc-full">{proj.desc}</p>
                      <div className="proj-tags-row">
                        {proj.tags.map(tag => (
                          <span key={tag} className="pt">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="ft">© 2026 <span className="fa">Hardik Madaan</span> · Darmstadt, Germany</div>
          <div className="ft">Aerospace + AI <span className="fa">✦</span> Built with precision</div>
        </footer>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// 6. GLOBAL CSS STYLES
// ----------------------------------------------------
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400&family=Outfit:wght@300;400;500&display=swap');

  :root {
    --bg: #020408;
    --surface: #060c14;
    --card: #0a111c;
    --accent: #00d4ff;
    --accent2: #7b61ff;
    --accent3: #ff6b35;
    --text: #e8edf5;
    --muted: #4a5a70;
    --border: rgba(0, 212, 255, 0.1);
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    overflow-x: hidden;
    cursor: none;
  }

  /* Cursor Styles */
  .cur {
    position: fixed; top: 0; left: 0;
    width: 10px; height: 10px;
    background: var(--accent);
    border-radius: 50%;
    pointer-events: none; z-index: 9999;
    mix-blend-mode: screen;
  }
  .cur-r {
    position: fixed; top: 0; left: 0;
    width: 36px; height: 36px;
    border: 1px solid rgba(0, 212, 255, .4);
    border-radius: 50%;
    pointer-events: none; z-index: 9998;
  }

  /* Progress Bar */
  .scroll-prog {
    position: fixed; top: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    z-index: 1000; width: 0%;
  }

  /* 3D Canvas Background */
  .canvas-wrapper {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 0;
    pointer-events: none;
  }

  /* Atmosphere / Grid */
  .bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: linear-gradient(rgba(0, 212, 255, .025) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 212, 255, .025) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); pointer-events: none; z-index: 0;
  }
  .o1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(0, 212, 255, .07), transparent 70%); top: -150px; left: -150px; }
  .o2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(123, 97, 255, .07), transparent 70%); top: 40%; right: -100px; }
  .o3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(255, 107, 53, .05), transparent 70%); bottom: 5%; left: 15%; }

  .content-layer {
    position: relative; z-index: 2;
  }

  /* Nav */
  .nav-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.4rem 4rem;
    background: rgba(2, 4, 8, .75); backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.3rem;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-links { display: flex; gap: 2.5rem; list-style: none; }
  .nav-links a {
    color: var(--muted); text-decoration: none; font-family: 'DM Mono', monospace;
    font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; transition: color .3s;
  }
  .nav-links a:hover { color: var(--accent); }

  /* Hero Section */
  .section-hero {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 0 4rem; position: relative;
  }
  .hero-content {
    max-width: 900px; text-align: center;
  }
  .h-eye {
    font-family: 'DM Mono', monospace; font-size: .72rem; color: var(--accent);
    letter-spacing: .2em; text-transform: uppercase; margin-bottom: 1.5rem;
    display: flex; align-items: center; justify-content: center; gap: 1rem;
  }
  .h-eye::before, .h-eye::after { content: ''; width: 36px; height: 1px; background: var(--accent); }
  .h-name {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(3.5rem, 11vw, 8rem);
    line-height: .9; letter-spacing: -.03em;
  }
  .h-name .l1 { display: block; color: var(--text); }
  .h-name .l2 {
    display: block;
    background: linear-gradient(135deg, var(--accent), var(--accent2) 50%, var(--accent3));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .h-sub {
    margin: 1.8rem auto 0 auto; font-size: 1rem; color: var(--muted);
    max-width: 600px; line-height: 1.8;
  }
  .h-ctas { margin-top: 2.5rem; display: flex; justify-content: center; gap: 1.2rem; flex-wrap: wrap; }
  .btn-p {
    padding: .85rem 2.2rem; background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #000; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .85rem;
    letter-spacing: .05em; border-radius: 3px; text-decoration: none; transition: transform .3s, box-shadow .3s;
  }
  .btn-p:hover { transform: translateY(-3px); box-shadow: 0 16px 50px rgba(0, 212, 255, .3); }
  .btn-o {
    padding: .85rem 2.2rem; background: transparent; color: var(--text); font-family: 'Syne', sans-serif;
    font-weight: 600; font-size: .85rem; letter-spacing: .05em; border: 1px solid var(--border);
    border-radius: 3px; text-decoration: none; transition: border-color .3s, color .3s, transform .3s;
  }
  .btn-o:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-3px); }

  .scroll-hint {
    position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: .8rem;
    font-family: 'DM Mono', monospace; font-size: .65rem; color: var(--muted);
  }
  .scroll-line { width: 1px; height: 45px; background: linear-gradient(var(--accent), transparent); animation: scrollBlink 2s infinite; }
  @keyframes scrollBlink { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }

  /* Marquee */
  .marquee-wrap {
    overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 1rem 0; background: var(--surface); position: relative; z-index: 2;
  }
  .marquee-track { display: flex; width: max-content; animation: marquee 22s linear infinite; }
  .marquee-item {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: .78rem; color: var(--muted);
    padding: 0 2.5rem; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap;
    display: flex; align-items: center; gap: 2.5rem;
  }
  .marquee-item::after { content: '✦'; color: var(--accent); font-size: .55rem; }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  /* Reusable inner section */
  .s-inner { max-width: 1200px; margin: 0 auto; padding: 7rem 4rem; }
  .s-label {
    font-family: 'DM Mono', monospace; font-size: .65rem; color: var(--accent);
    letter-spacing: .2em; text-transform: uppercase; margin-bottom: .8rem; display: flex; align-items: center; gap: .8rem;
  }
  .s-label::before { content: attr(data-n); color: var(--muted); }
  .s-title {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.2rem, 4.5vw, 4rem);
    line-height: 1; letter-spacing: -.02em; margin-bottom: 3.5rem;
  }
  .text-grad {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* Projects List (3D Flip Effect Area) */
  .section-projects { background: var(--surface); }
  .proj-list {
    display: flex; flex-direction: column; gap: 4rem; perspective: 1000px;
  }
  .proj-card-3d {
    background: var(--card); border: 1px solid var(--border); border-radius: 8px;
    padding: 3rem; transform-style: preserve-3d; will-change: transform, opacity;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    position: relative; overflow: hidden;
  }
  .proj-card-3d::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--accent2), transparent);
  }
  .proj-content { display: flex; gap: 3rem; align-items: flex-start; }
  .proj-num-big {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 5rem;
    color: rgba(0, 212, 255, .05); line-height: 1; margin-top: -1rem;
  }
  .proj-info { flex: 1; }
  .proj-title-big { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.8rem; line-height: 1.15; margin-bottom: .5rem; color: var(--text); }
  .proj-org-badge { font-family: 'DM Mono', monospace; font-size: .65rem; color: var(--accent3); letter-spacing: .07em; margin-bottom: 1.2rem; }
  .proj-desc-full { font-size: 1rem; color: rgba(232, 237, 245, .65); line-height: 1.8; margin-bottom: 1.5rem; }
  .proj-tags-row { display: flex; flex-wrap: wrap; gap: .5rem; }
  .pt {
    font-family: 'DM Mono', monospace; font-size: .65rem; padding: .3rem .8rem;
    border-radius: 2px; background: rgba(0, 212, 255, .06); border: 1px solid rgba(0, 212, 255, .14); color: var(--accent);
  }

  /* Footer */
  footer {
    padding: 1.8rem 4rem; border-top: 1px solid var(--border); display: flex;
    justify-content: space-between; align-items: center; position: relative; z-index: 2; background: var(--bg);
  }
  .ft { font-family: 'DM Mono', monospace; font-size: .65rem; color: var(--muted); }
  .fa { color: var(--accent); }

  @media(max-width: 900px) {
    .nav-links { display: none; }
    .s-inner { padding: 4rem 2rem; }
    .proj-content { flex-direction: column; gap: 1rem; }
    footer { flex-direction: column; gap: 1rem; text-align: center; }
  }
`;
