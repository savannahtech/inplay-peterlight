import {Socket} from "socket.io";

export interface SocketNotificationPort {
    notifyRoom(roomId: string, message: any): void;


    handleClientJoinRoom(socket: Socket, roomId: string): void;
}