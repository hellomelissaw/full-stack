const url = require('url');
const pug = require('pug');
const temp_token = "temp-sesh-12345"; 
const pid = 1; // maybe add it to the cookie? 
const { getPlayerData, 
        getLocationPageData, 
        updatePlayerLocation, 
        insertLocation, 
        createNewPlayer,
        getUserPlayers,
        createSession,
        getUserData,
        getSessionUser,
        getSessionStatus,
        deleteSession
    } = require('./dataService');


////////////////////////////////////////////////////////////
// ROUTING FUNCTIONS
////////////////////////////////////////////////////////////

function locationIsValid(connection_rows, player_loc_id, loc_id) {
    if (player_loc_id == loc_id) { 
        return true; 
    }

    for (const row of connection_rows) {
        if(row.conn_id == player_loc_id) {
            return true;
        }
    }
    return false;
}



async function validateLoginResponse(conn, req, temp_token) { // TODO: get token from browser
    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => {
            body += chunk.toString();
        })

        req.on('end', resolve);
    });

    const params = new URLSearchParams(body);
    const username = params.get('username');
    const password = params.get('password');

    const result = await getUserData(conn, username);

    if(result.success && result.user_data.password == password) {
        const sessionResult = await createSession(conn, temp_token, result.user_data.uid);

        if (sessionResult.success) {
            return generateStartResponse(conn, req)

        } else {
            return pug.renderFile('./templates/message.pug', { message: sessionResult.error })

        }
    } else {
        return pug.renderFile('./templates/temp_login.pug', { showError: true } ) 
    }

}

async function generateLocationResponse(conn, url) {
    const result = await getPlayerData(conn, pid); // hard-coded temporarily

    if(result.success) {
        const id = url.query.locID;
        const loc = await getLocationPageData(conn, id);
    
        if(locationIsValid(loc.connections, result.player_data.loc_id, id)){
            updatePlayerLocation(conn, id, pid);  // hard-coded temporarily
            return pug.renderFile('./templates/game_page.pug', { location: loc });   
        
        } else {
            return pug.renderFile('./templates/location_error.pug', { playerLocID: result.player_data.loc_id, buttonLabel: "GO!"});
        }
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: result.error } )
    }
    
}

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

async function generateLoadPageResponse(conn, req) { // Hard-coded token. This should be gotten from the req I guess?? 
    const user = await getSessionUser(conn, temp_token);
    const userPlayers = await getUserPlayers(conn, user.uid);
    return pug.renderFile('./templates/load_games.pug', {players: userPlayers});
}

async function loadGame(conn, pid) {
    const result = await getPlayerData(conn, pid); // hard-coded temporarily
    if(result.success){
        const loc = await getLocationPageData(conn, result.player_data.loc_id);
        return pug.renderFile('./templates/game_page.pug', { location: loc });  
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: result.error } ) 
    }
 
}

async function generateNewGamePageResponse(conn, req) {
    const user = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
    return pug.renderFile('./templates/new_game_form.pug', { uid: user.uid } );
}

async function createNewGame(conn, req) {
    const user = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
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

    if(result.success) {
        return loadGame(conn, result.pid);

    } else {
        console.log(result.error);
        return pug.renderFile('./templates/message.pug', { message: "Problem loading game, please try again." } )
    }
}

async function generateStartResponse(conn, req) {
    const user = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
    if(user) {
        return pug.renderFile('./templates/start.pug', { uid: user.uid, username: user.username });

    } else {
        return pug.renderFile('./templates/message.pug', { message: "User not found." })
    }
   
}

async function generateLandingPage(conn, req) {
    const sessionExists = await getSessionStatus(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
    console.table(sessionExists);    
if(!sessionExists) {
        return pug.renderFile('./templates/temp_login.pug', { showError: false });
    
    } else {
        console.log("session active");
        return generateStartResponse(conn, req);
    }
}


async function quitGame(conn, req) {
    await deleteSession(conn, temp_token); // Hard-coded session token
    return pug.renderFile('./templates/temp_login.pug', { showError: false });
}
////////////////////////////////////////////////////////////
// ROUTER 
////////////////////////////////////////////////////////////

async function requestRoute(conn, req) {
    const parsedURL = url.parse(req.url, true);
    const path = parsedURL.pathname;

    switch(path) {
        case '/log-in-page':
            return pug.renderFile('./templates/temp_login.pug', { showError: false });

        case '/log-in':
            return validateLoginResponse(conn, req, temp_token);

        case '/location':
            return generateLocationResponse(conn, parsedURL);

        case '/insert-location-form':
            return pug.renderFile('./templates/insert_form.pug');
        
        case '/insert-location':
           return generateInsertResponse(conn, req, parsedURL);

        case '/load-game-page':
            return generateLoadPageResponse(conn, req);

        case '/load-game':
            return loadGame(conn, parsedURL.query.pid);

        case '/new-game-page':
           return generateNewGamePageResponse(conn, req);

        case '/new-game':
            return createNewGame(conn, req)

        case '/quit':
            return quitGame(conn, req)

        default: 
            return generateLandingPage(conn, req);
    }

}

module.exports = { requestRoute }
