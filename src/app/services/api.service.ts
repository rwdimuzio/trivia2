import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { State } from '@angular-devkit/architect/src/progress-schema';
import { GAME_STATE, QUESTION_STATE } from '../classes/enum';
import { GamePlay } from '../classes/game-play';
import { Player } from '../classes/player';
import { StorageService } from './storage.service';


/*
  Data source:
  https://opentdb.com/
*/

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  game: GamePlay = null;
  gamePlayStateBehaviorSubject = new BehaviorSubject(GAME_STATE.NEW_GAME);

  constructor(public http: HttpClient, private storage:StorageService) {

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
    return this.storage.setValue("game", this.game);
  }
  async loadGame(): Promise<GamePlay> {
    return this.storage.getValue("game");
  }

  async newGame(): Promise<any> {
    this.game = new GamePlay();
    return this.saveGame();
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
