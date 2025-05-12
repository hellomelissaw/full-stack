const url = require('url');
const pug = require('pug');
// const temp_token = "temp-sesh-12345"; 
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Declare cookie variables so they can be exported
// let cookie = [];
//console.log("Cookie Header:", req.headers.cookie);
// let sessionId = '';
//console.log("Extracted Session ID:", sessionId);

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

const { 
    getSessionUser,
    getSessionId
} = require('../dataservice/session');


// async function setTestUserPasswordHash(conn, url) {
//     const hash = await getTestUserPasswordHash(url.query.password);
//     if(hash){ 
//         const result = await updatePassword(conn, hash, url.query.uid);
//         if(!result.success) {
//             return pug.renderFile('./templates/message.pug', { message: result.error })
//         } 
//             return pug.renderFile('./templates/message.pug', { message: "Setting hash success" })
//     }

//     return pug.renderFile('./templates/message.pug', { message: "Failed to get hash" })

// }

async function buildCookie(uid) {
    const sessionId = await getSessionId(uid);
    let sessionCook = '';
    if (sessionId) {
        let sessionDate = new Date();
        sessionDate = sessionDate.setDate(sessionDate.getDate() + 3);
        sessionCook = 'session=' + sessionId + '; Expires=' + sessionDate + '; HttpOnly';
    }
    return sessionCook;
}

////////////////////////////////////////////////////////////
// ROUTER 
////////////////////////////////////////////////////////////

async function requestRoute(conn, req) {
    let cookie;
    let sessionUser;
    let sessionId;
    let content;

    const parsedURL = url.parse(req.url, true);
    const path = parsedURL.pathname;
    cookie = req.headers.cookie ? req.headers.cookie.split("=") : [];

    sessionId = cookie[1] || null;
    console.log("Extracted Session ID:", sessionId);

    if (sessionId) {
        sessionUser = getSessionUser(sessionId);
    } else {
        sessionUser = parsedURL.query.uid;
    }

    switch(path) {
        case '/log-in-page':
            content = pug.renderFile('./templates/loginPage.pug', { showError: false });

        case '/create-account':
            content = pug.renderFile('./templates/createAccount.pug')

        case'/create-account-receive':
            content = createAccount(conn, req, sessionId);

        case '/log-in':
            content = validateLoginResponse(conn, req, sessionId);

        case '/location':
            content = generateLocationResponse(conn, parsedURL.query.locID, sessionId);

        case '/update_game_page_data':
            content = { 
                content: await performAction(conn, parsedURL.query.act_id, sessionId), 
                contentType: 'application/json'
            };

        case '/insert-location-form':
            content =  pug.renderFile('./templates/insert_form.pug');
        
        case '/insert-location':
            content = generateInsertResponse(conn, req, parsedURL);

        case '/load-game-page':
            content = generateLoadPageResponse(conn, sessionId);

        case '/load-game':
            content = loadGame(conn, parsedURL.query.pid, sessionId);

        case '/new-game-page':
            content = generateNewGamePageResponse(conn, sessionId);

        case '/new-game':
            content = createNewGame(conn, req, sessionId);

        case '/quit':
            content = quitGame(conn, sessionId);
	
	    case '/set-hash':
	        content = setTestUserPasswordHash(conn, parsedURL);

        case '/explore':
            const template = generateExplore(conn, req);
            console.log(template);
            content = template;

        default: 
            content = generateLandingPage(conn, sessionId);
    }

    const updatedCookie = buildCookie(sessionUser);
    console.log("Content in router:");
    console.log(content);
    return { content: content, cookie: updatedCookie }
}

module.exports = { requestRoute, buildCookie }
