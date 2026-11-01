import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import IsometricRoomScene, { IS_MOBILE } from './IsometricRoomScene';

/* Timeline (seconds)
   0.0 - 11.0  camera glides along one continuous curve from outside the gate
               into the studio (smootherstep, zero speed at both ends)
   1.2 - 5.0   gate leaves part from the centre and swing inward
   11.0+       visitor is inside: gate closes behind them over CLOSE_TIME
   The gate starts closed and stays closed whenever the page loads. */
const T_TOTAL = 11;
const DOOR_START = 1.2;
const DOOR_TIME = 3.8;
const CLOSE_TIME = 2.6;

const POS = [[0, 1.5, 8.0], [0, 1.48, 6.2], [0, 1.45, 4.8], [0, 1.38, 3.4], [0, 1.28, 1.6], [0, 1.18, -0.2]];
const LOOK = [[0, 1.35, 3.6], [0, 1.3, 3.0], [0, 1.25, 1.5], [0, 1.15, -1.0], [0, 1.05, -2.5], [0, 1.0, -3.0]];
const REST = new THREE.Vector3(0, 1.18, -0.2);
const FOCUS = new THREE.Vector3(0, 1.0, -3.0);

/* ---------- performance / device tuning (design is untouched) ---------- */
const ON_DEMAND = true; // render only when something moves. Set false to go back to a constant 60 fps loop.
const LOG_DEPTH = !IS_MOBILE; // log depth buffer is heavy on mobile GPUs. Set true if you ever see z-fighting on phones.
const DPR_RANGE = IS_MOBILE ? [1, 1.25] : [1, 1.5];
const MIN_DPR = 0.7; // adaptive resolution never drops below this

/* Portrait screens see a much narrower horizontal view with the same FOV, so widen it a bit. */
const BASE_FOV = 48;
const PORTRAIT_FOV = 70;

const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const fovFor = (aspect) =>
  aspect >= 1 ? BASE_FOV : THREE.MathUtils.lerp(BASE_FOV, PORTRAIT_FOV, clamp01((1 - aspect) / 0.5));

/* Lets code outside the Canvas (scroll / pointer listeners) wake the on-demand render loop. */
function WakeBridge({ target }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    target.current = invalidate;
    return () => { target.current = null; };
  }, [invalidate, target]);
  return null;
}

/* Adaptive resolution: if the device can't hold ~45 fps, quietly lower the pixel ratio (never below MIN_DPR). */
function PerfGovernor() {
  const acc = useRef({ t: 0, n: 0, warm: 0 });
  useFrame((state, delta) => {
    if (delta > 0.1) return; // idle gap / tab switch / texture upload hitch
    const a = acc.current;
    if (a.warm < 90) { a.warm += 1; return; } // ignore start-up frames
    a.t += delta;
    a.n += 1;
    if (a.n < 45) return;
    const avg = a.t / a.n;
    a.t = 0;
    a.n = 0;
    if (avg > 1 / 42) {
      const cur = state.viewport.dpr;
      if (cur > MIN_DPR + 0.01) state.setDpr(Math.max(MIN_DPR, cur * 0.85));
    }
  });
  return null;
}

function EntranceDirectorCamera({ doorOpenProgress, isInsideRoom, lightFactor, onWalkthroughDone }) {
  const time = useRef(0);
  // -1 = gate not yet closing (intro running or skipped), otherwise seconds since the close began
  const closeTime = useRef(-1);
  const notified = useRef(false);
  const doneCb = useRef(onWalkthroughDone);
  doneCb.current = onWalkthroughDone;

  const { posCurve, lookCurve, look } = useMemo(() => {
    const mk = (pts) => {
      const c = new THREE.CatmullRomCurve3(pts.map((a) => new THREE.Vector3(...a)), false, 'centripetal');
      c.arcLengthDivisions = 400;
      return c;
    };
    return { posCurve: mk(POS), lookCurve: mk(LOOK), look: new THREE.Vector3() };
  }, []);

  useFrame((state, delta) => {
    const cam = state.camera;
    const dt = Math.min(delta, 1 / 30); // a stalled tab never causes a camera jump

    // Responsive FOV (portrait phones get a wider view so the gate / room are not cropped)
    const fov = fovFor(state.size.width / Math.max(state.size.height, 1));
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    if (!isInsideRoom.current) {
      // ---------- INTRO ----------
      time.current += dt;
      const k = clamp01(time.current / T_TOTAL);
      const u = smoother(k);

      doorOpenProgress.current = easeInOutCubic(clamp01((time.current - DOOR_START) / DOOR_TIME));
      lightFactor.current = 0.5 + 0.5 * u;

      posCurve.getPointAt(u, cam.position);
      lookCurve.getPointAt(u, look);
      cam.lookAt(look);

      state.invalidate(2); // intro always animates

      if (k >= 1) {
        isInsideRoom.current = true;
        lightFactor.current = 1;
        closeTime.current = 0; // the gate starts closing behind the visitor
        if (!notified.current) {
          notified.current = true;
          doneCb.current?.();
        }
      }
    } else {
      // ---------- SEATED ----------
      if (closeTime.current >= 0 && closeTime.current < CLOSE_TIME) {
        closeTime.current = Math.min(closeTime.current + dt, CLOSE_TIME);
      }
      if (closeTime.current >= 0) {
        doorOpenProgress.current = 1 - easeInOutCubic(closeTime.current / CLOSE_TIME);
      }
      let active = closeTime.current >= 0 && closeTime.current < CLOSE_TIME;

      lightFactor.current = THREE.MathUtils.damp(lightFactor.current, 1, 4, dt);
      if (Math.abs(1 - lightFactor.current) > 1e-3) active = true;

      const tx = state.pointer.x * 0.2;
      const ty = REST.y + state.pointer.y * 0.08;
      cam.position.x = THREE.MathUtils.damp(cam.position.x, tx, 3.5, dt);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, ty, 3.5, dt);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, REST.z, 3.5, dt);
      cam.lookAt(FOCUS);

      if (
        Math.abs(cam.position.x - tx) > 5e-4 ||
        Math.abs(cam.position.y - ty) > 5e-4 ||
        Math.abs(cam.position.z - REST.z) > 5e-4
      ) active = true;

      if (active) state.invalidate(2);
    }
  });

  return null;
}

export default function BackgroundExperience({ onIntroComplete, isIntroSkipped }) {
  const scrollProgress = useRef(0);
  const doorOpenProgress = useRef(0);
  const isInsideRoom = useRef(!!isIntroSkipped);
  const lightFactor = useRef(isIntroSkipped ? 1 : 0.5); // ref, not state: no React re-renders per frame
  const wake = useRef(null); // filled by <WakeBridge/> with the canvas' invalidate()
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (isIntroSkipped) {
      // Skipping lands the visitor inside with the gate already closed.
      isInsideRoom.current = true;
      doorOpenProgress.current = 0;
      lightFactor.current = 1;
      wake.current?.();
    }
  }, [isIntroSkipped]);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
      else gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setHasWebGL(false);
    }
  }, []);

  useEffect(() => {
    // scrollHeight is cached (reading it on every scroll event forces a layout every time)
    let total = 0;
    const measure = () => {
      total = document.documentElement.scrollHeight - window.innerHeight;
    };
    const update = () => {
      scrollProgress.current = total > 0 ? clamp01(window.scrollY / total) : 0;
      wake.current?.();
    };
    const onResize = () => {
      measure();
      update();
    };
    const onPointer = () => wake.current?.();

    measure();
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });

    // page height changes when images/sections load: keep the cached value fresh
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    ro?.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      ro?.disconnect();
    };
  }, []);

  if (!hasWebGL) return null;

  const initialAspect = typeof window !== 'undefined' ? window.innerWidth / Math.max(window.innerHeight, 1) : 16 / 9;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        contain: 'strict',
        backgroundColor: '#0b0907',
      }}
    >
      <Canvas
        frameloop={ON_DEMAND ? 'demand' : 'always'}
        dpr={DPR_RANGE}
        camera={{ position: POS[0], fov: fovFor(initialAspect), near: 0.25, far: 60 }}
        eventSource={document.body} /* pointer parallax works even with pointerEvents: none */
        eventPrefix="client"
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          powerPreference: IS_MOBILE ? 'default' : 'high-performance',
          logarithmicDepthBuffer: LOG_DEPTH, // removes depth-precision z-fighting (kept on desktop)
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        onCreated={({ gl, invalidate }) => {
          // Mobile browsers can drop the GL context when the tab is backgrounded: allow a clean restore.
          const el = gl.domElement;
          el.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
          el.addEventListener('webglcontextrestored', () => invalidate(), false);
        }}
      >
        <color attach="background" args={['#0b0907']} />
        <fog attach="fog" args={['#0b0907', 14, 34]} />

        <WakeBridge target={wake} />
        <PerfGovernor />

        <EntranceDirectorCamera
          doorOpenProgress={doorOpenProgress}
          isInsideRoom={isInsideRoom}
          lightFactor={lightFactor}
          onWalkthroughDone={onIntroComplete}
        />

        <Suspense fallback={null}>
          <IsometricRoomScene
            scrollProgress={scrollProgress}
            doorOpenProgress={doorOpenProgress}
            isInsideRoom={isInsideRoom}
            lightFactor={lightFactor}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}