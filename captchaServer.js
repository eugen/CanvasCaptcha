var http = require('http');
var qs = require('querystring');
var redis = require('redis');
var Guid = require('guid');
var createCaptcha = require('./canvasCaptcha.js').createCaptcha;

var redisClient = redis.createClient();

http.createServer(function(request,response) { 
    response.writeHead(200, {"Content-Type": "text/html"});
    if(request.method == "GET") {
	var captcha = createCaptcha();
	var guid = Guid.raw();
	redisClient.setex(guid, 20, captcha.word);
	response.write("<html><body><h1>Captcha!</h1><img src='" + captcha.url + "'/><form method='POST'><input type='hidden' name='guid' value='"+guid+"'/><input type='text' name='captcha'/><input type='submit'/></form></body</html>");
	response.end();
    } else {
	var postData = '';
	request.addListener("data", function(data) { postData += data; });
	request.addListener("end", function() { 
	    var post = qs.parse(postData);
	    redisClient.get(post.guid, function(err, word) {
		if(word) {
		    redisClient.del(post.guid);
		}
		console.log({ sudmitted: post.captcha, 'found-on-redis': word });
		var isCorrect = word && word == post.captcha;
		response.write(isCorrect ? "<h1>Yay!</h1>" : "nay.");
		response.end();
	    });
	});
    }
}).listen(8080);

console.log("Running server");