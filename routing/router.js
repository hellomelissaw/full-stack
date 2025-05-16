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
    getSessionId,
    getSessionStatus
} = require('../dataservice/session');

const {
    buildCookie
} = require('./cookie');


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

    // TODO: put in helper function if this works...

    const publicPaths = ['/', '/log-in-page','/log-in', '/create-account', '/create-account-receive'];
    // Check if session is active and if so, what user is associated
    if (!publicPaths.includes(path)) {
        if (sessionId && await getSessionStatus(conn, sessionId)) {
            sessionUser = await getSessionUser(conn, sessionId);
        
        } else {
            // No valid session and no uid: redirect to login and clear cookie
            console.log("No valid session or uid");
            return {
                content: pug.renderFile('./templates/loginPage.pug', { message: "Session expired." }),
                cookie: 'session=; Max-Age=0; HttpOnly'
            };
        }
    }


    switch(path) {
        case '/log-in-page':
            content = pug.renderFile('./templates/loginPage.pug');
            break;

        case '/create-account':
            content = pug.renderFile('./templates/createAccount.pug')
            break;

        case'/create-account-receive':
            return await createAccount(conn, req, sessionId); // cookie integrated in response
          

        case '/log-in':
            return await validateLoginResponse(conn, req, sessionId); // cookie integrated in response

        case '/location':
            content = await generateLocationResponse(conn, parsedURL.query.locID, sessionId);
            break;

        case '/update_game_page_data':
            content = { 
                content: await performAction(conn, parsedURL.query.act_id, sessionId), 
                contentType: 'application/json'
            };
            break;

        case '/insert-location-form':
            content =  pug.renderFile('./templates/insert_form.pug');
            break;
        
        case '/insert-location':
            content = await generateInsertResponse(conn, req, parsedURL);
            break;

        case '/load-game-page':
            content = await generateLoadPageResponse(conn, sessionId);
            break;

        case '/load-game':
            content = await loadGame(conn, parsedURL.query.pid, sessionId);
            break;

        case '/new-game-page':
            content = await generateNewGamePageResponse(conn, sessionId);
            break;

        case '/new-game':
            content = await createNewGame(conn, req, sessionId);
            break;

        case '/quit':
            content = await quitGame(conn, sessionId);
            break;
	
	    case '/set-hash':
	        content = await setTestUserPasswordHash(conn, parsedURL);
            break;

        case '/explore':
            content = await generateExplore(conn, req);
            break;

        default: 
            content = await generateLandingPage(conn, sessionId);
    }

    const updatedCookie = await buildCookie(conn, sessionUser);
    return { content: content, cookie: updatedCookie }
}

module.exports = { requestRoute }
