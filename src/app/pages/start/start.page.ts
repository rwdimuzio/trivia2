import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GAME_STATE } from 'src/app/classes/enum';
import { GamePlay } from 'src/app/classes/game-play';
import { ApiService } from 'src/app/services/api.service';

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
  async loadGame() {
    this.game = await this.api.getGame();
  }
  async goName(){
    await this.api.setGameState(GAME_STATE.PLAYERS);
    this.router.navigate(['/names']);
  }

  async resetIt() { 
    await this.api.newGame();
    this.router.navigate(['/start'])
    .then(() => {
      window.location.reload();
    });
  }
  async restartIt() { 
    await this.api.restartGame();
    this.router.navigate(['/game']);
  }
  canResume(){
    return this.game?.rounds.length>0;
  }

}
