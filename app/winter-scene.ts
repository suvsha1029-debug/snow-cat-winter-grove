import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
type Settings={wind:number;snow:number;paused:boolean;orbit:boolean};
export type WinterScene={configure:(settings:Settings)=>void;reset:()=>void;dispose:()=>void};
export function createWinterScene(container:HTMLElement):WinterScene{
 const scene=new T.Scene();scene.background=new T.Color('#c5d9da');scene.fog=new T.FogExp2('#c5d9da',.026);
 const camera=new T.PerspectiveCamera(42,1,.1,140);camera.position.set(10,7.5,14.5);
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
 container.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D winter grove. Use arrow keys to orbit, plus or minus to zoom.');
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.5,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=5.5;controls.maxDistance=26;controls.maxPolarAngle=Math.PI*.47;controls.minPolarAngle=.25;controls.enablePan=false;controls.autoRotateSpeed=.45;
 const home=()=>{camera.position.set(10,7.5,14.5);controls.target.set(0,1.5,0);controls.update();};
 scene.add(new T.HemisphereLight('#fff6dd','#779493',2.4));const sun=new T.DirectionalLight('#ffe2b6',3.5);sun.position.set(-8,16,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:.5,far:55});sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;scene.add(sun);
 const gradient=new T.DataTexture(new Uint8Array([92,145,195,240]),4,1,T.RedFormat);gradient.needsUpdate=true;gradient.minFilter=T.NearestFilter;gradient.magFilter=T.NearestFilter;
 const materials=new Map<string,T.MeshToonMaterial>();const mat=(color:string)=>{if(!materials.has(color))materials.set(color,new T.MeshToonMaterial({color,gradientMap:gradient}));return materials.get(color)!;};
 const snow=mat('#fff7e6'),pine=mat('#456f61'),pine2=mat('#527c68'),bark=mat('#74594b'),coal=mat('#273c43'),orange=mat('#eaaa55'),cream=mat('#fff0cf'),red=mat('#b94e4e');const ballGeo=new T.SphereGeometry(1,24,16);
 function mesh(parent:T.Object3D,geo:T.BufferGeometry,material:T.Material,x=0,y=0,z=0){const obj=new T.Mesh(geo,material);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
 function ball(parent:T.Object3D,x:number,y:number,z:number,sx:number,sy:number,sz:number,material:T.Material){const ob=mesh(parent,ballGeo,material,x,y,z);ob.scale.set(sx,sy,sz);return ob;}
 function rod(parent:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,material:T.Material){const ob=mesh(parent,new T.CylinderGeometry(r*.8,r,a.distanceTo(b),8),material);ob.position.copy(a).add(b).multiplyScalar(.5);ob.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return ob;}
 mesh(scene,new T.CylinderGeometry(10.8,10.2,.9,96),mat('#94a9a1'),0,-.6,0).castShadow=false;
 mesh(scene,new T.CylinderGeometry(10.95,10.8,.38,96),snow,0,-.1,0).castShadow=false;
 const under=mesh(scene,new T.PlaneGeometry(200,200),mat('#bdd1d0'),0,-1.2,0);under.rotation.x=-Math.PI/2;under.castShadow=false;
 let seed=31;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<35;i++){const a=rand()*Math.PI*2,r=6+rand()*4;ball(scene,Math.sin(a)*r,.02,Math.cos(a)*r,.6+rand(),.1+rand()*.18,.6+rand(),snow);}
 const treeBones:{bones:T.Group[];phase:number}[]=[];
 function tree(x:number,z:number,scale:number){const root=new T.Group();root.position.set(x,.03,z);root.scale.setScalar(scale);scene.add(root);let parent=root;const bones:T.Group[]=[];
  for(let j=0;j<5;j++){const joint=new T.Group();joint.position.y=j===0?0:.79;parent.add(joint);bones.push(joint);mesh(joint,new T.CylinderGeometry(.08,.14,.95,7),bark,0,.4,0);const r=1.32-j*.215;const foliage=mesh(joint,new T.ConeGeometry(r,1.65,11),j%2?pine:pine2,0,1,0);foliage.rotation.y=j*.8;const cap=mesh(joint,new T.ConeGeometry(r*.89,1.43,11),snow,0,1.19,0);cap.rotation.y=j*.8;
   for(let k=0;k<3;k++){const a=k*2.09+j*.6;ball(joint,Math.sin(a)*r*.62,.72,Math.cos(a)*r*.62,r*.42,.13,r*.30,snow);}parent=joint;
  }treeBones.push({bones,phase:rand()*6});
 }
 [[-6,-2,1.3],[-4,-5,1.15],[-1.5,-6.5,1.45],[2,-6.6,1.2],[5,-5,1.5],[7,-1,1.05],[-7,2,1],[-8,-4,.85],[7,-5,.9],[-5,5,.6],[6,4,.66],[-8,0,.75],[4,-8,.75]].forEach(v=>tree(v[0],v[1],v[2]));
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;mesh(scene,new T.ConeGeometry(6+rand()*3,8+rand()*6,5),mat(i%2?'#a5bcbb':'#b2c6c4'),Math.sin(a)*43,1,Math.cos(a)*43).castShadow=false;}
 const man=new T.Group();scene.add(man);ball(man,0,.89,0,.94,.94,.94,snow);ball(man,0,1.98,0,.70,.73,.70,snow);ball(man,0,2.97,0,.54,.55,.54,snow);
 for(const x of [-.19,.19]){ball(man,x,3.08,.49,.061,.073,.041,coal);ball(man,x-.014,3.1,.525,.015,.015,.01,cream);}
 const nose=mesh(man,new T.ConeGeometry(.09,.43,10),orange,0,2.98,.67);nose.rotation.x=Math.PI/2;
 for(let i=0;i<7;i++){const a=(i/6)*1.7-.85;ball(man,Math.sin(a)*.25,2.85-Math.cos(a)*.08,.49,.022,.022,.022,coal);}
 for(const [y,z] of [[2.1,.69],[1.82,.68],[1.2,.87],[.79,.93]])ball(man,0,y,z,.055,.055,.036,coal);
 for(const s of [-1,1]){rod(man,new T.Vector3(s*.6,2.1,0),new T.Vector3(s*1.45,2.48,.03),.036,bark);rod(man,new T.Vector3(s*1.22,2.38,.02),new T.Vector3(s*1.25,2.7,.03),.025,bark);rod(man,new T.Vector3(s*1.4,2.46,.03),new T.Vector3(s*1.66,2.48,.03),.02,bark);}
 mesh(man,new T.TorusGeometry(.48,.10,10,40),red,0,2.53,0).rotation.x=Math.PI/2;
 const scarfTail=new T.Group();scarfTail.position.set(.40,2.52,.13);man.add(scarfTail);const scarfSegments:T.Group[]=[];let sp=scarfTail;
 for(let i=0;i<8;i++){const p=new T.Group();p.position.x=i===0?0:.14;sp.add(p);mesh(p,new T.BoxGeometry(.17,.20,.055),red,.07,-.06,0);scarfSegments.push(p);sp=p;}
 const hat=new T.Group();hat.position.y=3.43;man.add(hat);mesh(hat,new T.CylinderGeometry(.64,.64,.065,40),coal);mesh(hat,new T.CylinderGeometry(.39,.43,.58,40),coal,0,.31,0);mesh(hat,new T.CylinderGeometry(.433,.443,.12,40),red,0,.1,0);
 const cat=new T.Group();scene.add(cat);cat.scale.setScalar(1.13);ball(cat,0,.55,0,.29,.32,.52,orange);ball(cat,0,.75,.43,.31,.34,.30,orange);ball(cat,0,.81,.53,.32,.28,.26,orange);ball(cat,0,.51,.30,.23,.25,.20,cream);
 for(const x of [-.2,.2]){const ear=mesh(cat,new T.ConeGeometry(.16,.35,3),orange,x,1.12,.44);ear.rotation.y=Math.PI;ear.scale.z=.65;const inner=mesh(cat,new T.ConeGeometry(.09,.23,3),mat('#d68f83'),x,1.13,.505);inner.scale.z=.16;ball(cat,x*.75,.89,.749,.09,.105,.035,cream);ball(cat,x*.75,.89,.78,.033,.072,.014,mat('#52634d'));ball(cat,x*.75-.01,.915,.794,.011,.015,.005,snow);ball(cat,x*.40,.755,.771,.087,.065,.06,cream);for(let j=0;j<3;j++)rod(cat,new T.Vector3(x*.45,.77-j*.029,.816),new T.Vector3(x*2,.82-j*.075,.82),.006,bark);}
 ball(cat,0,.797,.835,.035,.027,.025,mat('#9f6964'));mesh(cat,new T.TorusGeometry(.233,.035,8,28),mat('#4c928a'),0,.58,.4).rotation.x=Math.PI/2;ball(cat,0,.54,.62,.043,.05,.043,mat('#e7bf63'));
 const legs:T.Group[]=[];for(const z of [-.3,.31])for(const x of [-.20,.20]){const leg=new T.Group();leg.position.set(x,.44,z);cat.add(leg);ball(leg,0,-.16,0,.083,.22,.08,orange);ball(leg,0,-.32,.044,.105,.075,.14,cream);legs.push(leg);}
 const tailBones:T.Group[]=[];let tp:T.Object3D=cat;for(let i=0;i<9;i++){const joint=new T.Group();joint.position.set(0,i===0?.61:.13,i===0?-.43:0);joint.rotation.x=i===0?-.7:.13;tp.add(joint);ball(joint,0,.08,0,.064,.11,.064,i>6?cream:orange);tailBones.push(joint);tp=joint;}
 for(let j=0;j<3;j++){const stripe=mesh(cat,new T.TorusGeometry(.29,.022,6,20,Math.PI*.7),mat('#b7783c'),0,.57,-.25+j*.2);stripe.rotation.set(Math.PI/2,0,.48);}
 for(let i=0;i<48;i++){const a=i/48*Math.PI*2;for(const offset of [-.10,.10])ball(scene,Math.sin(a)*(2.45+offset),.094,Math.cos(a)*(2.1+offset),.055,.009,.09,mat('#d7e0d6')).castShadow=false;}
 const count=3600,pos=new Float32Array(count*3),speed=new Float32Array(count);for(let i=0;i<count;i++){pos[i*3]=(rand()-.5)*27;pos[i*3+1]=rand()*17;pos[i*3+2]=(rand()-.5)*27;speed[i]=.45+rand()*.8;}
 const flakesGeo=new T.BufferGeometry();flakesGeo.setAttribute('position',new T.BufferAttribute(pos,3));
 const flakesMat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pixelRatio:{value:renderer.getPixelRatio()}},vertexShader:'uniform float pixelRatio; void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(55.*pixelRatio/-mv.z,1.,9.);gl_Position=projectionMatrix*mv;}',fragmentShader:'void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(1.,.985,.93,.85*(1.-smoothstep(.20,.5,d)));}'});
 const flakes=new T.Points(flakesGeo,flakesMat);flakes.frustumCulled=false;scene.add(flakes);
 let settings:Settings={wind:.55,snow:.65,paused:false,orbit:false},elapsed=0,last=performance.now(),raf=0;
 function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 const keyboard=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();const s=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft')s.theta-=.1;if(e.key==='ArrowRight')s.theta+=.1;if(e.key==='ArrowUp')s.phi-=.08;if(e.key==='ArrowDown')s.phi+=.08;if(e.key==='+'||e.key==='=')s.radius*=.9;if(e.key==='-')s.radius*=1.1;s.phi=T.MathUtils.clamp(s.phi,.25,Math.PI*.47);s.radius=T.MathUtils.clamp(s.radius,5.5,26);camera.position.setFromSpherical(s).add(controls.target);controls.update();};renderer.domElement.addEventListener('keydown',keyboard);
 function render(now:number){raf=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;if(!settings.paused){elapsed+=dt;const t=elapsed;
  for(const {bones,phase} of treeBones)bones.forEach((joint,i)=>{joint.rotation.z=settings.wind*(Math.sin(t*1.4+phase+i*.23)*.021+Math.sin(t*3.2+phase)*.005)*(1+i*.22);joint.rotation.x=settings.wind*Math.sin(t*1.1+phase+i*.3)*.009;});
  scarfSegments.forEach((p,i)=>{p.rotation.z=settings.wind*(Math.sin(t*5-i*.6)*.17+.06);});const a=t*.51-1.3;cat.position.set(Math.sin(a)*2.45,.018+Math.abs(Math.sin(t*7))*.024,Math.cos(a)*2.1);cat.rotation.y=Math.atan2(2.45*Math.cos(a),-2.1*Math.sin(a));legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(t*7+(i===0||i===3?0:Math.PI))*.47;});tailBones.forEach((b,i)=>{b.rotation.z=Math.sin(t*2.5-i*.35)*.055;});hat.rotation.z=Math.sin(t*1.8)*settings.wind*.025;
  for(let i=0;i<count;i++){pos[i*3]+=dt*(settings.wind*1.7+Math.sin(t+i)*.1);pos[i*3+1]-=dt*speed[i];if(pos[i*3]>13.5)pos[i*3]=-13.5;if(pos[i*3+1]<.1)pos[i*3+1]=17;}flakesGeo.attributes.position.needsUpdate=true;
 }flakesGeo.setDrawRange(0,Math.floor(count*settings.snow));controls.autoRotate=settings.orbit&&!settings.paused;controls.update(dt);renderer.render(scene,camera);}
 render(last);
 return{configure(next){settings=next;},reset:home,dispose(){cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('keydown',keyboard);const geometries=new Set<T.BufferGeometry>();scene.traverse(ob=>{if(ob instanceof T.Mesh||ob instanceof T.Points)geometries.add(ob.geometry);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());gradient.dispose();flakesMat.dispose();renderer.dispose();renderer.domElement.remove();}};
}
