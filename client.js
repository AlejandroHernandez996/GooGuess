$(function () {
        var socket = io();
        $('form').submit(function(){
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });
        socket.on('chat message', function(msg){
            $('#messages').append($('<li>').text(msg));
        });
        socket.on('title search', function(title){
            document.getElementById("search").innerHTML = title;
        });
        socket.on('image search', function(link){
            document.getElementById("image").src = link;
        });
        socket.on('update',function(title,link){
            document.getElementById("search").innerHTML = title;
            document.getElementById("image").src = link;
        });
    });