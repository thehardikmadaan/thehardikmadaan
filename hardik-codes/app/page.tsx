"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// 3D Cartoonist Airplane Model
const CartoonAirplane = () => {
  // Ensure you have a cartoonist airplane model at this path
  const { scene } = useGLTF('/cartoon-airplane.glb');
  const airplaneRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (airplaneRef.current) {
      // Add some playful movement
      airplaneRef.current.position.y += Math.sin(clock.getElapsedTime() * 2) * 0.005;
      airplaneRef.current.rotation.z = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return <primitive ref={airplaneRef} object={scene} scale={0.5} position={[0, 1, 0]} />;
};

const Page = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const airplaneRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Airplane scroll animation
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          if (airplaneRef.current) {
            const progress = self.progress;
            airplaneRef.current.rotation.y = progress * Math.PI * 4;
            airplaneRef.current.position.z = 5 + progress * 15;
            airplaneRef.current.position.x = -2 + progress * 4;
          }
        },
      });

      // Project cards 3D flip animation
      gsap.utils.toArray<HTMLElement>('.project-card').forEach((card) => {
        gsap.fromTo(
          card,
          {
            autoAlpha: 0,
            y: 150,
            rotationX: -80,
            transformOrigin: 'center bottom',
          },
          {
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Animate other sections
      gsap.utils.toArray<HTMLElement>('.rv').forEach((elem) => {
        gsap.from(elem, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="container">
      {/* 3D Canvas */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0 }}>
        <Canvas camera={{ position: [0, 2, 10], fov: 75 }}>
          <ambientLight intensity={2.5} />
          <pointLight position={[15, 15, 15]} intensity={1.5} />
          <React.Suspense fallback={null}>
            <group ref={airplaneRef}>
              <CartoonAirplane />
            </group>
          </React.Suspense>
          {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
        </Canvas>
      </div>

      {/* Hero Section */}
      <section id="hero">
        <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div className="h-eye">Aerospace &amp; AI Engineer · Darmstadt, Germany</div>
          <h1 className="h-name"><span className="l1">Hardik</span><span className="l2">Madaan</span></h1>
          <p className="h-sub">M.Sc. Aerospace Engineering at TU Darmstadt. Building safety-critical AI systems, ML pipelines &amp; intelligent flight interfaces where aerospace meets machine intelligence.</p>
          <div className="h-ctas"><a href="#projects" className="btn-p">View Projects</a><a href="#contact" className="btn-o">Get in Touch</a></div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--bg)' }}>
        <div className="marquee-wrap">
          <div className="marquee-track">
            <span className="marquee-item">Machine Learning</span><span className="marquee-item">Aerospace Engineering</span>
            <span className="marquee-item">HMI Design</span><span className="marquee-item">Safety-Critical AI</span>
            <span className="marquee-item">MLOps · DVC · MLflow</span><span className="marquee-item">Flight Systems</span>
          </div>
        </div>

        {/* Projects Section */}
        <section id="projects" className="s-inner">
          <div className="s-label rv" data-n="03">Project Showcase</div>
          <h2 className="s-title rv d1">Interactive<br/>code &amp; results.</h2>
          <div className="project-grid">
            <div className="project-card rv">
              <h3>PHM System</h3>
              <p>End-to-end ML pipeline predicting engine Remaining Useful Life (RUL).</p>
            </div>
            <div className="project-card rv">
              <h3>Simulator GUI</h3>
              <p>Modular GUI for single-pilot cockpit operations built with PySide6.</p>
            </div>
            <div className="project-card rv">
              <h3>Runway Safety</h3>
              <p>Processed 30 years of runway incursion data to find collision avoidance patterns.</p>
            </div>
            <div className="project-card rv">
              <h3>Mower Control</h3>
              <p>Active stabilisation control logic for a mechatronic mowing system.</p>
            </div>
          </div>
        </section>

        {/* Other sections can be added here following the same pattern */}

      </main>

      <style jsx global>{`
        :root {
          --bg: #020408;
          --surface: #060c14;
          --card: #0a111c;
          --accent: #00d4ff;
          --accent2: #7b61ff;
          --text: #e8edf5;
          --muted: #4a5a70;
          --border: rgba(0, 212, 255, 0.1);
        }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }
        #hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 2rem;
        }
        .h-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(3.5rem, 11vw, 9.5rem);
          line-height: .9;
        }
        .h-name .l2 {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .h-sub {
          margin-top: 1.5rem;
          font-size: 1rem;
          color: var(--muted);
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .s-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 7rem 4rem;
        }
        .s-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          margin-bottom: 3.5rem;
        }
        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        .project-card {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 8px;
          color: var(--text);
          /* Important for GSAP transform */
          transform-style: preserve-3d;
        }
        .project-card h3 {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          color: var(--accent);
          margin-bottom: 1rem;
        }
        .project-card p {
          color: var(--muted);
        }
        .rv {
          opacity: 0; /* Initially hidden for GSAP */
        }
        /* Add other styles from your original file as needed */
      `}</style>
    </div>
  );
};

export default Page;