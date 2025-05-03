///////////////////////////////////////////////////////////////////////////////
// ALL THE ROUTING FUNCTIONS RELATED TO LOCATION PAGES
///////////////////////////////////////////////////////////////////////////////
const pug = require('pug');
const temp_token = "temp-sesh-12345"; 

const {
    getPlayerData,
    getPlayerStats
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

async function generateLocationResponse(conn, locID) {
    const pid = await getSessionPid(conn, temp_token); // PROBABLY NEED TO GET THIS FROM THE COOKIE?
    if (!pid) {
        return pug.renderFile('./templates/message.pug', { message: "No user found! Please log in or create an account." } )
    }

    const data = await getLocationPageData(conn, locID, pid);

    if (data.loc && data.player) {
        const loc = data.loc;
        const player = data.player;
        if(locationIsValid(loc.connections, player.loc_id, locID)){
            const playerStats = { 
                hp: player.health,
                xp: player.experience,
                level: player.level
            }
            updatePlayerLocation(conn, locID, pid); 
            return pug.renderFile('./templates/location.pug', { location: loc, stats: playerStats });
        
        } else {
            return pug.renderFile('./templates/location_error.pug', { locID: player.loc_id, buttonLabel: "GO!"});
        }
    
    } else {
        return pug.renderFile('./templates/message.pug', { message: "Player or location data not found." } )
    }
}   

async function updateAfterAction(conn, act_id) {
    return JSON.stringify({
        stats: '<p>HP: 12</p><p>XP: 34</p>',
        description: '<p>You swing your sword!</p>'
    });;
}


module.exports = { 
    generateLocationResponse,
    updateAfterAction
}
