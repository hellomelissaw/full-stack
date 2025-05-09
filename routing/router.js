const url = require('url');
const pug = require('pug');
// const temp_token = "temp-sesh-12345"; 
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
    createAccount,
    validateLoginResponse,
} = require('./login-routes');

const {
    generateLocationResponse,
    generateExplore

} = require('./location-routes');

const {
    updatePassword
} = require('../dataservice/user');

const {
    performAction
} = require('../actions/ActionHandler');


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
    const cookie = req.headers.cookie.split("=");
    const sessionId = cookie[1];

    switch(path) {
        case '/log-in-page':
            return pug.renderFile('./templates/loginPage.pug', { showError: false });

        case '/create-account':
            return pug.renderFile('./templates/createAccount.pug')

        case'/create-account-receive':
            return createAccount(conn, req, sessionId);

        case '/log-in':
            return validateLoginResponse(conn, req, sessionId);

        case '/location':
            return generateLocationResponse(conn, parsedURL.query.locID, sessionId);

        case '/update_game_page_data':
            return { 
                content: await performAction(conn, parsedURL.query.act_id, sessionId), 
                contentType: 'application/json'
            };

        case '/insert-location-form':
            return pug.renderFile('./templates/insert_form.pug');
        
        case '/insert-location':
           return generateInsertResponse(conn, req, parsedURL);

        case '/load-game-page':
            return generateLoadPageResponse(conn, sessionId);

        case '/load-game':
            return loadGame(conn, sessionId);

        case '/new-game-page':
           return generateNewGamePageResponse(conn, sessionId);

        case '/new-game':
            return createNewGame(conn, req, sessionId);

        case '/quit':
            return quitGame(conn, sessionId);
	
	    case '/set-hash':
	        return setTestUserPasswordHash(conn, parsedURL);

        case '/explore':
            const template = generateExplore(conn, req);
            console.log(template);
            return template;

        default: 
            return generateLandingPage(conn, sessionId);
    }

}

module.exports = { requestRoute }
