
var push = require('./PushService');

module.exports = init;
function init (opt) {

    // optional params
    opt = opt || {};

    var pg = opt.pg;
    require('pg-spice').patch(pg);
    var cstr = opt.conString;


    var PGPubsub = require('pg-pubsub');
    var pgpubsub = new PGPubsub(cstr);

    return {
        doListen: function () {

            pgpubsub.addChannel('trip', function (payload) {
                console.log("trip -->", payload);
                var p = payload.split(',');
                notifyTripClose(p[0], p[1],p[2]);
            });

        }


    }
}

    function notifyTripClose(trip_id, customer_id, customer_email) {
       console.log("ricevuto trip close id: " +trip_id + " customer: " + customer_id + " customer_email: " + customer_email);
       var params = {
           beginning:"da poco",
           amount:"tantissimi soldi",
           username: customer_email
       };
       push.sendEndTrip(params, function (data, err) {
           console.log(JSON.stringify(data));
           console.log(JSON.stringify(err));
       })
    }
