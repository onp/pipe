//Define: X = NORTH
//        Y = UP
//        Z = EAST

(function (PIPE, undefined) {
    "use strict";

	// Model //////////////////////////////////////////////////

	PIPE.Model = function () {
		this.pipes = {};
		this.nodes = {};
        this.lines = {};
        this.vessels = {};
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
    
	// Site /////////////////////////////////////////////////////////////

	PIPE.Site = function (name, data, uuid) {
        this.uuid = uuid || THREE.Math.generateUUID();
        this.name = name
        
        this.groundElevation = data.groundElevation || 0;
        this.minEast = data.minEast || -5000;
        this.maxEast = data.maxEast || 5000;
        this.minNorth = data.minNorth || -5000;
        this.maxNorth = data.maxNorth || 5000;
        
    }
    
    PIPE.Site.prototype = {
        
        constructor: PIPE.Site;
    }

	// Segment //////////////////////////////////////////////////////////

	PIPE.Segment = function (node1, node2, diameter, uuid, line) {
		this.uuid = uuid || THREE.Math.generateUUID();
        
        this.node1 = node1;
		this.node2 = node2 || new PIPE.Node(new THREE.Vector3());

		this.diameter = diameter || PIPE.defaultDiameter;
		this.color = 0x00ff00;

		this.node1.addConnection(this);
		this.node2.addConnection(this);
        
        this.line = line || new PIPE.Line()

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
			return new THREE.Vector3().subVectors(this.node1.position, this.node2.position).length();
		},
		
		getDirection: function (node) {
			//get the normalized direction of the segment.
			//optionally, the direction is defined from one of the two endpoints
			var p1,p2;
			if (this.node2 === node){
				p1 = node.position
				p2 = this.node1.position
			} else {
				p1 = this.node1.position
				p2 = this.node2.position
			}
			
			return new THREE.Vector3().subVectors(p1, p2).normalize()
			
		},

		hide: function () {

			if (this.mesh !== undefined) {

				if (this.mesh.parent !== undefined) {

					this.mesh.parent.remove(this.mesh);

				}
			}
		},
		
		breakConnections: function () {
			
			this.node1.removeConnection(this);
			this.node2.removeConnection(this);
			
		},

		toJSON: function () {

			return { node1: this.node1.uuid, node2: this.node2.uuid, d1: this.diameter, uuid: this.uuid, name: this.name };

		}

	};


	// Node /////////////////////////////////////////////////////////////

	PIPE.Node = function (position, uuid, type, name) {

		this.uuid = uuid || THREE.Math.generateUUID();
        this.position = position;
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
		
		removeConnection: function (connection) {
			var idx = this.connections.indexOf(connection);
			if (idx > -1) {
				this.connections.splice(idx,1);
				this.setScale();
			}
			
		},
		
		analyzeConnections: function () {
			if (this.connections.length == 0){
				return "orphan"
			} else if (this.connections.length == 1){
				return "dead end"
			} else if (this.connections.length == 2){
				var dir1 = this.connections[0].getDirection(this)
				var dir2 = this.connections[1].getDirection(this)
				var dot12 = new THREE.Vector3().copy(dir1).dot(dir2)
				
				if (dot12 > 0.99){
					//lines overlap
					return "overlap"
				} else if (dot12 < 0.1 && dot12 > -0.1){
					//lines are perpendicular
					return "elbow"
				} else if (dot12 < -0.99){
					//continue straight
					return "straight"
				} else {
					return "other angle"
				}
			} else if (this.connections.length == 3){
				var dir1 = this.connections[0].getDirection(this)
				var dir2 = this.connections[1].getDirection(this)
				var dir3 = this.connections[2].getDirection(this)
				
				var dot12 = new THREE.Vector3().copy(dir1).dot(dir2)
				var dot13 = new THREE.Vector3().copy(dir1).dot(dir3)
				var dot23 = new THREE.Vector3().copy(dir2).dot(dir3)
				
				if (Math.max(dot12,dot13,dot23) > 0.99){
					//at least 2 lines overlap
					return "overlap(3)"
				} else if (Math.abs(dot12)<0.1 && Math.abs(dot13)<0.1 && dot23 < -0.99){
					//branch pipe is 1
					return "branch 1"
				} else if (Math.abs(dot12)<0.1 && Math.abs(dot23)<0.1 && dot13 < -0.99){
					//branch pipe is 2
					return "branch 2"
				} else if (Math.abs(dot13)<0.1 && Math.abs(dot23)<0.1 && dot12 < -0.99){
					//branch pipe is 3
					return "branch 3"
				} else {
					return "other 3 angle"
				}
				
			} else if (this.connections.length > 3){
                return "4 or more connections."
            }
			
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
    
	// Line /////////////////////////////////////////////////////////////
    
    PIPE.Line = function (lineNumber, data, uuid) {
        this.uuid = uuid || THREE.Math.generateUUID();
        this.lineNumber = lineNumber || this.uuid.slice(0,6);
        
        this.segments = [];
    }
    
    PIPE.Line.prototype = {
        
        constructor: PIPE.Line;
        
        
        
    }
    
	// Vessel ///////////////////////////////////////////////////////////

    PIPE.Vessel = function (position, vesselNumber, vesselName, data, uuid) {
        this.uuid = uuid || THREE.Math.generateUUID();
        this.position = position;
        this.vesselNumber = vesselNumber;
        this.vesselName = vesselName;
        
        this.vesselType = type || "vessel";
        this.numericCode = numericCode;
        this.geometry = data.geometry;
        this.nozzles = data.nozzles;
        
    }
    
    PIPE.Vessel.prototype = {
        
        constructor: PIPE.Vessel;
        
    }


}(window.PIPE = window.PIPE || {}));