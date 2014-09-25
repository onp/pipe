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

function updateCoords(vec){
    document.getElementById("z-pos").value = vec.z.toFixed(3)
    document.getElementById("x-pos").value = vec.x.toFixed(3)
    document.getElementById("y-pos").value = vec.y.toFixed(3)
}

function updateDelta(vec){
    document.getElementById("z-delta").value = vec.z.toFixed(3)
    document.getElementById("x-delta").value = vec.x.toFixed(3)
    document.getElementById("y-delta").value = vec.y.toFixed(3)
    document.getElementById("l-delta").value = vec.length().toFixed(3)
}

var positionSpecs = {
    x : undefined,
    y : undefined,
    z : 0,
    xd : undefined,
    yd : undefined,
    zd : undefined,
    l  : undefined
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



function blarrg (n0,castRay,dx,dy,dz,l ) {
// n0: origin node [Vector3]
// castRay: mouse ray [RayCaster]
// dx: locks the returned point to x = n0.x + dx
// dy: locks the returned point to y = n0.y + dy
// dz: locks the returned point to z = n0.z + dz
// l:  forces the returned point to be distance l from n0

	var a,b,norm;

	if ( l !== undefined ){

		var closestPoint = n0.clone().add( new THREE.Vector3( l, 0, 0 ) )

		var minDist = castRay.distanceToPoint(closestPoint)

		var axisVectors = [	new THREE.Vector3( -l, 0, 0 ),
					new THREE.Vector3( 0,  l, 0 ),
					new THREE.Vector3( 0, -l, 0 ),
					new THREE.Vector3( 0, 0,  l ),
					new THREE.Vector3( 0, 0, -l )
				  ];
		var point2, dist2

		for ( var i = 0; i < axisVectors.length; i++ ) {

			point2 = n0.clone().add( axisVector[i] )

			dist2 = castRay.distanceToPoint( point2 )

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

		targetPlane.setFromNormalAndCoplanarPoint(norm,n0)
        
        var pt = castRay.ray.intersectPlane(targetPlane)
        
        return pt || new THREE.Vector3()

	} else {

		//fix to line on n0, perpendicular to a and b

		var c = new THREE.Vector3();

		c.crossVectors(a,b).normalize().multiplyscalar(500);

		var closePoint = new THREE.Vector3();

		castRay.distanceSqToSegment(n0.clone.sub(c),n0.clone.add(c),undefined,closePoint1);

		return closePoint;

	}

}






// Define "Create Mode" behaviour.
(function (createMode,undefined) {
    createMode.enter = function(){
        mode = createMode
        
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
        
        //var iPlane = new THREE.Plane(new THREE.Vector3(0,0,1),0)
        
        //var iPoint = raycaster.ray.intersectPlane(iPlane)
        
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
        
        var iPoint = blarrg(sourceNode.position.clone(),raycaster,positionSpecs.xd,positionSpecs.yd,positionSpecs.zd,positionSpecs.l)
        
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

document.addEventListener("keydown",keyDownHandle,false)

document.addEventListener("keyup",keyUpHandle,false)

renderer.render(scene,orthoCamera);

render()
    
}