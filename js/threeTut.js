function getCursorPosition(e) {
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return [x,y]
}






var canvasSize,aspectRatio;

var orthoWidth = 20;

var orthoCamera = new THREE.OrthographicCamera(1,1,1,1,0.1,1000);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff,1);

function onResize(){
    canvasSize = [window.innerWidth-3,window.innerHeight-3]
    aspectRatio = canvasSize[0]/canvasSize[1];
    orthoCamera.left = orthoWidth/-2;
    orthoCamera.right = orthoWidth/2;
    orthoCamera.top = orthoWidth/(2*aspectRatio)
    orthoCamera.bottom = orthoWidth/(-2*aspectRatio)
    orthoCamera.updateProjectionMatrix()
    
    renderer.setSize(canvasSize[0], canvasSize[1]);

}

onResize()

window.addEventListener('resize', onResize, false);

var scene = new THREE.Scene();

document.body.appendChild(renderer.domElement);

var pGeometry = new THREE.PlaneGeometry(20,20,20,20)
var pMaterial = new THREE.MeshBasicMaterial({color:0xa0a0a0,wireframe:true});
var plane = new THREE.Mesh(pGeometry,pMaterial);
scene.add(plane);

var sGeom = new THREE.SphereGeometry(0.1)
var sMat = new THREE.MeshBasicMaterial({color:0xff0000})

var axisHelper = new THREE.AxisHelper(3);
scene.add(axisHelper);

orthoCamera.position.set(200,200,200);
orthoCamera.up = new THREE.Vector3(0,0,1);
orthoCamera.lookAt(new THREE.Vector3(0,0,0));

function render(){
    requestAnimationFrame(render);
    //cube.rotation.x += 0.1;
    //cFrame.rotation.x += 0.1;
    renderer.render(scene,orthoCamera);
}

render()


document.addEventListener("wheel",function(e){
    if (e.wheelDeltaY>0){
        orthoWidth *= 1.25;
    }else{
        orthoWidth *= 0.8;
    }
    onResize();

},false)





var node = {}

node.newNode = function(e){
    var canvasCoords = getCursorPosition(e);
    //correct for canvas position:
    canvasCoords[0] = 2*((canvasCoords[0] - renderer.domElement.offsetLeft)/canvasSize[0]) - 1;
    canvasCoords[1] = 1 - 2*((canvasCoords[1] - renderer.domElement.offsetTop)/canvasSize[1]);
    
    var mouseVector = new THREE.Vector3(canvasCoords[0],canvasCoords[1],0)
    
    var projector = new THREE.Projector();
    var raycaster = projector.pickingRay(mouseVector.clone(),orthoCamera)
    
    var iPoint = raycaster.intersectObject(plane)[0].point
    
    var nodeMesh = new THREE.Mesh(sGeom,sMat)
    nodeMesh.position=iPoint
    scene.add(nodeMesh)
    console.log('added')
    console.log(iPoint)
    
}

document.addEventListener("click",node.newNode,false)
    
    