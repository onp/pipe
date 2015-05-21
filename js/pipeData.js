//Define: X = NORTH
//        Y = UP
//        Z = EAST

(function (PIPER, undefined) {
    "use strict";

	var defaultDiameter = 0.1;

	var nodeGeometry = new THREE.SphereGeometry(defaultDiameter);
	var nodeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});

	var segmentGeometry = new THREE.CylinderGeometry(defaultDiameter, defaultDiameter, 1);
	var cTrans = new THREE.Matrix4();
	segmentGeometry.applyMatrix(cTrans.makeTranslation(0, 0.5, 0));
	segmentGeometry.applyMatrix(cTrans.makeRotationX(Math.PI / 2));
	var segmentMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});

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
					nodeData.uuid
				);

				this.nodes[nodeData.uuid] = newNode;

			}

			for (i = 0; i < jsonModel.pipes.length; i++) {

				var pipeData = jsonModel.pipes[i];

				var newPipe = new PIPER.Segment(
					this.nodes[pipeData.node1],
					this.nodes[pipeData.node2],
					pipeData.d1,
					pipeData.d2,
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

	PIPER.Segment = function (node1, node2, diameter1, diameter2, uuid) {
		this.node1 = node1;
		this.node2 = node2 || new PIPER.Node(new THREE.Vector3());
		this.diameter1 = diameter1 || defaultDiameter;
		this.diameter2 = diameter2 || diameter1 || defaultDiameter;
		this.uuid = uuid || THREE.Math.generateUUID();
		this.color = 0x00ff00;

	};

	PIPER.Segment.prototype = {

		constructor: PIPER.Segment,

		mesh: undefined,

		makeMesh: function () {

			if (this.mesh === undefined) {
				this.mesh = new THREE.Mesh(segmentGeometry, segmentMaterial.clone());
				this.mesh.position.copy(this.node1.position);
				this.mesh.scale.set(1, 1, this.node2.position.clone().sub(this.node1.position).length());
				this.mesh.lookAt(this.node2.position);
				this.mesh.userData.owner = this;
			}

			return this.mesh;

		},

		hide: function () {

			if (this.mesh !== undefined) {

				if (this.mesh.parent !== undefined) {

					this.mesh.parent.remove(this.mesh);

				}
			}
		},

		toJSON: function () {

			return { node1: this.node1.uuid, node2: this.node2.uuid, d1: this.diameter1, d2: this.diameter2, uuid: this.uuid };

		}

	};


	// Node /////////////////////////////////////////////////////////////

	PIPER.Node = function (position, uuid) {

		this.position = position;
		this.uuid = uuid || THREE.Math.generateUUID();
		this.color = 0xff0000;

	};

	PIPER.Node.prototype = {

		constructor: PIPER.Node,

		mesh: undefined,

		makeMesh: function () {

			if (this.mesh === undefined) {
				this.mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
				this.mesh.position.copy(this.position);
				this.mesh.userData.owner = this;
			}

			return this.mesh;

		},

		hide: function () {

			if (this.mesh !== undefined) {

				if (this.mesh.parent !== undefined) {

					this.mesh.parent.remove(this.mesh);

				}
			}
		},

		toJSON: function () {

			return {uuid: this.uuid, position: {north: this.position.x, elevation: this.position.y, east: this.position.z}};

		}

	};





}(window.PIPER = window.PIPER || {}));