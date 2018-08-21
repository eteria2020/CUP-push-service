var expo = require('../index').expo;
var pg = expo.pg;
var conString = expo.conString;
module.exports = {
    pushToSegment: function (req, res, next) {


        var push = require('./PushService');

        push.pushToSegment(req.params,function (data) {
            sendOutJSON(res,200,"send succesfully",data);
        });
        return next();
    },
    endTripForUsername: function (req, res, next) {
        next();
        push.sendEndTrip(req.params,function (data, err) {
            if(err){
                console.log("ERROR:");
                console.log(err);
            }
            else if(data){
                console.log("Response:");
                console.log(JSON.parse(data));
                sendOutJSON(res,200,"send succesfully",JSON.parse(data));
            }
        });
    }
};


/* EXTRA FUNCTIONS */







/***
 *
 * @param res
 * @param status
 * @param reason
 * @param data
 */
function sendOutJSON(res, status, reason, data) {
    res.send(status, {
        'status': status,
        'reason': reason,
        'data': data,
        'time': Date.now() / 1000 | 0,
    });
}



/**
 * console log request
 * @param  req request
 */
function logReq(req) {
    console.log(
            "====================\n",
            Date.now(),
            "\n--------------------\n",
            req.query,
            "\n--------------------\n",
            req.headers,
            "\n--------------------\n",
            req.params,
            "\n\n"
            );
}

