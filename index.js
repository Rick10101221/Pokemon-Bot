const Discord = require('discord.js');
const client = new Discord.Client();

const tokenFile = require('./token.js');
const token = tokenFile.token;

client.login(token);

const fetch = require("node-fetch");


// =====================================================================
// =====================================================================
// ======================CHANGE WHEN SWITCHING SERVERS==================
let catchPokemonChannelId = '762567190980722711'
let pokemonInfoId = '764739550840881192'
// =====================================================================
// =====================================================================


let booted = false;             // whether or not sprites have been loaded
let caught = false;             // whether or not the last pokemon was caught
let lastPokemonName = '';       // name of last sent pokemon by bot
let pokemonNames = [];          // list of all pokemon names in db (loaded)
let pokemonUrls = [];           // list of all pokemon objects in db
let pokemonSprites = [];        // list of all pokemon sprites in db

// 18 Pokemon Types
let pokemonTypes = [
    'normal', 
    'fire', 
    'water', 
    'electric', 
    'grass', 
    'ice', 
    'fighting', 
    'poison', 
    'ground', 
    'flying', 
    'psychic', 
    'bug', 
    'rock', 
    'ghost', 
    'dragon', 
    'dark', 
    'steel', 
    'fairy'
];

// Sprites are sent at minInterval * 1 min
let minInterval = 0.1;
// min, 60 seconds in min, 1000 milliseconds
const imgInterval = minInterval * 60 * 1000;


/*
    TODO:
    1. Add function descriptions
    2. Figure out how to create player profiles and add
    caught pokemon to a database.
    3. Add '!pokedex' function.
    4. Add modular api calls for fetchUrls.
*/

bootup();

// Event listener for incoming messages
client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }

    // adjusts message for easier parsing
    msg = message.content.toLowerCase();
    msg = msg.trim();

    let splitMsg = msg.split(" ");

    // First channel: channel set for catching pokemon
    // Second channel: channel for pokemon info
    if (message.channel.id === catchPokemonChannelId) {
        // boots game: loads sprites and names list. else if trying to
        // catch pokemon and pokemon hasn't been caught, check for user
        // input and name equality
        if (splitMsg[0] === '!start' && booted) {
            console.log('started');
            // sends messages at the specified interval above
            let interval = client.setInterval(function() {
                try {
                    caught = false;
                    sendRandomSprite(message);
                } catch (error) {
                    console.log(error.stack);
                }
            }, imgInterval);
        } else if (booted && !caught && splitMsg[0] === '!catch') {
            if (splitMsg[1] === lastPokemonName) {
                sendCaughtMessage(message);
            } else {
                sendFailedMessage(message);
            }
        }
    } else if (message.channel.id === pokemonInfoId) {
        // either print tutorial or checks if second user input is actually 
        // a pokemon type. otherwise, print incorrect format.
        if (splitMsg[0] === '!p') {
            if (msg === '!p') {
                message.channel.send('-------------------------------------------------------------------------------------------------------' +
                '\nUse me to find the strengths and weaknesses of Pokemon types!\n' + 
                'Type **`!p type [strengths or weaknesses]`** to get started.\n' + 
                'Pro tip: `!p type` will automatically display strengths!\n' +
                '------------------------------------------------------------------------------------------------------------------------------');
            } else if (pokemonTypes.includes(splitMsg[1])) {
                if (splitMsg[2] == 'weaknesses') {
                    message.channel.send('.\n' + findWeaknesses(splitMsg[1]));
                } else {
                    message.channel.send('.\n'+ findStrengths(splitMsg[1]));
                }
            } else {
                message.channel.send('Format not recognized. Please use ' + 
                '`!p type [strengths or weaknesses]`');
            }
        }
    }
});



/**
 * Boots up catch channel: fetch api call will load pokemon names, and urls.
 * Then, for each url in global var, makes another fetch call for sprites.
 */
async function bootup() {
    await fetchUrls();

    for (let i = 0; i < pokemonUrls.length; i++) {
    //for (let i = 0; i < 1; i++) {
        console.log('current url', pokemonUrls[i]);
        await fetchSprites(pokemonUrls[i]);
    }

    booted = true;
}


/**
 * Fetches urls given a fixed endpoint.
 */
async function fetchUrls() {
    await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
    .then(async (response) => await response.json()) 
    .then(async function(allpokemon) {
        await allpokemon.results.forEach(async function(pokemon) {
            pokemonNames.push(pokemon.name);
            pokemonUrls.push(pokemon.url);
        });
    });
}


/**
 * Loads global pokemon sprites through given url.
 * @param {String} url Fetch Api Call Endpoint.
 */
async function fetchSprites(url) {
    await fetch(url)
    .then(async (response) => await response.json())
    .then(function(pokeData) {
        pokemonSprites.push(pokeData.sprites.front_default);
    });
}


/**
 * Chooses and sends a random pokemon sprite from global sprites list.
 * @param {Message} message Discord.js Message object for send call.
 */
function sendRandomSprite(message) {
    let index = randomNumber(pokemonSprites.length);
    lastPokemonName = pokemonNames[index];
    //message.channel.send('Who\'s that Pokemon??');
    message.channel.send(pokemonSprites[index] +
        ' ' + lastPokemonName);
    //message.channel.send('```Who\'s that Pokemon?```\n' + 
    //                    pokemonSprites[index]);
}


/**
 * Generates a random index for sendRandomSprite use.
 * @param {int} max Size of pokemon sprites list.
 * @return Random index for accessing into sendRandomSprite.
 */
function randomNumber(max) {
    return Math.floor(Math.random() * max);
}


/**
 * Sends a congradulations message for catching a pokemon with a randomly
 * generated level.
 * @param {Message} message Discord.js Message object for send call. 
 */
function sendCaughtMessage(message) {
    let name = lastPokemonName.charAt(0).toUpperCase() + 
               lastPokemonName.slice(1);
    message.channel.send('Congradulations! You caught a level ' +
                         randomLevel() + ' ' + name);
    caught = true;
}


/**
 * Sends a failure message for incorrectly guessing the pokemon name
 * with a randomly generated level.
 * @param {Message} message Discord.js Message object for send call. 
 */
function sendFailedMessage(message) {
    let name = lastPokemonName.charAt(0).toUpperCase() + 
               lastPokemonName.slice(1);
    message.channel.send('That\'s not right! The level ' + randomLevel() + ' ' +
                         name + ' ran away!');
    caught = false;
}


/**
 * Generates a random level for the generated pokemon.
 */
function randomLevel() {
    return Math.floor(Math.random() * 100);
}


/**
 * Returns a list of pokemon weaknesses for a given type.
 * @param {String} type Input pokemon type.
 * @return A concatenated list of all of type's weaknesses.
 */
function findWeaknesses(type) {
    let text = '';
    switch(type) {
        case 'normal':
            text = 'fighting\n'
            break;
        case 'fire':
            text = 'water\nground\nrock'
            break;
        case 'water':
            text = 'electric\ngrass'
            break;
        case 'electric':
            text = 'ground'
            break;
        case 'ice':
            text = 'fire\nfighting\nrock\nsteel'
            break;
        case 'fighting':
            text = 'flying\npsychic\nfairy' 
            break;
        case 'poison':
            text = 'ground\npsychic'
            break;
        case 'ground':
            text = 'water\ngrass\nice'
            break;
        case 'flying':
            text = 'electric\nice\nrock'
            break;
        case 'psychic':
            text = 'bug\nghost\ndark'
            break;
        case 'bug':
            text = 'fire\nflying\nrock'
            break;
        case 'rock':
            text = 'water\ngrass\nfighting\nground\nsteel'
            break;
        case 'ghost':
            text = 'ghost\ndark'
            break;
        case 'dragon':
            text = 'ice\ndragon\nfairy'
            break;
        case 'dark':
            text = 'fighting\nbug\nfairy'
            break;
        case 'steel':
            text = 'fire\nfighting\nground'
            break;
        case 'fairy':
            text = 'poison\nsteel'
            break;
        case 'grass':
            text = 'fire\nice\npoison\nflying\nbug'
            break; 
    }
    return text;
}


/**
 * Returns a list of pokemon strengths for a given type.
 * @param {String} type Input pokemon type.
 * @return A concatenated list of all of type's strengths.
 */
function findStrengths(type) {
    let text = '';
    switch(type) {
        case 'normal':
            text = 'none'
            break;
        case 'fire':
            text = 'grass\nice\nbug\nsteel'
            break;
        case 'water':
            text = 'fire\nground\nrock'
            break;
        case 'electric':
            text = 'water\nflying'
            break;
        case 'ice':
            text = 'grass\nground\nflying\ndragon'
            break;
        case 'fighting':
            text = 'normal\nice\nground\nflying\ndragon'
            break;
        case 'poison':
            text = 'grass\nfairy'
            break;
        case 'ground':
            text = 'fire\nelectric\npoison\nrock\nsteel'
            break;
        case 'flying':
            text = 'grass\nfighting\nbug'
            break;
        case 'psychic':
            text = 'fighting\npoison'
            break;
        case 'bug':
            text = 'grass\npsychic\ndark'
            break;
        case 'rock':
            text = 'fire\nice\nflying\nbug'
            break;
        case 'ghost':
            text = 'psychic\nrock'
            break;
        case 'dragon':
            text = 'dragon'
            break;
        case 'dark':
            text = 'psychic\nghost'
            break;
        case 'steel':
            text = 'ice\nrock\nfairy'
            break;
        case 'fairy':
            text = 'fighting\ndragon\ndark'
            break;
        case 'grass':
            text = 'water\nground\nrock'
            break; 
    }
    return text;
}