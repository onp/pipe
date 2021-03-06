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

