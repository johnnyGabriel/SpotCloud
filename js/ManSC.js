ManSC = {

    sound: null,
    playlist: null,
    queue: null,
    running: null,
    elements: null,

    init: function(_elem) {

        this.elements = _elem;
        SC.initialize({
            client_id: "b2c09660b859d9f40dc3eb3106c74cd3"
        });

    },
    getPlaylist: function(_playlistId) {

        var promise = $.Deferred();

        SC.get("/playlists/80472526", function(data) {

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

            promise.resolve(data);

        });

        return promise;

    },
    play: function(_id) {

        if (this.sound !== null) {
            this.sound.stop();
            this.sound.unload();
        }

        SC.stream(_id, {autoPlay: true}, function(data) {

        	ManSC.running = _id;

            //preenche as infos da track
            var elmts = ManSC.elements,
                track = ManSC.playlist.tracks.filter(function(el) {
                    return el.id == _id;
                })[0];

            elmts.cover.attr('src', (track.artwork_url || 'images/empty-vinil.png').replace('large', 't500x500'));
            elmts.name.html(track.title);
            elmts.artist.html(track.user.username);

            //toca a track
            ManSC.sound = data;
            ManSC.sound.setVolume(100);

        });
    }

};
