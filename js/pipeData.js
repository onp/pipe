//Define: X = NORTH
//        Y = UP
//        Z = EAST

(function (PIPER, undefined) {
    "use strict";

	var defaultDiameter = 0.102;
	PIPER.defaultDiameter = 0.102;

	var nodeGeometry = new THREE.SphereGeometry(1/2);
	var nodeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
	var segmentMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});

	// Geometries ////////////////////////////////////////////
	
	PIPER.globeGeometry = (function (){
		var t = new THREE.Matrix4()
		
		//body
		var s = new THREE.SphereGeometry(0.8)

		//riser
		var c1 = new THREE.CylinderGeometry(0.5,0.7,1)
		c1.applyMatrix(t.makeTranslation(0,0.5,0))
		s.merge(c1)

		//top flange
		var c2 = new THREE.CylinderGeometry(0.8,0.8,0.2)
		c2.applyMatrix(t.makeTranslation(0,1.1,0))
		s.merge(c2)
		
		//stem
		var c3 = new THREE.CylinderGeometry(0.15,0.15,1.2)
		c3.applyMatrix(t.makeTranslation(0,1.8,0))
		s.merge(c3)
		
		return s
	})()
	
	PIPER.gateGeometry = (function (){
		var g = new THREE.Geometry()
		
		//body
		g.vertices.push(
			new THREE.Vector3(-0.6,-0.6,  0.3),
			new THREE.Vector3(-0.6,-0.6, -0.3),
			new THREE.Vector3( 0.6,-0.6, -0.3),
			new THREE.Vector3( 0.6,-0.6,  0.3),
			
			new THREE.Vector3( 0.7, 1.2,  0.6),
			new THREE.Vector3( 0.7, 1.2, -0.6),
			
			new THREE.Vector3(-0.7, 1.2,  0.6),
			
			new THREE.Vector3(-0.7, 1.2, -0.6)
			
		)
		
		g.faces.push(new THREE.Face3(0,1,2))
		g.faces.push(new THREE.Face3(0,2,3))
		
		g.faces.push(new THREE.Face3(2,4,3))
		g.faces.push(new THREE.Face3(2,5,4))
		
		g.faces.push(new THREE.Face3(3,4,6))
		g.faces.push(new THREE.Face3(0,3,6))
		
		g.faces.push(new THREE.Face3(0,6,1))
		g.faces.push(new THREE.Face3(1,6,7))
		
		g.faces.push(new THREE.Face3(1,7,5))
		g.faces.push(new THREE.Face3(1,5,2))
		
		g.faces.push(new THREE.Face3(4,5,6))
		g.faces.push(new THREE.Face3(5,7,6))
		
		g.computeFaceNormals();
		
		//stem
		var c3 = new THREE.CylinderGeometry(0.15,0.15,1.5)
		var t = new THREE.Matrix4()
		c3.applyMatrix(t.makeTranslation(0,1.95,0))
		
		g.merge(c3)
		
		return g
	})()


	// Model //////////////////////////////////////////////////

	PIPER.Model = function () {
		this.pipes = {};
		this.nodes = {};
	};

	PIPER.Model.prototype = {

		toJSON: function () {
			var id;
			
			var pipeJSON = [];
			var nodeJSON = [];

			for (id in this.pipes) {
				pipeJSON.push(this.pipes[id].toJSON());
			}

			for (id in this.nodes) {
				nodeJSON.push(this.nodes[id].toJSON());
			}

			return {pipes: pipeJSON, nodes: nodeJSON};

		},

		stringify: function () {
			return JSON.stringify(this.toJSON());
		},

		loadJSON: function (data) {

			var jsonModel = JSON.parse(data);
			var i;

			for (i = 0; i < jsonModel.nodes.length; i++) {

				var nodeData = jsonModel.nodes[i];
				var newNode = new PIPER.Node(
					new THREE.Vector3(
						nodeData.position.north,
						nodeData.position.elevation,
						nodeData.position.east
					),
					nodeData.uuid,
					nodeData.type
				);

				this.nodes[nodeData.uuid] = newNode;

			}

			for (i = 0; i < jsonModel.pipes.length; i++) {

				var pipeData = jsonModel.pipes[i];

				var newPipe = new PIPER.Segment(
					this.nodes[pipeData.node1],
					this.nodes[pipeData.node2],
					pipeData.d1,
					pipeData.uuid
				);

				this.pipes[pipeData.uuid] = newPipe;

			}


		},

		clear: function () {

			this.nodes = {};
			this.pipes = {};

		}

	};

	// Segment //////////////////////////////////////////////////////////

	PIPER.Segment = function (node1, node2, diameter, uuid) {
		this.node1 = node1;
		this.node2 = node2 || new PIPER.Node(new THREE.Vector3());

		this.diameter = diameter || defaultDiameter;
		
		this.uuid = uuid || THREE.Math.generateUUID();
		this.color = 0x00ff00;
		
		this.node1.addConnection(this);
		this.node2.addConnection(this);

	};

	PIPER.Segment.prototype = {

		constructor: PIPER.Segment,

		mesh: undefined,

		makeMesh: function () {

			if (this.mesh === undefined) {
				var segmentGeometry = new THREE.CylinderGeometry(this.diameter/2, this.diameter/2, 1);
				var cTrans = new THREE.Matrix4()
				segmentGeometry.applyMatrix(cTrans.makeTranslation(0, 0.5, 0));
				segmentGeometry.applyMatrix(cTrans.makeRotationX(Math.PI / 2));
				
				this.mesh = new THREE.Mesh(segmentGeometry, segmentMaterial.clone());
				this.mesh.position.copy(this.node1.position);
				this.mesh.scale.set(1, 1, this.node2.position.clone().sub(this.node1.position).length());
				this.mesh.lookAt(this.node2.position);
				this.mesh.userData.owner = this;
			}

			return this.mesh;

		},
		
		length: function () {
			var diff = new THREE.Vector3()
			diff.subVectors(this.node1.position,this.node2.position)
			return diff.length()
		},

		hide: function () {

			if (this.mesh !== undefined) {

				if (this.mesh.parent !== undefined) {

					this.mesh.parent.remove(this.mesh);

				}
			}
		},

		toJSON: function () {

			return { node1: this.node1.uuid, node2: this.node2.uuid, d1: this.diameter, uuid: this.uuid };

		}

	};


	// Node /////////////////////////////////////////////////////////////

	PIPER.Node = function (position, uuid,type) {

		this.position = position;
		this.uuid = uuid || THREE.Math.generateUUID();
		this.color = 0xff0000;
		this.nodeType = type || "node";
		this.connections = [];
		this.scale = 1;
		this.lookAt = new THREE.Vector3()

	};

	PIPER.Node.prototype = {

		constructor: PIPER.Node,

		mesh: undefined,

		makeMesh: function () {

			if (this.mesh === undefined) {
				this.mesh = new THREE.Mesh();
				this.mesh.material = nodeMaterial.clone();
				this.mesh.position.copy(this.position);
				this.mesh.userData.owner = this;
				this.switchType(this.nodeType);
				this.setScale();
			}
			
			return this.mesh;

		},
		
		switchType: function(newType){
			if (newType == "gate"){
				this.mesh.geometry = PIPER.gateGeometry.clone()
				this.nodeType = "gate"
			} else if (newType == "globe"){
				this.mesh.geometry = PIPER.globeGeometry.clone()
				this.nodeType = "globe"
			} else {
				//default to standard node.
				this.mesh.geometry = nodeGeometry.clone()
				this.nodeType = "node"
			}
		},
		
		addConnection: function(newConnection){
			if (this.connections.indexOf(newConnection) == -1) {
				this.connections.push(newConnection);
			}
			this.setScale();
		},
		
		setScale: function(scale){
			if (scale !== undefined){
				this.scale = scale
			} else {
				var i;
				this.scale = 0;
				for (i = 0; i< this.connections.length; i++) {
					if (this.connections[i].diameter > this.scale){
						this.scale = this.connections[i].diameter
					}
				}
				
				if (this.scale == 0) {
					this.scale = defaultDiameter
				}
			}
			if (this.connections[0] !== undefined){
				if (this.connections[0].node1 === this){
					this.lookAt.copy(this.connections[0].node2.position)
				} else if (this.connections[0].node2 === this){
					this.lookAt.copy(this.connections[0].node1.position)
				}
			}
			
			if (this.mesh !==undefined) {
				this.mesh.scale.set(this.scale,this.scale,this.scale)
				this.mesh.lookAt(this.lookAt)
			}
			
		},

		hide: function () {

			if (this.mesh !== undefined) {

				if (this.mesh.parent !== undefined) {

					this.mesh.parent.remove(this.mesh);

				}
			}
		},

		toJSON: function () {
			var rep = {}
			
			rep.uuid = this.uuid
			rep.position = {north: this.position.x, elevation: this.position.y, east: this.position.z}
			rep.type = this.nodeType
			return rep;

		}

	};





}(window.PIPER = window.PIPER || {}));