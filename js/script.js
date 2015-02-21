$(function() {

	ManSC = {

		sound: null,

		init: function() {

			SC.initialize({
		        client_id: "b2c09660b859d9f40dc3eb3106c74cd3"
		    });

			SC.get("/playlists/80472526", function(data) {

		    	var container = $('#container-tracks').find('ul'),
		    		html = '',
		    		tracks = data.tracks;

		    	$.each(tracks, function(index, val) {
		  
		    		 html += "<li rel='"+ index +"'>"+
		        				"<span></span>"+
		        				"<span>"+
		        					"<div>"+ val.title +"</div>"+
		        				"</span>"+
		        			 "</li>";

		    	});

		    	container.append(html);

		    	$('#container-tracks').on('click', 'span:nth-child(1)', function() {

		    		var index = $(this).parent().attr('rel'),
		    			trackId = tracks[index].id,
		    			trackArt = (tracks[index].artwork_url || 'images/empty-vinil.png').replace('large', 't200x200');

		    		ManSC.play("/tracks/"+trackId, {autoPlay: true});
		    		$('#cover').attr('src', trackArt);

		    	});
		    });
		},
		play: function(_track, _params) {

			if(this.sound !== null) {
				this.sound.stop();
				this.sound.unload();
			}

			SC.stream(_track, _params, function(data) {
				ManSC.sound = data;
				ManSC.sound.setVolume(50);
			});

		}


	};

	ManSC.init();

    
});