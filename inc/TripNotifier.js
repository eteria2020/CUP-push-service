/**
 Questo file si occupa della notifica periodica ogni 30 minuti di corsa aperta
 */
const push = require('./PushService');

var pg = require('pg');
pg.defaults.poolSize = 25;
pg.defaults.poolIdleTimeout=5000; // 5 sec
var config = require("../config");
var timeService = require("./TimeService");
var Db = require("./db")({pg:pg,conString:config.conString});
var time = 60;
var interval = 30*60; //30 minutes

module.exports = init;

function init (opt) {

    // optional params
    opt = opt || {};

    if(typeof opt.time !== "undefined")
        time = opt.time;
    if(typeof opt.interval !== "undefined")
        time = opt.interval;
    

    return {
        doListen: function () {

            setInterval(fetchForTrip,time*1000);

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
    var fetchForTripQueryParams = [time,interval];
    
    Db.executeQuery(fetchForTripQuery,fetchForTripQueryParams,function (err) {
        console.log(err);
        
    },function (res, err) {
        //invia notifica a tutti quelli presenti in res
        //console.log(res.rows);

        for(var i=0;i<res.rowCount;i++){
            var dataEn = new Date (res.rows[i].time);
            var dataIta = timeService.getDataIta(dataEn);
            var params = {
                //FULVIO MALISSIMO !!

                beginning: dataIta,
                username : res.rows[i].email
            };

            push.sendOpenTrip(params, function (data, err) {
                console.log(JSON.stringify(data));
                console.log(JSON.stringify(err));
            });

        }
    })
    
}