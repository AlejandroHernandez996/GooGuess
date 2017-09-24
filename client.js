$(function () {
        var socket = io();

        $('form').submit(function(){
          socket.emit('chat message', $('#m').val());
          $('#m').val('');
          return false;
        });

        socket.on('chat message', function(msg){
          addMessage(msg);
        });

        socket.on('title update', function(title){
            document.getElementById("title").innerHTML = title;
        });

        socket.on('update',function(title,link){
            document.getElementById("title").innerHTML = title;
            document.getElementById("image").src = link;
        });
    });
function addMessage (msg) {


    var $messages = $('.messages');
    var $messageBodyDiv = $('<span class="messageBody">').text(msg);
    var $messageDiv = $('<li class="message"/>').append($messageBodyDiv);
    
    $messages.append($messageDiv);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }