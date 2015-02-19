window.onload = function () {

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

var xposElem = document.getElementById("x-pos");
var xboxElem = document.getElementById("x-box");
var yposElem = document.getElementById("y-pos");
var yboxElem = document.getElementById("y-box");
var zposElem = document.getElementById("z-pos");
var zboxElem = document.getElementById("z-box");
var xdElem = document.getElementById("x-delta");
var xdboxElem = document.getElementById("xd-box");
var ydElem = document.getElementById("y-delta");
var ydboxElem = document.getElementById("yd-box");
var zdElem = document.getElementById("z-delta");
var zdboxElem = document.getElementById("zd-box");
var lElem = document.getElementById("l-delta");
var lboxElem = document.getElementById("l-box");

var positionSpecs = {};

var addInputListener = function (elem, spec, d) {
    if (d) {
    
        elem.addEventListener("input",
            function (e) {
                positionSpecs[spec] = parseLength(elem.value)
            },
            false
        )
        
    } else {
    
        elem.addEventListener("input",
            function (e) {
                positionSpecs[spec] = parseLength(elem.value)
            },
            false
        )
        
    }
}

addInputListener(xposElem, "x")
addInputListener(yposElem, "y")
addInputListener(zposElem, "z")
addInputListener(xdElem, "x", true)
addInputListener(ydElem, "y", true)
addInputListener(zdElem, "z", true)
addInputListener(lElem, "l")


function updateCoords(vec,dVec){
    // Takes a position vector as input, and pushes it to the display box.
    
    xposElem.value = vec.x.toFixed(3)
    yposElem.value = vec.y.toFixed(3)
    zposElem.value = vec.z.toFixed(3)
    
    if (dVec !== undefined) { 
        xdElem.value = dVec.x.toFixed(3)
        ydElem.value = dVec.y.toFixed(3)
        zdElem.value = dVec.z.toFixed(3)
        lElem.value = dVec.length().toFixed(3)
    }
    
    if (positionSpecs.x !== undefined){
        xboxElem.classList.add("active")
    };
    
    if (positionSpecs.y !== undefined){
        document.getElementById("y-box").classList.add("active")
    };
    
    if (positionSpecs.z !== undefined){
        document.getElementById("z-box").classList.add("active")
    };
}

function clearSpecs(z) {
    positionSpecs.x  = undefined;
    positionSpecs.y  = undefined;
    positionSpecs.z  = undefined;
    positionSpecs.l = undefined;
    
    xboxElem.classList.remove("active")
    yboxElem.classList.remove("active")
    zboxElem.classList.remove("active")
    xdboxElem.classList.remove("active")
    ydboxElem.classList.remove("active")
    zdboxElem.classList.remove("active")
    lboxElem.classList.remove("active")
};
        


    


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

PIPER.pipes = []
var visiblePipes = new THREE.Object3D();
scene.add( visiblePipes );

PIPER.nodes = {}
var visibleNodes = new THREE.Object3D();
scene.add( visibleNodes );

document.body.appendChild(renderer.domElement);

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

var cursorNode;
var cursorSegment;




// Define "Create Mode" behaviour.
(function (createMode,undefined) {
    createMode.enter = function(){
        mode = createMode
        
        clearSpecs()
        positionSpecs.z = 0
        
        deltaBox.style.display = "none"
        cursorNode =  new PIPER.Node(new THREE.Vector3())
        scene.add(cursorNode.makeMesh())
    };
    
    createMode.leave = function () {
        mode = undefined
        scene.remove(cursorNode.mesh)
    }
    
    createMode.suspend = function () {
        scene.remove(cursorNode.mesh)
    }
    
    createMode.resume = function () {
        scene.add(cursorNode.mesh)
    }
    
    createMode.onClick = function (e) {
    
        if (createMode.underMouse !== null){
        
            console.log(createMode.underMouse);
            
        } else {
    
            var newNode = new PIPER.Node(cursorNode.mesh.position.clone());

            PIPER.nodes[newNode.uuid] = newNode;
            
            visibleNodes.add(newNode.makeMesh());
           
            drawMode.enter(newNode);
            
        }
    }

    createMode.onFrame = function (e) {
        
        var mouseVector = new THREE.Vector3(mouseState.ndcX,mouseState.ndcY,0)
        var projector = new THREE.Projector();
        var raycaster = projector.pickingRay(mouseVector.clone(),orthoCamera)
        
        var iPoint = PIPER.Calc.constrainedPoint(raycaster,positionSpecs)
        
        var intersects = raycaster.intersectObjects(visiblePipes.children);
        
        visiblePipes.children.forEach(
            function ( pipe ) {
                pipe.material.color.setHex(0x00ff00);
            }
        )
        
        if (intersects.length > 0){
            intersects[0].object.material.color.setHex(0x0000ff);
            createMode.underMouse = intersects[0].object.userData.owner
            
        } else {
            createMode.underMouse = null;
        };
        
        cursorNode.mesh.position.copy(iPoint)
        
        updateCoords(iPoint)
    };

    createMode.onKeyDown = function (e) {
        return
    };
}(window.createMode = {} ));

// Define "draw mode" behaviour.
(function (drawMode, undefined) {

    var sourceNode // basisPoint

    drawMode.enter = function(currNode){
        clearSpecs()
    
        mode = drawMode
        
        sourceNode = currNode
        
        cursorSegment = new PIPER.Segment(sourceNode)
        scene.add(cursorSegment.makeMesh())
        
        deltaBox.style.display = "block"
    }
    
    drawMode.suspend = function (){
         scene.remove(cursorSegment.mesh)
         scene.remove(cursorNode.mesh)
    }
    
    drawMode.resume = function () {
         scene.add(cursorSegment.mesh)
         scene.add(cursorNode.mesh)
    }

    drawMode.onClick = function (e) {
    
        var newNode = new PIPER.Node(cursorNode.mesh.position.clone())

        PIPER.nodes[newNode.uuid] = newNode
        
        visibleNodes.add(newNode.makeMesh())

        scene.remove(cursorSegment.mesh)
        
        newPipe = new PIPER.Segment(sourceNode,newNode)
        PIPER.pipes.push(newPipe)
        
        visiblePipes.add(newPipe.makeMesh())
        
        drawMode.enter(newNode)
    }
    
    drawMode.onFrame = function (e) {
        
        var mouseVector = new THREE.Vector3(mouseState.ndcX,mouseState.ndcY,0)
        var projector = new THREE.Projector();
        var raycaster = projector.pickingRay(mouseVector.clone(),orthoCamera)
        
        var pt = PIPER.Calc.constrainedPoint(raycaster,positionSpecs,sourceNode.mesh.position)

        cursorNode.mesh.position.copy(pt)

        cursorSegment.mesh.scale.set(1,1,pt.clone().sub(sourceNode.position).length())
        cursorSegment.mesh.lookAt(pt)
        
        updateCoords(pt,pt.clone().sub(sourceNode.position))
    }
    
    drawMode.onKeyDown = function(e){
        if (e.keyCode ==27){
            scene.remove(cursorNode.mesh)
            scene.remove(cursorSegment.mesh)
            
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

document.getElementById("menu-box").addEventListener("click",function(e){e.stopPropagation()})

document.addEventListener("keydown",keyDownHandle,false)

document.addEventListener("keyup",keyUpHandle,false)

renderer.render(scene,orthoCamera);

render()
    
}