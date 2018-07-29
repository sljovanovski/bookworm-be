let instance = null;
let app = null;

function setup() {
  const express = require("express");
  app = express();
  const config = require("./config");
  const bodyParser = require("body-parser");
  const session = require("express-session");
  const cors = require("cors");

  // var whitelist = ["*"]
  // var corsOptions = {
  //   origin: function (origin, callback) {
  //     if (whitelist.includes(origin) || origin === undefined) {
  //       callback(null, true)
  //     } else {
  //       callback(new Error("Not allowed by CORS"))
  //     }
  //   },
  //   methods: "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE",
  //   credentials: true
  // }

  // Setup database
  const db = require("./database");

  // app.use(cors(corsOptions));

  // app.use(function(req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "");
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //   next();
  // });
  // Add headers
  // app.use(function (req, res, next) {
  //
  //   // Website you wish to allow to connect
  //   res.setHeader("Access-Control-Allow-Origin", "https://bobigazda.herokuapp.com");
  //
  //   // Request methods you wish to allow
  //   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  //
  //   // Request headers you wish to allow
  //   res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  //
  //   // Set to true if you need the website to include cookies in the requests sent
  //   // to the API (e.g. in case you use sessions)
  //   res.setHeader("Access-Control-Allow-Credentials", true);
  //
  //   // Pass to next layer of middleware
  //   next();
  // });

  // Body parsing middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Setup sessions
  var sessObj = {
    secret: config.session.secret,
    name: "bobigazda-session",
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: false
    }
  }
  app.use(session(sessObj));

  // Setup server routes
  const routes = require("./routes");
  app.use(routes);

  return app;
}

function startServer(callback) {
  if (!app) setup();
  instance = app.listen(config.port, function () {
    console.log("Server now listening on", config.port);
    console.log();
    if (callback) callback();
  });
}

function stopServer() {
  if (instance) instance.close();
}

module.exports.setup = setup;
module.exports.start = startServer;
module.exports.stop = stopServer;

// Start the server if run directly through node
if (require.main === module) {
  startServer();
}
