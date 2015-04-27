var ManSC = function(clientID, opts) {

	var client_ID = null,
		elements = {},
		soundMan = null,
		currentTrack = null,
		currentPlaylist = null,
		viewedPlaylist = null,
		queue = null,
		timers = {},
		coverSize = "t200x200";

	function manSC() {

		if (clientID) {

			client_ID = clientID;

			SC.initialize({
				client_id: client_ID
			});

		}

		if (opts) {
			elements = opts;
		}

	}

	function getVolume() {
		return elements.volume.slider('option', 'value');
	}

	function setVolume(vol) {

		//verifica se o objeto de som foi iniciado
		if (soundMan) {
			soundMan.setVolume(vol);
		}

	}

	function writeTrackInfoOnScreen() {

		elements.trackName.text(currentTrack.title).attr('title', currentTrack.title);
		elements.trackUser.text(currentTrack.user.username).attr('title', currentTrack.user.username);
		elements.cover.attr('src', (currentTrack.artwork_url || "images/empty-vinil.png").replace('large', coverSize));
		elements.backgroundCover.attr('src', (currentTrack.artwork_url || "images/empty-vinil.png").replace('large', coverSize));

	}

	function trackTimer() {

		var currentTime, currentSec, currentMin, currentHr, currentTimeFormated;

		return setInterval(function() {

			currentTime = soundMan.position;
			currentSec = Math.floor((currentTime / 1000) % 60);
			currentMin = Math.floor((currentTime / 60000) % 60);
			currentHr = Math.floor((currentTime / 3600000) % 60);
			currentTimeFormated = (currentHr ? currentHr+':' : '') + (currentHr ? formatTwoNumbers(currentMin) : currentMin) + ":" + formatTwoNumbers(currentSec);
			elements.timeCurrent.text(currentTimeFormated);

		}, 1000);

	}

	function formatTwoNumbers(_num) {
        return (_num.toString().length === 1 ? "0" + _num : _num);
    }

	function calcTrackEstimatedDuration() {

		var duration, durationSec, durationMin, durationHrs, durationFormated;

		return setInterval(function() {

			duration = soundMan.durationEstimate;
			durationSec = Math.floor((duration / 1000) % 60);
			durationMin = Math.floor((duration / 60000) % 60);
			durationHrs = Math.floor((duration / 3600000) % 60);
			durationFormated = (durationHrs ? durationHrs+':' : '') + (durationHrs ? formatTwoNumbers(durationMin) : durationMin) + ":" + formatTwoNumbers(durationSec); 
			elements.duration.text(durationFormated);

		}, 5000);

	}

	manSC.prototype.play = function(_id) {

		var promise = $.Deferred();

		if (viewedPlaylist.title !== currentPlaylist.title) {
			currentPlaylist = viewedPlaylist;
			viewedPlaylist = null;
		}

		soundMan = SC.stream(_id, {

				autoPlay: true,
				volume: getVolume(),
				onfinish: function() {
					promise.resolve();
				},
				ondataerror: function() {
					console.log('error');
				}

			}, function(data) {

				var index = "";

				//atualiza a variavel com objeto da track atual
				currentTrack = currentPlaylist.tracks.filter(function(el, i) {
					if (el.id === _id) {
						index = i;
						return el;
					}
				})[0];

				//seta o indice da track tocando na playlist
				currentPlaylist.index = index;

				//chama a função para escrever na tela as informações da track
				writeTrackInfoOnScreen();

				//inicia o timer de contagem de tempo
				timers.trackTime = trackTimer();

				//inicia o timer de contagem de duraça da track
				timers.trackDuration = calcTrackEstimatedDuration();

			}
		);

	};

	manSC.prototype.getPlaylist = function(_playlistId) {

		var promise = $.Deferred();

        SC.get("/playlists/"+ _playlistId, function(data) {

        	promise.resolve(data);

        	viewedPlaylist = data;

        });

        return promise;

	};

	manSC.prototype.showInPlaylistPanel = function(data) {

		var html = '';

        $.each(data, function(index, val) {

            html += "<li rel='" + val.id + "'>" +
                        "<span></span>" +
                        "<span>" +
                            "<div>" + val.title + "</div>" +
                        "</span>" +
                    "</li>";

        });

        elements.playlist.html(html);

        viewedPlaylist.tracks = data;


	};

	return new manSC();

};