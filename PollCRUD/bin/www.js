var app = require("../app"); //Require our app
var keypress = require("keypress");

keypress(process.stdin);

var server = app.listen(1919, function() {
    console.log("Express server listening on port " + server.address().port);
});
