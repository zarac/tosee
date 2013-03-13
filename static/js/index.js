//* dust.js stuff
dust.onLoad = function(name, callback) {
    $.get(['views/', '.dust.html'].join(name), function(data) {
        callback(null, data);
    }, 'html').error(function() {
        console.log('Missing template "' + name + '".');
    });
};

var show_add = function(id, cb) {
    var fid = feedback('adding show '+id).id;
    $.get('/show/' + id + '/add', function(res) {
        if (res.error) feedback(res.error);
        else {
            if (res.seasons)
                for (var j = 0; j < res.seasons.length; j++)
                    if (res.seasons[j].episodes)
                        for (var k = 0; k < res.seasons[j].episodes.length; k++)
                            res.seasons[j].episodes[k].showname = res.name;
            dust.render('show', res, function(err, out) {
                out = $(out);
                $('#shows > .list').append(out);
                scrollTo(out);
            });
        }
        $('.feedback.item[data-id='+fid+']').remove();
        if (cb) cb(res);
    });
};

var show_find = function(query) {
    $.get('/find/' + query, function(result) {
        dust.render('finder-result', result.result, function(err, out) {
            $('#finder .result').replaceWith(err || out);
        });
    });
};

var show_remove = function(id) {
    var fid = feedback('removing le show ' + id).id;
    $.get('show/' + id + '/remove', function(res) {
        if (res.error) feedback(res.error);
        else {
            $('.show.item[data-id='+id+']').remove();
        }
        $('.feedback.item[data-id='+fid+']').remove();
    });
};

var show_update = function(id) {
    var fid = feedback('updating le show ' + id).id;
    $.get('show/' + id + '/update', function(res) {
        if (res.error) feedback(res.error);
        else {
            if (res.seasons)
                for (var j = 0; j < res.seasons.length; j++)
                    if (res.seasons[j].episodes)
                        for (var k = 0; k < res.seasons[j].episodes.length; k++)
                            res.seasons[j].episodes[k].showname = res.name;
            dust.render('show', res, function(err, out) { 
                var e = $('.show.item[data-id='+id+']');
                e.replaceWith(err || out);
            });
        }
        $('.feedback.item[data-id='+fid+']').remove();
    });
};

//* Event handlers
var on_show_add = function() {
    var show = $(this).parent('.result.item');
    show_add(show.data('id'));
};

var on_show_find = function(e) {
    e.preventDefault();
    show_find($('#finder .query').val());
};

var on_show_remove = function() {
    var show = $(this).parent('.show.item');
    show_remove(show.data('id'));
}

var on_show_update = function() {
    var show = $(this).parent('.show.item');
    show_update(show.data('id'));
}

var on_toggle = function() {
    $(this).parent().children('.toggable').toggle();
};

$(function() {
    $('body').on('click', '.toggler', on_toggle);
    $('#finder').on('click', '.add.button', on_show_add);
    $('#finder').on('click', '.find.button', on_show_find);
    $('#shows').on('click', '.show.item .remove.button', on_show_remove);
    $('#shows').on('click', '.show.item .update.button', on_show_update);
});

function scrollTo(element) {
    $("html, body").stop().animate({ scrollTop: element.offset().top - 5 },
            1000)
    $(element).addClass('animated pulse')
    window.setTimeout(function() {
        $(element).removeClass('pulse')
    }, 1000)
}
