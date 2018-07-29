var controller = {}
module.exports = controller;

const bcrypt = require('bcrypt');
const Promise = require('bluebird');
const compare = Promise.promisify(bcrypt.compare);
const jwt = require('jwt-simple')

var db = require('../database');

controller.login = (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      error: "This endpoint expects username, password in the POST body"
    });
  }
  if (req.session && req.session.loggedInUser) {
    return res.json({
      loggedInUser: req.session.loggedInUser
    })
  }

  db('users')
    .select(['id_user', 'user_name', 'email', 'aktiven'])
    .where(validateEmail(req.body.username) ? 'email' : 'user_name', req.body.username)
    .where('pass', req.body.password)
    .limit(1)
    .then((results) => {
      if (results.length === 0) {
        throw new Error("Invalid username/password");
      }
      return results[0];
    })
    .then((user) => {
      return Promise.all([
        jwt.encode(user, 'xxx', 'HS512', {}),
      ]);
    })
    .spread((user) => {
      req.session.loggedInUser = user
      return res.json({
        loggedInUser: user
      });
    })
    .catch((err) => {
      console.log(err)
      res.status(401).json({
        error: err.message || err.error || JSON.stringify(err)
      });
    });
};

controller.logout = (req, res) => {
  req.session.destroy();
  return res.json({});
};

controller.getUser = (req, res) => {
  if (req.session.loggedInUser) {
    return res.json({
      loggedInUser: req.session.loggedInUser
    });
  } else {
    return res.status(401).json({});
  }
}

controller.getUserMobile = (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({
      error: "This endpoint expects user id as parameter"
    });
  }
  db('users')
    .select(['id_user', 'user_name', 'email', 'aktiven'])
    .where('id_user', userId)
    .limit(1)
    .then((results) => {
      if (results.length === 0) {
        throw new Error("Invalid id");
      }
      return results[0];
    })
    .then((user) => {
      return res.json(user)
    })
}

controller.ensureUser = (req, res, next) => {
  if (req.session.loggedInUser) {
    return next();
  } else {
    return res.status(401).json({
      error: "You need to login to use this"
    });
  }
}

controller.register = async (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    return res.status(400).json({
      error: "This endpoint expects username, password and email in the POST body"
    });
  }
  let userExist = false;

  //check if user_name exist
  await db('users')
    .select(['user_name'])
    .where('user_name', req.body.username)
    .limit(1)
    .then((results) => {
      if (results.length > 0) {
        userExist = true
        return res.status(500).json({
          error: "Корисниќкото име е зафатено"
        })
      }
    })

  //check if email exist
  await db('users')
    .select(['email'])
    .where('email', req.body.email)
    .limit(1)
    .then((results) => {
      if (results.length > 0) {
        userExist = true
        return res.status(500).json({
          error: "Емаил адресата веќе пости"
        })
      }
    })

  if (!userExist) {
    const id = await db('users').max('id_user').limit(1).then(results => {
      return results[0].max
    })
    db('users')
      .insert({
        "id_user": id + 1,
        "email": req.body.email,
        "user_name": req.body.username,
        "pass": req.body.password,
        "aktiven": 1,
        "app": "mk-vesti",
        "createdat": new Date().toISOString(),
      })
      .returning(['id_user', 'user_name', 'email', 'aktiven'])
      .then(result => {
        const user = jwt.encode(result[0], 'xxx', 'HS512', {})
        return res.json({
          loggedInUser: user
        });
      })
      .catch(error => {
        return res.status(500).json({
          error: error.message
        })
      })
  }
}

controller.updatePassword = (req, res) => {
  const password = req.body.password;
  const userId = req.body.uid;
  if (!password || !userId) {
    return res.status(400).json({
      error: "This endpoint expects password in the POST body"
    });
  }

  db('users')
    .where('id_user', userId)
    .update('pass', password)
    .then(result => {
      return res.json({
        success: true
      })
    })
}

controller.updateEmail = async (req, res) => {
  const email = req.body.email;
  const userId = req.body.uid;
  if (!email || !userId) {
    return res.status(400).json({
      error: "This endpoint expects email in the POST body"
    });
  }

  var canUpdate = true

  //check if email exist
  await db('users')
    .select(['email'])
    .where('email', req.body.email)
    .limit(1)
    .then((results) => {
      if (results.length > 0) {
        canUpdate = false
        return res.status(500).json({
          error: "Емаил адресата веќе пости"
        })
      }
    })

  if (canUpdate) {
    db('users')
      .where('id_user', userId)
      .update('email', email)
      .then(result => {
        return res.json({
          success: true
        })
      })
  }
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}