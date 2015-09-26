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

