import {Job} from "bull";
import {Question} from "../../server/Question";
import {getPlayers} from "../../server/Player";
import axios from "axios";
import {RedisGet, RedisGetJSON, RedisSave, RedisSaveJSON} from "./redis";

const REDIS_HOST = process.env.REDIS_HOST;

const Queue = require('bull');


export const StartGameQueue = async () => {
    const GameQueue = new Queue("send-question", process.env.REDIS_HOST);
    await GameQueue.add('send-question-task', {}, {repeat: {every: 5000}}).then(() => console.log("Send question task added")).catch(err => console.error())
    await GameQueue.add('update-round-task', {}, {repeat: {every: 60000}}).then(() => console.log("Update round task added")).catch(err => console.error())
    GameQueue.process('send-question-task', (job: Job) => SendQuestion()).catch((e) => console.log(`Something went wrong: ${e}`));
    GameQueue.process('update-round-task', (job: Job) => UpdateRound()).catch((e) => console.log(`Something went wrong: ${e}`));
    console.log("Setting new round");
    await RedisSave("current-round", `1`)
}

export const PauseGame = async () => {
    const GameQueue = new Queue("send-question", REDIS_HOST);
    await GameQueue.obliterate({force: true})
    await RedisSave("current-round", `0`);
    await RedisSaveJSON("players", {});
}

const UpdateRound = async () => {
    console.log("Updating the current round");
    const currentRound = await RedisGet("current-round").then(x => parseInt(x ?? '0'));
    const newRound = currentRound + 1;
    await RedisSave("current-round", `${newRound}`)
}

const SendQuestion = async () => {
    const currentRound = await RedisGet("current-round").then(x => parseInt(x ?? '0'));
    const question = Question.questionForRound(currentRound);
    const players = await getPlayers();
    console.log("Sending a question to players", {currentRound, question, players: players.length})
    const updatedPlayers = await Promise.all(players.map(player => axios.get(`${player.host}/api/answer`, {
        timeout: 3000,
        params: {q: question.question}
    }).then(data => data.data).then(result => {
        console.log({player: player.name, expected: question.answer, got: result})
        if (`${result}` === question.answer) {
            player.score += 5;
        } else {
            player.score -= 1;
        }
        return player;
    }).catch(() => {
        player.score -= 10;
        return player;
    })));
    const playerState = updatedPlayers.reduce((players, player) => {
        players[player.name] = player;
        return players;
    }, {});
    await RedisSaveJSON("players", playerState);
    RedisGetJSON("players:scores").then((score) => {
        const newScore = score ?? [];
        newScore.push({
            date: Date.now(),
            players: playerState
        });
        RedisSaveJSON("players:scores", newScore).catch(err => console.error(err));
    })
    RedisSaveJSON(`players:scores:${Date.now()}`, playerState).catch(err => console.error(err));
}
