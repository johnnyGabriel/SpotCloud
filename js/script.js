$(function() {

    //cria o slider de volume
	$("#masterVolume").slider({
        value: 50,
        orientation: "horizontal",
        range: "min",
        animate: false,
        step: 1
    });

    //cria o slider de progresso
    $("#masterProgress").slider({
        value: 0,
        orientation: "horizontal",
        range: "min",
        animate: false,
        step: 0.1
    });

    //eventos dos sliders
    $('#masterVolume').on('slide', function() {

        var vol = $(this).slider('option', 'value');
        ManSC.setVolume(vol);

    });

    $('#masterProgress').on('slide', function() {

    	var seconds = ManSC.sound.durationEstimate * $(this).slider('option', 'value') / 100;
    	ManSC.setTime(seconds);

    });

    //inicialização do controlador da api soundcloud
	ManSC.init({
        play: $('.playButton'),
		playlist: $('#container-tracks').find('ul'),
		cover: $('#cover'),
		coverShadow: $('.cover-shadow').find('img'),
		name: $('#trackName'),
		artist: $('#artistName'),
		volume: $('#masterVolume').find('span'),
		timeBar: $('#masterProgress'),
		timeCurrent: $('#currentPosition'),
		timeTotal: $('#totalPosition')
	});

	//obter playlist
	ManSC.getPlaylist(80472526);

    //cria uma nova instancia do objeto 'User'
    var user = new User('56382936');

    posBackgroundCover();

	//evento de click em uma track da playlist
	$('#container-tracks').on('click', 'span:nth-child(1)', function() {
		ManSC.play($(this).parent().attr('rel'));
	});

    //evento de click do botão play
    $('.playButton').on('click', function() {
        ManSC.play();
    });

    //evento de click do botão próxima
    $('.right').on('click', function() {
        ManSC.next();
    });
    
    //evento de click do botão anterior
    $('.left').on('click', function() {
        ManSC.prev();
    });


    $('#likes').on('click', 'li', function() {
        user.getLikes(50).done(function(data) {
            ManSC.insertInList(data);
        });
    });

    $('#playlists').on('click', 'li', function() {
        var id = $(this).attr('data-id');
        ManSC.getPlaylist(id);
    });

    $(window).resize(function() {
        
        posBackgroundCover();

    });

    function posBackgroundCover() {

        //calcula o valor da posição da cover de fundo sempre que acontece um resize da tela
        var pos = ($(window).height() / 2) - ($('.cover-shadow').width() / 2);
        $('.cover-shadow').find('img').css('left', -pos);

    }
    
});