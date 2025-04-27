///////////////////////////////////////////////////////////////////////////////
// ALL THE ROUTING FUNCTIONS RELATED TO LOCATION PAGES
///////////////////////////////////////////////////////////////////////////////

const pug = require('pug');

const {
    getPlayerData
} = require('../dataservice/user');

const {
    getLocationPageData,
    updatePlayerLocation,
} = require('../dataservice/location');


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
    const pid = await getSessionPid(conn, temp_token);
    if (!pid) {
        return pug.renderFile('./templates/message.pug', { message: "No user found! Please log in or create an account." } )
    }
    const result = await getPlayerData(conn, pid); 

    if(result.success) {
        const id = url.query.locID;
        const loc = await getLocationPageData(conn, id);
    
        if(locationIsValid(loc.connections, result.player_data.loc_id, id)){
            updatePlayerLocation(conn, id, pid); 
            return pug.renderFile('./templates/game_page.pug', { location: loc });   
        
        } else {
            return pug.renderFile('./templates/location_error.pug', { locID: result.player_data.loc_id, buttonLabel: "GO!"});
        }
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: result.error } )
    }
    
}

module.exports = { 
    generateLocationResponse
}