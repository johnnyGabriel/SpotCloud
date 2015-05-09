/*global ManSC, User*/

$(function() {

    /*
    ---------------------------------------------------------------------
    FUNCTIONS 
    ---------------------------------------------------------------------
    */

    //calcula a posição da cover de fundo
    function posBackgroundCover() {

        var pos = ($(window).height() / 2) - ($('.cover-shadow').width() / 2);
        $('.cover-shadow').find('img').css('left', -pos);

    }

    /*
    ---------------------------------------------------------------------
    ONLOAD
    ---------------------------------------------------------------------
    */

    //inicializa o slider de volume
	$("#masterVolume").slider({
        value: 50,
        orientation: "horizontal",
        range: "min",
        animate: false,
        step: 1
    });

    //inicializa o slider de progresso
    $("#masterProgress").slider({
        value: 0,
        orientation: "horizontal",
        range: "min",
        animate: false,
        step: 0.1
    });


    //parâmetro da classe manSC
    var options = {
        play: $('.playButton'),
        playlist: $('#container-tracks').find('ul'),
        cover: $('#cover'),
        coverShadow: $('.cover-shadow').find('img'),
        name: $('#trackName'),
        artist: $('#artistName'),
        volume: $('#masterVolume'),
        timeBar: $('#masterProgress'),
        timeCurrent: $('#currentPosition'),
        duration: $('#totalPosition')
    };

    //cria nova instancia da classe manSC
    var manSC = new ManSC("b2c09660b859d9f40dc3eb3106c74cd3", options);

    //cria uma nova instancia do objeto 'User'
    var user = new User('56382936');

    //preenche a lista de playlists
    user.getPlaylists().done(function(data) {

        var html = "";

        $.each(data, function(index, val) {

            html += "<li data-id='"+ val.id +"'>"+
                        val.title+
                    "</li>";

        });

        $('#playlists').html(html);

    });

    //posiciona a cover de fundo
    posBackgroundCover();



    /*
    ---------------------------------------------------------------------
    EVENTS
    ---------------------------------------------------------------------
    */

    //evento slider do volume
    $('#masterVolume').on('slide', function() {

        var vol = $(this).slider('option', 'value');
        manSC.setVolume(vol);

    });

    //evento slider da barra de progresso 
    $('#masterProgress').on('slide', function() {

        var seconds = manSC.getDuration() * $(this).slider('option', 'value') / 100;
        manSC.setPosition(seconds);

    });

    //evento hover dos itens de playlist
    $('#container-tracks').on('mouseenter', 'li', function() {

        if (!$(this).hasClass('selected')) {
            $(this).find('span').first().addClass('play');
        }

    })
    .on('mouseleave', 'li', function() {

        if (!$(this).hasClass('selected')) {
            $(this).find('span').first().removeClass('play');
        }

    });


    //evento de click no botão 'play'
    $('#container-tracks, #playerControls').on('click', '.play', function() {

        $('.play').removeClass('play').addClass('pause');
        manSC.play(parseInt($(this).parent().attr('rel')));

    });

    //evento de click no botão 'pause'
    $('#container-tracks, #playerControls').on('click', '.pause', function() {

        $('.pause').removeClass('pause').addClass('play-paused');
        manSC.playToggle();

    });

    //evento de click no botão 'play' depois de pausado
    $('#container-tracks, #playerControls').on('click', '.play-paused', function() {

        $('.play-paused').removeClass('play-paused').addClass('pause');
        manSC.playToggle();

    });

    //evento de click do botão próxima
    $('.right').on('click', function() {

        manSC.next();

    });
    
    //evento de click do botão anterior
    $('.left').on('click', function() {

        manSC.previous();

    });

    //evento de click da playlist 'likes'
    $('#likes').on('click', function() {

        user.getLikes(200).done(function(data) {

            manSC.showInPlaylistPanel('Likes', data);
            
        });

    });

    //evento de click em uma playlist do menu 'playlists'
    $('#playlists').on('click', 'li', function() {

        var id = $(this).attr('data-id');
        user.getPlaylist(id).done(function(data) {

            manSC.showInPlaylistPanel(data.title, data.tracks);

        });

    });

    //evento de resize da tela
    $(window).resize(function() {
        
        //ajusta a posição da cover de fund sempre que acontece o resize da tela
        posBackgroundCover();

    });
    
});