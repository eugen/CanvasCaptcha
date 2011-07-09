var http = require('http');
var createCaptcha = require('./canvasCaptcha.js').createCaptcha;

http.createServer(function(request,response) { 
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<html><body><h1>Captcha!</h1><img src='" + createCaptcha().url + "'/></body</html>");
    response.end();
}).listen(8080);

console.log("Running server");