/**
 * Dust.js stuff
 */
dust.onLoad = function(name, callback) {
    $.get(['views/', '.dust.html'].join(name), function(data) {
        callback(null, data);
    }, 'html').error(function() {
        console.log('Missing template "' + name + '".');
    });
};


/**
 * UI
 */
function scrollTo(element) {
    $("html, body").stop().animate({ scrollTop: element.offset().top - 5 },
            1000)
    $(element).addClass('animated pulse')
    window.setTimeout(function() {
        $(element).removeClass('pulse')
    }, 1000)
}


/**
 * ajaxify
 */
var ajaxify = {
    _methods: ['post', 'get', 'update', 'delete'],
    a: function(res_handler) {
        if (!res_handler) res_handler = this.default_handler;
        return function(e) {
            e.preventDefault();
            var method = $(this).data('method');
            method = (method && ajaxify._methods.indexOf(method) > -1 ?
                    method.toUpperCase() : 'GET' );
            var fid = feedback("AJAXing (" + this.href + ").").id;
            $.ajax({
                type: method,
                url: this.href,
                dataType: 'json',
                success: function(res) {
                    $('.feedback.item[data-id=' + fid + ']').remove();
                    res_handler(res, e, this);
                }
            }, 'json');
        };
    },
    form: function(res_handler) {
        if (!res_handler) res_handler = this.default_handler;
        return function(e) {
            e.preventDefault();
            var form = $(this).parents('form')[0];
            var data = $(form).serializeArray();
            var fid = feedback("AJAXing '" + form.action + "' with '" + JSON.stringify(data) + "'.").id;
            $.ajax({
                type: form.method,
                url: form.action,
                data: data,
                dataType: 'json',
                success: function(res) { 
                    $('.feedback.item[data-id=' + fid + ']').remove();
                    res_handler(res, e, this);
                }
            });
        };
    },
    default_handler: function(res, e, ajax) {
        console.log('default_handler(res, e, ajax): this', res, e, ajax, this);
    }
};


/**
 * ajaxified response handlers
 */
var on_res_add = function(res, e, ajax) {
    if (res.error)
        feedback.error('Error: [' + res.error + '].');
    else {
        dust.render('show', res, function(err, out) {
            out = $(out);
            $('#shows').append(out);
            scrollTo(out);
        });
    }
};

var on_res_find = function(res, e, ajax) {
    dust.render('finder-result', res, function(err, out) {
        $('#finder .result').replaceWith(err || out);
    });
};

var on_res_show_remove = function(res, e, ajax) {
    var article = $(e.target).parents('article.show');
    var sid = article.data('id');
    var name = article.find('span.name').text();
    if (res.status == 0) {
        $('article.show[data-id=' + sid + ']').remove();
        feedback.success('Removed show "' + name + '".');
    } else
        feedback.error('Error removing show "' + name + '".');
};

var on_res_show_update = function(res, e, ajax) {
    if (res.error) feedback(res.error);
    else {
        dust.render('show', res, function(err, out) { 
            var out = $(out);
            var old = $('article.show[data-id=' + res.id + ']');
            old.replaceWith(err || out);
            out.find('article.season').each(function(i, e) {
                ui_update_status_upstream(e);
            });
        });
    }
};

var on_res_toggle_seen = function(res, e, ajax) {
    var cur_episode = $(e.target).parents('article.episode');
    dust.render('episode', res, function(err, out) {
        var episode = $(out);
        cur_episode.replaceWith(err || episode);
        var season = episode.parents('article.season');
        ui_update_status_upstream(season[0]);
    });
};

//* update status where relevant
var ui_update_status_upstream = function(season) {
    //* season
    var season = $(season);
    var unseen_episodes = season.find('article.episode[data-status=unseen]');
    if (unseen_episodes.length > 0)
        season.attr('data-status', 'unseen');
    else
        season.attr('data-status', 'seen');
    //* show
    var show = season.parents('article.show');
    var unseen_seasons = show.find('article.season[data-status=unseen]');
    if (unseen_seasons.length > 0)
        show.attr('data-status', 'unseen');
    else
        show.attr('data-status', 'seen');
};


/**
 * Generic toggler
 */
var on_toggle = function() {
    var toggler = $(this);
    var article = toggler.parents('article');
    article.children(toggler.data('toggle')).toggle('slow', function() {
        toggler.attr('data-state', $(this).is(':visible'));
    });
};


/**
 * Testing background-pictures.
 */
var backgroundizer = {
    _pictures : [
        'lightpaperfibers.png',
        'absurdidad.png',
        'furley_bg.png',
        'gplaypattern.png',
        'grey.png',
        'handmadepaper.png',
        'hexellence.png',
        'light_wool.png',
        'lil_fiber.png',
        'natural_paper.png',
        'redox_01.png',
        'ricepaper2.png',
        'square_bg.png',
        'subtlenet2.png',
        'vintage_speckles.png',
        'white_carbon.png'
    ],
    _currentPic : 'natural_paper.png',
    _getNextPicture : function() {
        _currentPic = _pictures.shift();
        _pictures.push(_currentPic);
        return currentPic;
    },
    nextPic : function() {
        $('body').css('background-image', 'url("/img/subtlepatterns/' + _getNextPicture() + '")');
    }
};


/**
 * DOM ready
 */
$(function() {
    //* UI init.
    $('body').on('click', '.toggle', on_toggle);
    $('#shows').on('click', 'article.show a.remove.button',
            ajaxify.a(on_res_show_remove));
    $('#shows').on('click', 'article.show a.update.button',
            ajaxify.a(on_res_show_update));
    $('#shows').on('click', 'article.episode a.toggle-seen.button',
            ajaxify.a(on_res_toggle_seen));
    $('#finder').on('click', 'form .find.button', ajaxify.form(on_res_find));
    $('#finder').on('click', 'a.add.button', ajaxify.a(on_res_add));

    $('article.season').each(function(i, e) {
        ui_update_status_upstream(e);
    });

    //* Hide all hidden toggleables.
    $('.toggle[data-state=true]').each(function(a, b) {
        var e = $(this);
        e.parents('article').children(e.data('toggle')).hide();
    });

    //* Testing background-pictures.
    $('body > header').on('click', backgroundizer.nextPic);
});
