(function (CALC, undefined) {
    "use strict";

	CALC.getCursorPosition = function (e) {
		var x, y;
		if (e.pageX !== undefined && e.pageY !== undefined) {
			x = e.pageX;
			y = e.pageY;
		} else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return [x, y];
	};

	CALC.parseLength = function (l, unit) {
		if (!isNaN(Number(l))) {
			return Number(l);
		}
	};

	CALC.formatLength = function (l, unit) {
		if (Math.abs(l) < 0.001) { l = 0; }
		return Number(l).toFixed(3);
	};



	CALC.constrainedPoint = function (castRay, specs, n0) {
	// castRay: mouse ray [RayCaster]
	// n0: reference node location [Vector3]
	// Returns the point where a new node should be placed based on the mouse ray, reference node,
	// and position specifications.

		var a, b, aNorm, bNorm;
		var dx, dy, dz, l;
		var pt, i; //point to return

		n0 = n0 || new THREE.Vector3();

		if (specs !== undefined) {
			if (specs.x !== undefined) {dx = specs.x - n0.x; }
			if (specs.y !== undefined) {dy = specs.y - n0.y; }
			if (specs.z !== undefined) {dz = specs.z - n0.z; }
			if (specs.l !== undefined) { l = specs.l; }
		}

		if (l !== undefined) {

			var closestPoint = n0.clone().add(new THREE.Vector3(l, 0, 0));

			var minDist = castRay.ray.distanceToPoint(closestPoint);

			var axisVectors = [
				new THREE.Vector3(-l, 0, 0),
				new THREE.Vector3(0,  l, 0),
				new THREE.Vector3(0, -l, 0),
				new THREE.Vector3(0, 0,  l),
				new THREE.Vector3(0, 0, -l)
			];

			var point2, dist2;

			for (i = 0; i < axisVectors.length; i++) {

				point2 = n0.clone().add(axisVectors[i]);

				dist2 = castRay.ray.distanceToPoint(point2);

				if (dist2 < minDist) {

					closestPoint = point2;

					minDist = dist2;

				}
			}

			return closestPoint;

		}

		if (dx !== undefined) {

			dx = new THREE.Vector3(dx, 0, 0);

			a = dx;
			aNorm = new THREE.Vector3(1, 0, 0);

		}


		if (dy !== undefined) {

			dy = new THREE.Vector3(0, dy, 0);

			if (a === undefined) {

				a = dy;
				aNorm = new THREE.Vector3(0, 1, 0);

			} else {

				b = dy;
				bNorm = new THREE.Vector3(0, 1, 0);

			}

		}

		if (dz !== undefined) {

			dz = new THREE.Vector3(0, 0, dz);

			if (a === undefined) {

				a = dz;
				aNorm = new THREE.Vector3(0, 0, 1);

			} else if (b === undefined) {

				b = dz;
				bNorm = new THREE.Vector3(0, 0, 1);

			} else {

				return n0.add(dx).add(dy).add(dz);

			}

		}

		if (a === undefined) {
			var x0 = new THREE.Vector3(-500, 0, 0).add(n0);
			var x1 = new THREE.Vector3(500, 0, 0).add(n0);
			var xPt = new THREE.Vector3();
			var xd = castRay.ray.distanceSqToSegment(x0, x1, null, xPt);

			var y0 = new THREE.Vector3(0, -500, 0).add(n0);
			var y1 = new THREE.Vector3(0, 500, 0).add(n0);
			var yPt = new THREE.Vector3();
			var yd = castRay.ray.distanceSqToSegment(y0, y1, null, yPt);

			var z0 = new THREE.Vector3(0, 0, -500).add(n0);
			var z1 = new THREE.Vector3(0, 0, 500).add(n0);
			var zPt = new THREE.Vector3();
			var zd = castRay.ray.distanceSqToSegment(z0, z1, null, zPt);

			pt = (xd < yd) ? ((xd < zd) ? xPt : zPt) : ((yd < zd) ? yPt : zPt);

			return pt;

		} else if (b === undefined) {

			//fix to plane on n0, with normal of a

			var targetPlane = new THREE.Plane();

			targetPlane.setFromNormalAndCoplanarPoint(aNorm, n0.add(a));

			pt = castRay.ray.intersectPlane(targetPlane);

			return pt || new THREE.Vector3();

		} else {

			//fix to line on n0, perpendicular to a and b

			n0.add(a).add(b);

			var c = new THREE.Vector3();

			c.crossVectors(aNorm, bNorm).normalize().multiplyScalar(500);

			var closePoint = new THREE.Vector3();

			n0.clone().sub(c);
			n0.clone().add(c);

			castRay.ray.distanceSqToSegment(n0.clone().sub(c), n0.clone().add(c), undefined, closePoint);

			return closePoint;

		}

	};





}(window.PIPER.Calc = window.PIPER.Calc || {}));