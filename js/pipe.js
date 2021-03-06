(function (PIPE, undefined) {
	"use strict";

////////////////////////////////////////////////////
// Positioner
var PositionerFactory = function (context) {
    
    //The positioner element maintains and allows editing of position data as
    //nodes and segments are being created.

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
    var diamElem = document.getElementById("diameter");
    positionSpecs.diameter = PIPE.defaultDiameter;
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
        //allow mode change events only to pass through.
        if ([27, 67, 68, 83, 86].indexOf(e.keyCode) == -1) {
            e.stopPropagation();
        }
    }, false);

    var checkSpecs = function () {
        for (i = 0; i < dims.length; i++) {
            if (positionSpecs[dims[i]] !== undefined && !markedActive[dims[i]]) {
                posElems[i].parentNode.classList.add("active");
                posElems[i].value = PIPE.calc.formatLength(positionSpecs[dims[i]], context.units);
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
                positionSpecs.l = 1;

            }

            posElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim], context.units);

            if (dim == 'l') {
                deltaElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim], context.units);
            } else {
                deltaElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim] - context.cursor.start[dim], context.units);
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
                positionSpecs[dim] = PIPE.calc.parseLength(elem.value, context.units);
                // add alert if parseLength returns null (bad format)
                deltaElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim] - context.cursor.start[dim], context.units);

            } else {
                if (dim == 'l') {
                    positionSpecs[dim] = PIPE.calc.parseLength(elem.value, context.units);
                    // add alert if parseLength returns null (bad format)

                } else {
                    positionSpecs[dim] = PIPE.calc.parseLength(elem.value, context.units) + context.cursor.start[dim];
                    // add alert if parseLength returns null (bad format)
                    posElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim], context.units);

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
        function (e) {
            var diam = PIPE.calc.parseLength(diamElem.value, context.units);
            positioner.positionSpecs.diameter = diam;

            context.cursor.setDiam(diam);
        },
        false
        );




    positioner.onFrame = function () {
        checkSpecs();

        var i;

        for (i = 0; i < dims.length; i++) {
            if (positionSpecs[dims[i]] === undefined) {
                posElems[i].value = PIPE.calc.formatLength(context.cursor.target[dims[i]], context.units);

                if (deltaVisible) {
                    deltaElems[i].value = PIPE.calc.formatLength((dims[i] == "l") ? context.cursor.diff.length() : context.cursor.diff[dims[i]], context.units);
                    if (document.activeElement !== diamElem) {
                        diamElem.value = PIPE.calc.formatLength(positionSpecs.diameter, context.units);
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
        positionSpecs.diameter = PIPE.defaultDiameter;

    };


    return positioner;
};

////////////////////////////////////////////////////
// Cursor

var CursorFactory = function (context) {
    var cursor = {};

    cursor.node = new PIPE.Node(new THREE.Vector3(0, 1, 0));
    cursor.segment = new PIPE.Segment(cursor.node);
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
        cursor.node.position.copy(pos);
        cursor.update();
    };

    cursor.setStart = function (startNode) {
        if (startNode === undefined) {
            cursor.start = undefined;
            cursor.group.remove(cursor.segment.mesh);
            cursor.group.remove(cursor.angleHatching);
            return;
        }

        cursor.segment.node2 = startNode || cursor.segment.node2;

        if (cursor.start === undefined) {
            cursor.setDiam(context.positioner.positionSpecs.diameter);
            cursor.group.add(cursor.segment.mesh);
            cursor.group.add(cursor.angleHatching);
        }

        cursor.start = cursor.segment.node2.mesh.position;
        cursor.diff.subVectors(cursor.target, cursor.start);
        cursor.segment.updateMesh();
        cursor.angleHatching.position.copy(cursor.start);

    };

    cursor.setDiam = function (diam) {
        cursor.segment.setDiameter(diam);
        cursor.node.setScale();
    };

    cursor.update = function () {
        if (cursor.start === undefined) { return; }
        if (cursor.start.equals(cursor.target)) {
            cursor.hide();
        } else {
            cursor.show();
        }

        cursor.segment.updateMesh();

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

    selector.clearHovers = function () {
        // clear existing hovers

        if (selector.hoveredPipe !== null) {
            if (selector.hoveredPipe.mesh.material.color.getHex() == 0x0000ff) {
                selector.hoveredPipe.mesh.material.color.setHex(selector.hoveredPipe.color);
                context.selectMode.clearHover();
            }
        }

        if (selector.hoveredNode !== null) {
            if (selector.hoveredNode.mesh.material.color.getHex() == 0x0000ff) {
                selector.hoveredNode.mesh.material.color.setHex(selector.hoveredNode.color);
                context.selectMode.clearHover();
            }
        }
    };

    selector.updateHover = function (raycaster) {
        var pipeIntersects = raycaster.intersectObjects(context.visiblePipes.children);
        var nodeIntersects = raycaster.intersectObjects(context.visibleNodes.children);

        selector.clearHovers();

        // color new hovers

        if (pipeIntersects.length > 0) {

            selector.hoveredPipe = pipeIntersects[0].object.userData.owner;
            if (selector.hoveredPipe.color == selector.hoveredPipe.mesh.material.color.getHex()) {
                pipeIntersects[0].object.material.color.setHex(0x0000ff);
                context.selectMode.hoverPipe(selector.hoveredPipe);
            }

        } else {
            selector.hoveredPipe = null;
        }

        if (nodeIntersects.length > 0) {

            selector.hoveredNode = nodeIntersects[0].object.userData.owner;
            console.log(selector.hoveredNode.analyzeConnections())
            if (selector.hoveredNode.color == selector.hoveredNode.mesh.material.color.getHex()) {
                nodeIntersects[0].object.material.color.setHex(0x0000ff);
                console.log("hi")
                context.selectMode.hoverNode(selector.hoveredNode,"hovered");
            }

        } else {
            selector.hoveredNode = null;
        }
    };



    return selector;
};

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
        context.cursor.node.setScale(context.positioner.positionSpecs.diameter);

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
                //do something?
        } else {

            var newNode = new PIPE.Node(context.cursor.target.clone());

            context.model.nodes[newNode.uuid] = newNode;

            context.visibleNodes.add(newNode.makeMesh());

            context.drawMode.enter(newNode);

        }
    };

    createMode.onFrame = function (e) {

        var mouseVector = new THREE.Vector3(context.mouseState.ndcX, context.mouseState.ndcY, 0);

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVector.clone(), context.camera);

        var iPoint = PIPE.calc.constrainedPoint(raycaster, context.positioner.positionSpecs);

        context.selector.updateHover(raycaster);

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
        context.positioner.positionSpecs.diameter = currNode.scale;

        context.mode = drawMode;
        this.state = "on";

        sourceNode = currNode;

        context.cursor.setStart(sourceNode);
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

            newNode = new PIPE.Node(context.cursor.target.clone());
            context.model.nodes[newNode.uuid] = newNode;
            context.visibleNodes.add(newNode.makeMesh());

        }

        context.cursor.setStart();

        var d = context.positioner.positionSpecs.diameter;
        var newPipe = new PIPE.Segment(sourceNode, newNode, d);
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
            context.cursor.setTarget(context.selector.hoveredNode.mesh.position.clone());
        } else {
            var pt = PIPE.calc.constrainedPoint(raycaster, context.positioner.positionSpecs, sourceNode.mesh.position.clone());
            context.cursor.setTarget(pt);
        }

        context.positioner.onFrame();

    };

    drawMode.onKeyDown = function (e) {
        var k = e.keyCode;
        if (k == 27) {
            context.viewMode.enter();
        } else {
            var le = context.positioner.lengthElem;
            if (document.activeElement === le) {
                return;
            }
            if (k >= 96 && k <= 105) {
                k -= 48;  //make numpad and main numkey values match
            }
            if ((k >= 48 && k <= 57) || k == 32 || k == 222) {
                le.focus();
                if (typeof window.Event == 'function'){
                    var ee = new Event('Focus')
                    
                } else {
                    var ee = document.createEvent('FocusEvent')
                    ee.initFocusEvent('focus',true,true,null,5,le)
                }
                
                le.dispatchEvent(ee);
                le.value = "";

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
        pipes: [],
        hoveredPipe: null,
        hoveredNode: null
    };


    selectMode.elem = document.getElementById("selected-objects");
    selectMode.pElem = document.getElementById("selected-pipes");
    selectMode.nElem = document.getElementById("selected-nodes");
    
    selectMode.pElem.parentNode.classList.add("hidden")
    selectMode.nElem.parentNode.classList.add("hidden")


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
    
    selectMode.generateNodeElem = function (sNode) {
        
        var elem = document.createElement("tr");
        elem.classList.add("obj");
        elem.innerHTML = "<td>" +
                        sNode.uuid.slice(0, 8) + "</td><td>" +
                        sNode.name + "</td><td>" +
                        PIPE.calc.formatLength(sNode.position.x, context.units) + "</td><td>" +
                        PIPE.calc.formatLength(sNode.position.y, context.units) + "</td><td>" +
                        PIPE.calc.formatLength(sNode.position.z, context.units) + 
                        "</td>";

        
        
        var typeSelector = document.createElement("select");
        typeSelector.innerHTML = "<option value='node'>node</option>" +
                                 "<option value='gate'>gate</option>" +
                                 "<option value='globe'>globe</option>";
        typeSelector.addEventListener("change",
            function (e) {
                sNode.switchType(e.target.value);
            },
            false);
        typeSelector.value = sNode.nodeType;
        var tsCont = document.createElement("td");
        elem.appendChild(tsCont);
        tsCont.appendChild(typeSelector);
        
        return elem;
        
    }
    
    selectMode.generatePipeElem = function (sPipe) {
        
        var elem = document.createElement("tr");
        elem.classList.add("obj");
        elem.innerHTML = "<td>" +
                        sPipe.uuid.slice(0, 8) + "</td><td>" +
                        sPipe.name + "</td><td>" +
                        //sPipe.node1.uuid.slice(0, 8) + "</td><td>" +
                        //sPipe.node2.uuid.slice(0, 8) + "</td><td>" +
                        PIPE.calc.formatLength(sPipe.length(), context.units) +
                        "</td>";

        var diamSetter = document.createElement("input");
        diamSetter.addEventListener("input",
            function (e) {
                var diam = PIPE.calc.parseLength(e.target.value, context.units);
                sPipe.setDiameter(diam);
            },
            false);

        diamSetter.value = PIPE.calc.formatLength(sPipe.diameter, context.units);
        var dsCont = document.createElement("td");
        elem.appendChild(dsCont);
        dsCont.appendChild(diamSetter);
        
        return elem
        
    }
    
    selectMode.hoverNode = function (sNode) {
        if (selectMode.nodes.indexOf(sNode) == -1) {
            
            selectMode.nElem.parentNode.classList.remove("hidden")
            
            var elem = selectMode.generateNodeElem(sNode)
            
            selectMode.nElem.appendChild(elem);
            
            selectMode.hoveredNode = elem;
        }
    }
    
    selectMode.hoverPipe = function (sPipe){
        
        if (selectMode.pipes.indexOf(sPipe) == -1) {
            
            selectMode.pElem.parentNode.classList.remove("hidden");
            
            var elem = selectMode.generatePipeElem(sPipe);
            
            selectMode.pElem.appendChild(elem);
            
            selectMode.hoveredPipe = elem;
            
        }
        
    }
    
    selectMode.addNode = function (sNode) {
        
        selectMode.clearHover();
        
        selectMode.nElem.parentNode.classList.remove("hidden")
        
        var elem = selectMode.generateNodeElem(sNode)
        
        selectMode.nElem.appendChild(elem);
        
        selectMode.nodes.push(sNode);
    };

    selectMode.addPipe = function (sPipe) {
        
        selectMode.clearHover();
        
        selectMode.pElem.parentNode.classList.remove("hidden");

        var elem = selectMode.generatePipeElem(sPipe);
        
        selectMode.pElem.appendChild(elem);
        
        selectMode.pipes.push(sPipe);
    };
    
    selectMode.deleteSelection = function () {
        var i;
        
        for (i = 0; i < selectMode.nodes.length; i++) {
            context.visibleNodes.remove(selectMode.nodes[i].mesh);
            delete context.model.nodes[selectMode.nodes[i].uuid];
        }
        
        for (i = 0; i < selectMode.pipes.length; i++) {
            context.visiblePipes.remove(selectMode.pipes[i].mesh);
            context.model.pipes[selectMode.pipes[i].uuid].breakConnections();
            delete context.model.pipes[selectMode.pipes[i].uuid];
        }
        
        selectMode.clearDisplay();
        
    }
    
    selectMode.clearHover = function () {
        if (selectMode.hoveredPipe !== null){
            selectMode.pElem.removeChild(selectMode.hoveredPipe);
            selectMode.hoveredPipe = null;
        }

        if (selectMode.hoveredNode !== null){
            selectMode.nElem.removeChild(selectMode.hoveredNode);
            selectMode.hoveredNode = null;
        }
        
        if (selectMode.pipes.length < 1){
            selectMode.pElem.parentNode.classList.add("hidden")
        }

        if (selectMode.nodes.length < 1){
            selectMode.nElem.parentNode.classList.add("hidden")
        }
        
    }

    selectMode.clearSelection = function () {
        var i;

        for (i = 0; i < selectMode.nodes.length; i++) {
            selectMode.nodes[i].mesh.material.color.setHex(selectMode.nodes[i].color);
        }
        for (i = 0; i < selectMode.pipes.length; i++) {
            selectMode.pipes[i].mesh.material.color.setHex(selectMode.pipes[i].color);
        }
        
        selectMode.clearDisplay();

    };
    
    selectMode.clearDisplay = function () {
        
        selectMode.pElem.innerHTML = "";
        selectMode.nElem.innerHTML = "";
        
        selectMode.pElem.parentNode.classList.add("hidden")
        selectMode.nElem.parentNode.classList.add("hidden")

        selectMode.nodes = [];
        selectMode.pipes = [];
    }

    selectMode.onClick = function () {

        var i;

        if (context.selector.hoveredNode !== null) {

            context.selector.hoveredNode.mesh.material.color.setHex(0xff00ff);
            if (selectMode.nodes.indexOf(context.selector.hoveredNode) == -1) {
                selectMode.addNode(context.selector.hoveredNode);
            }

        } else if (context.selector.hoveredPipe !== null) {

            context.selector.hoveredPipe.mesh.material.color.setHex(0xff00ff);
            if (selectMode.pipes.indexOf(context.selector.hoveredPipe) == -1) {
                selectMode.addPipe(context.selector.hoveredPipe);
            }

        } else {

            selectMode.clearSelection();
        }

    };

    selectMode.onKeyDown  = function (e) {
        if (e.keyCode == 46 || e.keyCode == 8) {
            if (document.activeElement.tagName !== "INPUT") {
                selectMode.deleteSelection();
            }
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

PIPE.Context = function (targetElem) {
    this.container = targetElem;
    this.positioner = PositionerFactory(this);

    this.cameraO = new THREE.OrthographicCamera(1, 1, 1, 1, 0.1, 3000);
    this.cameraP = new THREE.PerspectiveCamera(15, 1, 0.1, 8000);
    this.camera = this.cameraO;

    this.mode = undefined;
    //this.previousMode = undefined;
    this.cursor = CursorFactory(this);
    this.selector = SelectorFactory(this);
    this.model = new PIPE.Model();

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
        var cp = PIPE.calc.getCursorPosition(e);
        ctx.mouseState.x = cp[0];
        ctx.mouseState.ndcX = 2 * ((cp[0] - renderer.domElement.offsetLeft) / ctx.canvWidth) - 1;
        ctx.mouseState.y = cp[1];
        ctx.mouseState.ndcY = 1 - 2 * ((cp[1] - renderer.domElement.offsetTop) / ctx.canvHeight);
    }, false);

    this.orthoWidth = 20;

    var renderer;

    if (window.WebGLRenderingContext) {
        renderer = new THREE.WebGLRenderer({antialias: true});
    } else {
        renderer = new THREE.CanvasRenderer();
    }

    renderer.setClearColor(0xffffff, 1);

    this.renderer = renderer;

    this.onResize = function () {

        ctx.canvWidth = targetElem.offsetWidth - 3;
        ctx.canvHeight = targetElem.offsetHeight - 4;
        ctx.aspectRatio = ctx.canvWidth / ctx.canvHeight;

        ctx.cameraP.aspect = ctx.aspectRatio;
        ctx.cameraP.updateProjectionMatrix();

        ctx.cameraO.left = ctx.orthoWidth / -2;
        ctx.cameraO.right = ctx.orthoWidth / 2;
        ctx.cameraO.top = ctx.orthoWidth / (2 * ctx.aspectRatio);
        ctx.cameraO.bottom = ctx.orthoWidth / (-2 * ctx.aspectRatio);
        ctx.cameraO.updateProjectionMatrix();

        renderer.setSize(ctx.canvWidth, ctx.canvHeight);

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
            PIPE.loadFromFile(file,ctx);
        },
        false);

    document.getElementById("bottom-right").addEventListener("click",
        function (e) { e.stopPropagation(); },
        false);

    document.getElementById("selected-objects").addEventListener("click",
        function (e) { e.stopPropagation(); },
        false);

    document.getElementById("unit-selector").addEventListener("change",
        function (e) {
            ctx.units = this.value;
        },
        false);

    document.getElementById("show-helpers").addEventListener("change",
        function (e) {
            ctx.setHelpers(this.value);
        },
        false);

    document.getElementById("reset-view").addEventListener("click",
        function (e) {
            //var pos = new THREE.Vector3(-20, 20, 20);
            //var lookAt = new THREE.Vector3();

            //ctx.setView(pos,lookAt);
            ctx.centerView();
        });

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

PIPE.Context.prototype = {

    constructor: PIPE.Context,

    onFrame: function () {

        this.positioner.onFrame();

    },

    initializeScene: function () {

        this.scene = new THREE.Scene();

        this.visiblePipes = new THREE.Object3D();
        this.scene.add(this.visiblePipes);

        this.visibleNodes = new THREE.Object3D();
        this.scene.add(this.visibleNodes);

        this.helpers = {};

        this.helpers.axisHelper = new THREE.AxisHelper(3);
        this.scene.add(this.helpers.axisHelper);

        var north = new THREE.Vector3(1, 0, 0);
        var arrowPosition = new THREE.Vector3(0, 4, 0);
        this.helpers.northArrow = new THREE.ArrowHelper(north, arrowPosition, 2, 0xaa2222);
        this.scene.add(this.helpers.northArrow);

        var canvas1 = document.createElement('canvas');
        canvas1.height = 300;
        canvas1.width = 260;
        var context1 = canvas1.getContext('2d');
        context1.font = "Bold 300px Arial";
        context1.fillStyle = "rgba(255,0,0,0.95)";
        context1.fillText("N", 0, 300);
        var texture1 = new THREE.Texture(canvas1);
        texture1.minFilter = THREE.NearestFilter;
        texture1.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({ map: texture1, color: 0xaa2222});
        this.helpers.nSprite = new THREE.Sprite(spriteMaterial);
        this.helpers.nSprite.position.set(3, 4, 0);
        this.scene.add(this.helpers.nSprite);


        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 0);
        this.scene.add(light);

        var light2 = new THREE.DirectionalLight(0x606060);
        light2.position.set(-1, -1, 0);
        this.scene.add(light2);

        this.cameraO.up = new THREE.Vector3(0, 1, 0);
        this.cameraP.up = new THREE.Vector3(0, 1, 0);
        
        this.controlsO = new THREE.OrbitControls(this.cameraO, this.container);
        this.controlsP =  new THREE.OrbitControls(this.cameraP, this.container);
        this.controlsO.enabled = false;
        this.controlsP.enabled = false;

        this.setView(new THREE.Vector3(-20, 20, 20), new THREE.Vector3());

        this.helpers.bbHelper = new THREE.BoundingBoxHelper(this.visibleNodes, 0x000000);
        this.scene.add(this.helpers.bbHelper);

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

    clearDisplayElements: function () {
        var ctx = this;
        THREE.Object3D.prototype.remove.apply(ctx.visiblePipes, ctx.visiblePipes.children);
        THREE.Object3D.prototype.remove.apply(ctx.visibleNodes, ctx.visibleNodes.children);
    },

    clearAll: function () {
        this.clearDisplayElements();
        this.model.clear();
    },

    setView: function (position, lookAt) {
        //position and lookAt are THREE.Vector3
        var camOpos = new THREE.Vector3().subVectors(position, lookAt).normalize().multiplyScalar(1500).add(lookAt);

        this.cameraO.position.copy(camOpos);
        this.cameraP.position.copy(position);
        this.cameraO.lookAt(lookAt);
        this.cameraP.lookAt(lookAt);
        this.controlsO.target.copy(lookAt);
        this.controlsP.target.copy(lookAt);
        this.cameraO.zoom = 1;
        this.cameraO.updateProjectionMatrix();
    },

    centerView: function () {
        var box = new THREE.Box3();
        box.setFromObject(this.visibleNodes);
        this.setView(box.center().add(new THREE.Vector3(-20, 20, 20)), box.center());

        var size = box.size().length();

        var zoom;

        if (this.aspectRatio > 1) {
            zoom = this.orthoWidth / this.aspectRatio / size;
        } else {
            zoom = this.orthoWidth / size;
        }

        this.cameraO.zoom = zoom;
        this.cameraO.updateProjectionMatrix();

        this.helpers.bbHelper.update();

    },

    setHelpers: function (helpers) {
        if (helpers == "none") {
            this.scene.remove(this.helpers.bbHelper);
            this.scene.remove(this.helpers.northArrow);
            this.scene.remove(this.helpers.nSprite);
            this.scene.remove(this.helpers.axisHelper);
            this.scene.remove(this.ctrlOtarget);
            this.scene.remove(this.ctrlPtarget);
        } else if (helpers == "all") {
            this.scene.add(this.helpers.bbHelper);
            this.scene.add(this.helpers.northArrow);
            this.scene.add(this.helpers.nSprite);
            this.scene.add(this.helpers.axisHelper);
            this.scene.add(this.ctrlOtarget);
            this.scene.add(this.ctrlPtarget);
        }else if (helpers == "no-box") {
            this.scene.remove(this.helpers.bbHelper);
            this.scene.add(this.helpers.northArrow);
            this.scene.add(this.helpers.nSprite);
            this.scene.add(this.helpers.axisHelper);
            this.scene.add(this.ctrlOtarget);
            this.scene.add(this.ctrlPtarget);
        }
        
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
        } else if (camType == "o" && this.camera === this.cameraP) {
            this.controlsO.target.copy(this.controlsP.target);
            this.cameraO.lookAt(this.controlsP.target);
            this.camera = this.cameraO;
        }
    }

};

var loadPipe = {}

loadPipe.test = /\.pipe$/i

loadPipe.func = function (file,ctx) {

    var reader = new FileReader();

    reader.onload = function () {

        ctx.model.loadJSON(reader.result);
        ctx.rebuildFromModel();
        ctx.centerView();

    };

    reader.readAsText(file);

}

PIPE.fileLoaders = [
    loadPipe
];

PIPE.loadFromFile = function (file,context){
    
    var i;
    
    context.clearAll();
    
    for (i=0; i<PIPE.fileLoaders.length; i++){
        var ld = PIPE.fileLoaders[i];
        if (ld.test.exec(file.name)){
            ld.func(file,context);
            return
        }
    }
    console.error("file type not recognized.")

}


}(window.PIPE = window.PIPE || {}));