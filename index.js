var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var port = process.env.port || 8080;

var textURL = '';
var imgURL = '';

var imgLink = 'https://yt3.ggpht.com/-v0soe-ievYE/AAAAAAAAAAI/AAAAAAAAAAA/OixOH_h84Po/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';
var title ='Google';

var key = 'Google';


//Home page is index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){

    io.emit('update', title,imgLink);

    socket.on('chat message', function(msg){
        if(msg.substring(0,3) == '/s '){
            key = msg.substring(3,msg.length).toLowerCase();
            var temp = '';
            for(var x =0;x < key.length;x++){
                if(key.charAt(x) == ' '){
                    temp += '%20';
                }
                else
                    temp += key.charAt(x);
            }
            textURL = 'https://www.google.com/search?q=' + key;
            imgURL = 'https://imgur.com/search?q=' + temp;
        
        request(textURL, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);

                $('.r').filter(function(){

                    var data = $(this);
                    title = data.children().first().text();
                    
                });
                console.log("Search: " + title);

                io.emit('title search', title);
            }
        });
        request(imgURL, function(error, response, html){

            if(!error){
                var $ = cheerio.load(html);


                var data = $('.image-list-link');
                imgLink = data.children().first().attr('src');
                console.log(imgLink);


                io.emit('image search', imgLink);
            }
        });
        
    }
    else if(msg.substring(0,3) == '/g '){

        var guess = msg.substring(4,msg.length).toLowerCase();
        if(guess = key)
            io.emit('chat message', 'Correct. ' + key + ' is the answer.');
        else 
            console.log("Incorrect");

    }
    else
        io.emit('chat message', msg);
  });
});
http.listen(port, function(){
  console.log('listening on *:3000');
});