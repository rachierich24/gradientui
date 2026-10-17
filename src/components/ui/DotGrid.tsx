'use client';

import React, { useEffect, useRef } from 'react';
import './DotGrid.css';

const SIM_VS = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const SIM_FS = `#version 300 es
precision highp float;

uniform vec2 u_gridSize;
uniform vec2 u_gridOrigin;
uniform float u_spacing;
uniform vec2 u_mouse;
uniform float u_mouseActive;
uniform float u_radius;
uniform float u_force;
uniform float u_spring;
uniform float u_damping;
uniform int u_rippleCount;
uniform vec3 u_ripples[6];
uniform float u_rippleSpeed;
uniform float u_rippleWidth;
uniform float u_rippleF;
uniform float u_rippleDecay;
uniform sampler2D u_prevState;

out vec4 fragColor;

const float TAU = 6.28318530718;

float hash11(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  vec2 home = u_gridOrigin + vec2(cell) * u_spacing;

  vec4 state = texelFetch(u_prevState, cell, 0);
  vec2 offset = state.xy;
  vec2 vel = state.zw;
  vec2 pos = home + offset;

  float idHash = hash11(float(cell.x) * 1.7 + float(cell.y) * 73.0);
  float springK = u_spring * (0.8 + idHash * 0.4);

  vel += -offset * springK;

  if (u_mouseActive > 0.001) {
    vec2 c = pos - u_mouse;
    float dist2 = dot(c, c);
    float r2 = u_radius * u_radius;
    if (dist2 < r2 && dist2 > 0.01) {
      float dist = sqrt(dist2);
      float t01 = 1.0 - dist / u_radius;
      float f = t01 * t01 * u_force * u_mouseActive;
      vel += (c / dist) * f;
    }
  }

  for (int i = 0; i < 6; i++) {
    if (i >= u_rippleCount) break;
    vec3 rip = u_ripples[i];
    float age = rip.z;
    if (age < 0.0) continue;
    vec2 r = pos - rip.xy;
    float dist = length(r);
    float wave = age * u_rippleSpeed;
    float diff = dist - wave;
    float ring = exp(-(diff * diff) / u_rippleWidth);
    float ampBase = exp(-age * u_rippleDecay) * u_rippleF;
    float amp = ring * ampBase;
    if (dist > 0.01) {
      vel += (r / dist) * amp;
    } else {
      float ang = hash11(idHash + float(i) * 7.0) * TAU;
      vel += vec2(cos(ang), sin(ang)) * amp;
    }
  }

  vel *= u_damping;
  offset += vel;

  fragColor = vec4(offset, vel);
}
`;

const RENDER_VS = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_gridSize;
uniform vec2 u_gridOrigin;
uniform float u_spacing;
uniform float u_time;
uniform float u_dotSize;
uniform float u_reducedMotion;
uniform sampler2D u_state;

out float v_alpha;
out float v_energy;

const vec3 WAVE_KX = vec3(0.018, -0.012, 0.006);
const vec3 WAVE_KY = vec3(0.009, 0.016, -0.014);
const vec3 WAVE_SPEED = vec3(0.55, 0.38, 0.22);

void main() {
  int id = gl_VertexID;
  int cols = int(u_gridSize.x);
  int row = id / cols;
  int col = id - row * cols;

  vec2 home = u_gridOrigin + vec2(float(col), float(row)) * u_spacing;
  vec4 state = texelFetch(u_state, ivec2(col, row), 0);
  vec2 pos = home + state.xy;

  vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = u_dotSize;

  float velLength = length(state.zw);
  float offsetLength = length(state.xy);
  v_energy = clamp(velLength * 0.18 + offsetLength * 0.06, 0.0, 1.0);

  if (u_reducedMotion > 0.5) {
    v_alpha = 0.6;
  } else {
    vec3 phase = vec3(
      home.x * WAVE_KX.x + home.y * WAVE_KY.x,
      home.x * WAVE_KX.y + home.y * WAVE_KY.y,
      home.x * WAVE_KX.z + home.y * WAVE_KY.z
    ) + u_time * WAVE_SPEED;
    float flick = (sin(phase.x) + sin(phase.y) + sin(phase.z)) / 3.0;
    v_alpha = 0.35 + 0.65 * (0.5 + 0.5 * flick);
  }
}
`;

const RENDER_FS = `#version 300 es
precision highp float;

uniform vec3 u_baseColor;
uniform vec3 u_activeColor;
uniform float u_opacity;

in float v_alpha;
in float v_energy;
out vec4 fragColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float dist2 = dot(c, c);
  // smoothstep on squared distance (0.35^2 = 0.1225, 0.5^2 = 0.25); avoids sqrt per fragment
  float mask = 1.0 - smoothstep(0.1225, 0.25, dist2);
  if (mask <= 0.0) discard;
  
  vec3 col = mix(u_baseColor, u_activeColor, v_energy);
  float a = v_alpha * mask * u_opacity;
  fragColor = vec4(col * a, a);
}
`;

function hexToRgb(color: string): [number, number, number] {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
  if (!match) return [0.58, 0.64, 0.72];
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];
  return [0, 2, 4].map(idx => parseInt(hex.slice(idx, idx + 2), 16) / 255) as [number, number, number];
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info ?? 'unknown'}`);
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info ?? 'unknown'}`);
  }
  return program;
}

function createFboTexture(gl: WebGL2RenderingContext, width: number, height: number) {
  const tex = gl.createTexture();
  if (!tex) throw new Error('createTexture failed');
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fb = gl.createFramebuffer();
  if (!fb) throw new Error('createFramebuffer failed');
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return { fb, tex };
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  spacing?: number;
  baseColor?: string;
  activeColor?: string;
  radius?: number;
  force?: number;
  spring?: number;
  damping?: number;
  rippleSpeed?: number;
  rippleWidth?: number;
  rippleF?: number;
  rippleDecay?: number;
  ambientRipples?: boolean;
  opacity?: number;
  intro?: boolean;
  mouseInteraction?: boolean;
  clickShock?: boolean;
  paused?: boolean;
  dpr?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function DotGrid({
  dotSize = 1.3,
  gap = 11,
  spacing,
  baseColor = '#94A3B8',
  activeColor = '#1FA952',
  radius = 150,
  force = 10,
  spring = 0.018,
  damping = 0.82,
  rippleSpeed = 420,
  rippleWidth = 500,
  rippleF = 10,
  rippleDecay = 2.2,
  ambientRipples = true,
  opacity = 0.85,
  intro = true,
  mouseInteraction = true,
  clickShock = true,
  paused = false,
  dpr,
  className = '',
  style,
}: DotGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Allow spacing or gap (default to 11px for dense Ramp grid)
  const actualSpacing = spacing ?? gap ?? 11;

  const propsRef = useRef({
    dotSize,
    actualSpacing,
    baseColor,
    activeColor,
    radius,
    force,
    spring,
    damping,
    rippleSpeed,
    rippleWidth,
    rippleF,
    rippleDecay,
    ambientRipples,
    opacity,
    intro,
    mouseInteraction,
    clickShock,
    paused,
    dpr,
  });

  propsRef.current = {
    dotSize,
    actualSpacing,
    baseColor,
    activeColor,
    radius,
    force,
    spring,
    damping,
    rippleSpeed,
    rippleWidth,
    rippleF,
    rippleDecay,
    ambientRipples,
    opacity,
    intro,
    mouseInteraction,
    clickShock,
    paused,
    dpr,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check WebGL2 and float color buffer extension
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const ext = gl.getExtension('EXT_color_buffer_float');
    if (!ext) return;

    // Compile simulation and render programs
    const simVs = compileShader(gl, gl.VERTEX_SHADER, SIM_VS);
    const simFs = compileShader(gl, gl.FRAGMENT_SHADER, SIM_FS);
    const simProg = linkProgram(gl, simVs, simFs);

    const renderVs = compileShader(gl, gl.VERTEX_SHADER, RENDER_VS);
    const renderFs = compileShader(gl, gl.FRAGMENT_SHADER, RENDER_FS);
    const renderProg = linkProgram(gl, renderVs, renderFs);

    gl.disable(gl.DEPTH_TEST);

    // Uniform locations for simulation program
    const simUniforms = {
      gridSize: gl.getUniformLocation(simProg, 'u_gridSize'),
      gridOrigin: gl.getUniformLocation(simProg, 'u_gridOrigin'),
      spacing: gl.getUniformLocation(simProg, 'u_spacing'),
      mouse: gl.getUniformLocation(simProg, 'u_mouse'),
      mouseActive: gl.getUniformLocation(simProg, 'u_mouseActive'),
      radius: gl.getUniformLocation(simProg, 'u_radius'),
      force: gl.getUniformLocation(simProg, 'u_force'),
      spring: gl.getUniformLocation(simProg, 'u_spring'),
      damping: gl.getUniformLocation(simProg, 'u_damping'),
      rippleCount: gl.getUniformLocation(simProg, 'u_rippleCount'),
      ripples: gl.getUniformLocation(simProg, 'u_ripples'),
      rippleSpeed: gl.getUniformLocation(simProg, 'u_rippleSpeed'),
      rippleWidth: gl.getUniformLocation(simProg, 'u_rippleWidth'),
      rippleF: gl.getUniformLocation(simProg, 'u_rippleF'),
      rippleDecay: gl.getUniformLocation(simProg, 'u_rippleDecay'),
      prevState: gl.getUniformLocation(simProg, 'u_prevState'),
    };

    // Uniform locations for render program
    const renderUniforms = {
      resolution: gl.getUniformLocation(renderProg, 'u_resolution'),
      gridSize: gl.getUniformLocation(renderProg, 'u_gridSize'),
      gridOrigin: gl.getUniformLocation(renderProg, 'u_gridOrigin'),
      spacing: gl.getUniformLocation(renderProg, 'u_spacing'),
      time: gl.getUniformLocation(renderProg, 'u_time'),
      dotSize: gl.getUniformLocation(renderProg, 'u_dotSize'),
      reducedMotion: gl.getUniformLocation(renderProg, 'u_reducedMotion'),
      state: gl.getUniformLocation(renderProg, 'u_state'),
      baseColor: gl.getUniformLocation(renderProg, 'u_baseColor'),
      activeColor: gl.getUniformLocation(renderProg, 'u_activeColor'),
      opacity: gl.getUniformLocation(renderProg, 'u_opacity'),
    };

    // Full screen quad buffer for simulation
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    const aPos = gl.getAttribLocation(simProg, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // Empty VAO for drawing gl.POINTS via gl_VertexID in render shader
    const pointVao = gl.createVertexArray();

    let cols = 0;
    let rows = 0;
    let originX = 0;
    let originY = 0;
    let viewW = 0;
    let viewH = 0;
    let pixelRatio = 1;
    let fbos: [{ fb: WebGLFramebuffer; tex: WebGLTexture }, { fb: WebGLFramebuffer; tex: WebGLTexture }] | null = null;
    let currentFboIdx = 0;
    const bounds = { left: 0, top: 0, width: 0, height: 0 };

    const updateBounds = () => {
      const rect = canvas.getBoundingClientRect();
      bounds.left = rect.left;
      bounds.top = rect.top;
      bounds.width = rect.width;
      bounds.height = rect.height;
    };

    const resize = () => {
      const p = propsRef.current;
      pixelRatio = Math.min(p.dpr ?? window.devicePixelRatio ?? 1, 2);
      const rect = container.getBoundingClientRect();
      viewW = rect.width;
      viewH = rect.height;

      const pxW = Math.max(1, Math.floor(viewW * pixelRatio));
      const pxH = Math.max(1, Math.floor(viewH * pixelRatio));
      canvas.width = pxW;
      canvas.height = pxH;

      const sp = p.actualSpacing;
      originX = (viewW % sp) / 2 + sp / 2;
      originY = (viewH % sp) / 2 + sp / 2;
      cols = Math.max(1, Math.ceil((viewW + sp - originX) / sp));
      rows = Math.max(1, Math.ceil((viewH + sp - originY) / sp));

      if (fbos) {
        gl.deleteFramebuffer(fbos[0].fb);
        gl.deleteTexture(fbos[0].tex);
        gl.deleteFramebuffer(fbos[1].fb);
        gl.deleteTexture(fbos[1].tex);
      }
      fbos = [createFboTexture(gl, cols, rows), createFboTexture(gl, cols, rows)];
      currentFboIdx = 0;

      gl.useProgram(simProg);
      gl.uniform2f(simUniforms.gridSize, cols, rows);
      gl.uniform2f(simUniforms.gridOrigin, originX, originY);
      gl.uniform1f(simUniforms.spacing, sp);
      gl.uniform1f(simUniforms.radius, p.radius);
      gl.uniform1f(simUniforms.force, p.force);
      gl.uniform1f(simUniforms.spring, p.spring);
      gl.uniform1f(simUniforms.damping, p.damping);
      gl.uniform1f(simUniforms.rippleSpeed, p.rippleSpeed);
      gl.uniform1f(simUniforms.rippleWidth, p.rippleWidth);
      gl.uniform1f(simUniforms.rippleF, p.rippleF);
      gl.uniform1f(simUniforms.rippleDecay, p.rippleDecay);

      gl.useProgram(renderProg);
      gl.uniform2f(renderUniforms.resolution, viewW, viewH);
      gl.uniform2f(renderUniforms.gridSize, cols, rows);
      gl.uniform2f(renderUniforms.gridOrigin, originX, originY);
      gl.uniform1f(renderUniforms.spacing, sp);
      // Small, dense point size (scales with pixel ratio for crisp subpixel dots)
      gl.uniform1f(renderUniforms.dotSize, p.dotSize * pixelRatio + 0.6);
      gl.uniform1f(renderUniforms.reducedMotion, reducedMotion ? 1 : 0);

      const baseRgb = hexToRgb(p.baseColor);
      const activeRgb = hexToRgb(p.activeColor);
      gl.uniform3f(renderUniforms.baseColor, baseRgb[0], baseRgb[1], baseRgb[2]);
      gl.uniform3f(renderUniforms.activeColor, activeRgb[0], activeRgb[1], activeRgb[2]);
      gl.uniform1f(renderUniforms.opacity, p.opacity);

      updateBounds();
    };

    resize();

    // Interaction state matching Ramp
    const mouseRaw = { x: -9999, y: -9999 };
    const mouseSmooth = { x: -9999, y: -9999 };
    let mouseInside = false;
    let mouseActiveTimer = -10;
    let rippleActivityTimer = -100;
    let mouseOverInteractiveUI = false;
    let lastHoverCheckTime = 0;
    let elapsedTime = 0;
    const ripples: { x: number; y: number; born: number }[] = [];
    const rippleBuffer = new Float32Array(18);

    // Initial ambient ripple (spawns Ramp's signature left-hand contour ring)
    if (propsRef.current.intro && !reducedMotion) {
      setTimeout(() => {
        ripples.push({
          x: Math.min(260, viewW * 0.22),
          y: Math.min(380, viewH * 0.42),
          born: elapsedTime,
        });
        rippleActivityTimer = elapsedTime;
      }, 350);
    }

    // Periodic ambient ripples (subtle breathing waves every 8.5s if ambientRipples is on)
    let ambientInterval: NodeJS.Timeout | null = null;
    if (propsRef.current.ambientRipples && !reducedMotion) {
      ambientInterval = setInterval(() => {
        if (ripples.length < 3 && !mouseInside) {
          const rx = viewW * (0.15 + Math.random() * 0.3);
          const ry = viewH * (0.3 + Math.random() * 0.4);
          ripples.push({ x: rx, y: ry, born: elapsedTime });
          rippleActivityTimer = elapsedTime;
        }
      }, 8500);
    }

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion || !propsRef.current.mouseInteraction) return;
      if (e.clientY < bounds.top - 150 || e.clientY > bounds.top + bounds.height + 150) {
        if (mouseInside) {
          mouseRaw.x = -9999;
          mouseRaw.y = -9999;
          mouseInside = false;
          mouseOverInteractiveUI = false;
        }
        return;
      }

      const now = e.timeStamp;
      if (now - lastHoverCheckTime > 90) {
        const target = e.target;
        mouseOverInteractiveUI =
          target instanceof HTMLElement &&
          !!target.closest('a, button, input, select, textarea, label, [role="button"], [role="tab"]');
        lastHoverCheckTime = now;
      }

      if (mouseOverInteractiveUI) {
        mouseRaw.x = -9999;
        mouseRaw.y = -9999;
        mouseInside = false;
        return;
      }

      mouseRaw.x = e.clientX - bounds.left;
      mouseRaw.y = e.clientY - bounds.top;
      mouseInside = true;

      if (mouseSmooth.x < -9000) {
        mouseSmooth.x = mouseRaw.x;
        mouseSmooth.y = mouseRaw.y;
      }
      mouseActiveTimer = elapsedTime;
      rippleActivityTimer = elapsedTime;
    };

    const onPointerLeave = () => {
      mouseRaw.x = -9999;
      mouseRaw.y = -9999;
      mouseInside = false;
      mouseOverInteractiveUI = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary || reducedMotion || mouseOverInteractiveUI || !propsRef.current.clickShock) return;
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;

      ripples.push({ x, y, born: elapsedTime });
      if (ripples.length > 6) ripples.shift();
      rippleActivityTimer = elapsedTime;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        mouseActiveTimer = -10;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Frame animation loop
    let rafId = 0;
    let lastTime = performance.now();
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (!isVisible || !fbos || propsRef.current.paused) return;

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsedTime += dt;
      updateBounds();

      // Check if ripples or mouse are actively driving the physics simulation
      const hasActiveRipples = ripples.some(r => elapsedTime - r.born < 2.0);
      const isSimActive = mouseInside || hasActiveRipples || elapsedTime - rippleActivityTimer < 2.5;

      if (isSimActive) {
        if (mouseInside) {
          mouseSmooth.x += (mouseRaw.x - mouseSmooth.x) * 0.8;
          mouseSmooth.y += (mouseRaw.y - mouseSmooth.y) * 0.8;
        } else {
          mouseSmooth.x += (-9999 - mouseSmooth.x) * 0.08;
          mouseSmooth.y += (-9999 - mouseSmooth.y) * 0.08;
        }

        const sinceActive = elapsedTime - mouseActiveTimer;
        const driveStrength = sinceActive > 1.0 ? 0 : Math.exp(-7.0 * sinceActive);
        const mouseActive = mouseInside && driveStrength > 0.001 ? driveStrength : 0;

        // Pack active ripples into uniform array
        let validCount = 0;
        for (let i = 0; i < ripples.length; i++) {
          const age = elapsedTime - ripples[i].born;
          if (age < 2.0) {
            ripples[validCount] = ripples[i];
            if (validCount < 6) {
              rippleBuffer[3 * validCount] = ripples[i].x;
              rippleBuffer[3 * validCount + 1] = ripples[i].y;
              rippleBuffer[3 * validCount + 2] = age;
            }
            validCount++;
          }
        }
        ripples.length = validCount;
        const activeCount = Math.min(validCount, 6);
        for (let i = 3 * activeCount; i < rippleBuffer.length; i++) {
          rippleBuffer[i] = 0;
        }

        // Run GPGPU Simulation Step
        const currentFbo = fbos[currentFboIdx];
        const nextFbo = fbos[1 - currentFboIdx];

        gl.bindFramebuffer(gl.FRAMEBUFFER, nextFbo.fb);
        gl.viewport(0, 0, cols, rows);
        gl.disable(gl.BLEND);
        gl.useProgram(simProg);
        gl.uniform2f(simUniforms.mouse, mouseSmooth.x, mouseSmooth.y);
        gl.uniform1f(simUniforms.mouseActive, mouseActive);
        gl.uniform1i(simUniforms.rippleCount, activeCount);
        gl.uniform3fv(simUniforms.ripples, rippleBuffer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentFbo.tex);
        gl.bindVertexArray(quadVao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        currentFboIdx = 1 - currentFboIdx;
      }

      // Render Step to Screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(renderProg);
      gl.uniform1f(renderUniforms.time, elapsedTime);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fbos[currentFboIdx].tex);
      gl.bindVertexArray(pointVao);
      gl.drawArrays(gl.POINTS, 0, cols * rows);
      gl.bindVertexArray(null);
    };

    rafId = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      if (ambientInterval) clearInterval(ambientInterval);
      resizeObserver.disconnect();
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      gl.deleteProgram(simProg);
      gl.deleteProgram(renderProg);
      gl.deleteShader(simVs);
      gl.deleteShader(simFs);
      gl.deleteShader(renderVs);
      gl.deleteShader(renderFs);
      gl.deleteBuffer(quadBuf);
      gl.deleteVertexArray(quadVao);
      gl.deleteVertexArray(pointVao);
      if (fbos) {
        gl.deleteFramebuffer(fbos[0].fb);
        gl.deleteTexture(fbos[0].tex);
        gl.deleteFramebuffer(fbos[1].fb);
        gl.deleteTexture(fbos[1].tex);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`dot-grid ${className}`.trim()} style={style}>
      <canvas ref={canvasRef} className="dot-grid__canvas" />
    </div>
  );
}

export default DotGrid;
