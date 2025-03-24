const uid = 1; // temporary userid until we set up a login system
const { getUserData, getLocationPageData, updateUserLocation, insertLocation } = require('./dataService');
const url = require('url');
const { generateErrorPage, generateStartPage, generateInsertPage } = require('./generatorHTML');

function locationIsValid(connection_rows, user_loc_id, loc_id) {
    if (user_loc_id == loc_id) { 
        return true; 
    }

    let isValid = false;
    for (const row of connection_rows) {
        if(row.conn_id == user_loc_id) {
            isValid = true;
        }
    }
    return isValid;
}

async function requestRoute(conn, req) {
    const parsed = url.parse(req.url, true);
    const path = parsed.pathname;
    const user_info = await getUserData(conn, uid);

    switch(path) {
        case '/location':
            const id = parsed.query.locID;
            const loc = await getLocationPageData(conn, id);
 
            if(locationIsValid(loc.connections, user_info.loc_id, id)){
                updateUserLocation(conn, id, uid);aa
                return loc.generateHTML();
            
            } else {
                return generateErrorPage(user_info.loc_id, 'INVALID_MOVE')
            }
        
        case '/insert-location':
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const params = new URLSearchParams(body);
                const name = params.get('name');
                const emojis = params.get('emojis');
                return insertLocation(name, emojis);
            });

        case '/insert-location-form':
            return generateInsertPage();
        default: 
            return generateStartPage(user_info.loc_id);
    }

}

module.exports = { requestRoute }
