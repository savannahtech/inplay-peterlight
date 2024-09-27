import {SocketNotificationPort} from "../ports/socket_notification";
import LeaderboardItem from "../entities/leaderboard";
import Game from "../entities/game";
import GameEvent from "../entities/game_event";
import {WebsocketPayloadDataType} from "./data_types";

type NotifyTaskEventsParams = {
    notificationPort: SocketNotificationPort
}

export const notificationRoom = {
    leaderboardUpdate: () => "LEADERBOARD_UPDATE",
    gameUpdate: (id: string) => `GAME_UPDATE:${id}`,
    gameEventUpdate: (id: string) => `GAME_EVENT_UPDATE:${id}`
}

export class NotifyEvents {
    private notificationPort;

    constructor(params: NotifyTaskEventsParams) {
        this.notificationPort = params.notificationPort;
    }

    notifyLeaderBoardItem(leaderboardItem: LeaderboardItem) {
        this.notificationPort.notifyRoom(
            notificationRoom.leaderboardUpdate(),
            {
                type: WebsocketPayloadDataType.LEADERBOARD,
                data: leaderboardItem
            }
        )
    }

    notifyGameItem(game: Game) {
        this.notificationPort.notifyRoom(
            notificationRoom.gameUpdate(game._id as string),
            {
                type: WebsocketPayloadDataType.GAME,
                data: game
            }
        );
    }

    notifyGameEventItem(gameEvent: GameEvent) {
        this.notificationPort.notifyRoom(
            notificationRoom.gameEventUpdate(gameEvent.gameId as string),
            {
                type: WebsocketPayloadDataType.GAME_EVENT,
                data: gameEvent
            }
        );
    }
}
