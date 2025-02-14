function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "com.madrocket.ti.slidemenu/" + s : s.substring(0, index) + "/com.madrocket.ti.slidemenu/" + s.substring(index + 1);
    return 0 !== path.indexOf("/") ? "/" + path : path;
}

function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    new (require("/alloy/widget"))("com.madrocket.ti.slidemenu");
    this.__widgetId = "com.madrocket.ti.slidemenu";
    require("/alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "widget";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.slideMenu = Ti.UI.createView({
        id: "slideMenu"
    });
    $.__views.slideMenu && $.addTopLevelView($.__views.slideMenu);
    $.__views.leftDrawer = Ti.UI.createView({
        id: "leftDrawer",
        top: 0,
        left: 0,
        zIndex: 1
    });
    $.__views.slideMenu.add($.__views.leftDrawer);
    $.__views.content = Ti.UI.createView({
        id: "content",
        top: 0,
        left: 0,
        zIndex: 10
    });
    $.__views.slideMenu.add($.__views.content);
    $.__views.rightDrawer = Ti.UI.createView({
        id: "rightDrawer",
        top: 0,
        right: 0,
        zIndex: 1
    });
    $.__views.slideMenu.add($.__views.rightDrawer);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var drawer = {
        is_opened: false,
        initialize: function(content) {
            this.setWidth(content.width);
            this.add(content);
        },
        openDrawer: function() {
            this.fireEvent("open");
            $.content.animate(this.getDrawerOpenAnimation());
            this.is_opened = true;
            console.log("in widget.js, open drawer");
        },
        closeDrawer: function() {
            this.fireEvent("close");
            $.content.animate(this.getDrawerCloseAnimation());
            this.is_opened = false;
            console.log("in widget.js, close  drawer");
        },
        toggleDrawer: function() {
            this.is_opened ? this.closeDrawer() : this.openDrawer();
        }
    };
    _.extend($.leftDrawer, drawer, {
        getDrawerOpenAnimation: function() {
            var width = this.width;
            return Ti.UI.createAnimation({
                left: width,
                curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
                duration: 150
            });
        },
        getDrawerCloseAnimation: function() {
            return Ti.UI.createAnimation({
                left: 0,
                curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
                duration: 150
            });
        }
    });
    _.extend($.rightDrawer, drawer, {
        getDrawerOpenAnimation: function() {
            var width = this.width;
            return Ti.UI.createAnimation({
                right: width,
                curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
                duration: 150
            });
        },
        getDrawerCloseAnimation: function() {
            return Ti.UI.createAnimation({
                right: 0,
                curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
                duration: 150
            });
        }
    });
    var touchStartX = 0;
    var touchStarted = false;
    $.content.addEventListener("touchstart", function(event) {
        touchStartX = parseInt(event.x, 10);
        touchStarted = true;
    });
    $.content.addEventListener("touchend", function(event) {
        touchStarted = false;
        event.source.convertPointToView({
            x: event.x,
            y: event.y
        }, $.slideMenu);
        var touchEndX = parseInt(event.x, 10);
        var delta = touchEndX - touchStartX;
        if (0 == delta) return false;
        if ($.content.left > 0) {
            delta > 10 ? $.leftDrawer.openDrawer() : $.leftDrawer.closeDrawer();
            -5 > delta ? $.leftDrawer.closeDrawer() : $.leftDrawer.openDrawer();
        } else {
            delta > 5 ? $.rightDrawer.closeDrawer() : $.rightDrawer.openDrawer();
            -10 > delta ? $.rightDrawer.openDrawer() : $.rightDrawer.closeDrawer();
        }
    });
    $.content.addEventListener("touchmove", function(event) {
        var coords = event.source.convertPointToView({
            x: event.x,
            y: event.y
        }, $.slideMenu);
        var _x = parseInt(coords.x, 10);
        var newLeft = _x - touchStartX;
        var swipeToRight = !!(newLeft > 0);
        var swipeToLeft = !!(0 > newLeft);
        if (touchStarted) {
            if (swipeToRight) {
                $.leftDrawer.zIndex = 2;
                $.rightDrawer.zIndex = 1;
            } else {
                $.leftDrawer.zIndex = 1;
                $.rightDrawer.zIndex = 2;
            }
            (swipeToRight && newLeft <= $.leftDrawer.width || swipeToLeft && newLeft >= -$.rightDrawer.width) && ($.content.left = newLeft);
        }
        newLeft > 10 && (touchStarted = true);
    });
    $.leftDrawer.addEventListener("open", function() {
        $.rightDrawer.is_opened = false;
        $.leftDrawer.zIndex = 2;
        $.rightDrawer.zIndex = 1;
        $.trigger("open:[left]");
    });
    $.leftDrawer.addEventListener("close", function() {
        $.trigger("close:[left]");
    });
    $.rightDrawer.addEventListener("open", function() {
        $.leftDrawer.is_opened = false;
        $.leftDrawer.zIndex = 1;
        $.rightDrawer.zIndex = 2;
        $.trigger("open:[right]");
    });
    $.rightDrawer.addEventListener("close", function() {
        $.trigger("close:[right]");
    });
    exports.init = function(options) {
        options.hasOwnProperty("leftDrawer") ? $.leftDrawer.initialize(options.leftDrawer) : $.slideMenu.remove($.leftDrawer);
        options.hasOwnProperty("rightDrawer") ? $.rightDrawer.initialize(options.rightDrawer) : $.slideMenu.remove($.rightDrawer);
        $.content.add(options.content);
    };
    exports.toggleRightDrawer = function() {
        $.rightDrawer.toggleDrawer();
    };
    exports.toggleLeftDrawer = function() {
        $.leftDrawer.toggleDrawer();
    };
    _.extend($, exports);
}

var Alloy = require("/alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;