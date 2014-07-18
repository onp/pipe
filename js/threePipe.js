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

function updateCoords(vec){
    document.getElementById("z-pos").value = vec.z.toFixed(3)
    document.getElementById("x-pos").value = vec.x.toFixed(3)
    document.getElementById("y-pos").value = vec.y.toFixed(3)
}

function updateDelta(vec){
    document.getElementById("z-delta").value = vec.z.toFixed(3)
    document.getElementById("x-delta").value = vec.x.toFixed(3)
    document.getElementById("y-delta").value = vec.y.toFixed(3)
}


var mouseState = {x:0,y:0,right:false,left:false}

document.addEventListener('mousemove',function(e){
    var cp = getCursorPosition(e)
    mouseState.x = cp[0];
    mouseState.ndcX = 2*((cp[0] - renderer.domElement.offsetLeft)/canvasSize[0]) - 1
    mouseState.y = cp[1];
    mouseState.ndcY = 1 - 2*((cp[1] - renderer.domElement.offsetTop)/canvasSize[1]);
},false)



var canvasSize,aspectRatio;

var orthoWidth = 20;

var orthoCamera = new THREE.OrthographicCamera(1,1,1,1,0.1,1000);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff,1);

var deltaBox = document.getElementById("delta-box")

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



window.addEventListener('resize', onResize, false);

var scene = new THREE.Scene();

document.body.appendChild(renderer.domElement);


var sGeom = new THREE.SphereGeometry(0.1)
var sMat = new THREE.MeshLambertMaterial({color:0xff0000})

var cGeom = new THREE.CylinderGeometry(0.1,0.1,1)
var cTrans = new THREE.Matrix4()
cGeom.applyMatrix(cTrans.makeTranslation(0,0.5,0))
cGeom.applyMatrix(cTrans.makeRotationX(Math.PI/2))
var cMat = new THREE.MeshLambertMaterial({color:0x00ff00})

var axisHelper = new THREE.AxisHelper(3);
scene.add(axisHelper);

var light = new THREE.PointLight(0xffffff);
light.position.set(200, 0, 200);
scene.add(light);

var light2 = new THREE.PointLight(0x404040);
light2.position.set(-200, 0, -200);
scene.add(light2);

orthoCamera.position.set(200,200,200);
orthoCamera.up = new THREE.Vector3(0,0,1);
orthoCamera.lookAt(new THREE.Vector3(0,0,0));

var controls = new THREE.OrbitControls(orthoCamera, renderer.domElement);

function render(){
    requestAnimationFrame(render);
    
    cursorNode.callFrame(mouseState)
    
    renderer.render(scene,orthoCamera);

}




document.addEventListener("wheel",function(e){
    if ((e.wheelDeltaY>0) || (e.deltaY<0)){
        orthoWidth *= 1.25;
    }else{
        orthoWidth *= 0.8;
    }
    onResize();

},false)

var cursorNode = {}

cursorNode.callClick = function(e){
    cursorNode.onClick(e)
}

cursorNode.callFrame = function(e){
    cursorNode.onFrame(e)
}

cursorNode.callKeyDown = function(e){
    cursorNode.onKeyDown(e)
}

cursorNode.createModeOnClick = function(e){
   var newNode = new THREE.Mesh(sGeom,sMat)
   newNode.position.copy(cursorNode.cursorBall.position)
   scene.add(newNode)
   
   cursorNode.drawMode()
}

cursorNode.createModeOnFrame = function(e){
    
    var mouseVector = new THREE.Vector3(mouseState.ndcX,mouseState.ndcY,0)
    var projector = new THREE.Projector();
    var raycaster = projector.pickingRay(mouseVector.clone(),orthoCamera)
    
    var iPlane = new THREE.Plane(new THREE.Vector3(0,0,1),0)
    
    var iPoint = raycaster.ray.intersectPlane(iPlane)
    
    cursorNode.cursorBall.position.copy(iPoint)
    
    updateCoords(iPoint)
}

cursorNode.createModeOnKeyDown = function(e){
    return
}

cursorNode.createMode = function(){
    cursorNode.onClick = cursorNode.createModeOnClick
    cursorNode.onFrame = cursorNode.createModeOnFrame
    cursorNode.onKeyDown = cursorNode.createModeOnKeyDown
    
    deltaBox.style.display = "none"
    
    cursorNode.cursorBall =  new THREE.Mesh(sGeom,sMat)
    scene.add(cursorNode.cursorBall)
}


cursorNode.drawModeOnClick = function(e){
    var newNode = new THREE.Mesh(sGeom,sMat)
    newNode.position.copy(cursorNode.cursorBall.position)
    scene.add(newNode)
    
    cursorNode.drawMode()
}



cursorNode.drawModeOnFrame = function(e){
    
    var mouseVector = new THREE.Vector3(mouseState.ndcX,mouseState.ndcY,0)
    var projector = new THREE.Projector();
    var raycaster = projector.pickingRay(mouseVector.clone(),orthoCamera)
    
    var x0 = new THREE.Vector3(-500,0,0).add(cursorNode.basisPoint)
	var x1 = new THREE.Vector3(500,0,0).add(cursorNode.basisPoint)
	var xPt = new THREE.Vector3()
	var xd = raycaster.ray.distanceSqToSegment(x0,x1,null,xPt)
	
	var y0 = new THREE.Vector3(0,-500,0).add(cursorNode.basisPoint)
	var y1 = new THREE.Vector3(0,500,0).add(cursorNode.basisPoint)
	var yPt = new THREE.Vector3()
	var yd = raycaster.ray.distanceSqToSegment(y0,y1,null,yPt)
	
	var z0 = new THREE.Vector3(0,0,-500).add(cursorNode.basisPoint)
	var z1 = new THREE.Vector3(0,0,500).add(cursorNode.basisPoint)
	var zPt = new THREE.Vector3()
	var zd = raycaster.ray.distanceSqToSegment(z0,z1,null,zPt)
	
	var pt = (xd < yd) ? ((xd < zd)? xPt : zPt) : ((yd < zd) ? yPt : zPt)
    

    cursorNode.cursorBall.position.copy(pt)

    cursorNode.cylinder.scale.set(1,1,pt.clone().sub(cursorNode.basisPoint).length())
    cursorNode.cylinder.lookAt(pt)
    
    updateCoords(pt)
    updateDelta(pt.clone().sub(cursorNode.basisPoint))
    
}

cursorNode.drawModeOnKeyDown = function(e){
    if (e.keyCode ==27){
        scene.remove(cursorNode.cursorBall)
        scene.remove(cursorNode.cylinder)
        cursorNode.createMode()
    }
}

cursorNode.drawMode = function(){
    cursorNode.cylinder = new THREE.Mesh(cGeom,cMat)
    cursorNode.cylinder.position.copy(cursorNode.cursorBall.position)
    scene.add(cursorNode.cylinder)
    
    cursorNode.basisPoint = cursorNode.cursorBall.position.clone()
    
    deltaBox.style.display = "block"
    
    cursorNode.onClick = cursorNode.drawModeOnClick
    cursorNode.onFrame = cursorNode.drawModeOnFrame
    cursorNode.onKeyDown = cursorNode.drawModeOnKeyDown
}



onResize()

cursorNode.createMode()

document.addEventListener("click",cursorNode.callClick,false)

document.addEventListener("keydown",cursorNode.callKeyDown,false)

renderer.render(scene,orthoCamera);

render()
    
    