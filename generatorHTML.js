// let page_info = {
//     "page_type": "location",
//     "title": "Adventure time...",
//     "location_connections": {}
// }
function generateHead(title) {
    return `
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
            </head>
           `
}

function generateBody(page_type, page_info) {
    let body = '<body>';
    switch(page_type) {
        case 'location':

            return;

    }
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
}

module.exports = { generateHead, generateLocationBody }