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

