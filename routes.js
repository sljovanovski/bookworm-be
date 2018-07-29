const express = require('express');
var router = express.Router(); // Contains all URLsyarn
var csv = require('fast-csv')
var fs = require('fs')
var db = require('./database');

module.exports = router;

const books = require('./controllers/books');
const quotes = require('./controllers/quotes');

//books
router.get('/books', books.getAllBooks)
router.get('/books/:id', books.getBookById)

//quotes
router.get('/quotes', quotes.getAllQuotes)
router.get('/quotes/:id', quotes.getQuoteById)

// router.get('/file', (req, res) => {
//   var stream = fs.createReadStream("./vesti.csv");
//   var d = []
//
//   var csvStream = csv()
//     .on("data", function (data) {
//       const vestiRow = {
//         id_vest:data[0],
//         naslov:data[1],
//         sodrzina:data[2],
//         link:data[3],
//         k_id_user:data[4],
//         pubdate:data[5],
//         imgurl:data[6],
//       }
//       d.push(vestiRow);
//     })
//     .on("end", () => {
//       db('vesti').insert(d).then(success => {
//         console.log("SUCESS >>> ", success)
//       })
//     });
//
//   stream.pipe(csvStream);
// })