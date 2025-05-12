///////////////////////////////////////////////////////////////////////////////
// ALL THE ROUTING FUNCTIONS RELATED TO LOCATION PAGES
///////////////////////////////////////////////////////////////////////////////
const pug = require('pug');
// const temp_token = "temp-sesh-12345"; 

const {
    getPlayerData,
    getPlayerStats
} = require('../dataservice/user');

const {
    getLocationPageData,
    updatePlayerLocation,
    applyLocationEffect
} = require('../dataservice/location');

const {
    getSessionPid
} = require('../dataservice/session')

///////////////////////////////////////////////////////////////////////////////
// Checks is location of the player has a connection to the location
// they are requesting to move to
///////////////////////////////////////////////////////////////////////////////

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


///////////////////////////////////////////////////////////////////////////////
// Gets the data of the requested location and if the location has a valid 
// connections to the player's location, generates the location page,
// otherwise generates an error page.
///////////////////////////////////////////////////////////////////////////////

async function generateLocationResponse(conn, locID, sessionId) {
    const pid = await getSessionPid(conn, sessionId); // PROBABLY NEED TO GET THIS FROM THE COOKIE?
    if (!pid) {
        return pug.renderFile('./templates/message.pug', { message: "No player found for this session." } )
    }

    const apply = await applyLocationEffect(conn, locID, pid);

    if (!apply.success) {
        return pug.renderFile('./templates/message.pug', { message: "Well, you should have perished, but something went wrong.. Good for you!"});
    }
    
    const data = await getLocationPageData(conn, locID, pid);

    if (data.loc && data.player) {
        const loc = data.loc;
        const player = data.player;

        // Fetch discovered connections for the current player and location
        const discoveredConnections = await conn.query(
            "SELECT conn_id FROM player_location_connection WHERE pid = ? AND loc_id = ?",
            [pid, locID]
        );
        const discoveredConnectionIds = discoveredConnections.map(row => row.conn_id);

/*
        // Filter loc.connections to include only discovered connections
        loc.connections = loc.connections.filter(conn => discoveredConnectionIds.includes(conn.conn_id));
console.log("loc.connections after filtering:", loc.connections);
 */
        
        if(locationIsValid(loc.connections, player.loc_id, locID)){
            const playerStats = { 
                hp: player.health,
                xp: player.experience,
                level: player.level
            }
            updatePlayerLocation(conn, locID, pid); 
            return pug.renderFile('./templates/location.pug', { location: loc, stats: playerStats, discoveredConnectionIds });
        
        } else {
            return pug.renderFile('./templates/location_error.pug', { locID: player.loc_id, buttonLabel: "GO!"});
        }
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: "Player or location data not found." } )
    }
}   

async function updateAfterAction(conn, act_id) {
    return JSON.stringify({
        stats: '<p>HP: 12</p><p>XP: 34</p> <p>Level: 1</p>',
        description: '<p>You swing your sword!</p>',
    });;
}

async function generateExplore(conn, req) {
    const cookie = req.headers.cookie ? req.headers.cookie.split("=") : [];
    const sessionId = cookie[1] || null;
    const pid = await getSessionPid(conn, sessionId);
    if (!pid) {
        return pug.renderFile('./templates/message.pug', { message: "Session ID nhot found."});
    }
    const playerData = await getPlayerData(conn, pid);
    const currentLocationId = playerData.player_data.loc_id;
    const locationData = await getLocationPageData(conn, currentLocationId, pid);

    const discoveredConnections = await conn.query(
        "SELECT conn_id FROM player_location_connection WHERE pid = ? AND loc_id = ?",
        [pid, currentLocationId]
    );
    const discoveredConnectionIds = discoveredConnections.map(row => row.conn_id);
    // Filter connections to find undiscovered ones
    const undiscoveredConnections = locationData.loc.connections.filter(conn =>
        !discoveredConnectionIds.includes(conn.conn_id)
    );
    
    if (undiscoveredConnections.length === 0) {
        return pug.renderFile('./templates/location.pug', {
            location: locationData.loc,
            stats: {
                hp: playerData.player_data.health,
                xp: playerData.player_data.experience,
                level: playerData.player_data.level
            },
            discoveredConnectionIds, // Pass discoveredConnectionIds
            message: "No new connections to explore!"
        });
    }

    // Select a random undiscovered connection
    const randomConnection = undiscoveredConnections[Math.floor(Math.random() * undiscoveredConnections.length)];

    // Add the new connection to the player's discovered connections
    await conn.query(
        "INSERT INTO player_location_connection (pid, loc_id, conn_id) VALUES (?, ?, ?)",
        [pid, currentLocationId, randomConnection.conn_id]
    );

    console.log("Inserted discovered location in db.");
    // Refresh the location data to include the new connection
    const updatedLocationData = await getLocationPageData(conn, currentLocationId, pid);

    return pug.renderFile('./templates/location.pug', {
        location: updatedLocationData.loc,
        stats: {
            hp: playerData.player_data.health,
            xp: playerData.player_data.experience,
            level: playerData.player_data.level
        },
        discoveredConnectionIds, // Pass discoveredConnectionIds
        message: `You discovered a new location: ${randomConnection.conn_name}!`
    });
}


module.exports = { 
    generateLocationResponse,
    generateExplore
};

