
(function(exports){
    
    // Parses any commands
    exports.parseCommand = function(command, param) {
        
        // Get the text
        var commandText = param.text;
        // If text starts with command and space
        if(commandText.toLowerCase().startsWith(command.text.toLowerCase() + " ")){

            // Get the substring of the command
            commandText = commandText.substring(command.text.length +1);
            // Do command
            command.action(commandText, param.sender);
            return true;
        }
        return false;
    };
// Part of allowing serverside and clientside use
}(typeof exports === 'undefined' ? this.share = {} : exports));