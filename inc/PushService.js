

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
    /**
     *
     * @param {Object} params parametri di ingresso alla funzione
     * @param {string} params.beginning data di inizio corsa
     * @param {string} params.username email del cliente a cui inviare la notifica
     * @param {string} params.duration costo stimato della corsa
     * @param {notificationCallback}cb callback di risposta dell'invio della notifica
     */
    sendEndTrip: function (params, cb) {

        var message = {
            app_id: "202ca4a0-8ec3-4db3-af38-2986a3138106",
            contents: {"it":"Hai terminato con successo la corsa iniziata "+params.beginning +" ed ha avuto una durata di "+params.duration},
            headings: {"it":"Corsa chiusa: "},
            android_channel_id: "8aa11c59-93ed-4b02-a018-d63a34a569c9",
            filters: [
                {"field": "tag", "key": "username", "relation": "=", "value": params.username}
            ],
            data:{
                "t": 1
            }
        };

        sendNotification(message, cb);
    },
    /**
     *
     * @param {Object} params parametri di ingresso alla funzione
     * @param {string} params.beginning data di inizio corsa
     * @param {string} params.username email del cliente a cui inviare la notifica
     * @param cb
     */
    sendOpenTrip: function (params, cb) {

        var message = {
            app_id: "202ca4a0-8ec3-4db3-af38-2986a3138106",
            contents: {"it":"Hai una corsa aperta iniziata " + params.beginning + "\n Stai ancora utilizzando la macchina?"},
            headings: {"it":"Corsa aperta: "},
            //buttons: [{"id": "close trip", "text": "Chiudi la corsa", "icon": "ic_close"}],
            android_channel_id: "4a08ed2b-09b5-4a5b-9663-4623871fad86",
            filters: [
                {"field": "tag", "key": "username", "relation": "=", "value": params.username}
            ],
            data:{
                "t": 2
            }
        };

        sendNotification(message, cb);
    }
};

/**
 *
 * @param {Object}data
 * @param {notificationCallback}cb
 */
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

/**
 * This callback type is called `notificationCallback` and is displayed as a global symbol.
 *
 * @callback notificationCallback
 * @param {Object} result
 * @param {Object} error
 */