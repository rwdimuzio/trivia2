import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CacheService } from "ionic-cache";
import { BehaviorSubject } from 'rxjs';
import { State } from '@angular-devkit/architect/src/progress-schema';

export enum QUESTION_STATE {
  UNANSWERED = 0,
  SELECTED = 1,
  CORRECT = 2,
  INCORRECT = 3
};
export enum GAME_STATE {
  NEW_GAME = 0,
  PLAYERS = 1,
  SELECTING = 2,
  ANSWERING = 3,
  ROUND_BREAK = 4,
  GAME_OVER = 5,
  GAME_ENDED = 6
};

export class Player {
  name: string = '';
  score: number = 0;
  correct: number = 0;
  incorrect: number = 0;
  constructor(name) {
    this.name = name;
    this.score = 0;
    this.correct = 0;
    this.incorrect = 0;
  }
}

export class GamePlay {

  numQuestions: string = "12";
  numRounds: string = "2";
  players: Array<Player> = new Array(
    new Player('Sallie'),
    new Player('Rich'),
    new Player(''),
    new Player(''),
  );
  categories: Array<any> = new Array();
  rounds: Array<any> = new Array();
  // game play
  gameState: GAME_STATE = GAME_STATE.NEW_GAME;
  currentRound: number = 0;
  playerIdx: number = 0;
  question: any = '';

  public nextPlayer() {
    this.playerIdx = ((this.playerIdx + 1) % this.players.length);
  }

  protected computePoints(question) {
    var result = 0;
    if (question.type == "boolean") {
      switch (question.difficulty) {
        case "hard":
          break;
      }

    } else {

    }
    return result;
  }
  public answerGood(question) {
    console.log("answerGood");
    this.players[this.playerIdx].score += this.computePoints(question);
    this.nextPlayer();
  }

  public answerBad() {
    console.log("answerBad");
    this.nextPlayer();
  }

  public currentPlayer() {
    return this.players[this.playerIdx];
  }

}


/*
  Consume api resources.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.

  https://opentdb.com/

*/

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public readonly categories = [{ "id": 9, "name": "General Knowledge" }, { "id": 10, "name": "Entertainment: Books" }, { "id": 11, "name": "Entertainment: Film" }, { "id": 12, "name": "Entertainment: Music" }, { "id": 13, "name": "Entertainment: Musicals & Theatres" }, { "id": 14, "name": "Entertainment: Television" }, { "id": 15, "name": "Entertainment: Video Games" }, { "id": 16, "name": "Entertainment: Board Games" }, { "id": 17, "name": "Science & Nature" }, { "id": 18, "name": "Science: Computers" }, { "id": 19, "name": "Science: Mathematics" }, { "id": 20, "name": "Mythology" }, { "id": 21, "name": "Sports" }, { "id": 22, "name": "Geography" }, { "id": 23, "name": "History" }, { "id": 24, "name": "Politics" }, { "id": 25, "name": "Art" }, { "id": 26, "name": "Celebrities" }, { "id": 27, "name": "Animals" }, { "id": 28, "name": "Vehicles" }, { "id": 29, "name": "Entertainment: Comics" }, { "id": 30, "name": "Science: Gadgets" }, { "id": 31, "name": "Entertainment: Japanese Anime & Manga" }, { "id": 32, "name": "Entertainment: Cartoon & Animations" }];

  game: GamePlay = null;
  gamePlayStateBehaviorSubject = new BehaviorSubject(GAME_STATE.NEW_GAME);

  token = "";

  GROUP_KEY = 'triviality-group';
  ttl = 60 * 15; // 15 miuntes  to live

  constructor(public http: HttpClient, private cache: CacheService) {

  }

  public getToken(): Promise<any> {
    return this.http.get('https://opentdb.com/api_token.php?command=request').toPromise()
      .then((result: any) => {
        var token = null;
        if (result.response_code === 0) {
          token = result.token;
        }
        return token;
      });
  }

  public resetToken(token): Promise<any> {
    return this.http.get('https://opentdb.com/api_token.php?command=reset&token=' + token).toPromise();
  }

  public getQuestions(token: string, num: number): Promise<any> {
    return this.http.get('https://opentdb.com/api.php?amount=' + num + '&token=' + token).toPromise();
  }

  public getOneQuestions(token: string, catId: number): Promise<any> {
    return this.http.get('https://opentdb.com/api.php?amount=1&category=' + catId + '&token=' + token).toPromise();
  }


  async getGame() {
    if (this.game == null) {
      try {
        var g = await this.loadGame();
        this.game = g;
        console.log("getGame load from memory", this.game);
      } catch (err) {
        console.log("getGame cache load failed");
        this.game = new GamePlay();
        console.log("getGame new game", this.game);
      }
    } else {
      console.log("getGame local object", this.game);
    }
    this.gamePlayStateBehaviorSubject.next(this.game.gameState);
    return this.game;
  }
  async saveGame() {
    return this.settingsProvider_setValue("game", this.game);
  }
  async loadGame(): Promise<GamePlay> {
    return this.settingsProvider_getValue("game");
  }

  async populateGame(playerlist: Array<String>, categories: Array<any>) {

    // player list
    while (this.game.players.length) this.game.players.pop();
    playerlist.forEach(name => {
      if (name != '') {
        this.game.players.push(new Player(name));
      }
    });

    // categories
    while (this.game.categories.length) this.game.categories.pop();
    categories.forEach(row => {
      this.game.categories.push(row);
    });



    var numRounds = Number.parseInt(this.game.numRounds);
    var numQuestions = Number.parseInt(this.game.numQuestions);

    // get token 
    var token = await this.getToken();
    var catList = [];
    categories.forEach(row => {
      catList.push(row);
    });


    // all questions for all rounds
    while (this.game.rounds.length) this.game.rounds.pop();

    for (var i = 0; i < numRounds; i++) {
      var round = new Array();
      for (var j = 0; j < numQuestions; j++) {
        var cat = catList.shift();
        catList.push(cat);
        var qs = await this.getOneQuestions(token, cat.id);
        console.log("Q--->",i,j,qs);
        if (qs.response_code === 0) {
          qs.results.forEach(element => {
            if (element.type === 'multiple') {
              element.qlist = this.mergeQandA(element.incorrect_answers, element.correct_answer);
            }
            element.state = QUESTION_STATE.UNANSWERED;
            element.answer = '';
            round.push(element);
          });
        } else {
          console.log("epic fail");
        }
      }
      this.game.rounds.push(round);
    }
    await this.restartGame(); // and save
  }
  async restartGame() {
    for (var i in this.game.rounds) {
      var round = this.game.rounds[i];
      round.forEach(q => {
        q.state = QUESTION_STATE.UNANSWERED;
        q.answer = '';
      })
    }
    this.game.question = '';
    this.game.players.forEach(r => { r.score = 0; r.correct = 0; r.incorrect = 0; });
    this.game.playerIdx = 0;
    this.game.currentRound = 0;
    await this.setGameState(GAME_STATE.SELECTING); // and save
  }

  mergeQandA(questions, answer) {
    var list = Array();
    for (var i in questions) {
      list.push(questions[i]);
    }
    list.push(answer);

    return list.sort(() => Math.random() - 0.5);
  }

  public currentPlayer() {
    return this.game.players[this.game.playerIdx];
  }

  async nextPlayer() {
    var nextState;
    // count remaining questions in round
    var numLeft = this.game.rounds[this.game.currentRound].filter(r => r.state == 0).length;
    console.log("Num Left: " + numLeft);
    if (numLeft <= 0) {
      if ((this.game.currentRound + 1) >= Number.parseInt(this.game.numRounds)) {
        nextState = GAME_STATE.GAME_OVER; // leave this out if you want to pause for a round break before the end
      } else {
        nextState = GAME_STATE.ROUND_BREAK;
      }
    } else {
      nextState = GAME_STATE.SELECTING;
    }
    this.game.playerIdx = ((this.game.playerIdx + 1) % this.game.players.length);
    await this.setGameState(nextState); // and save
  }

  async nextRound() {
    var nextState;
    if ((this.game.currentRound + 1) >= Number.parseInt(this.game.numRounds)) {
      nextState = GAME_STATE.GAME_OVER;
    } else {
      this.game.currentRound = this.game.currentRound + 1;
      this.game.playerIdx = 0;
      nextState = GAME_STATE.SELECTING;
    }
    await this.setGameState(nextState); // and save
  }

  protected computeScore(question) {
    var result = 0;
    if (question.type === 'boolean') {
      switch (question.difficulty) {
        case 'easy': result = 500; break;
        case 'medium': result = 1500; break;
        case 'hard': result = 3000; break;
      }
    } else {
      switch (question.difficulty) {
        case 'easy': result = 1000; break;
        case 'medium': result = 2000; break;
        case 'hard': result = 4000; break;
      }
    }
    return result;
  }

  async answerGood(question) {
    console.log("answerGood");
    this.game.players[this.game.playerIdx].score += this.computeScore(question);
    this.game.players[this.game.playerIdx].correct++;
    await this.nextPlayer(); // and save
  }

  async answerBad() {
    console.log("answerBad");
    this.game.players[this.game.playerIdx].incorrect++;
    this.nextPlayer(); // and save
  }

  async selectQuestion(question: any) {
    console.log("selectQuestion", this.game);
    this.game.question = question;
    await this.setGameState(GAME_STATE.ANSWERING); // and save
  }

  async setGameState(newState: GAME_STATE) {
    if (this.game.gameState! - newState) {
      console.log("setGameState to ", this.describeGameState(newState));
      this.gamePlayStateBehaviorSubject.next(newState);
      this.game.gameState = newState;
    }
    await this.saveGame();
  }
  async endGame() {
    this.setGameState(GAME_STATE.GAME_ENDED);
  }

  getHighScore(): number {
    var highScore = 0;
    this.game.players.forEach(p => { if (p.score > highScore) { highScore = p.score } });
    return highScore;
  }
  whoHasHighScore(): string {
    var highScore = this.getHighScore();
    var winner = '';
    this.game.players.forEach(p => { if (p.score >= highScore) winner += ', ' + p.name });

    return winner.substr(2);
  }





  // TODO consider moving this

  SETTINGS_KEY: string = "settings";
  SETTINGS_GROUP: string = "settings";
  SETTINGS_TTL = 10 * 365 * 24 * 60 * 60; // 10 year time to live

  async settingsProvider_setValue(key: string, value: any) {
    let jsonObj = JSON.stringify(value);
    //console.log("setValue: " + key + " ->" + jsonObj);
    return this.cache.saveItem(key, jsonObj, this.SETTINGS_GROUP, this.SETTINGS_TTL);
  }

  settingsProvider_getValue(key: string): Promise<any> {
    return this.cache.getItem(key).then(res => {
      //console.log('getValue',res);
      return JSON.parse(res);
    });
  }

  async clearSettings(): Promise<any> {
    this.game = new GamePlay();
    //while(this.game.rounds.length) this.game.rounds.pop();
    //this.game.playerIdx=0;
    //this.game.question='';
    return this.saveGame();
  }


  // -------------------------------------------------------------------
  //  helpers
  // -------------------------------------------------------------------
  describeGameState(state: GAME_STATE): string {
    switch (state) {
      case GAME_STATE.NEW_GAME: return "NEW-GAME";
      case GAME_STATE.PLAYERS: return "PLAYERS";
      case GAME_STATE.SELECTING: return "SELECTING";
      case GAME_STATE.ANSWERING: return "ANSWERING";
      case GAME_STATE.ROUND_BREAK: return "ROUND_BREAK";
      case GAME_STATE.GAME_OVER: return "GAME_OVER";
      case GAME_STATE.GAME_ENDED: return "GAME_ENDED";
      default:
        return "Unknown-" + State;
    };
  }

}
