import { Component, OnInit } from '@angular/core';
import { ApiService, GamePlay } from 'src/app/services/api.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  game:GamePlay;
  constructor(private api:ApiService) { }

  ngOnInit() {
    this.loadGame();
  }
  async loadGame(){
    this.game = await this.api.getGame();
  }


}
