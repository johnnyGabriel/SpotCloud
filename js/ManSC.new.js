var ManSC = function(clientID, opts) {

	var client_ID = null,
		elements = {},
		soundMan = null,
		currentTrack = null,
		currentPlaylist = null,
		viewedPlaylist = null,
		queue = null,
		timers = {},
		coverSize = "t200x200",
		publicFunctions = null;

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

		publicFunctions = this;

	}

	function getVolume() {
		return elements.volume.slider('option', 'value');
	}

	function writeTrackInfoOnScreen() {

		elements.name.text(currentTrack.title).attr('title', currentTrack.title);
		elements.artist.text(currentTrack.user.username).attr('title', currentTrack.user.username);
		elements.cover.attr('src', (currentTrack.artwork_url || "images/empty-vinil.png").replace('large', coverSize));
		elements.coverShadow.attr('src', (currentTrack.artwork_url || "images/empty-vinil.png").replace('large', coverSize));

	}

	function trackTimer() {

		var currentTime, currentSec, currentMin, currentHr, currentTimeFormated, currentPos;

		return setInterval(function() {

			currentTime = soundMan.position;

			currentSec = Math.floor((currentTime / 1000) % 60);
			currentMin = Math.floor((currentTime / 60000) % 60);
			currentHr = Math.floor((currentTime / 3600000) % 60);

            currentPos = currentTime * 100 / soundMan.durationEstimate;

			currentTimeFormated = (currentHr ? currentHr+':' : '') + (currentHr ? formatTwoNumbers(currentMin) : currentMin) + ":" + formatTwoNumbers(currentSec);
			
			elements.timeBar.slider({ value: currentPos });
			elements.timeCurrent.text(currentTimeFormated);

		}, 500);

	}

	function formatTwoNumbers(_num) {
        return (_num.toString().length === 1 ? "0" + _num : _num);
    }

    function isEmpty(obj) {

    	for (var i in obj) {
    		if (obj.hasOwnProperty(i)) {
    			return false;
    		}
    	}

    	return true;
    }

	function calcTrackEstimatedDuration() {

		var duration, durationSec, durationMin, durationHrs, durationFormated;

		function calcDuration() {
			duration = soundMan.durationEstimate;
			durationSec = Math.floor((duration / 1000) % 60);
			durationMin = Math.floor((duration / 60000) % 60);
			durationHrs = Math.floor((duration / 3600000) % 60);
			durationFormated = (durationHrs ? durationHrs+':' : '') + (durationHrs ? formatTwoNumbers(durationMin) : durationMin) + ":" + formatTwoNumbers(durationSec); 
			elements.duration.text(durationFormated);
		}

		return setInterval(function() {

			calcDuration();

		}, 1000);


	}

	manSC.prototype.play = function(_id) {

		var promise = $.Deferred();

		if (!isEmpty(viewedPlaylist)) {

			if (viewedPlaylist.title !== (currentPlaylist ? currentPlaylist.title : "")) {
				currentPlaylist = viewedPlaylist;
				viewedPlaylist = {};
			}

		}

		//pára a track anterior e limpa da memória
		if (soundMan) {
			soundMan.stop();
			soundMan.unload();
		}

		SC.stream(_id, {

				autoPlay: true,
				volume: getVolume(),
				onfinish: function() {

					publicFunctions.next();
					promise.resolve();

				},
				ondataerror: function() {

					console.log('error');
				}

			}, function(data) {

				//armazena o indice da track atual
				var index = "";

				//seta o objeto controlador de som
				soundMan = data;

				//retira o foco do item da lista gráfica da track anterior
				if (currentTrack) {
					var oldElement = $("[rel='"+ currentTrack.id +"']");
					oldElement.removeClass('selected');
					oldElement.children('span').first().removeClass('pause').removeClass('play-paused');
				}

				//coloca o foco no item da lista gráfica da track atual
				var newElement = $("[rel='"+ _id +"']");
				newElement.addClass('selected');
				newElement.children('span').first().addClass('pause');


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

				//inicia o timer de contagem de duração da track
				timers.trackDuration = calcTrackEstimatedDuration();

			}
		);

	};

	manSC.prototype.playToggle = function() {

		if (soundMan) {

			return soundMan.paused ? soundMan.resume() : soundMan.pause();

		}

	};


	manSC.prototype.previous = function() {

		if (currentPlaylist.index > 0) {

			this.play(currentPlaylist.tracks[--currentPlaylist.index].id);

		}

	};


	manSC.prototype.next = function() {

		if (currentPlaylist.index < currentPlaylist.tracks.length - 1) {

			this.play(currentPlaylist.tracks[++currentPlaylist.index].id);

		}

	};

	manSC.prototype.setPosition = function(seconds) {

		if (soundMan) {

	        soundMan.setPosition(seconds);

		}

	};

	manSC.prototype.showInPlaylistPanel = function(title, data) {

		var html = '';

        $.each(data, function(index, val) {

            html += "<li rel='" + val.id + "'>" +
                        "<span class='checked'></span>" +
                        "<span>" +
                            "<div>" + val.title + "</div>" +
                        "</span>" +
                    "</li>";

        });

        elements.playlist.html(html);

    	viewedPlaylist = {};
        viewedPlaylist.title = title;
        viewedPlaylist.tracks = data;
    	
	};

	manSC.prototype.setVolume = function(vol) {

		//verifica se o objeto de som foi iniciado
		if (soundMan) {
			soundMan.setVolume(vol);
		}

	};

	manSC.prototype.getDuration = function() {

		if (soundMan) {

			return soundMan.durationEstimate;
			
		}

	};

	return new manSC();

};