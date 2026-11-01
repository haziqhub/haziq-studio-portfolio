import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ============================================================================
   ANTIQUE ARCHITECT'S STUDIO
   Matte materials only: aged oak, walnut, limewash plaster, oxblood leather,
   dull brass. No emissive glow, no gradients.
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
  x.fillStyle = '#3b2b1d';
  x.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 60; i++) {
    const px = r() * 512;
    const ph = r() * 6;
    const amp = 3 + r() * 5;
    x.strokeStyle = r() > 0.5 ? '#2a1d13' : '#4a3624';
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
  const tones = ['#5a3c26', '#4f3420', '#654530', '#47301e', '#583a25'];
  for (let row = 0; row < 32; row++) {
    const cuts = [0, 1024];
    for (let i = 0, n = 2 + Math.floor(r() * 3); i < n; i++) cuts.push(Math.floor(r() * 30) * 32 + 32);
    const pts = [...new Set(cuts)].sort((a, b) => a - b);
    for (let i = 0; i < pts.length - 1; i++) {
      const px = pts[i], pw = pts[i + 1] - px, py = row * 32;
      x.fillStyle = tones[Math.floor(r() * tones.length)];
      x.fillRect(px, py, pw, 32);
      x.strokeStyle = '#1d130b';
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
      x.strokeStyle = '#150d07';
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
  inset(0, '#4a211e');
  inset(14, '#bfae8a');
  inset(26, '#2b3548');
  inset(46, '#4a211e');
  x.strokeStyle = '#a98f66';
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
  dia(130, 96, '#2b3548');
  dia(100, 72, '#bfae8a');
  dia(70, 50, '#4a211e');
  dia(34, 24, '#2b3548');
  return c;
}

function printCanvas(rows) {
  const [c, x] = mk(640, 860);
  const r = rng(5);
  x.fillStyle = '#d3c39b';
  x.fillRect(0, 0, 640, 860);
  for (let i = 0; i < 1600; i++) {
    x.fillStyle = '#5a4630';
    x.globalAlpha = 0.03 + r() * 0.05;
    x.fillRect(r() * 640, r() * 860, 1 + r() * 3, 1 + r() * 3);
  }
  x.globalAlpha = 1;
  x.strokeStyle = '#4a3825';
  x.lineWidth = 6;
  x.strokeRect(34, 34, 572, 792);
  x.lineWidth = 2;
  x.strokeRect(50, 50, 540, 760);
  x.fillStyle = '#35271a';
  x.textAlign = 'center';
  rows.forEach(([t, size, y, w]) => {
    x.font = `${w || 700} ${size}px ${SERIF}`;
    x.fillText(t, 320, y);
  });
  return c;
}

/* Nameplate: dark walnut plate, brass rule, engraved title. */
function plaqueCanvas(title, sub) {
  const [c, x] = mk(768, 256);
  x.fillStyle = '#2a2018';
  x.fillRect(0, 0, 768, 256);
  x.strokeStyle = '#7d6a48';
  x.lineWidth = 6;
  x.strokeRect(14, 14, 740, 228);
  x.lineWidth = 2;
  x.strokeRect(28, 28, 712, 200);
  x.fillStyle = '#d6cbb2';
  x.font = `700 100px ${SERIF}`;
  spaced(x, title, 384, 140, 18);
  x.fillStyle = '#9a8c72';
  x.font = `600 24px ${MONO}`;
  spaced(x, sub, 384, 200, 10);
  return c;
}

/* Framed quote poster: aged paper, double rule, serif quote, small tracked attribution. */
function quoteCanvas(w, h, lines, by, size) {
  const [c, x] = mk(w, h);
  x.fillStyle = '#d3c39b';
  x.fillRect(0, 0, w, h);
  const r = rng(w + h);
  for (let i = 0; i < 1200; i++) {
    x.fillStyle = '#5a4630';
    x.globalAlpha = 0.03 + r() * 0.05;
    x.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
  }
  x.globalAlpha = 1;
  x.strokeStyle = '#4a3825';
  x.lineWidth = 6;
  x.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88);
  x.lineWidth = 2;
  x.strokeRect(w * 0.09, h * 0.09, w * 0.82, h * 0.82);
  x.fillStyle = '#35271a';
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
    ['namespace Architecture.Enterprise.Core.Services;', '#6c6a64'],
    ['using Microsoft.EntityFrameworkCore;', '#6c6a64'],
    ['', '#fff'],
    ['public sealed class OrderProcessor : IOrderProcessor', '#c4a574'],
    ['{', '#c9c3b4'],
    ['    private readonly ISqlDbContext _context;', '#a39e92'],
    ['    private readonly ILogger<OrderProcessor> _logger;', '#a39e92'],
    ['', '#fff'],
    ['    public async Task<ExecutionResult> DispatchAsync(OrderPayload payload)', '#b9a27c'],
    ['    {', '#c9c3b4'],
    ['        await using var tx = await _context.Database.BeginTransactionAsync();', '#7f9f8a'],
    ['        var verified = OrderPolicy.VerifyStructuralIntegrity(payload);', '#a9b8a8'],
    ['        if (!verified.IsSuccess) return ExecutionResult.Reject(verified.Error);', '#b87a6e'],
    ['', '#fff'],
    ['        await _context.Orders.AddAsync(payload.ToEntity());', '#a9b8a8'],
    ['        await _context.SaveChangesAsync();', '#a9b8a8'],
    ['        _logger.LogInformation("Order committed: {Id}", payload.Id);', '#a58a6f'],
    ['        return ExecutionResult.Success();', '#7f9f8a'],
    ['    }', '#c9c3b4'],
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
  const oakV = toTex(woodCanvas('#3b2b1d', '#1c130b', '#5a432d', 11));
  const oakH = oakV.clone();
  const waV = toTex(woodCanvas('#5a3b24', '#2b1a0f', '#7a5636', 23));
  const waH = waV.clone();
  [oakH, waH].forEach((t) => {
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    t.needsUpdate = true;
  });
  const plasterTex = toTex(plasterCanvas('#a89678', 3), [3, 2]);
  const ceilTex = toTex(plasterCanvas('#8d7f69', 9), [3, 3]);
  const stoneTex = toTex(plasterCanvas('#8a8377', 14), [2, 2]);
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
    brass: std({ color: '#8a6d3b', metalness: 0.45, roughness: 0.5 }),
    iron: std({ color: '#1d1b19', metalness: 0.5, roughness: 0.55 }),
    oxblood: std({ color: '#4a201d', roughness: 0.6 }),
    green: std({ color: '#243428', roughness: 0.75 }),
    enamel: std({ color: '#1f3a2b', roughness: 0.4, side: THREE.DoubleSide }),
    paper: std({ color: '#d6c9a8', roughness: 0.9 }),
    black: std({ color: '#0c0c0d', roughness: 0.4 }),
    daylight: new THREE.MeshBasicMaterial({ color: '#e9dfc9', toneMapped: false }),
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

      {/* 5. Clean Aged Brass Nameplate (MAAZ on left, STUDIO on right) */}
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
    </group>
  );
}

function Bookshelf() {
  const M = useM();
  const ys = [0.12, 0.62, 1.12, 1.62, 2.12, 2.62];
  const ups = [-2.5, -0.83, 0.83, 2.5];
  const books = useMemo(() => {
    const r = rng(42);
    const pal = ['#5a2a24', '#2f3d34', '#2b3447', '#6b5636', '#43302a', '#7a6a50', '#3b2e26', '#52422f'];
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
  const last = useRef(-1);
  useFrame(() => {
    const f = lf.current;
    // Only touch the lights when the factor actually changed (intro fade), not every frame.
    if (Math.abs(f - last.current) < 1e-4) return;
    last.current = f;
    hemi.current.intensity = 0.7 * f;
    key.current.intensity = 2.4 * f;
    lamp.current.intensity = 0.7 * f;
    hall.current.intensity = 7 * f;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#d8c9ae', '#3a2c20', 1]} />
      <directionalLight
        ref={key}
        position={[7, 5, -1]}
        color="#ffe6c0"
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
      <pointLight ref={lamp} position={[1.1, 1.3, -3.15]} color="#ffcf94" distance={5} decay={2} />
      <pointLight ref={hall} position={[0, 3.0, 6.4]} color="#ffd8a6" distance={9} decay={2} />
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
      plaqueL: toTex(plaqueCanvas('MAAZ', 'ENGINEERING')),
      plaqueR: toTex(plaqueCanvas('STUDIO', 'WORKSPACE')),
      main: toTex(mainScreenCanvas()),
      vert: toTex(vertScreenCanvas()),
      print1: toTex(printCanvas([['DISCIPLINE', 64, 260], ['GREATER THAN', 46, 330], ['MOTIVATION', 64, 400], ['Great software is never accidental.', 25, 560, 600], ['ENGINEERED WITH INTENT', 22, 620, 600]])),
      print2: toTex(printCanvas([['FIRMITAS', 64, 260], ['UTILITAS', 64, 340], ['VENUSTAS', 64, 420], ['Strength, utility and beauty.', 26, 560, 600], ['Vitruvius', 22, 620, 600]])),
      quoteBack: toTex(quoteCanvas(1200, 800, ['Form ever follows', 'function.'], 'LOUIS SULLIVAN', 84)),
      quoteRight: toTex(quoteCanvas(560, 760, ['A house is a machine', 'for living in.'], 'LE CORBUSIER', 36)),
      quoteLeft: toTex(quoteCanvas(560, 760, ['Less', 'is more.'], 'MIES VAN DER ROHE', 96)),
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
        <Poster w={1.2} h={0.8} tex={tex.quoteBack} position={[0, 2.35, -3.582]} />
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