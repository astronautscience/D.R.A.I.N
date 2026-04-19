/* ── DINOSAUR MODEL UTILITIES ── */

function loftMesh(pts,ws,hs,mat,seg,sd){
    seg=seg||Math.max(pts.length*4,12);
    sd=sd||12;
    const v3=pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]));
    const curve=new THREE.CatmullRomCurve3(v3,false,'catmullrom',0.3);
    const pos=[],nrm=[],uv=[],idx=[];
    let pN=null,pB=null;
    for(let i=0;i<=seg;i++){
        const t=i/seg;
        const pt=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize();
        const si=Math.min(Math.floor(t*(ws.length-1)),ws.length-2);
        const sf=t*(ws.length-1)-si;
        const w=ws[si]*(1-sf)+ws[si+1]*sf;
        const h=hs[si]*(1-sf)+hs[si+1]*sf;
        let n,b;
        if(!pN){
            let up=new THREE.Vector3(0,1,0);
            if(Math.abs(tan.dot(up))>0.95)up.set(0,0,1);
            n=new THREE.Vector3().crossVectors(tan,up).normalize();
            b=new THREE.Vector3().crossVectors(tan,n).normalize();
        }else{
            n=pN.clone().sub(tan.clone().multiplyScalar(tan.dot(pN)));
            if(n.length()<0.001)n=pB.clone();
            n.normalize();
            b=new THREE.Vector3().crossVectors(tan,n).normalize();
        }
        pN=n.clone();pB=b.clone();
        for(let j=0;j<=sd;j++){
            const a=(j/sd)*Math.PI*2,co=Math.cos(a),si2=Math.sin(a);
            const px=w*co,py=h*si2;
            const nl=Math.sqrt((h*co)*(h*co)+(w*si2)*(w*si2))||1;
            const nx2=(h*co)/nl,ny2=(w*si2)/nl;
            pos.push(pt.x+px*n.x+py*b.x, pt.y+px*n.y+py*b.y, pt.z+px*n.z+py*b.z);
            nrm.push(nx2*n.x+ny2*b.x, nx2*n.y+ny2*b.y, nx2*n.z+ny2*b.z);
            uv.push(j/sd,t);
        }
    }
    for(let i=0;i<seg;i++)for(let j=0;j<sd;j++){
        const a=i*(sd+1)+j,b2=a+sd+1;
        idx.push(a,b2,a+1,a+1,b2,b2+1);
    }
    // End caps
    const capStart=ws[0]>0.01,capEnd=ws[ws.length-1]>0.01;
    if(capStart){
        const ci=pos.length/3;
        const pt=curve.getPointAt(0);
        pos.push(pt.x,pt.y,pt.z);
        const tan=curve.getTangentAt(0).normalize();
        nrm.push(-tan.x,-tan.y,-tan.z);
        uv.push(0.5,0);
        for(let j=0;j<sd;j++){
            idx.push(ci,j+1,j);
        }
    }
    if(capEnd){
        const ci=pos.length/3;
        const pt=curve.getPointAt(1);
        pos.push(pt.x,pt.y,pt.z);
        const tan=curve.getTangentAt(1).normalize();
        nrm.push(tan.x,tan.y,tan.z);
        uv.push(0.5,1);
        const base=seg*(sd+1);
        for(let j=0;j<sd;j++){
            idx.push(ci,base+j,base+j+1);
        }
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    geo.setIndex(idx);
    const mesh=new THREE.Mesh(geo,mat);
    mesh.castShadow=true;mesh.receiveShadow=true;
    return mesh;
}

function addEyes(grp,x,y,z,sz){
    const ew=new THREE.MeshPhysicalMaterial({color:0xffffdd,roughness:0.08,clearcoat:1,clearcoatRoughness:0.05,envMapIntensity:3});
    const ep=new THREE.MeshStandardMaterial({color:0x111100});
    grp.add(P(mkS(sz,ew),x,y,z));
    grp.add(P(mkS(sz*0.55,ep),x+sz*0.45,y,z+sz*0.3));
    grp.add(P(mkS(sz,ew),-x,y,z));
    grp.add(P(mkS(sz*0.55,ep),-x-sz*0.45,y,z+sz*0.3));
}

/* ── 1. BRACHIOSAURUS ── */
function buildBrachiosaurus(){
    const g=new THREE.Group();
    const m=skinMat('#4cb840'),ml=skinMat('#6ad060'),nm=skinMat('#3aaa30'),dm=skinMat('#2a9020');
    const nail=new THREE.MeshStandardMaterial({color:0xaa9980,roughness:0.5});
    // Body
    const body=loftMesh(
        [[0,5.8,0.6],[0,5.2,0.8],[0,5,0],[0,4.6,-0.5],[0,4.2,-1]],
        [1.0,1.35,1.5,1.2,0.8],
        [0.8,1.1,1.2,1.0,0.7],
        m,16,8
    );
    g.add(body);
    // Neck
    const neckPts=[];const neckW=[];const neckH=[];
    const nd=[{y:0,z:0,r:0.52},{y:0.7,z:0.3,r:0.48},{y:1.4,z:0.58,r:0.44},{y:2.1,z:0.84,r:0.4},{y:2.8,z:1.06,r:0.36},{y:3.4,z:1.24,r:0.32},{y:4,z:1.38,r:0.28},{y:4.5,z:1.5,r:0.25},{y:5,z:1.58,r:0.22},{y:5.4,z:1.64,r:0.19},{y:5.8,z:1.69,r:0.17},{y:6.2,z:1.73,r:0.15}];
    nd.forEach(s=>{neckPts.push([0,s.y,s.z]);neckW.push(s.r);neckH.push(s.r*0.9)});
    const neck=new THREE.Group();
    neck.add(loftMesh(neckPts,neckW,neckH,nm,32,12));
    neck.position.set(0,5.5,1.2);g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.12,0.06],[0,0,0.12],[0,-0.05,0.32],[0,-0.12,0.28]],
        [0.18,0.24,0.14,0.06],
        [0.14,0.2,0.08,0.04],
        m,24,18
    ));
    addEyes(head,0.16,0.04,0.18,0.065);
    head.position.set(0,12.2,3.1);g.add(head);
    // Front legs
    function mkFL(x,z){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,0,0],[0.06,-0.15,0.03],[0,-1.1,0],[0,-2.1,0],[0,-3.1,0],[0,-3.9,0.02],[0,-4.05,0.03]],
            [0.35,0.25,0.22,0.2,0.18,0.16,0.22],
            [0.35,0.22,0.2,0.17,0.15,0.13,0.1],
            m,42,12
        ));
        lg.add(P(mkCone(0.035,0.12,nail),-0.08,-4.15,0.14));
        lg.add(P(mkCone(0.03,0.1,nail),0.08,-4.12,0.12));
        lg.position.set(x,4.8,z);return lg;
    }
    function mkBL(x,z){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,0,0],[0.06,-0.15,0.03],[0,-0.9,0],[0,-1.7,0],[0,-2.55,0],[0,-3.2,0.02],[0,-3.35,0.03]],
            [0.32,0.22,0.2,0.18,0.16,0.14,0.18],
            [0.32,0.2,0.18,0.15,0.13,0.11,0.08],
            m,42,12
        ));
        lg.add(P(mkCone(0.03,0.1,nail),-0.06,-3.45,0.1));
        lg.position.set(x,4.2,z);return lg;
    }
    const fl=mkFL(0.9,1.4),fr=mkFL(-0.9,1.4),bl=mkBL(0.85,-1.6),br=mkBL(-0.85,-1.6);
    g.add(fl,fr,bl,br);
    // Tail
    const tail=new THREE.Group();
    const tailPts=[],tailW=[],tailH=[];
    for(let i=0;i<12;i++){
        const t=i/11,r=0.5*(1-t*0.88);
        tailPts.push([0,-0.06*i,-1*i]);
        tailW.push(Math.max(0.05,r)*0.9);
        tailH.push(Math.max(0.05,r)*0.28);
    }
    tail.add(loftMesh(tailPts,tailW,tailH,m,32,12));
    tail.position.set(0,4.3,-1.3);g.add(tail);
    // Dorsal spines
    for(let i=0;i<14;i++){const h=0.25+Math.sin(i/13*Math.PI)*0.5;g.add(P(mkCone(0.07,h,dm),0,6.6+h*0.5,-1.5+i*0.3))}
    g.userData={parts:{head,neck,legFL:fl,legFR:fr,legBL:bl,legBR:br,tail,body:g.children[0]},bipedal:false,labelY:14,scale:1};
    return g;
}

/* ── 2. STEGOSAURUS ── */
function buildStegosaurus(){
    const g=new THREE.Group();
    const m=skinMat('#c08050'),belly=skinMat('#e0b888'),dm=skinMat('#a87040');
    const plateMat=new THREE.MeshStandardMaterial({color:0xff6622,roughness:0.4,side:THREE.DoubleSide});
    const spikeMat=new THREE.MeshStandardMaterial({color:0xffeeaa,roughness:0.35});
    // Body
    const body=loftMesh(
        [[0,2.15,-0.7],[0,2.0,-0.3],[0,1.9,0],[0,1.9,0.5],[0,1.7,0.9]],
        [0.8,1.1,1.3,1.1,0.7],
        [0.7,0.9,1.0,0.85,0.6],
        m,16,8
    );
    g.add(body);
    // Belly fill
    g.add(P(mkS(0.7,belly,[1.6,0.6,1]),0,1.1,0));
    // Neck (not in parts)
    const neck=new THREE.Group();
    neck.add(loftMesh(
        [[0,0,0.2],[0,-0.12,0.45],[0,-0.25,0.68],[0,-0.35,0.88]],
        [0.35,0.3,0.25,0.22],
        [0.3,0.25,0.2,0.16],
        m,24,16
    ));
    neck.position.set(0,1.7,1.1);g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0,0.1],[0,-0.02,0.28],[0,-0.07,0.36]],
        [0.2,0.12,0.08],
        [0.14,0.06,0.04],
        m,18,18
    ));
    head.add(P(mkS(0.06,m,[1.1,0.35,0.45]),0,-0.1,0.25));
    addEyes(head,0.14,0.06,0.08,0.05);
    head.position.set(0,1.1,2.1);g.add(head);
    // Plates
    const platePos=[{z:1.3,y:2.2,sz:0.06},{z:1.15,y:2.35,sz:0.1},{z:1,y:2.45,sz:0.14},{z:0.85,y:2.58,sz:0.18},{z:0.7,y:2.72,sz:0.24},{z:0.55,y:2.85,sz:0.28},{z:0.4,y:2.95,sz:0.32},{z:0.2,y:3.05,sz:0.35},{z:0,y:3.1,sz:0.35},{z:-0.2,y:3.05,sz:0.32},{z:-0.4,y:2.95,sz:0.28},{z:-0.6,y:2.8,sz:0.24},{z:-0.8,y:2.6,sz:0.2},{z:-1,y:2.45,sz:0.15},{z:-1.15,y:2.35,sz:0.1},{z:-1.3,y:2.25,sz:0.06}];
    platePos.forEach((p,i)=>{const hw=p.sz*0.6,hh=p.sz*1.8;const vts=new Float32Array([0,hh,0,-hw,0,0.02,0,-hh*0.3,0,hw,0,-0.02]);const bg=new THREE.BufferGeometry();bg.setIndex([0,1,2,0,2,3]);bg.setAttribute('position',new THREE.BufferAttribute(vts,3));bg.computeVertexNormals();const plate=new THREE.Mesh(bg,plateMat);plate.position.set((i%2===0?0.06:-0.06),p.y,p.z);plate.rotation.z=(i%2===0?0.08:-0.08);g.add(plate)});
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,0],[0,-0.03,-0.4],[0,-0.06,-0.8],[0,-0.1,-1.15],[0,-0.14,-1.45],[0,-0.18,-1.7]],
        [0.42,0.35,0.28,0.22,0.16,0.1],
        [0.25,0.2,0.14,0.1,0.06,0.04],
        m,16,8
    ));
    const addSpk=(x,y,z,rx,rz,l)=>{const s=P(mkCone(0.05,l,spikeMat),x,y,z);s.rotation.x=rx;s.rotation.z=rz;tail.add(s)};
    addSpk(0.2,0.06,-1.75,-0.6,0.4,0.6);addSpk(-0.2,0.06,-1.75,-0.6,-0.4,0.6);
    addSpk(0.14,0.13,-1.55,-0.35,0.55,0.52);addSpk(-0.14,0.13,-1.55,-0.35,-0.55,0.52);
    tail.position.set(0,1.8,-0.9);g.add(tail);
    // Legs
    function mkFL(x,z){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,0,0],[0,-0.22,0],[0,-0.45,0.01],[0,-0.65,0.02],[0,-0.84,0.02],[0,-0.9,0.03]],
            [0.12,0.1,0.08,0.08,0.07,0.07],
            [0.1,0.08,0.06,0.05,0.04,0.04],
            m,36,12
        ));
        lg.add(P(mkB(0.14,0.06,0.18,m),0,-0.9,0.03));
        lg.position.set(x,1.4,z);return lg;
    }
    function mkRL(x,z){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,-0.02,0],[0,-0.08,0.02],[0,-0.35,0],[0,-0.62,0.02],[0,-0.82,0.03],[0,-1.02,0.03],[0,-1.08,0.04]],
            [0.2,0.16,0.12,0.09,0.09,0.08,0.08],
            [0.17,0.14,0.1,0.07,0.07,0.06,0.06],
            m,42,12
        ));
        lg.add(P(mkB(0.16,0.07,0.22,m),0,-1.08,0.04));
        lg.position.set(x,1.6,z);return lg;
    }
    const fll=mkFL(0.55,0.85),flr=mkFL(-0.55,0.85),bll=mkRL(0.6,-0.7),blr=mkRL(-0.6,-0.7);
    g.add(fll,flr,bll,blr);
    g.userData={parts:{head,legFL:fll,legFR:flr,legBL:bll,legBR:blr,tail,body:g.children[0]},bipedal:false,labelY:3.8,scale:1};
    return g;
}

/* ── 3. DIPLODOCUS ── */
function buildDiplodocus(){
    const g=new THREE.Group();
    const m=skinMat('#5cc848'),nm=skinMat('#48b838'),belly=skinMat('#90e880'),dm=skinMat('#3a9a28');
    const nail=new THREE.MeshStandardMaterial({color:0xaa9970,roughness:0.5});
    // Body
    const body=loftMesh(
        [[0,3.2,1.2],[0,3.1,0.8],[0,3,0],[0,2.9,-0.6],[0,2.7,-1]],
        [0.7,1.1,1.4,1.1,0.7],
        [0.6,0.8,0.9,0.75,0.55],
        m,16,8
    );
    g.add(body);
    g.add(P(mkS(0.8,belly,[2.2,0.5,0.9]),0,2.4,0));
    // Neck
    const neck=new THREE.Group();
    const nd=[{y:0,z:0,r:0.38},{y:0.25,z:0.55,r:0.35},{y:0.42,z:1.05,r:0.32},{y:0.52,z:1.5,r:0.29},{y:0.6,z:1.95,r:0.26},{y:0.66,z:2.35,r:0.24},{y:0.7,z:2.72,r:0.22},{y:0.73,z:3.05,r:0.2},{y:0.74,z:3.35,r:0.18},{y:0.74,z:3.62,r:0.16},{y:0.73,z:3.88,r:0.15},{y:0.71,z:4.1,r:0.14},{y:0.68,z:4.32,r:0.12},{y:0.64,z:4.52,r:0.11}];
    const nPts=[],nW=[],nH=[];
    nd.forEach(s=>{nPts.push([0,s.y,s.z]);nW.push(s.r);nH.push(s.r*0.88)});
    neck.add(loftMesh(nPts,nW,nH,nm,32,12));
    neck.position.set(0,3.2,1);g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.08,0.05],[0,0,0.08],[0,-0.02,0.22],[0,-0.08,0.22]],
        [0.1,0.14,0.08,0.035],
        [0.08,0.1,0.05,0.02],
        m,24,18
    ));
    addEyes(head,0.11,0.04,0.06,0.05);
    head.position.set(0,4,5.8);g.add(head);
    // Legs
    function mkLeg(x,z,h){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,0,0],[0.05,-0.15,0.03],[0,-h*0.25,0],[0,-h*0.48,0.01],[0,-h*0.6,0.02],[0,-h*0.78,0.02],[0,-h*0.85,0.02]],
            [0.22,0.17,0.16,0.14,0.13,0.12,0.1],
            [0.2,0.14,0.14,0.11,0.1,0.09,0.08],
            m,42,12
        ));
        lg.add(P(mkB(0.2,0.08,0.24,m),0,-h*0.85,0.02));
        lg.add(P(mkCone(0.025,0.08,nail),-0.06,-h*0.88,0.1));
        lg.position.set(x,2.8,z);return lg;
    }
    const fl=mkLeg(0.6,1.2,2.5),fr=mkLeg(-0.6,1.2,2.5),bl=mkLeg(0.6,-1,2.5),br=mkLeg(-0.6,-1,2.5);
    g.add(fl,fr,bl,br);
    // Tail (whip)
    const tail=new THREE.Group();
    const tPts=[],tW=[],tH=[];
    for(let i=0;i<16;i++){
        const t=i/15,r=0.38*(1-t*0.9);
        tPts.push([0,-0.03*i*i*0.06,-0.85*i]);
        tW.push(Math.max(0.025,r)*0.9);
        tH.push(Math.max(0.025,r)*0.2);
    }
    tail.add(loftMesh(tPts,tW,tH,m,32,12));
    tail.position.set(0,2.9,-1.2);g.add(tail);
    g.userData={parts:{head,neck,legFL:fl,legFR:fr,legBL:bl,legBR:br,tail,body:g.children[0]},bipedal:false,labelY:5.5,scale:1};
    return g;
}

/* ── 4. COMPSOGNATHUS ── */
function buildCompsognathus(){
    const g=new THREE.Group();
    const m=skinMat('#ff9922'),belly=skinMat('#ffcc55'),dm=skinMat('#cc7711');
    const ew=new THREE.MeshStandardMaterial({color:0xffff44,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x110800});
    const clawMat=new THREE.MeshStandardMaterial({color:0x4a3510,roughness:0.4});
    // Body
    const body=loftMesh(
        [[0,0.46,0.16],[0,0.44,0.1],[0,0.42,0],[0,0.38,-0.05],[0,0.35,-0.08]],
        [0.06,0.1,0.14,0.1,0.06],
        [0.05,0.08,0.1,0.07,0.05],
        m,16,8
    );
    g.add(body);
    g.add(P(mkS(0.1,belly,[1.4,0.5,0.6]),0,0.35,0));
    // Neck
    const neckG=new THREE.Group();
    neckG.add(loftMesh(
        [[0,0,0.04],[0,0.05,0.08],[0,0.09,0.11],[0,0.12,0.13]],
        [0.06,0.052,0.045,0.04],
        [0.054,0.045,0.038,0.033],
        m,24,16
    ));
    neckG.position.set(0,0.5,0.15);g.add(neckG);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.02,0.06],[0,-0.01,0.16],[0,-0.03,0.2]],
        [0.08,0.04,0.025],
        [0.06,0.03,0.015],
        m,18,18
    ));
    head.add(P(mkS(0.02,dm,[1.1,0.28,0.38]),0,-0.04,0.15));
    head.add(P(mkS(0.035,ew),0.06,0.04,0.05));head.add(P(mkS(0.02,ep),0.07,0.04,0.07));
    head.add(P(mkS(0.035,ew),-0.06,0.04,0.05));head.add(P(mkS(0.02,ep),-0.07,0.04,0.07));
    head.position.set(0,0.62,0.28);g.add(head);
    // Legs
    function mkLeg(x){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,0,0],[0.01,-0.02,0.01],[0,-0.08,0],[0,-0.14,0.005],[0,-0.18,0.015],[0,-0.24,0.018],[0,-0.27,0.02]],
            [0.04,0.03,0.025,0.018,0.02,0.014,0.015],
            [0.035,0.025,0.022,0.015,0.016,0.012,0.012],
            m,42,12
        ));
        lg.add(P(mkC(0.008,0.005,0.045,m),-0.012,-0.31,0.03));
        lg.add(P(mkC(0.008,0.005,0.05,m),0,-0.315,0.035));
        lg.add(P(mkC(0.008,0.005,0.045,m),0.012,-0.31,0.03));
        lg.add(P(mkCone(0.005,0.02,clawMat),0,-0.335,0.055));
        lg.position.set(x,0.35,-0.02);return lg;
    }
    const ll=mkLeg(0.065),lr=mkLeg(-0.065);g.add(ll,lr);
    // Arms
    const armL=new THREE.Group();
    armL.add(P(mkS(0.012,m,[0.8,0.7,0.6]),0,0,0));
    armL.add(P(mkC(0.012,0.008,0.06,m),0,-0.03,0));
    armL.add(P(mkS(0.008,m,[0.75,0.55,0.7]),0,-0.055,0.005));
    armL.add(P(mkC(0.008,0.005,0.04,m),0,-0.07,0.01));
    armL.add(P(mkCone(0.004,0.018,clawMat),0,-0.09,0.015));
    armL.add(P(mkCone(0.003,0.015,clawMat),0.005,-0.088,0.012));
    armL.position.set(0.08,0.44,0.12);g.add(armL);
    const armR=armL.clone();armR.position.x=-0.08;g.add(armR);
    // Tail
    const tail=new THREE.Group();
    const tPts=[],tW=[],tH=[];
    for(let i=0;i<9;i++){
        const t=i/8,r=0.055*(1-t*0.78);
        tPts.push([0,-0.004*i,-0.16*i]);
        tW.push(Math.max(0.008,r)*0.8);
        tH.push(Math.max(0.008,r)*0.18);
    }
    tail.add(loftMesh(tPts,tW,tH,m,28,12));
    tail.position.set(0,0.4,-0.14);g.add(tail);
    g.userData={parts:{head,legL:ll,legR:lr,tail,body:g.children[0]},bipedal:true,labelY:1,scale:0.3};
    return g;
}

/* ── 5. ARCHAEOPTERYX ── */
function buildArchaeopteryx(){
    const g=new THREE.Group();
    const m=skinMat('#22bbaa'),dm=skinMat('#1a8877');
    const fm=new THREE.MeshStandardMaterial({color:0x33ddbb,side:THREE.DoubleSide,roughness:0.5});
    const primFm=new THREE.MeshStandardMaterial({color:0x1a9988,side:THREE.DoubleSide,roughness:0.55});
    const ew=new THREE.MeshStandardMaterial({color:0xffee88,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x110800});
    const claw=new THREE.MeshStandardMaterial({color:0x2a1a10,roughness:0.5});
    // Body
    const body=loftMesh(
        [[0,0.36,0.12],[0,0.35,0.04],[0,0.35,0],[0,0.33,-0.08]],
        [0.06,0.1,0.12,0.07],
        [0.05,0.07,0.085,0.055],
        m,16,8
    );
    g.add(body);
    // Head (includes S-curved neck sections)
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.02,0.08],[0,-0.005,0.17],[0,-0.04,0.2]],
        [0.07,0.04,0.025],
        [0.056,0.026,0.014],
        m,18,18
    ));
    head.add(P(mkS(0.025,m,[1.4,0.35,0.4]),0,-0.04,0.2));
    head.add(P(mkB(0.04,0.005,0.02,new THREE.MeshStandardMaterial({color:0xddddbb,roughness:0.4})),0,-0.025,0.2));
    head.add(P(mkS(0.032,ew),0.055,0.04,0.07));head.add(P(mkS(0.018,ep),0.06,0.04,0.09));
    head.add(P(mkS(0.032,ew),-0.055,0.04,0.07));head.add(P(mkS(0.018,ep),-0.06,0.04,0.09));
    // S-curved neck sections in head group
    head.add(P(mkS(0.04,m,[0.9,0.9,0.8]),0,-0.06,-0.04));
    head.add(P(mkS(0.035,m,[0.85,0.85,0.75]),0,-0.1,-0.08));
    head.position.set(0,0.48,0.18);g.add(head);
    // Wings
    const wl=new THREE.Group();
    wl.add(P(mkC(0.014,0.012,0.08,m),0,0,0.02));wl.add(P(mkS(0.01,m,[0.8,0.6,0.7]),0.04,-0.005,0.015));
    wl.add(P(mkC(0.011,0.009,0.1,m),0.08,-0.01,0.01));wl.add(P(mkS(0.008,m,[0.75,0.55,0.65]),0.14,-0.015,0.008));
    for(let i=0;i<7;i++){const f=P(mkB(0.09+i*0.018,0.003,0.028+i*0.004,primFm),0.1+i*0.05,-0.01-0.008*i,0.01);f.rotation.z=-0.08*i;wl.add(f)}
    for(let i=0;i<5;i++){wl.add(P(mkB(0.06+i*0.005,0.003,0.032,fm),0.02+i*0.035,0.005,0.01))}
    for(let i=0;i<3;i++){const c=P(mkCone(0.004,0.022,claw),0.02+i*0.016,0.015,0.04+i*0.01);c.rotation.x=-0.4;wl.add(c)}
    wl.position.set(0.1,0.35,0.02);g.add(wl);
    const wr=new THREE.Group();
    wr.add(P(mkC(0.014,0.012,0.08,m),0,0,0.02));wr.add(P(mkS(0.01,m,[0.8,0.6,0.7]),-0.04,-0.005,0.015));
    wr.add(P(mkC(0.011,0.009,0.1,m),-0.08,-0.01,0.01));wr.add(P(mkS(0.008,m,[0.75,0.55,0.65]),-0.14,-0.015,0.008));
    for(let i=0;i<7;i++){const f=P(mkB(0.09+i*0.018,0.003,0.028+i*0.004,primFm),-0.1-i*0.05,-0.01-0.008*i,0.01);f.rotation.z=0.08*i;wr.add(f)}
    for(let i=0;i<5;i++){wr.add(P(mkB(0.06+i*0.005,0.003,0.032,fm),-0.02-i*0.035,0.005,0.01))}
    for(let i=0;i<3;i++){const c=P(mkCone(0.004,0.022,claw),-0.02-i*0.016,0.015,0.04+i*0.01);c.rotation.x=-0.4;wr.add(c)}
    wr.position.set(-0.1,0.35,0.02);g.add(wr);
    // Legs
    const ll=new THREE.Group();
    ll.add(loftMesh(
        [[0,0,0],[0,-0.06,0],[0,-0.12,0.008],[0,-0.17,0.015],[0,-0.22,0.02],[0,-0.24,0.025]],
        [0.015,0.018,0.012,0.012,0.008,0.008],
        [0.012,0.014,0.01,0.01,0.007,0.007],
        m,36,12
    ));
    ll.add(P(mkCone(0.004,0.03,claw),-0.01,-0.26,0.05));
    ll.add(P(mkCone(0.004,0.035,claw),0,-0.265,0.06));
    ll.add(P(mkCone(0.004,0.03,claw),0.01,-0.26,0.05));
    const hx=P(mkCone(0.003,0.02,claw),0,-0.25,-0.01);hx.rotation.x=2.5;ll.add(hx);
    ll.position.set(0.06,0.28,-0.02);g.add(ll);
    const lr=ll.clone();lr.position.x=-0.06;g.add(lr);
    // Tail
    const tail=new THREE.Group();
    const tPts=[],tW=[],tH=[];
    for(let i=0;i<8;i++){tPts.push([0,-0.004*i,-0.055*i]);tW.push(0.013-i*0.001);tH.push((0.013-i*0.001)*0.5)}
    tail.add(loftMesh(tPts,tW,tH,m,24,12));
    for(let i=0;i<7;i++){
        const f1=P(mkB(0.035+i*0.01,0.002,0.018+i*0.003,fm),0.015,0,-0.06-i*0.055);f1.rotation.z=-0.15;tail.add(f1);
        const f2=P(mkB(0.035+i*0.01,0.002,0.018+i*0.003,fm),-0.015,0,-0.06-i*0.055);f2.rotation.z=0.15;tail.add(f2);
    }
    tail.position.set(0,0.34,-0.13);g.add(tail);
    g.userData={parts:{head,wingL:wl,wingR:wr,legL:ll,legR:lr,tail,body:g.children[0]},bipedal:true,labelY:0.9,scale:0.25};
    return g;
}

/* ── 6. ALLOSAURUS ── */
function buildAllosaurus(){
    const g=new THREE.Group();
    const m=skinMat('#cc2211'),ml=skinMat('#ee5544'),dm=skinMat('#991a0e');
    const ew=new THREE.MeshStandardMaterial({color:0xffdd22,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x110800});
    const teeth=new THREE.MeshPhysicalMaterial({color:0xfff8ee,roughness:0.15,clearcoat:0.8,clearcoatRoughness:0.1,sheen:0.2,sheenRoughness:0.3,sheenColor:new THREE.Color(0xffffee)});
    const claw=new THREE.MeshStandardMaterial({color:0x2a1a10,roughness:0.5});
    // Body
    const body=loftMesh(
        [[0,2.7,0.55],[0,2.6,0.3],[0,2.4,0],[0,2.1,-0.1],[0,1.95,0.05]],
        [0.55,0.7,0.9,0.65,0.5],
        [0.55,0.75,0.95,0.7,0.55],
        m,16,8
    );
    g.add(body);
    g.add(P(mkS(0.4,ml,[1.5,0.5,0.72]),0,1.7,0));
    // Neck
    const neck=new THREE.Group();
    neck.add(loftMesh(
        [[0,0,0],[0,0.25,0.1],[0,0.48,0.2],[0,0.68,0.3]],
        [0.28,0.25,0.22,0.2],
        [0.24,0.22,0.2,0.17],
        m,24,16
    ));
    neck.position.set(0,2.7,0.6);g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.05,0.35],[0,-0.08,0.6],[0,-0.15,0.75],[0,-0.08,0.82]],
        [0.35,0.28,0.15,0.1],
        [0.25,0.18,0.12,0.08],
        m,24,18
    ));
    // Jaw
    head.add(P(mkS(0.22,m,[1.3,0.45,0.6]),0,-0.2,0.55));
    // Jaw muscles
    head.add(P(mkS(0.14,m,[0.8,1,0.7]),0.2,0.0,0.3));head.add(P(mkS(0.14,m,[0.8,1,0.7]),-0.2,0.0,0.3));
    // Brow ridges
    head.add(P(mkS(0.06,m,[1.5,0.65,0.85]),0.2,0.22,0.4));head.add(P(mkS(0.06,m,[1.5,0.65,0.85]),-0.2,0.22,0.4));
    // Nostrils
    head.add(P(mkS(0.03,new THREE.MeshStandardMaterial({color:0x1a0a05,roughness:0.8})),0.08,0.02,0.8));
    head.add(P(mkS(0.03,new THREE.MeshStandardMaterial({color:0x1a0a05,roughness:0.8})),-0.08,0.02,0.8));
    // Teeth
    for(let i=0;i<8;i++){const t=P(mkCone(0.011,0.055+Math.sin(i*0.4)*0.015,teeth),0.13-0.03*Math.abs(i-3.5),-0.22,0.42+i*0.055);t.rotation.x=Math.PI;head.add(t)}
    for(let i=0;i<8;i++){const t=P(mkCone(0.009,0.045+Math.sin(i*0.4)*0.01,teeth),0.13-0.03*Math.abs(i-3.5),-0.13,0.42+i*0.055);head.add(t)}
    // Eyes
    head.add(P(mkS(0.065,ew),0.24,0.12,0.42));head.add(P(mkS(0.035,ep),0.27,0.12,0.46));
    head.add(P(mkS(0.065,ew),-0.24,0.12,0.42));head.add(P(mkS(0.035,ep),-0.27,0.12,0.46));
    head.position.set(0,3.5,1.1);g.add(head);
    // Arms
    const al=new THREE.Group();
    al.add(P(mkS(0.04,m,[0.85,0.8,0.7]),0,0,0));
    al.add(P(mkC(0.045,0.035,0.28,m),0,-0.14,0));
    al.add(P(mkS(0.035,m,[0.9,0.7,0.8]),0,-0.28,0));
    al.add(P(mkC(0.035,0.025,0.25,m),0,-0.42,0.04));
    al.add(P(mkS(0.025,m,[0.85,0.6,0.75]),0,-0.54,0.06));
    al.add(P(mkCone(0.009,0.065,claw),0.02,-0.58,0.08));
    al.add(P(mkCone(0.009,0.075,claw),0,-0.6,0.1));
    al.add(P(mkCone(0.008,0.055,claw),-0.02,-0.57,0.08));
    al.position.set(0.35,2.7,0.65);al.rotation.x=-0.4;g.add(al);
    const ar=al.clone();ar.position.set(-0.35,2.7,0.65);ar.rotation.x=-0.4;g.add(ar);
    // Legs
    const ll=new THREE.Group();
    ll.add(loftMesh(
        [[0,0,0],[0.05,-0.15,0.02],[0,-0.5,0],[0,-0.95,0.02],[0,-1.4,0.08],[0,-1.85,0.12],[0,-1.95,0.18]],
        [0.22,0.16,0.14,0.1,0.1,0.08,0.1],
        [0.2,0.14,0.12,0.09,0.08,0.07,0.08],
        m,42,12
    ));
    ll.add(P(mkCone(0.013,0.09,claw),-0.06,-2.05,0.3));
    ll.add(P(mkCone(0.013,0.1,claw),0,-2.08,0.35));
    ll.add(P(mkCone(0.013,0.09,claw),0.06,-2.05,0.3));
    ll.position.set(0.45,2.1,-0.1);g.add(ll);
    const lr=ll.clone();lr.position.x=-0.45;g.add(lr);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.5],[0,-0.03,-1.2],[0,-0.06,-1.9],[0,-0.1,-2.6],[0,-0.15,-3.2],[0,-0.2,-3.8],[0,-0.24,-4.3]],
        [0.42,0.36,0.3,0.24,0.18,0.12,0.06],
        [0.27,0.22,0.17,0.12,0.08,0.05,0.03],
        m,42,16
    ));
    tail.position.set(0,2.35,-0.4);g.add(tail);
    g.userData={parts:{head,neck,legL:ll,legR:lr,tail,body:g.children[0]},bipedal:true,labelY:4.8,scale:1};
    return g;
}

/* ── 7. CERATOSAURUS ── */
function buildCeratosaurus(){
    const g=new THREE.Group();
    const m=skinMat('#8844cc'),ml=skinMat('#aa66ee'),dm=skinMat('#6633aa');
    const ew=new THREE.MeshStandardMaterial({color:0xffdd22,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x110800});
    const horn=new THREE.MeshStandardMaterial({color:0xeeddbb,roughness:0.45});
    const teeth=new THREE.MeshPhysicalMaterial({color:0xfff8ee,roughness:0.15,clearcoat:0.8,clearcoatRoughness:0.1,sheen:0.2,sheenRoughness:0.3,sheenColor:new THREE.Color(0xffffee)});
    const claw=new THREE.MeshStandardMaterial({color:0x2a1a10,roughness:0.5});
    // Body
    const body=loftMesh(
        [[0,1.95,0.2],[0,1.8,0],[0,1.6,-0.05],[0,1.42,0.05]],
        [0.55,0.75,0.6,0.5],
        [0.52,0.7,0.55,0.42],
        m,16,8
    );
    g.add(body);
    g.add(P(mkS(0.35,ml,[1.3,0.5,0.65]),0,1.35,0));
    // Neck
    const neck=new THREE.Group();
    neck.add(loftMesh(
        [[0,0,0],[0,0.2,0.08],[0,0.38,0.16]],
        [0.2,0.18,0.16],
        [0.18,0.16,0.14],
        m,18,16
    ));
    neck.position.set(0,2.1,0.45);g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.05,0.28],[0,-0.08,0.48],[0,-0.12,0.6],[0,-0.06,0.68]],
        [0.26,0.2,0.12,0.08],
        [0.2,0.14,0.09,0.06],
        m,24,18
    ));
    // Jaw
    head.add(P(mkS(0.16,m,[1.2,0.42,0.55]),0,-0.18,0.44));
    // Jaw muscles
    head.add(P(mkS(0.09,m,[0.8,0.9,0.65]),0.16,-0.02,0.22));head.add(P(mkS(0.09,m,[0.8,0.9,0.65]),-0.16,-0.02,0.22));
    // NASAL HORN
    const hn=P(mkCone(0.045,0.28,horn),0,0.24,0.52);hn.rotation.x=-0.25;head.add(hn);
    // Brow bumps
    head.add(P(mkS(0.035,horn,[1.2,0.85,0.9]),0.18,0.19,0.3));head.add(P(mkS(0.035,horn,[1.2,0.85,0.9]),-0.18,0.19,0.3));
    // Nostrils
    head.add(P(mkS(0.025,new THREE.MeshStandardMaterial({color:0x1a0a15,roughness:0.8})),0.06,0.0,0.65));
    head.add(P(mkS(0.025,new THREE.MeshStandardMaterial({color:0x1a0a15,roughness:0.8})),-0.06,0.0,0.65));
    // Teeth
    for(let i=0;i<6;i++){const t=P(mkCone(0.009,0.042+Math.sin(i*0.5)*0.01,teeth),0.09-0.02*Math.abs(i-2.5),-0.2,0.33+i*0.05);t.rotation.x=Math.PI;head.add(t)}
    for(let i=0;i<6;i++){const t=P(mkCone(0.008,0.036,teeth),0.09-0.02*Math.abs(i-2.5),-0.1,0.33+i*0.05);head.add(t)}
    // Eyes
    head.add(P(mkS(0.055,ew),0.2,0.1,0.3));head.add(P(mkS(0.03,ep),0.23,0.1,0.34));
    head.add(P(mkS(0.055,ew),-0.2,0.1,0.3));head.add(P(mkS(0.03,ep),-0.23,0.1,0.34));
    head.position.set(0,2.5,0.75);g.add(head);
    // Osteoderms
    for(let i=0;i<12;i++){const sz=0.028+Math.sin(i/11*Math.PI)*0.022;g.add(P(mkS(sz,horn,[1.2,0.8,1]),0,2.25+Math.sin(i/11*Math.PI)*0.14,-0.5+i*0.18))}
    // Arms
    const armL=new THREE.Group();
    armL.add(P(mkS(0.03,m,[0.8,0.7,0.6]),0,0,0));
    armL.add(P(mkC(0.035,0.025,0.25,m),0,-0.12,0));
    armL.add(P(mkS(0.02,m,[0.8,0.55,0.7]),0,-0.22,0.02));
    armL.add(P(mkCone(0.006,0.035,claw),0,-0.26,0.04));armL.add(P(mkCone(0.005,0.03,claw),0.01,-0.25,0.035));
    armL.position.set(0.24,1.7,0.4);armL.rotation.x=-0.5;g.add(armL);
    const armR=armL.clone();armR.position.x=-0.24;g.add(armR);
    // Legs
    const ll=new THREE.Group();
    ll.add(loftMesh(
        [[0,0,0],[0.04,-0.1,0.01],[0,-0.38,0],[0,-0.72,0.02],[0,-1.05,0.06],[0,-1.35,0.1],[0,-1.42,0.15]],
        [0.16,0.12,0.1,0.07,0.07,0.06,0.08],
        [0.13,0.1,0.08,0.06,0.06,0.05,0.06],
        m,42,12
    ));
    ll.add(P(mkCone(0.011,0.065,claw),-0.04,-1.5,0.25));
    ll.add(P(mkCone(0.011,0.075,claw),0,-1.52,0.28));
    ll.add(P(mkCone(0.011,0.065,claw),0.04,-1.5,0.25));
    ll.position.set(0.3,1.55,-0.05);g.add(ll);
    const lr=ll.clone();lr.position.x=-0.3;g.add(lr);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.4],[0,-0.02,-0.9],[0,-0.04,-1.4],[0,-0.08,-1.9],[0,-0.12,-2.35],[0,-0.16,-2.75],[0,-0.19,-3.1]],
        [0.32,0.27,0.22,0.18,0.14,0.09,0.05],
        [0.2,0.16,0.12,0.09,0.06,0.04,0.02],
        m,42,16
    ));
    tail.position.set(0,1.75,-0.25);g.add(tail);
    g.userData={parts:{head,neck,legL:ll,legR:lr,tail,body:g.children[0]},bipedal:true,labelY:3.5,scale:0.8};
    return g;
}

/* ── 8. TRICERATOPS ── */
function buildTriceratops(){
    const g=new THREE.Group();
    const m=skinMat('#ddaa33'),ml=skinMat('#eebb55'),dm=skinMat('#bb8822');
    const ew=new THREE.MeshPhysicalMaterial({color:0xffffdd,roughness:0.08,clearcoat:1,clearcoatRoughness:0.05,envMapIntensity:3}),ep=new THREE.MeshStandardMaterial({color:0x111100});
    const horn=new THREE.MeshStandardMaterial({color:0xfffff0,roughness:0.45});
    const frill=skinMat('#cc8822');
    const beak=new THREE.MeshStandardMaterial({color:0x665522,roughness:0.65});
    const claw=new THREE.MeshStandardMaterial({color:0x4a3818,roughness:0.6});
    // Body
    const body=loftMesh(
        [[0,2.18,0.65],[0,2.1,0.4],[0,1.85,0],[0,1.7,0],[0,1.4,0.08],[0,1.2,-0.1]],
        [0.65,0.85,1.2,1.0,0.9,0.55],
        [0.65,0.9,1.2,1.05,0.85,0.5],
        m,16,8
    );
    g.add(body);
    // Inline neck spheres
    g.add(P(mkS(0.45,m,[1.1,0.9,0.85]),0,2.15,0.8));
    g.add(P(mkS(0.38,m,[1.05,0.85,0.82]),0,2.1,0.95));
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.02,0.25],[0,-0.04,0.5],[0,-0.12,0.72]],
        [0.42,0.28,0.15],
        [0.36,0.2,0.1],
        m,18,18
    ));
    head.add(P(mkS(0.1,m,[1.15,0.42,0.5]),0,-0.16,0.58));
    head.add(P(mkS(0.15,beak,[1.4,0.5,0.55]),0,-0.12,0.72));
    // Jaw muscles
    head.add(P(mkS(0.16,m,[0.82,0.88,0.72]),0.26,-0.02,0.18));head.add(P(mkS(0.16,m,[0.82,0.88,0.72]),-0.26,-0.02,0.18));
    // Brow horns
    const lh=P(mkCone(0.042,0.72,horn),0.26,0.28,0.2);lh.rotation.x=-0.55;lh.rotation.z=-0.12;head.add(lh);
    const rh=P(mkCone(0.042,0.72,horn),-0.26,0.28,0.2);rh.rotation.x=-0.55;rh.rotation.z=0.12;head.add(rh);
    // Nose horn
    const nh=P(mkCone(0.042,0.2,horn),0,0.08,0.72);nh.rotation.x=-0.35;head.add(nh);
    // Frill
    head.add(P(mkS(0.62,frill,[1.28,1.08,0.12]),0,0.18,-0.22));
    head.add(P(mkS(0.15,frill,[1.1,0.9,0.08]),0.4,0.18,-0.18));head.add(P(mkS(0.15,frill,[1.1,0.9,0.08]),-0.4,0.18,-0.18));
    // Epoccipitals
    for(let i=0;i<12;i++){const ang=-1.4+i*0.255,r=0.6;const ex=Math.sin(ang)*r,ey=0.18+Math.cos(ang)*r*0.85;const ep2=P(mkCone(0.032,0.09,horn),ex,ey,-0.22);ep2.rotation.z=-ang;head.add(ep2)}
    // Eyes
    head.add(P(mkS(0.055,ew),0.32,0.02,0.28));head.add(P(mkS(0.032,ep),0.35,0.02,0.32));
    head.add(P(mkS(0.055,ew),-0.32,0.02,0.28));head.add(P(mkS(0.032,ep),-0.35,0.02,0.32));
    head.position.set(0,2.0,1.35);g.add(head);
    // Front legs
    function mkFLeg(x,z){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,0,0],[0.03,-0.15,0.02],[0,-0.55,0],[0,-1.05,0.02],[0,-1.25,0.03],[0,-1.4,0.04],[0,-1.48,0.05]],
            [0.16,0.12,0.12,0.09,0.09,0.07,0.09],
            [0.14,0.1,0.1,0.07,0.07,0.05,0.06],
            m,42,12
        ));
        lg.add(P(mkS(0.09,claw,[1,0.35,1.2]),0,-1.48,0.05));
        lg.position.set(x,1.5,z);return lg;
    }
    function mkBLeg(x,z){
        const lg=new THREE.Group();
        lg.add(loftMesh(
            [[0,0,0],[0.04,-0.12,0.02],[0,-0.62,0],[0,-1.2,0.02],[0,-1.42,0.04],[0,-1.58,0.06]],
            [0.2,0.15,0.14,0.1,0.1,0.08],
            [0.18,0.13,0.12,0.08,0.08,0.06],
            m,36,12
        ));
        lg.add(P(mkCone(0.016,0.065,claw),-0.05,-1.65,0.1));
        lg.add(P(mkCone(0.016,0.075,claw),0,-1.67,0.12));
        lg.add(P(mkCone(0.016,0.065,claw),0.05,-1.65,0.1));
        lg.position.set(x,1.6,z);return lg;
    }
    const fll=mkFLeg(0.6,0.95),flr=mkFLeg(-0.6,0.95),bll=mkBLeg(0.55,-0.65),blr=mkBLeg(-0.55,-0.65);
    g.add(fll,flr,bll,blr);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.45],[0,-0.03,-0.95],[0,-0.07,-1.4],[0,-0.11,-1.85],[0,-0.15,-2.25]],
        [0.42,0.34,0.26,0.18,0.1],
        [0.26,0.2,0.15,0.1,0.05],
        m,30,16
    ));
    tail.position.set(0,1.65,-0.75);g.add(tail);
    g.userData={parts:{head,legFL:fll,legFR:flr,legBL:bll,legBR:blr,tail,body:g.children[0]},bipedal:false,labelY:4,scale:1};
    return g;
}

/* ── 9. VELOCIRAPTOR ── */
function buildVelociraptor(){
    const g=new THREE.Group();
    const m=skinMat('#ee7722'),dm=skinMat('#cc5511');
    const fm=new THREE.MeshStandardMaterial({color:0xff9933,side:THREE.DoubleSide,roughness:0.5});
    const primFm=new THREE.MeshStandardMaterial({color:0xcc6622,side:THREE.DoubleSide,roughness:0.55});
    const ew=new THREE.MeshStandardMaterial({color:0xffdd22,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x110800});
    const claw=new THREE.MeshStandardMaterial({color:0x2a1a10,roughness:0.5});
    const teeth=new THREE.MeshPhysicalMaterial({color:0xfff8ee,roughness:0.15,clearcoat:0.8,clearcoatRoughness:0.1,sheen:0.2,sheenRoughness:0.3,sheenColor:new THREE.Color(0xffffee)});
    // Body
    const body=loftMesh(
        [[0,0.56,0.12],[0,0.55,0],[0,0.52,0.02],[0,0.48,-0.06]],
        [0.08,0.14,0.12,0.06],
        [0.06,0.1,0.08,0.05],
        m,16,8
    );
    g.add(body);
    // Neck
    const neckG=new THREE.Group();
    neckG.add(loftMesh(
        [[0,0,0],[0,0.06,0.04],[0,0.11,0.07],[0,0.16,0.1]],
        [0.055,0.05,0.045,0.04],
        [0.047,0.043,0.038,0.033],
        m,24,16
    ));
    neckG.position.set(0,0.6,0.18);g.add(neckG);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.02,0.1],[0,-0.003,0.2],[0,-0.02,0.24],[0,-0.03,0.18]],
        [0.085,0.055,0.03,0.04],
        [0.06,0.03,0.02,0.025],
        m,24,18
    ));
    // Nostrils
    head.add(P(mkS(0.01,new THREE.MeshStandardMaterial({color:0x1a0a05,roughness:0.8})),0.02,0.01,0.28));
    head.add(P(mkS(0.01,new THREE.MeshStandardMaterial({color:0x1a0a05,roughness:0.8})),-0.02,0.01,0.28));
    // Teeth
    for(let i=0;i<8;i++){const t=P(mkCone(0.003,0.018,teeth),0.028-0.005*Math.abs(i-3.5),-0.03,0.08+i*0.028);t.rotation.x=Math.PI;head.add(t)}
    for(let i=0;i<8;i++){const t=P(mkCone(0.003,0.015,teeth),0.028-0.005*Math.abs(i-3.5),-0.015,0.08+i*0.028);head.add(t)}
    // Eyes
    head.add(P(mkS(0.038,ew),0.06,0.04,0.08));head.add(P(mkS(0.022,ep),0.068,0.04,0.1));
    head.add(P(mkS(0.038,ew),-0.06,0.04,0.08));head.add(P(mkS(0.022,ep),-0.068,0.04,0.1));
    head.position.set(0,0.78,0.28);g.add(head);
    // Arms (separate L and R, NOT cloned)
    const al=new THREE.Group();
    al.add(P(mkS(0.014,m,[0.82,0.75,0.72]),0,0,0));
    al.add(P(mkC(0.016,0.012,0.1,m),0,-0.05,0));
    al.add(P(mkS(0.012,m,[0.8,0.65,0.78]),0,-0.1,0));
    al.add(P(mkC(0.012,0.009,0.08,m),0,-0.16,0.02));
    for(let i=0;i<6;i++){const f=P(mkB(0.055+i*0.012,0.002,0.018+i*0.003,primFm),0.025+i*0.022,-0.07-0.018*i,0.01);f.rotation.z=-0.07*i;al.add(f)}
    for(let i=0;i<4;i++){al.add(P(mkB(0.04+i*0.005,0.002,0.022,fm),0.01+i*0.018,-0.04,0.01))}
    al.add(P(mkCone(0.004,0.028,claw),0.01,-0.2,0.04));al.add(P(mkCone(0.005,0.035,claw),0,-0.22,0.05));al.add(P(mkCone(0.004,0.028,claw),-0.01,-0.2,0.04));
    al.position.set(0.1,0.54,0.12);g.add(al);
    const ar=new THREE.Group();
    ar.add(P(mkS(0.014,m,[0.82,0.75,0.72]),0,0,0));
    ar.add(P(mkC(0.016,0.012,0.1,m),0,-0.05,0));
    ar.add(P(mkS(0.012,m,[0.8,0.65,0.78]),0,-0.1,0));
    ar.add(P(mkC(0.012,0.009,0.08,m),0,-0.16,0.02));
    for(let i=0;i<6;i++){const f=P(mkB(0.055+i*0.012,0.002,0.018+i*0.003,primFm),-0.025-i*0.022,-0.07-0.018*i,0.01);f.rotation.z=0.07*i;ar.add(f)}
    for(let i=0;i<4;i++){ar.add(P(mkB(0.04+i*0.005,0.002,0.022,fm),-0.01-i*0.018,-0.04,0.01))}
    ar.add(P(mkCone(0.004,0.028,claw),0.01,-0.2,0.04));ar.add(P(mkCone(0.005,0.035,claw),0,-0.22,0.05));ar.add(P(mkCone(0.004,0.028,claw),-0.01,-0.2,0.04));
    ar.position.set(-0.1,0.54,0.12);g.add(ar);
    // Legs with SICKLE CLAW
    const ll=new THREE.Group();
    ll.add(loftMesh(
        [[0,0,0],[0.01,-0.02,0.01],[0,-0.09,0],[0,-0.18,0.01],[0,-0.27,0.02],[0,-0.35,0.03],[0,-0.38,0.05]],
        [0.04,0.03,0.025,0.018,0.018,0.014,0.018],
        [0.032,0.025,0.02,0.015,0.014,0.012,0.014],
        m,42,12
    ));
    const kc=P(mkCone(0.007,0.065,claw),-0.02,-0.36,0.04);kc.rotation.x=-0.7;ll.add(kc);
    ll.add(P(mkCone(0.005,0.038,claw),0,-0.42,0.08));
    ll.add(P(mkCone(0.005,0.032,claw),0.02,-0.41,0.07));
    ll.position.set(0.08,0.44,-0.04);g.add(ll);
    const lr=ll.clone();lr.position.x=-0.08;g.add(lr);
    // Tail with feather fans
    const tail=new THREE.Group();
    const tPts=[],tW=[],tH=[];
    for(let i=0;i<10;i++){const r=0.055-0.005*i;tPts.push([0,-0.002*i,-0.15*i]);tW.push(Math.max(0.008,r)*0.8);tH.push(Math.max(0.008,r)*0.16)}
    tail.add(loftMesh(tPts,tW,tH,m,28,12));
    for(let i=0;i<5;i++){
        const f1=P(mkB(0.028+i*0.006,0.002,0.014+i*0.002,fm),0.01,0,-1.1-i*0.04);f1.rotation.z=-0.1;tail.add(f1);
        const f2=P(mkB(0.028+i*0.006,0.002,0.014+i*0.002,fm),-0.01,0,-1.1-i*0.04);f2.rotation.z=0.1;tail.add(f2);
    }
    tail.position.set(0,0.53,-0.14);g.add(tail);
    g.userData={parts:{head,armL:al,armR:ar,legL:ll,legR:lr,tail,body:g.children[0]},bipedal:true,labelY:1.1,scale:0.35};
    return g;
}

/* ── 10. PARASAUROLOPHUS ── */
function buildParasaurolophus(){
    const g=new THREE.Group();
    const m=skinMat('#33bb55'),ml=skinMat('#55dd77'),nm=skinMat('#22aa44'),dm=skinMat('#1a8833');
    const ew=new THREE.MeshPhysicalMaterial({color:0xffffdd,roughness:0.08,clearcoat:1,clearcoatRoughness:0.05,envMapIntensity:3}),ep=new THREE.MeshStandardMaterial({color:0x111100});
    const crest=skinMat('#44ee66');
    const bill=new THREE.MeshStandardMaterial({color:0x88cc66,roughness:0.6});
    const clawM=new THREE.MeshStandardMaterial({color:0x4a3818,roughness:0.6});
    // Body
    const body=loftMesh(
        [[0,2.55,0.4],[0,2.45,0.25],[0,2.2,0],[0,2.0,0],[0,1.72,0.08]],
        [0.55,0.7,0.9,0.7,0.55],
        [0.55,0.7,0.88,0.65,0.5],
        m,16,8
    );
    g.add(body);
    g.add(P(mkS(0.4,ml,[1.3,0.5,0.7]),0,1.65,0));
    // Neck
    const neck=new THREE.Group();
    const nd=[{y:0,z:0,r:0.25},{y:0.45,z:0.15,r:0.23},{y:0.85,z:0.28,r:0.21},{y:1.2,z:0.38,r:0.19},{y:1.5,z:0.46,r:0.17},{y:1.72,z:0.52,r:0.15}];
    const nPts=[],nW=[],nH=[];
    nd.forEach(s=>{nPts.push([0,s.y,s.z]);nW.push(s.r);nH.push(s.r*0.88)});
    neck.add(loftMesh(nPts,nW,nH,nm,24,12));
    neck.position.set(0,2.55,0.55);g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0,0.12],[0,-0.03,0.28],[0,-0.06,0.38]],
        [0.2,0.13,0.1],
        [0.16,0.1,0.06],
        m,18,18
    ));
    head.add(P(mkS(0.1,m,[1.1,0.5,0.52]),0,-0.12,0.26));
    // Duck bill
    head.add(P(mkS(0.1,bill,[1.6,0.35,0.65]),0,-0.06,0.38));
    head.add(P(mkS(0.08,bill,[1.4,0.28,0.6]),0,-0.14,0.36));
    // Jaw muscles
    head.add(P(mkS(0.07,m,[0.78,0.82,0.65]),0.12,-0.02,0.08));head.add(P(mkS(0.07,m,[0.78,0.82,0.65]),-0.12,-0.02,0.08));
    // TUBULAR CREST
    const cr1=P(mkC(0.042,0.037,0.3,crest),0,0.2,0.02);cr1.rotation.x=0.25;head.add(cr1);
    const cr2=P(mkC(0.037,0.03,0.35,crest),0,0.38,-0.08);cr2.rotation.x=0.5;head.add(cr2);
    const cr3=P(mkC(0.03,0.022,0.35,crest),0,0.55,-0.25);cr3.rotation.x=0.75;head.add(cr3);
    head.add(P(mkS(0.022,crest,[1,0.82,0.72]),0,0.68,-0.45));
    // Nostrils
    head.add(P(mkS(0.02,new THREE.MeshStandardMaterial({color:0x1a2a0a,roughness:0.8})),0.06,0.04,0.12));
    head.add(P(mkS(0.02,new THREE.MeshStandardMaterial({color:0x1a2a0a,roughness:0.8})),-0.06,0.04,0.12));
    // Eyes
    head.add(P(mkS(0.05,ew),0.14,0.04,0.1));head.add(P(mkS(0.03,ep),0.16,0.04,0.13));
    head.add(P(mkS(0.05,ew),-0.14,0.04,0.1));head.add(P(mkS(0.03,ep),-0.16,0.04,0.13));
    head.position.set(0,4.55,1.25);g.add(head);
    // Arms
    const armL=new THREE.Group();
    armL.add(P(mkS(0.035,m,[0.82,0.75,0.68]),0,0,0));
    armL.add(P(mkC(0.04,0.03,0.25,m),0,-0.12,0));
    armL.add(P(mkS(0.028,m,[0.8,0.6,0.72]),0,-0.25,0));
    armL.add(P(mkC(0.03,0.025,0.2,m),0,-0.38,0.02));
    armL.add(P(mkS(0.022,m,[0.78,0.5,0.68]),0,-0.48,0.03));
    armL.add(P(mkS(0.03,clawM,[1.1,0.4,1]),0,-0.52,0.04));
    armL.position.set(0.35,2.3,0.45);armL.rotation.x=-0.3;g.add(armL);
    const armR=armL.clone();armR.position.x=-0.35;g.add(armR);
    // Legs
    const ll=new THREE.Group();
    ll.add(loftMesh(
        [[0,0,0],[0.04,-0.1,0.02],[0,-0.42,0],[0,-0.82,0.02],[0,-1.2,0.06],[0,-1.55,0.1],[0,-1.62,0.14]],
        [0.2,0.15,0.13,0.09,0.09,0.065,0.08],
        [0.17,0.13,0.1,0.08,0.07,0.055,0.06],
        m,42,12
    ));
    ll.add(P(mkCone(0.013,0.065,clawM),-0.05,-1.72,0.22));
    ll.add(P(mkCone(0.013,0.075,clawM),0,-1.75,0.25));
    ll.add(P(mkCone(0.013,0.065,clawM),0.05,-1.72,0.22));
    ll.position.set(0.4,1.75,-0.1);g.add(ll);
    const lr=ll.clone();lr.position.x=-0.4;g.add(lr);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.5],[0,-0.02,-1],[0,-0.04,-1.5],[0,-0.08,-2],[0,-0.12,-2.5],[0,-0.15,-2.95],[0,-0.18,-3.35]],
        [0.36,0.31,0.26,0.21,0.16,0.1,0.06],
        [0.22,0.19,0.15,0.11,0.08,0.05,0.03],
        m,42,16
    ));
    tail.position.set(0,2.05,-0.45);g.add(tail);
    g.userData={parts:{head,neck,legL:ll,legR:lr,tail,body:g.children[0]},bipedal:true,labelY:5.8,scale:0.9};
    return g;
}

/* ── 11. MOSASAURUS ── */
function buildMosasaurus(){
    const g=new THREE.Group();
    const m=skinMat('#1166aa'),ml=skinMat('#2288cc'),dm=skinMat('#0e5590');
    const ew=new THREE.MeshStandardMaterial({color:0xeeffcc,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x001111});
    const teeth=new THREE.MeshPhysicalMaterial({color:0xfff8ee,roughness:0.15,clearcoat:0.8,clearcoatRoughness:0.1,sheen:0.2,sheenRoughness:0.3,sheenColor:new THREE.Color(0xffffee)});
    const finM=skinMat('#1166aa');finM.side=THREE.DoubleSide;
    // Body
    const body=loftMesh(
        [[0,0.08,0.8],[0,0.02,1.4],[0,0,0],[0,-0.18,0],[0,-0.25,-0.4]],
        [0.6,0.5,1.4,1.15,0.8],
        [0.5,0.45,0.92,0.65,0.5],
        m,16,8
    );
    g.add(body);
    // Dorsal ridge
    for(let i=0;i<8;i++){g.add(P(mkS(0.06-i*0.004,m,[1,0.6,0.4]),0,0.72-0.04*i,-0.7+i*0.32))}
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.04,0.7],[0,-0.01,1],[0,-0.08,1.2]],
        [0.48,0.38,0.15],
        [0.35,0.26,0.12],
        m,18,18
    ));
    // Jaw
    head.add(P(mkS(0.28,m,[1.4,0.38,0.46]),0,-0.15,0.65));
    head.add(P(mkS(0.24,m,[1.4,0.38,0.46]),0,-0.18,1.05));
    // Jaw muscles
    head.add(P(mkS(0.2,m,[0.85,0.92,0.72]),0.3,0.02,0.55));head.add(P(mkS(0.2,m,[0.85,0.92,0.72]),-0.3,0.02,0.55));
    // Teeth bar
    head.add(P(mkB(0.2,0.022,0.32,teeth),0,-0.06,0.85));
    for(let i=0;i<10;i++){const t=P(mkCone(0.013,0.068+Math.sin(i*0.35)*0.018,teeth),0.17-0.02*Math.abs(i-4.5),-0.2,0.5+i*0.065);t.rotation.x=Math.PI;head.add(t)}
    for(let i=0;i<10;i++){const t=P(mkCone(0.012,0.058+Math.sin(i*0.35)*0.014,teeth),0.17-0.02*Math.abs(i-4.5),-0.1,0.5+i*0.065);head.add(t)}
    // Nostrils
    head.add(P(mkS(0.035,new THREE.MeshStandardMaterial({color:0x0a1a25,roughness:0.8})),0.12,0.12,0.75));
    head.add(P(mkS(0.035,new THREE.MeshStandardMaterial({color:0x0a1a25,roughness:0.8})),-0.12,0.12,0.75));
    // Eyes
    head.add(P(mkS(0.09,ew),0.34,0.12,0.62));head.add(P(mkS(0.055,ep),0.37,0.12,0.66));
    head.add(P(mkS(0.09,ew),-0.34,0.12,0.62));head.add(P(mkS(0.055,ep),-0.37,0.12,0.66));
    head.position.set(0,0.1,1.4);g.add(head);
    // Front flippers
    const fl1=new THREE.Group();
    fl1.add(P(mkS(0.14,m,[1,1.2,0.6]),0,0,0));fl1.add(P(mkS(0.08,m,[0.9,1,0.5]),0.15,-0.03,0.01));
    fl1.add(P(mkB(0.3,0.035,0.2,finM),0.2,-0.05,0.02));fl1.add(P(mkB(0.35,0.028,0.17,finM),0.45,-0.07,0.01));fl1.add(P(mkB(0.2,0.02,0.12,finM),0.7,-0.09,0));
    fl1.position.set(0.7,-0.25,0.5);fl1.rotation.z=-0.25;g.add(fl1);
    const fr1=new THREE.Group();
    fr1.add(P(mkS(0.14,m,[1,1.2,0.6]),0,0,0));fr1.add(P(mkS(0.08,m,[0.9,1,0.5]),-0.15,-0.03,0.01));
    fr1.add(P(mkB(0.3,0.035,0.2,finM),-0.2,-0.05,0.02));fr1.add(P(mkB(0.35,0.028,0.17,finM),-0.45,-0.07,0.01));fr1.add(P(mkB(0.2,0.02,0.12,finM),-0.7,-0.09,0));
    fr1.position.set(-0.7,-0.25,0.5);fr1.rotation.z=0.25;g.add(fr1);
    // Rear flippers
    const fl2=new THREE.Group();fl2.add(P(mkB(0.3,0.03,0.16,finM),0.15,0,0));fl2.add(P(mkB(0.25,0.025,0.14,finM),0.4,-0.02,0));
    fl2.position.set(0.5,-0.28,-0.8);fl2.rotation.z=-0.2;g.add(fl2);
    const fr2=new THREE.Group();fr2.add(P(mkB(0.3,0.03,0.16,finM),-0.15,0,0));fr2.add(P(mkB(0.25,0.025,0.14,finM),-0.4,-0.02,0));
    fr2.position.set(-0.5,-0.28,-0.8);fr2.rotation.z=0.2;g.add(fr2);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.9],[0,0.01,-1.8],[0,0.03,-2.6],[0,0.05,-3.3],[0,0.07,-3.9],[0,0.09,-4.3]],
        [0.62,0.5,0.38,0.28,0.18,0.1],
        [0.36,0.28,0.2,0.14,0.09,0.05],
        m,16,8
    ));
    tail.add(P(mkB(0.06,0.58,0.32,finM),0,0.13,-4.6));
    tail.add(P(mkCone(0.06,0.2,finM),0,-0.22,-2.5));
    tail.position.set(0,0,-0.9);g.add(tail);
    g.userData={parts:{head,tail,body:g.children[0]},bipedal:false,labelY:2.5,scale:1};
    return g;
}

/* ── 12. PLESIOSAURUS ── */
function buildPlesiosaurus(){
    const g=new THREE.Group();
    const m=skinMat('#2288bb'),nm=skinMat('#1177aa'),ml=skinMat('#33aadd'),dm=skinMat('#1a6699');
    const ew=new THREE.MeshStandardMaterial({color:0xeeffcc,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x001111});
    const finM=skinMat('#2288bb');finM.side=THREE.DoubleSide;
    const teeth=new THREE.MeshPhysicalMaterial({color:0xfff8ee,roughness:0.15,clearcoat:0.8,clearcoatRoughness:0.1,sheen:0.2,sheenRoughness:0.3,sheenColor:new THREE.Color(0xffffee)});
    // Body
    const body=loftMesh(
        [[0,0.08,0.2],[0,0,0],[0,-0.15,0],[0,-0.28,0]],
        [0.55,1.0,0.82,0.55],
        [0.6,0.72,0.55,0.2],
        m,16,8
    );
    g.add(body);
    // Neck (12 segments, very long)
    const neck=new THREE.Group();
    const nd=[{y:0,z:0,r:0.24},{y:0.45,z:0.16,r:0.22},{y:0.88,z:0.32,r:0.2},{y:1.28,z:0.46,r:0.18},{y:1.62,z:0.56,r:0.17},{y:1.95,z:0.65,r:0.15},{y:2.25,z:0.72,r:0.14},{y:2.52,z:0.78,r:0.12},{y:2.76,z:0.82,r:0.11},{y:2.98,z:0.85,r:0.1},{y:3.15,z:0.87,r:0.09},{y:3.3,z:0.89,r:0.08}];
    const nPts=[],nW=[],nH=[];
    nd.forEach(s=>{nPts.push([0,s.y,s.z]);nW.push(s.r);nH.push(s.r*0.88)});
    neck.add(loftMesh(nPts,nW,nH,nm,32,12));
    neck.position.set(0,0.28,0.65);g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0,0.06],[0,-0.02,0.14],[0,-0.06,0.12]],
        [0.1,0.065,0.05],
        [0.08,0.04,0.025],
        m,18,18
    ));
    head.add(P(mkS(0.03,dm,[0.85,0.55,0.5]),0.06,-0.01,0.06));head.add(P(mkS(0.03,dm,[0.85,0.55,0.5]),-0.06,-0.01,0.06));
    // Teeth
    for(let i=0;i<6;i++){const t=P(mkCone(0.004,0.024,teeth),0.035-0.006*i,-0.06,0.06+i*0.025);t.rotation.x=Math.PI;head.add(t)}
    for(let i=0;i<6;i++){const t=P(mkCone(0.004,0.02,teeth),0.035-0.006*i,-0.035,0.06+i*0.025);head.add(t)}
    // Nostrils
    head.add(P(mkS(0.015,new THREE.MeshStandardMaterial({color:0x0a1a25,roughness:0.8})),0.03,0.02,0.15));
    head.add(P(mkS(0.015,new THREE.MeshStandardMaterial({color:0x0a1a25,roughness:0.8})),-0.03,0.02,0.15));
    // Eyes
    head.add(P(mkS(0.04,ew),0.07,0.035,0.05));head.add(P(mkS(0.024,ep),0.08,0.035,0.065));
    head.add(P(mkS(0.04,ew),-0.07,0.035,0.05));head.add(P(mkS(0.024,ep),-0.08,0.035,0.065));
    head.position.set(0,3.8,1.7);g.add(head);
    // Four flippers
    const fl1=new THREE.Group();fl1.add(P(mkS(0.12,m,[1,1.1,0.55]),0,0,0));fl1.add(P(mkS(0.06,m,[0.9,0.9,0.45]),0.12,-0.02,0.005));fl1.add(P(mkB(0.28,0.028,0.18,finM),0.2,-0.03,0.01));fl1.add(P(mkB(0.32,0.022,0.15,finM),0.42,-0.05,0));fl1.add(P(mkB(0.15,0.015,0.1,finM),0.6,-0.06,0));
    fl1.position.set(0.55,-0.1,0.25);fl1.rotation.z=-0.18;g.add(fl1);
    const fr1=new THREE.Group();fr1.add(P(mkS(0.12,m,[1,1.1,0.55]),0,0,0));fr1.add(P(mkS(0.06,m,[0.9,0.9,0.45]),-0.12,-0.02,0.005));fr1.add(P(mkB(0.28,0.028,0.18,finM),-0.2,-0.03,0.01));fr1.add(P(mkB(0.32,0.022,0.15,finM),-0.42,-0.05,0));fr1.add(P(mkB(0.15,0.015,0.1,finM),-0.6,-0.06,0));
    fr1.position.set(-0.55,-0.1,0.25);fr1.rotation.z=0.18;g.add(fr1);
    const fl2=new THREE.Group();fl2.add(P(mkS(0.09,m,[1,1,0.5]),0,0,0));fl2.add(P(mkS(0.05,m,[0.9,0.85,0.45]),0.1,-0.01,0));fl2.add(P(mkB(0.22,0.025,0.14,finM),0.16,-0.02,0));fl2.add(P(mkB(0.26,0.018,0.12,finM),0.35,-0.04,0));fl2.add(P(mkB(0.12,0.012,0.08,finM),0.5,-0.05,0));
    fl2.position.set(0.45,-0.1,-0.38);fl2.rotation.z=-0.18;g.add(fl2);
    const fr2=new THREE.Group();fr2.add(P(mkS(0.09,m,[1,1,0.5]),0,0,0));fr2.add(P(mkS(0.05,m,[0.9,0.85,0.45]),-0.1,-0.01,0));fr2.add(P(mkB(0.22,0.025,0.14,finM),-0.16,-0.02,0));fr2.add(P(mkB(0.26,0.018,0.12,finM),-0.35,-0.04,0));fr2.add(P(mkB(0.12,0.012,0.08,finM),-0.5,-0.05,0));
    fr2.position.set(-0.45,-0.1,-0.38);fr2.rotation.z=0.18;g.add(fr2);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.4],[0,0.005,-0.8],[0,0.01,-1.15],[0,0.015,-1.4]],
        [0.3,0.22,0.14,0.08],
        [0.16,0.12,0.07,0.04],
        m,24,16
    ));
    tail.add(P(mkB(0.04,0.22,0.14,finM),0,0.02,-1.55));
    tail.position.set(0,-0.04,-0.55);g.add(tail);
    g.userData={parts:{head,neck,tail,body:g.children[0]},bipedal:false,labelY:4.5,scale:0.85};
    return g;
}

/* ── 13. ICHTHYOSAURUS ── */
function buildIchthyosaurus(){
    const g=new THREE.Group();
    const m=skinMat('#3399dd'),ml=skinMat('#55bbee'),dm=skinMat('#2277bb');
    const ew=new THREE.MeshStandardMaterial({color:0xffeebb,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x001111});
    const finM=skinMat('#2288cc');finM.side=THREE.DoubleSide;
    const teeth=new THREE.MeshPhysicalMaterial({color:0xfff8ee,roughness:0.15,clearcoat:0.8,clearcoatRoughness:0.1,sheen:0.2,sheenRoughness:0.3,sheenColor:new THREE.Color(0xffffee)});
    const sclera=new THREE.MeshStandardMaterial({color:0x2a3a4a,roughness:0.6});
    // Body (dolphin-like fusiform)
    const body=loftMesh(
        [[0,0.03,0.35],[0,0.02,0.55],[0,0,0],[0,-0.1,0],[0,-0.12,-0.2]],
        [0.3,0.35,0.5,0.42,0.25],
        [0.28,0.32,0.44,0.34,0.2],
        m,16,8
    );
    g.add(body);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.02,0.25],[0,-0.005,0.45],[0,-0.04,0.58],[0,-0.02,0.65]],
        [0.2,0.14,0.07,0.05],
        [0.15,0.1,0.05,0.03],
        m,24,18
    ));
    // Jaw
    head.add(P(mkS(0.1,m,[1.6,0.35,0.38]),0,-0.08,0.42));
    // Teeth
    for(let i=0;i<8;i++){const t=P(mkCone(0.004,0.02,teeth),0.045-0.008*i,-0.08,0.28+i*0.045);t.rotation.x=Math.PI;head.add(t)}
    for(let i=0;i<8;i++){const t=P(mkCone(0.004,0.016,teeth),0.045-0.008*i,-0.04,0.28+i*0.045);head.add(t)}
    // Nostrils
    head.add(P(mkS(0.02,new THREE.MeshStandardMaterial({color:0x0a1a25,roughness:0.8})),0.06,0.06,0.3));
    head.add(P(mkS(0.02,new THREE.MeshStandardMaterial({color:0x0a1a25,roughness:0.8})),-0.06,0.06,0.3));
    // ENORMOUS eyes with sclerotic ring
    head.add(P(mkS(0.14,sclera),0.17,0.06,0.18));head.add(P(mkS(0.115,ew),0.175,0.065,0.19));head.add(P(mkS(0.07,ep),0.18,0.065,0.2));
    head.add(P(mkS(0.14,sclera),-0.17,0.06,0.18));head.add(P(mkS(0.115,ew),-0.175,0.065,0.19));head.add(P(mkS(0.07,ep),-0.18,0.065,0.2));
    head.position.set(0,0.05,0.55);g.add(head);
    // Dorsal fin
    const dorsal=P(mkCone(0.14,0.42,finM),0,0.5,-0.08);g.add(dorsal);
    // Pectoral flippers
    const fl=new THREE.Group();fl.add(P(mkS(0.07,m,[1,1,0.5]),0,0,0));fl.add(P(mkB(0.12,0.02,0.09,finM),0.08,-0.01,0));fl.add(P(mkB(0.15,0.016,0.08,finM),0.2,-0.02,0));fl.add(P(mkB(0.1,0.012,0.06,finM),0.32,-0.03,0));
    fl.position.set(0.32,-0.18,0.12);fl.rotation.z=-0.22;g.add(fl);
    const fr=new THREE.Group();fr.add(P(mkS(0.07,m,[1,1,0.5]),0,0,0));fr.add(P(mkB(0.12,0.02,0.09,finM),-0.08,-0.01,0));fr.add(P(mkB(0.15,0.016,0.08,finM),-0.2,-0.02,0));fr.add(P(mkB(0.1,0.012,0.06,finM),-0.32,-0.03,0));
    fr.position.set(-0.32,-0.18,0.12);fr.rotation.z=0.22;g.add(fr);
    // Pelvic fins
    g.add(P(mkB(0.15,0.015,0.08,finM),0.22,-0.16,-0.32));g.add(P(mkB(0.15,0.015,0.08,finM),-0.22,-0.16,-0.32));
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.35],[0,-0.01,-0.72],[0,-0.04,-1.05],[0,-0.07,-1.32],[0,-0.1,-1.55]],
        [0.24,0.18,0.12,0.08,0.05],
        [0.13,0.1,0.06,0.04,0.02],
        m,30,16
    ));
    // Reverse heterocercal fin
    tail.add(P(mkB(0.04,0.38,0.22,finM),0,0.06,-1.7));
    tail.add(P(mkB(0.03,0.2,0.16,finM),0,-0.16,-1.65));
    tail.position.set(0,0,-0.45);g.add(tail);
    g.userData={parts:{head,tail,body:g.children[0]},bipedal:false,labelY:1.5,scale:0.6};
    return g;
}

/* ── 14. ARCHELON ── */
function buildArchelon(){
    const g=new THREE.Group();
    const m=skinMat('#33aa66'),shell=skinMat('#558844'),dm=skinMat('#2a8855');
    const ew=new THREE.MeshStandardMaterial({color:0xeeffcc,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x111100});
    const finM=skinMat('#33aa66');finM.side=THREE.DoubleSide;
    const beakM=new THREE.MeshStandardMaterial({color:0x585840,roughness:0.7});
    // Shell (main body)
    g.add(P(mkS(1.3,shell,[1.48,0.54,1.15]),0,0.32,0));
    g.add(P(mkS(0.6,shell,[1.3,0.3,1]),0,0.55,0));
    // Vertebral scutes
    for(let i=0;i<7;i++){g.add(P(mkS(0.09+Math.sin(i/6*Math.PI)*0.04,shell,[1.3,0.5,0.85]),0,0.6,-0.7+i*0.24))}
    // Costal ridges
    for(let i=0;i<6;i++){const rz=-0.5+i*0.2;g.add(P(mkS(0.06+Math.sin(i/5*Math.PI)*0.02,shell,[0.5,0.3,1.2]),0.38,0.48,rz));g.add(P(mkS(0.06+Math.sin(i/5*Math.PI)*0.02,shell,[0.5,0.3,1.2]),-0.38,0.48,rz))}
    // Marginal scutes
    for(let i=0;i<5;i++){const ang=-0.6+i*0.3;g.add(P(mkS(0.05,shell,[0.8,0.35,1]),0.55,0.35,ang));g.add(P(mkS(0.05,shell,[0.8,0.35,1]),-0.55,0.35,ang))}
    // Plastron
    g.add(P(mkS(1.05,m,[1.35,0.22,1.02]),0,-0.04,0));
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0,0.08],[0,-0.02,0.2],[0,-0.06,0.26],[0,-0.12,0.23]],
        [0.22,0.14,0.1,0.08],
        [0.18,0.1,0.07,0.05],
        m,24,18
    ));
    head.add(P(mkS(0.1,beakM,[1.4,0.45,0.52]),0,-0.06,0.26));
    head.add(P(mkS(0.08,beakM,[1.3,0.35,0.48]),0,-0.12,0.23));
    head.add(P(mkS(0.06,dm,[0.85,0.6,0.55]),0.06,-0.03,0.18));
    // Jaw muscles
    head.add(P(mkS(0.07,m,[0.82,0.85,0.65]),0.13,-0.01,0.04));head.add(P(mkS(0.07,m,[0.82,0.85,0.65]),-0.13,-0.01,0.04));
    // Eyes
    head.add(P(mkS(0.058,ew),0.14,0.05,0.06));head.add(P(mkS(0.035,ep),0.15,0.05,0.075));
    head.add(P(mkS(0.058,ew),-0.14,0.05,0.06));head.add(P(mkS(0.035,ep),-0.15,0.05,0.075));
    head.add(P(mkS(0.02,m,[1.2,0.6,0.8]),0.1,0.08,0.08));head.add(P(mkS(0.02,m,[1.2,0.6,0.8]),-0.1,0.08,0.08));
    head.position.set(0,0.08,0.85);g.add(head);
    // Front flippers (enormous)
    const ffl=new THREE.Group();ffl.add(P(mkS(0.14,m,[1,1.2,0.55]),0,0,0));ffl.add(P(mkS(0.08,m,[0.9,1,0.48]),0.15,-0.01,0.005));ffl.add(P(mkB(0.32,0.032,0.22,finM),0.25,-0.02,0.01));ffl.add(P(mkB(0.4,0.026,0.18,finM),0.55,-0.04,0));ffl.add(P(mkB(0.22,0.02,0.14,finM),0.82,-0.05,-0.005));
    ffl.position.set(0.75,-0.06,0.18);ffl.rotation.z=-0.12;ffl.rotation.y=-0.15;g.add(ffl);
    const ffr=new THREE.Group();ffr.add(P(mkS(0.14,m,[1,1.2,0.55]),0,0,0));ffr.add(P(mkS(0.08,m,[0.9,1,0.48]),-0.15,-0.01,0.005));ffr.add(P(mkB(0.32,0.032,0.22,finM),-0.25,-0.02,0.01));ffr.add(P(mkB(0.4,0.026,0.18,finM),-0.55,-0.04,0));ffr.add(P(mkB(0.22,0.02,0.14,finM),-0.82,-0.05,-0.005));
    ffr.position.set(-0.75,-0.06,0.18);ffr.rotation.z=0.12;ffr.rotation.y=0.15;g.add(ffr);
    // Rear flippers
    const bfl=new THREE.Group();bfl.add(P(mkS(0.09,m,[1,1,0.5]),0,0,0));bfl.add(P(mkS(0.05,m,[0.9,0.9,0.45]),0.08,-0.01,0));bfl.add(P(mkB(0.2,0.025,0.16,finM),0.16,-0.02,0));bfl.add(P(mkB(0.22,0.018,0.14,finM),0.34,-0.03,0));
    bfl.position.set(0.55,-0.06,-0.55);bfl.rotation.z=-0.12;bfl.rotation.y=0.25;g.add(bfl);
    const bfr=new THREE.Group();bfr.add(P(mkS(0.09,m,[1,1,0.5]),0,0,0));bfr.add(P(mkS(0.05,m,[0.9,0.9,0.45]),-0.08,-0.01,0));bfr.add(P(mkB(0.2,0.025,0.16,finM),-0.16,-0.02,0));bfr.add(P(mkB(0.22,0.018,0.14,finM),-0.34,-0.03,0));
    bfr.position.set(-0.55,-0.06,-0.55);bfr.rotation.z=0.12;bfr.rotation.y=-0.25;g.add(bfr);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,-0.03,-0.22],[0,-0.05,-0.45],[0,-0.07,-0.65]],
        [0.16,0.1,0.06],
        [0.09,0.05,0.03],
        m,18,16
    ));
    tail.position.set(0,0,-0.75);g.add(tail);
    g.userData={parts:{head,tail,body:g.children[0]},bipedal:false,labelY:1.6,scale:0.9};
    return g;
}

/* ── 15. AMMONITE ── */
function buildAmmonite(){
    const g=new THREE.Group();
    const shellM=skinMat('#cc4488'),innerShell=skinMat('#ee66aa'),m=skinMat('#bb5599'),dm=skinMat('#aa3377');
    const ew=new THREE.MeshStandardMaterial({color:0xffeebb,roughness:0.2}),ep=new THREE.MeshStandardMaterial({color:0x110808});
    // Spiral shell (body is shellG group)
    const shellG=new THREE.Group();
    for(let i=0;i<24;i++){const a=i*0.38,r=0.04+i*0.018,sz=0.022+i*0.011;const piece=mkS(sz,i%3===0?dm:shellM,[1.1,1,0.35]);piece.position.set(Math.cos(a)*r,Math.sin(a)*r,0);piece.rotation.z=a;shellG.add(piece)}
    g.add(shellG);
    // Aperture and inner whorls
    g.add(P(mkS(0.22,shellM,[1,0.98,0.3]),0,0,0));
    g.add(P(mkS(0.1,innerShell,[1,1,0.28]),0,0.02,0));
    g.add(P(mkS(0.04,innerShell,[1,1,0.22]),0,0.06,0.01));
    // Suture lines
    for(let i=0;i<16;i++){const a=i*Math.PI*2/16,r=0.16;const ridge=mkS(0.012,shellM,[1,1,0.4]);ridge.position.set(Math.cos(a)*r,Math.sin(a)*r,0);g.add(ridge)}
    // Growth ridges
    for(let i=0;i<10;i++){const a=i*Math.PI/5+0.15,r1=0.1,r2=0.22;const ridge=P(mkC(0.005,0.005,0.12,shellM),Math.cos(a)*(r1+r2)/2,Math.sin(a)*(r1+r2)/2,0);ridge.rotation.z=a+Math.PI/2;g.add(ridge)}
    // Keel ridge
    for(let i=0;i<8;i++){const a=i*0.5-0.5,r=0.18+i*0.01;g.add(P(mkS(0.008,dm,[1,0.6,0.8]),Math.cos(a)*r,Math.sin(a)*r,0.04))}
    // Head/body
    const head=new THREE.Group();
    head.add(P(mkS(0.045,m,[1,0.85,0.65]),0,-0.02,0.1));
    head.add(P(mkS(0.03,m,[1.1,0.72,0.58]),0,-0.04,0.15));
    head.add(P(mkS(0.02,dm,[0.9,0.6,0.5]),0,-0.05,0.12));
    // Eyes
    head.add(P(mkS(0.02,ew),0.03,0.015,0.08));head.add(P(mkS(0.012,ep),0.033,0.015,0.09));
    head.add(P(mkS(0.02,ew),-0.03,0.015,0.08));head.add(P(mkS(0.012,ep),-0.033,0.015,0.09));
    // Tentacles
    for(let i=0;i<10;i++){const a=(i/10)*Math.PI-0.5*Math.PI,tx=Math.cos(a)*0.035;const tent=P(mkC(0.004,0.002,0.065+i*0.003,m),tx,-0.04-(i%2)*0.01,0.14+Math.abs(tx)*0.35);tent.rotation.x=-0.3+(i%3)*0.08;tent.rotation.z=tx*2;head.add(tent)}
    // Grasping arms
    const lt=P(mkC(0.005,0.003,0.11,m),0.02,-0.05,0.18);lt.rotation.x=-0.4;head.add(lt);
    head.add(P(mkS(0.003,m,[1,1,0.8]),0.02,-0.065,0.26));
    const rt=P(mkC(0.005,0.003,0.11,m),-0.02,-0.05,0.18);rt.rotation.x=-0.4;head.add(rt);
    head.add(P(mkS(0.003,m,[1,1,0.8]),-0.02,-0.065,0.26));
    // Hood
    head.add(P(mkS(0.035,dm,[1.2,0.5,0.8]),0,0.015,0.06));
    head.position.set(0,-0.04,0.12);g.add(head);
    const tail=new THREE.Group();tail.position.set(0,0,-0.1);g.add(tail);
    g.userData={parts:{head,tail,body:shellG},bipedal:false,labelY:0.6,scale:0.2};
    return g;
}

/* ── 16. LIOPERDON (Mythic Aquatic) ── */
function buildLioperdon(){
    const g=new THREE.Group();
    const m=skinMat('#0d7377'),dm=skinMat('#094a4d'),lm=skinMat('#4eeacc'),
          fin=skinMat('#7c4dff'),accent=skinMat('#00e5ff'),
          ewM=new THREE.MeshBasicMaterial({color:0xff1744}),
          glow=new THREE.MeshBasicMaterial({color:0x00ffd0,transparent:true,opacity:0.6});
    // Body (GROUP, not g.children[0])
    const body=new THREE.Group();
    body.add(loftMesh(
        [[0,0,1.1],[0,0,0],[0,0,-0.8]],
        [0.45,0.7,0.45],
        [0.35,0.49,0.35],
        m,16,8
    ));
    body.add(P(mkS(0.55,lm,[1.1,0.4,1.8]),0,-0.25,0));
    g.add(body);
    // Neck (4 segments)
    const neck=new THREE.Group();
    neck.add(loftMesh(
        [[0,0.1,0.9],[0,0.25,1.5],[0,0.4,2.0],[0,0.55,2.4]],
        [0.3,0.25,0.2,0.18],
        [0.24,0.2,0.16,0.12],
        m,24,16
    ));
    g.add(neck);
    // Head
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.65,2.9],[0,0.58,3.35]],
        [0.22,0.15],
        [0.16,0.1],
        m,12,18
    ));
    // RED eyes
    head.add(P(mkS(0.08,ewM),0.18,0.75,2.95));
    head.add(P(mkS(0.08,ewM),-0.18,0.75,2.95));
    // Crown spines
    for(let i=-1;i<=1;i++){head.add(P(mkC(0.02,0.01,0.2,accent),i*0.08,1.0,2.85))}
    // Teeth
    for(let i=0;i<6;i++){const side=i%2===0?0.06:-0.06;head.add(P(mkCone(0.015,0.06,dm),side,0.48,3.2+i*0.04))}
    g.add(head);
    // Tail (5 segments)
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.85],[0,0,-1.5],[0,0,-2.1],[0,0,-2.6],[0,0,-3.0]],
        [0.5,0.35,0.25,0.15,0.06],
        [0.33,0.2,0.12,0.06,0.03],
        m,30,16
    ));
    // Tail fin (mythic purple)
    tail.add(P(mkS(0.2,fin,[2.5,1.5,0.2]),0,0,-3.0));
    g.add(tail);
    // Flippers (positioned meshes, not groups)
    const flipFL=P(mkS(0.15,fin,[2.8,0.15,1.2]),0.7,-0.15,0.3);flipFL.rotation.z=-0.25;g.add(flipFL);
    const flipFR=P(mkS(0.15,fin,[2.8,0.15,1.2]),-0.7,-0.15,0.3);flipFR.rotation.z=0.25;g.add(flipFR);
    const flipBL=P(mkS(0.12,fin,[2.2,0.12,1.0]),0.6,-0.15,-0.6);flipBL.rotation.z=-0.2;g.add(flipBL);
    const flipBR=P(mkS(0.12,fin,[2.2,0.12,1.0]),-0.6,-0.15,-0.6);flipBR.rotation.z=0.2;g.add(flipBR);
    // Dorsal ridge (bioluminescent)
    for(let i=0;i<8;i++){g.add(P(mkC(0.015,0.008,0.12,glow),0,0.4-i*0.01,-0.3*i+0.6))}
    // Bioluminescent spots
    const spots=[[0.35,0.1,0.5],[-0.35,0.1,0.5],[0.35,0.1,-0.3],[-0.35,0.1,-0.3],[0.2,0.2,1.2],[-0.2,0.2,1.2],[0.25,0,-1.2],[-0.25,0,-1.2]];
    spots.forEach(([sx,sy,sz])=>{const s=P(mkS(0.04,glow),sx,sy,sz);s.userData.isSpot=true;g.add(s)});
    // Mythic aura
    const aura=P(mkS(2.5,new THREE.MeshBasicMaterial({color:0x00ffd0,transparent:true,opacity:0.08})),0,0,0);
    g.add(aura);
    g.userData={parts:{head,tail,body,neck,legFL:flipFL,legFR:flipFR,legBL:flipBL,legBR:flipBR},bipedal:false,labelY:2.5,scale:1.8};
    return g;
}

/* ── 17. HATZEGOPTERYX (Mythic Pterosaur) ── */
function buildHatzegopteryx(){
    const g=new THREE.Group();
    const m=skinMat('#2e1065'),dm=skinMat('#1a0a3a'),lm=skinMat('#4a2090'),
          wingM=new THREE.MeshStandardMaterial({color:new THREE.Color('#4a148c'),roughness:0.55,transparent:true,opacity:0.8,side:THREE.DoubleSide}),
          edge=new THREE.MeshBasicMaterial({color:0xffab00}),
          beakM=skinMat('#37474f'),eyeM=new THREE.MeshBasicMaterial({color:0xffd600}),
          crestM=skinMat('#ff6d00'),talon=skinMat('#212121'),
          auraM=new THREE.MeshBasicMaterial({color:0x7c4dff,transparent:true,opacity:0.1});
    // Body (GROUP)
    const body=new THREE.Group();
    body.add(loftMesh(
        [[0,0,0.9],[0,0,0],[0,0,-0.6]],
        [0.3,0.45,0.3],
        [0.2,0.34,0.2],
        m,16,8
    ));
    body.add(P(mkS(0.35,lm,[1,0.5,1.4]),0,-0.15,0));
    g.add(body);
    // Neck (2 segments)
    const neck=new THREE.Group();
    neck.add(loftMesh(
        [[0,0.15,0.7],[0,0.3,1.1]],
        [0.2,0.18],
        [0.14,0.12],
        m,12,16
    ));
    g.add(neck);
    // Head (massive skull)
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.4,1.55],[0,0.3,2.2],[0,0.28,2.6]],
        [0.25,0.12,0.04],
        [0.2,0.1,0.04],
        m,18,18
    ));
    head.add(P(mkCone(0.04,0.15,beakM),0,0.28,2.6));
    // Eyes (glowing yellow)
    head.add(P(mkS(0.07,eyeM),0.2,0.52,1.6));
    head.add(P(mkS(0.07,eyeM),-0.2,0.52,1.6));
    // Crest (tall, swept back)
    head.add(P(mkS(0.1,crestM,[0.3,2.5,1.5]),0,0.75,1.3));
    head.add(P(mkS(0.04,edge,[0.35,0.15,1.6]),0,0.95,1.25));
    g.add(head);
    // Wings
    const wingL=new THREE.Group();wingL.position.set(0.35,0.05,0);
    wingL.add(P(mkS(0.08,wingM,[5,0.08,2]),1.2,0,0.1));
    wingL.add(P(mkS(0.06,wingM,[3.5,0.06,1.4]),2.5,0,0.15));
    wingL.add(P(mkS(0.04,wingM,[2,0.04,0.8]),3.3,0,0.2));
    wingL.add(P(mkC(0.02,0.02,5,edge),1.5,0.04,0.7));
    g.add(wingL);
    const wingR=new THREE.Group();wingR.position.set(-0.35,0.05,0);
    wingR.add(P(mkS(0.08,wingM,[5,0.08,2]),-1.2,0,0.1));
    wingR.add(P(mkS(0.06,wingM,[3.5,0.06,1.4]),-2.5,0,0.15));
    wingR.add(P(mkS(0.04,wingM,[2,0.04,0.8]),-3.3,0,0.2));
    wingR.add(P(mkC(0.02,0.02,5,edge),-1.5,0.04,0.7));
    g.add(wingR);
    // Tail
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.8],[0,0,-1.3]],
        [0.18,0.1],
        [0.1,0.05],
        m,12,16
    ));
    tail.add(P(mkS(0.1,crestM,[0.4,0.35,0.6]),0,0,-1.3));
    g.add(tail);
    // Legs/Talons
    const legL=new THREE.Group();legL.position.set(0.15,-0.3,-0.15);
    legL.add(P(mkC(0.035,0.025,0.35,talon),0,-0.17,0));
    legL.add(P(mkCone(0.02,0.1,talon),0.04,-0.4,0.04));
    legL.add(P(mkCone(0.02,0.1,talon),-0.04,-0.4,0.04));
    legL.add(P(mkCone(0.02,0.1,talon),0,-0.4,-0.04));
    g.add(legL);
    const legR=new THREE.Group();legR.position.set(-0.15,-0.3,-0.15);
    legR.add(P(mkC(0.035,0.025,0.35,talon),0,-0.17,0));
    legR.add(P(mkCone(0.02,0.1,talon),0.04,-0.4,0.04));
    legR.add(P(mkCone(0.02,0.1,talon),-0.04,-0.4,0.04));
    legR.add(P(mkCone(0.02,0.1,talon),0,-0.4,-0.04));
    g.add(legR);
    // Mythic aura
    g.add(P(mkS(3,auraM),0,0,0));
    // Glow spots on wings
    [[1.5,0.06,0],[-1.5,0.06,0],[2.8,0.05,0],[-2.8,0.05,0]].forEach(([sx,sy,sz])=>{
        const s=P(mkS(0.05,new THREE.MeshBasicMaterial({color:0xffab00,transparent:true,opacity:0.7})),sx,sy,sz);
        s.userData.isGlowSpot=true;g.add(s)});
    g.userData={parts:{head,tail,body,neck,wingL,wingR,legL,legR},bipedal:false,labelY:3,scale:2.2};
    return g;
}

/* ── 18. SPINOSAURUS (Mythic) ── */
function buildSpinosaurus(){
    const g=new THREE.Group();
    const m=skinMat('#8b4513'),dm=skinMat('#5a2d0c'),lm=skinMat('#c47a40'),
          sailM=skinMat('#ff6d00'),sailDark=skinMat('#cc5500'),
          teethM=skinMat('#f5f0e0'),ewM=new THREE.MeshStandardMaterial({color:0xffd600,roughness:0.2}),
          epM=new THREE.MeshStandardMaterial({color:0x110808}),clw=skinMat('#333333');
    // Body (GROUP)
    const body=new THREE.Group();
    body.add(loftMesh(
        [[0,0.15,0.5],[0,0,0],[0,0.1,-0.4]],
        [0.55,0.8,0.55],
        [0.5,0.68,0.55],
        m,16,8
    ));
    body.add(P(mkS(0.65,lm,[1,0.55,1.6]),0,-0.3,0));
    // Shoulder/hip muscles
    body.add(P(mkS(0.35,m,[1.2,1,0.8]),0.1,0.15,0.5));
    body.add(P(mkS(0.4,m,[1.1,1.1,0.9]),0,0.1,-0.4));
    g.add(body);
    // Sail
    const sailG=new THREE.Group();
    const sailHeights=[0.4,0.6,0.85,1.1,1.3,1.4,1.35,1.2,1.0,0.7,0.45,0.25];
    for(let i=0;i<sailHeights.length;i++){
        const h=sailHeights[i],z=0.6-i*0.18;
        sailG.add(P(mkC(0.015,0.01,h,dm),0,0.35+h/2,z));
        sailG.add(P(mkB(0.02,h*0.85,0.12,i%2===0?sailM:sailDark),0,0.35+h*0.42,z));
    }
    g.add(sailG);
    // Neck (3 segments)
    const neck=new THREE.Group();
    neck.add(loftMesh(
        [[0,0.1,1.0],[0,0.15,1.55],[0,0.2,2.0]],
        [0.3,0.25,0.22],
        [0.23,0.18,0.15],
        m,18,16
    ));
    g.add(neck);
    // Head (crocodile-like)
    const head=new THREE.Group();
    head.add(loftMesh(
        [[0,0.25,2.5],[0,0.18,3.2],[0,0.15,3.75]],
        [0.22,0.12,0.08],
        [0.17,0.08,0.05],
        m,18,18
    ));
    // Nostril bumps
    head.add(P(mkS(0.04,dm),0.06,0.32,2.65));head.add(P(mkS(0.04,dm),-0.06,0.32,2.65));
    // Eyes
    head.add(P(mkS(0.06,ewM),0.16,0.33,2.55));head.add(P(mkS(0.035,epM),0.17,0.34,2.58));
    head.add(P(mkS(0.06,ewM),-0.16,0.33,2.55));head.add(P(mkS(0.035,epM),-0.17,0.34,2.58));
    // Teeth (conical, interlocking)
    for(let i=0;i<10;i++){
        const z=2.7+i*0.12,side=i%2===0?0.08:-0.08;
        head.add(P(mkCone(0.012,0.06,teethM),side,0.1,z));
    }
    // Small crest
    head.add(P(mkS(0.08,sailM,[1,1.2,0.8]),0,0.42,2.4));
    g.add(head);
    // Tail (5 segments + paddle fin)
    const tail=new THREE.Group();
    tail.add(loftMesh(
        [[0,0,-0.85],[0,-0.05,-1.5],[0,-0.08,-2.1],[0,-0.1,-2.6],[0,-0.1,-3.0]],
        [0.5,0.38,0.28,0.2,0.12],
        [0.33,0.22,0.16,0.1,0.06],
        m,30,16
    ));
    // Paddle fin
    tail.add(P(mkS(0.15,sailM,[1.8,2,0.15]),0,-0.05,-3.35));
    g.add(tail);
    // Arms
    const armL=new THREE.Group();armL.position.set(0.45,-0.1,0.5);
    armL.add(P(mkC(0.06,0.045,0.25,m),0,-0.12,0));
    armL.add(P(mkC(0.045,0.03,0.2,m),0,-0.3,0.05));
    armL.add(P(mkCone(0.015,0.08,clw),0.02,-0.42,0.06));
    armL.add(P(mkCone(0.015,0.08,clw),-0.02,-0.42,0.08));
    armL.add(P(mkCone(0.015,0.08,clw),0,-0.42,0.1));
    g.add(armL);
    const armR=new THREE.Group();armR.position.set(-0.45,-0.1,0.5);
    armR.add(P(mkC(0.06,0.045,0.25,m),0,-0.12,0));
    armR.add(P(mkC(0.045,0.03,0.2,m),0,-0.3,0.05));
    armR.add(P(mkCone(0.015,0.08,clw),0.02,-0.42,0.06));
    armR.add(P(mkCone(0.015,0.08,clw),-0.02,-0.42,0.08));
    armR.add(P(mkCone(0.015,0.08,clw),0,-0.42,0.1));
    g.add(armR);
    // Legs
    const legL=new THREE.Group();legL.position.set(0.35,-0.3,-0.35);
    legL.add(P(mkS(0.12,m,[0.8,1.6,0.8]),0,0,0));
    legL.add(P(mkC(0.06,0.045,0.45,m),0,-0.35,0));
    legL.add(P(mkS(0.06,dm,[1.2,0.4,1.6]),0,-0.6,0.05));
    for(let t=0;t<3;t++)legL.add(P(mkCone(0.015,0.1,clw),(t-1)*0.04,-0.65,0.12));
    g.add(legL);
    const legR=new THREE.Group();legR.position.set(-0.35,-0.3,-0.35);
    legR.add(P(mkS(0.12,m,[0.8,1.6,0.8]),0,0,0));
    legR.add(P(mkC(0.06,0.045,0.45,m),0,-0.35,0));
    legR.add(P(mkS(0.06,dm,[1.2,0.4,1.6]),0,-0.6,0.05));
    for(let t=0;t<3;t++)legR.add(P(mkCone(0.015,0.1,clw),(t-1)*0.04,-0.65,0.12));
    g.add(legR);
    // Glow on sail tips
    for(let i=2;i<9;i++){
        const h=sailHeights[i],z=0.6-i*0.18;
        g.add(P(mkS(0.025,new THREE.MeshBasicMaterial({color:0xff6d00,transparent:true,opacity:0.5})),0,0.35+h+0.05,z));
    }
    g.userData={parts:{head,tail,body,neck,legL,legR,armL,armR,sail:sailG},bipedal:true,labelY:3.5,scale:2.0};
    return g;
}

/* ── BUILDERS MAP ── */
const BUILDERS={brachiosaurus:buildBrachiosaurus,stegosaurus:buildStegosaurus,diplodocus:buildDiplodocus,compsognathus:buildCompsognathus,archaeopteryx:buildArchaeopteryx,allosaurus:buildAllosaurus,ceratosaurus:buildCeratosaurus,triceratops:buildTriceratops,velociraptor:buildVelociraptor,parasaurolophus:buildParasaurolophus,mosasaurus:buildMosasaurus,plesiosaurus:buildPlesiosaurus,ichthyosaurus:buildIchthyosaurus,archelon:buildArchelon,ammonite:buildAmmonite,lioperdon:buildLioperdon,hatzegopteryx:buildHatzegopteryx,spinosaurus:buildSpinosaurus};
