//* dust.js stuff
dust.onLoad = function(name, callback) {
    $.get(['views/', '.dust.html'].join(name), function(data) {
        callback(null, data);
    }, 'html').error(function() {
        console.log('Missing template "' + name + '".');
    });
};

var add_show = function(id, cb) {
    feedback('adding show '+id);
    $.get('/show/' + id + '/add', function(res) {
        if (res.error) feedback(res.error);
        else {
            res._li = true;
            dust.render('show', res, function(err, out) {
                out = $(out);
                $('#shows > .list').append(out);
                scrollTo(out);
            });
        }
        if (cb) cb(res);
    });
};

var bind_find_button = function() {
    $('#finder .find.button').on('click', function(e) {
        e.preventDefault();
        find($('#finder .query').val());
    });
};

var bind_remove_buttons = function() {
    $('.show.item').each(function(i, el) {
        $(this).find('.remove.button').on('click', function(e) {
            remove_show($(el).data('id'));
        });
    });
};

var bind_update_buttons = function() {
    $('.show.item').each(function(i, el) {
        $(this).find('.update.button').on('click', function(e) {
            update_show($(el).data('id'));
        });
    });
};

var find = function(query) {
    $.get('/find/' + query, function(result) {
        dust.render('finder-result', result.result, function(err, out) {
            var out = $(out);
            $('#finder .result').replaceWith(err || out);
            out.find('.result.item').each(function() {
                var item = $(this),
                    id = item.data('id');
                item.find('.add.button').on('click', function(e) {
                    add_show(id);
                });
            });
        });
    });
}

var remove_show = function(id) {
    feedback('removing le show ' + id);
    $.get('show/' + id + '/remove', function(res) {
        if (res.error) feedback(res.error);
        else {
            $('.show.item[data-id='+id+']').remove();
        }
    });
};

var update_show = function(id) {
    feedback('updating le show ' + id);
    $.get('show/' + id + '/update', function(res) {
        if (res.error) feedback(res.error);
        else {
            dust.render('show', res, function(err, out) { 
                var e = $('.show.item[data-id='+id+']');
                e.replaceWith(err || out);
            });
        }
    });
};

$(function() {
    bind_find_button();
    bind_remove_buttons();
    bind_update_buttons();

    //* dev help / testing
    $('#dev .add-test-shows.button').on('click', function() {
        $.get('addtestshows', function(res) {
            feedback(res);
        });
    });
});

function scrollTo(element) {
    $("html, body").stop().animate({ scrollTop: element.offset().top - 5 },
            1000)
    $(element).addClass('animated pulse')
    window.setTimeout(function() {
        $(element).removeClass('pulse')
    }, 1000)
}
