const push = require('./PushService')({});
var timeService = require("./TimeService");

var config = require('../config');
const queuedTimeout = config.queuedTimeout || 30000;
const receivedTimeout = config.receivedTimeout || 90000;

module.exports = init;

/**
 *
 * @param opt
 * @return {NotifyReceiver}
 */
function init(opt) {

    // optional params

    return new NotifyReceiver(opt);


}

/**
 *
 * @param opt
 * @constructor
 */
function NotifyReceiver(opt) {
    // optional params
    opt = opt || {};
    this.queuedTimeoutReference = [];
    this.receivedTimeoutReference = [];
    this.Db = opt.db;
}

/**
 *
 */
NotifyReceiver.prototype.doListen = function () {
    var instance = this;
    this.Db.addChannel('command_close', function (payload) {
        console.log(new Date().toISOString()+"\ncommand_close -->", payload);
        var p = payload.split(',');
        instance.notifyCommandClose(p[0], p[1], p[2], p[3]);
    });

    this.Db.addChannel('command_close_received', function (payload) {
        console.log(new Date().toISOString()+"\ncommand_close_received -->", payload);
        var p = payload.split(',');
        instance.notifyCommandCloseReceived(p[0], p[1], p[2], p[3]);
    });

    this.Db.addChannel('trip', function (payload) {
        console.log(new Date().toISOString()+"\ntrip -->", payload);
        var p = payload.split(',');
        instance.notifyTripClose(p[0], p[1], p[2], p[3], p[4], p[5]);
    });

};

/**
 *
 * @param trip_id
 * @param customer_id
 * @param customer_email
 * @param timestamp_beginning
 * @param duration
 * @param car_plate
 */
NotifyReceiver.prototype.notifyTripClose = function (trip_id, customer_id, customer_email, timestamp_beginning, duration, car_plate) {
    console.log(new Date().toISOString()+"\nricevuto trip close id: " + trip_id + " customer: " + customer_id + " customer_email: " + customer_email + " car_plate: " + car_plate);

    clearTimeout(this.queuedTimeoutReference[car_plate]);
    clearTimeout(this.receivedTimeoutReference[car_plate]);

    var params = {
        beginning: timeService.getDataForTimestampItaCloseTrip(timestamp_beginning),
        duration: duration,
        username: customer_email
    };
    push.sendEndTrip(params, function (data, err) {
        console.log(new Date().toISOString()+"\n"+JSON.stringify(data));
        console.log(new Date().toISOString()+"\n"+JSON.stringify(err));
    })
};

/**
 *
 * @param command_id
 * @param car_plate
 * @param queued
 */
NotifyReceiver.prototype.notifyCommandClose = function (command_id, car_plate, queued, customer_card) {
    console.log(new Date().toISOString()+"\nricevuto command close id: " + command_id + " car_plate: " + car_plate + " queued at: " + queued);


    try {
        clearTimeout(this.queuedTimeoutReference[car_plate]);
    } catch (Exception) {
        console.error(new Date().toISOString()+"\nEccezione in clear queuedTimeoutReference" + Exception.stack)
    }
    var instance = this;

    this.queuedTimeoutReference[car_plate] = setTimeout(function () {
        //controllo se il comando è stato inviato

        console.log(new Date().toISOString()+"\ntimeout passato controllo se comando inviato");
        instance.Db.checkCommandSent(command_id, errorQuery, function (result, errorCb) {

            if (result.rows[0].to_send) {//send notification to customer

                instance.Db.findCustomerFromRFID(customer_card, errorQuery, function (result, errorCb) {
                    if (result.rows.length > 0) {
                        var customer_email = result.rows[0].email;
                        console.log(new Date().toISOString()+"\nsendCommandCloseError to " + customer_email);
                        var params = {
                            username: customer_email
                        };
                        push.sendCommandCloseError(params, function (data, err) {
                            console.log(new Date().toISOString()+"\n"+JSON.stringify(data));
                            console.log(new Date().toISOString()+"\n"+JSON.stringify(err));
                        })
                    }
                });

            } else {
                instance.notifyCommandCloseReceived(command_id, car_plate, result.rows[0].received, customer_card);
            }

        });

        //Se comando non scaricato mando avviso di possibile problema di connettività della macchina / errore generico


    }, queuedTimeout);
};


/**
 *
 * @param command_id
 * @param car_plate
 * @param queued
 */
NotifyReceiver.prototype.notifyCommandCloseReceived = function (command_id, car_plate, received, customer_card) {
    console.log(new Date().toISOString()+"\nricevuto command close received id: " + command_id + " car_plate: " + car_plate + " queued at: " + received);

    try {
        clearTimeout(this.receivedTimeoutReference[car_plate]);
        clearTimeout(this.queuedTimeoutReference[car_plate]);
    } catch (Exception) {
        console.error(new Date().toISOString()+"\nEccezione in clear queuedInterval" + Exception.stack())
    }

    var instance = this;
    this.receivedTimeoutReference[car_plate] = setTimeout(function () {

        //comando inviato controllo che il trip venga effettivamente chiuso
        console.log(new Date().toISOString()+"\ntimeout passato controllo se comando ricevuto");
        instance.Db.checkifOpenTrip(car_plate, errorQuery, function (result, error) {

            if (result.rows.length > 0) {

                instance.Db.findCustomerFromRFID(customer_card, errorQuery, function (result, errorCb) {
                    if (result.rows.length > 0) {
                        var customer_email = result.rows[0].email;
                        var params = {
                            username: customer_email

                        };
                        push.sendTripCloseError(params, function (data, err) {
                            console.log(new Date().toISOString()+"\n"+JSON.stringify(data));
                            console.log(new Date().toISOString()+"\n"+JSON.stringify(err));
                        })
                    }
                });


            }
        });

        //Se trip non chiuso mando push

    }, receivedTimeout);

};

function errorQuery(err) {
    console.log(new Date().toISOString()+"\nERRORE QUERY" + err.stack);
}
