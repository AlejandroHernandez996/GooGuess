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

var usernames = [];
var players =[];

if(imgLink == ""){
    searchImage();
    setAnswer();
}
    

// All commands
const COMMANDS = [
    {
        text : SEARCH_COMMAND,
        action : function(param, sender){
            resetSearcher();
            // Set socket as the one who searched
            sender.searcher = true;

             if(param.length <= MAX_SEARCH && param.length >= MIN_SEARCH){
                isGuessed = false;
                key = param;
                //Search google image of key
                //Emit image
                searchImage();
                //Emit answer
                setAnswer();
           }
            
        }

    },
    {
        text : GUESS_COMMAND,
        action : function(param, sender){

            
            // Emit key if correct
            if(!isGuessed && param.toLowerCase() == key.toLowerCase() && !sender.searcher){
                io.emit('title update', key);
                sender.score++;
                for(var x =0;x < players.length;x++){
                    if(players[x].id == sender.id){
                        players[x].s = sender.score;
                    }
                }
                // Cant be regussed
                isGuessed = true;
                // Anyone can guess
                resetSearcher();
                        
            }
            // Update score on a correct guess
            updateScore();
        }     
        

    },
    {
        text : SET_USER,
        action : function(param, sender){

            if(usernames.indexOf(param.toLowerCase()) != -1 || param.length >= MAX_USER || param.length <= MIN_USER){
                return;
            }else{
                // Remove username from username array
                for(var x =0;x < usernames.length;x++){
                    if(usernames[x] == socket.username)
                    usernames.splice(x,1);
                }
                sender.username = param;
                usernames.push(param.toLowerCase());
                // Set new username in players array
                for(var x =0;x < players.length;x++){
                    if(players[x].id == sender.id){
                        players[x].u = sender.username;
                    }
                }
                updateScore();
            }

        }
    }
];

//Home page is index.html

app.get('/', function(req, res){
  res.sendFile('index.html');
});

// SOCKET CONNECTED
io.on('connection', function(socket){
    
    // SOCKET VARS
    socket.searcher= false;
    socket.username = socket.id.substr(0,socket.id.length/2);
    socket.score = 0;
    socket.data = { id: socket.id, u:socket.username, s:socket.score};

    players.push(socket.data);
    updateScore();

    //If it was guessed 
    if(isGuessed){
        io.emit('update', key, imgLink);
    }
    //Else update the key
    else if(!isGuessed)
        io.emit('update', answer, imgLink);
    
    // When a chat message occurs check if its a command or a msg
    socket.on('chat message', function(msg){
        for(var x = 0;x < COMMANDS.length; x++){
            if(util.parseCommand(COMMANDS[x], {text: msg, sender: socket}))
                return;
        }
        if(msg != ""){
            emitChatMessage(msg, socket.username);
        }   
        
    });
    // When socket disconnects delete username and socket from arrays
    socket.on('disconnect',function(){
        for(var x =0;x < players.length;x++){
            if(players[x].id == socket.id)
                players.splice(x,1);
        }
        for(var x =0;x < usernames.length;x++){
            if(usernames[x] == socket.username)
                usernames.splice(x,1);
        }
        updateScore();
    });
    
});
// Set the answer on the client
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

// Loop through all socket ids and set searcher to false
function resetSearcher(){
    var ids = Object.keys(io.sockets.connected);
    ids.forEach(function(id) {
        var socket = io.sockets.connected[id];
        socket.searcher = false;

    });
}
// Emit chat message to the client
function emitChatMessage(msg, sender){
    io.emit('chat message', sender, msg);
}
// Emit image to the client
function emitImage(){
    io.emit('update', answer,imgLink); 
}
// Using google API search for an image
function searchImage(){
    client.search(key).then(images => {
                var rand = Math.floor((Math.random() * images.length));
                imgLink = images[rand].url;
                emitImage();
            });
}
// Update the scoreboard in the client
function updateScore(){
    io.emit('update score',players);
}