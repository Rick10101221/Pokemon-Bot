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


let booted = false;
let pokemonNames = [];
let pokemonUrls = [];
let pokemonSprites = [];

// 18 Types
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

let minInterval = 0.1;
// min, 60 seconds in min, 1000 milliseconds
const imgInterval = minInterval * 60 * 1000;


/*
    TODO:
    1. How to check contents of last message.
    2. Figure out how to print 'You caught a level ___ _____! You now have ____ pokemon'
    3. Add function descriptions
    4. Figure out how to create player profiles and add
    caught pokemon to a database.
*/

bootup();

// client.on('ready', function() {
//     await bootup();
//     console.log('ready');

//     client.setInterval(function (channel) {
        
//     }
// });


let lastAuthorId = '';
let lastPokemonName = '';


client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }

    msg = message.content.toLowerCase();
    msg = msg.trim();

    let splitMsg = msg.split(" ");

    if (message.channel.id === catchPokemonChannelId) {
        if (splitMsg[0] === '!start' && booted == true) {
            console.log('started');
            let interval = client.setInterval(function() {
                try {
                    sendRandomSprite(message);
                } catch (error) {
                    console.log(error.stack);
                }
            }, imgInterval);
        } else if (booted == true && splitMsg[0] === '!catch') {
            if (splitMsg[1] === lastPokemonName) {
                sendCaughtMessage(message);
            } else {
                sendFailedMessage(message);
            }
        }
    } else if (message.channel.id === pokemonInfoId) {
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


async function bootup() {
    await fetchUrls();

    
    for (let i = 0; i < pokemonUrls.length; i++) {
    //for (let i = 0; i < 1; i++) {
        console.log('current url', pokemonUrls[i]);
        await fetchSprites(pokemonUrls[i]);
    }

    booted = true;
}


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


async function fetchSprites(url) {
    await fetch(url)
    .then(async (response) => await response.json())
    .then(function(pokeData) {
        pokemonSprites.push(pokeData.sprites.front_default);
    });
}


function sendRandomSprite(message) {
    let index = randomNumber(pokemonSprites.length);
    lastPokemonName = pokemonNames[index];
    //message.channel.send('Who\'s that Pokemon??');
    message.channel.send(pokemonSprites[index] +
        ' ' + lastPokemonName);
    //message.channel.send('```Who\'s that Pokemon?```\n' + 
    //                    pokemonSprites[index]);
}


function randomNumber(max) {
    return Math.floor(Math.random() * max);
}


function sendCaughtMessage(message) {
    let name = lastPokemonName.charAt(0).toUpperCase() + 
               lastPokemonName.slice(1);
    message.channel.send('Congradulations! You caught a level ' +
                         randomLevel() + ' ' + name);
}


function sendFailedMessage(message) {
    let name = lastPokemonName.charAt(0).toUpperCase() + 
               lastPokemonName.slice(1);
    message.channel.send('That\'s not right! The level ' + randomLevel() + ' ' +
                         name + ' ran away!');
}


function randomLevel() {
    return Math.floor(Math.random() * 100);
}


// async function fetchKantoPokemon() {
//     await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
//     .then(response => response.json())
//     .then(allpokemon => {
//         pokemonObjs = allpokemon.results;
//         console.log('94', pokemonNames);
//     })
//     .catch(error => console.log(error));
// }

// function fillPokemonNames() {
//     console.log(pokemonObjs);
//     console.log('102', pokemonObjs);
//     for (let obj in pokemonObjs) {
//         // console.log(pokemonObjs);
//         // console.log(pokemonObjs[obj]);
//         pokemonNames.push(pokemonObjs[obj].name);
//     }
// }


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