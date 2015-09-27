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

