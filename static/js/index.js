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

var dusted = function() {
    console.log(arguments); };

/*
var dusted = function(in) {
    return function(err, out) {
        console.log('err, out : ', err, out); }; };
    */

/**
 * dustify
 *  render ajax reponse data based on its fields
 *  apply various UI specifics for the given model
 */
var dustify = function(data) {
    if (data.error)
        feedback.error(data.error)
    else if (data.episode)
        dust.render('episode', data.episode, function(err, out) {
            var showE = $('article.show[data-id=' + data.episode.show.id + ']'),
                episodeE = showE.find('article.episode[data-id=' + data.episode.eid + ']'),
                out = $(out)
            episodeE.replaceWith(out)
            ui_update_status_upstream(out.parents('article.season'))
            togglit.hide_hiddens() })
    else if (data.season)
        dust.render('season', data.season, function(err, out) {
            var showE = $('article.show[data-id=' + data.season.show.id + ']'),
                seasonE = showE.find('article.season[data-id=' + data.season.number + ']'),
                out = $(out)
            var state = seasonE.find('[data-toggle=".episodes"]').data('state')
            out.find('[data-toggle=".episodes"]').attr('data-state', state)
            seasonE.replaceWith(out)
            ui_update_status_upstream(out)
            togglit.hide_hiddens() } )
    else if (data.show)
        if (data.show._removed) {
            feedback.success('Show removed.')
            $('article.show[data-id="' + data.show.id + '"]').remove() }
        else {
            dust.render('show', data.show, function(err, out) {
                out = $(out)
                var showE = $('article.show[data-id="' + data.show.id + '"]')
                if (showE.length > 0)
                    showE.replaceWith(out)
                else
                    $('section.shows').append(out)
                ui_update_show_status(out)
                togglit.hide_hiddens()
                scrollTo(out) }) }
    else if (data.finder) {
        dust.render('finder-result', data.finder, function(err, out) {
            out = $(out)
            $('#finder section.result').replaceWith(out) }) }
    else {
        console.log(' === unhandled data', data)
        feedback.warning('Sorry, unable to handle data.') } }

var ui_update_show_status = function(showE) {
    var seasons = $(showE).find('article.season')
    var status = true
    for (var i = 0; i < seasons.length; i++) {
        if (!ui_update_season_status(seasons[i]))
            status = false }
    if (status)
        showE.attr('data-status', 'seen')
    else
        showE.attr('data-status', 'unseen')
}

var ui_update_season_status = function(seasonE) {
    var season = $(seasonE)
    var episodes = season.find('article.episode')
    for (var i = 0; i < episodes.length; i++) {
        if ($(episodes[i]).data('status') == 'unseen') {
            season.attr('data-status', 'unseen')
            return false } }
    seasonE.attr('data-status', 'seen')
    return true }

/**
 * UI
 */
function scrollTo(element) {
    $("html, body").stop().animate({ scrollTop: element.offset().top - 5 },
            300);
}


/**
 * ajaxify
 */
var ajaxify = {
    _methods: ['post', 'get', 'update', 'delete'],
    it: function(cb) {
        console.log('not implemented'); },
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
                },
                error: function(e) {
                    feedback.error(e);
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
                },
                error: function(e) {
                    feedback.error(e);
                }
            });
        };
    },
    default_handler: function(res, e, ajax) {
        console.log('default_handler(res, e, ajax): this', res, e, ajax, this);
    }
};

var ajax_handler = function(res) {
    console.log('ajax_hander res=', res);
    if (res.episode) { }
    else if (res.season) {
        dustify('season', res.show);
        dust.render('show', res.show, dusted(show)) }
    else if (res.show) {
        dustify('show', res.show);
        dust.render('show', res.show, dusted(show)) }
    else { } };

/**
 * AJAXify A and FORM elements.
 *  ! dust and the dustify snippet
 *  * The targets must be RESTful like URLs. (actually, not really)
 *  * The responses must be JSON format and the name of the property is the
 *    name of the model to be dustified. E.g. { season: { .. } }.
 */
var ajaxified = {
    aClick : function(event) {
        event.preventDefault()
        var fid = feedback.info('AJAXing').id
        var href = $(this).attr('href')
        $.ajax( {
            foo: 'bar',
            fid: fid,
            url: href,
            dataType: 'json',
            success: ajaxified.on_success_a,
            error: ajaxified.on_error } ) },
    formSubmit : function(event) {
        event.preventDefault()
        var fid = feedback.info('AJAXing').id
        var form = $(this)[0]
        var data = $(form).serializeArray();
        $.ajax( {
            fid: fid,
            type: form.method,
            url: form.action,
            data: data,
            dataType: 'json',
            success: ajaxified.on_success_form,
            error: ajaxified.on_error } ) },
    init : function() {
        $('body').on('click', 'a[target!=_blank]', this.aClick)
        $('body').on('submit', 'form', this.formSubmit) },
    on_error : function(data) { //* TODO test
        feedback.remove(this.fid)
        console.log('this, data', this, data)
        feedback.error('Ran into trouble while AJAXing... (see console for more info)') },
    on_success_a : function(data) {
        feedback.remove(this.fid)
        dustify(data) },
    on_success_form : function(data) { 
        feedback.remove(this.fid)
        dustify(data) } }

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
    dust.render('shows', res.result, function(err, out) {
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

var on_res_user_auth = function(res, e, ajax) {
    if (res.error) feedback(res.error);
    else {
        dust.render('user', res, function(err, out) { 
            var out = $(out);
            var old = $('section.user');
            old.replaceWith(err || out);
        });
    }
};

var on_res_season_toggleseen = function(res, e, ajax) {
    var cur_season = $(e.target).parents('article.season');
    dust.render('season', res, function(err, out) {
        var season = $(out);
        cur_season.replaceWith(err || season);
        ui_update_status_upstream(season);
    });
};

var on_res_episode_toggleseen = function(res, e, ajax) {
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
 * Get the closest ancestor matching one of the given selectors.
 * <
 *  jQuery object
 *  Array of CSS selectors (strings)
 */
var get_closest_ancestor = function(e, selectors) {
    if (!Array.isArray(selectors)) return;
    var p = e.parent();
    if (p.length == 0) return;
    for (var i = 0; i < selectors.length; i++)
        if (p.is(selectors[i]))
            return p;
    return get_closest_ancestor(p, selectors);
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
    _currentPic : 'gplaypattern.png',
    _getNextPicture : function() {
        backgroundizer._currentPic = backgroundizer._pictures.shift();
        backgroundizer._pictures.push(backgroundizer._currentPic);
        return backgroundizer._currentPic;
    },
    nextPic : function() {
        $('body').css('background-image', 'url("/img/subtlepatterns/' + backgroundizer._getNextPicture() + '")');
    }
};


/**
 * Generic toggler
 */
var togglit = {
    init : function() {
        $('body').on('click', '.toggle', this.on_toggle)
        this.hide_hiddens() },

    //* Hide all hidden toggleables.
    hide_hiddens : function() {
        $('.toggle[data-state=false]').each(function(a, b) {
            var e = $(this)
            e.parents('article').children(e.data('toggle')).hide() }) },

    on_toggle : function() {
        var toggler = $(this)
        var article = toggler.parents('article')
        var toggleable = article.children(toggler.data('toggle'))
        toggleable.toggle(120, function() {
            var visible = toggleable.is(':hidden')
            toggler.attr('data-state', !visible)
            scrollTo(article) } ) } }

/**
 * DOM ready
 */
$(function() {
    ajaxified.init()
    togglit.init()

    //* UI stuff
    /*
    $('body').on('click', 'section.user form .submit',
            ajaxify.form(on_res_user_auth));

    $('#shows').on('click', 'article.show a.remove',
            ajaxify.a(on_res_show_remove));
    $('#shows').on('click', 'article.show a.update',
            ajaxify.a(on_res_show_update));
    $('#shows').on('click', 'article.season a.toggleseen',
            ajaxify.a(on_res_season_toggleseen));
    $('#shows').on('click', 'article.episode a.toggleseen',
            ajaxify.a(on_res_episode_toggleseen));

    $('#finder').on('click', 'form .find.button', ajaxify.form(on_res_find));
    $('#finder').on('click', 'a.add.button', ajaxify.a(on_res_add));
    */

    //* needed for pretty colors
    $('article.season').each(function(i, e) {
        ui_update_status_upstream(e);
    });

    //* Testing background-pictures.
    $('body > header').on('click', backgroundizer.nextPic);
});
