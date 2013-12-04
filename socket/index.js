var User = require('../models/user.js');

var channels = [];

module.exports = function (sockets) {
    return function (socket) {
        if (socket.handshake.session) {
            var _id = socket.handshake.session.passport.user;
            User.find({_id: _id}, function (err, result) {
                var user = result[0];
                if (user) {
                    var publicProfile = {
                        _id: user._id,
                        id: user.id,
                        provider: user.provider,
                        name: user.name,
                        socketid: socket.id,
                        online: true
                    };
                    User.update(publicProfile, function (err, result) {
                        socket.broadcast.emit('user:online', publicProfile);
                        socket.emit('self', user);
                    });

                    socket.on('disconnect', function (data) {
                        publicProfile.socketid = null;
                        publicProfile.online = false;
                        User.update(publicProfile, function (err, result) {
                            socket.broadcast.emit('user:offline', publicProfile);
                        });
                    });

                    socket.on('self', function (data) {
                        socket.emit('self', user);
                    });
                }
            });
        } else {
            socket.emit('self', {});
        }
        // PUT ALL THE STUFF HERE
    }
};
