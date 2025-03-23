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

module.exports = { generateHead, generateLocationBody }
