import { Suspense, useRef, useLayoutEffect, useEffect, useMemo, type ElementRef } from "react";
import { Canvas, useFrame, useLoader, useThree, invalidate } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useFBX,
  useProgress,
  Html,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";

const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
const deg2rad = (d: number) => (d * Math.PI) / 180;
const DECIDE = 8;
const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAG = 0.05;
const PARALLAX_EASE = 0.12;
const HOVER_MAG = deg2rad(6);
const HOVER_EASE = 0.15;

function Loader({ placeholderSrc }: { placeholderSrc?: string }) {
  const { progress, active } = useProgress();
  if (!active && placeholderSrc) return null;
  return (
    <Html center>
      {placeholderSrc ? (
        <img src={placeholderSrc} width={128} height={128} alt="" style={{ filter: "blur(8px)", borderRadius: 8 }} />
      ) : (
        `${Math.round(progress)} %`
      )}
    </Html>
  );
}

function DesktopControls({
  pivot,
  min,
  max,
  zoomEnabled,
}: {
  pivot: THREE.Vector3;
  min: number;
  max: number;
  zoomEnabled: boolean;
}) {
  const ref = useRef<ElementRef<typeof OrbitControls>>(null);
  useFrame(() => {
    if (ref.current) ref.current.target.copy(pivot);
  });
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableRotate={false}
      enableZoom={zoomEnabled}
      minDistance={min}
      maxDistance={max}
    />
  );
}

type ModelInnerProps = {
  content: THREE.Object3D;
  xOff: number;
  yOff: number;
  pivot: THREE.Vector3;
  initYaw: number;
  initPitch: number;
  minZoom: number;
  maxZoom: number;
  enableMouseParallax: boolean;
  enableManualRotation: boolean;
  enableHoverRotation: boolean;
  enableManualZoom: boolean;
  autoFrame: boolean;
  fadeIn: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  onLoaded?: () => void;
};

function ModelInner({
  content,
  xOff,
  yOff,
  pivot,
  initYaw,
  initPitch,
  minZoom,
  maxZoom,
  enableMouseParallax,
  enableManualRotation,
  enableHoverRotation,
  enableManualZoom,
  autoFrame,
  fadeIn,
  autoRotate,
  autoRotateSpeed,
  onLoaded,
}: ModelInnerProps) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const vel = useRef({ x: 0, y: 0 });
  const tPar = useRef({ x: 0, y: 0 });
  const cPar = useRef({ x: 0, y: 0 });
  const tHov = useRef({ x: 0, y: 0 });
  const cHov = useRef({ x: 0, y: 0 });

  const pivotW = useRef(new THREE.Vector3());

  useLayoutEffect(() => {
    const g = inner.current;
    if (!g) return;

    g.updateWorldMatrix(true, true);

    const sphere = new THREE.Box3().setFromObject(g).getBoundingSphere(new THREE.Sphere());
    const s = 1 / (sphere.radius * 2 || 1);
    g.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    g.scale.setScalar(s);

    g.traverse((o) => {
      const obj = o as THREE.Mesh;
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (fadeIn) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m && typeof m === "object" && "transparent" in m) {
              const mat = m as THREE.MeshStandardMaterial;
              mat.transparent = true;
              mat.opacity = 0;
            }
          });
        }
      }
    });

    g.getWorldPosition(pivotW.current);
    pivot.copy(pivotW.current);
    if (outer.current) outer.current.rotation.set(initPitch, initYaw, 0);

    if (autoFrame && camera instanceof THREE.PerspectiveCamera) {
      const persp = camera;
      const fitR = sphere.radius * s;
      /** إطار يضمن ظهور الكرة المحيطة كاملة مع نسبة العرض (الـ FOV في Three.js عمودي) */
      const padding = 1.42;
      const vFov = THREE.MathUtils.degToRad(persp.fov);
      const aspect = Math.max(persp.aspect || 1, 0.01);
      const tanHalfV = Math.tan(vFov / 2);
      const tanHalfH = tanHalfV * aspect;
      const dV = (fitR * padding) / tanHalfV;
      const dH = (fitR * padding) / tanHalfH;
      const d = Math.max(dV, dH);
      persp.position.set(pivotW.current.x, pivotW.current.y, pivotW.current.z + d);
      persp.near = Math.max(d / 200, 0.01);
      persp.far = d * 50;
      persp.updateProjectionMatrix();
      invalidate();
    }

    if (fadeIn) {
      let t = 0;
      const id = setInterval(() => {
        t += 0.05;
        const v = Math.min(t, 1);
        g.traverse((o) => {
          const obj = o as THREE.Mesh;
          if (obj.isMesh) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              if (m && typeof m === "object" && "opacity" in m) {
                (m as THREE.MeshStandardMaterial).opacity = v;
              }
            });
          }
        });
        invalidate();
        if (v === 1) {
          clearInterval(id);
          onLoaded?.();
        }
      }, 16);
      return () => clearInterval(id);
    }
    onLoaded?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scene setup once per content clone
  }, [content]);

  useEffect(() => {
    if (!enableManualRotation || isTouch) return;
    const el = gl.domElement;
    let drag = false;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      window.addEventListener("pointerup", up);
    };
    const move = (e: PointerEvent) => {
      if (!drag || !outer.current) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      outer.current.rotation.y += dx * ROTATE_SPEED;
      outer.current.rotation.x += dy * ROTATE_SPEED;
      vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
      invalidate();
    };
    const up = () => {
      drag = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl, enableManualRotation]);

  useEffect(() => {
    if (!isTouch) return;
    const el = gl.domElement;
    const pts = new Map<number, { x: number; y: number }>();

    let mode: "idle" | "decide" | "rotate" | "pinch" = "idle";
    let sx = 0;
    let sy = 0;
    let lx = 0;
    let ly = 0;
    let startDist = 0;
    let startZ = 0;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        mode = "decide";
        sx = lx = e.clientX;
        sy = ly = e.clientY;
      } else if (pts.size === 2 && enableManualZoom) {
        mode = "pinch";
        const vals = [...pts.values()];
        const p1 = vals[0];
        const p2 = vals[1];
        startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        startZ = camera.position.z;
        e.preventDefault();
      }
      invalidate();
    };

    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;

      if (mode === "decide") {
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) > DECIDE || Math.abs(dy) > DECIDE) {
          if (enableManualRotation && Math.abs(dx) > Math.abs(dy)) {
            mode = "rotate";
            el.setPointerCapture(e.pointerId);
          } else {
            mode = "idle";
            pts.clear();
          }
        }
      }

      if (mode === "rotate" && outer.current) {
        e.preventDefault();
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        lx = e.clientX;
        ly = e.clientY;
        outer.current.rotation.y += dx * ROTATE_SPEED;
        outer.current.rotation.x += dy * ROTATE_SPEED;
        vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
        invalidate();
      } else if (mode === "pinch" && pts.size === 2) {
        e.preventDefault();
        const vals = [...pts.values()];
        const p1 = vals[0];
        const p2 = vals[1];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const ratio = startDist / d;
        camera.position.z = THREE.MathUtils.clamp(startZ * ratio, minZoom, maxZoom);
        invalidate();
      }
    };

    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (mode === "rotate" && pts.size === 0) mode = "idle";
      if (mode === "pinch" && pts.size < 2) mode = "idle";
    };

    el.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl, enableManualRotation, enableManualZoom, minZoom, maxZoom, camera]);

  useEffect(() => {
    if (isTouch) return;
    const mm = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (enableMouseParallax) tPar.current = { x: -nx * PARALLAX_MAG, y: -ny * PARALLAX_MAG };
      if (enableHoverRotation) tHov.current = { x: ny * HOVER_MAG, y: nx * HOVER_MAG };
      invalidate();
    };
    window.addEventListener("pointermove", mm);
    return () => window.removeEventListener("pointermove", mm);
  }, [enableMouseParallax, enableHoverRotation]);

  useFrame((_, dt) => {
    if (!outer.current) return;
    let need = false;
    cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE;
    cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
    const phx = cHov.current.x;
    const phy = cHov.current.y;
    cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE;
    cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;

    const ndc = pivotW.current.clone().project(camera);
    ndc.x += xOff + cPar.current.x;
    ndc.y += yOff + cPar.current.y;
    outer.current.position.copy(ndc.unproject(camera));

    outer.current.rotation.x += cHov.current.x - phx;
    outer.current.rotation.y += cHov.current.y - phy;

    if (autoRotate) {
      outer.current.rotation.y += autoRotateSpeed * dt;
      need = true;
    }

    outer.current.rotation.y += vel.current.x;
    outer.current.rotation.x += vel.current.y;
    vel.current.x *= INERTIA;
    vel.current.y *= INERTIA;
    if (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4) need = true;

    if (
      Math.abs(cPar.current.x - tPar.current.x) > 1e-4 ||
      Math.abs(cPar.current.y - tPar.current.y) > 1e-4 ||
      Math.abs(cHov.current.x - tHov.current.x) > 1e-4 ||
      Math.abs(cHov.current.y - tHov.current.y) > 1e-4
    )
      need = true;

    if (need) invalidate();
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        <primitive object={content} />
      </group>
    </group>
  );
}

function GltfModel({
  url,
  innerProps,
}: {
  url: string;
  innerProps: Omit<ModelInnerProps, "content">;
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  return <ModelInner content={clone} {...innerProps} />;
}

function FbxModel({
  url,
  innerProps,
}: {
  url: string;
  innerProps: Omit<ModelInnerProps, "content">;
}) {
  const fbx = useFBX(url);
  const clone = useMemo(() => fbx.clone(), [fbx]);
  return <ModelInner content={clone} {...innerProps} />;
}

function ObjModel({
  url,
  innerProps,
}: {
  url: string;
  innerProps: Omit<ModelInnerProps, "content">;
}) {
  const obj = useLoader(OBJLoader, url);
  const clone = useMemo(() => obj.clone(), [obj]);
  return <ModelInner content={clone} {...innerProps} />;
}

function ModelByUrl({
  url,
  innerProps,
}: {
  url: string;
  innerProps: Omit<ModelInnerProps, "content">;
}) {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "glb" || ext === "gltf") return <GltfModel url={url} innerProps={innerProps} />;
  if (ext === "fbx") return <FbxModel url={url} innerProps={innerProps} />;
  if (ext === "obj") return <ObjModel url={url} innerProps={innerProps} />;
  console.error("ModelViewer: unsupported format:", ext);
  return null;
}

export type ModelViewerProps = {
  url: string;
  width?: number;
  height?: number;
  /** يملأ الحاوية الأم عند التفعيل */
  fill?: boolean;
  className?: string;
  modelXOffset?: number;
  modelYOffset?: number;
  defaultRotationX?: number;
  defaultRotationY?: number;
  defaultZoom?: number;
  minZoomDistance?: number;
  maxZoomDistance?: number;
  enableMouseParallax?: boolean;
  enableManualRotation?: boolean;
  enableHoverRotation?: boolean;
  enableManualZoom?: boolean;
  ambientIntensity?: number;
  keyLightIntensity?: number;
  fillLightIntensity?: number;
  rimLightIntensity?: number;
  environmentPreset?: "sunset" | "dawn" | "night" | "warehouse" | "forest" | "apartment" | "studio" | "city" | "park" | "lobby" | "none";
  autoFrame?: boolean;
  placeholderSrc?: string;
  showScreenshotButton?: boolean;
  fadeIn?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  onModelLoaded?: () => void;
};

export default function ModelViewer({
  url,
  width = 400,
  height = 400,
  fill = false,
  className,
  modelXOffset = 0,
  modelYOffset = 0,
  defaultRotationX = -50,
  defaultRotationY = 20,
  defaultZoom = 0.5,
  minZoomDistance = 0.5,
  maxZoomDistance = 10,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  enableManualZoom = true,
  ambientIntensity = 0.3,
  keyLightIntensity = 1,
  fillLightIntensity = 0.5,
  rimLightIntensity = 0.8,
  environmentPreset = "forest",
  autoFrame = false,
  placeholderSrc,
  showScreenshotButton = true,
  fadeIn = false,
  autoRotate = false,
  autoRotateSpeed = 0.35,
  onModelLoaded,
}: ModelViewerProps) {
  useEffect(() => {
    void useGLTF.preload(url);
  }, [url]);

  const pivot = useRef(new THREE.Vector3()).current;
  const contactRef = useRef<THREE.Group>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  const initYaw = deg2rad(defaultRotationX);
  const initPitch = deg2rad(defaultRotationY);
  const camZ = Math.min(Math.max(defaultZoom, minZoomDistance), maxZoomDistance);

  const innerProps = useMemo<Omit<ModelInnerProps, "content">>(
    () => ({
      xOff: modelXOffset,
      yOff: modelYOffset,
      pivot,
      initYaw,
      initPitch,
      minZoom: minZoomDistance,
      maxZoom: maxZoomDistance,
      enableMouseParallax,
      enableManualRotation,
      enableHoverRotation,
      enableManualZoom,
      autoFrame,
      fadeIn,
      autoRotate,
      autoRotateSpeed,
      onLoaded: onModelLoaded,
    }),
    [
      modelXOffset,
      modelYOffset,
      pivot,
      initYaw,
      initPitch,
      minZoomDistance,
      maxZoomDistance,
      enableMouseParallax,
      enableManualRotation,
      enableHoverRotation,
      enableManualZoom,
      autoFrame,
      fadeIn,
      autoRotate,
      autoRotateSpeed,
      onModelLoaded,
    ],
  );

  const capture = () => {
    const g = rendererRef.current;
    const s = sceneRef.current;
    const c = cameraRef.current;
    if (!g || !s || !c) return;
    g.shadowMap.enabled = false;
    const tmp: { l: THREE.Light; cast: boolean }[] = [];
    s.traverse((o) => {
      const light = o as THREE.DirectionalLight;
      if (light.isDirectionalLight && "castShadow" in light) {
        tmp.push({ l: light, cast: light.castShadow });
        light.castShadow = false;
      }
    });
    if (contactRef.current) contactRef.current.visible = false;
    g.render(s, c);
    const urlPNG = g.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = "model.png";
    a.href = urlPNG;
    a.click();
    g.shadowMap.enabled = true;
    tmp.forEach(({ l, cast }) => {
      (l as THREE.DirectionalLight).castShadow = cast;
    });
    if (contactRef.current) contactRef.current.visible = true;
    invalidate();
  };

  return (
    <div
      className={className}
      style={
        fill
          ? { width: "100%", height: "100%", minHeight: 0, touchAction: "pan-y pinch-zoom", position: "relative" }
          : { width, height, touchAction: "pan-y pinch-zoom", position: "relative" }
      }
    >
      {showScreenshotButton && (
        <button
          type="button"
          onClick={capture}
          className="absolute right-4 top-4 z-10 cursor-pointer rounded-lg border border-primary/40 bg-background/80 px-3 py-1.5 font-display text-xs text-foreground shadow-md backdrop-blur-sm transition hover:bg-background"
        >
          لقطة شاشة
        </button>
      )}

      <Canvas
        shadows
        frameloop="demand"
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl: renderer, scene, camera }) => {
          rendererRef.current = renderer;
          sceneRef.current = scene;
          cameraRef.current = camera;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        }}
        camera={{ fov: 50, position: [0, 0, camZ], near: 0.01, far: 100 }}
        style={{ touchAction: "pan-y pinch-zoom", width: "100%", height: "100%" }}
      >
        {environmentPreset !== "none" && <Environment preset={environmentPreset} background={false} />}

        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={keyLightIntensity} castShadow />
        <directionalLight position={[-5, 2, 5]} intensity={fillLightIntensity} />
        <directionalLight position={[0, 4, -5]} intensity={rimLightIntensity} />

        <ContactShadows ref={contactRef} position={[0, -0.5, 0]} opacity={0.35} scale={10} blur={2} />

        <Suspense fallback={<Loader placeholderSrc={placeholderSrc} />}>
          <ModelByUrl url={url} innerProps={innerProps} />
        </Suspense>

        {!isTouch && (
          <DesktopControls pivot={pivot} min={minZoomDistance} max={maxZoomDistance} zoomEnabled={enableManualZoom} />
        )}
      </Canvas>
    </div>
  );
}
