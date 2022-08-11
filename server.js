var express = require("express");
 var app = express();


 /* serves main page */
 app.get("/", function(req, res) {
    res.sendFile(__dirname + '/public/'+ 'index.html')
 });

  app.post("/user/add", function(req, res) {
	/* some server side logic */
	res.send("OK");
  });

 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){
     res.sendFile( __dirname + '/public/'+req.params[0],{},function(err){
     if (err) {
       console.log("Missing:"+err.path);
       res.status(err.status).end();
     }
     else {
       console.log('Sent:', req.params[0]);
     }
  });
 });

 var port = process.env.PORT || 8000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });
