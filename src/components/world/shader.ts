/*
  The world: one full-screen fragment shader, ported from the approved prototype
  (docs/superpowers/specs/clearing-reference/prototype-source.html). Changed since, for
  the warm finish (scene.ts; refinement R1), all at uDawn > 0 only, so the night at
  dawn 0 is exactly the prototype's:
  - dawn is an amber, sodium-leaning glow concentrated at the horizon band (sky, fog
    near the horizon, and its reflection on the water), not a lift of the whole sky and
    fog toward daylight grey;
  - facades, pier and rail stay near night-dark, and fewer windows go out;
  - a lit window fades out over a short band instead of switching off at a threshold,
    so nothing steps as dawn rises.
  And, in refinement R6, the foreground below the railing (y < uPier) is a boardwalk deck,
  not one flat colour: boards running along the waterfront, foreshortened (about four
  across, narrower toward the rail), staggered end joints that pan with the rail, a tone
  per board and grain along it, a lit lip under the rail posts, and the lamp's and the
  dawn's warm spill. The flat slab was the strip at the bottom of every chapter.
  Uniform names equal the keys sceneState() returns; tests/unit/shader.test.ts
  holds them together.
*/

export const VERTEX_SRC = "attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }";

export const FRAGMENT_SRC = [
  "precision highp float;",
  "uniform vec2 uRes; uniform float uTime, uFog, uDawn, uN, uFlash, uHz, uPier, uLampX, uMidX, uDownX, uPar, uAmp, uFerry, uPlane, uMist, uRush, uLamp;",
  "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
  "float h1(float n){return fract(sin(n*12.9898+1.7)*43758.5453);}",
  "float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}",
  "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}",
  "vec4 layer(float x,float y,float hz,float dens,float seed,float amp,float far){",
  "  float q=x*dens+seed*13.; float c=floor(q); float fx=fract(q); float cx=(c-seed*13.+0.5)/dens;",
  "  float boost=0.30*exp(-pow((cx-uMidX)/0.22,2.))+0.22*exp(-pow((cx-uDownX)/0.13,2.));",
  "  float bh=(0.012+0.06*pow(h1(c+seed*7.),2.)+boost*(0.35+0.65*h1(c*1.31+seed)))*amp*uAmp;",
  "  if(fx<0.07||fx>0.93||y<hz||y>hz+bh) return vec4(0.);",
  "  float ry=(y-hz)*230./amp; float rx=fx*7.; vec2 cell=vec2(floor(rx),floor(ry)); vec2 f=fract(vec2(rx,ry));",
  "  float win=step(0.2,f.x)*step(f.x,0.8)*step(0.25,f.y)*step(f.y,0.75);",
  "  float wh=hash(cell+c*0.37+seed)-0.64; float on=step(0.,wh)*smoothstep(-0.05,0.,wh-uDawn*0.3*hash(cell+c))*win*(1.-uDawn*0.6);",
  "  vec3 wc=mix(vec3(1.,.78,.48),vec3(.78,.86,1.),step(.8,hash(cell*1.9+c)))*(.45+.55*hash(cell+c+3.));",
  "  vec3 fac=mix(vec3(.018,.024,.027)+far*vec3(.012,.014,.014),vec3(.045,.038,.034)+far*vec3(.05,.035,.022),uDawn);",
  "  float gr=clamp((y-hz)/bh,0.,1.); fac*=mix(1.,0.78+0.4*gr,uDawn); fac+=vec3(.10,.07,.04)*uDawn*smoothstep(0.75,0.95,fx)*(1.-far);",
  "  float gl=step(0.86,hash(cell*2.3+c+seed))*win*uDawn;",
  "  return vec4(fac+wc*on*(1.-far*0.35)+vec3(1.,.84,.66)*gl*0.32*(1.-far*0.5),1.);",
  "}",
  "vec3 sky(float y,float hz){ float h=y-hz; vec3 n=mix(vec3(.05,.058,.06),vec3(.008,.014,.017),smoothstep(0.,.5,h)); n+=vec3(.10,.065,.035)*exp(-h*9.);",
  "  return n+vec3(1.45,.72,.2)*exp(-max(h,0.)*12.)*uDawn; }",
  "vec3 scene(float x,float y,float hz){ vec3 c=sky(y,hz); vec4 a=layer(x+uPar*0.5,y,hz,34.,0.,0.78,1.); if(a.w>0.) c=a.rgb; vec4 b=layer(x+uPar,y,hz,17.,1.,1.,0.); if(b.w>0.) c=b.rgb;",
  "  float pr=step(abs(y-hz-0.004),0.0015)*step(0.55,hash(vec2(floor((x+uPar)*46.),3.)))*step(abs(fract((x+uPar)*46.)-0.5),0.12);",
  "  c+=vec3(1.,.62,.2)*pr*0.7*(1.-uDawn); return c; }",
  "void main(){",
  "  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y; float x=uv.x*asp; float y=uv.y; float t=uTime; float tw=t*(1.+uRush*2.5); float hz=uHz; vec3 col;",
  "  float fxp=mod(t*0.016+uRush*t*0.02,asp+0.6)-0.3; float fyp=hz-0.045;",
  "  if(y>=hz){ col=scene(x,y,hz); }",
  "  else { float dy=hz-y; float wob=(noise(vec2(x*7.,y*140.-tw*0.9))-.5)*0.022*(dy*4.+0.08);",
  "    vec3 r=scene(x+wob,hz+dy*1.04,hz); col=r*0.30+vec3(.006,.01,.012)+vec3(.06,.035,.012)*uDawn*exp(-dy*6.);",
  "    float jit=((noise(vec2(y*55.,tw*2.3))-.5)+(noise(vec2(y*130.,tw*3.1+5.))-.5)*.6)*0.11/sqrt(uN);",
  "    float d=x-(uLampX+jit); float w=0.003+dy*0.018; float colm=exp(-d*d/(w*w))*smoothstep(0.,0.015,dy);",
  "    col+=vec3(1.,.62,.17)*colm*0.95*(1.-uDawn*0.97)*uLamp;",
  "    float fbelow=fyp-y; float fd=x-(fxp+(noise(vec2(y*90.,tw*2.))-.5)*0.01);",
  "    col+=vec3(1.,.93,.82)*uFerry*exp(-fd*fd/(0.00004+fbelow*fbelow*0.002))*step(0.,fbelow)*exp(-fbelow*12.)*0.55;",
  "    float wk=exp(-pow((y-fyp)/0.003,2.))*step(x,fxp)*exp(-(fxp-x)*9.)*uFerry; col+=vec3(.7,.75,.72)*wk*0.2*(0.6+0.4*noise(vec2(x*80.,tw*3.))); }",
  "  float fn=fbm(vec2(x*1.4+tw*0.015,y*3.2-t*0.004)); float fn2=fbm(vec2(x*3.3-tw*0.02,y*7.+3.));",
  "  float band=0.5+0.75*exp(-abs(y-hz-0.05)*7.);",
  "  float fog=clamp((uFog+uMist*0.45*exp(-abs(y-hz-0.12)*4.))*(0.32+1.9*fn*fn2*1.6)*band,0.,0.96)*(1.-uFlash);",
  "  vec3 fogc=vec3(0.15,0.17,0.165)+(vec3(.12,.08,.04)+vec3(.26,.14,.04)*uDawn)*exp(-abs(y-hz)*5.);",
  "  col=mix(col,fogc,fog);",
  "  vec2 lp=vec2(uLampX,hz+0.012); float ld=length(vec2(x,y)-lp);",
  "  col+=vec3(1.,.64,.2)*(exp(-ld*110.)*1.5+exp(-ld*9.)*0.14*(0.4+uFog))*(1.-uDawn*0.97)*uLamp;",
  "  float fl=length(vec2(x-fxp,(y-fyp)*1.6)); col+=vec3(1.,.94,.84)*uFerry*(exp(-fl*260.)*1.4+exp(-fl*30.)*0.08);",
  "  float pxp=mod(t*0.022,asp+0.5)-0.25; float pyp=hz+0.40+0.025*sin(pxp*2.);",
  "  float pl=length(vec2(x-pxp,y-pyp)); float blink=step(0.82,fract(t*0.9));",
  "  col+=uPlane*(vec3(1.)*exp(-pl*420.)*(0.5+1.6*blink)+vec3(1.,.25,.2)*exp(-length(vec2(x-pxp+0.006,y-pyp))*700.)*0.9);",
  "  if(y<uPier){ float d=clamp((uPier-y)/uPier,0.,1.); float dk=d+1.;",
  "    float z=8./dk; float bi=floor(z); float fz=fract(z); float bpx=uPier*uRes.y*dk*dk/8.;",
  "    float seam=1.-smoothstep(.6,1.6,min(fz,1.-fz)*bpx);",
  "    float wx=(x-asp*.5)/dk+uPar*1.4; float u=wx/.18+h1(bi)*3.1; float si=floor(u); float fu=fract(u);",
  "    float joint=1.-smoothstep(.6,1.6,min(fu,1.-fu)*.18*dk*uRes.y);",
  "    float tone=(.55+.9*hash(vec2(si,bi)))*(.65+.7*noise(vec2(wx*38.,z*6.)))*(.7+.6*noise(vec2(wx*9.,bi*3.7)));",
  "    vec3 dc=mix(vec3(.034,.036,.037),vec3(.066,.05,.037),uDawn)*tone*mix(1.3,.95,d);",
  "    dc+=vec3(.09,.05,.02)*uDawn*(1.-d*.6);",
  "    dc+=vec3(1.,.64,.2)*exp(-pow((x-uLampX)/(.06+.22*d),2.))*(1.-d*.5)*.04*uLamp*(1.-uDawn*.97);",
  "    dc*=1.-.55*max(seam,joint);",
  "    dc+=vec3(.035,.038,.038)*exp(-(uPier-y)*uRes.y/1.2);",
  "    col=dc; }",
  "  float rail=smoothstep(0.0025,0.0,abs(y-(uPier+0.05)))+step(y,uPier+0.05)*step(uPier,y)*step(fract((x+uPar*1.4)*8.),0.03);",
  "  col=mix(col,mix(vec3(0.008),vec3(.03,.024,.018),uDawn),clamp(rail,0.,1.)*0.95);",
  "  vec2 vq=uv-0.5; col*=1.-dot(vq,vq)*0.5;",
  "  col+=(hash(uv*uRes+fract(t*7.)*100.)-.5)*0.03;",
  "  gl_FragColor=vec4(col,1.);",
  "}",
].join("\n");

export const UNIFORMS = [
  "uTime",
  "uFog",
  "uDawn",
  "uN",
  "uFlash",
  "uHz",
  "uPier",
  "uLampX",
  "uMidX",
  "uDownX",
  "uPar",
  "uAmp",
  "uFerry",
  "uPlane",
  "uMist",
  "uRush",
  "uLamp",
] as const;

export type UniformName = (typeof UNIFORMS)[number];
