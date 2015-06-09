(function (PIPER, undefined) {
	"use strict";


	////////////////////////////////////////////////////
	// Positioner
	var PositionerFactory = function (context) {

		var positioner = {};
		positioner.context = context;

		var positionSpecs = {};
		positioner.positionSpecs = positionSpecs;

		var displayElement = document.getElementById("menu-box");
		var deltaElement = document.getElementById("delta-box");

		var markedActive = {x: false, y: false, z: false, l: false};
		var deltaVisible = deltaElement.style.display == "block";

		var dims = ["x", "y", "z", "l"];
		var posTags = ["x-pos", "y-pos", "z-pos"];
		var deltaTags = ["x-delta", "y-delta", "z-delta", "l-delta"];

		var posElems = posTags.map(function (a) {return document.getElementById(a); });
		var deltaElems = deltaTags.map(function (a) {return document.getElementById(a); });
		var diamElem = document.getElementById("diameter")
		positionSpecs.diameter = PIPER.defaultDiameter
		positioner.lengthElem = deltaElems[3];

		var i;

		//hacky - to make the lists the same length, even though we don't care about magnitude of absolute position
		var dummyParent = document.createElement("div");
		var dummyChild1 = document.createElement("span");
		var dummyChild2 = document.createElement("input");
		dummyParent.appendChild(dummyChild1);
		dummyParent.appendChild(dummyChild2);
		posElems.push(dummyChild2);

		for (i = 0; i < dims.length; i++) {
			posElems[dims[i]] = posElems[i];
			deltaElems[dims[i]] = deltaElems[i];
		}

		displayElement.addEventListener("click", function (e) {
			e.stopPropagation();
		}, false);
		
		displayElement.addEventListener("keydown", function (e) {
			e.stopPropagation();
		}, false);

		var checkSpecs = function () {
			for (i = 0; i < dims.length; i++) {
				if (positionSpecs[dims[i]] !== undefined && !markedActive[dims[i]]) {
					posElems[i].parentNode.classList.add("active");
					posElems[i].value = PIPER.Calc.formatLength(positionSpecs[dims[i]],context.units);
					deltaElems[i].parentNode.classList.add("active");
					markedActive[dims[i]] = true;
				} else if (positionSpecs[dims[i]] === undefined && markedActive[dims[i]]) {
					posElems[i].parentNode.classList.remove("active");
					deltaElems[i].parentNode.classList.remove("active");
					markedActive[dims[i]] = false;
				}
			}

			if (deltaVisible && context.cursor.start === undefined) {
				deltaElement.style.display = "none";
				deltaVisible = false;
			} else if (!deltaVisible && context.cursor.start !== undefined) {
				deltaElement.style.display = "block";
				deltaVisible = true;
			}
		};

		var onFocusGenerator = function (dim, elem) {
			var onFocus = function (e) {
				if (positionSpecs[dim]) {	return false;	}

				if (dim != "l") {
					positionSpecs[dim] = positioner.context.cursor.start ? positioner.context.cursor.start[dim] : 0;
				} else {
					positionSpecs.x  = undefined;
					positionSpecs.y  = undefined;
					positionSpecs.z  = undefined;
					positionSpecs[dim] = 1;
				}

				posElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim],context.units);

				if (dim == 'l') {
					deltaElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim],context.units);
				} else {
					deltaElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim] - context.cursor.start[dim],context.units);
				}


			};

			return onFocus;
		};

		var onActivatorClickGenerator = function (dim, elem) {
			var onActivatorClickGenerator = function (e) {
				if (positionSpecs[dim] === undefined) {return false; }

				e.stopPropagation();

				positionSpecs[dim] = undefined;

			};

			return onActivatorClickGenerator;

		};

		var onInputGenerator = function (dim, elem, isDelta) {

			var onInput = function (e) {

				if (!isDelta) {
					positionSpecs[dim] = PIPER.Calc.parseLength(elem.value,context.units);
					deltaElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim] - context.cursor.start[dim],context.units);

				} else {
					if (dim == 'l') {
						positionSpecs[dim] = PIPER.Calc.parseLength(elem.value,context.units);

					} else {
						positionSpecs[dim] = PIPER.Calc.parseLength(elem.value,context.units) + context.cursor.start[dim];
						posElems[dim].value = PIPER.Calc.formatLength(positionSpecs[dim],context.units);

					}

				}


			};

			return onInput;
		};




		//provide functionality
		for (i = 0; i < dims.length; i++) {

			var p = posElems[i];
			var d = deltaElems[i];

			//on Focus
			p.addEventListener("focus",
				onFocusGenerator(dims[i], p),
				false);

			d.addEventListener("focus",
				onFocusGenerator(dims[i], d),
				false);

			//on parent click
			p.parentNode.addEventListener("click",
				onFocusGenerator(dims[i], p),
				false);

			d.parentNode.addEventListener("click",
				onFocusGenerator(dims[i], d),
				false);

			// on input
			p.addEventListener("input",
				onInputGenerator(dims[i], p),
				false);

			d.addEventListener("input",
				onInputGenerator(dims[i], d, true),
				false);

			// on activator click (deactivate)
			p.previousElementSibling.addEventListener("click",
				onActivatorClickGenerator(dims[i], p),
				false);

			d.previousElementSibling.addEventListener("click",
				onActivatorClickGenerator(dims[i], d),
				false);

		}
		
		diamElem.addEventListener("input",
			function(e){
				var diam = PIPER.Calc.parseLength(diamElem.value,context.units)
				positioner.positionSpecs.diameter = diam
				
				var newGeom = new THREE.CylinderGeometry(diam/2, diam/2, 1);
				var cTrans = new THREE.Matrix4();
				newGeom.applyMatrix(cTrans.makeTranslation(0, 0.5, 0));
				newGeom.applyMatrix(cTrans.makeRotationX(Math.PI / 2));
				context.cursor.segment.mesh.geometry = newGeom;
			},
			false
		)




		positioner.onFrame = function () {
			checkSpecs();

			var i;

			for (i = 0; i < dims.length; i++) {
				if (positionSpecs[dims[i]] === undefined) {
					posElems[i].value = PIPER.Calc.formatLength(context.cursor.target[dims[i]],context.units);

					if (deltaVisible) {
						deltaElems[i].value = PIPER.Calc.formatLength((dims[i] == "l") ? context.cursor.diff.length() : context.cursor.diff[dims[i]],context.units);
						if (document.activeElement !== diamElem) {
							diamElem.value = PIPER.Calc.formatLength(positionSpecs.diameter,context.units);
						}
					}

				}

			}

		};

		positioner.show = function () {
			displayElement.style.display = "block";
		};

		positioner.hide = function () {
			displayElement.style.display = "none";
		};

		positioner.clear = function () {
			positionSpecs.x  = undefined;
			positionSpecs.y  = undefined;
			positionSpecs.z  = undefined;
			positionSpecs.l = undefined;
			positionSpecs.diameter = PIPER.defaultDiameter;

		};


		return positioner;
	};

	////////////////////////////////////////////////////
	// Cursor

	var CursorFactory = function (context) {
		var cursor = {};

		cursor.node = new PIPER.Node(new THREE.Vector3(0, 1, 0));
		cursor.segment = new PIPER.Segment(cursor.node);
		cursor.group = new THREE.Object3D();

		cursor.group.add(cursor.node.makeMesh());
		cursor.segment.makeMesh();

		var linMat = new THREE.LineBasicMaterial({color: 0x000000});
		var linGeom = new THREE.Geometry();
		linGeom.vertices.push(new THREE.Vector3(0, 0, 0));
		linGeom.vertices.push(new THREE.Vector3(0, 0, 0));
		linGeom.vertices.push(new THREE.Vector3(0, 0, 0));
		linGeom.vertices.push(new THREE.Vector3(0, 0, 0));
		cursor.angleHatching = new THREE.Line(linGeom, linMat);

		cursor.target = cursor.node.mesh.position;
		cursor.start = undefined;
		cursor.diff = new THREE.Vector3();

		cursor.setTarget = function (pos) {
			cursor.node.mesh.position.copy(pos);
			cursor.update();
		};

		cursor.setStart = function (pos) {
			if (pos === undefined) {
				cursor.start = undefined;
				cursor.group.remove(cursor.segment.mesh);
				cursor.group.remove(cursor.angleHatching);
				return;
			}

			if (cursor.start === undefined) {
				cursor.group.add(cursor.segment.mesh);
				cursor.group.add(cursor.angleHatching);
			}

			cursor.start = pos;
			cursor.diff.subVectors(cursor.target, cursor.start);
			cursor.segment.mesh.position.copy(pos);
			cursor.angleHatching.position.copy(pos);

		};

		cursor.update = function () {
			if (cursor.start === undefined) { return; }
			if (cursor.start.equals(cursor.target)) {
				cursor.hide();
			}else{
				cursor.show();
			}

			cursor.segment.mesh.scale.set(1, 1, cursor.target.clone().sub(cursor.start).length());
			cursor.segment.mesh.lookAt(cursor.target);
			cursor.diff.subVectors(cursor.target, cursor.start);

			cursor.angleHatching.geometry.vertices[1] = new THREE.Vector3(cursor.diff.x, 0, 0);
			cursor.angleHatching.geometry.vertices[2] = new THREE.Vector3(cursor.diff.x, 0, cursor.diff.z);
			cursor.angleHatching.geometry.vertices[3] = new THREE.Vector3(cursor.diff.x, cursor.diff.y, cursor.diff.z);
			cursor.angleHatching.geometry.verticesNeedUpdate = true;
		};

		cursor.show = function () {
			context.scene.add(cursor.group);
		};

		cursor.hide = function () {
			context.scene.remove(cursor.group);
		};




		return cursor;
	};
	
	////////////////////////////////////////////////////
	// Selector

	var SelectorFactory = function (context) {
		var selector = {
			selection: [],
			hoveredPipe: null,
			hoveredNode: null
		};
		
		selector.clearHovers = function (){
			// clear existing hovers
			
			if (selector.hoveredPipe !== null) {
				if (selector.hoveredPipe.mesh.material.color.getHex() == 0x0000ff) {
					selector.hoveredPipe.mesh.material.color.setHex(selector.hoveredPipe.color);
				}
			}

			if (selector.hoveredNode !== null) {
				if (selector.hoveredNode.mesh.material.color.getHex() == 0x0000ff) {
					selector.hoveredNode.mesh.material.color.setHex(selector.hoveredNode.color);
				}
			}
		}
		
		selector.updateHover = function (raycaster) {
			var pipeIntersects = raycaster.intersectObjects(context.visiblePipes.children);
			var nodeIntersects = raycaster.intersectObjects(context.visibleNodes.children);

			selector.clearHovers()
			
			// color new hovers

			if (pipeIntersects.length > 0) {
				
				selector.hoveredPipe = pipeIntersects[0].object.userData.owner;
				if (selector.hoveredPipe.color == selector.hoveredPipe.mesh.material.color.getHex()) {
					pipeIntersects[0].object.material.color.setHex(0x0000ff);
				}

			} else {
				selector.hoveredPipe = null;
			}

			if (nodeIntersects.length > 0) {
				
				selector.hoveredNode = nodeIntersects[0].object.userData.owner;
				if (selector.hoveredNode.color == selector.hoveredNode.mesh.material.color.getHex()) {
					nodeIntersects[0].object.material.color.setHex(0x0000ff);
				}

			} else {
				selector.hoveredNode = null;
			}
		}
	
		
		
		return selector;
	}

	////////////////////////////////////////////////////
	// Mode Manager

	var ModeManagerFactory = function (context) {
		var modeManager = {
			mode: undefined
		};

		var modes = {};
		var keyCodes = {};

		var toggleMode = function (mode) {
			if (mode.state != "on") {
				mode.enter();
			} //else {
			//	mode.leave();
			//}
			modeManager.update();
		};

		modeManager.addMode = function (mode, element, keyCode) {
			modes[mode.name] = {mode: mode, element: element, keyCode: keyCode};
			keyCodes[keyCode] = modes[mode.name];

			element.addEventListener("click",
				function (e) {
					e.stopPropagation();
					toggleMode(mode);
				},
				false);
		};

		modeManager.onKeyDown = function (e) {
			if (keyCodes[e.keyCode]) {
				toggleMode(keyCodes[e.keyCode].mode);
			}
		};

		modeManager.update = function () {

			var modeName;

			for (modeName in modes) {

				var modeData = modes[modeName];

				if (modeData.mode.state == "off") {
					modeData.element.classList.remove("active");
					modeData.element.classList.remove("suspended");
				} else if (modeData.mode.state == "on") {
					modeData.element.classList.add("active");
					modeData.element.classList.remove("suspended");
				} else if (modeData.mode.state == "suspend") {
					modeData.element.classList.remove("active");
					modeData.element.classList.add("suspended");
				}
			}
		};

		return modeManager;

	};


	////////////////////////////////////////////////////
	// Define "Create Mode" behaviour.
	var CreateModeFactory = function (context) {
		var createMode = {
			name: "create",
			state: "off"
		};

		createMode.enter = function () {
			if (context.mode) {
				context.mode.leave();
			}

			context.mode = createMode;
			this.state = "on";

			context.positioner.clear();
			context.positioner.positionSpecs.y = 0;

			context.cursor.show();
			context.positioner.show();
			context.modeManager.update();
		};

		createMode.leave = function () {
			this.state = "off";
			context.mode = undefined;
			context.cursor.hide();
		};

		createMode.onClick = function (e) {
			
			if (context.selector.hoveredNode !== null) {
				
				context.selector.hoveredNode.mesh.material.color.setHex(0xff0000);
				context.drawMode.enter(context.selector.hoveredNode);
			
			} else if (context.selector.hoveredPipe !== null) {
				
			} else {

				var newNode = new PIPER.Node(context.cursor.target.clone());

				context.model.nodes[newNode.uuid] = newNode;

				context.visibleNodes.add(newNode.makeMesh());

				context.drawMode.enter(newNode);

			}
		};

		createMode.onFrame = function (e) {

			var mouseVector = new THREE.Vector3(context.mouseState.ndcX, context.mouseState.ndcY, 0);

			var raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(mouseVector.clone(), context.camera);

			var iPoint = PIPER.Calc.constrainedPoint(raycaster, context.positioner.positionSpecs);

			context.selector.updateHover(raycaster)
			
			context.cursor.setTarget(iPoint);
			context.positioner.onFrame();

		};

		createMode.onKeyDown = function (e) {
			if (e.keyCode == 27) {
				context.viewMode.enter();
			}
		};

		return createMode;
	};


	////////////////////////////////////////////////////
	// Define "Draw Mode" behaviour.

	var DrawModeFactory = function (context) {
		var drawMode = {
			name: "draw",
			state: "off"
		};

		var sourceNode; // basisPoint

		drawMode.enter = function (currNode) {
			if (context.mode) {
				context.mode.leave();
			}

			if (!currNode) {
				context.createMode.enter();
				return;
			}

			context.positioner.clear();

			context.mode = drawMode;
			this.state = "on";

			sourceNode = currNode;

			context.cursor.setStart(sourceNode.mesh.position.clone());
			context.cursor.show();
			context.positioner.show();
			context.modeManager.update();
		};

		drawMode.leave = function () {
			this.state = "off";
			context.mode = undefined;
			context.cursor.setStart();
			context.cursor.hide();
		};

		drawMode.onClick = function (e) {
			
			var newNode;
			
			if (context.selector.hoveredNode !== null) {
				
				context.selector.hoveredNode.mesh.material.color.setHex(0xff0000);
				newNode = context.selector.hoveredNode;
			
			} else {

				newNode = new PIPER.Node(context.cursor.target.clone());
				context.model.nodes[newNode.uuid] = newNode;
				context.visibleNodes.add(newNode.makeMesh());
				
			}

			context.cursor.setStart();

			var d = context.positioner.positionSpecs.diameter;
			var newPipe = new PIPER.Segment(sourceNode, newNode, d);
			context.model.pipes[newPipe.uuid] = newPipe;

			context.visiblePipes.add(newPipe.makeMesh());

			context.drawMode.enter(newNode);
		};

		drawMode.onFrame = function (e) {

			var mouseVector = new THREE.Vector3(context.mouseState.ndcX, context.mouseState.ndcY, 0);

			var raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(mouseVector.clone(), context.camera);

			context.selector.updateHover(raycaster);

			if ((context.selector.hoveredNode !== null) && (context.selector.hoveredNode !== sourceNode)) {
				context.cursor.setTarget(context.selector.hoveredNode.mesh.position.clone())
			} else {
				var pt = PIPER.Calc.constrainedPoint(raycaster, context.positioner.positionSpecs, sourceNode.mesh.position.clone());
				context.cursor.setTarget(pt);
			}

			context.positioner.onFrame();

		};

		drawMode.onKeyDown = function (e) {
			var k = e.keyCode;
			if (k == 27) {
				context.viewMode.enter();
			} else {
				var le = context.positioner.lengthElem
				if (document.activeElement === le) {
					return
				}
				if (k >= 96 && k <= 105) {
					k -= 48;  //make numpad and main numkey values match
				}
				if (k >= 48 && k <= 57 || k == 32 || k == 222) {
					le.focus()
					le.dispatchEvent(new Event('Focus'))
					le.value = ""
					
				}
			}
		};

		return drawMode;

	};
	////////////////////////////////////////////////////
	// Define "View Mode" behaviour

	var ViewModeFactory = function (context) {

		var viewMode = {
			name: "view",
			state: "off"
		};

		viewMode.enter = function () {
			if (context.mode) {
				context.mode.leave();
			}
			
			context.mode = viewMode;
			this.state = "on";

			context.controlsO.enabled = true;
			context.controlsP.enabled = true;
			context.positioner.hide();
			context.selector.clearHovers();
			context.modeManager.update();
		};

		viewMode.leave = function () {
			this.state = "off";
			context.mode = undefined;
			context.controlsO.enabled = false;
			context.controlsP.enabled = false;
		};

		viewMode.onClick = function () {};

		viewMode.onKeyDown = function () {};

		viewMode.onFrame = function () {};

		return viewMode;

	};
	
	////////////////////////////////////////////////////
	// Define "Select Mode" behaviour

	var SelectModeFactory = function (context) {

		var selectMode = {
			name: "select",
			state: "off",
			nodes: [],
			pipes: []
		};
		
				
		selectMode.elem = document.getElementById("selected-objects");
		selectMode.pElem = document.getElementById("selected-pipes");
		selectMode.nElem = document.getElementById("selected-nodes");
		

		selectMode.enter = function () {

			if (context.mode) {
				context.mode.leave(true);
			}
			
			context.mode = selectMode;
			this.state = "on";
			
			context.positioner.hide();
			context.modeManager.update();
		};

		selectMode.leave = function () {
			selectMode.clearSelection();
			this.state = "off";
			context.mode = undefined;
		};
		
		selectMode.addNode = function (sNode) {
			var elem = document.createElement("div");
			elem.classList.add("obj")
			elem.innerHTML = "<span>" +
							sNode.uuid.slice(0,8) + "</span><span>" + 
							PIPER.Calc.formatLength(sNode.position.x,context.units) + "</span><span>" +
							PIPER.Calc.formatLength(sNode.position.y,context.units) + "</span><span>" +
							PIPER.Calc.formatLength(sNode.position.z,context.units) + "</span>";
			selectMode.nElem.appendChild(elem)
			var typeSelector = document.createElement("select")
			typeSelector.innerHTML = "<option value='node'>node</option>"+
									 "<option value='gate'>gate</option>"+
									 "<option value='globe'>globe</option>"
			typeSelector.addEventListener("change",function(e){
					sNode.switchType(e.target.value)
				},
				false
			)
			typeSelector.value = sNode.nodeType
			elem.appendChild(typeSelector)
			selectMode.nodes.push(sNode)
		}
		
		selectMode.addPipe = function (sPipe) {
			console.log(sPipe)
			var elem = document.createElement("div");
			elem.classList.add("obj")
			elem.innerHTML = "<span>" + 
							sPipe.uuid.slice(0,8) + "</span><span>" +
							sPipe.node1.uuid.slice(0,8) + "</span><span>" +
							sPipe.node2.uuid.slice(0,8) + "</span><span>" +
							PIPER.Calc.formatLength(sPipe.length(),context.units) + "</span>";
			selectMode.pElem.appendChild(elem)
			selectMode.pipes.push(sPipe)
		}
		
		selectMode.clearSelection = function(deleteSelected) {
			var i;
			if (!deleteSelected){
				for (i = 0; i<selectMode.nodes.length; i++){
					selectMode.nodes[i].mesh.material.color.setHex(selectMode.nodes[i].color)
				}
				for (i = 0; i<selectMode.pipes.length; i++){
					selectMode.pipes[i].mesh.material.color.setHex(selectMode.pipes[i].color)
				}
			} else {
				for (i = 0; i<selectMode.nodes.length; i++){
					context.visibleNodes.remove(selectMode.nodes[i].mesh);
					delete context.model.nodes[selectMode.nodes[i].uuid];
				}
				for (i = 0; i<selectMode.pipes.length; i++){
					context.visiblePipes.remove(selectMode.pipes[i].mesh);
					delete context.model.pipes[selectMode.pipes[i].uuid];
				}
			}
			
			selectMode.pElem.innerHTML = "";
			selectMode.nElem.innerHTML = "";
			
			selectMode.nodes = []
			selectMode.pipes = []
		}

		selectMode.onClick = function () {
			
			var i;
			
			if (context.selector.hoveredNode !== null) {
				
				context.selector.hoveredNode.mesh.material.color.setHex(0xff00ff);
				if (selectMode.nodes.indexOf(context.selector.hoveredNode) == -1){
					selectMode.addNode(context.selector.hoveredNode)
				}
			
			} else if (context.selector.hoveredPipe !== null) {
			
				context.selector.hoveredPipe.mesh.material.color.setHex(0xff00ff);
				if (selectMode.pipes.indexOf(context.selector.hoveredPipe) == -1) {
					selectMode.addPipe(context.selector.hoveredPipe);
				}
				
			} else {

				selectMode.clearSelection()
			}
			
		};

		selectMode.onKeyDown  = function (e) {
			if (e.keyCode == 46 || e.keyCode == 8) {
				selectMode.clearSelection(true)
			} else if (e.keyCode == 27) {
				context.viewMode.enter();
			}
		};

		selectMode.onFrame = function () {
			var mouseVector = new THREE.Vector3(context.mouseState.ndcX, context.mouseState.ndcY, 0);

			var raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(mouseVector.clone(), context.camera);
			
			context.selector.updateHover(raycaster);
		};

		return selectMode;

	};








	////////////////////////////////////////////////////

	PIPER.Context = function (targetElem) {
		this.container = targetElem;
		this.positioner = PositionerFactory(this);

		this.cameraO = new THREE.OrthographicCamera(1, 1, 1, 1, 0.1, 1000);
		this.cameraP = new THREE.PerspectiveCamera(15, 1, 0.1, 1000);
		this.camera = this.cameraO;

		this.mode = undefined;
		//this.previousMode = undefined;
		this.cursor = CursorFactory(this);
		this.selector = SelectorFactory(this);
		this.model = new PIPER.Model();

		this.mouseState = {x: 0, y: 0, right: false, left: false};
		
		this.units = "m"; //units used for display and input.  All calculations and storage based on meters.

		this.modeManager = ModeManagerFactory(this);

		this.createMode = CreateModeFactory(this);
		this.drawMode = DrawModeFactory(this);
		this.viewMode = ViewModeFactory(this);
		this.selectMode = SelectModeFactory(this);

		this.modeManager.addMode(this.createMode, document.getElementById("create-mode"), 67);
		this.modeManager.addMode(this.drawMode, document.getElementById("draw-mode"), 68);
		this.modeManager.addMode(this.viewMode, document.getElementById("view-mode"), 86);
		this.modeManager.addMode(this.selectMode, document.getElementById("select-mode"), 83);

		var ctx = this;

		document.addEventListener('mousemove', function (e) {
			var cp = PIPER.Calc.getCursorPosition(e);
			ctx.mouseState.x = cp[0];
			ctx.mouseState.ndcX = 2 * ((cp[0] - renderer.domElement.offsetLeft) / canvWidth) - 1;
			ctx.mouseState.y = cp[1];
			ctx.mouseState.ndcY = 1 - 2 * ((cp[1] - renderer.domElement.offsetTop) / canvHeight);
		}, false);


		var canvWidth, canvHeight, aspectRatio;

		var orthoWidth = 20;

		var renderer;

		if (window.WebGLRenderingContext) {
			renderer = new THREE.WebGLRenderer();
		} else {
			renderer = new THREE.CanvasRenderer();
		}

		renderer.setClearColor(0xffffff, 1);

		this.renderer = renderer;

		this.onResize = function () {

			canvWidth = targetElem.offsetWidth - 3;
			canvHeight = targetElem.offsetHeight - 4;
			aspectRatio = canvWidth / canvHeight;

			ctx.cameraP.aspect = aspectRatio;
			ctx.cameraP.updateProjectionMatrix();

			ctx.cameraO.left = orthoWidth / -2;
			ctx.cameraO.right = orthoWidth / 2;
			ctx.cameraO.top = orthoWidth / (2 * aspectRatio);
			ctx.cameraO.bottom = orthoWidth / (-2 * aspectRatio);
			ctx.cameraO.updateProjectionMatrix();

			renderer.setSize(canvWidth, canvHeight);

		};

		window.addEventListener('resize', ctx.onResize, false);


		targetElem.appendChild(renderer.domElement);

		var render = function (ctex) {

			var rdr = function () {

				ctex.mode.onFrame(ctex.mouseState);

				ctex.ctrlOtarget.position.copy(ctex.controlsO.target);
				ctex.ctrlPtarget.position.copy(ctex.controlsP.target);
				renderer.render(ctex.scene, ctex.camera);
				requestAnimationFrame(rdr);
			};

			rdr();

		};

		var clickHandle = function (e) {
			if (!e.ctrlKey) {
				ctx.mode.onClick(e);
			}
		};

		var keyDownHandle = function (e) {
			ctx.mode.onKeyDown(e);
			ctx.modeManager.onKeyDown(e);
		};

		var keyUpHandle = function (e) {};


		document.addEventListener("click", clickHandle, false);

		document.addEventListener("keydown", keyDownHandle, false);

		document.addEventListener("keyup", keyUpHandle, false);

		document.getElementById("file-box").addEventListener("click",
			function (e) { e.stopPropagation(); },
			false);

		document.getElementById("save-file").addEventListener("click",
			function (e) {
				e.stopPropagation();
				ctx.saveToFile();
			},
			false);

		document.getElementById("load-file").addEventListener("change",
			function (e) {
				e.stopPropagation();
				var file = this.files[0];
				ctx.loadFromFile(file);
			},
			false);
			
		document.getElementById("bottom-right").addEventListener("click",
			function (e) { e.stopPropagation(); },
			false
		);
		
		document.getElementById("selected-objects").addEventListener("click",
			function (e) { e.stopPropagation(); },
			false
		);
			
		document.getElementById("unit-selector").addEventListener("change",
			function (e) {
				ctx.units = this.value;
			},
			false);
			
		document.getElementById("camera-style").addEventListener("change",
			function (e) {
				ctx.setCamera(this.value);
			},
			false);


		this.initializeScene();
		this.onResize();
		this.viewMode.enter();
		this.modeManager.update();
		render(this);

	};

	PIPER.Context.prototype = {

		constructor: PIPER.Context,

		onFrame: function () {

			this.positioner.onFrame();

		},

		initializeScene: function () {

			this.scene = new THREE.Scene();

			this.visiblePipes = new THREE.Object3D();
			this.scene.add(this.visiblePipes);

			this.visibleNodes = new THREE.Object3D();
			this.scene.add(this.visibleNodes);

			var axisHelper = new THREE.AxisHelper(3);
			this.scene.add(axisHelper);

			var light = new THREE.PointLight(0xffffff);
			light.position.set(200, 200, 0);
			this.scene.add(light);

			var light2 = new THREE.PointLight(0x404040);
			light2.position.set(-200, -100, 0);
			this.scene.add(light2);

			this.cameraO.position.set(20, 20, 20);
			this.cameraP.position.set(20, 20, 20);
			this.cameraO.up = new THREE.Vector3(0, 1, 0);
			this.cameraP.up = new THREE.Vector3(0, 1, 0);
			this.cameraO.lookAt(new THREE.Vector3(0, 0, 0));
			this.cameraP.lookAt(new THREE.Vector3(0, 0, 0));

			this.controlsO = new THREE.OrbitControls(this.cameraO, this.container);
			this.controlsP =  new THREE.OrbitControls(this.cameraP, this.container);
			this.controlsO.enabled = false;
			this.controlsP.enabled = false;

			this.ctrlOtarget = new THREE.Mesh(new THREE.SphereGeometry(0.1));
			this.ctrlPtarget = new THREE.Mesh(new THREE.SphereGeometry(0.1));

			this.scene.add(this.ctrlOtarget);
			this.scene.add(this.ctrlPtarget);

		},

		zoomExtents: function () {
			var box = new THREE.Box3();
			box.setFromObject(ctx.visiblePipes);
			//zoom cameras
		},

		saveToFile: function () {
			var modelData = this.model.stringify();
			var blob = new Blob([modelData], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "newModel.pipe");

		},

		loadFromFile: function (file) {

			this.clearAll();

			var reader = new FileReader();
			var ctx = this;

			reader.onload = function () {

				ctx.model.loadJSON(reader.result);
				ctx.rebuildFromModel();

			};

			reader.readAsText(file);

		},

		clearDisplayElements: function () {
			var ctx = this
			THREE.Object3D.prototype.remove.apply(ctx.visiblePipes, ctx.visiblePipes.children);
			THREE.Object3D.prototype.remove.apply(ctx.visibleNodes, ctx.visibleNodes.children);
		},

		clearAll: function () {
			this.clearDisplayElements();
			this.model.clear();
		},

		rebuildFromModel: function () {

			var id;

			this.clearDisplayElements();

			var nodes = this.model.nodes;
			var pipes = this.model.pipes;

			for (id in nodes) {
				this.visibleNodes.add(nodes[id].makeMesh());
			}

			for (id in pipes) {
				this.visiblePipes.add(pipes[id].makeMesh());
			}
		},

		setCamera: function (camType) {
			if (camType == "p" && this.camera === this.cameraO) {
				this.controlsP.target.copy(this.controlsO.target);
				this.cameraP.lookAt(this.controlsO.target);
				this.camera = this.cameraP;
			} else if (camType == "o" && this.camera === this.cameraP){
				this.controlsO.target.copy(this.controlsP.target);
				this.cameraO.lookAt(this.controlsP.target);
				this.camera = this.cameraO;
			}
		}




	};






}(window.PIPER = window.PIPER || {}));