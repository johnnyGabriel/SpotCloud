$(function() {

	ManSC.init({
		playlist: $('#container-tracks').find('ul'),
		cover: $('#cover'),
		name: $('#trackName'),
		artist: $('#artistName')
	});

	ManSC.getPlaylist(80472526);

	//eventos
	$('#container-tracks').on('click', 'span:nth-child(1)', function() {
		ManSC.play($(this).parent().attr('rel'));
	});
    
});