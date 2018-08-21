#!/usr/bin/env nodemon -e js,ls

'use strict';

// https://bob:secret@localhost:8023/v2/cars

var config = require('./config');
var conString = config.conString;
var standardPort = config.port;
var unsecurePort =  config.unsecurePort;
var logPath = config.logPath;

// INIT
var restify = require('restify');
var pg = require('pg');
pg.defaults.poolSize = 25;
pg.defaults.poolIdleTimeout=5000; // 5 sec

var fs = require('fs');
var validator = require('validator');
var morgan = require('morgan');
var bunyan = require('bunyan');

var BasicStrategy = require('passport-http').BasicStrategy;
var server;
var unsecureServer;
var log = bunyan.createLogger({
  name: "ws",
  streams: [{
    path : logPath + 'webservices.log'
  }],
  serializers: restify.bunyan.serializers
});


//Notify Receiver
var notifyReceiver = require('./inc/NotifyReceiver')( {pg: pg, conString: conString});
notifyReceiver.doListen();


var defaultDistance = 300;

// exports for modules
var expo = {
	conString: conString,
	pg: pg,
	port: standardPort,
	validator: validator,
	defaultDistance: defaultDistance
};
exports.expo = expo;

fs.existsSync(logPath) || fs.mkdirSync(logPath);

var accessLogStream = fs.createWriteStream(logPath + 'webservices_access.log', {flags: 'a'});

var funcs = require('./inc/restFunctions');

//restify.CORS.ALLOW_HEADERS.push('Accept-Encoding');
//restify.CORS.ALLOW_HEADERS.push('Accept-Language');

// / INIT


/* auth */



/* / auth */

/* register server */

function registerServer(server) {



	server.use(restify.queryParser());
	server.use(restify.bodyParser());
	server.use(restify.throttle({
	    burst: 200,
	    rate: 200,
	    ip: true
	    /*overrides: {
		    '192.168.1.1': {
		      rate: 0,        // unlimited
		      burst: 0
		    }
		  }*/
	}));
	server.use(restify.CORS());

    server.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',{ stream : accessLogStream}));


	server.on('InternalServerError', function(req, res, err, cb) {
	    err._customContent = 'Error';
	    console.log('InternalServerError',err);
	    return cb();
	});
	server.on('InternalError', function(req, res, err, cb) {
	    err._customContent = 'Error';
	    console.log('InternalError',err);
	    return cb();
	});

	server.on('ResourceNotFoundError', function(req, res, err, cb) {
	    err._customContent = 'Not found';
	    console.log('ResourceNotFound');
	    console.log(err);
	    return cb();
	});

	server.on('uncaughtException', function (req, res, route, err) {
	  console.log('======= server uncaughtException');
	  console.log(err);
	  res.send(200, { handler: 'server uncaughtException'});
	 /* if (err.status <= 399 && err.status >= 500) {
		process.nextTick( process.exit(1) );
	  }*/
	  // handleError(req, res, route, err);
	});
	process.on('uncaughtException', function (err) {
	  console.log('==== process uncaughtException');
	  err = err || {};
	  console.log('======== ', arguments);
	  /*if (!(err.status >= 400 && err.status <= 499)) {
		process.nextTick( process.exit(1) );
	  }*/
	});
/* /errors */


    server.get(
        '/push/:segment',
        funcs.pushToSegment
    );

    server.get(
        '/endTrip/:username',
        funcs.endTripForUsername
    );


/* / routes */
}

/* / register server */


/* server */

    log.info('Webservice startup');
    var responseFormatter = {
            'application/json': function customizedFormatJSON( req, res, body ) {
	            if ( body instanceof Error ) {
	                res.statusCode = body.statusCode || 500;

	                if ( body.body ) {
	                	console.log('\nERROR\n\n===============\n');
	                	console.log(body);
	                	res.statusCode = 400;
	                    body = {
	                        status: 400,
	                        reason: "Invalid parameters",
	                        time: Date.now() / 1000 | 0
	                    };
	                } else {
	                	if(res.statusCode === 403 || res.statusCode === 404){
	                		body = {
	                			status: res.statusCode,
		                        code: body.message
		                    };
	                	}else{
							body = {
		                        msg: body.message
		                    };
	                	}
	                }
	            } else if ( Buffer.isBuffer( body ) ) {
	                body = body.toString( 'base64' );
	            }

	            var data = JSON.stringify( body );
	            res.setHeader( 'Content-Length', Buffer.byteLength( data ) );

	            return data;
            }
    };


	server = restify.createServer({
            certificate: fs.readFileSync('ssl/server.cer'),
            key: fs.readFileSync('ssl/server.key'),
            ca:  fs.readFileSync('ssl/ca.cer'),
            requestCert:        false,
            rejectUnauthorized: false,
            name: 'Sharengo',
            formatters: responseFormatter,
            log: log
	});
    log.info('Created standard server');


    unsecureServer = restify.createServer({
	    name: 'Sharengo',
	    formatters: responseFormatter,
	    log: log
	});
    log.info('Created unsecure debug server');

    registerServer(server);
    registerServer(unsecureServer);

    server.listen({host:'0.0.0.0',port:standardPort});
    log.info('Listen standard server: ' + standardPort);

    unsecureServer.listen({host:'0.0.0.0',port:unsecurePort});
    log.info('Listen unsecure debug server: ' + unsecurePort);

    console.log("Started...");





