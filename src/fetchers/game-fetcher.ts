
import {Fetcher, Outcome} from "./types";

import db from "../db";
import Game from "../db/models/game";

import client from "../api";
import normalize from "../api/normalize";
import {game} from "../api/schemas";
import {isNetworkError} from "../net/errors";

import {pathToId} from "../util/navigation";

export default class GameFetcher extends Fetcher {
  constructor () {
    super();
  }

  async work(): Promise<Outcome> {
    const path = this.store.getState().session.navigation.tabData[this.tabId].path;
    const gameId = +pathToId(path);

    const gameRepo = db.getRepo(Game);
    let localGame = await gameRepo.findOneById(gameId);
    let pushGame = (game: Game) => {
      if (!game) {
        return;
      }
      this.push({
        games: {
          [gameId]: game,
        },
      });
    };
    pushGame(localGame);

    const {credentials} = this.store.getState().session;
    if (!credentials) {
      throw new Error(`No user credentials yet`);
    }

    const {key} = credentials;
    const api = client.withKey(key);
    let normalized;
    try {
      this.debug(`Firing API requests...`);
      normalized = normalize(await api.game(gameId), {
        game: game,
      });
    } catch (e) {
      this.debug(`API error:`, e);
      if (isNetworkError(e)) {
        return new Outcome("retry");
      } else {
        throw e;
      }
    }

    this.debug(`normalized: `, normalized);
    pushGame(normalized.entities.games[normalized.result.gameId]);

    return new Outcome("success");
  }
}

