# Betting App Project

This project is a Node.js HTTP server  and Socket.io server built with Express and TypeScript, following Hexagonal Architecture and using Awilix for Dependency Injection. It employs BullMQ as a message broker for background jobs and asynchronous communication with a WebSocket service, and uses Mongoose for database operations.

## Features

- **Hexagonal Architecture**: Organized code into distinct layers for better maintainability and scalability.
- **Awilix**: Dependency Injection container for managing application dependencies.
- **Redis(BullMQ)**: Message broker for asynchronous communication with a WebSocket service.
- **Winston & Morgan**: Extensive Logging


## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Postman Documentation](#postman-documentation)

## Installation

To get started with this project, follow these steps:

1. **Clone the Repository**

```
git clone https://github.com/petlight45/betting_app_backend_.git
```
2. **Change directory 
```
cd betting_app_backend_
```
## Configuration
   
1. **Set up environmental variables**

```
cp ./http_server/.env.example ./http_server/.env
```

```
cp ./ws_server/.env.example ./ws_server/.env
```

 Update the .env file with your local configuration values.
 
 
 #FOR HTTP SERVER
 
 EXPRESS_APP_DATABASE_URL = The connection uri to the mongo db database to be used by this app
 
 EXPRESS_APP_SECRET_KEY = The secret key of this server for password hashing
 
 EXPRESS_APP_API_VERSION= The api version of all endpoints on this server
 
 EXPRESS_APP_SERVER_PORT=The target port to run this server on
 
 EXPRESS_APP_PRIVATE_ENDPOINT_SECRET_KEY=The private secret key of this server for synchronous inter-service communication from the Websocket server

 EXPRESS_APP_REDIS_URL= The connection uri to the message queue(Redis) used by this server for asynchronous inter-service communication with the Websocket server 
 
 EXPRESS_APP_MESSAGE_QUEUE_NAME_WEBSOCKET_SERVICE=The queue name that binds this server and the websocket server together, this server sends to this queue, while the WS server consumes from it
 
 EXPRESS_APP_ACTIVE_GAMES_COUNT = The no of active games to show on the dashboard
 
 EXPRESS_APP_GAME_DURATION_IN_MINUTES = The duration in minutes of a game
 
 EXPRESS_APP_USE_REALISTIC_EVENT_GENERATION_MODE = What it is set to True, a game last for 90 mins and the event generation becomes more realistic, However when set to False, event generation becomes very spontaneous and a game duration will be either 10 or the value assigned to EXPRESS_APP_GAME_DURATION_IN_MINUTES variable.
 
 
 
 ##FOR SOCKET.IO SERVER 
  
 EXPRESS_APP_SERVER_PORT=The target port to run this server on
 
 EXPRESS_APP_HTTP_SERVER_PRIVATE_ENDPOINT_SECRET_KEY=The private secret key of this server for synchronous inter-service communication from the HTTP server

 EXPRESS_APP_HTTP_SERVER_BASE_URL=The base endpoint url of the HTTP server

 EXPRESS_APP_REDIS_URL= The connection uri to the message queue(Redis) used by this server for asynchronous inter-service communication with the Websocket server 
 
 EXPRESS_APP_MESSAGE_QUEUE_NAME_WEBSOCKET_SERVICE=The queue name that binds this HTTP server and this server together, this HTTP server sends to this queue, while this server consumes from it with the aid of BullMQ

 
 
 
 ## Running the Server
 
 To run the server:
 
 Install docker and docker compose on your operating environment
 
 For linux, Windows or Old Mac run
 
    ```
    docker-compose up --build
    ```
    
For newer Mac

      ```
      docker compose up --build
    
## Postman Documentation
 

  
HTTP Server

https://documenter.getpostman.com/view/16065705/2sAXqy1djb


Socket.IO Server
Below is an example using socket.io client, given http://localhost:5000 is the base url of the socket.io server
```
const socket = io.connect('http://localhost:5000/socket.io', {
               auth: {
                 token: {{accessToken}}
               });

// Subscribe to leaderboard events
socket.emit('leaderboard-event-subscribe', {});

// Subscribe to a specific game
socket.emit('game-subscribe', { gameId: '66f5889f0ad0b9fb348510af' });

// Listen for game events
socket.on('game-event-subscribe', (data) => {
  console.log('Game event received:', data);
});
```