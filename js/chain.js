var Chain = function () {
    "use strict";
    var listeners = {},
        resultOfPreviousFunc = null,
        self = this,
        api = {},
        funcs = [],
        errors = [],
        on = function (type, listener) {
            if (!listeners[type]) {
                listeners[type] = [];
            }
            listeners[type].push(listener);
            return api;
        },
        off = function (type, listener) {
            if (listeners[type]) {
                var arr = [];
                for (var i = 0; i < listeners.length; i++) {
                    var f = listeners[type][i];
                    if (f !== listener) {
                        arr.push(f);
                    }
                }
                listeners[type] = arr;
            }
            return api;
        },
        dispatch = function (type, param) {
            if (listeners[type]) {
                for (var i = 0; i < listeners.length; i++) {
                    var f = listeners[type][i]
                    f(param, api);
                }
            }
        },
        run = function () {
            if (arguments.length > 0) {
                funcs = [];
                for (var i = 0; f = arguments[i]; i++) funcs.push(f);
                var element = funcs.shift();
                if (typeof element === 'function') {
                    element(resultOfPreviousFunc, api.next);
                } else if (typeof element === 'object' && element.length > 0) {
                    var f = element.shift();
                    f.apply(f, element.concat([api.next]));
                }

            } else {
                dispatch("done", resultOfPreviousFunc);
            }
            return api;
        },
        next = function (res) {
            resultOfPreviousFunc = res;
            run.apply(self, funcs);
        },
        error = function (err) {
            if (typeof err != 'undefined') {
                errors.push(err);
                return api;
            } else {
                return errors;
            }
        },
        process = function () {
            if (arguments.length > 0) {
                // on method
                if (arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
                    on.apply(self, arguments);
                    // run method
                } else {
                    run.apply(self, arguments);
                }
            }
            return process;
        };

    api = {
        on: on,
        off: off,
        next: next,
        error: error
    };

    return process;

};