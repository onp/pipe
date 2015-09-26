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

