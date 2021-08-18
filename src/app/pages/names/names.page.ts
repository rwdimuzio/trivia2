import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from 'src/app/classes/constants';
import { GamePlay } from 'src/app/classes/game-play';
import { ApiService } from 'src/app/services/api.service';

/**
 * Present the user with a group of options related to the game they are about to play
 */
@Component({
  selector: 'app-names',
  templateUrl: './names.page.html',
  styleUrls: ['./names.page.scss'],
})
export class NamesPage implements OnInit {
  loading = false;
  game: GamePlay;
  categories = [];
  selected = [];
  players: Array<string> = ['', '', '', ''];
  constructor(private router: Router, private api: ApiService) { }

  ngOnInit() {
    this.loadGame();
  }

  /**
   *  load game parameters and apply to local structure
   */
  async loadGame() {
    this.game = await this.api.getGame();

    // players
    for (var i in this.game.players) {
      this.players[i] = this.game.players[i].name;
    }
    // category list
    while (this.categories.length) { this.categories.pop(); }
    Constants.categories.forEach(r => { console.log(r); this.categories.push(r) });

    // selected category items
    while (this.selected.length) { this.selected.pop(); }
    this.api.game.categories.forEach(r => { this.selected.push(r) });
  }

  /**
   *  build the game and go to the main play page
   */
  async next() {
    this.loading = true;
    await this.api.populateGame(this.players, this.selected);
    this.router.navigate(['/game']);
  }

  /**
   * 
   * @returns true=can go to next page
   */
  canContinue(): boolean {
    return (
      this.players[0].trim() +
      this.players[1].trim() +
      this.players[2].trim() +
      this.players[3].trim()
    ) != '' && this.selected.length > 0;
  }

  /**
   * add or remove the item from the list of categories the game will use
   * @param item 
   */
  toggleCat(item) {
    console.log("toggleCat");
    console.log(item);
    //this.apiInterfaceProvider.toggleSource(item);
    var x = this.selected.filter(row => row.id == item.id);
    if (x.length == 1) {
      var newlist = this.selected.filter(row => row.id != item.id); // remove it
      this.selected = newlist;
    } else {
      this.selected.push(item);
    }
  }

  /**
   * 
   * @param item 
   * @returns whether the item is in the filter list or not
   */
  isSelected(item) {
    var x = this.selected.filter(row => row.id == item.id);
    return x.length >= 1;
  }

}
