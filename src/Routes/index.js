const user = require('./UserRoute')
const goal = require('./goal');

module.exports = {
    name: 'base-route',
    version: '1.0.0',
    register: (server, options) => {
        server.route(user);
        server.route(goal);
    }
}   
