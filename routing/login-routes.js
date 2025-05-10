///////////////////////////////////////////////////////////////////////////////
// ALL THE ROUTING FUNCTIONS USED TO LOG THE USER IN
///////////////////////////////////////////////////////////////////////////////
const saltRounds = 10;

const pug = require('pug');
const bcrypt = require('bcrypt');

const {
    createSession,
    createNewAccount
} = require('../dataservice/session');

const {
    getUserData
} = require('../dataservice/user');

const {
    generateStartResponse
} = require('./main-routes')

////////////////////////////////////////////////////////////
// HASHING FUNCTIONS
////////////////////////////////////////////////////////////
// Run this once to set the test hashes in the database
async function hashUserInput(input) {
    try {
        const salt = await bcrypt.genSalt(saltRounds); 
        const hash = await bcrypt.hash(input, salt); 
        console.log(hash)
        return hash; 
    } catch (err) {
        console.log(err);
        return null; 
    }
}

///////////////////////////////////////////////////////////////////////////////
// Creates a row for the user's session with their unique token and user id
// and forwards the user to the appropriate according to the failure or success
// of creating a new session
///////////////////////////////////////////////////////////////////////////////

async function createSessionInDB(conn, sessionId, uid) {
    const sessionResult = await createSession(conn, sessionId, uid);

    if (sessionResult.success) {     
        return await generateStartResponse(conn, sessionId);

    } else {
        return pug.renderFile('./templates/message.pug', { message: sessionResult.error })

    }

}

///////////////////////////////////////////////////////////////////////////////
// Creates a new account from /create-account sent to /create-account-receive
///////////////////////////////////////////////////////////////////////////////

async function createAccount (conn, req, sessionId) {
    // const user = req.body.username;
    // const pass = req.body.password;

    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => {
            body += chunk.toString();
        })
        req.on('end', resolve);
    });
    const params = new URLSearchParams(body);
    const pass = params.get('password');
    console.log(`pass: ${pass}`);
    const hash = await hashUserInput(pass);
    if (hash) {
        const result = await createNewAccount(conn, params.get('username'), hash);
        
        if (result.success) {
            return await createSessionInDB(conn, sessionId, result.uid);
            //return pug.renderFile('./templates/start.pug');
        } else {
            return pug.renderFile('./templates/message.pug', { message: "Problem creating new account, please try again." } )
        }
    } else {
        return pug.renderFile('./templates/message.pug', { message: "Securing password failed, please try again." } )
    }
}    


///////////////////////////////////////////////////////////////////////////////
// Validate the login information provided by user and forward them to 
// the appropriate page according to result
///////////////////////////////////////////////////////////////////////////////

async function validateLoginResponse(conn, req, sessionId) {
    // Get the username and password from the input field
    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', resolve);
    });

    const params = new URLSearchParams(body);
    const username = params.get('username');
    const userInputPassword = params.get('password');
    console.log(`username: ${username} password: ${userInputPassword}`);
    // Get the user row by given username
    const result = await getUserData(conn, username);

    if (result.success) {
    console.log("Result success..."); 
       const storedHashedPassword = result.user_data.password;

        try {
            // Compare the hashed password with the hash in the DB for given user
            const isMatch = await bcrypt.compare(userInputPassword, storedHashedPassword);
            
            if (isMatch) { // Forward user to appropriate page according to result
                console.log('Passwords match! User authenticated.');
                // session=eqctlv3u; Expires=1747041076537; HttpOnly
                // req.headers.cookie;
                const sessionResult = await createSessionInDB(conn, sessionId, result.user_data.uid);
		        return sessionResult;

            } else {
                console.log('Passwords do not match! Authentication failed.');
                return pug.renderFile('./templates/loginPage.pug', {
                    showError: true
                });
            }

        } catch (err) {
            console.error('Error comparing passwords:', err);
            return pug.renderFile('./templates/message.pug', {
                message: 'Something went wrong when checking the password.'
            });
        }
    } else {
        return pug.renderFile('./templates/message.pug', {
            message: result.error
        });
    }
}

module.exports = { 
    createAccount,
    validateLoginResponse
}
