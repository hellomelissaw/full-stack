const url = require('url');
const pug = require('pug');
const temp_token = "temp-sesh-12345"; 
const bcrypt = require('bcrypt');
const saltRounds = 10;

const {
    generateLandingPage,
    createNewGame,
    generateNewGamePageResponse,
    generateLoadPageResponse,
    loadGame,
    generateInsertResponse,
    quitGame
} = require('./main-routes');

const {
    validateLoginResponse
} = require('./login-routes');

const {
    generateLocationResponse
} = require('./location-routes');

const {
    updatePassword
} = require('../dataservice/user');


////////////////////////////////////////////////////////////
// TEMP FUNCTIONS
////////////////////////////////////////////////////////////
// Run this once to set the test hashes in the database
async function getTestUserPasswordHash(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds); 
        const hash = await bcrypt.hash(password, salt); 
        return hash; 
    } catch (err) {
        return null; 
    }
}


async function setTestUserPasswordHash(conn, url) {
    const hash = await getTestUserPasswordHash(url.query.password);
    if(hash){ 
        const result = await updatePassword(conn, hash, url.query.uid);
        if(!result.success) {
            return pug.renderFile('./templates/message.pug', { message: result.error })
        } 
            return pug.renderFile('./templates/message.pug', { message: "Setting hash success" })
    }

    return pug.renderFile('./templates/message.pug', { message: "Failed to get hash" })

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

        case '/create-account':
            return pug.renderFile('./templates/createAccount.pug')

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
            console.log(parsedURL.query.pid);
            return loadGame(conn, parsedURL.query.pid);

        case '/new-game-page':
           return generateNewGamePageResponse(conn, req);

        case '/new-game':
            return createNewGame(conn, req)

        case '/quit':
            return quitGame(conn, req)
	
	    case '/set-hash':
	        return setTestUserPasswordHash(conn, parsedURL);

        default: 
            return generateLandingPage(conn, req);
    }

}

module.exports = { requestRoute }
