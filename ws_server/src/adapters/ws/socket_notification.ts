import {Server, Socket} from "socket.io";
import {SocketNotificationPort} from "../../core/ports/socket_notification";

type SocketIoNotificationAdapterParams = {
    io: Server
}

export class SocketIoNotificationAdapter implements SocketNotificationPort {
    private io: Server;

    constructor(params: SocketIoNotificationAdapterParams) {
        this.io = params.io;
    }

    notifyRoom(roomId: string, message: any): void {
        this.io.to(roomId).emit('notification', message);
    }

    handleClientJoinRoom(socket: Socket, roomId: string) {
        socket.join(roomId);
    }
}
