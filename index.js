var express= require('express');
var app = express();
var util = require("./util.js");

const GoogleImages = require('google-images');
const client = new GoogleImages('007676027972813459848:y8getabobpu', 'AIzaSyBhhob_fKmTFkQHtF6ThNHfHt_3hxW7vzw');

app.set('port', (process.env.PORT || 5000));
app.set('ip',(process.env.IP || 'localhost'));
app.use(express.static(__dirname + '/'));

var server = app.listen(app.get('port'),app.get('ip'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var io = require('socket.io').listen(server);

// CONSTANTS
const SEARCH_COMMAND    = '/s';
const GUESS_COMMAND     = '/g';
const SET_COLOR         = '/c';
const SET_USER          = '/u';
const MAX_USER          = 10;
const MIN_USER          = 2;
const MAX_SEARCH        = 20;
const MIN_SEARCH        = 3;

// Game variables
var imgLink = "";
var key = "Goo Guess";
var answer = "";
var isGuessed = false;

var numUsers = 0;


if(imgLink == ""){
    searchImage();
    setAnswer();
}
    

// All commands
const COMMANDS = [
    {
        text : SEARCH_COMMAND,
        action : function(param){

            console.log(param);
            isGuessed = false;
            key = param;
            //Search google image of key
            //Emit image
            searchImage();
            //Emit answer
            setAnswer();
            
        }

    },
    {
        text : GUESS_COMMAND,
        action : function(param){

            // Check if correct
            if(param.toLowerCase() == key.toLowerCase())
                isGuessed = true;
            // Emit key if correct
            if(isGuessed)
                io.emit('title update', key);     
        }

    },
    {
        text : SET_USER,
        action : function(param){

        }
    }
];

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
        for(var x = 0;x < COMMANDS.length; x++){
            if(util.parseCommand(COMMANDS[x], {text: msg}))
                return;
        }
        if(msg != ""){
            emitChatMessage(msg);
        }   
        
    });
    
});
// Set the answer
function setAnswer(){

    answer = "";
    for(var x =0;x <key.length;x++){
                    
        if(x == 0 || key.charAt(x-1) == " "){
            answer+=key.charAt(x).toUpperCase() + " ";
        }
        else if(key.charAt(x) != ' ' ){
            answer += "_ ";
            }
                    
        }

}

function emitChatMessage(msg){
    io.emit('chat message', msg);
}
function emitImage(){
    io.emit('update', answer,imgLink); 
}
function searchImage(){
    client.search(key).then(images => {
                var rand = Math.floor((Math.random() * images.length));
                imgLink = images[rand].url;
                emitImage();
            });
}