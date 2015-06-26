(function (PIPE, undefined) {
    "use strict";

	var CALC = {};
	PIPE.calc = CALC;

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


	CALC.parseFeetInches = function (fi) {
		//parses a string as feet and inches, returns meters

		var fiRE = /(?:^(\d*)(?!(?:"|(?:[\s-](?:\d+)\/(?:\d+)")))'?)?(?:(?:[\s-]?(\d*))?(?:[\s-](\d+)\/(\d+))?"?)?$/g;

		var matched = fiRE.exec(fi);

		var feet, meters, i;

		if (matched) {


			if (matched[4] == undefined) {

				matched[4] = 1;

			}

			for (i = 1; i < matched.length; i++) {
				console.log(matched[i]);
				if (matched[i] === undefined) {
					matched[i] = 0;
				}
				matched[i] = Number(matched[i]);
				console.log(matched[i]);
			}

			feet = matched[1] + (matched[2] + matched[3] / matched[4]) / 12;
			meters = feet * 0.3048;
		}

		return meters;
	};

	CALC.toFeetInches = function (m) {
		//takes a number of meters, returns  a formatted string in feet and inches.

		if (m == 0) {

			return 0;

		}

		var feet, inches, numerator, denominator, remInches;

		feet = ~~(m / 0.3048);
		remInches = (m - feet * 0.3048) / 0.0254;
		inches = ~~(remInches);
		remInches = remInches - inches;

		for (denominator = 2; denominator < 32; denominator *= 2) {
			numerator = Math.round(remInches * denominator);

			if ((1 / 32) > Math.abs(remInches - numerator / denominator)) {
				break;
			}

		}

		if (numerator == 0) {

			return feet + "' " + inches + '"';

		} else if (numerator == denominator) {

			inches++;

			return feet + "' " + inches + '"';

		} else {

			return feet + "' " + inches + " " + numerator + "/" + denominator + '"';

		}
	};


	CALC.parseLength = function (l, unit) {
		// accepts length as string, interprets as "unit"
		// valid units are "fi" (feet and inches) and "m" (meters)
		// returns undefined if l is not a valid input.
		if (unit === undefined) { unit = "m"; }

		if (unit == "fi") {
			return CALC.parseFeetInches(l);
		} else if (unit == "m") {
			if (!isNaN(Number(l))) {
				return Number(l);
			}
		}
	};

	CALC.formatLength = function (l, unit) {
		//accepts length in meters, returns formatted length in "unit"
		//valid units are "fi" (feet and inches) and "m" (meters rounded to closest mm)
		if (unit === undefined) { unit = "m"; }

		if (unit == "fi") {
			return CALC.toFeetInches(l);
		} else if (unit == "m") {
			if (Math.abs(l) < 0.001) { l = 0; }
			return Number(l).toFixed(3);
		}

		console.log("invalid units");
		return "ERROR";
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





}(window.PIPE = window.PIPE || {}));