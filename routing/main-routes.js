///////////////////////////////////////////////////////////////////////////////
// ALL THE ROUTING FUNCTIONS FOR THE BUTTONS ON THE START PAGE:
// - NEW GAME
// - LOAD GAME
// - INSERT LOCATION
// - QUIT
///////////////////////////////////////////////////////////////////////////////

// const temp_token = "temp-sesh-12345"; 
const pug = require('pug');

const {
    getSessionUser,
    getSessionStatus,
    deleteSession,
    addPidToSession,
    getSessionPid
} = require('../dataservice/session');

const {
    getPlayerData, 
    createNewPlayer,
    loadGames,
} = require('../dataservice/user');

const {
    insertLocation
} = require('../dataservice/location');

const { generateLocationResponse } = require('./location-routes');


///////////////////////////////////////////////////////////////////////////////
// Generates the start page if user is logged in or error if user not logged in
// (ie. trying to by-pass logging in)
///////////////////////////////////////////////////////////////////////////////

async function generateStartResponse(conn, sessionId) {
    const user = await getSessionUser(conn, sessionId); // Hard-coded token. This should be gotten from the req I guess?? 
    if(user) {
        //return createSessionInDB(conn, sessionId, uid)
        return pug.renderFile('./templates/start.pug', { uid: user.uid, username: user.username });

    } else {
        return pug.renderFile('./templates/loginPage.pug', { message: "Username or password incorrect." })
    }
   
}


///////////////////////////////////////////////////////////////////////////////
// Generates the start page (with new game, load game etc) if user is logged in
// otherwise generates the login page
///////////////////////////////////////////////////////////////////////////////

async function generateLandingPage(conn, sessionId) {
    const sessionExists = await getSessionStatus(conn, sessionId); 
    if(!sessionExists) {
        return pug.renderFile('./templates/loginPage.pug');
    
    } else {
        return await generateStartResponse(conn, sessionId);
    }
}


///////////////////////////////////////////////////////////////////////////////
// Creates a new game with a new character given by the user's input
///////////////////////////////////////////////////////////////////////////////

async function createNewGame(conn, req, sessionId) {
        const user = await getSessionUser(conn, sessionId); // Hard-coded token. This should be gotten from the req I guess?? 
        const uid = user.uid;
        let body = '';
        await new Promise((resolve) => {
            req.on('data', chunk => {
                body += chunk.toString();
            })
    
            req.on('end', resolve);
        });
    
        const params = new URLSearchParams(body);
        const name = params.get('name');
        const result = await createNewPlayer(conn, uid, name);
    
        if (result.success) {
            const addedPid = await addPidToSession(conn, result.pid, uid);
            if (addedPid) {
                return loadGame(conn, result.pid, sessionId);
            }
            return pug.renderFile('./templates/message.pug', { message: "Problem adding game to session, please try again." } )
    
    
        } else {
            console.log(result.error);
            return pug.renderFile('./templates/message.pug', { message: "Problem loading game, please try again." } )
        }
    }


///////////////////////////////////////////////////////////////////////////////
// Generates the page to create a new character/game
///////////////////////////////////////////////////////////////////////////////

async function generateNewGamePageResponse(conn, sessionId) {
    const user = await getSessionUser(conn, sessionId); 
    if (user) {
        return pug.renderFile('./templates/new_game_form.pug', { uid: user.uid } );
    } else {
        return pug.renderFile('./templates/message.pug', { message: "No user found for this session." });
    }
    
}


///////////////////////////////////////////////////////////////////////////////
// Generates the page with all existing games for current user
///////////////////////////////////////////////////////////////////////////////

async function generateLoadPageResponse(conn, sessionId) { // Hard-coded token. This should be gotten from the req I guess?? 
    const user = await getSessionUser(conn, sessionId);
    if (!user) {
        console.log("in not user");
        return pug.renderFile('./templates/message.pug', { message: "No user found! Please log in or create an account." } )
    }
    const games = await loadGames(conn, user.uid); 
    return pug.renderFile('./templates/load_games.pug', {players: games});
}


///////////////////////////////////////////////////////////////////////////////
// Adds the pid to the current session and forwards the user to the player's
// location for the given pid
///////////////////////////////////////////////////////////////////////////////

async function loadGame(conn, pid, sessionId) {
    const result = await getPlayerData(conn, pid);

    if(result.success){
        const addedPid = await addPidToSession(conn, pid, result.player_data.uid);
        if (addedPid) {
            return generateLocationResponse(conn, result.player_data.loc_id, sessionId);

        } else {
            return pug.renderFile('./templates/message.pug', 
                { message: "Problem adding game to session, please try again." } 
            )
        }
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: result.error } ) 
    }
    
}


///////////////////////////////////////////////////////////////////////////////
// Inserts location row using user input and sends confirmation message
///////////////////////////////////////////////////////////////////////////////

async function generateInsertResponse(conn, req) {
    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => {
            body += chunk.toString();
        })

        req.on('end', resolve); 
    });

    const params = new URLSearchParams(body);
    const name = params.get('name');
    const emojis = params.get('emojis');
    const connections = params.get('connections');

    const result = await insertLocation(conn, name, emojis,connections);
    return pug.renderFile('./templates/message.pug', { message: result });
}


///////////////////////////////////////////////////////////////////////////////
// Deletes session for given session token and fowards user to log in page
///////////////////////////////////////////////////////////////////////////////

async function quitGame(conn, sessionId) {
    await deleteSession(conn, sessionId); // Hard-coded session token
    return pug.renderFile('./templates/loginPage.pug');
}

module.exports = { 
                    generateStartResponse,
                    generateLandingPage,
                    createNewGame,
                    generateNewGamePageResponse,
                    generateLoadPageResponse,
                    loadGame,
                    generateInsertResponse,
                    quitGame
                }
