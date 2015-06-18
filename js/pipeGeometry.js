//Define: X = NORTH
//        Y = UP
//        Z = EAST

(function (PIPE, undefined) {
    "use strict";
	
	// Default Settings ////////////////////////////////////////////
	
	PIPE.defaultDiameter = 0.102;
	
	// Materials ////////////////////////////////////////////
	
	var MAT = {};
	PIPE.mat = MAT;


	MAT.node = new THREE.MeshLambertMaterial({color: 0xff0000});
	MAT.segment = new THREE.MeshLambertMaterial({color: 0x00ff00});

	// Geometries ////////////////////////////////////////////
	var GEOM = {};
	PIPE.geom = GEOM;
	
	GEOM.node = new THREE.SphereGeometry(1/2);
	
	GEOM.globeValve = (function (){
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
	
	GEOM.gateValve = (function (){
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

	GEOM.segment = (function(){
		var g = new THREE.CylinderGeometry(0.5, 0.5, 1);
		
		var cTrans = new THREE.Matrix4()
		g.applyMatrix(cTrans.makeTranslation(0, 0.5, 0));
		g.applyMatrix(cTrans.makeRotationX(Math.PI / 2));
		
		return g
	})()
	
	
	




}(window.PIPE = window.PIPE || {}));