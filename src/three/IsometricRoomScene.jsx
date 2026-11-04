import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ============================================================================
   HAZIQ STUDIO — WARM HERITAGE WORKSPACE
   A warm, cinematic studio palette: natural oak, honeyed walnut, ivory limewash,
   muted sage, dusty blue and softly aged brass.
   Units are metres. Floor top = y 0. Gate wall sits at z = +3.6.
   ========================================================================== */

/* ---------- device profile (used for quality tuning only, never for design) ---------- */
export const IS_MOBILE =
  typeof window !== 'undefined' &&
  (!!window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768);
const ANISO = IS_MOBILE ? 4 : 8;

/* ---------- gate dimensions (single source of truth) ---------- */
const OPENING_HALF = 1.2; // clear opening is 2.4 m wide, centred on x = 0
const HINGE_X = OPENING_HALF + 0.03; // hinge is buried 3 cm inside the jamb: no coplanar contact
const DOOR_W = 1.24; // each leaf overlaps the other by 2 cm at the centre (staggered in depth, so no seam flicker)
const DOOR_H = 3.0;
const DOOR_Y = 0.07; // sits just above the stone threshold
const OPEN_ANGLE = 1.65; // about 95 degrees, swings into the studio

/* ---------- tiny helpers ---------- */
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};
const toTex = (c, repeat) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = ANISO;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
};
const spaced = (x, text, cx, y, gap) => {
  const chars = [...text];
  const w = chars.map((ch) => x.measureText(ch).width);
  let px = cx - (w.reduce((a, b) => a + b, 0) + gap * (chars.length - 1)) / 2;
  x.textAlign = 'left';
  chars.forEach((ch, i) => {
    x.fillText(ch, px, y);
    px += w[i] + gap;
  });
};
const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
const MONO = '"JetBrains Mono", Consolas, monospace';

/* ---------- procedural textures (generated once) ---------- */
function woodCanvas(base, dark, light, seed) {
  const [c, x] = mk(512, 1024);
  const r = rng(seed);
  x.fillStyle = base;
  x.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 280; i++) {
    const px = r() * 512;
    const ph = r() * 6;
    const amp = 2 + r() * 6;
    x.strokeStyle = r() > 0.45 ? dark : light;
    x.globalAlpha = 0.05 + r() * 0.15;
    x.lineWidth = 0.6 + r() * 2.4;
    x.beginPath();
    x.moveTo(px, 0);
    for (let y = 0; y <= 1024; y += 32) x.lineTo(px + Math.sin(y * 0.012 + ph) * amp, y);
    x.stroke();
  }
  x.globalAlpha = 1;
  return c;
}

/* Gate oak: broad, soft grain only. Fine hairlines shimmer when the camera moves at grazing angles. */
function gateWoodCanvas() {
  const [c, x] = mk(512, 1024);
  const r = rng(31);
  x.fillStyle = '#654a32';
  x.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 60; i++) {
    const px = r() * 512;
    const ph = r() * 6;
    const amp = 3 + r() * 5;
    x.strokeStyle = r() > 0.5 ? '#493522' : '#806044';
    x.globalAlpha = 0.08 + r() * 0.06;
    x.lineWidth = 3 + r() * 4;
    x.beginPath();
    x.moveTo(px, 0);
    for (let y = 0; y <= 1024; y += 64) x.lineTo(px + Math.sin(y * 0.008 + ph) * amp, y);
    x.stroke();
  }
  x.globalAlpha = 1;
  return c;
}

function plasterCanvas(base, seed) {
  const [c, x] = mk(256, 256);
  const r = rng(seed);
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) {
    x.fillStyle = r() > 0.5 ? '#000' : '#fff';
    x.globalAlpha = 0.02 + r() * 0.05;
    x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3);
  }
  x.globalAlpha = 1;
  return c;
}

function floorCanvas() {
  const [c, x] = mk(1024, 1024);
  const r = rng(77);
  const tones = ['#927354', '#806348', '#a18462', '#765a40', '#8b6d4e'];
  for (let row = 0; row < 32; row++) {
    const cuts = [0, 1024];
    for (let i = 0, n = 2 + Math.floor(r() * 3); i < n; i++) cuts.push(Math.floor(r() * 30) * 32 + 32);
    const pts = [...new Set(cuts)].sort((a, b) => a - b);
    for (let i = 0; i < pts.length - 1; i++) {
      const px = pts[i], pw = pts[i + 1] - px, py = row * 32;
      x.fillStyle = tones[Math.floor(r() * tones.length)];
      x.fillRect(px, py, pw, 32);
      x.strokeStyle = '#493724';
      x.globalAlpha = 0.12;
      x.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        const gy = py + 4 + r() * 24;
        x.beginPath();
        x.moveTo(px, gy);
        x.lineTo(px + pw, gy + (r() - 0.5) * 3);
        x.stroke();
      }
      x.globalAlpha = 0.55;
      x.strokeStyle = '#493724';
      x.lineWidth = 2;
      x.strokeRect(px, py, pw, 32);
      x.globalAlpha = 1;
    }
  }
  return c;
}

function rugCanvas() {
  const [c, x] = mk(512, 384);
  const inset = (n, col) => {
    x.fillStyle = col;
    x.fillRect(n, n, 512 - n * 2, 384 - n * 2);
  };
  inset(0, '#596354');
  inset(14, '#d8c9a8');
  inset(26, '#788797');
  inset(46, '#596354');
  x.strokeStyle = '#c5ad7e';
  x.lineWidth = 2;
  for (let gx = 96; gx <= 416; gx += 40)
    for (let gy = 84; gy <= 300; gy += 36) {
      x.beginPath();
      x.moveTo(gx, gy - 14); x.lineTo(gx + 16, gy); x.lineTo(gx, gy + 14); x.lineTo(gx - 16, gy);
      x.closePath();
      x.stroke();
    }
  const dia = (rx, ry, col) => {
    x.fillStyle = col;
    x.beginPath();
    x.moveTo(256, 192 - ry); x.lineTo(256 + rx, 192); x.lineTo(256, 192 + ry); x.lineTo(256 - rx, 192);
    x.closePath();
    x.fill();
  };
  dia(130, 96, '#788797');
  dia(100, 72, '#d8c9a8');
  dia(70, 50, '#596354');
  dia(34, 24, '#788797');
  return c;
}

/* Framed artwork: original abstract graphic compositions, no quotes or typography. */
function graphicArtCanvas(w, h, style = 0) {
  const [c, x] = mk(w, h);
  const palettes = [
    ['#e7ddc8', '#758477', '#b88c61', '#344b48', '#d2b995'],
    ['#e9dfcc', '#526b70', '#c18d69', '#a7a58b', '#343c3b'],
    ['#e8dfcf', '#8c705c', '#d1b68c', '#65786c', '#3f514d'],
    ['#e5dcc9', '#6c7c88', '#b88d69', '#d0bd9b', '#48564e'],
    ['#e9dfcc', '#596b59', '#b58a63', '#8d7666', '#d0c3a7'],
  ];
  const [paper, a, b, d, ink] = palettes[style % palettes.length];
  x.fillStyle = paper;
  x.fillRect(0, 0, w, h);

  // Subtle paper grain and a restrained gallery-style border.
  const r = rng(900 + style * 37 + w);
  for (let i = 0; i < Math.floor(w * h / 180); i++) {
    x.fillStyle = r() > 0.5 ? '#fff' : '#594a39';
    x.globalAlpha = 0.025 + r() * 0.035;
    x.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  x.globalAlpha = 1;
  x.strokeStyle = '#8b7658';
  x.lineWidth = Math.max(2, w * 0.006);
  x.strokeRect(w * 0.045, h * 0.035, w * 0.91, h * 0.93);

  const circle = (cx, cy, radius, color, alpha = 1) => {
    x.globalAlpha = alpha;
    x.fillStyle = color;
    x.beginPath();
    x.arc(cx, cy, radius, 0, Math.PI * 2);
    x.fill();
    x.globalAlpha = 1;
  };
  const polygon = (pts, color, alpha = 1) => {
    x.globalAlpha = alpha;
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([px, py]) => x.lineTo(px, py));
    x.closePath();
    x.fill();
    x.globalAlpha = 1;
  };

  if (style % 5 === 0) {
    // Organic arch + overlapping sun discs.
    x.fillStyle = a;
    x.beginPath();
    x.arc(w * 0.5, h * 0.68, Math.min(w, h) * 0.34, Math.PI, 0);
    x.lineTo(w * 0.84, h * 0.88); x.lineTo(w * 0.16, h * 0.88); x.closePath(); x.fill();
    circle(w * 0.66, h * 0.34, Math.min(w, h) * 0.16, b);
    circle(w * 0.34, h * 0.48, Math.min(w, h) * 0.12, d, 0.9);
    polygon([[w*.16,h*.78],[w*.5,h*.55],[w*.84,h*.78],[w*.84,h*.88],[w*.16,h*.88]], ink, .7);
  } else if (style % 5 === 1) {
    // Architectural blocks and a fine circular motif.
    polygon([[w*.12,h*.18],[w*.55,h*.18],[w*.55,h*.82],[w*.12,h*.82]], a);
    polygon([[w*.55,h*.34],[w*.86,h*.34],[w*.86,h*.82],[w*.55,h*.82]], b);
    circle(w*.55,h*.34,Math.min(w,h)*.2,d,.92);
    x.strokeStyle = ink; x.lineWidth = Math.max(2,w*.008);
    x.beginPath(); x.arc(w*.55,h*.34,Math.min(w,h)*.28,0,Math.PI*2); x.stroke();
  } else if (style % 5 === 2) {
    // Layered topographic curves.
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      x.strokeStyle = [a,b,d,ink][i%4];
      x.globalAlpha = .72;
      x.lineWidth = Math.max(2,w*.006);
      x.ellipse(w*.5, h*.55, w*(.18+i*.035), h*(.13+i*.055), -.22, Math.PI*1.05, Math.PI*1.95);
      x.stroke();
    }
    x.globalAlpha = 1;
    circle(w*.5,h*.48,Math.min(w,h)*.105,b);
  } else if (style % 5 === 3) {
    // Bold diagonal geometry with a warm focal circle.
    polygon([[w*.12,h*.16],[w*.72,h*.16],[w*.42,h*.84],[w*.12,h*.84]], a);
    polygon([[w*.72,h*.16],[w*.88,h*.36],[w*.58,h*.84],[w*.42,h*.84]], b);
    circle(w*.62,h*.42,Math.min(w,h)*.16,d);
    x.strokeStyle = ink; x.lineWidth = Math.max(2,w*.009);
    x.beginPath(); x.moveTo(w*.16,h*.72); x.lineTo(w*.82,h*.28); x.stroke();
  } else {
    // Minimal botanical / sculptural composition.
    x.strokeStyle = a; x.lineWidth = Math.max(3,w*.018);
    x.beginPath(); x.moveTo(w*.5,h*.82); x.bezierCurveTo(w*.45,h*.58,w*.56,h*.4,w*.5,h*.16); x.stroke();
    for (let i=0;i<5;i++) {
      const yy=h*(.28+i*.11), side=i%2===0?-1:1;
      x.fillStyle = i%2===0?b:d;
      x.beginPath(); x.ellipse(w*.5+side*w*.13,yy,w*.13,h*.055,side*.45,0,Math.PI*2); x.fill();
    }
    circle(w*.5,h*.18,Math.min(w,h)*.09,ink,.9);
  }
  return c;
}

/* Nameplate: dark walnut plate, brass rule, engraved title. */
function plaqueCanvas(title, sub) {
  const [c, x] = mk(768, 256);
  x.fillStyle = '#44382b';
  x.fillRect(0, 0, 768, 256);
  x.strokeStyle = '#b39a6b';
  x.lineWidth = 6;
  x.strokeRect(14, 14, 740, 228);
  x.lineWidth = 2;
  x.strokeRect(28, 28, 712, 200);
  x.fillStyle = '#eee5d2';
  x.font = `700 100px ${SERIF}`;
  spaced(x, title, 384, 140, 18);
  x.fillStyle = '#c7b895';
  x.font = `600 24px ${MONO}`;
  spaced(x, sub, 384, 200, 10);
  return c;
}

/* Framed quote poster: aged paper, double rule, serif quote, small tracked attribution. */
function quoteCanvas(w, h, lines, by, size) {
  const [c, x] = mk(w, h);
  x.fillStyle = '#e5dcc7';
  x.fillRect(0, 0, w, h);
  const r = rng(w + h);
  for (let i = 0; i < 1200; i++) {
    x.fillStyle = '#5a4630';
    x.globalAlpha = 0.03 + r() * 0.05;
    x.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
  }
  x.globalAlpha = 1;
  x.strokeStyle = '#79664c';
  x.lineWidth = 6;
  x.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88);
  x.lineWidth = 2;
  x.strokeRect(w * 0.09, h * 0.09, w * 0.82, h * 0.82);
  x.fillStyle = '#40372c';
  x.textAlign = 'center';
  x.font = `700 ${size}px ${SERIF}`;
  const lh = size * 1.25;
  const top = h / 2 - ((lines.length - 1) * lh) / 2 - size * 0.2;
  lines.forEach((t, i) => x.fillText(t, w / 2, top + i * lh));
  x.fillStyle = '#6b5a40';
  x.font = `600 ${Math.round(size * 0.34)}px ${MONO}`;
  spaced(x, by, w / 2, h * 0.86, 4);
  return c;
}

function mainScreenCanvas() {
  const [c, x] = mk(1800, 768);
  x.fillStyle = '#0f1013';
  x.fillRect(0, 0, 1800, 768);
  x.fillStyle = '#17181c';
  x.fillRect(0, 0, 1800, 52);
  x.fillStyle = '#1f2026';
  x.fillRect(24, 0, 330, 52);
  x.font = `600 18px ${MONO}`;
  x.fillStyle = '#c4a574';
  x.fillText('OrderExecutionEngine.cs', 44, 33);
  x.fillStyle = '#6c6a64';
  x.fillText('SqlContext.cs', 390, 33);
  x.fillStyle = '#7f9f8a';
  x.textAlign = 'right';
  x.fillText('release/production  ·  build succeeded', 1776, 33);
  x.textAlign = 'left';
  const L = [
    ["import { useFrame } from '@react-three/fiber';", '#6c6a64'],
    ["import * as THREE from 'three';", '#6c6a64'],
    ['', '#fff'],
    ['const INTRO_DURATION = 11.0;', '#c4a574'],
    ['const DOOR_START = 1.2;', '#c4a574'],
    ['const DOOR_DURATION = 3.8;', '#c4a574'],
    ['', '#fff'],
    ['function StudioWalkthrough({ camera, progress }) {', '#b9a27c'],
    ['  useFrame((state, delta) => {', '#c9c3b4'],
    ['    const t = THREE.MathUtils.clamp(progress.current / INTRO_DURATION, 0, 1);', '#7f9f8a'],
    ['    const eased = t * t * (3.0 - 2.0 * t);', '#a9b8a8'],
    ['    camera.position.lerpVectors(start, finish, eased);', '#a9b8a8'],
    ['    camera.lookAt(target);', '#b9a27c'],
    ['    const doorT = THREE.MathUtils.clamp(', '#c9c3b4'],
    ['      (progress.current - DOOR_START) / DOOR_DURATION, 0, 1);', '#7f9f8a'],
    ['    doorOpen.current = doorT * doorT * (3 - 2 * doorT);', '#a9b8a8'],
    ['  });', '#c9c3b4'],
    ['  return null;', '#7f9f8a'],
    ['}', '#c9c3b4'],
  ];
  x.font = `500 26px ${MONO}`;
  L.forEach(([t, col], i) => {
    const y = 108 + i * 33;
    x.fillStyle = '#3a3a40';
    x.fillText(String(i + 1).padStart(2, '0'), 28, y);
    x.fillStyle = col;
    x.fillText(t, 88, y);
  });
  return c;
}

function vertScreenCanvas() {
  const [c, x] = mk(720, 1200);
  x.fillStyle = '#0e0f12';
  x.fillRect(0, 0, 720, 1200);
  x.fillStyle = '#17181c';
  x.fillRect(0, 0, 720, 56);
  x.font = `600 20px ${MONO}`;
  x.fillStyle = '#c4a574';
  x.fillText('CLUSTER_TELEMETRY.sql', 28, 36);
  const L = [
    '-- SQL Server 2024 Enterprise', 'SELECT ClusterId, NodeName, HealthState', 'FROM sys.dm_os_cluster_nodes;', '',
    'Node 01 (master)   ONLINE  0.8ms', 'Node 02 (replica)  SYNCED  24k req/s', 'Buffer cache hit ratio  99.8%', '',
    '-- Flutter state sync', 'class MobileStateSynchronizer {', '  final ApiClient client;', '  Future<void> sync() async { ... }', '}', '',
    '// Docker health', 'container_gateway   UP', 'container_redis     UP',
  ];
  x.font = `500 23px ${MONO}`;
  L.forEach((t, i) => {
    x.fillStyle = t.startsWith('--') || t.startsWith('//') ? '#6c6a64' : '#c9c3b4';
    x.fillText(t, 28, 120 + i * 44);
  });
  return c;
}

/* ---------- materials (created once per mount, disposed on unmount) ---------- */
function buildMaterials() {
  const oakV = toTex(woodCanvas('#60472f', '#39291d', '#98734d', 11));
  const oakH = oakV.clone();
  const waV = toTex(woodCanvas('#795638', '#493321', '#b18a5d', 23));
  const waH = waV.clone();
  [oakH, waH].forEach((t) => {
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    t.needsUpdate = true;
  });
  const plasterTex = toTex(plasterCanvas('#d4c7ad', 3), [3, 2]);
  const ceilTex = toTex(plasterCanvas('#c3b69c', 9), [3, 3]);
  const stoneTex = toTex(plasterCanvas('#b9b4a7', 14), [2, 2]);
  const floorTex = toTex(floorCanvas(), [4, 4]);
  const rugTex = toTex(rugCanvas());
  const gateTex = toTex(gateWoodCanvas());
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const m = {
    oakV: std({ map: oakV, roughness: 0.62 }),
    gateOak: std({ map: gateTex, roughness: 0.7 }),
    oakH: std({ map: oakH, roughness: 0.62 }),
    walnutV: std({ map: waV, roughness: 0.5 }),
    walnutH: std({ map: waH, roughness: 0.5 }),
    plaster: std({ map: plasterTex, roughness: 0.95 }),
    ceiling: std({ map: ceilTex, roughness: 0.95 }),
    stone: std({ map: stoneTex, roughness: 0.9 }),
    floor: std({ map: floorTex, roughness: 0.55 }),
    rug: std({ map: rugTex, roughness: 1 }),
    brass: std({ color: '#b3945e', metalness: 0.45, roughness: 0.5 }),
    iron: std({ color: '#39352e', metalness: 0.5, roughness: 0.55 }),
    oxblood: std({ color: '#76534a', roughness: 0.6 }),
    green: std({ color: '#596b59', roughness: 0.75 }),
    enamel: std({ color: '#657a68', roughness: 0.4, side: THREE.DoubleSide }),
    paper: std({ color: '#e8ddc4', roughness: 0.9 }),
    black: std({ color: '#242321', roughness: 0.4 }),
    daylight: new THREE.MeshBasicMaterial({ color: '#f2e8d4', toneMapped: false }),
    books: std({ color: '#ffffff', roughness: 0.8 }),
  };
  return { m, textures: [oakV, oakH, waV, waH, plasterTex, ceilTex, stoneTex, floorTex, rugTex, gateTex] };
}

const Ctx = createContext(null);
const useM = () => useContext(Ctx);

/* ---------- primitives ----------
   Shared geometry: one unit box for every cuboid (size comes from mesh.scale, UVs/normals are identical
   to a sized BoxGeometry) and a cache for cylinders. Far less GPU memory and faster scene start. */
const BOX = new THREE.BoxGeometry(1, 1, 1);
const cylCache = new Map();
const getCyl = (a) => {
  const k = a.join(',');
  let g = cylCache.get(k);
  if (!g) {
    g = new THREE.CylinderGeometry(...a);
    cylCache.set(k, g);
  }
  return g;
};

function B({ p = [0, 0, 0], s, m, r, cast, recv }) {
  return <mesh position={p} rotation={r} scale={s} geometry={BOX} material={m} castShadow={cast} receiveShadow={recv} />;
}
function Cy({ p, a, m, r, cast }) {
  return <mesh position={p} rotation={r} material={m} castShadow={cast} geometry={getCyl(a)} />;
}

/* ============================================================================
   SIMPLE ANTIQUE HERITAGE WOODEN GATE
   100% flush (no depth stagger), zero seam flicker, stable rotation lock,
   clean understated boiserie panels, and elegant aged brass hardware.
   ========================================================================== */
function Door({ side, progress, plaqueTex }) {
  // side: -1 = left leaf, +1 = right leaf
  const ctx = useM();
  const M = { ...ctx, oakV: ctx.gateOak };
  const ref = useRef();

  // Exact geometry: each leaf is exactly 1.20m wide (2.4m opening / 2)
  const DOOR_WIDTH = 1.20;
  const DOOR_HEIGHT = 3.0;
  const dir = -side;
  const X = (dir * DOOR_WIDTH) / 2; // Center of the door slab relative to hinge

  useFrame(() => {
    if (!ref.current) return;
    // Rotation lock: when closed (p < 0.001), rotation is strictly 0 (no jitter/wobble)
    const p = progress?.current || 0;
    const currentAngle = p < 0.001 ? 0 : p * 1.65;
    const y = -side * currentAngle;
    if (ref.current.rotation.y !== y) ref.current.rotation.y = y;
  });

  return (
    // Both hinges at z = 0 (100% flush, no 'agey-peeche' stagger)
    <group ref={ref} position={[side * 1.20, 0.07, 0]}>
      {/* 1. Main Solid Dark Oak Slab */}
      <B p={[X, DOOR_HEIGHT / 2, 0]} s={[DOOR_WIDTH, DOOR_HEIGHT, 0.05]} m={M.walnutV} cast />

      {/* 2. Simple, Elegant Antique Recessed Panels (Upper Tall & Lower Sturdy) */}
      {[
        { y: 2.15, h: 1.15 }, // Upper elegant panel
        { y: 0.65, h: 0.85 }  // Lower traditional panel
      ].map((panel, idx) => (
        <group key={idx}>
          {/* Subtle Outer Frame Molding */}
          <B p={[X, panel.y, 0.027]} s={[DOOR_WIDTH - 0.22, panel.h, 0.008]} m={M.oakH} />
          {/* Recessed Center Field */}
          <B p={[X, panel.y, 0.032]} s={[DOOR_WIDTH - 0.32, panel.h - 0.1, 0.006]} m={M.oakV} />
        </group>
      ))}

      {/* 3. Meeting Stile Astragal Bead (Seals the center line with zero Z-fighting) */}
      {side === -1 && (
        <B p={[dir * (DOOR_WIDTH - 0.012), DOOR_HEIGHT / 2, 0.028]} s={[0.024, DOOR_HEIGHT - 0.04, 0.012]} m={M.walnutH} />
      )}

      {/* 4. Three Clean Antique Hinge Knuckles on the jamb edge */}
      {[0.4, DOOR_HEIGHT / 2, DOOR_HEIGHT - 0.4].map((y) => (
        <Cy key={y} p={[0, y, 0.026]} a={[0.02, 0.02, 0.07, 12]} m={M.iron} />
      ))}

      {/* 5. Clean Aged Brass Nameplate (HAZIQ on left, STUDIO on right) */}
      <group position={[X, 1.35, 0.035]}>
        <B p={[0, 0, 0]} s={[0.68, 0.22, 0.01]} m={M.walnutH} />
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[0.65, 0.19]} />
          <meshStandardMaterial map={plaqueTex} roughness={0.7} />
        </mesh>
      </group>

      {/* 6. Simple Classical Brass Ring Pull Handle */}
      <group position={[dir * (DOOR_WIDTH - 0.16), 1.15, 0.035]}>
        <Cy p={[0, 0, 0]} a={[0.032, 0.032, 0.01, 16]} r={[Math.PI / 2, 0, 0]} m={M.brass} />
        <mesh position={[0, -0.02, 0.018]} material={M.brass}>
          <torusGeometry args={[0.042, 0.008, 8, 20]} />
        </mesh>
      </group>
    </group>
  );
}

function Gate({ doorProgress, tex }) {
  const ctx = useM();
  const M = { ...ctx, oakV: ctx.gateOak };

  return (
    <group position={[0, 0, 3.6]}>
      {/* 1. Masonry Piers (Anti-flicker geometry: retracted to x = ±1.45) */}
      <B p={[-2.625, 1.8, 0]} s={[2.35, 3.6, 0.3]} m={M.plaster} />
      <B p={[2.625, 1.8, 0]} s={[2.35, 3.6, 0.3]} m={M.plaster} />
      <B p={[0, 3.4, 0]} s={[2.9, 0.4, 0.3]} m={M.plaster} />

      {/* 2. Clean Oak Jamb Linings & Outer Trim */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <B p={[s * 1.3, 1.55, 0]} s={[0.2, 3.1, 0.42]} m={M.oakV} />
          <B p={[s * 1.51, 1.6, 0]} s={[0.22, 3.2, 0.46]} m={M.walnutV} cast />
        </group>
      ))}

      {/* 3. Simple Classical Entablature (Clean Molded Cornice, No Cluttered Teeth) */}
      <B p={[0, 3.14, 0]} s={[2.84, 0.08, 0.52]} m={M.walnutH} />
      <B p={[0, 3.22, 0.01]} s={[3.02, 0.08, 0.58]} m={M.oakH} />
      <B p={[0, 3.28, 0.02]} s={[3.18, 0.06, 0.64]} m={M.walnutH} cast />

      {/* 4. Natural Hewn Stone Threshold */}
      <B p={[0, 0.035, 0]} s={[2.84, 0.07, 0.6]} m={M.stone} recv />

      {/* 5. Symmetrical Flush Doors */}
      <Door side={-1} progress={doorProgress} plaqueTex={tex.plaqueL} />
      <Door side={1} progress={doorProgress} plaqueTex={tex.plaqueR} />

      {/* Matching illuminated wall sconces on both sides of the entrance. */}
      <WallLamp side={-1} />
      <WallLamp side={1} />
    </group>
  );
}

/* ============================================================================
   ROOM PARTS
   ========================================================================== */
function Wainscot({ len }) {
  const M = useM();
  const n = Math.round(len / 1.2);
  const pw = len / n;
  return (
    <group>
      <B p={[0, 0.07, 0.035]} s={[len, 0.14, 0.07]} m={M.walnutH} />
      <B p={[0, 1.1, 0.04]} s={[len, 0.07, 0.09]} m={M.walnutH} />
      <B p={[0, 0.6, 0.012]} s={[len, 1.0, 0.025]} m={M.walnutV} />
      {Array.from({ length: n }).map((_, i) => (
        <B key={i} p={[-len / 2 + pw * (i + 0.5), 0.6, 0.032]} s={[pw - 0.24, 0.72, 0.02]} m={M.oakV} />
      ))}
    </group>
  );
}

function CurtainPanel({ side, tint = '#aeb3b8' }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.46, 2.3, 12, 24), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: tint,
    roughness: 0.98,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.97,
    depthWrite: false,
  }), [tint]);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((state) => {
    const attr = geometry.attributes.position;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < attr.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const lower = THREE.MathUtils.clamp((1.15 - y) / 2.3, 0, 1);
      const fold = Math.sin((x + 0.23) * 22 + side * 0.7);
      const breeze = Math.sin(time * 1.15 + y * 1.8 + side * 0.8);
      attr.array[i * 3] = x + fold * 0.014 + breeze * lower * 0.045;
      attr.array[i * 3 + 1] = y;
      attr.array[i * 3 + 2] = Math.sin(time * 1.35 + x * 7 + y * 1.7 + side) * lower * 0.035;
    }
    attr.needsUpdate = true;
    geometry.computeVertexNormals();
    state.invalidate();
  });

  return <mesh geometry={geometry} material={material} position={[side * 0.43, -0.25, 0.12]} />;
}

function Window({ z }) {
  const M = useM();
  return (
    <group position={[3.57, 2.05, z]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0, 0.005]} material={M.daylight}>
        <planeGeometry args={[1.3, 1.7]} />
      </mesh>
      {[-0.7, 0.7].map((v) => <B key={v} p={[v, 0, 0.05]} s={[0.1, 1.9, 0.1]} m={M.oakV} />)}
      {[-0.9, 0.9].map((v) => <B key={v} p={[0, v, 0.05]} s={[1.5, 0.1, 0.1]} m={M.oakV} />)}
      <B p={[0, 0, 0.04]} s={[0.03, 1.7, 0.04]} m={M.oakV} />
      {[-0.28, 0.28].map((v) => <B key={v} p={[0, v, 0.04]} s={[1.3, 0.03, 0.04]} m={M.oakV} />)}
      <B p={[0, -0.97, 0.1]} s={[1.7, 0.05, 0.2]} m={M.oakH} />
      {/* Slim brass curtain rail and softly billowing linen panels. */}
      <Cy p={[0, 0.91, 0.13]} a={[0.018, 0.018, 1.55, 16]} r={[0, 0, Math.PI / 2]} m={M.brass} />
      <CurtainPanel side={-1} tint="#aeb4ba" />
      <CurtainPanel side={1} tint="#858e97" />
      {[-0.43, 0.43].map((v) => (
        <mesh key={v} position={[v, 0.02, 0.15]} material={M.brass}>
          <sphereGeometry args={[0.035, 12, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function WallLamp({ side }) {
  const M = useM();
  return (
    <group position={[side * 1.92, 2.18, 0.22]}>
      {/* Antique-brass wall plate and short projecting arm. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={M.brass} castShadow>
        <cylinderGeometry args={[0.105, 0.105, 0.035, 24]} />
      </mesh>
      <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]} material={M.brass}>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 12]} />
      </mesh>
      {/* Warm glowing glass lantern, mounted above eye level beside the doorway. */}
      <mesh position={[0, 0.015, 0.17]}>
        <sphereGeometry args={[0.105, 20, 16]} />
        <meshStandardMaterial
          color="#f5d9a2"
          emissive="#ffbd62"
          emissiveIntensity={2.2}
          roughness={0.28}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, 0.13, 0.17]} material={M.brass}>
        <cylinderGeometry args={[0.12, 0.075, 0.055, 20]} />
      </mesh>
      <mesh position={[0, -0.105, 0.17]} material={M.brass}>
        <cylinderGeometry args={[0.075, 0.12, 0.055, 20]} />
      </mesh>
      <pointLight position={[0, 0.015, 0.28]} color="#ffc879" intensity={2.1} distance={3.8} decay={2} />
    </group>
  );
}

function Bookshelf() {
  const M = useM();
  const ys = [0.12, 0.62, 1.12, 1.62, 2.12, 2.62];
  const ups = [-2.5, -0.83, 0.83, 2.5];
  const books = useMemo(() => {
    const r = rng(42);
    const pal = ['#76534a', '#596b59', '#66788a', '#92734f', '#66564a', '#a18c6b', '#594a3c', '#857052'];
    const out = [];
    for (let l = 0; l < 5; l++) {
      let px = -2.44;
      while (px < 2.4) {
        if (r() < 0.06) px += 0.12 + r() * 0.2;
        const w = 0.03 + r() * 0.06;
        const hgt = 0.26 + r() * 0.15;
        ups.forEach((u) => { if (px + w > u - 0.03 && px < u + 0.05) px = u + 0.05; });
        if (px + w > 2.44) break;
        const lean = r() < 0.04 ? 0.14 : 0;
        out.push({ x: px + w / 2, y: ys[l] + 0.02 + hgt / 2, w, h: hgt, c: pal[Math.floor(r() * pal.length)], lean });
        px += w + 0.004 + (lean ? 0.05 : 0);
      }
    }
    return out;
  }, []);
  const ref = useRef();
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    books.forEach((b, i) => {
      d.position.set(b.x, b.y, 0.17);
      d.rotation.set(0, 0, b.lean);
      d.scale.set(b.w, b.h, 0.2);
      d.updateMatrix();
      ref.current.setMatrixAt(i, d.matrix);
      ref.current.setColorAt(i, col.set(b.c));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [books]);
  return (
    <group position={[-3.58, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <B p={[0, 0.06, 0.16]} s={[5.0, 0.12, 0.32]} m={M.oakH} />
      <B p={[0, 1.35, 0.015]} s={[5.0, 2.7, 0.03]} m={M.oakV} />
      {ys.map((y) => <B key={y} p={[0, y, 0.15]} s={[5.0, 0.04, 0.3]} m={M.walnutH} cast />)}
      {ups.map((u) => <B key={u} p={[u, 1.35, 0.15]} s={[0.05, 2.7, 0.3]} m={M.walnutV} />)}
      <B p={[0, 2.76, 0.17]} s={[5.1, 0.12, 0.34]} m={M.oakH} />
      <instancedMesh ref={ref} args={[undefined, undefined, books.length]} material={M.books}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
}

function Armchair() {
  const M = useM();
  return (
    <group position={[2.75, 0, 1.3]} rotation={[0, -Math.PI / 2 + 0.3, 0]}>
      <B p={[0, 0.3, 0]} s={[0.9, 0.2, 0.85]} m={M.oxblood} cast />
      <B p={[0, 0.46, 0.03]} s={[0.76, 0.14, 0.7]} m={M.oxblood} />
      <B p={[0, 0.8, -0.35]} s={[0.9, 0.8, 0.16]} r={[-0.12, 0, 0]} m={M.oxblood} cast />
      {[-0.5, 0.5].map((v) => <B key={v} p={[v, 0.52, 0]} s={[0.16, 0.36, 0.85]} m={M.oxblood} cast />)}
      {[[-0.4, 0.36], [0.4, 0.36], [-0.4, -0.36], [0.4, -0.36]].map(([a, b], i) => (
        <Cy key={i} p={[a, 0.1, b]} a={[0.035, 0.05, 0.2, 10]} m={M.walnutV} />
      ))}
    </group>
  );
}

function SideTable() {
  const M = useM();
  return (
    <group position={[3.1, 0, -0.1]}>
      <Cy p={[0, 0.58, 0]} a={[0.28, 0.28, 0.04, 28]} m={M.walnutH} cast />
      <Cy p={[0, 0.3, 0]} a={[0.035, 0.05, 0.56, 12]} m={M.walnutV} />
      <Cy p={[0, 0.02, 0]} a={[0.2, 0.22, 0.04, 20]} m={M.walnutV} />
      <B p={[0, 0.625, 0]} s={[0.2, 0.05, 0.14]} r={[0, 0.4, 0]} m={M.green} />
    </group>
  );
}

function GrandfatherClock() {
  const M = useM();
  return (
    <group position={[3.15, 0, -3.15]} rotation={[0, -Math.PI / 4, 0]}>
      <B p={[0, 0.25, 0]} s={[0.52, 0.5, 0.34]} m={M.walnutV} cast />
      <B p={[0, 1.15, 0]} s={[0.4, 1.3, 0.28]} m={M.walnutV} cast />
      <B p={[0, 1.2, 0.141]} s={[0.2, 0.8, 0.01]} m={M.black} />
      <Cy p={[0, 0.98, 0.15]} a={[0.05, 0.05, 0.01, 20]} r={[Math.PI / 2, 0, 0]} m={M.brass} />
      <B p={[0, 2.07, 0]} s={[0.5, 0.55, 0.34]} m={M.walnutV} cast />
      <B p={[0, 2.38, 0]} s={[0.58, 0.08, 0.4]} m={M.walnutH} />
      <mesh position={[0, 2.07, 0.172]} material={M.paper}>
        <circleGeometry args={[0.16, 32]} />
      </mesh>
      <mesh position={[0, 2.07, 0.174]} material={M.brass}>
        <torusGeometry args={[0.165, 0.012, 8, 32]} />
      </mesh>
      <B p={[0, 2.1, 0.178]} s={[0.012, 0.11, 0.004]} m={M.black} />
      <B p={[0.04, 2.07, 0.178]} s={[0.08, 0.012, 0.004]} m={M.black} />
    </group>
  );
}

function Print({ pos, tex }) {
  const M = useM();
  return (
    <group position={pos}>
      <B s={[0.74, 0.95, 0.04]} m={M.walnutH} />
      <B p={[0, 0, 0.008]} s={[0.66, 0.87, 0.04]} m={M.brass} />
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[0.6, 0.81]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Poster({ w, h, tex, ...rest }) {
  const M = useM();
  return (
    <group {...rest}>
      <B s={[w + 0.08, h + 0.08, 0.035]} m={M.walnutH} cast />
      <mesh position={[0, 0, 0.0225]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Monitor({ w, h, tex, ...rest }) {
  const M = useM();
  return (
    <group {...rest}>
      <B p={[0, 0, 0]} s={[w, h, 0.04]} m={M.black} cast />
      <mesh position={[0, 0, 0.024]}>
        <planeGeometry args={[w - 0.06, h - 0.06]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <B p={[0, -h / 2 - 0.1, -0.03]} s={[0.05, 0.22, 0.03]} m={M.black} />
      <B p={[0, -h / 2 - 0.2, 0.02]} s={[0.3, 0.012, 0.18]} m={M.black} />
    </group>
  );
}

function Desk({ tex }) {
  const M = useM();
  return (
    <group position={[0, 0, -2.9]}>
      <B p={[0, 0.76, 0]} s={[2.6, 0.07, 1.0]} m={M.walnutH} cast recv />
      <B p={[0, 0.8, 0.02]} s={[2.2, 0.008, 0.7]} m={M.green} recv />
      <B p={[0, 0.67, 0.46]} s={[1.2, 0.12, 0.04]} m={M.walnutH} />
      <B p={[0, 0.36, -0.42]} s={[1.2, 0.7, 0.03]} m={M.walnutV} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.95, 0, 0]}>
          <B p={[0, 0.36, 0]} s={[0.7, 0.72, 0.9]} m={M.walnutV} cast />
          {[0.15, 0.37, 0.59].map((y) => (
            <group key={y}>
              <B p={[0, y, 0.455]} s={[0.62, 0.19, 0.025]} m={M.walnutH} />
              <mesh position={[0, y, 0.485]} material={M.brass}>
                <sphereGeometry args={[0.022, 12, 10]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <Monitor w={1.72} h={0.74} tex={tex.main} position={[0, 1.24, -0.2]} />
      <Monitor w={0.44} h={0.74} tex={tex.vert} position={[-1.12, 1.24, -0.05]} rotation={[0, 0.35, 0]} />
      <PencilBasket />
      <B p={[0, 0.822, 0.24]} s={[0.5, 0.02, 0.17]} m={M.black} />
      <B p={[0.4, 0.82, 0.24]} s={[0.05, 0.02, 0.08]} m={M.black} />
      <B p={[-0.78, 0.82, 0.25]} s={[0.28, 0.04, 0.2]} m={M.oxblood} />
      <B p={[-0.78, 0.855, 0.25]} s={[0.25, 0.03, 0.18]} r={[0, 0.1, 0]} m={M.green} />
      <group position={[1.1, 0.8, -0.25]}>
        <Cy p={[0, 0.015, 0]} a={[0.1, 0.11, 0.03, 20]} m={M.brass} />
        <Cy p={[0, 0.2, 0]} a={[0.012, 0.012, 0.37, 8]} m={M.brass} />
        <Cy p={[0, 0.42, 0]} a={[0.07, 0.15, 0.14, 24, 1, true]} m={M.enamel} />
      </group>
      <group position={[0.95, 0.8, 0.25]}>
        <Cy p={[0, 0.02, 0]} a={[0.07, 0.08, 0.04, 16]} m={M.walnutV} />
        <mesh position={[0, 0.17, 0]} material={M.paper}>
          <sphereGeometry args={[0.11, 24, 18]} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[0, 0, 0.4]} material={M.brass}>
          <torusGeometry args={[0.125, 0.007, 6, 36]} />
        </mesh>
      </group>
    </group>
  );
}

function PencilBasket() {
  const M = useM();
  const pencils = [
    [-0.055, 0.28, '#d7a34d'], [-0.018, 0.34, '#c96f58'],
    [0.025, 0.30, '#718a78'], [0.06, 0.36, '#d9c18d'],
    [0.09, 0.27, '#7890a5'],
  ];
  return (
    <group position={[0.98, 0.81, 0.24]}>
      <mesh position={[0, 0.105, 0]} material={M.brass}>
        <cylinderGeometry args={[0.095, 0.075, 0.21, 24, 1, true]} />
      </mesh>
      <mesh position={[0, 0.012, 0]} material={M.brass}>
        <torusGeometry args={[0.076, 0.008, 8, 24]} />
      </mesh>
      {pencils.map(([x, h, color], i) => (
        <group key={i} position={[x, 0.18 + h / 2, (i % 2) * 0.025 - 0.02]} rotation={[0, 0, (i - 2) * 0.07]}>
          <mesh material={new THREE.MeshStandardMaterial({ color, roughness: 0.65 })}>
            <cylinderGeometry args={[0.009, 0.009, h, 8]} />
          </mesh>
          <mesh position={[0, h / 2 + 0.008, 0]} material={M.paper}>
            <coneGeometry args={[0.009, 0.025, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WallGuitar() {
  const M = useM();

  // A compact double-cutaway electric guitar with a clean red body and white pickguard.
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-0.02, 0.12);
  bodyShape.bezierCurveTo(-0.20, 0.25, -0.34, 0.12, -0.32, -0.08);
  bodyShape.bezierCurveTo(-0.31, -0.20, -0.23, -0.22, -0.20, -0.32);
  bodyShape.bezierCurveTo(-0.17, -0.45, -0.25, -0.57, -0.15, -0.67);
  bodyShape.bezierCurveTo(-0.06, -0.77, 0.17, -0.77, 0.25, -0.65);
  bodyShape.bezierCurveTo(0.32, -0.55, 0.23, -0.43, 0.20, -0.32);
  bodyShape.bezierCurveTo(0.18, -0.22, 0.30, -0.18, 0.32, -0.06);
  bodyShape.bezierCurveTo(0.35, 0.12, 0.20, 0.25, 0.04, 0.12);
  bodyShape.lineTo(0.02, 0.02);
  bodyShape.lineTo(-0.02, 0.02);
  bodyShape.closePath();

  const pickguard = new THREE.Shape();
  pickguard.moveTo(-0.02, 0.04);
  pickguard.bezierCurveTo(-0.13, 0.12, -0.22, 0.04, -0.18, -0.10);
  pickguard.bezierCurveTo(-0.14, -0.20, -0.08, -0.19, -0.08, -0.31);
  pickguard.lineTo(0.12, -0.31);
  pickguard.bezierCurveTo(0.12, -0.16, 0.20, -0.12, 0.18, -0.02);
  pickguard.bezierCurveTo(0.16, 0.08, 0.07, 0.12, 0.02, 0.04);
  pickguard.closePath();

  const redBody = new THREE.MeshStandardMaterial({ color: '#c9363d', roughness: 0.3, metalness: 0.16 });
  const whitePickguard = new THREE.MeshStandardMaterial({ color: '#f4f1e9', roughness: 0.38, metalness: 0.04 });
  const guitarBody = new THREE.ExtrudeGeometry(bodyShape, { depth: 0.105, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 12 });
  const guardGeometry = new THREE.ShapeGeometry(pickguard, 16);

  return (
    <group position={[1.27, 1.98, -3.535]} rotation={[0, 0, -0.13]} scale={0.76}>
      {/* Discreet brass wall hanger. */}
      <B p={[0, 0.69, -0.035]} s={[0.21, 0.045, 0.065]} m={M.brass} cast />
      <Cy p={[-0.065, 0.61, 0.005]} a={[0.015, 0.015, 0.11, 12]} r={[Math.PI / 2, 0, 0]} m={M.brass} />
      <Cy p={[0.065, 0.61, 0.005]} a={[0.015, 0.015, 0.11, 12]} r={[Math.PI / 2, 0, 0]} m={M.brass} />

      {/* Sculpted red double-cutaway body. */}
      <mesh geometry={guitarBody} material={redBody} position={[0, 0, 0.035]} castShadow />
      <mesh geometry={guardGeometry} material={whitePickguard} position={[0, 0, 0.17]} />

      {/* Maple neck, dark fingerboard and compact headstock. */}
      <B p={[0, 0.43, 0.105]} s={[0.085, 0.78, 0.065]} m={M.walnutH} cast />
      <B p={[0, 0.43, 0.142]} s={[0.064, 0.77, 0.012]} m={M.black} />
      <B p={[0, 0.87, 0.105]} s={[0.15, 0.19, 0.07]} m={M.walnutV} cast />

      {/* Frets and six fine strings. */}
      {Array.from({ length: 10 }).map((_, i) => (
        <B key={`fret-${i}`} p={[0, 0.08 + i * 0.071, 0.153]} s={[0.071, 0.008, 0.005]} m={M.brass} />
      ))}
      {[-0.024, -0.014, -0.005, 0.005, 0.014, 0.024].map((x) => (
        <B key={`string-${x}`} p={[x, 0.40, 0.16]} s={[0.002, 0.98, 0.002]} m={M.iron} />
      ))}

      {/* Two pickups, bridge and tuning pegs make the electric-guitar details legible. */}
      <B p={[0, -0.20, 0.178]} s={[0.17, 0.045, 0.025]} m={M.black} />
      <B p={[0, -0.43, 0.178]} s={[0.17, 0.045, 0.025]} m={M.black} />
      <B p={[0, -0.53, 0.18]} s={[0.20, 0.025, 0.025]} m={M.brass} />
      {[-1, 1].map((side) => [0.78, 0.88, 0.98].map((y, i) => (
        <mesh key={`${side}-${i}`} position={[side * 0.085, y, 0.12]} material={M.brass}>
          <sphereGeometry args={[0.018, 12, 10]} />
        </mesh>
      )))}
    </group>
  );
}

function Hallway() {
  const M = useM();
  return (
    <group>
      <mesh position={[0, 0, 6.325]} rotation={[-Math.PI / 2, 0, 0]} material={M.stone} receiveShadow>
        <planeGeometry args={[4.4, 5.45]} />
      </mesh>

      <B p={[-2.3, 1.8, 6.4]} s={[0.2, 3.6, 5.3]} m={M.plaster} />
      <B p={[2.3, 1.8, 6.4]} s={[0.2, 3.6, 5.3]} m={M.plaster} />
      <group position={[-2.0, 0, 6.2]} rotation={[0, Math.PI / 2, 0]}>
        <B p={[0, 0.46, 0]} s={[1.4, 0.06, 0.4]} m={M.walnutH} cast />
        {[-0.6, 0.6].map((v) => <B key={v} p={[v, 0.22, 0]} s={[0.06, 0.44, 0.36]} m={M.walnutV} />)}
      </group>
    </group>
  );
}

function Lights({ lf }) {
  const hemi = useRef(), key = useRef(), lamp = useRef(), hall = useRef();
  const fill = useRef(), deskGlow = useRef(), ceilingGlow = useRef();
  const last = useRef(-1);
  useFrame(() => {
    const f = lf.current;
    // Only touch the lights when the factor actually changed (intro fade), not every frame.
    if (Math.abs(f - last.current) < 1e-4) return;
    last.current = f;
    hemi.current.intensity = 1.08 * f;
    key.current.intensity = 2.15 * f;
    lamp.current.intensity = 1.05 * f;
    hall.current.intensity = 5.5 * f;
    fill.current.intensity = 1.15 * f;
    deskGlow.current.intensity = 1.35 * f;
    ceilingGlow.current.intensity = 1.0 * f;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#f0dfc2', '#655747', 1]} />
      <directionalLight
        ref={key}
        position={[7, 5, -1]}
        color="#ffe8cf"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-camera-top={5.5}
        shadow-camera-bottom={-5.5}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <pointLight ref={lamp} position={[1.1, 1.3, -3.15]} color="#f4c58d" distance={5} decay={2} />
      <pointLight ref={hall} position={[0, 3.0, 6.4]} color="#f7dfbf" distance={9} decay={2} />
      <pointLight ref={fill} position={[-2.5, 2.7, -1.2]} color="#ffe6c6" distance={7} decay={2} />
      <pointLight ref={deskGlow} position={[0, 2.15, -2.65]} color="#f6d9a8" distance={4.5} decay={2} />
      <pointLight ref={ceilingGlow} position={[1.8, 3.15, 1.0]} color="#e1e8ff" distance={6} decay={2} />
    </>
  );
}

function useFontsReady() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let on = true;
    const f = document.fonts;
    const go = () => on && setOk(true);
    if (!f) return go();
    // Safety net: never wait more than 1.5 s for fonts (slow mobile networks).
    const timer = setTimeout(go, 1500);
    Promise.all([f.load(`700 40px ${SERIF}`), f.load(`600 20px ${MONO}`)])
      .catch(() => {})
      .then(() => f.ready)
      .then(go);
    return () => { on = false; clearTimeout(timer); };
  }, []);
  return ok;
}

/* ============================================================================
   MAIN EXPORT
   doorOpenProgress: 0 = closed, 1 = fully open. Driven by the camera director.
   ========================================================================== */
export default function IsometricRoomScene({ scrollProgress, doorOpenProgress, isInsideRoom, lightFactor }) {
  const roomGroup = useRef();
  const roomVel = useRef(0);
  const fontsOk = useFontsReady();
  const { gl, scene, camera } = useThree();

  const mats = useMemo(() => buildMaterials(), []);
  useEffect(() => () => {
    Object.values(mats.m).forEach((x) => x.dispose());
    mats.textures.forEach((t) => t.dispose());
  }, [mats]);

  // Text textures are built exactly once, after the fonts are ready (previously built twice).
  const tex = useMemo(() => {
    if (!fontsOk) return null;
    return {
      plaqueL: toTex(plaqueCanvas('HAZIQ', 'CREATIVE STUDIO')),
      plaqueR: toTex(plaqueCanvas('STUDIO', 'DESIGN & DEVELOPMENT')),
      main: toTex(mainScreenCanvas()),
      vert: toTex(vertScreenCanvas()),
      print1: toTex(graphicArtCanvas(640, 860, 0)),
      print2: toTex(graphicArtCanvas(640, 860, 1)),
      quoteBack: toTex(graphicArtCanvas(1200, 800, 2)),
      quoteRight: toTex(graphicArtCanvas(560, 760, 3)),
      quoteLeft: toTex(graphicArtCanvas(560, 760, 4)),
      // Place the supplied Bill Gates portrait at public/images/bill-gates-portrait.jpg.
      billGates: new THREE.TextureLoader().load('/images/bill-gates-portrait.jpg'),
    };
  }, [fontsOk]);
  useEffect(() => () => { if (tex) Object.values(tex).forEach((t) => t.dispose()); }, [tex]);

  // Warm-up: upload textures and compile shaders up front so the intro doesn't stutter on first frames.
  useEffect(() => {
    if (!tex) return;
    try {
      [...mats.textures, ...Object.values(tex)].forEach((t) => gl.initTexture?.(t));
      if (gl.compileAsync) gl.compileAsync(scene, camera).catch(() => {});
      else gl.compile(scene, camera);
    } catch {
      /* warm-up is best effort only */
    }
  }, [tex, mats, gl, scene, camera]);

  useFrame((state, delta) => {
    const g = roomGroup.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    const inside = isInsideRoom.current;
    const p = scrollProgress ? scrollProgress.current : 0;
    // Spring-damper: the room has mass, so turns ease in, carry a little momentum and settle without overshoot.
    const target = inside ? p * Math.PI * 2 : 0;
    const K = 24;
    const C = 2 * Math.sqrt(K) * 0.95;
    roomVel.current += (K * (target - g.rotation.y) - C * roomVel.current) * dt;
    g.rotation.y += roomVel.current * dt;
    g.rotation.x = 0;
    // On-demand rendering: keep drawing only while the room is still moving.
    if (Math.abs(target - g.rotation.y) > 4e-4 || Math.abs(roomVel.current) > 4e-4) state.invalidate(2);
  });

  if (!tex) return null;

  return (
    <Ctx.Provider value={mats.m}>
      <Lights lf={lightFactor} />
      <group ref={roomGroup}>
        <Hallway />
        <Gate doorProgress={doorOpenProgress} tex={tex} />
        {/* shell */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.m.floor} receiveShadow>
          <planeGeometry args={[7.2, 7.2]} />
        </mesh>
        <mesh position={[0, 3.6, 2.725]} rotation={[Math.PI / 2, 0, 0]} material={mats.m.ceiling}>
          <planeGeometry args={[7.2, 12.65]} />
        </mesh>
        <B p={[0, 1.8, -3.75]} s={[7.5, 3.6, 0.3]} m={mats.m.plaster} />
        <B p={[-3.75, 1.8, 0]} s={[0.3, 3.6, 7.5]} m={mats.m.plaster} />
        <B p={[3.75, 1.8, 0]} s={[0.3, 3.6, 7.5]} m={mats.m.plaster} />
        {[-3, -1.5, 0, 1.5, 3].map((z) => <B key={z} p={[0, 3.49, z]} s={[7.2, 0.22, 0.3]} m={mats.m.oakH} />)}

        <group position={[0, 0, -3.6]}><Wainscot len={7.2} /></group>
        <group position={[3.6, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><Wainscot len={7.2} /></group>
        <Window z={-1.6} />
        <Window z={1.4} />

        <Bookshelf />
        <Print pos={[-2.4, 2.2, -3.56]} tex={tex.print1} />
        <Print pos={[2.4, 2.2, -3.56]} tex={tex.print2} />
        <Poster w={0.82} h={1.12} tex={tex.billGates} position={[0, 2.28, -3.582]} />
        <WallGuitar />
        <Poster w={0.56} h={0.76} tex={tex.quoteRight} position={[3.582, 1.9, 2.8]} rotation={[0, -Math.PI / 2, 0]} />
        <Poster w={0.56} h={0.76} tex={tex.quoteLeft} position={[-3.582, 1.9, 2.8]} rotation={[0, Math.PI / 2, 0]} />
        <Desk tex={tex} />
        <Armchair />
        <SideTable />
        <GrandfatherClock />

        <mesh position={[0, 0.006, -1.5]} rotation={[-Math.PI / 2, 0, 0]} material={mats.m.rug} receiveShadow>
          <planeGeometry args={[4.4, 3.3]} />
        </mesh>
      </group>
    </Ctx.Provider>
  );
}