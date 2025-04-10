const url = require('url');
const pug = require('pug');
const temp_token = "temp-sesh-123456"; 
const { getPlayerData, 
        getLocationPageData, 
        updatePlayerLocation, 
        insertLocation, 
        createNewPlayer,
        getUserPlayers,
        createSession,
        getUserData,
        getSessionUser,
        getSessionStatus
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
    console.table(result.user_data);
    if(result) {
        console.log(`result.user_data.password: ${result.user_data.password}, password: ${password}`);
        if(result.user_data.password == password) {
            const sessionResult = createSession(conn, temp_token, result.user_data.uid);
        return pug.renderFile('./templates/message.pug', { message: "Password was correct..." } )
        }

    } else {
        return pug.renderFile('./templates/temp_login.pug', { showError: true } ) 
    }

}

async function generateLocationResponse(conn, url) {
    const result = await getPlayerData(conn, pid);

    if(result.success) {
        const id = url.query.locID;
        const loc = await getLocationPageData(conn, id);
    
        if(locationIsValid(loc.connections, result.player_data.loc_id, id)){
            updatePlayerLocation(conn, id, pid);
            return pug.renderFile('./templates/location.pug', { location: loc });   
        
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
    const uid = await getSessionUser(conn, temp_token);
    const userPlayers = await getUserPlayers(conn, uid);
    return pug.renderFile('./templates/load_games.pug', {players: userPlayers});
}

async function loadGame(conn, pid) {
    const result = await getPlayerData(conn, pid);
    if(result.success){
        const loc = await getLocationPageData(conn, result.player_data.loc_id);
        return pug.renderFile('./templates/location.pug', { location: loc });  
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: result.error } ) 
    }
 
}

async function generateNewGamePageResponse(conn, req) {
    const uid = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
    return pug.renderFile('./templates/new_game_form.pug', { uid: uid } );
}

async function createNewGame(conn, req) {
    const uid = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
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
        return pug.renderFile('./templates/message.pug', { message: result.error } )
    }
}

async function generateStartResponse(conn, req) {
    const uid = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
    // const player_info = await getPlayerData(conn, pid);
    return pug.renderFile('./templates/start.pug', { uid: uid });
}

async function generateLandingPage(conn, req) {
    const sessionExists = await getSessionStatus(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
    if(sessionExists) {
        return generateStartResponse(conn, req);
    
    } else {
        return pug.renderFile('./templates/temp_login.pug', { showError: false });
    }
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
           return generateInsertResponse(conn, parsedURL);

        case '/load-game-page':
            return generateLoadPageResponse(conn, parsedURL);

        case '/load-game':
            return loadGame(conn, parsedURL.query.pid);

        case '/new-game-page':
           return generateNewGamePageResponse(conn, req);

        case '/new-game':
            return createNewGame(conn, req)

        default: 
            return generateLandingPage(conn, req);
    }

}

module.exports = { requestRoute }
