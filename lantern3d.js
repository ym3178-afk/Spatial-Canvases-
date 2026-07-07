
(function(){
const container=document.getElementById("lantern-canvas");

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0B1210);
scene.fog=new THREE.FogExp2(0x0B1210,.052);

const camera=new THREE.PerspectiveCamera(42,container.clientWidth/container.clientHeight,.1,120);
camera.position.set(6.4,4.8,8.4);

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(container.clientWidth,container.clientHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.065;
controls.autoRotate=true;
controls.autoRotateSpeed=.28;

const matPaper=new THREE.MeshStandardMaterial({color:0xE8D8B8,roughness:.78,metalness:.02});
const matOld=new THREE.MeshStandardMaterial({color:0xC8AD7A,roughness:.7,metalness:.03});
const matRed=new THREE.MeshStandardMaterial({color:0x7F2628,roughness:.52,metalness:.04});
const matBrass=new THREE.MeshStandardMaterial({color:0xA57936,roughness:.36,metalness:.38});
const matInk=new THREE.MeshStandardMaterial({color:0x2A201A,roughness:.84});
const matDeep=new THREE.MeshStandardMaterial({color:0x111A17,roughness:.9});
const matGlow=new THREE.MeshStandardMaterial({color:0xD1A75C,emissive:0xA57936,emissiveIntensity:1.15,roughness:.22});

// cinematic base altar
const base=new THREE.Mesh(new THREE.CylinderGeometry(4.7,5.4,.28,128),matDeep);
base.position.y=-.5;
base.receiveShadow=true;
scene.add(base);

// layered brass rings
const rings=[];
for(let i=0;i<6;i++){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.0+i*.55,.012+i*.002,10,180),matBrass);
  ring.rotation.x=Math.PI/2;
  ring.position.y=-.34+i*.018;
  scene.add(ring);
  rings.push(ring);
}

// luminous core column
const coreGroup=new THREE.Group();
scene.add(coreGroup);

const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,3),matGlow);
core.position.y=1.12;
core.castShadow=true;
coreGroup.add(core);

const innerRing1=new THREE.Mesh(new THREE.TorusGeometry(.92,.018,12,160),matBrass);
innerRing1.position.y=1.12;
innerRing1.rotation.x=Math.PI/2;
coreGroup.add(innerRing1);

const innerRing2=new THREE.Mesh(new THREE.TorusGeometry(1.22,.012,12,160),matBrass);
innerRing2.position.y=1.12;
innerRing2.rotation.y=Math.PI/2;
coreGroup.add(innerRing2);

// paper arch / shrine wings
const papers=[];
const paperGroup=new THREE.Group();
scene.add(paperGroup);

function makePaper(w,h,material,seal){
  const g=new THREE.Group();
  const page=new THREE.Mesh(new THREE.BoxGeometry(w,.018,h),material);
  page.castShadow=true;
  page.receiveShadow=true;
  g.add(page);

  // ink lines
  for(let i=0;i<4;i++){
    const line=new THREE.Mesh(new THREE.BoxGeometry(w*.46-i*w*.04,.008,.008),matInk);
    line.position.set(-w*.08,.018,-h*.22+i*h*.12);
    g.add(line);
  }

  if(seal){
    const s=new THREE.Mesh(new THREE.CylinderGeometry(w*.08,w*.08,.012,24),matRed);
    s.rotation.x=Math.PI/2;
    s.position.set(w*.28,.022,h*.22);
    g.add(s);
  }
  return g;
}

// three vertical orbits, not just random cards
for(let layer=0;layer<3;layer++){
  const count=42+layer*18;
  const radius=1.8+layer*.72;
  for(let i=0;i<count;i++){
    const a=Math.PI*2*i/count;
    const y=-.05+Math.sin(a*2+layer)*.55+layer*.62;
    const g=makePaper(.38+Math.random()*.18,.26+Math.random()*.14,(i+layer)%5===0?matOld:matPaper,(i+layer)%6===0);
    g.position.set(Math.cos(a)*radius,y,Math.sin(a)*radius);
    g.rotation.set(Math.random()*.18-.09,-a+Math.PI/2,Math.random()*.35-.175);
    paperGroup.add(g);
    papers.push({mesh:g,angle:a,radius,y,layer,phase:Math.random()*Math.PI*2});
  }
}

// suspended red seals as constellation points
const seals=[];
for(let i=0;i<34;i++){
  const a=Math.random()*Math.PI*2;
  const r=1.2+Math.random()*4.1;
  const y=Math.random()*3.1+.25;
  const seal=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.012,24),matRed);
  seal.rotation.x=Math.PI/2;
  seal.position.set(Math.cos(a)*r,y,Math.sin(a)*r);
  scene.add(seal);
  seals.push({mesh:seal,a,r,y,speed:.08+Math.random()*.06});
}

// light dust, gives installation atmosphere
const dust=[];
const dustMat=new THREE.MeshStandardMaterial({color:0xE8D8B8,emissive:0xA57936,emissiveIntensity:.45,roughness:.4});
for(let i=0;i<180;i++){
  const d=new THREE.Mesh(new THREE.SphereGeometry(.008+Math.random()*.018,8,6),dustMat);
  d.position.set((Math.random()-.5)*8,Math.random()*4.4-.15,(Math.random()-.5)*7);
  scene.add(d);
  dust.push({mesh:d,phase:Math.random()*Math.PI*2,speed:.3+Math.random()*.6});
}

// directional paper-light panels behind shrine
const screenMat=new THREE.MeshStandardMaterial({color:0xE8D8B8,roughness:.8,transparent:true,opacity:.13,side:THREE.DoubleSide});
for(let i=0;i<5;i++){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(.9,2.8),screenMat);
  const a=-.75+i*.38;
  panel.position.set(Math.sin(a)*3.2,1.45, -3.0+Math.cos(a)*.2);
  panel.rotation.y=a*.45;
  scene.add(panel);
}

// lights
scene.add(new THREE.AmbientLight(0xCBB891,.48));

const key=new THREE.DirectionalLight(0xFFDFB0,1.35);
key.position.set(4.8,7,4.5);
key.castShadow=true;
scene.add(key);

const warm=new THREE.PointLight(0xD99A4E,3.2,9);
warm.position.set(0,1.25,0);
scene.add(warm);

const redGlow=new THREE.PointLight(0x7F2628,1.2,8);
redGlow.position.set(-3,1.8,2.4);
scene.add(redGlow);

const tealGlow=new THREE.PointLight(0x466B5E,.9,8);
tealGlow.position.set(3.2,1.4,-2.2);
scene.add(tealGlow);

// mouse subtle influence
const mouse={x:0,y:0};
container.addEventListener("mousemove",e=>{
  const r=container.getBoundingClientRect();
  mouse.x=((e.clientX-r.left)/r.width-.5)*2;
  mouse.y=-((e.clientY-r.top)/r.height-.5)*2;
});

const clock=new THREE.Clock();

function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  core.rotation.x+=.007;
  core.rotation.y+=.011;
  core.scale.setScalar(1+Math.sin(t*1.8)*.045);
  innerRing1.rotation.z=t*.38;
  innerRing2.rotation.x=t*.26;

  rings.forEach((r,i)=>{
    r.rotation.z=t*(.04+i*.012);
    r.scale.setScalar(1+Math.sin(t*.55+i)*.018);
  });

  paperGroup.rotation.y=t*.055;
  paperGroup.rotation.x=Math.sin(t*.18)*.035;

  papers.forEach((p,i)=>{
    const a=p.angle+t*(.07+p.layer*.018);
    const mousePull=.08*mouse.x*Math.sin(p.phase+t);
    p.mesh.position.x=Math.cos(a+mousePull)*p.radius;
    p.mesh.position.z=Math.sin(a+mousePull)*p.radius;
    p.mesh.position.y=p.y+Math.sin(t*.9+p.phase)*.07+mouse.y*.05;
    p.mesh.rotation.y=-a+Math.PI/2;
    p.mesh.rotation.z=Math.sin(t*.7+p.phase)*.08;
  });

  seals.forEach((s,i)=>{
    s.a+=s.speed*.006;
    s.mesh.position.x=Math.cos(s.a)*s.r;
    s.mesh.position.z=Math.sin(s.a)*s.r;
    s.mesh.position.y=s.y+Math.sin(t*.9+i)*.035;
    s.mesh.rotation.z+=.01;
  });

  dust.forEach((d,i)=>{
    d.mesh.position.y+=Math.sin(t*d.speed+d.phase)*.0015;
    d.mesh.position.x+=Math.sin(t*.35+d.phase)*.0009;
  });

  warm.position.x=mouse.x*.65;
  warm.position.y=1.25+mouse.y*.25;
  warm.intensity=2.9+Math.sin(t*1.5)*.38;

  redGlow.intensity=1.0+Math.sin(t*1.1)*.18;
  tealGlow.intensity=.75+Math.cos(t*1.2)*.15;

  controls.update();
  renderer.render(scene,camera);
}

animate();

window.addEventListener("resize",()=>{
  camera.aspect=container.clientWidth/container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth,container.clientHeight);
});
})();
