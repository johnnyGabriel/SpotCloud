var ManSC = function(clientID, opts) {

	var client_ID = null,
		elements = {},
		soundMan = null,
		coverSize = "t200x200";

	function manSC() {

		if (clientID) {

			client_ID = clientID;

			SC.initialize({
				client_id: "b2c09660b859d9f40dc3eb3106c74cd3"
			});

		}

		if (opts)
			elements = opts;

	}

	function writeTrackInfoOnScreen() {

		elements.trackName.text(currentTrack.title).attr('title', currentTrack.title);
		elements.trackUser.text(currentTrack.user.username).attr('title', currentTrack.user.username);
		elements.cover.attr('src', (currentTrack.artwork_url || "images/empty-vinil.png").replace('large', coverSize));
		elements.backgroundCover.attr('src', (currentTrack.artwork_url || "images/empty-vinil.png").replace('large', coverSize));

	}

	function updateTime() {

		var currentTime, currentSec, currentMin, currentHr, currentTimeFormated;

		currentPosTimer = setInterval(function() {

			currenTime = soundMan.position;
			currentSec = Math.floor((currentTime / 1000) % 60);
			currentMin = Math.floor((currentTime / 60000) % 60);
			currentHr = Math.floor((currentTime / 3600000) % 60);
			currentTimeFormated = (currentHr ? currentHr+':' : '') + (currentHr ? formatTwoNumbers(currentMin) : currentMin) + ":" + formatTwoNumbers(currentSec);
			elements.timeCurrent.text(currentTimeFormated);

		}, 1000);

	}

	function formatTwoNumbers(_num) {
        return (_num.toString().length == 1 ? "0" + _num : _num);
    }

	function calcTrackEstimatedDuration() {

		var duration, durationSec, durationMin, durationHrs, durationFormated;

		estimatedDurTimer = setInterval(function() {

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

		manSC = SC.stream(_id, {

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
					if (el.id == _id) {
						index = i;
						return el;
					}
				})[0];

				//atualiza a posição 'index' da track atual na playlist atual
				currentPlaylist.index = index;

				//chama a função para escrever na tela as informações da track
				writeTrackInfoOnScreen();

			}
		)

	}

	return new manSC();

}