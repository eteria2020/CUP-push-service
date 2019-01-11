

const push = require('./PushService')({});
var timeService = require("./TimeService");
const queuedTimeout = 30000;

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





            pgpubsub.addChannel('command_close', function (payload) {
                console.log("command -->", payload);
                var p = payload.split(',');
                notifyCommandClose(p[0], p[1],p[2]);
            });

            pgpubsub.addChannel('command_close_received', function (payload) {
                console.log("command -->", payload);
                var p = payload.split(',');
                notifyCommandCloseReceived(p[0], p[1],p[2]);
            });
            pgpubsub.addChannel('trip', function (payload) {
                console.log("trip -->", payload);
                var p = payload.split(',');
                notifyTripClose(p[0], p[1],p[2],p[3],p[4], p[5]);
            });

        }


    }
}

/**
 *
 * @param trip_id
 * @param customer_id
 * @param customer_email
 * @param timestamp_beginning
 * @param duration
 */
    function notifyTripClose(trip_id, customer_id, customer_email,timestamp_beginning, duration) {
       console.log("ricevuto trip close id: " +trip_id + " customer: " + customer_id + " customer_email: " + customer_email);

    function notifyTripClose(trip_id, customer_id, customer_email,timestamp_beginning, duration, car_plate) {
       console.log("ricevuto trip close id: " +trip_id + " customer: " + customer_id + " customer_email: " + customer_email  + " car_plate: " + car_plate);

       clearInterval(receivedTimeoutReference[car_plate]);

       var params = {
           beginning:timeService.getDataForTimestampItaCloseTrip(timestamp_beginning),
           duration:duration,
           username: customer_email
       };
       push.sendEndTrip(params, function (data, err) {
           console.log(JSON.stringify(data));
           console.log(JSON.stringify(err));
       })
    }

/**
 *
 * @param command_id
 * @param car_plate
 * @param queued
 */
var queuedTimeoutReference = [];
function notifyCommandClose(command_id, car_plate, queued) {
    console.log("ricevuto command close id: " +command_id + " car_plate: " + car_plate + " queued at: " + queued);

    queuedTimeoutReference[command_id] =  setTimeout(function (){
        //controllo se il comando è stato inviato

        db.checkCommandSent(command_id);
        que

        //Se comando non scaricato mando avviso di possibile problema di connettività della macchina / errore generico

        var params = {
            beginning:timeService.getDataForTimestampItaCloseTrip(timestamp_beginning),
            duration:duration,
            username: customer_email
        };


        push.sendEndTrip(params, function (data, err) {
            console.log(JSON.stringify(data));
            console.log(JSON.stringify(err));
        })

    },queuedTimeout);
}



var receivedTimeoutReference = [];
/**
 *
 * @param command_id
 * @param car_plate
 * @param queued
 */
function notifyCommandCloseReceived(command_id, car_plate, queued) {
    console.log("ricevuto command close received id: " +command_id + " car_plate: " + car_plate + " queued at: " + queued);

    try{
        clearInterval(queuedTimeoutReference[command_id]);
    }catch(Exception){
        console.error("Eccezione in clear queuedInterval" + Exception.stack())
    }

    receivedTimeoutReference[car_plate] =  setTimeout(function (){

        //comando inviato controllo che il trip venga effettivamente chiuso

        //Se trip non chiuso mando push
        var params = {
            beginning:timeService.getDataForTimestampItaCloseTrip(timestamp_beginning),
            duration:duration,
            username: customer_email
        };
        push.sendEndTrip(params, function (data, err) {
            console.log(JSON.stringify(data));
            console.log(JSON.stringify(err));
        })
    },queuedTimeout);

}
