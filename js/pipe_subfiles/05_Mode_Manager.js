////////////////////////////////////////////////////
// Mode Manager

var ModeManagerFactory = function (context) {
    var modeManager = {
        mode: undefined
    };

    var modes = {};
    var keyCodes = {};

    var toggleMode = function (mode) {
        if (mode.state != "on") {
            mode.enter();
        } //else {
        //	mode.leave();
        //}
        modeManager.update();
    };

    modeManager.addMode = function (mode, element, keyCode) {
        modes[mode.name] = {mode: mode, element: element, keyCode: keyCode};
        keyCodes[keyCode] = modes[mode.name];

        element.addEventListener("click",
            function (e) {
                e.stopPropagation();
                toggleMode(mode);
            },
            false);
    };

    modeManager.onKeyDown = function (e) {
        if (keyCodes[e.keyCode]) {
            toggleMode(keyCodes[e.keyCode].mode);
        }
    };

    modeManager.update = function () {

        var modeName;

        for (modeName in modes) {

            var modeData = modes[modeName];

            if (modeData.mode.state == "off") {
                modeData.element.classList.remove("active");
                modeData.element.classList.remove("suspended");
            } else if (modeData.mode.state == "on") {
                modeData.element.classList.add("active");
                modeData.element.classList.remove("suspended");
            } else if (modeData.mode.state == "suspend") {
                modeData.element.classList.remove("active");
                modeData.element.classList.add("suspended");
            }
        }
    };

    return modeManager;

};

