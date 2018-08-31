



module.exports = init;
function init(opt) {
    // optional params
    opt = opt || {};

    var pg = opt.pg;
    var conString = opt.conString;


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