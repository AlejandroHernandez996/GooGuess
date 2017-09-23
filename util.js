
(function(exports){
    
    // Parses any commands
    exports.parseCommand = function(command, message) {
        
        // Get the text
        var text = message.text;
        console.log(text);
        // If text starts with command and space
        if(text.toLowerCase().startsWith(command.text.toLowerCase() + " ")){

            // Get the substring of the command
            text = text.substring(command.text.length +1);
            // Do command
            command.action(text);
            return true;
        }
        return false;
    };
// Part of allowing serverside and clientside use
}(typeof exports === 'undefined' ? this.share = {} : exports));