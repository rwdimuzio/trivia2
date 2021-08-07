import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, GamePlay } from 'src/app/services/api.service';

@Component({
  selector: 'app-names',
  templateUrl: './names.page.html',
  styleUrls: ['./names.page.scss'],
})
export class NamesPage implements OnInit {
  loading=false;
  game:GamePlay;
  players:Array<string>=['','','',''];
  constructor(private router:Router, private api:ApiService) { }

  ngOnInit() {
    this.loadGame();
  }
  async loadGame(){
    this.game = await this.api.getGame();
    console.log(this.game.players);
    for(var i in this.game.players){
      console.log("["+i+"] +"+this.game.players[i].name);
      this.players[i]=this.game.players[i].name;
    }
  }

  async next(){
    this.loading = true;
    await this.api.populateGame(['billy','bubba', 'pete']);
    this.router.navigate(['/game']);
  }

}
