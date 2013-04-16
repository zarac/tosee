/**
 * Dust.js stuff
 */
dust.onLoad = function(name, callback) {
    $.get(['views/', '.dust.html'].join(name), function(data) {
        callback(null, data) }, 'html').error(function() {
        console.log('Missing template "' + name + '".') }) }


/**
 * dustify
 *  render ajax reponse data based on its field(s)
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
    else if (data.user) {
        if (data.user.query) {
            dust.render('user-find', data.user, function(err, out) { 
                $('section.user section.find').replaceWith(out) } ) }
        else {
            dust.render('user', data, function(err, out) {
                $('section.user').replaceWith(out) }) } }
    else if (data.finder) {
        dust.render('finder-result', data.finder, function(err, out) {
            out = $(out)
            $('#finder section.result').replaceWith(out) }) }
    else {
        console.log(' === unhandled data', data)
        feedback.warning('Sorry, unable to handle data.') } }


/**
 * UI refreshers / updaters
 */
var ui_update_show_status = function(showE) {
    var show = $(showE)
    var seasons = show.find('article.season')
    var status = true
    for (var i = 0; i < seasons.length; i++) {
        if (!ui_update_season_status(seasons[i]))
            status = false }
    if (status)
        show.attr('data-status', 'seen')
    else
        show.attr('data-status', 'unseen') }

var ui_update_season_status = function(seasonE) {
    var season = $(seasonE)
    var episodes = season.find('article.episode')
    for (var i = 0; i < episodes.length; i++) {
        if ($(episodes[i]).data('status') == 'unseen') {
            season.attr('data-status', 'unseen')
            return false } }
    season.attr('data-status', 'seen')
    return true }


/**
 * scrollTo
 *  Scroll to an element.
 */
function scrollTo(element) {
    $("html, body").stop().animate( { scrollTop: element.offset().top - 5 },
            300) }


/**
 * AJAXify A and FORM elements.
 *  ! dust and the dustify snippet
 *  * The targets must be RESTful like URLs. (actually, not really)
 *  * The responses must be JSON format and the name of the property is the
 *    name of the model to be dustified. E.g. { season: { .. } }.
 */
var ajaxify = {
    aClick : function(event) {
        event.preventDefault()
        var fid = feedback.info('AJAXing').id
        var href = $(this).attr('href')
        $.ajax( {
            foo: 'bar',
            fid: fid,
            url: href,
            dataType: 'json',
            success: ajaxify.on_success_a,
            error: ajaxify.on_error } ) },

    formContentChange : function(event) {
        var form = event.currentTarget.form
        if (form.password.value.length == 0)
            if (form.username.value.length < 1) {
                $('section.user section.find').html('') }
            else {
                $(form).trigger('submit') } }, 

    formSubmit : function(event) {
        event.preventDefault()
        console.log('submitted')
        var fid = feedback.info('AJAXing').id
        var form = $(this)[0]
        var data = $(form).serializeArray()
        $.ajax( {
            fid: fid,
            type: form.method,
            url: form.action,
            data: data,
            dataType: 'json',
            success: ajaxify.on_success_form,
            error: ajaxify.on_error } ) },

    init : function() {
        $('body').on('click', 'a[target!=_blank]', this.aClick)
        $('body').on('submit', 'form', this.formSubmit) },
        //$('body').on('keyup', 'form input[name="username"]',
                //this.formContentChange) },

    on_error : function(data) { //* TODO test
        feedback.remove(this.fid)
        feedback.error('Ran into trouble while AJAXing. [' + data.status + ' : ' + data.responseText + '].') },

    on_success_a : function(data) {
        feedback.remove(this.fid)
        dustify(data) },

    on_success_form : function(data) { 
        feedback.remove(this.fid)
        dustify(data) } }



//* update status where relevant
var ui_update_status_upstream = function(season) {
    //* season
    var season = $(season)
    var unseen_episodes = season.find('article.episode[data-status=unseen]')
    if (unseen_episodes.length > 0)
        season.attr('data-status', 'unseen')
    else
        season.attr('data-status', 'seen')
    //* show
    var show = season.parents('article.show')
    var unseen_seasons = show.find('article.season[data-status=unseen]')
    if (unseen_seasons.length > 0)
        show.attr('data-status', 'unseen')
    else
        show.attr('data-status', 'seen') }


/**
 * Get the closest ancestor matching one of the given selectors.
 * <
 *  jQuery object
 *  Array of CSS selectors (strings)
 */
var get_closest_ancestor = function(e, selectors) {
    if (!Array.isArray(selectors)) return
    var p = e.parent()
    if (p.length == 0) return
    for (var i = 0; i < selectors.length; i++)
        if (p.is(selectors[i]))
            return p
    return get_closest_ancestor(p, selectors) }


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
        'white_carbon.png' ],
    _currentPic : 'gplaypattern.png',
    _getNextPicture : function() {
        backgroundizer._currentPic = backgroundizer._pictures.shift()
        backgroundizer._pictures.push(backgroundizer._currentPic)
        return backgroundizer._currentPic },
    nextPic : function() {
        $('body').css('background-image', 'url("/img/subtlepatterns/' + backgroundizer._getNextPicture() + '")') } }


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
    ajaxify.init()
    togglit.init()

    //* needed for pretty colors
    $('article.show').each(function(i, e) {
        ui_update_show_status(e) })

    //* Testing background pictures.
    $('body > header').on('click', backgroundizer.nextPic) })
