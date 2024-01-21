const express = require('express');
const mongoDB = require('mongoose');
const routers = require('./routes');
const line = require('./controllers/line.controller');
const cors = require("cors");
const http = require('http');
const httpContext = require('express-http-context');
const socketIo = require('socket.io');

const app = express();
const env = process.env.NODE_ENV || "local";
require("dotenv").config({ path: `.env.${env}` });

const databaseURI = process.env.DATABASE_URI;
const port = process.env.SERVER_PORT;

// CORS options
const corsOptions = {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
};

// Connect to MongoDB
mongoDB.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connect to MongoDB:', error.response ? error.response.data : error.message));

// CORS middleware
app.use(cors(corsOptions));

// Connect SockerIo to server 
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    socket.on('adminReply', (message) => {
        line.replyMessage(message)
    })
    socket.emit('init', 'Server connected');
});

// Init app and routes
app.use(httpContext.middleware);
app.options('*', cors(corsOptions));
app.use('/', routers);

server.listen(port, () => {
    console.log(`Server is running on port ${port}\n`);
});

module.exports = { io };
