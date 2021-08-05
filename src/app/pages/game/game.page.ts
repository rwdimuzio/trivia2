import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService, GAME_STATE, QUESTION_STATE } from 'src/app/services/api.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  UNANSWERED = QUESTION_STATE.UNANSWERED;
  SELECTED = QUESTION_STATE.SELECTED;
  CORRECT = QUESTION_STATE.SELECTED;
  INCORRECT = QUESTION_STATE.INCORRECT;

  loading = false;
  loaded=false;
  noSources = false;
  gameObject:any=null;
  questions: Array<any> = [];
  gamePlayStateSubscription:any=null;
  token = "";

  constructor(private alertController:AlertController, private router:Router, private api:ApiService) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {

    this.gameObject = await this.api.getGame();
    this.questions = this.gameObject.rounds[this.gameObject.currentRound];
    this.loaded=true;
    this.api.gamePlayStateBehaviorSubject.subscribe({
      next: (state) => {
        console.log("Observed",state, this.api.describeGameState(state));
        this.handleStateChange(state);
      }
    })
  }

  ionViewWillLeave(){
    if(this.gamePlayStateSubscription!=null){
      this.gamePlayStateSubscription.unsubscribe();
      this.gamePlayStateSubscription=null;
    }
  }
  async handleStateChange(state){
    console.log("handle State Change: "+state+"  "+this.api.describeGameState(state));
    switch(state){
      case GAME_STATE.NEW_GAME: 
        this.router.navigate(['/start']);
        break;
        case GAME_STATE.PLAYERS: 
        this.router.navigate(['/names']);
        break;
        case GAME_STATE.ROUND_BREAK: 
          this.levelPause();
        break;
        case GAME_STATE.GAME_OVER: 
          this.endGame();
        break;
    }

  }

  loadNextRound(){

  }
  loadRound(){

  }

  async levelPause(){
    var message="Summary blah blah blah";
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Level Break',
      subHeader: '',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    await this.api.nextRound();
  }

  async endGame(){
    var message="You won!";
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'GameOver',
      subHeader: '',
      message: message,
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    this.router.navigate(['/start']);

  }
}
