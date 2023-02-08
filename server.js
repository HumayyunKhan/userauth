const http = require('http');

const address = process.env.LISTEN_ADDRESS || 'localhost';
const { PORT=3000 } = process.env;
require('dotenv').config()

const app = require('./app');

const server = http.createServer(app);

server.listen(PORT, () => console.log(`===> listening on http://${address}:${PORT}/`));
