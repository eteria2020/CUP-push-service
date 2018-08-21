

module.exports = {
    pushToSegment: function (params, cb) {

        var message = {
            app_id: "202ca4a0-8ec3-4db3-af38-2986a3138106",
            contents: {"en": "English Message","it":"Body"},
            headings: {"en": "English Message","it":"TitleData"},
            included_segments: [params.segment],
            data:{
                "t": 3
            }
        };

        sendNotification(message,cb);
    },
    sendEndTrip: function (params, cb) {

        var message = {
            app_id: "202ca4a0-8ec3-4db3-af38-2986a3138106",
            contents: {"en": "English Message","it":"Hai terminato con successo la corsa iniziata "+params.beginning +" ed ha avuto un costo di "+params.amount},
            headings: {"en": "English Message","it":"Hai finito la corsa"},
            filters: [
                {"field": "tag", "key": "username", "relation": "=", "value": params.username}
            ],
            data:{
                "t": 1
            }
        };

        sendNotification(message, cb);
    }
};


var sendNotification = function(data, cb) {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic ZjhiMGIzYzYtMTJmNS00YWE0LTg1ZjYtMWM0NDY1ZjgxNmEx"
    };

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };

    var https = require('https');
    //console.log(options)
    var req = https.request(options, function(res) {
        res.on('data', function(data) {
            console.log(JSON.parse(data));
            cb(JSON.parse(data),null);
        });
    });

    req.on('error', function(e) {
        cb(null,e);
    });

    req.write(JSON.stringify(data));
    req.end();
};