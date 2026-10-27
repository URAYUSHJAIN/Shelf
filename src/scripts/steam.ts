// Mug steam: a small fragment shader of rising, noise-bent wisps. GSAP owns
// time and intensity, so frames are drawn only while a puff plays; at rest a
// single faint frame stays. Without WebGL the SVG wisps remain (returns null).
import { gsap } from 'gsap';

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform float a;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f*=f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,w=.5;for(int k=0;k<4;k++){v+=w*n(p);p*=2.;w*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;float y=uv.y;
  float x=uv.x+(fbm(vec2(uv.x*3.,y*2.-t*.6))-.5)*.55*y;
  float s=exp(-pow((x-.4)/(.04+.07*y),2.))+.8*exp(-pow((x-.6)/(.035+.06*y),2.));
  float d=smoothstep(.3,.75,fbm(vec2(uv.x*6.,y*5.-t*1.3)));
  float al=clamp(s*d*smoothstep(0.,.18,y)*(1.-smoothstep(.4,1.,y))*a,0.,.9);
  gl_FragColor=vec4(al,al,al,al);
}`;

export function initSteam(canvas: HTMLCanvasElement, reduced: () => boolean) {
  const gl = canvas.getContext('webgl', { antialias: false });
  if (!gl) return null;
  const prog = gl.createProgram()!;
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(prog, s);
  }
  gl.bindAttribLocation(prog, 0, 'p');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const [uR, uT, uA] = [u('r'), u('t'), u('a')];

  const REST = 0.35;
  const state = { t: 2, a: REST };
  const draw = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h) return; // hidden on narrow screens
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uR, w, h);
    gl.uniform1f(uT, state.t);
    gl.uniform1f(uA, state.a);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  draw();
  window.addEventListener('resize', draw);

  // One puff: about five seconds of rising smoke, then back to the still rest frame.
  return function play() {
    if (reduced() || gsap.isTweening(state)) return;
    gsap.timeline({ onUpdate: draw })
      .to(state, { t: '+=5', duration: 5.2, ease: 'none' }, 0)
      .to(state, { keyframes: { '25%': { a: 1 }, '70%': { a: 0.9 }, '100%': { a: REST } }, duration: 5.2, easeEach: 'sine.inOut' }, 0);
  };
}
