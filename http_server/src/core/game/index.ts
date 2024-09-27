import {faker} from '@faker-js/faker';
import GameEvent from "./event";
import {DateTimeHelpers} from "../../ports/helpers/commons/date_time";
import {GameEventTeamEnum, GameEventTypeEnum} from "./event/enums";
import Bet from "../bet";
import {BetPickEnum} from "../bet/enums";


export type GameParams = {
    _id?: string;
    homeTeam: string;
    awayTeam: string;
    defaultOddsHomeWin: number;
    defaultOddsAwayWin: number;
    defaultOddsDraw: number;
    isOngoing: boolean;
    startedAt?: Date;
};


export default class Game {
    public _id;
    public homeTeam;
    public awayTeam;
    public isOngoing;
    public startedAt;
    public defaultOddsHomeWin;
    public defaultOddsAwayWin;
    public defaultOddsDraw;

    constructor(params: GameParams) {
        this._id = params._id
        this.homeTeam = params.homeTeam
        this.awayTeam = params.awayTeam
        this.isOngoing = params.isOngoing
        this.startedAt = params.startedAt
        this.defaultOddsHomeWin = params.defaultOddsHomeWin
        this.defaultOddsAwayWin = params.defaultOddsAwayWin
        this.defaultOddsDraw = params.defaultOddsDraw
    }


    static mock(data ?: Partial<GameParams>): Partial<GameParams> {
        return {
            homeTeam: faker.lorem.words(1),
            awayTeam: faker.lorem.words(1),
            defaultOddsHomeWin: faker.number.float({min: 0.5, max: 2.5, fractionDigits: 1}),
            defaultOddsAwayWin: faker.number.float({min: 0.5, max: 2.5, fractionDigits: 1}),
            defaultOddsDraw: faker.number.float({min: 0.5, max: 2.5, fractionDigits: 1}),
            ...(data || {})
        }
    }

    get cache_set_key_events(): string {
        return `G:${this._id}:EVENTS`
    }

    get cache_set_key_betting_histories(): string {
        return `G:${this._id}:BETS`
    }

    get id() {
        return this._id
    }

    generate_new_event(data?: any) {
        const timeElapsed = Math.floor(DateTimeHelpers.computeSecondsBetweenStartEndTime(this.startedAt as Date) / 60)
        return GameEvent.mock({
            minute: timeElapsed,
            gameId: this._id,
            ...(data || {})
        })
    }

    get_updated_live_odds(events: GameEvent[], betHistories: Bet[], oddsHomeWin: number, oddsAwayWin: number, oddsDraw: number) {
        let homeScore: number = 0
        let awayScore: number = 0
        events.forEach((event) => {
            if (event.type === GameEventTypeEnum.GOAL) {
                if (event.team === GameEventTeamEnum.HOME) {
                    homeScore++
                } else if (event.team === GameEventTeamEnum.AWAY) {
                    awayScore++
                }
            }
        });
        const timeElapsed = DateTimeHelpers.computeSecondsBetweenStartEndTime(this.startedAt as Date) / 60
        // Adjust odds based on score
        if (homeScore > awayScore) {
            // Home team is winning, lower home odds and increase away odds
            oddsHomeWin *= 0.8;
            oddsAwayWin *= 1.2;
        } else if (awayScore > homeScore) {
            // Away team is winning, lower away odds and increase home odds
            oddsAwayWin *= 0.8;
            oddsHomeWin *= 1.2;
        } else {
            // Draw, adjust odds based on time elapsed
            if (timeElapsed > 60) {
                // Late in the game and still a draw, increase odds for a draw
                oddsDraw *= 0.9;
                oddsHomeWin *= 1.1;
                oddsAwayWin *= 1.1;
            } else {
                // Early in the game, odds are more balanced
                oddsDraw *= 1.05;
                oddsHomeWin *= 1.05;
                oddsAwayWin *= 1.05;
            }
        }

        // Adjust odds based on significant events
        events.forEach((event) => {
            if (event.type === GameEventTypeEnum.GOAL) {
                if (event.team === GameEventTeamEnum.HOME) {
                    // Home team scores, decrease home odds, increase away odds
                    oddsHomeWin *= 0.85;
                    oddsAwayWin *= 1.15;
                } else if (event.team === GameEventTeamEnum.AWAY) {
                    // Away team scores, decrease away odds, increase home odds
                    oddsAwayWin *= 0.85;
                    oddsHomeWin *= 1.15;
                }
            }
            if (event.type === GameEventTypeEnum.YELLOW_CARD || GameEventTypeEnum.RED_CARD) {
                // Slight adjustment for yellow/red card events
                if (event.team === GameEventTeamEnum.HOME) {
                    oddsHomeWin *= 1.1;
                } else if (event.team === GameEventTeamEnum.AWAY) {
                    oddsAwayWin *= 1.1;
                }
            }
        });

        // Ensure odds remain within a reasonable range
        oddsHomeWin = Math.max(1.01, oddsHomeWin);
        oddsAwayWin = Math.max(1.01, oddsAwayWin);
        oddsDraw = Math.max(1.01, oddsDraw);


        // Adjust odds based on betting patterns
        const betAggregate = {
            home: 0,
            away: 0
        }
        betHistories.forEach((bet) => {
            if (bet.betPick != BetPickEnum.DRAW) {
                betAggregate[bet.betPick] += bet.amount
            }
        });
        // If there's a heavy bet on one team, adjust odds slightly
        if (betAggregate.home > betAggregate.away) {
            oddsHomeWin *= 0.95;
            oddsAwayWin *= 1.05;
        } else if (betAggregate.away > betAggregate.home) {
            oddsHomeWin *= 1.05;
            oddsAwayWin *= 0.95;
        }
        return {
            oddsHomeWin,
            oddsAwayWin,
            oddsDraw
        }

    }
}
