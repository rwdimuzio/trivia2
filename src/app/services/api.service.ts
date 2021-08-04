import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { CacheService } from "ionic-cache";

export class GamePlay {
  numQuestions: string = "12";
  numRounds: string = "2";
  players: Array<any> = [
    { name: 'Rich', score: 0 },
    { name: 'Sallie', score: 0 },
    { name: '', score: 0 },
    { name: '', score: 0 }
  ];
  rounds: Array<any> = new Array();
  // game play
  currentRound: number = 0;
  playerIdx: number = 0;
  question: any = '';

  nextPlayer() {
    this.playerIdx = ((this.playerIdx + 1) % this.players.length);
  } 
  answerGood(points){
    console.log("answerGood");
    this.players[this.playerIdx].score += points;
    this.nextPlayer();
  }
  answerBad(){
    console.log("answerBad");
    this.nextPlayer();
  }
  currentPlayer(){
    return this.players[this.playerIdx];
  }

}
export enum QUESTION_STATE {
  UNANSWERED = 0,
  SELECTED = 1,
  CORRECT = 2,
  INCORRECT = 3
};


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
  // A global place to tell all the programs how to open external pages
  public browserOptions: InAppBrowserOptions = {
    location: 'yes',//Or 'no' 
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only ,shows browser zoom controls 
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only 
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only 
    toolbar: 'yes', //iOS only 
    enableViewportScale: 'no', //iOS only 
    allowInlineMediaPlayback: 'no',//iOS only 
    presentationstyle: 'pagesheet',//iOS only 
    fullscreen: 'yes',//Windows only    
  };
  game: GamePlay = null;

  sources = [];
  retired = [];
  filteredSoources = [];

  token = "";

  //  https://opentdb.com/api_token.php?command=request

  GROUP_KEY = 'triviality-group';
  ttl = 60 * 15; // 15 miuntes  to live
  apiUrl: String = "https://newsapi.org";
  apiKey: String = "891936083b324696939b66d8afa0b3fc";
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


  async getGame() {
    if (this.game == null) {
      try {
        var g = await this.loadGame();
        this.game = g;
      } catch (err) {
        console.log("getGame cache load failed");
        this.game = new GamePlay();
        console.log("getGame new game", this.game);
      }
    } else {
      console.log("getGame local object", this.game);
    }
    return this.game;
  }
  async saveGame() {
    return this.settingsProvider_setValue("game", this.game);
  }
  async loadGame(): Promise<GamePlay> {
    return this.settingsProvider_getValue("game");
  }

  async populateGame() {
    var numRounds = Number.parseInt(this.game.numRounds);
    var numQuestions = Number.parseInt(this.game.numQuestions);
    // get token 
    var token = await this.getToken();
    console.log("Yer token", token);
    while (this.game.rounds, length) this.game.rounds.pop();

    for (var i = 0; i < numRounds; i++) {
      var round = new Array();
      var qs = await this.getQuestions(token, numQuestions);
      if (qs.response_code === 0) {
        qs.results.forEach(element => {
          if (element.type === 'multiple') {
            element.qlist = this.mergeQandA(element.incorrect_answers, element.correct_answer);
          }
          element.state = QUESTION_STATE.UNANSWERED;
          element.answer = '';
          console.log(element);
          round.push(element);
        });
        this.game.rounds.push(round);
      } else {
        console.log("epic fail");
      }
    }
    this.game.players[0].score=0;
    this.game.players[1].score=0;
    this.game.players[2].score=0;
    this.game.players[3].score=0;
    await this.saveGame();
  }

  mergeQandA(questions, answer) {
    var list = Array();
    for (var i in questions) {
      list.push(questions[i]);
    }
    list.push(answer);

    return list.sort(() => Math.random() - 0.5);
  }


  // TODO consider moving this

  SETTINGS_KEY: string = "settings";
  SETTINGS_GROUP: string = "settings";
  SETTINGS_TTL = 10 * 365 * 24 * 60 * 60; // 10 year time to live

  async settingsProvider_setValue(key: string, value: any) {
    let jsonObj = JSON.stringify(value);
    console.log("setValue: " + key + " ->" + jsonObj);
    return this.cache.saveItem(key, jsonObj, this.SETTINGS_GROUP, this.SETTINGS_TTL);
  }

  settingsProvider_getValue(key: string): Promise<any> {
    return this.cache.getItem(key).then(res => {
      console.log('getValue');
      console.log(res);
      return JSON.parse(res);
    });
  }

  clearSettings(): Promise<any> {
    return this.cache.clearGroup(this.SETTINGS_GROUP);
  }


  // -------------------------------------------------------------------
  //  helpers
  // -------------------------------------------------------------------

}
