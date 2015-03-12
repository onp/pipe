(function (PIPER, undefined) {
    "use strict";

var defaultDiameter = 0.1

var nodeGeometry = new THREE.SphereGeometry(defaultDiameter)
var nodeMaterial = new THREE.MeshLambertMaterial({color:0xff0000})

var segmentGeometry = new THREE.CylinderGeometry(defaultDiameter,defaultDiameter,1)
var cTrans = new THREE.Matrix4()
segmentGeometry.applyMatrix(cTrans.makeTranslation(0,0.5,0))
segmentGeometry.applyMatrix(cTrans.makeRotationX(Math.PI/2))
var segmentMaterial = new THREE.MeshLambertMaterial({color:0x00ff00})

// Model //////////////////////////////////////////////////

PIPER.Model = function(){
	this.pipes = []
	this.nodes = {}
}

PIPER.Model.prototype = {}

// Segment //////////////////////////////////////////////////////////

PIPER.Segment = function (node1, node2, diameter1, diameter2,uuid) {
    this.node1 = node1
    this.node2 = node2 || new PIPER.Node(new THREE.Vector3())
    this.diameter1 = diameter1 || defaultDiameter
    this.diameter2 = diameter2 || diameter1 || defaultDiameter
    this.uuid = uuid || THREE.Math.generateUUID()

};

PIPER.Segment.prototype = {

    constructor: PIPER.Segment,
    
    mesh: undefined,
    
    makeMesh: function () {
        
        if ( this.mesh === undefined ) {
            this.mesh = new THREE.Mesh(segmentGeometry, segmentMaterial.clone())
            this.mesh.position.copy(this.node1.position)
            this.mesh.scale.set(1,1,this.node2.position.clone().sub(this.node1.position).length())
            this.mesh.lookAt(this.node2.position)
            this.mesh.userData.owner = this
        }
        
        return this.mesh
    
    },
    
    hide: function () {
    
        if ( this.mesh !== undefined ) {
            
            if ( this.mesh.parent !== undefined ) {
                
                this.mesh.parent.remove(this.mesh)
            
            }
        }
    },

    toJSON: function () {
     
        return JSON.stringify([ this.node1.uuid, this.node2.uuid, this.diameter1, this.diameter2, this.uuid ])
        
    }
    
};


// Node /////////////////////////////////////////////////////////////

PIPER.Node = function(position,uuid){

    this.position = position
    
    this.uuid = uuid || THREE.Math.generateUUID()

};

PIPER.Node.prototype = {
    
    constructor: PIPER.Node,
    
    mesh: undefined,
    
    makeMesh: function () {
        
        if ( this.mesh === undefined ) {
            this.mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone())
            this.mesh.position.copy(this.position)
            this.mesh.userData.owner = this
        }
        
        return this.mesh
    
    },
    
    hide: function () {
    
        if ( this.mesh !== undefined ) {
            
            if ( this.mesh.parent !== undefined ) {
                
                this.mesh.parent.remove(this.mesh)
            
            }
        }
    },
    
    toJSON: function () {
    
        return JSON.stringify( [this.uuid,[this.position.x,this.position.y,this.position.z]])
    
    }
    
};





}(window.PIPER = window.PIPER || {}));