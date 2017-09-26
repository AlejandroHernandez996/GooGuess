$(function () {
        var socket = io();

        $('form').submit(function(){
          socket.emit('chat message', $('#m').val());
          $('#m').val('');
          return false;
        });

        socket.on('chat message', function(sender, msg){
          addMessage((sender + ": ") + msg);
        });

        socket.on('title update', function(title){
            document.getElementById("title").innerHTML = title;
        });

        socket.on('update',function(title,link){
            document.getElementById("title").innerHTML = title;
            document.getElementById("image").src = link;
        });
        socket.on('update score',function(players){
            updateScore(players);
        });
    });
function addMessage (msg) {


    var $messages = $('.messages');
    var $messageBodyDiv = $('<span class="messageBody">').text(msg);
    var $messageDiv = $('<li class="message"/>').append($messageBodyDiv);
    
    $messages.append($messageDiv);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }
function updateScore(players){

    players.sort(function(a, b) {
        return parseInt(b.s) - parseInt(a.s);
    });
    var $scores = $('.scores');
    $scores.empty();
    for(var x =0;x < players.length && x < 5;x++){

        var $scoresBodyDiv = $('<span class="scoreBody">').text((players[x].u + ": " + players[x].s));
        var $scoresDiv = $('<li class="score"/>').append($scoresBodyDiv);
        $scores.append($scoresDiv);
    }

}