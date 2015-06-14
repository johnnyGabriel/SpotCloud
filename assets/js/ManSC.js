var ManSC = function(clientID, opts) {

	var client_ID = null,
		elements = {},
		soundMan = null,
		startMuted = false,
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

				//verifica se a primeira execução deve ser muted
				if (startMuted) {
					soundMan.mute();
				}

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

	manSC.prototype.mute = function(_callback) {

		if (soundMan) {

			if (!soundMan.muted) {

				soundMan.mute();
				startMuted = true;

			} else {

				soundMan.unmute();
				startMuted = false;
			}

		} else {

			startMuted = !startMuted;
		}

		if (_callback) {

			_callback(startMuted);
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

		var html = "<li class='container-tracks__columns-title'>"+
                        "<span></span>"+
                        "<span>Name</span>"+
                        "<span>Artist</span>"+
                        "<span>Duration</span>"+
                        "<span>Views</span>"+
                    "</li>";

        $.each(data, function(index, val) {

            html += "<li rel='" + val.id + "'>" +
                        "<span class='checked'></span>" +
                        "<span title=\"" + val.title + "\">" + val.title + "</span>" +
                        "<span title=\"" + val.user.username + "\">"+ val.user.username +"</span>" +
                        "<span>"+ formatTime(val.duration) +"</span>" +
                        "<span title='" + formatTrackCount(val.playback_count) + " views'>|||||||</span>" +
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

    function formatTrackCount(_num) {

        var numero_formatado = _num;
        var escalas = ['', 'K', 'M', 'G'];
        var index = 0;
        var temp = 0;

        while ((temp = parseInt(numero_formatado / 1000)) > 0) {

            numero_formatado = temp;
            index++;

        }

        return numero_formatado + escalas[index];

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

		var currentTime, currentPos;

		return setInterval(function() {

			currentTime = soundMan.position;
            currentPos = currentTime * 100 / soundMan.durationEstimate;

			elements.timeBar.slider({ value: currentPos });
			elements.timeCurrent.text(formatTime(currentTime));

		}, 500);

	}

	function twoDecimals(_number) {
        return (_number < 10 ? "0" + _number : _number);
    }


    function formatTime(_time) {

    	var sec, min, hrs;

    	sec = Math.floor((_time / 1000) % 60);
    	min = Math.floor((_time / 60000) % 60);
    	hrs = Math.floor((_time / 3600000) % 60);

    	return (hrs ? hrs + ":" + twoDecimals(min) : min ) + ":" + twoDecimals(sec);

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

		function calcDuration() {
			elements.duration.text(formatTime(soundMan.durationEstimate));
		}

		return setInterval(function() {

			calcDuration();

		}, 1000);


	}

	return new manSC();

};