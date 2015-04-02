(function (PIPER, undefined) {
	"use strict";

	
////////////////////////////////////////////////////
// Positioner
var PositionerFactory = function(context){
	
	var positioner = {}
	positioner.context = context
	
	var positionSpecs = {}
	positioner.positionSpecs = positionSpecs
	
	var displayElement = document.getElementById("menu-box")
	var deltaElement = document.getElementById("delta-box")
	
	var markedActive = {x:false,y:false,z:false,l:false};
	var deltaVisible = deltaElement.style.display == "block";
	
	var dims = ["x","y","z","l"]
	var posTags = ["x-pos","y-pos","z-pos"]
	var deltaTags = ["x-delta","y-delta","z-delta","l-delta"]
	
	var posElems = posTags.map(function(a){return document.getElementById(a)})
	var deltaElems = deltaTags.map(function(a){return document.getElementById(a)})
	
	//hacky - to make the lists the same length, even though we don't care about magnitude of absolute position
	var dummyParent = document.createElement("div")
	var dummyChild1 = document.createElement("span")
	var dummyChild2 = document.createElement("input")
	dummyParent.appendChild(dummyChild1)
	dummyParent.appendChild(dummyChild2)
	posElems.push(dummyChild2)
	
	for (var i=0; i<dims.length;i++){
		posElems[dims[i]] = posElems[i]
		deltaElems[dims[i]] = deltaElems[i]
	}
	
	displayElement.addEventListener("click", function(e){
		e.stopPropagation()
	},false)
	
	var checkSpecs = function () {
		for (var i=0;i<dims.length;i++){
			if (positionSpecs[dims[i]] !== undefined && !markedActive[dims[i]]){
				posElems[i].parentNode.classList.add("active")
				posElems[i].value = PIPER.Calc.formatLength(positionSpecs[dims[i]])
				deltaElems[i].parentNode.classList.add("active")
				markedActive[dims[i]] = true;
			}else if (positionSpecs[dims[i]] === undefined && markedActive[dims[i]]) {
				posElems[i].parentNode.classList.remove("active")
				deltaElems[i].parentNode.classList.remove("active")
				markedActive[dims[i]] = false;
			}
		}
		
		if (deltaVisible && context.cursor.start === undefined){
			deltaElement.style.display = "none"
			deltaVisible = false
		} else if (!deltaVisible && context.cursor.start !== undefined){
			deltaElement.style.display = "block"
			deltaVisible = true
		}
	}	
	
	var onFocusGenerator = function(dim,elem){
		var onFocus = function(e){
			
		if (positionSpecs[dim]) {	return	}
		
		if (dim != "l"){
			positionSpecs[dim] = positioner.context.cursor.start ? positioner.context.cursor.start[dim] : 0
		} else {
			positionSpecs.x  = undefined;
			positionSpecs.y  = undefined;
			positionSpecs.z  = undefined;
			positionSpecs[dim] = 1;
		}
		posElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim])
		if (dim == 'l'){
			deltaElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim])
		} else {
			deltaElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim] - context.cursor.start[dim])
		}
		

		}
		
		return onFocus
	}
	
	var onActivatorClickGenerator = function(dim,elem){
		var onActivatorClickGenerator = function(e){
			if (positionSpecs[dim] === undefined) { return}
			
			e.stopPropagation()
			
			positionSpecs[dim] = undefined
			
		}
		
		return onActivatorClickGenerator
		
	}
	
	var onInputGenerator = function(dim,elem,isDelta){
		
		var onInput = function(e){
			
			if (!isDelta){
				positionSpecs[dim] = PIPER.Calc.parseLength(elem.value)
				deltaElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim] - context.cursor.start[dim])
				
			}else{
				if (dim == 'l'){
					positionSpecs[dim] = PIPER.Calc.parseLength(elem.value)
					
				} else {
					positionSpecs[dim] = PIPER.Calc.parseLength(elem.value) + context.cursor.start[dim]
					posElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim])
					
				}
				
			}
			
			
		}
		
		return onInput
	}
	

	
	
	//provide functionality
	for (var i = 0; i<dims.length; i++){
		
		var p = posElems[i];
		var d = deltaElems[i];
		
		//on Focus
		p.addEventListener("focus",
			onFocusGenerator(dims[i],p),
			false
		)
		d.addEventListener("focus",
			onFocusGenerator(dims[i],d),
			false
		)
		
		//on parent click
		p.parentNode.addEventListener("click",
			onFocusGenerator(dims[i],p),
			false
		)
		d.parentNode.addEventListener("click",
			onFocusGenerator(dims[i],d),
			false
		)
		
		// on input
		p.addEventListener("input",
			onInputGenerator(dims[i],p),
			false
		)
		
		d.addEventListener("input",
			onInputGenerator(dims[i],d,true),
			false
		)
		
		// on activator click (deactivate)
		p.previousElementSibling.addEventListener("click",
			onActivatorClickGenerator(dims[i],p),
			false		
		)
		
		d.previousElementSibling.addEventListener("click",
			onActivatorClickGenerator(dims[i],d),
			false		
		)
		
	}
	
	
	
	
	positioner.onFrame = function(){
		checkSpecs()
		
		for (var i=0;i<dims.length;i++){
			if (positionSpecs[dims[i]] === undefined){
				posElems[i].value = PIPER.Calc.formatLength(context.cursor.target[dims[i]])
				
				if (deltaVisible) {
					deltaElems[i].value = PIPER.Calc.formatLength((dims[i] =="l") ? context.cursor.diff.length() : context.cursor.diff[dims[i]])
				}
				
			}
			
		}
		
	}
	
	positioner.show = function(){
		displayElement.style.display = "block";
	}
	
	positioner.hide = function(){
		displayElement.style.display = "none"
	}
	
	positioner.clear = function () {
		positionSpecs.x  = undefined;
		positionSpecs.y  = undefined;
		positionSpecs.z  = undefined;
		positionSpecs.l = undefined;
		
	}
	
	
	return positioner
}

////////////////////////////////////////////////////
// Cursor

var CursorFactory = function(context){
	var cursor = {}
	
	cursor.node = new PIPER.Node(new THREE.Vector3(0,0,1));
	cursor.segment = new PIPER.Segment(cursor.node);
	cursor.group = new THREE.Object3D();
	
	cursor.group.add(cursor.node.makeMesh())
	cursor.segment.makeMesh();
	
	cursor.target = cursor.node.mesh.position ;
	cursor.start = undefined;
	cursor.diff = new THREE.Vector3();
	
	cursor.setTarget = function(pos){
		cursor.node.mesh.position.copy(pos)
		
		if (cursor.start !== undefined){
			cursor.update()
		}
	}
	
	cursor.setStart = function(pos){
		if (pos === undefined){
			cursor.start = undefined;
			cursor.group.remove(cursor.segment.mesh)
			return
		}
		
		if (cursor.start === undefined){
			cursor.group.add(cursor.segment.mesh)
		}
		
		cursor.start = pos
		cursor.diff.subVectors(cursor.target,cursor.start)
		cursor.segment.mesh.position.copy(pos)

	}
	
	cursor.update = function(){
		if (cursor.start === undefined){ return }
		
		cursor.segment.mesh.scale.set(1,1,cursor.target.clone().sub(cursor.start).length())
        cursor.segment.mesh.lookAt(cursor.target)
		cursor.diff.subVectors(cursor.target,cursor.start)
	}
	
	cursor.show = function(){
		context.scene.add(cursor.group)
	}
	
	cursor.hide = function(){
		context.scene.remove(cursor.group)
	}
	
	
	
	
	return cursor
}



////////////////////////////////////////////////////
// Define "Create Mode" behaviour.
var CreateModeFactory = function (context) {
	var createMode = {
		name: "create",
		hoveredPipe:null,
		hoveredNode:null
	}
	
    createMode.enter = function(){
        context.mode = createMode
        
        context.positioner.clear()
        context.positioner.positionSpecs.z = 0
        
        context.cursor.show()
    };
    
    createMode.leave = function () {
        context.mode = undefined;
        context.cursor.hide()
    }
    
    createMode.suspend = function () {
        context.cursor.hide()
    }
    
    createMode.resume = function () {
        context.cursor.show()
    }
    
    createMode.onClick = function (e) {
    
        if (createMode.hoveredPipe !== null || createMode.hoveredNode !== null){
        
            console.log(createMode.hoveredPipe);
            console.log(createMode.hoveredNode);
            
        } else {
    
            var newNode = new PIPER.Node(context.cursor.target.clone());

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
        
        var pipeIntersects = raycaster.intersectObjects(context.visiblePipes.children);
		var nodeIntersects = raycaster.intersectObjects(context.visibleNodes.children);
        
		if (createMode.hoveredPipe !== null){
			createMode.hoveredPipe.mesh.material.color.setHex(0x00ff00);
		}

		if (createMode.hoveredNode !== null){
			createMode.hoveredNode.mesh.material.color.setHex(0xff0000);
		}
		
        // context.visiblePipes.children.forEach(
            // function ( pipe ) {
                // pipe.material.color.setHex(0x00ff00);
            // }
        // )
        
        if (pipeIntersects.length > 0){
            pipeIntersects[0].object.material.color.setHex(0x0000ff);
            createMode.hoveredPipe = pipeIntersects[0].object.userData.owner
            
        } else {
            createMode.hoveredPipe = null;
        };

        if (nodeIntersects.length > 0){
            nodeIntersects[0].object.material.color.setHex(0x0000ff);
            createMode.hoveredNode = nodeIntersects[0].object.userData.owner
            
        } else {
            createMode.hoveredNode = null;
        };
        
        context.cursor.setTarget(iPoint)
		context.positioner.onFrame()

    };

    createMode.onKeyDown = function (e) {
        return
    };
	
	return createMode;
};


////////////////////////////////////////////////////
// Define "Draw Mode" behaviour.

var DrawModeFactory = function (context) {
	var drawMode = {
		name: "draw"
	}

    var sourceNode // basisPoint

    drawMode.enter = function(currNode){
        context.positioner.clear()
    
        context.mode = drawMode
        
        sourceNode = currNode

        context.cursor.setStart(sourceNode.mesh.position.clone())
		context.cursor.show()

    }
    
    drawMode.suspend = function (){
         context.cursor.hide()
    }
    
    drawMode.resume = function () {
         context.cursor.show()
    }

    drawMode.onClick = function (e) {
    
        var newNode = new PIPER.Node(context.cursor.target.clone())

        context.model.nodes[newNode.uuid] = newNode
        
        context.visibleNodes.add(newNode.makeMesh())

        context.cursor.setStart()
        
        var newPipe = new PIPER.Segment(sourceNode,newNode)
        context.model.pipes.push(newPipe)
        
        context.visiblePipes.add(newPipe.makeMesh())
        
        context.drawMode.enter(newNode)
    }
    
    drawMode.onFrame = function (e) {
        
        var mouseVector = new THREE.Vector3(context.mouseState.ndcX,context.mouseState.ndcY,0)
        var projector = new THREE.Projector();
        var raycaster = projector.pickingRay(mouseVector.clone(),context.camera)
        
        var pt = PIPER.Calc.constrainedPoint(raycaster,context.positioner.positionSpecs,sourceNode.mesh.position.clone())

        context.cursor.setTarget(pt)
		context.positioner.onFrame()
    }
    
    drawMode.onKeyDown = function(e){
        if (e.keyCode ==27){
            context.cursor.setStart()
            
            context.createMode.enter()
            
        }
    }
    
	return drawMode;
    
};
////////////////////////////////////////////////////
// Define "View Mode" behaviour

var ViewModeFactory = function (context) {
	
	var viewMode = {
		name:"view"
	}
	
    viewMode.enter = function(){
        context.controls.enabled = true;
        context.controlsP.enabled = true;
    };
    
    viewMode.leave = function(){
        context.controls.enabled = false;
        context.controlsP.enabled = false;
    };
    
    viewMode.onClick = function(){}
    
    viewMode.onKeydown = function(){}
    
    viewMode.onFrame = function(){}

	return viewMode;

};








////////////////////////////////////////////////////

PIPER.Context = function(targetElem) {
	this.container = targetElem
	this.positioner = PositionerFactory(this)
	
	this.cameraO = new THREE.OrthographicCamera(1,1,1,1,0.1,1000)
	this.cameraP = new THREE.PerspectiveCamera(50,1,0.1,1000)
	this.camera = this.cameraO
	
	this.mode = undefined;
	this.previousMode = undefined;
	this.cursor = CursorFactory(this);
	this.model = new PIPER.Model()
	
	this.mouseState = {x:0,y:0,right:false,left:false}
	
	this.createMode = CreateModeFactory(this)
	this.drawMode = DrawModeFactory(this)
	this.viewMode = ViewModeFactory(this)
	
	var ctx = this


	document.addEventListener('mousemove',function(e){
		var cp = PIPER.Calc.getCursorPosition(e)
		ctx.mouseState.x = cp[0];
		ctx.mouseState.ndcX = 2*((cp[0] - renderer.domElement.offsetLeft)/canvWidth) - 1
		ctx.mouseState.y = cp[1];
		ctx.mouseState.ndcY = 1 - 2*((cp[1] - renderer.domElement.offsetTop)/canvHeight);
	},false)


	var canvWidth,canvHeight,aspectRatio;

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
		
		canvWidth = targetElem.offsetWidth-3;
		canvHeight = targetElem.offsetHeight-4;
		aspectRatio = canvWidth/canvHeight;
		
		ctx.cameraP.aspect = aspectRatio;
		ctx.cameraP.updateProjectionMatrix();
		
		ctx.cameraO.left = orthoWidth/-2;
		ctx.cameraO.right = orthoWidth/2;
		ctx.cameraO.top = orthoWidth/(2*aspectRatio)
		ctx.cameraO.bottom = orthoWidth/(-2*aspectRatio)
		ctx.cameraO.updateProjectionMatrix()
		
		renderer.setSize(canvWidth, canvHeight);

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
	this.positioner.show()
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

		this.cameraO.position.set(200,200,200);
		this.cameraP.position.set(200,200,200);
		this.cameraO.up = new THREE.Vector3(0,0,1);
		this.cameraP.up = new THREE.Vector3(0,0,1);
		this.cameraO.lookAt(new THREE.Vector3(0,0,0));
		this.cameraP.lookAt(new THREE.Vector3(0,0,0));

		this.controls = new THREE.OrbitControls(this.cameraO, this.container);
		this.controlsP =  new THREE.OrbitControls(this.cameraP, this.container);
		this.controls.enabled = false;
		this.controlsP.enabled = false;
		
	}
	

	
	
}




	
	
}(window.PIPER = window.PIPER || {}));