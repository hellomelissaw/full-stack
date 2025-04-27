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


//const { setCookie, getCookie, delCookie } = require('./cookie.js');


// const {
//     createSession,
//     getSessionUser,
//     getSessionStatus,
//     deleteSession,
//     addPidToSession,
//     getSessionPid
// } = require('../dataservice/session');

const {
    // getPlayerData, 
    // createNewPlayer,
    // getUserPlayers,
    // getUserData,
    // loadGames,
    updatePassword
} = require('../dataservice/user');

// const {
//     getLocationPageData,
//     updatePlayerLocation,
//     insertLocation
// } = require('../dataservice/location');


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
// ROUTING FUNCTIONS
////////////////////////////////////////////////////////////

// function locationIsValid(connection_rows, player_loc_id, loc_id) {
//     if (player_loc_id == loc_id) { 
//         return true; 
//     }

//     for (const row of connection_rows) {
//         if(row.conn_id == player_loc_id) {
//             return true;
//         }
//     }
//     return false;
// }

// async function createSessionInDB(conn, req, temp_token, uid) {
//     const sessionResult = await createSession(conn, temp_token, uid);

//     if (sessionResult.success) {     
//         return generateStartResponse(conn, req)

//     } else {
//         return pug.renderFile('./templates/message.pug', { message: sessionResult.error })

//     }

// }

// async function validateLoginResponse(conn, req, temp_token) {
//     let body = '';
//     await new Promise((resolve) => {
//         req.on('data', chunk => {
//             body += chunk.toString();
//         });
//         req.on('end', resolve);
//     });

//     const params = new URLSearchParams(body);
//     const username = params.get('username');
//     const userInputPassword = params.get('password');

//     const result = await getUserData(conn, username);

//     if (result.success) {
//         const storedHashedPassword = result.user_data.password;

//         try {
//             const isMatch = await bcrypt.compare(userInputPassword, storedHashedPassword);

//             if (isMatch) {
//                 console.log('Passwords match! User authenticated.');

//                 const sessionResult = await createSessionInDB(conn, req, temp_token, result.user_data.uid);
// 		return sessionResult;

//             } else {
//                 console.log('Passwords do not match! Authentication failed.');
//                 return pug.renderFile('./templates/temp_login.pug', {
//                     showError: true
//                 });
//             }

//         } catch (err) {
//             console.error('Error comparing passwords:', err);
//             return pug.renderFile('./templates/message.pug', {
//                 message: 'Something went wrong when checking the password.'
//             });
//         }
//     }
// }


// async function generateLocationResponse(conn, url) {
//     const pid = await getSessionPid(conn, temp_token);
//     if (!pid) {
//         return pug.renderFile('./templates/message.pug', { message: "No user found! Please log in or create an account." } )
//     }
//     const result = await getPlayerData(conn, pid); 

//     if(result.success) {
//         const id = url.query.locID;
//         const loc = await getLocationPageData(conn, id);
    
//         if(locationIsValid(loc.connections, result.player_data.loc_id, id)){
//             updatePlayerLocation(conn, id, pid); 
//             return pug.renderFile('./templates/game_page.pug', { location: loc });   
        
//         } else {
//             return pug.renderFile('./templates/location_error.pug', { locID: result.player_data.loc_id, buttonLabel: "GO!"});
//         }
    
//     } else {
//         return pug.renderFile('./templates/message.pug', { message: result.error } )
//     }
    
// }

// async function generateInsertResponse(conn, req) {
//     let body = '';
//     await new Promise((resolve) => {
//         req.on('data', chunk => {
//             body += chunk.toString();
//         })

//         req.on('end', resolve);
//     });

//     const params = new URLSearchParams(body);
//     const name = params.get('name');
//     const emojis = params.get('emojis');
//     const connections = params.get('connections');

//     const result = await insertLocation(conn, name, emojis,connections);
//     return pug.renderFile('./templates/message.pug', { message: result });
// }

// async function generateLoadPageResponse(conn, req) { // Hard-coded token. This should be gotten from the req I guess?? 
//     const user = await getSessionUser(conn, temp_token);
//     if (!user) {
//         return pug.renderFile('./templates/message.pug', { message: "No user found! Please log in or create an account." } )
//     }
//     const games = await loadGames(conn, user.uid); 
//     return pug.renderFile('./templates/load_games.pug', {players: games});
// }

// async function loadGame(conn, pid) {
//     if (!pid) {
//         return pug.renderFile('./templates/message.pug', { message: "No user found! Please log in or create an account." } )
//     }
//     const result = await getPlayerData(conn, pid);
//     if(result.success){
//         const addedPid = await addPidToSession(conn, pid, result.player_data.uid);
//         if (addedPid) {
//             const loc = await getLocationPageData(conn, result.player_data.loc_id);
//             return pug.renderFile('./templates/game_page.pug', { location: loc });  
//         } else {
//             return pug.renderFile('./templates/message.pug', 
//                 { message: "Problem adding game to session, please try again." } 
//             )
//         }
    
//     } else {
//         return pug.renderFile('./templates/message.pug', { message: result.error } ) 
//     }
 
// }

// async function generateNewGamePageResponse(conn, req) {
//     const user = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
//     return pug.renderFile('./templates/new_game_form.pug', { uid: user.uid } );
// }

// async function createNewGame(conn, req) {
//     const user = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
//     const uid = user.uid;
//     let body = '';
//     await new Promise((resolve) => {
//         req.on('data', chunk => {
//             body += chunk.toString();
//         })

//         req.on('end', resolve);
//     });

//     const params = new URLSearchParams(body);
//     const name = params.get('name');
//     const result = await createNewPlayer(conn, uid, name);

//     if (result.success) {
//         const addedPid = await addPidToSession(conn, result.pid, uid);
//         if (addedPid) {
//             return loadGame(conn, result.pid);
//         }
//         return pug.renderFile('./templates/message.pug', { message: "Problem adding game to session, please try again." } )


//     } else {
//         console.log(result.error);
//         return pug.renderFile('./templates/message.pug', { message: "Problem loading game, please try again." } )
//     }
// }

// async function generateStartResponse(conn, req) {
//     const user = await getSessionUser(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
//     if(user) {
//         return pug.renderFile('./templates/start.pug', { uid: user.uid, username: user.username });

//     } else {
//         return pug.renderFile('./templates/message.pug', { message: "User not found." })
//     }
   
// }

// async function generateLandingPage(conn, req) {
//     const sessionExists = await getSessionStatus(conn, temp_token); // Hard-coded token. This should be gotten from the req I guess?? 
//     if(!sessionExists) {
//         return pug.renderFile('./templates/temp_login.pug', { showError: false });
    
//     } else {
//         console.log("session active");
//         return generateStartResponse(conn, req);
//     }
// }

// async function quitGame(conn, req) {
//     await deleteSession(conn, temp_token); // Hard-coded session token
//     return pug.renderFile('./templates/temp_login.pug', { showError: false });
// }


////////////////////////////////////////////////////////////
// ROUTER 
////////////////////////////////////////////////////////////

async function requestRoute(conn, req) {
    const parsedURL = url.parse(req.url, true);
    const path = parsedURL.pathname;

    switch(path) {
        case '/log-in-page':
            return pug.renderFile('./templates/temp_login.pug', { showError: false });

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
