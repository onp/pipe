////////////////////////////////////////////////////
// Define "View Mode" behaviour

var ViewModeFactory = function (context) {

    var viewMode = {
        name: "view",
        state: "off"
    };

    viewMode.enter = function () {
        if (context.mode) {
            context.mode.leave();
        }

        context.mode = viewMode;
        this.state = "on";

        context.controlsO.enabled = true;
        context.controlsP.enabled = true;
        context.positioner.hide();
        context.selector.clearHovers();
        context.modeManager.update();
    };

    viewMode.leave = function () {
        this.state = "off";
        context.mode = undefined;
        context.controlsO.enabled = false;
        context.controlsP.enabled = false;
    };

    viewMode.onClick = function () {};

    viewMode.onKeyDown = function () {};

    viewMode.onFrame = function () {};

    return viewMode;

};

