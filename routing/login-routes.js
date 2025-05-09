///////////////////////////////////////////////////////////////////////////////
// ALL THE ROUTING FUNCTIONS USED TO LOG THE USER IN
///////////////////////////////////////////////////////////////////////////////

const pug = require('pug');
const bcrypt = require('bcrypt');

const {
    createSession
} = require('../dataservice/session');

const {
    getUserData
} = require('../dataservice/user');

const {
    generateStartResponse
} = require('./main-routes')


///////////////////////////////////////////////////////////////////////////////
// Creates a row for the user's session with their unique token and user id
// and forwards the user to the appropriate according to the failure or success
// of creating a new session
///////////////////////////////////////////////////////////////////////////////

async function createSessionInDB(conn, req, temp_token, uid) {
    const sessionResult = await createSession(conn, temp_token, uid);

    if (sessionResult.success) {     
        return generateStartResponse(conn, req)

    } else {
        return pug.renderFile('./templates/message.pug', { message: sessionResult.error })

    }

}


///////////////////////////////////////////////////////////////////////////////
// Validate the login information provided by user and forward them to 
// the appropriate page according to result
///////////////////////////////////////////////////////////////////////////////

async function validateLoginResponse(conn, req, temp_token) {
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

    // Get the user row by given username
    const result = await getUserData(conn, username);

    if (result.success) {
        const storedHashedPassword = result.user_data.password;

        try {
            // Compare the hashed password with the hash in the DB for given user
            const isMatch = await bcrypt.compare(userInputPassword, storedHashedPassword);
            
            if (isMatch) { // Forward user to appropriate page according to result
                console.log('Passwords match! User authenticated.');

                const sessionResult = await createSessionInDB(conn, req, temp_token, result.user_data.uid);
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
    validateLoginResponse
}