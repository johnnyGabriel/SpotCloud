var User = function(_id) {

    var id, info, likes, playlists;

    function user() {
        if (_id) {
            id = _id;
        }
    }

    user.prototype.getInfo = function() {

        var promise = $.Deferred();

        SC.get("/users/"+ id, function(data) {
            info = data;
            promise.resolve(data);
        });

        return promise;

    };

    user.prototype.getPlaylists = function() {
        
        var promise = $.Deferred();

        SC.get("/users/"+ id +"/playlists", function(data) {
            playlists = data;
            promise.resolve(data);
        });

        return promise;

    };

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

    };

    return new user();

};