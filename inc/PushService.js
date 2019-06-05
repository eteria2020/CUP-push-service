module.exports = module.exports = init;

/**
 *
 * @param opt
 * @return {{pushToSegment: pushToSegment, sendEndTrip: sendEndTrip, sendOpenTrip: sendOpenTrip, sendCommandCloseError: sendCommandCloseError, sendTripCloseError: sendTripCloseError}}
 */
function init(opt) {

    var config = require('../config');
    const defLang = config.defLang || "it";

    return {
        pushToSegment: function (params, cb) {

            var message = {
                app_id: "202ca4a0-8ec3-4db3-af38-2986a3138106",
                contents: {"en": "English Message", "it": "Body"},
                headings: {"en": "English Message", "it": "TitleData"},
                included_segments: [params.segment],
                data: {
                    "t": 3
                }
            };

            sendNotification(message, cb);
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
                contents: {
                    "en": "You have successfully closed your trip at " + params.beginning + " which had a duration of " + params.duration,
                    "it": "Hai terminato con successo la corsa iniziata " + params.beginning + " ed ha avuto una durata di " + params.duration,
                    "sk": "Úspešne ste ukončili svoju cestu na " + params.beginning + " ktorá mala trvanie" + params.duration
                },
                headings: {
                    "en": "Trip closed: ",
                    "it": "Corsa chiusa: ",
                    "sk": "Cesta bola zatvorená: "
                },
                android_channel_id: "8aa11c59-93ed-4b02-a018-d63a34a569c9",
                filters: [
                    {"field": "tag", "key": "username", "relation": "=", "value": params.username},
                    {"field": "tag", "key": "server", "relation": "=", "value": defLang}
                ],
                data: {
                    "t": 1
                }
            };

            console.log(new Date().toISOString()+"\nSending EndTrip to " + params.username);
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
                contents: {"en": "Hai una corsa aperta iniziata " + params.beginning + "\n Stai ancora utilizzando la macchina?"},
                headings: {"en": "Corsa aperta: "},
                //buttons: [{"id": "close trip", "text": "Chiudi la corsa", "icon": "ic_close"}],
                android_channel_id: "4a08ed2b-09b5-4a5b-9663-4623871fad86",
                filters: [
                    {"field": "tag", "key": "username", "relation": "=", "value": params.username}
                ],
                data: {
                    "t": 2
                }
            };

            console.log(new Date().toISOString()+"\nSending OpenTrip to " + params.username);
            sendNotification(message, cb);
        },
        sendCommandCloseError: function (params, cb) {
            var message = {
                app_id: "202ca4a0-8ec3-4db3-af38-2986a3138106",
                contents: {"en": "C'è stato un errore nel chiudere la tua corsa da remoto, riprova "},
                headings: {"en": "Errore chiusura corsa: "},
                //buttons: [{"id": "close trip", "text": "Chiudi la corsa", "icon": "ic_close"}],
                android_channel_id: "8aa11c59-93ed-4b02-a018-d63a34a569c9",
                filters: [
                    {"field": "tag", "key": "username", "relation": "=", "value": params.username}
                ],
                data: {
                    "t": 2
                }
            };
            console.log(new Date().toISOString()+"\nSending CommandCloseError to " + params.username);
            sendNotification(message, cb);

        },
        sendTripCloseError: function (params, cb) {
            var message = {
                app_id: "202ca4a0-8ec3-4db3-af38-2986a3138106",
                contents: {"en": "C'è stato un problema nel chiudere la tua corsa da remoto, hai girato le chiavi?"},
                headings: {"en": "Errore chiusura corsa:"},
                //buttons: [{"id": "close trip", "text": "Chiudi la corsa", "icon": "ic_close"}],
                android_channel_id: "8aa11c59-93ed-4b02-a018-d63a34a569c9",
                filters: [
                    {"field": "tag", "key": "username", "relation": "=", "value": params.username}
                ],
                data: {
                    "t": 2
                }
            };

            console.log(new Date().toISOString()+"\nSending TripCloseError to " + params.username);
            sendNotification(message, cb);

        }
    };
};

/**
 *
 * @param {Object}data
 * @param {notificationCallback}cb
 */
var sendNotification = function (data, cb) {
    console.log(new Date().toISOString()+"\nfailsafe");
	cb(null, "failsafe");
    return;
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
    var req = https.request(options, function (res) {
        res.on('data', function (data) {
            try {
                //console.log(JSON.parse(data));
                cb(JSON.parse(data), null);
            } catch (Exception) {
                console.error(new Date().toISOString()+"\n",Exception.stack);
                console.error(data);
                cb(null, Exception)
            }
        });
    });

    req.on('error', function (e) {
        cb(null, e);
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