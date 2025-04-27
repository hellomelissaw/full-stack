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

async function createSessionInDB(conn, req, temp_token, uid) {
    const sessionResult = await createSession(conn, temp_token, uid);

    if (sessionResult.success) {     
        return generateStartResponse(conn, req)

    } else {
        return pug.renderFile('./templates/message.pug', { message: sessionResult.error })

    }

}

async function validateLoginResponse(conn, req, temp_token) {
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

    const result = await getUserData(conn, username);

    if (result.success) {
        const storedHashedPassword = result.user_data.password;

        try {
            const isMatch = await bcrypt.compare(userInputPassword, storedHashedPassword);

            if (isMatch) {
                console.log('Passwords match! User authenticated.');

                const sessionResult = await createSessionInDB(conn, req, temp_token, result.user_data.uid);
		return sessionResult;

            } else {
                console.log('Passwords do not match! Authentication failed.');
                return pug.renderFile('./templates/temp_login.pug', {
                    showError: true
                });
            }

        } catch (err) {
            console.error('Error comparing passwords:', err);
            return pug.renderFile('./templates/message.pug', {
                message: 'Something went wrong when checking the password.'
            });
        }
    }
}

module.exports = { 
    validateLoginResponse
}