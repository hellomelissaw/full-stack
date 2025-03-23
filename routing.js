const uid = 1; // temporary userid until we set up a login system
const { getUserData, getLocationPageData, updateUserLocation } = require('./dataService');
const url = require('url');

function locationIsValid(connection_rows, user_loc_id, loc_id) {
    if (user_loc_id == loc_id) { 
        return true; 
    }

    let isValid = false;
    for (const row of connection_rows) {
        console.log(`conn_id: ${row.conn_id}, user_loc_id: ${user_loc_id}`)
        if(row.conn_id == user_loc_id) {
            isValid = true;
        }
    }
    return isValid;
}

async function requestRoute(conn, req) {
    const parsed = url.parse(req.url, true);
    const path = parsed.pathname;
    const user_info = getUserData(conn, uid);
    console.log(`parsed and path in requestRoute: ${parsed}, ${path}`);
    switch(path) {
        case '/location':
            const id = parsed.query.locID;
            const loc = await getLocationPageData(conn, id);

            if(locationIsValid(loc.connections, user_info.loc_id, id)){
                updateUserLocation(id, uid);
                return loc.generateHTML();
            
            } else { // TODO: make 'generate' functions for all of these
                return `
                <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Dead end!</title>
                    </head>
                    <body>
                        <h1>Invalid location! Go back to where you were!</h1>
                        <button onclick="window.location.href='/location?locID=${user_info.loc_id}'">Go!</button>
                    </body>
                    </html>
                `;
            }
        default: 
            return `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Game start!</title>
                </head>
                <body>
                    <h1>Welcome to the game, click start to start!</h1>
                    <button onclick="window.location.href='/location?locID=${user_info.loc_id}'">start</button>
                </body>
                </html>

            `;
    }

}

module.exports = { requestRoute }
