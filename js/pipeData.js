//Define: X = NORTH
//        Y = UP
//        Z = EAST

(function (PIPE, undefined) {
    "use strict";

	// Model //////////////////////////////////////////////////

	PIPE.Model = function () {
		this.pipes = {};
		this.nodes = {};
	};

	PIPE.Model.prototype = {

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
				var newNode = new PIPE.Node(
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

				var newPipe = new PIPE.Segment(
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

	PIPE.Segment = function (node1, node2, diameter, uuid, name) {
		this.node1 = node1;
		this.node2 = node2 || new PIPE.Node(new THREE.Vector3());

		this.diameter = diameter || PIPE.defaultDiameter;

		this.uuid = uuid || THREE.Math.generateUUID();
		this.color = 0x00ff00;

		this.name = name;

		this.node1.addConnection(this);
		this.node2.addConnection(this);

	};

	PIPE.Segment.prototype = {

		constructor: PIPE.Segment,

		mesh: undefined,

		makeMesh: function () {

			if (this.mesh === undefined) {
				var geom = PIPE.geom.segment.clone();
				var mat = PIPE.mat.segment.clone();

				this.mesh = new THREE.Mesh(geom, mat);
				this.mesh.userData.owner = this;
				this.updateMesh();
			}

			return this.mesh;

		},

		updateMesh: function () {
			this.mesh.position.copy(this.node1.position);
			this.mesh.scale.set(this.diameter, this.diameter, this.length());

			this.mesh.lookAt(this.node2.position);
		},

		setDiameter: function (diam) {
			this.diameter = diam;
			this.node1.setScale();
			this.node2.setScale();
			this.updateMesh();
		},

		length: function () {
			var diff = new THREE.Vector3();
			diff.subVectors(this.node1.position, this.node2.position);
			return diff.length();
		},

		hide: function () {

			if (this.mesh !== undefined) {

				if (this.mesh.parent !== undefined) {

					this.mesh.parent.remove(this.mesh);

				}
			}
		},

		toJSON: function () {

			return { node1: this.node1.uuid, node2: this.node2.uuid, d1: this.diameter, uuid: this.uuid, name: this.name };

		}

	};


	// Node /////////////////////////////////////////////////////////////

	PIPE.Node = function (position, uuid, type, name) {

		this.position = position;
		this.uuid = uuid || THREE.Math.generateUUID();
		this.color = 0xff0000;
		this.name = name;

		this.nodeType = type || "node";
		this.connections = [];
		this.scale = 1;
		this.lookAt = new THREE.Vector3();

	};

	PIPE.Node.prototype = {

		constructor: PIPE.Node,

		mesh: undefined,

		makeMesh: function () {

			if (this.mesh === undefined) {
				this.mesh = new THREE.Mesh();
				this.mesh.material = PIPE.mat.node.clone();
				this.mesh.position.copy(this.position);
				this.mesh.userData.owner = this;
				this.switchType(this.nodeType);
				this.setScale();
			}

			return this.mesh;

		},

		switchType: function (newType) {
			if (newType == "gate") {
				this.mesh.geometry = PIPE.geom.gateValve.clone();
				this.nodeType = "gate";
			} else if (newType == "globe") {
				this.mesh.geometry = PIPE.geom.globeValve.clone();
				this.nodeType = "globe";
			} else {
				//default to standard node.
				this.mesh.geometry = PIPE.geom.node.clone();
				this.nodeType = "node";
			}
		},

		addConnection: function (newConnection) {
			if (this.connections.indexOf(newConnection) == -1) {
				this.connections.push(newConnection);
			}
			this.setScale();
		},

		setScale: function (scale) {
			if (scale !== undefined) {
				this.scale = scale;
			} else {
				var i;
				this.scale = 0;
				for (i = 0; i < this.connections.length; i++) {
					if (this.connections[i].diameter > this.scale) {
						this.scale = this.connections[i].diameter;
					}
				}

				if (this.scale == 0) {
					this.scale = PIPE.defaultDiameter;
				}
			}

			//rotate the node if it has connections
			if (this.connections[0] !== undefined) {
				if (this.connections[0].node1 === this) {
					this.lookAt.copy(this.connections[0].node2.position);
				} else if (this.connections[0].node2 === this) {
					this.lookAt.copy(this.connections[0].node1.position);
				}
			}

			// scale the node's mesh, if it exists.
			if (this.mesh !== undefined) {
				this.mesh.scale.set(this.scale, this.scale, this.scale);
				this.mesh.lookAt(this.lookAt);
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
			var rep = {};

			rep.uuid = this.uuid;
			rep.position = {north: this.position.x, elevation: this.position.y, east: this.position.z};
			rep.type = this.nodeType;
			rep.name = this.name;
			return rep;

		}

	};





}(window.PIPE = window.PIPE || {}));