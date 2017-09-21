var express= require('express');
var app = express();
var http = require('http').Server(app);

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

app.set('port', (process.env.PORT || 5000));
app.set('ip',(process.env.IP || 'localhost'));
app.use(express.static(__dirname + '/'));
var server = app.listen(app.get('port'),app.get('ip'), function() {
  console.log('Node app is running on port', app.get('port'));
});
var io = require('socket.io').listen(server);

var textURL = '';
var imgURL = '';

var imgLink = 'https://yt3.ggpht.com/-v0soe-ievYE/AAAAAAAAAAI/AAAAAAAAAAA/OixOH_h84Po/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';
var title ='Google';

var key = 'Google';
var answer = "";

//Home page is index.html

app.get('/', function(req, res){
  res.sendFile('index.html');
});

io.on('connection', function(socket){

    io.emit('update', answer,imgLink);

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
                
                answer = "";
                
                for(var x =0;x <key.length;x++){
                    
                    if(x == 0 || key.charAt(x-1) == " ")
                        answer+=key.charAt(x).toUpperCase() + " ";
                    else if(key.charAt(x) == " ")
                        answer += "__ ";
                    else{
                        answer += "_ ";
                    }
                    
                }

                io.emit('title search', answer);
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

        var guess = msg.substring(3,msg.length).toLowerCase();
        console.log(guess);
        console.log(key);
        if(guess == key.toLowerCase())
            io.emit('chat message', 'Correct. ' + key + ' is the answer.');
        else 
            console.log("Incorrect");

    }
    else
        io.emit('chat message', msg);
  });
});
