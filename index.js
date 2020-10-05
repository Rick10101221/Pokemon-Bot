const Discord = require('discord.js');
const client = Discord.Client();

const tokenFile = require('token.js');
const token = tokenFile.token;

client.login(token);

client.on('message', message => {
    msg = message.content.toLowerCase();

    
});