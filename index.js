const Discord = require('discord.js');
const client = new Discord.Client();

const tokenFile = require('./token.js');
const token = tokenFile.token;

client.login(token);

const fetch = require("node-fetch");

let catchPokemonChannelId = '762567190980722711'
let pokemonInfoId = '764739550840881192'

let booted = false;
let pokemonNames = [];
let pokemonUrls = [];
let pokemonSprites = [];

/*
    TODO: 
    1. Check if sending a message in a specific channel
    2. Choose a random index and print the pokemon's name and sprite.
    3. Figure out how to print 'You caught a level ___ _____! You now have ____ pokemon'
    3. Figure out how to create player profiles and add
    caught pokemon to a database.
*/

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


client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }

    msg = message.content.toLowerCase();
    msg = msg.trim();

    let splitMsg = msg.split(" ");

    if (message.channel.id === catchPokemonChannelId && splitMsg.length == 1 &&
        splitMsg[0] === "!b" && booted == false) {
        await fetchUrls();

        for (let i = 0; i < pokemonUrls.length; i++) {
            console.log('current url', pokemonUrls[i]);
            pokemonSprites.push(await fetchSprites(pokemonUrls[i]));
        }

        message.channel.send('done');
        booted = true;
        
    } else if (message.channel.id === pokemonInfoId && splitMsg[0] === '!p') {
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
});


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
    //console.log('92', url);
    await fetch(url)
    .then(async (response) => await response.json())
    .then(function(pokeData) {
        //console.log(pokeData.sprites.front_default);
        pokemonSprites.push(pokeData.sprites.front_default);
    });
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