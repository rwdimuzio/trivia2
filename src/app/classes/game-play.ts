import { GAME_STATE } from "./enum";
import { Player } from "./player";

export class GamePlay {
    // Settings
    // --------
    numQuestions: string = "12"; // why string = for drop down lists
    numRounds: string = "2";
  
    // the players
    players: Array<Player> = new Array(
      new Player(''),
      new Player(''),
      new Player(''),
      new Player(''),
    );
  
    // the categories of things they want to see
    categories: Array<any> = new Array();
   
    // Current game
    // ------------
  
    // the raw presentation data
    rounds: Array<any> = new Array();
  
    // Current game 
    // -------------
    gameState: GAME_STATE = GAME_STATE.NEW_GAME;
    currentRound: number = 0;
    playerIdx: number = 0;
    question: any = '';
  }
  