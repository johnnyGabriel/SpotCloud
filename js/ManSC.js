ManSC = {

    sound: null,
    playlist: null,
    queue: null,
    running: null,
    elements: null,
    timer: null,

    init: function(_elem) {

        this.elements = _elem;
        SC.initialize({
            client_id: "b2c09660b859d9f40dc3eb3106c74cd3"
        });

    },
    getPlaylist: function(_playlistId) {

        var promise = $.Deferred();

        SC.get("/playlists/"+ _playlistId, function(data) {

            ManSC.playlist = data;

            var html = '';

            $.each(ManSC.playlist.tracks, function(index, val) {

                html += "<li rel='" + val.id + "'>" +
                            "<span></span>" +
                            "<span>" +
                                "<div>" + val.title + "</div>" +
                            "</span>" +
                        "</li>";

            });

            ManSC.elements.playlist.html(html);
            ManSC.queue = ManSC.playlist.tracks;

            promise.resolve(data);

        });

        return promise;

    },
    insertInList: function(_tracks) {

        ManSC.playlist.tracks = _tracks;

        var html = '';

        $.each(ManSC.playlist.tracks, function(index, val) {

            html += "<li rel='" + val.id + "'>" +
                        "<span></span>" +
                        "<span>" +
                            "<div>" + val.title + "</div>" +
                        "</span>" +
                    "</li>";

        });

        ManSC.elements.playlist.html(html);
        ManSC.queue = ManSC.playlist.tracks;

    },
    prev: function() {

        if (this.running > 0)
            this.running--;
        else
            return;

        this.play(this.queue[this.running].id);

    },
    next: function() {

        if (this.running < this.queue.length-1)
            this.running++;
        else
            return;

        this.play(this.queue[this.running].id);

    },
    play: function(_id) {

        //executa o bloco se for comando play/pause
        if (!_id) {

            if (this.sound) {

                if ((!this.sound.playState) || (this.sound.paused))
                    this.sound.play();
                else if (this.sound.playState)
                    this.sound.pause();

                return;

            }
            return;
        }

        //checa se já existe uma track tocando para parar e descarregar ela
        if (this.sound !== null) {
            this.sound.stop();
            this.sound.unload();
        }

        SC.stream(_id, {
            autoPlay: true, 
            volume: this.getVolume(), 
            onfinish: function() {
                ManSC.next();
            }
        }, function(data) {

            //preenche as infos da track
            var elmts = ManSC.elements,
                index = '',
                track = ManSC.playlist.tracks.filter(function(el, i) {

                    if (el.id == _id) {
                        index = i;
                        return el;
                    }

                })[0];

            ManSC.running = index;

            elmts.coverShadow.attr('src', (track.artwork_url || 'images/empty-vinil.png').replace('large', 't200x200'));
            elmts.cover.attr('src', (track.artwork_url || 'images/empty-vinil.png').replace('large', 't200x200'));
            elmts.name.attr('title', track.title);
            elmts.name.html(track.title);
            elmts.artist.attr('title', track.user.username);
            elmts.artist.html(track.user.username);

            //guarda o objeto de som na variavel 'sound' do controlador
            ManSC.sound = data;

            //chama o atualizador de progresso
            if (!this.timer) {
                this.timer = setInterval(function() {
                    ManSC.updateTime();
                }, 500);
            }

        });
    },
    getVolume: function() {
        return parseInt(this.elements.volume.css('left'));
    },
    setVolume: function(vol) {

        //verifica se existe o objeto de som para mudar o volume, caso contrário não executa nada
        if (this.sound)
            this.sound.setVolume(vol);

    },
    getTime: function() {

        return this.sound.position;

    },
    setTime: function(seconds) {

        if (!seconds) {
            seconds = this.getTime();
        }
        sec = Math.floor((seconds / 1000) % 60);
        min = Math.floor((seconds / 60000) % 60);
        pos = seconds * 100 / this.sound.durationEstimate;

        this.sound.setPosition(seconds);
        
    },
    updateTime: function() {

        //variaveis com o calculo de tempo e posição dos elementos marcadores de progresso
        var currentTime = this.getTime(),
            currentSec = Math.floor((currentTime / 1000) % 60),
            currentMin = Math.floor((currentTime / 60000) % 60),
            currentHrs = Math.floor((currentTime / 3600000) % 60),
            currentPos = currentTime * 100 / this.sound.durationEstimate,
            totalTime = this.sound.durationEstimate,
            totalSec = Math.floor((totalTime / 1000) % 60),
            totalMin = Math.floor((totalTime / 60000) % 60),
            totalHrs = Math.floor((totalTime / 3600000) % 60);

        //atualiza a posição do slider de progresso
        this.elements.timeBar.slider({
            value: currentPos
        });


        function formatTwoNumbers(_num) {
            return (_num.toString().length == 1 ? "0" + _num : _num);
        }

        var currentTimeFormated = (currentHrs ? currentHrs+':' : '') + (currentHrs ? formatTwoNumbers(currentMin) : currentMin) + ":" + formatTwoNumbers(currentSec),
            totalTimeFormated = (totalHrs ? totalHrs+':' : '') + (totalHrs ? formatTwoNumbers(totalMin) : totalMin) + ":" + formatTwoNumbers(totalSec); 

        this.elements.timeCurrent.text(currentTimeFormated);
        this.elements.timeTotal.text(totalTimeFormated);
        
        //atualiza o tempo atual da track
        // this.elements.timeCurrent.text((currentHrs ? currentHrs : '') + currentMin+ ":" +(currentSec.toString().length == 1 ? '0' + currentSec: currentSec));
        
        //atualiza o tempo total da track
        // this.elements.timeTotal.text((totalHrs ? totalHrs : '') + totalMin+ ":" +(totalSec.toString().length == 1 ? '0' + totalSec : totalSec));
    }
};

User = function(_id) {

    var id, info, likes, playlists;

    function user() {
        if (_id) id = _id;
    }

    user.prototype.getInfo = function() {

        var promise = $.Deferred();

        SC.get("/users/"+ id, function(data) {
            info = data;
            promise.resolve(data);
        });

        return promise;

    }

    user.prototype.getPlaylists = function() {
        
        var promise = $.Deferred();

        SC.get("/users/"+ id +"/playlists", function(data) {
            playlists = data;
            promise.resolve(data);
        });

        return promise;

    }

    user.prototype.getLikes = function(_limit) {

        var promise = $.Deferred(),
            limit = (_limit ? _limit : 50),
            next_href = false;

        SC.get("/users/"+ id +"/favorites", {'limit': limit, 'linked_partitioning': 1}, function(data) {
            
            next_href = (data.next_href ? data.next_href : false);
            
            
            // while (next_href) {

            //     SC.get(next_href, function(data) {
                    
            //     });

            // } 

            likes = data.collection;
            promise.resolve(data.collection);

        });

        return promise;

    }

    return new user();

}