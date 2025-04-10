const url = require('url');
const pug = require('pug');
const uid = 1;
const pid = 1; // temporary player id until we set up a login system
const { getPlayerData, 
        getLocationPageData, 
        updatePlayerLocation, 
        insertLocation, 
        createNewPlayer,
        getUserPlayers 
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
        return pug.renderFile('./templates/message', { message: result.error } )
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

async function generateStartResponse(conn, uid) {
    // const player_info = await getPlayerData(conn, pid);
    return pug.renderFile('./templates/start.pug', { uid: uid });
}

async function generateLoadPageResponse(conn, url) {
    const uid = url.query.uid;
    const userPlayers = await getUserPlayers(conn, uid);
    return pug.renderFile('./templates/load_games.pug', {players: userPlayers});
}

async function loadGame(conn, pid) {
    const result = await getPlayerData(conn, pid);
    if(result.success){
        console.table(result.player_data);
        const loc = await getLocationPageData(conn, result.player_data.loc_id);
        console.table(loc);
        return pug.renderFile('./templates/location.pug', { location: loc });  
    
    } else {
        return pug.renderFile('./templates/message', { message: result.error } ) 
    }
 
}

async function createNewGame(conn, req, uid) {
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


////////////////////////////////////////////////////////////
// ROUTER 
////////////////////////////////////////////////////////////

async function requestRoute(conn, req) {
    const parsedURL = url.parse(req.url, true);
    const path = parsedURL.pathname;

    switch(path) {
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
            return pug.renderFile('./templates/new_game_form.pug', { uid: parsedURL.query.uid } );

        case '/new-game':
            return createNewGame(conn, req, parsedURL.query.uid)

        default: 
            return generateStartResponse(conn, uid);
    }

}

module.exports = { requestRoute }
