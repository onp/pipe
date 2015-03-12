(function (PIPER, undefined) {
	"use strict";

	
////////////////////////////////////////////////////

PIPER.Positioner = function(context){
	
	this.positionSpecs = {}
	
	this.context = context
	
	
}

PIPER.Positioner.prototype = {
	
	constructor: PIPER.Positioner,
	
	onFrame:function(){},
	
	show:function(){},
	
	hide:function(){},
	
	setReference:function(){},
	
	clear: function () {
		this.positionSpecs.x  = undefined;
		this.positionSpecs.y  = undefined;
		this.positionSpecs.z  = undefined;
		this.positionSpecs.l = undefined;
		
	}
	
	
	
}

////////////////////////////////////////////////////
// Define "Create Mode" behaviour.
var createModeFactory = function (context) {
	var createMode = {
		name: "create"
	}
	
    createMode.enter = function(){
        context.mode = createMode
        
        context.positioner.clear()
        context.positioner.positionSpecs.z = 0
        
        context.cursorNode =  new PIPER.Node(new THREE.Vector3())
        context.scene.add(context.cursorNode.makeMesh())
    };
    
    createMode.leave = function () {
        context.mode = undefined;
        context.scene.remove(context.cursorNode.mesh)
    }
    
    createMode.suspend = function () {
        context.scene.remove(context.cursorNode.mesh)
    }
    
    createMode.resume = function () {
        context.scene.add(context.cursorNode.mesh)
    }
    
    createMode.onClick = function (e) {
    
        if (createMode.underMouse !== null){
        
            console.log(createMode.underMouse);
            
        } else {
    
            var newNode = new PIPER.Node(context.cursorNode.mesh.position.clone());

            context.model.nodes[newNode.uuid] = newNode;
            
            context.visibleNodes.add(newNode.makeMesh());
           
            context.drawMode.enter(newNode);
            
        }
    }

    createMode.onFrame = function (e) {
        
        var mouseVector = new THREE.Vector3(context.mouseState.ndcX,context.mouseState.ndcY,0)
        var projector = new THREE.Projector();
        var raycaster = projector.pickingRay(mouseVector.clone(),context.camera)
        
        var iPoint = PIPER.Calc.constrainedPoint(raycaster,context.positioner.positionSpecs)
        
        var intersects = raycaster.intersectObjects(context.visiblePipes.children);
        
        context.visiblePipes.children.forEach(
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
        
        context.cursorNode.mesh.position.copy(iPoint)

    };

    createMode.onKeyDown = function (e) {
        return
    };
	
	return createMode;
};


////////////////////////////////////////////////////
// Define "Draw Mode" behaviour.

var drawModeFactory = function (context) {
	var drawMode = {
		name: "draw"
	}

    var sourceNode // basisPoint

    drawMode.enter = function(currNode){
        context.positioner.clear()
    
        context.mode = drawMode
        
        sourceNode = currNode
        
        context.cursorSegment = new PIPER.Segment(sourceNode)
        context.scene.add(context.cursorSegment.makeMesh())

    }
    
    drawMode.suspend = function (){
         context.scene.remove(context.cursorSegment.mesh)
         context.scene.remove(context.cursorNode.mesh)
    }
    
    drawMode.resume = function () {
         context.scene.add(context.cursorSegment.mesh)
         context.scene.add(context.cursorNode.mesh)
    }

    drawMode.onClick = function (e) {
    
        var newNode = new PIPER.Node(context.cursorNode.mesh.position.clone())

        context.model.nodes[newNode.uuid] = newNode
        
        context.visibleNodes.add(newNode.makeMesh())

        context.scene.remove(context.cursorSegment.mesh)
        
        var newPipe = new PIPER.Segment(sourceNode,newNode)
        context.model.pipes.push(newPipe)
        
        context.visiblePipes.add(newPipe.makeMesh())
        
        context.drawMode.enter(newNode)
    }
    
    drawMode.onFrame = function (e) {
        
        var mouseVector = new THREE.Vector3(context.mouseState.ndcX,context.mouseState.ndcY,0)
        var projector = new THREE.Projector();
        var raycaster = projector.pickingRay(mouseVector.clone(),context.camera)
        
        var pt = PIPER.Calc.constrainedPoint(raycaster,context.positioner.positionSpecs,sourceNode.mesh.position)

        context.cursorNode.mesh.position.copy(pt)

        context.cursorSegment.mesh.scale.set(1,1,pt.clone().sub(sourceNode.position).length())
        context.cursorSegment.mesh.lookAt(pt)
    }
    
    drawMode.onKeyDown = function(e){
        if (e.keyCode ==27){
            context.scene.remove(context.cursorNode.mesh)
            context.scene.remove(context.cursorSegment.mesh)
            
            context.createMode.enter()
            
        }
    }
    
	return drawMode;
    
};
////////////////////////////////////////////////////
// Define "View Mode" behaviour

var viewModeFactory = function (context) {
	
	var viewMode = {
		name:"view"
	}
	
    viewMode.enter = function(){
        context.controls.enabled = true;
    };
    
    viewMode.leave = function(){
        context.controls.enabled = false;
    };
    
    viewMode.onClick = function(){}
    
    viewMode.onKeydown = function(){}
    
    viewMode.onFrame = function(){}

	return viewMode;

};








////////////////////////////////////////////////////

PIPER.Context = function(targetElem) {
	this.container = targetElem
	this.positioner = new PIPER.Positioner(this)
	this.camera = new THREE.OrthographicCamera(1,1,1,1,0.1,1000);
	this.mode = undefined;
	this.previousMode = undefined;
	this.cursorNode = false;
	this.cursorSegment = false;
	this.model = new PIPER.Model()
	
	this.mouseState = {x:0,y:0,right:false,left:false}
	
	this.createMode = createModeFactory(this)
	this.drawMode = drawModeFactory(this)
	this.viewMode = viewModeFactory(this)
	
	var ctx = this


	document.addEventListener('mousemove',function(e){
		var cp = PIPER.Calc.getCursorPosition(e)
		ctx.mouseState.x = cp[0];
		ctx.mouseState.ndcX = 2*((cp[0] - renderer.domElement.offsetLeft)/canvasSize[0]) - 1
		ctx.mouseState.y = cp[1];
		ctx.mouseState.ndcY = 1 - 2*((cp[1] - renderer.domElement.offsetTop)/canvasSize[1]);
	},false)


	var canvasSize,aspectRatio;

	var orthoWidth = 20;

	var renderer

	if (window.WebGLRenderingContext){
		renderer = new THREE.WebGLRenderer();
	}else{
		renderer = new THREE.CanvasRenderer();
	}

	renderer.setClearColor(0xffffff,1);
	
	this.renderer = renderer
	
	this.onResize = function () {

		canvasSize = [window.innerWidth-3,window.innerHeight-3]
		aspectRatio = canvasSize[0]/canvasSize[1];
		ctx.camera.left = orthoWidth/-2;
		ctx.camera.right = orthoWidth/2;
		ctx.camera.top = orthoWidth/(2*aspectRatio)
		ctx.camera.bottom = orthoWidth/(-2*aspectRatio)
		ctx.camera.updateProjectionMatrix()
		
		renderer.setSize(canvasSize[0], canvasSize[1]);

	}

	window.addEventListener('resize', ctx.onResize, false);


	targetElem.appendChild(renderer.domElement);

	var render = function (ctex) {
		
		var rdr = function(){
			
			ctex.mode.onFrame(ctex.mouseState)
		
			renderer.render(ctex.scene,ctex.camera);
			
			requestAnimationFrame(rdr);
		}

		rdr()
		
	}
	
	document.addEventListener("wheel",function(e){
		if ((e.wheelDeltaY>0) || (e.deltaY<0)){
			orthoWidth *= 1.25;
		}else{
			orthoWidth *= 0.8;
		}
		ctx.onResize();

	},false)
	
	var clickHandle = function(e){
		if (!e.ctrlKey){
			ctx.mode.onClick(e);
		}
	}

	var keyDownHandle = function(e){
		if (e.keyCode==17){
			ctx.previousMode = ctx.mode
			ctx.mode.suspend()
			ctx.viewMode.enter()
			return
		}
		ctx.mode.onKeyDown(e)
	}

	var keyUpHandle = function(e){
		if (e.keyCode==17){
			ctx.viewMode.leave()
			ctx.previousMode.resume()
			ctx.previousMode = undefined;
			return
		}
	}


	document.addEventListener("click",clickHandle,false)

	document.addEventListener("keydown",keyDownHandle,false)

	document.addEventListener("keyup",keyUpHandle,false)	
	
	
	this.initializeScene()
	this.onResize()
	this.createMode.enter()
	render(this)
	
}
	
PIPER.Context.prototype = {
	
	constructor: PIPER.Context,
	
	onFrame: function(){
		
		this.positioner.onFrame()
		
	},
	
	initializeScene: function(){
		
		this.scene = new THREE.Scene();

		this.visiblePipes = new THREE.Object3D();
		this.scene.add( this.visiblePipes );

		this.visibleNodes = new THREE.Object3D();
		this.scene.add( this.visibleNodes );
		
		var axisHelper = new THREE.AxisHelper(3);
		this.scene.add(axisHelper);

		var light = new THREE.PointLight(0xffffff);
		light.position.set(200, 0, 200);
		this.scene.add(light);

		var light2 = new THREE.PointLight(0x404040);
		light2.position.set(-200, 0, -200);
		this.scene.add(light2);

		this.camera.position.set(200,200,200);
		this.camera.up = new THREE.Vector3(0,0,1);
		this.camera.lookAt(new THREE.Vector3(0,0,0));

		this.controls = new THREE.OrbitControls(this.camera, this.container);
		this.controls.enabled = false;
		
	}
	

	
	
}




	
	
}(window.PIPER = window.PIPER || {}));