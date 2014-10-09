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

function parseLength (l) {
    if (Number(l) !== NaN) {
        return Number(l)
    }
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
var ldElem = document.getElementById("l-delta");
var ldboxElem = document.getElementById("ld-box");

xposElem.addEventListener("input", 
    function(e){
        positionSpecs.x = parseLength(xposElem.value)
        xboxElem.classList.add("active")
    },
    false
);

yposElem.addEventListener("input", 
    function(e){
        positionSpecs.y = parseLength(yposElem.value)
        yboxElem.classList.add("active")
    },
    false
);

zposElem.addEventListener("input", 
    function(e){
        console.log(zposElem.value)
        positionSpecs.z = parseLength(zposElem.value)
        zboxElem.classList.add("active")
        console.log(positionSpecs)
    },
    false
);

xdElem.addEventListener("input", 
    function(e){
        positionSpecs.xd = parseLength(xdElem.value)
        xdboxElem.classList.add("active")
    },
    false
);

ydElem.addEventListener("input", 
    function(e){
        positionSpecs.yd = parseLength(ydElem.value)
        ydboxElem.classList.add("active")
    },
    false
);

zdElem.addEventListener("input", 
    function(e){
        positionSpecs.zd = parseLength(zdElem.value)
        zdElem.classList.add("active")
    },
    false
);

ldElem.addEventListener("input", 
    function(e){
        positionSpecs.ld = parseLength(ldElem.value)
        xboxElem.classList.add("active")
    },
    false
);


function updateCoords(vec){
    
    if (positionSpecs.x === undefined){
        xposElem.value = vec.x.toFixed(3)
    }else{
        xboxElem.classList.add("active")
    };
    
    if (positionSpecs.y === undefined){
        yposElem.value = vec.y.toFixed(3)
    }else{
        document.getElementById("y-box").classList.add("active")
    };
    
    if (positionSpecs.z === undefined){
        zposElem.value = vec.z.toFixed(3)
    }else{
        document.getElementById("z-box").classList.add("active")
    };
}

function updateDelta(vec){
    
    if (positionSpecs.zd === undefined){
        zdElem.value = vec.z.toFixed(3)
    }else{
        document.getElementById("zd-box").classList.add("active")
    };
    
    if (positionSpecs.xd === undefined){
        xdElem.value = vec.x.toFixed(3)
    }else{
        document.getElementById("xd-box").classList.add("active")
    };
    
    if (positionSpecs.yd === undefined){
        ydElem.value = vec.y.toFixed(3)
    }else{
        document.getElementById("yd-box").classList.add("active")
    };
    
    if (positionSpecs.ld === undefined){
        ldElem.value = vec.length().toFixed(3)
    }else{
        document.getElementById("ld-box").classList.add("active")
    };
}

var positionSpecs = {
    x : undefined,
    y : undefined,
    z : 0,
    xd : undefined,
    yd : undefined,
    zd : undefined,
    ld  : undefined
};

function clearSpecs(z) {
    positionSpecs.x  = undefined;
    positionSpecs.y  = undefined;
    positionSpecs.z  = undefined;
    positionSpecs.xd = undefined;
    positionSpecs.yd = undefined;
    positionSpecs.zd = undefined;
    positionSpecs.ld = undefined;
    
    xboxElem.classList.remove("active")
    yboxElem.classList.remove("active")
    zboxElem.classList.remove("active")
    xdboxElem.classList.remove("active")
    ydboxElem.classList.remove("active")
    zdboxElem.classList.remove("active")
    ldboxElem.classList.remove("active")
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



function blarrg (n0,castRay,dx,dy,dz,ld ) {
// n0: origin node [Vector3]
// castRay: mouse ray [RayCaster]
// dx: locks the returned point to x = n0.x + dx
// dy: locks the returned point to y = n0.y + dy
// dz: locks the returned point to z = n0.z + dz
// ld:  forces the returned point to be distance ld from n0

	var a,b,norm;

	if ( ld !== undefined ){

		var closestPoint = n0.clone().add( new THREE.Vector3( ld, 0, 0 ) )

		var minDist = castRay.ray.distanceToPoint(closestPoint)

		var axisVectors = [	new THREE.Vector3( -ld, 0, 0 ),
					new THREE.Vector3( 0,  ld, 0 ),
					new THREE.Vector3( 0, -ld, 0 ),
					new THREE.Vector3( 0, 0,  ld ),
					new THREE.Vector3( 0, 0, -ld )
				  ];
		var point2, dist2

		for ( var i = 0; i < axisVectors.length; i++ ) {

			point2 = n0.clone().add( axisVectors[i] )

			dist2 = castRay.ray.distanceToPoint( point2 )

			if ( dist2 < minDist) {

				closestPoint = point2;

				minDist = dist2;

			};
		};

		return closestPoint;

	}

	if ( dx !== undefined ) {	
		
		dx = new THREE.Vector3(dx,0,0);

		a = dx;
        norm = new THREE.Vector3(1,0,0);

	};


	if ( dy !== undefined ) {	
		
		dy = new THREE.Vector3(0,dy,0);

		if ( a === undefined ) {

			a = dy;
            norm = new THREE.Vector3(0,1,0);

		} else {

			b = dy;

		};

	};

	if ( dz !== undefined ) {	
		
		dz = new THREE.Vector3(0,0,dz);

		if ( a === undefined ) {

			a = dz;
            norm = new THREE.Vector3(0,0,1);

		} else if ( b === undefined ) {

			b = dz;

		} else {

			return n0.add(dx).add(dy).add(dz);

		};

	};

	if ( a === undefined ) {
        var x0 = new THREE.Vector3(-500,0,0).add(n0)
        var x1 = new THREE.Vector3(500,0,0).add(n0)
        var xPt = new THREE.Vector3()
        var xd = castRay.ray.distanceSqToSegment(x0,x1,null,xPt)
        
        var y0 = new THREE.Vector3(0,-500,0).add(n0)
        var y1 = new THREE.Vector3(0,500,0).add(n0)
        var yPt = new THREE.Vector3()
        var yd = castRay.ray.distanceSqToSegment(y0,y1,null,yPt)
        
        var z0 = new THREE.Vector3(0,0,-500).add(n0)
        var z1 = new THREE.Vector3(0,0,500).add(n0)
        var zPt = new THREE.Vector3()
        var zd = castRay.ray.distanceSqToSegment(z0,z1,null,zPt)
        
        var pt = (xd < yd) ? ((xd < zd)? xPt : zPt) : ((yd < zd) ? yPt : zPt)
        
        return pt

	} else if ( b === undefined ) {

		//fix to plane on n0, with normal of a

		var targetPlane = new THREE.Plane()

		targetPlane.setFromNormalAndCoplanarPoint(norm,n0.add(a))
        
        var pt = castRay.ray.intersectPlane(targetPlane)
        
        return pt || new THREE.Vector3()

	} else {

		//fix to line on n0, perpendicular to a and b
        
        n0.add(a).add(b)

		var c = new THREE.Vector3();

		c.crossVectors(a,b).normalize().multiplyScalar(500);

		var closePoint = new THREE.Vector3();
        
        n0.clone().sub(c)
        n0.clone().add(c)

		castRay.ray.distanceSqToSegment(n0.clone().sub(c),n0.clone().add(c),undefined,closePoint);

		return closePoint;

	}

}






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
        
        var blah = new THREE.Vector3()
        
        var iPoint = blarrg(blah,raycaster,positionSpecs.x,positionSpecs.y,positionSpecs.z)
        
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
        
        var iPoint = blarrg(sourceNode.position.clone(),raycaster,positionSpecs.xd,positionSpecs.yd,positionSpecs.zd,positionSpecs.ld)
        
        pt = iPoint

        cursorNode.mesh.position.copy(pt)

        cursorSegment.mesh.scale.set(1,1,pt.clone().sub(sourceNode.position).length())
        cursorSegment.mesh.lookAt(pt)
        
        updateCoords(pt)
        updateDelta(pt.clone().sub(sourceNode.position))
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