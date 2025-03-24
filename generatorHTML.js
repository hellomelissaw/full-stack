const { getErrorMessage } = require('./ERROR_MESSAGES')


function generateHead(title) {
    return `
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
            </head>
           `
}

function generateLocationBody(location, connections){
    let html = `<body>
                <h1>Welcome to the ${location.name}. ${location.emojis ? location.emojis : ''}</h1>`;

    for (const row of connections) {
        html += `<button onclick="window.location.href='/location?locID=${row.conn_id}'">
                    ${row.conn_name}
                </button>`
    };
    
    html += `</body>`;

    return html;
}

function generateStartPage(userLocID) {
    let html = `<!DOCTYPE html>
                    <html lang="en">`;
    
    html += generateHead("Start your adventure here");

    html += `<body>
                <h1>Welcome to the game, click start to start!</h1>
                <button onclick="window.location.href='/location?locID=${userLocID}'">start</button>
                <button onclick="window.location.href='/insert-location-form'">Insert</button>
            </body>`
    html += `</html>`;
}

function generateInsertPage() {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Insert Location</title>
    </head>
    <body>
        <h1>Insert New Location</h1>
        <form action="/insert-location" method="post">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required><br>
            <label for="emojis">Emojis:</label>
            <input type="text" id="emojis" name="emojis"><br>
            <button type="submit">Insert</button>
        </form>
    </body>
    </html>
    `;

    return html;

}

function generateErrorPage(userLocID, errorCode) {
    let html = `<!DOCTYPE html>
                    <html lang="en">`;
    
    html += generateHead("Error!");
    
    html += `<body>
                    <h1>${getErrorMessage(errorCode)}</h1>
                    <button onclick="window.location.href='/location?locID=${userLocID}'">Go!</button>
                </body>`
    html += `</html>`;

    return html;
}

module.exports = { generateHead, 
                   generateLocationBody, 
                   generateErrorPage, 
                   generateStartPage,
                   generateInsertPage
                }
