const url = require('url');
const pug = require('pug')
const uid = 1; // temporary userid until we set up a login system
const { getUserData, getLocationPageData, updateUserLocation, insertLocation } = require('./dataService');


////////////////////////////////////////////////////////////
// ROUTING FUNCTIONS
////////////////////////////////////////////////////////////

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

async function generateLocationResponse(conn, url) {
    const user_info = await getUserData(conn, uid);
    const id = url.query.locID;
    const loc = await getLocationPageData(conn, id);

    if(locationIsValid(loc.connections, user_info.loc_id, id)){
        updateUserLocation(conn, id, uid);
        return pug.renderFile('./templates/location.pug', { location: loc });   
    
    } else {
        return pug.renderFile('./templates/location_error.pug', { userLocID: user_info.loc_id, buttonLabel: "GO!"});
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

    const result = await insertLocation(conn, name, emojis);
    return pug.renderFile('./templates/show_message.pug', { message: result });
}

async function generateStartResponse(conn) {
    const user_info = await getUserData(conn, uid);
    return pug.renderFile('./templates/start_page.pug', { userLocID: user_info.loc_id });
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
           return generateInsertResponse(conn, req);

        default: 
            return generateStartResponse(conn, uid);
    }

}

module.exports = { requestRoute }
