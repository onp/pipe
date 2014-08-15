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

var mode,previousMode

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

var renderer

if (window.WebGLRenderingContext){
	renderer = new THREE.WebGLRenderer();
}else{
	renderer = new THREE.CanvasRenderer();
}

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

var pipes = new THREE.Object3D();
scene.add( pipes );

var nodes = new THREE.Object3D();
scene.add( nodes );

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
controls.enabled = false;

function render(){

    requestAnimationFrame(render);
    
    mode.onFrame(mouseState)
    
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

var cursorNode = {};



// Define "Create Mode" behaviour.
(function (createMode,undefined) {
    createMode.enter = function(){
        mode = createMode
        
        deltaBox.style.display = "none"
        cursorNode.cursorBall =  new THREE.Mesh(sGeom,sMat)
        scene.add(cursorNode.cursorBall)
    };
    
    createMode.leave = function () {
        mode = undefined
        scene.remove(cursorNode.cursorBall)
    }
    
    createMode.suspend = function () {
        scene.remove(cursorNode.cursorBall)
    }
    
    createMode.resume = function () {
        scene.add(cursorNode.cursorBall)
    }
    
    createMode.onClick = function (e) {
        var newNode = new THREE.Mesh(sGeom,sMat)
        newNode.position.copy(cursorNode.cursorBall.position)
        nodes.add(newNode)
       
        drawMode.enter()
    }

    createMode.onFrame = function (e) {
        
        var mouseVector = new THREE.Vector3(mouseState.ndcX,mouseState.ndcY,0)
        var projector = new THREE.Projector();
        var raycaster = projector.pickingRay(mouseVector.clone(),orthoCamera)
        
        var iPlane = new THREE.Plane(new THREE.Vector3(0,0,1),0)
        
        var iPoint = raycaster.ray.intersectPlane(iPlane)
        
        var intersects = raycaster.intersectObjects(pipes.children);
        
        pipes.children.forEach(
            function ( pipe ) {
                pipe.material.color.setHex(0x00ff00);
            }
        )
        
        if (intersects.length > 0){
            intersects[0].object.material.color.setHex(0x0000ff);
        };
        
        cursorNode.cursorBall.position.copy(iPoint)
        
        updateCoords(iPoint)
    };

    createMode.onKeyDown = function (e) {
        return
    };
}(window.createMode = {} ));

// Define "draw mode" behaviour.
(function (drawMode, undefined) {

    var basisPoint

    drawMode.enter = function(){
        mode = drawMode
        
        cursorNode.cylinder = new THREE.Mesh(cGeom,cMat.clone())
        cursorNode.cylinder.position.copy(cursorNode.cursorBall.position)
        pipes.add(cursorNode.cylinder)
        
        basisPoint = cursorNode.cursorBall.position.clone()
        
        deltaBox.style.display = "block"
    }
    
    drawMode.suspend = function (){
         pipes.remove(cursorNode.cylinder)
         scene.remove(cursorNode.cursorBall)
    }
    
    drawMode.resume = function () {
         pipes.add(cursorNode.cylinder)
         scene.add(cursorNode.cursorBall)
    }

    drawMode.onClick = function (e) {
        var newNode = new THREE.Mesh(sGeom, sMat)
        newNode.position.copy(cursorNode.cursorBall.position)
        nodes.add(newNode)
        
        drawMode.enter()
    }
    
    drawMode.onFrame = function (e) {
        
        var mouseVector = new THREE.Vector3(mouseState.ndcX,mouseState.ndcY,0)
        var projector = new THREE.Projector();
        var raycaster = projector.pickingRay(mouseVector.clone(),orthoCamera)
        
        var x0 = new THREE.Vector3(-500,0,0).add(basisPoint)
        var x1 = new THREE.Vector3(500,0,0).add(basisPoint)
        var xPt = new THREE.Vector3()
        var xd = raycaster.ray.distanceSqToSegment(x0,x1,null,xPt)
        
        var y0 = new THREE.Vector3(0,-500,0).add(basisPoint)
        var y1 = new THREE.Vector3(0,500,0).add(basisPoint)
        var yPt = new THREE.Vector3()
        var yd = raycaster.ray.distanceSqToSegment(y0,y1,null,yPt)
        
        var z0 = new THREE.Vector3(0,0,-500).add(basisPoint)
        var z1 = new THREE.Vector3(0,0,500).add(basisPoint)
        var zPt = new THREE.Vector3()
        var zd = raycaster.ray.distanceSqToSegment(z0,z1,null,zPt)
        
        var pt = (xd < yd) ? ((xd < zd)? xPt : zPt) : ((yd < zd) ? yPt : zPt)
        

        cursorNode.cursorBall.position.copy(pt)

        cursorNode.cylinder.scale.set(1,1,pt.clone().sub(basisPoint).length())
        cursorNode.cylinder.lookAt(pt)
        
        updateCoords(pt)
        updateDelta(pt.clone().sub(basisPoint))
    }
    
    drawMode.onKeyDown = function(e){
        if (e.keyCode ==27){
            scene.remove(cursorNode.cursorBall)
            pipes.remove(cursorNode.cylinder)
            
            createMode.enter()
            
        }
    }
    
    
}(window.drawMode = {}));


//define view mode behaviour
(function (viewMode,undefined) {
    viewMode.enter = function(){
        controls.enabled = true;
    };
    
    viewMode.leave = function(){
        controls.enabled = false;
    };
    
    viewMode.onClick = function(){}
    
    viewMode.onKeydown = function(){}
    
    viewMode.onFrame = function(){}


}(window.viewMode = {}));



onResize()



createMode.enter()

var clickHandle = function(e){
    if (!e.ctrlKey){
        mode.onClick(e);
    }
}

var keyDownHandle = function(e){
    if (e.keyCode==17){
        previousMode = mode
        mode.suspend()
        viewMode.enter()
        return
    }
    mode.onKeyDown(e)
}

var keyUpHandle = function(e){
    if (e.keyCode==17){
        viewMode.leave()
        previousMode.resume()
        previousMode = undefined;
        return
    }
}


document.addEventListener("click",clickHandle,false)

document.addEventListener("keydown",keyDownHandle,false)

document.addEventListener("keyup",keyUpHandle,false)

renderer.render(scene,orthoCamera);

render()
    
    