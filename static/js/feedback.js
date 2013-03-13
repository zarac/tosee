/**
 * Feedback
 *  A utility for giving feedback to the user.
 *
 * Requires
 *  jQuery
 *  dust.js
 *
 * Author
 *  Hannes Landstedt a.k.a. zarac
 *
 * TODO
 *  Allow multiple parameters.
 */

var feedback = (function(defaultType) {
    var nextId = 1;
    var queue = [];

    var main = preinit = function(message) {
        console.log('feedback not initialized. message queued (id=%s)', message.id);
        queue.push(message);
        return message;
    };

    var postinit = function(message) {
        dust.render('feedback-message', message, function(err, out) {
            $('#feedback .list').append(out);
        });
        return message;
    };

    var unify_message = function(message) {
        if (!message.message) message = {
            message: stringify_without_cycles(message) };
        if (!message.type) message.type = defaultType;
        message.id = nextId++;
        return message;
    };
    
    /**
     * Thanks
     *  http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
     *  http://stackoverflow.com/questions/9382167/serializing-object-that-contains-cyclic-object-value
     * TODO
     *  Broken in Chromium; Maximum call stack size exceeded.
     */
    var stringify_without_cycles = function(obj) {
        var seen = [];
        return JSON.stringify(obj, function(key, val) {
            if (typeof val === 'object' && val !== null) {
                if (seen.indexOf(val) >= 0) {
                    return;
                }
                seen.push(val);
            }
            return val;
        });
    }

    var feedback = function(message) {
        return main(unify_message(message));
    };

    feedback.init = function(callback) {
        dust.render('feedback', {}, function(err, out) {
            $('body').append(out);
            while (queue.length > 0) postinit(queue.shift());
            main = postinit;
            callback();
        });
    };

    feedback.error = function(message) {
        main({ type: 'error', message: message });
    };

    feedback.info = function(message) {
        main({ type: 'info', message: message });
    };

    feedback.success = function(message) {
        main({ type: 'success', message: message });
    };

    feedback.warning = function(message) {
        main({ type: 'warning', message: message });
    };

    return feedback;
})('info');

$(function() {
    feedback.init(function() {
        /* Test
        feedback('testing string');
        feedback({ message: 'testing obj.message' });
        feedback({ message: 'testing error', type: 'error' });
        feedback({ message: 'testing success', type: 'success' });
        feedback({ blah: 'testing obj.blah' });
        feedback('test feedback1');
        feedback('test feedback2');
        feedback('test feedback3');
        feedback.info('test feedback.info()');
        feedback.error('test feedback.error()');
        feedback.success('test feedback.success()');
        feedback.warning('test feedback.warning()');
        */
    });
});
