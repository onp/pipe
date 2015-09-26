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

