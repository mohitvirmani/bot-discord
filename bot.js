var Discord = require('discord.io');
//var Discord = require('discord.js');

var logger = require('winston');
var https = require("https");
const fs = require('fs');

require('dotenv').config()
console.log(process.env);

const app = require('http').createServer((req, res) => res.send('Ahoy!'));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

console.log(" process.env.DISCORD_TOKEN" + process.env.DISCORD_TOKEN);

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: process.env.DISCORD_TOKEN,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message === 'hi') {
        switch(message) {
            case 'hi':
                bot.sendMessage({
                    to: channelID,
                    message: 'hey'
                });
            break;
         }
     }
	
	
	if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1).join(" ");
		let rawdata = fs.readFileSync('custom_database.json');
		let my_db = JSON.parse(rawdata);
				
        switch(cmd) {
            case 'google':
				//save search to database
				console.log(my_db);
				my_db.searches.push(args);
				let data = JSON.stringify(my_db);
				fs.writeFileSync('custom_database.json', data);
				
				var url = "https://www.googleapis.com/customsearch/v1?key=" + process.env.SEARCH_KEY + "&cx=007404039345753769668:cvkqx5akedp&q=" + args;
				var json_response = "";
				var bot_response = "";
				function callback(response) {
					var str = "";
					response.on("data", function (chunk) {
						str += chunk;
					});
					response.on("end", function () {
						json_response = JSON.parse(str);
						for(var i=0; i<5; i++){
							console.log("i " + i);
							console.log("json_response.items[i] " + json_response.items[i]);
							bot_response += json_response.items[i].link + " ";
						}
						bot.sendMessage({
							to: channelID,
							message: bot_response
						});
					});
				}

				var request = https.request(url, callback);

				request.on("error", function (error) {
					console.error(error);
				});

				request.end();
				break;

            case 'recent':
				console.log(my_db);
				var str = "";
				var current_args = String(args);
				for(i=0; i<my_db.searches.length; i++){
					var pointer = String(my_db.searches[i]);
				if(pointer.includes(current_args)){
						str += '"' + pointer + '" ';
					}
				}

				bot.sendMessage({
					to: channelID,
					message: str
				});
				
            break;
         }
     }
});