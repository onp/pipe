////////////////////////////////////////////////////
// Positioner
var PositionerFactory = function (context) {
    
    //The positioner element maintains and allows editing of position data as
    //nodes and segments are being created.

    var positioner = {};
    positioner.context = context;

    var positionSpecs = {};
    positioner.positionSpecs = positionSpecs;

    var displayElement = document.getElementById("menu-box");
    var deltaElement = document.getElementById("delta-box");

    var markedActive = {x: false, y: false, z: false, l: false};
    var deltaVisible = deltaElement.style.display == "block";

    var dims = ["x", "y", "z", "l"];
    var posTags = ["x-pos", "y-pos", "z-pos"];
    var deltaTags = ["x-delta", "y-delta", "z-delta", "l-delta"];

    var posElems = posTags.map(function (a) {return document.getElementById(a); });
    var deltaElems = deltaTags.map(function (a) {return document.getElementById(a); });
    var diamElem = document.getElementById("diameter");
    positionSpecs.diameter = PIPE.defaultDiameter;
    positioner.lengthElem = deltaElems[3];

    var i;

    //hacky - to make the lists the same length, even though we don't care about magnitude of absolute position
    var dummyParent = document.createElement("div");
    var dummyChild1 = document.createElement("span");
    var dummyChild2 = document.createElement("input");
    dummyParent.appendChild(dummyChild1);
    dummyParent.appendChild(dummyChild2);
    posElems.push(dummyChild2);

    for (i = 0; i < dims.length; i++) {
        posElems[dims[i]] = posElems[i];
        deltaElems[dims[i]] = deltaElems[i];
    }

    displayElement.addEventListener("click", function (e) {
        e.stopPropagation();
    }, false);

    displayElement.addEventListener("keydown", function (e) {
        //allow mode change events only to pass through.
        if ([27, 67, 68, 83, 86].indexOf(e.keyCode) == -1) {
            e.stopPropagation();
        }
    }, false);

    var checkSpecs = function () {
        for (i = 0; i < dims.length; i++) {
            if (positionSpecs[dims[i]] !== undefined && !markedActive[dims[i]]) {
                posElems[i].parentNode.classList.add("active");
                posElems[i].value = PIPE.calc.formatLength(positionSpecs[dims[i]], context.units);
                deltaElems[i].parentNode.classList.add("active");
                markedActive[dims[i]] = true;
            } else if (positionSpecs[dims[i]] === undefined && markedActive[dims[i]]) {
                posElems[i].parentNode.classList.remove("active");
                deltaElems[i].parentNode.classList.remove("active");
                markedActive[dims[i]] = false;
            }
        }

        if (deltaVisible && context.cursor.start === undefined) {
            deltaElement.style.display = "none";
            deltaVisible = false;
        } else if (!deltaVisible && context.cursor.start !== undefined) {
            deltaElement.style.display = "block";
            deltaVisible = true;
        }
    };

    var onFocusGenerator = function (dim, elem) {
        var onFocus = function (e) {
            if (positionSpecs[dim]) {	return false;	}

            if (dim != "l") {
                positionSpecs[dim] = positioner.context.cursor.start ? positioner.context.cursor.start[dim] : 0;
            } else {
                positionSpecs.x  = undefined;
                positionSpecs.y  = undefined;
                positionSpecs.z  = undefined;
                positionSpecs.l = 1;

            }

            posElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim], context.units);

            if (dim == 'l') {
                deltaElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim], context.units);
            } else {
                deltaElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim] - context.cursor.start[dim], context.units);
            }


        };

        return onFocus;
    };

    var onActivatorClickGenerator = function (dim, elem) {
        var onActivatorClickGenerator = function (e) {
            if (positionSpecs[dim] === undefined) {return false; }

            e.stopPropagation();

            positionSpecs[dim] = undefined;

        };

        return onActivatorClickGenerator;

    };

    var onInputGenerator = function (dim, elem, isDelta) {

        var onInput = function (e) {

            if (!isDelta) {
                positionSpecs[dim] = PIPE.calc.parseLength(elem.value, context.units);
                // add alert if parseLength returns null (bad format)
                deltaElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim] - context.cursor.start[dim], context.units);

            } else {
                if (dim == 'l') {
                    positionSpecs[dim] = PIPE.calc.parseLength(elem.value, context.units);
                    // add alert if parseLength returns null (bad format)

                } else {
                    positionSpecs[dim] = PIPE.calc.parseLength(elem.value, context.units) + context.cursor.start[dim];
                    // add alert if parseLength returns null (bad format)
                    posElems[dim].value = PIPE.calc.formatLength(positionSpecs[dim], context.units);

                }

            }


        };

        return onInput;
    };




    //provide functionality
    for (i = 0; i < dims.length; i++) {

        var p = posElems[i];
        var d = deltaElems[i];

        //on Focus
        p.addEventListener("focus",
            onFocusGenerator(dims[i], p),
            false);

        d.addEventListener("focus",
            onFocusGenerator(dims[i], d),
            false);

        //on parent click
        p.parentNode.addEventListener("click",
            onFocusGenerator(dims[i], p),
            false);

        d.parentNode.addEventListener("click",
            onFocusGenerator(dims[i], d),
            false);

        // on input
        p.addEventListener("input",
            onInputGenerator(dims[i], p),
            false);

        d.addEventListener("input",
            onInputGenerator(dims[i], d, true),
            false);

        // on activator click (deactivate)
        p.previousElementSibling.addEventListener("click",
            onActivatorClickGenerator(dims[i], p),
            false);

        d.previousElementSibling.addEventListener("click",
            onActivatorClickGenerator(dims[i], d),
            false);

    }

    diamElem.addEventListener("input",
        function (e) {
            var diam = PIPE.calc.parseLength(diamElem.value, context.units);
            positioner.positionSpecs.diameter = diam;

            context.cursor.setDiam(diam);
        },
        false
        );




    positioner.onFrame = function () {
        checkSpecs();

        var i;

        for (i = 0; i < dims.length; i++) {
            if (positionSpecs[dims[i]] === undefined) {
                posElems[i].value = PIPE.calc.formatLength(context.cursor.target[dims[i]], context.units);

                if (deltaVisible) {
                    deltaElems[i].value = PIPE.calc.formatLength((dims[i] == "l") ? context.cursor.diff.length() : context.cursor.diff[dims[i]], context.units);
                    if (document.activeElement !== diamElem) {
                        diamElem.value = PIPE.calc.formatLength(positionSpecs.diameter, context.units);
                    }
                }

            }

        }

    };

    positioner.show = function () {
        displayElement.style.display = "block";
    };

    positioner.hide = function () {
        displayElement.style.display = "none";
    };

    positioner.clear = function () {
        positionSpecs.x  = undefined;
        positionSpecs.y  = undefined;
        positionSpecs.z  = undefined;
        positionSpecs.l = undefined;
        positionSpecs.diameter = PIPE.defaultDiameter;

    };


    return positioner;
};

