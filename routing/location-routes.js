///////////////////////////////////////////////////////////////////////////////
// ALL THE ROUTING FUNCTIONS RELATED TO LOCATION PAGES
///////////////////////////////////////////////////////////////////////////////
const pug = require('pug');
const temp_token = "temp-sesh-12345"; 

const {
    getPlayerData
} = require('../dataservice/user');

const {
    getLocationPageData,
    updatePlayerLocation,
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

async function generateLocationResponse(conn, url) {
    const pid = await getSessionPid(conn, temp_token); // PROBABLY NEED TO GET THIS FROM THE COOKIE?
    if (!pid) {
        return pug.renderFile('./templates/message.pug', { message: "No user found! Please log in or create an account." } )
    }
    const result = await getPlayerData(conn, pid); 

    if(result.success) {
        const id = url.query.locID;
        const loc = await getLocationPageData(conn, id);
    
        if(locationIsValid(loc.connections, result.player_data.loc_id, id)){
            updatePlayerLocation(conn, id, pid); 
            return pug.renderFile('./templates/location.pug', { location: loc });   
        
        } else {
            return pug.renderFile('./templates/location_error.pug', { locID: result.player_data.loc_id, buttonLabel: "GO!"});
        }
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: result.error } )
    }
    
}

async function generateExplore(conn, req) {
    const pid = await getSessionPid(conn, temp_token);
    const playerData = await getPlayerData(conn, pid);
    if (!playerData.success) {
        return pug.renderFile('./templates/message.pug', { message: playerData.error });
    }
    const currentLocationId = playerData.player_data.loc_id;
    const locationData = await getLocationPageData(conn, currentLocationId);

    const discoveredConnections = await conn.query(
        "SELECT conn_id FROM player_location_connection WHERE pid = ? AND loc_id = ?",
        [pid, currentLocationId]
    );
    const discoveredConnectionIds = discoveredConnections.map(row => row.conn_id);

    // Filter connections to find undiscovered ones
    const undiscoveredConnections = locationData.connections.filter(conn =>
        !discoveredConnectionIds.includes(conn.conn_id)
    );

    if (undiscoveredConnections.length === 0) {
        return pug.renderFile('./templates/location.pug', {
            location: locationData,
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


    // Refresh the location data to include the new connection
    const updatedLocationData = await getLocationPageData(conn, currentLocationId);

    return pug.renderFile('./templates/location.pug', {
        location: updatedLocationData,
        message: `You discovered a new location: ${randomConnection.conn_name}!`
    });
}


module.exports = { 
    generateLocationResponse,
    generateExplore
};