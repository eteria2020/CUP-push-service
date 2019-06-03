/**
 Questo file si occupa della notifica periodica ogni 30 minuti di corsa aperta
 */
const push = require('./PushService')({});

var pg = require('pg');
pg.defaults.poolSize = 25;

pg.defaults.poolIdleTimeout = 20000; // 20 sec
var config = require("../config");
var timeService = require("./TimeService");
var Db = require("./db")({pg: pg, conString: config.conString});
var time = 60;
var interval = 45 * 60; //45 minutes

module.exports = init;

function init(opt) {

    // optional params
    opt = opt || {};

    if (typeof opt.time !== "undefined")
        time = opt.time;
    if (typeof opt.interval !== "undefined")
        time = opt.interval;


    return {
        doListen: function () {

            setInterval(fetchForTrip, time * 1000);
			setInterval(getLongTrips, time * 1000);
			
        }


    }
}

function fetchForTrip() {
	var fetchForTripQuery = "with recursive tab(unholy,trip_id, customer_id, time) as (\n" +
		"\tselect ($2-(extract(epoch from DATE_TRUNC('second', now())) - extract(epoch from timestamp_beginning))::int%$2)unholy , id , customer_id,timestamp_beginning\n" +
		"\tFROM trips WHERE \n" +
		"\ttimestamp_beginning>(now()-interval '24 hours') AND\n" +
		"\t timestamp_end is null order by id desc)\n" +
		" SELECT unholy, trip_id, customer_id, email,time from tab, customers WHERE unholy<$1 and customer_id = customers.id";
	var fetchForTripQueryParams = [time, interval];

	Db.executeQuery(fetchForTripQuery, fetchForTripQueryParams, function (err) {
		console.log(err);

	}, function (res, err) {
		//invia notifica a tutti quelli presenti in res
		//console.log(res.rows);

		for (var i = 0; i < res.rowCount; i++) {
			var dataEn = new Date(res.rows[i].time);
			var dataIta = timeService.getDataIta(dataEn);
			var params = {
				//FULVIO MALISSIMO !!

				beginning: dataIta,
				username: res.rows[i].email
			};

			push.sendOpenTrip(params, function (data, err) {
				console.log(JSON.stringify(data));
				console.log(JSON.stringify(err));
			});

		}
	})

}

function getLongTrips() {//trips longer than 3 hours
    var longTripTimeHours = 3;
	var fetchGetLongTripsQuery = "select trips.id as trip_id,car_plate,customer_id,mobile,timestamp_beginning,longitude,latitude,battery,km from trips,customers,cars where cars.plate = trips.car_plate and timestamp_end is null and customers.id=trips.customer_id and customers.maintainer=false and customers.gold_list=false and timestamp_beginning <= (now() - interval '"+longTripTimeHours+" hours') order by timestamp_beginning desc;";

	Db.executeQuery(fetchGetLongTripsQuery, null, function (err) {
		console.log(err);
	}, function (res, err) {
	    var tripsData = res.rows;
		for (var i = 0; i < tripsData.length; i++) {
			var trip = tripsData[i];
			//console.log(trip.trip_id);
            checkIfSosAlreadyExist(trip);
		}
	})

}

function checkIfSosAlreadyExist(trip) {
	var fetchSos = "SELECT meta from messages_outbox WHERE meta::text like '%\"intval\": 6%' and meta::text like '%\"trip_id\": \""+trip.trip_id+"\"%' ORDER BY submitted desc limit 10;";
	Db.executeQuery(fetchSos, null, function (err) {
		console.log(err);
	}, function (res, err) {
		var sosData = res.rows;
		//console.log(fetchSos);
		if(sosData.length===0){
			//console.log(trip.trip_id,"insert new sos 3h");
			insertNewSos(trip);
		}else{
			//console.log(trip.trip_id,"sos già presente");
		}
	})
}

function insertNewSos(trip) {
    /*var data = JSON.stringify(JSON.parse('{"km": 3952, "geo": {"type": "Point", "coordinates": [9.124843, 45.48917383333334]}, "lat": 45.48917383333334, "lon": 9.124843,' +
        ' "imei": "861311008097502", "label": "SOS", "level": 0, "intval": 1, "txtval": "+393385708442", "battery": 80, "trip_id": "4947969", "event_id": 9, "car_plate": "EG73860", ' +
        '"json_data": null, "event_time": "2019-05-08T11:34:20.556Z", "customer_id": 196319, "server_time": "2019-05-08T11:34:23.992Z"}'));
    */
    var data = {};
    data.km = trip.km;
    data.geo = {"type" : "Point", "coordinates": [trip.longitude, trip.latitude]};
    data.lat = trip.latitude;
    data.lon = trip.longitude;
    data.imei = "";
    data.label = "SOS";
    data.level = 0;
    data.intval = 6;
    data.txtval = trip.mobile;
    data.battery = trip.battery;
    data.trip_id = trip.trip_id.toString();
    data.event_id = 9;
    data.car_plate = trip.car_plate;
    data.json_data = null;
    data.event_time = new Date().toISOString();
    data.customer_id = trip.customer_id;
    data.server_time = new Date().toISOString();
    data = JSON.stringify(data);

    var insertNewSos = "INSERT INTO \"public\".\"messages_outbox\" (\"id\",\"transport\",\"destination\",\"type\",\"subject\",\"text\",\"submitted\",\"sent\",\"acknowledged\",\"meta\",\"sent_meta\",\"webuser_id\")\n" +
		"VALUES (nextval('messages_outbox_id_seq'::regclass),NULL,'support','SOS','SOS call',NULL,now(),NULL,NULL,'"+data+"',NULL,NULL);";
	//console.log(insertNewSos);
	Db.executeQuery(insertNewSos, null, function (err) {
		console.log(err);
	}, function (res, err) {
		var sosData = res.rows;
		console.log(trip.trip_id,"insert new sos 3h");
	})
}