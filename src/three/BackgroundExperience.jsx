import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import IsometricRoomScene from './IsometricRoomScene';

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

const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

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

      lightFactor.current = THREE.MathUtils.damp(lightFactor.current, 1, 4, dt);
      const tx = state.pointer.x * 0.2;
      const ty = REST.y + state.pointer.y * 0.08;
      cam.position.x = THREE.MathUtils.damp(cam.position.x, tx, 3.5, dt);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, ty, 3.5, dt);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, REST.z, 3.5, dt);
      cam.lookAt(FOCUS);
    }
  });

  return null;
}

export default function BackgroundExperience({ onIntroComplete, isIntroSkipped }) {
  const scrollProgress = useRef(0);
  const doorOpenProgress = useRef(0);
  const isInsideRoom = useRef(!!isIntroSkipped);
  const lightFactor = useRef(isIntroSkipped ? 1 : 0.5); // ref, not state: no React re-renders per frame
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (isIntroSkipped) {
      // Skipping lands the visitor inside with the gate already closed.
      isInsideRoom.current = true;
      doorOpenProgress.current = 0;
      lightFactor.current = 1;
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

    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = total > 0 ? clamp01(window.scrollY / total) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!hasWebGL) return null;

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
        backgroundColor: '#0b0907',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: POS[0], fov: 48, near: 0.25, far: 60 }}
        eventSource={document.body} /* pointer parallax works even with pointerEvents: none */
        eventPrefix="client"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          logarithmicDepthBuffer: true, // removes depth-precision z-fighting (the entrance flicker)
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <color attach="background" args={['#0b0907']} />
        <fog attach="fog" args={['#0b0907', 14, 34]} />

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
