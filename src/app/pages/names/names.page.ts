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
  constructor(private router:Router, private api:ApiService) { }

  ngOnInit() {
    this.loadGame();
  }
  async loadGame(){
    this.game = await this.api.getGame();
  }

  async next(){
    this.loading = true;
    await this.api.populateGame();
    this.router.navigate(['/game']);
  }

}
