var express = require('express');
var app = express();
var appUrl = 'https://lit-headland-86744.herokuapp.com/';
var MongoClient = require('mongodb').MongoClient;
var path = require('path');

MongoClient.connect('mongodb://russelltchang:hackstack13!@ds237409.mlab.com:37409/urlshortdb', function(err, database) {
    var db = database.db('urlshortdb');

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    });

    app.get('/new/:longUrl(*)', function(req, res) {
        var longUrl = req.params.longUrl;
        var uniqueId = new Date().getTime();
        uniqueId = uniqueId.toString();
        uniqueid = uniqueId.slice(0, -2);
        var shortUrl = appUrl + String(uniqueId);

        db.collection('urlshort').insert({
            "longUrl" : longUrl,
            "shortUrl" : shortUrl,
            "uniqueId" : uniqueId
        }, function(err, data) {
            if (err) console.log('Error inserting into database');
            var l = data.ops[0].longUrl;
            var s = data.ops[0].shortUrl;
            var obj = {"original_url" : l, "short_url" : s}
            res.send(obj);
        })
    });

    app.get("/:uniqueId", function(req, res) {
        var uniqueId = req.params.uniqueId;

        db.collection('urlshort').find({
            "uniqueId" : uniqueId
        }).toArray(function(err, data) {
            if (err) console.log('Error finding shortened URL');
            if (data.length == 0) {
                console.log('No short URL matching this one in the database')
            }
            var l = data[0].longUrl;
            if (l.indexOf("http") == -1) {
                l = "http://" + l;
            }
            res.redirect(l);
        });
    });
}); //end MongoDB connection

var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server listening!');
});
