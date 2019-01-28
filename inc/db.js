



module.exports = init;
function init(opt) {
    // optional params
    opt = opt || {};

    var pg = opt.pg;

    require('pg-spice').patch(pg);
    var conString = opt.conString;

    var PGPubsub = require('pg-pubsub');
    var pgpubsub = new PGPubsub(conString);
    console.log(conString);

    return {
        /**
         * This funcion is used to execute a single query and has been created to unify the error handling always passing the received error function to cb
         *
         * @param client pg client
         * @param query query to be excecuted
         * @param params prams for the current query
         * @param error function that accept ONE parameter that is the Error
         * @param {queryCallback} cb function that accept TWO parameter (result, error)
         *          result: the result of the query
         *          error: the the function that will handle future error
         */
        executeQuery: function (query, params, error, cb) {

            pg.connect(conString, function (err, client, done) {
                if (err) {
                    return console.error('error fetching client from pool', err);
                }
                client.query(
                    query,
                    params,
                    function (err, result) {
                        done();
                        if (err) {
                            logError(err, " query was " + query + params + err.stack);
                            error(err);
                        } else {
                            //console.log("excecuting query " + query + params);
                            cb(result, error);
                        }
                    });
            });

        },

        addChannel: function (channelName, callback) {
            pgpubsub.addChannel(channelName, callback);
        },
        /**
         *
         * @param command_id
         * @param {function} error
         * @param {queryCallback} cb
         */
        checkCommandSent: function (command_id, error, cb) {
            this.executeQuery("select to_send, received from commands where id = $1",[command_id],error, cb )


        },

        findCustomerFromRFID: function (customer_code, error, cb) {


            this.executeQuery("select email from customers where card_code = $1",[customer_code],error, cb )

        },
        checkifOpenTrip:function (car_plate, error, cb) {

            this.executeQuery("select id from trips where timestamp_end IS NULL AND car_plate = $1",[car_plate],error, cb )

        }


    }

}

function logError(error,msg){
    if(error){
        console.error(msg);
        return true;
    }else{
        return false;
    }
}


/**
 * This callback type is called `queryCallback` and is displayed as a global symbol.
 *
 * @callback queryCallback
 * @param {Result} result
 * @param {string} error
 */