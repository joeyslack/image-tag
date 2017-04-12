/**
* App for indexing media with auto-tagging. Also has search and retreival methods for getting Flares 
* App hosted on https://mighty-island-62228.herokuapp.com/
* UPDATE: This has been modified for global consumption, move keys to env variables. Good luck.
*/

// Load .env configs
require('dotenv').config()

//var basicAuth = require('basic-auth-connect');
var express = require('express');
var pg = require('pg');
var request = require('request');
var Clarifai = require('clarifai');

var app = express();
// If you want to protect your http routes... maybe make better password while you're at it, and through it in env var.
app.use(basicAuth('admin', 'password'));

/****************
* INITIALIZATION
****************/

// Clarifai video auto-tagging API
Clarifai.initialize({
  'clientId': process.env.CLARIFAI_CLIENTID,
  'clientSecret': process.env.CLARIFAI_SECRET
});

// Postgres connection string
var conString = "postgres://" + process.env.PG_USER + ":" + process.env.PG_PASS + "@" + process.env.PG_PATH + "/" + process.env.PG_DATABASE + "?ssl=false";

// Authenticator
//app.use(basicAuth('admin', 'flarebears'));

// Initialize listen port for heroku. We'll use 5000 locally
app.set('port', (process.env.PORT || 5000));

// Start listenng
app.listen(app.get('port'), function() {
    console.log('Node is now running on port: ' + app.get('port'));
});

/****************
* INDEXING
****************/

var indexClarifai = function(req, res) {
	var count = 0;
	var limit = 1000;
	// Make this point to whatever you are sending in request
	req.objects.forEach(function(prop, index) {
		Clarifai.getTagsByUrl(prop.get('video')._url).then(
			function(response) {

				console.log("Got clarifai data!");

				var tags_probability = {};
				response.results[0].result.tag.classes[0].forEach(function(prop, i) {
					tags_probability[prop] = response.results[0].result.tag.probs[0][i];						
				});

				pg.connect(conString, function(err, client, done) {
					console.log("inserting");

					client.query('INSERT INTO "clarifai" (meta, results, tags, type, file, flare_id, service, probability, tags_probability, flare_created_at, "user") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
					[JSON.stringify(response.meta), JSON.stringify(response.results[0].result), JSON.stringify(response.results[0].result.tag.classes[0]), 'video', prop.get('video')._url, prop.id, 'clarifai', JSON.stringify(response.results[0].result.tag.probs[0]), tags_probability, prop.get('createdAt'), prop.get('user').id], 
					function(err, result) {
						if (limit >= count) {
							console.log("goodbye!");
						}

						if (err) {
							return console.error("Insert query failed", err);
						}

						done();
					});
				});
			},
			function(error) {
				console.log(error.results[0].result);
				if (limit >= count) {
					console.log("goodbye!");
				}
			}
		);
	});
}

var indexImagga = function(req) {
	var apiKey = process.env.IMAGGA_KEY;
	var apiSecret = process.env.IMAGGA_SECRET;
	var count = 0;

	req.objects.forEach(function(prop, index) {
		count++;
		console.log(count);
		
		if (prop.get('image')) {
			setTimeout(function() {
				request.get('https://api.imagga.com/v1/tagging?url='+encodeURIComponent(prop.get('image').url()), function (error, response, body) {
					var parseBody = JSON.parse(body);
					var tags_probability = {};
					var tags = [];
					var probability = [];
					var results;

					if (parseBody.results && parseBody.results.length > 0) {
						
						results = parseBody.results;
						parseBody.results[0].tags.forEach(function(p, i) {
							tags_probability[p['tag']] = p['confidence'];
							tags.push(p['tag']);
							probability.push(p['confidence']);
						});

						pg.connect(conString, function(err, client, done) {
							client.query('INSERT INTO "imagga" (results, file, tags, probability, tags_probability, flare_created_at, "user") VALUES ($1, $2, $3, $4, $5, $6, $7)',
							[JSON.stringify(results), prop.get('image').url(), JSON.stringify(tags), JSON.stringify(probability), JSON.stringify(tags_probability), prop.get('createdAt'), prop.get('user').id], 
							function(err, result) {
								if (err) {
									return console.error("Insert query failed", err);
								}

								console.log("insert done! " + prop.get('createdAt'));

								// release to pool
								done();
							});
						});
					}
				}).auth(apiKey, apiSecret, true);
			}, 1000 * count); // wait 1 second between API calls, because, we have to for rate limiting. Would be much more ideal to use a promise, or async await for this.
		}
	}); //forEach
}


/****************
* ROUTING
****************/

// Search for tags
app.get('/search', function(req, res) {
	// Get search term
	var searchTerm = req.query.q;
	pg.connect(conString, function(err, client, done) {
		client.query('SELECT * FROM imagga WHERE tags::jsonb @> \'["' + searchTerm + '"]\'',
		function(err, results) {
			if (err) {
				return console.error("Insert query failed", err);
			}

			var output = "";
			var resultArray = [];

			if (results && results.rows) {
				results.rows.sort(function(a, b) {
				    return parseFloat(b.tags_probability[searchTerm]) - parseFloat(a.tags_probability[searchTerm]);
				});

				results.rows.forEach(function(row, i) {
					// You like dirty html? I hope so.
					output += "<div style='display:inline-block; margin-bottom:10px;'><img src='" + row.file + "' width='50%' /><BR />" + row.flare_created_at + "<BR />" + row.user + "<BR /><strong>" + Math.round(row.tags_probability[searchTerm]) + "</strong></div>";
				});
			}

			// release to pool
			done();

			res.send(output);
			res.end();
		});
	});
});

// Search for tags
app.get('/searchJSON', function(req, res) {
	// Get search term
	var searchTerm = req.query.q;
	pg.connect(conString, function(err, client, done) {
		client.query('SELECT * FROM imagga WHERE tags::jsonb @> \'["' + searchTerm + '"]\' LIMIT 500',
		function(err, results) {
			if (err) {
				return console.error("select query failed", err);
			}

			var output = "";
			var resultArray = [];

			if (results && results.rows) {
				results.rows.sort(function(a, b) {
				    return parseFloat(b.tags_probability[searchTerm]) - parseFloat(a.tags_probability[searchTerm]);
				});
			}

			// release to pool
			done();

			res.json(results.rows.slice(0,20));
		});
	});
});

// Just a logger utility, because xcode 8 is broken
app.get('/logger', function(req, res) {
	console.log(JSON.stringify(req));
});
