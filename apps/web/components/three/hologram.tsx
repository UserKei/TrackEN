"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function Hologram() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();
    const camera = new THREE.PerspectiveCamera(75, 500 / 250, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const loader = new GLTFLoader();
    loader.load("/models/hologram/scene.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(4, 4, 4);
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
      }
    });

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      precision: "highp",
      powerPreference: "high-performance",
    });
    renderer.setSize(500, 250);
    const controls = new OrbitControls(camera, renderer.domElement);
    let animationFrame = 0;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      mixer?.update(clock.getDelta());
      scene.rotation.y += 0.002;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-[250px] w-[500px] max-w-full" />;
}
