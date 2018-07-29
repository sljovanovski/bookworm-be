var controller = {}
module.exports = controller;
var request = require('request')
var db = require('../database');
var https = require('https');

controller.getAllBooks = (req, res) => {
  db('books')
    .select(['id', 'title', 'author', 'created_at'])
    .orderBy('created_at', "desc")
    .then(result => {
      return res.json(result)
    })
    .catch(err => {
      res.status(401).json({
        error: err.message || err.error || JSON.stringify(err)
      })
    })
}

controller.getBookById = (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({
      error: "This endpoint expects book id in the params"
    })
  }

  db('books')
    .select(['id', 'title', 'author', 'created_at'])
    .where('id', req.params.id)
    .then(results => {
      return res.json(results)
    })
    .catch(err => {
      res.status(401).json({
        error: err.message || err.error || JSON.stringify(err)
      })
    })
}