"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Button } from "@/components/ui/button";

type LoginType = "login" | "register";

export function LoginModelViewer({
  type,
  onChangeType,
}: {
  type: LoginType;
  onChangeType: (type: LoginType) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const currentModelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const clock = new THREE.Clock();
    const width = canvas.clientWidth || 760;
    const height = canvas.clientHeight || 680;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(1, 0.5, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      precision: "highp",
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    const controls = new OrbitControls(camera, renderer.domElement);
    let animationFrame = 0;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      mixerRef.current?.update(clock.getDelta());
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
      sceneRef.current = null;
      currentModelRef.current = null;
      mixerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (currentModelRef.current) {
      scene.remove(currentModelRef.current);
      currentModelRef.current = null;
    }
    mixerRef.current = null;
    const loader = new GLTFLoader();
    loader.load(`/models/${type}/scene.gltf`, (gltf) => {
      currentModelRef.current = gltf.scene;
      scene.add(gltf.scene);
      scene.position.y = -0.8;
      gltf.scene.scale.set(0.8, 0.8, 0.8);
      if (type === "register" && gltf.animations.length > 0) {
        mixerRef.current = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => mixerRef.current?.clipAction(clip).play());
      }
    });
  }, [type]);

  return (
    <div className="relative hidden bg-[radial-gradient(circle_at_top_left,oklch(0.55_0.19_260),oklch(0.22_0.03_260)_45%,oklch(0.16_0.02_260))] md:block">
      <canvas ref={canvasRef} className="size-full" />
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <div className="grid size-10 place-items-center rounded-lg bg-primary text-xl font-black text-primary-foreground">
          E
        </div>
        <span className="text-xl font-black text-white">English App</span>
      </div>
      <div className="absolute right-6 top-6 flex rounded-lg bg-white/10 p-1 backdrop-blur">
        <Button
          variant={type === "login" ? "secondary" : "ghost"}
          size="sm"
          className="text-white data-[variant=secondary]:text-foreground"
          onClick={() => onChangeType("login")}
        >
          登录
        </Button>
        <Button
          variant={type === "register" ? "secondary" : "ghost"}
          size="sm"
          className="text-white data-[variant=secondary]:text-foreground"
          onClick={() => onChangeType("register")}
        >
          注册
        </Button>
      </div>
    </div>
  );
}
