var express= require('express');
var app = express();
var http = require('http').Server(app);

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

const GoogleImages = require('google-images');
const client = new GoogleImages('007676027972813459848:y8getabobpu', 'AIzaSyAL0S3myTz9tPyfOMw-LmNgXOZmAa_DPhA');

app.set('port', (process.env.PORT || 5000));
app.set('ip',(process.env.IP || 'localhost'));
app.use(express.static(__dirname + '/'));

var server = app.listen(app.get('port'),app.get('ip'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var io = require('socket.io').listen(server);

// Link variables
var imgURL = '';
var imgLink = 'https://yt3.ggpht.com/-v0soe-ievYE/AAAAAAAAAAI/AAAAAAAAAAA/OixOH_h84Po/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';

// Searched term
var key = 'Google';
// Displayed key for guessing
var answer = "G _ _ _ _ _";
// Status if the key was guessed
var isGuessed = false;

//Home page is index.html

app.get('/', function(req, res){
  res.sendFile('index.html');
});

io.on('connection', function(socket){
    
    //If it was guessed 
    if(isGuessed)
        io.emit('update', key, imgLink);
    //Else update the key
    else if(!isGuessed)
        io.emit('update', answer, imgLink);

    socket.on('chat message', function(msg){
        
        //SEARCH COMMAND /s SEARCHTERM
        if(msg.substring(0,3) == '/s '){
            
            //Set guessed to false
            isGuessed = false;
            // Key is lowered case
            key = msg.substring(3,msg.length);
        
        client.search(key).then(images => {
            console.log(images[0].url);
            io.emit('image search', images[0].url);
        });
        
        answer = "";
                
        for(var x =0;x <key.length;x++){
                    
        if(x == 0 || key.charAt(x-1) == " "){
            answer+=key.charAt(x).toUpperCase() + " ";
        }
        else if(key.charAt(x) != ' ' ){
            answer += "_ ";
            }
                    
        }
        io.emit('title search', answer);
        
    }
    // GUESS COMMAND /g GUESSKEYWORD
    else if(msg.substring(0,3) == '/g '){

        // Get the guessed keyword
        var guess = msg.substring(3,msg.length).toLowerCase();
        console.log(guess);
        console.log(key);
        
        // If guess equals key 
        if(guess.toLowerCase() == key.toLowerCase()){
            
            // Emit to chat
            io.emit('chat message', 'Correct. ' + key + ' is the answer.');
            // Emit key to website on top
            io.emit('title search', key);
            // Set guessed to true
            isGuessed = true;
        }
        else 
            console.log("Incorrect");

    }
    // ELSE EMIT MESSAGE TO CHAT
    else if(msg.charAt(0) != '/')
        io.emit('chat message', msg);
  });
});
