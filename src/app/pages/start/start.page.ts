import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GAME_STATE } from 'src/app/classes/enum';
import { GamePlay } from 'src/app/classes/game-play';
import { ApiService } from 'src/app/services/api.service';
/**
 * Start page - this is the first screen the user sees.  It prompts
 * the user to start or resume a game.  There are options for 
 * developers within the bug fab.
 */

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  game: GamePlay;
  constructor(private api: ApiService, private router:Router) { }

  ngOnInit() {
    this.loadGame();
  }

  /**
   * load game state from memory
   */
  async loadGame() {
    this.game = await this.api.getGame();
  }

  /**
   * change game state and begin collecting data for a new game
   */
  async gotoParametersPage(){
    await this.api.setGameState(GAME_STATE.PLAYERS);
    this.router.navigate(['/names']);
  }

  /**
   * reset the game to uninitialized and restart yourself
   */
  async newGame() { 
    await this.api.newGame();
    this.router.navigate(['/start'])
    .then(() => {
      window.location.reload();
    });
  }

  /**
   * reset current game to beginning
   */
  async restartGame() { 
    await this.api.restartGame();
    this.router.navigate(['/game']);
  }

  /**
   * 
   * @returns whether a game is in progress
   */
  canResume(){
    return this.game?.rounds.length>0;
  }

}
