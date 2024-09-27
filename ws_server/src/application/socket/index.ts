import {Server as SocketIOServer} from 'socket.io';

const createAppSocketServer = (server: any) => {
    return new SocketIOServer(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });
};

export default createAppSocketServer;
