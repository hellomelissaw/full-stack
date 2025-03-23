const {generateHead, generateLocationBody} = require('./generatorHTML');

////////////////////////////////////////////////////////////
// A PSEUDO-ABSTRACT CLASS FOR STORING FETCHED PAGE INFO
////////////////////////////////////////////////////////////

class PageInfo {
    constructor(title) {
        if (new.target === PageInfo) {
            throw new Error("Can only instantiate subclasses of PageInfo. Try LocationPageInfo for example.");
        }
        this.title = title;
    }

    generateHTML() {
        throw new Error("Method 'generateHTML' must be implemented in subclasses");
    }
}


class LocationPageInfo extends PageInfo () {
    constructor(title, location, connections) {
        super(title);
        this.location = location;
        this.connections = connections;
    }

    generateHTML() {
        let html = `<!DOCTYPE html>
                    <html lang="en">
                        ${generateHead(title)}
                        ${generateLocationBody(this.location, this.connections)}
                    </html>`;
        return html;
    }
}

module.exports = { LocationPageInfo };
