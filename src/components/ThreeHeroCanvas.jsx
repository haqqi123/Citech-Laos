import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeHeroCanvas = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 6;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Geometry 1: Core Torus Knot (Glassy/Metallic Organic Shape)
    const coreGeometry = new THREE.TorusKnotGeometry(1.6, 0.48, 220, 32, 3, 5);
    
    // Premium Metallic & Glass Physical Material
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,           // Blue base
      emissive: 0x090514,        // Dark purple glow
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.4,         // Glass transluency
      thickness: 1.8,            // Refraction depth
      ior: 1.65,                 // Index of refraction
      flatShading: false,
      side: THREE.DoubleSide,
    });
    
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Geometry 2: Outer Crystalline Wireframe Sphere
    const outerGeometry = new THREE.IcosahedronGeometry(3.2, 3);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,           // Purple wireframe
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);
    scene.add(outerMesh);

    // Geometry 3: Particle system cluster
    const particlesCount = 80;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Random coordinates in a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.5 + Math.random() * 2.0; // Distance from center
      
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,           // Cyan particles
      size: 0.08,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Studio Spotlight (follows mouse coordinates)
    const spotLight = new THREE.PointLight(0xffffff, 15, 50);
    spotLight.position.set(5, 5, 8);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Purple Fill Light
    const fillLight = new THREE.PointLight(0x7c3aed, 25, 30);
    fillLight.position.set(-6, 3, 3);
    scene.add(fillLight);

    // Blue Rim Light
    const rimLight = new THREE.PointLight(0x2563eb, 30, 35);
    rimLight.position.set(2, -6, -4);
    scene.add(rimLight);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      // Normalized coordinates from -1 to 1
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Autorotation + mouse tilt
      coreMesh.rotation.y = elapsedTime * 0.15 + mouseX * 0.4;
      coreMesh.rotation.x = elapsedTime * 0.08 + mouseY * 0.4;
      coreMesh.rotation.z = elapsedTime * 0.05;

      outerMesh.rotation.y = -elapsedTime * 0.05 - mouseX * 0.2;
      outerMesh.rotation.x = -elapsedTime * 0.03 - mouseY * 0.2;

      particleSystem.rotation.y = elapsedTime * 0.02 + mouseX * 0.1;

      // Pulse thickness and opacity subtly
      coreMaterial.thickness = 1.6 + Math.sin(elapsedTime * 2.0) * 0.35;
      particlesMaterial.opacity = 0.35 + Math.sin(elapsedTime * 1.5) * 0.15;

      // Move key spotLight based on mouse
      spotLight.position.x = 5 + mouseX * 8;
      spotLight.position.y = 5 + mouseY * 8;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose resources
      coreGeometry.dispose();
      coreMaterial.dispose();
      outerGeometry.dispose();
      outerMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
};

export default ThreeHeroCanvas;
