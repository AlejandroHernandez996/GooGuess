$(function () {
        var socket = io();

        $('form').submit(function(){
          socket.emit('chat message', $('#m').val());
          $('#m').val('');
          return false;
        });

        socket.on('chat message', function(msg){
          $('#messages').append($('<li>').text(msg));
          window.scrollTo(0, document.body.scrollHeight);
        });

        socket.on('title update', function(title){
            document.getElementById("title").innerHTML = title;
        });

        socket.on('update',function(title,link){
            document.getElementById("title").innerHTML = title;
            document.getElementById("image").src = link;
        });
    });