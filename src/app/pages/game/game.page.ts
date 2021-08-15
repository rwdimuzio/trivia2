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

  showsummary = false;
  loading = false;
  loaded = false;
  noSources = false;
  gameObject: any = null;
  questions: Array<any> = [];
  gamePlayStateSubscription: any = null;
  token = "";
  gameOver = false;
  constructor(private alertController: AlertController, private router: Router, private api: ApiService) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {

    this.gameObject = await this.api.getGame();
    this.questions = this.gameObject.rounds[this.gameObject.currentRound];
    this.loaded = true;
    console.log("Observing");
    this.gamePlayStateSubscription = this.api.gamePlayStateBehaviorSubject.subscribe({
      next: (state) => {
        console.log("Observed", state, this.api.describeGameState(state));
        this.handleStateChange(state);
      }
    })
  }

  ionViewWillLeave() {
    if (this.gamePlayStateSubscription != null) {
      console.log("Remove obserer");
      this.gamePlayStateSubscription.unsubscribe();
      this.gamePlayStateSubscription = null;
    }
  }
  async handleStateChange(state) {
    this.questions = this.gameObject.rounds[this.gameObject.currentRound];

    console.log("handle State Change: " + state + "  " + this.api.describeGameState(state));
    switch (state) {
      case GAME_STATE.NEW_GAME:
        this.router.navigate(['/start']);
        break;
      case GAME_STATE.PLAYERS:
        this.gameOver = false;
        this.router.navigate(['/start']);
        break;
      case GAME_STATE.ROUND_BREAK:
        this.gameOver = false;
        this.levelPause();
        break;
      case GAME_STATE.GAME_OVER:
        this.gameOver = true;
        this.endGame();
        break;
      case GAME_STATE.GAME_ENDED:
        this.gameOver = true;
        break;

    }

  }

  loadNextRound() {

  }
  loadRound() {

  }

  async levelPause() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Level Break',
      subHeader: 'Leader: ' + this.api.whoHasHighScore(),
      message: 'Score: ' + this.api.getHighScore(),
      buttons: ['OK']
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    await this.api.nextRound();
  }

  async endGame() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'GameOver',
      subHeader: 'Winner: ' + this.api.whoHasHighScore(),
      message: 'Score: ' + this.api.getHighScore(),
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    await this.api.endGame();

    console.log('onDidDismiss resolved with role', role);
    //this.router.navigate(['/start']);

  }
  exitGame() {
    this.router.navigate(['/start']);
  }

  currentPlayer() {
    var result = "";
    switch (this.gameObject.gameState) {
      case GAME_STATE.GAME_ENDED:
      case GAME_STATE.GAME_OVER:
        result = "Winner: " + this.api.whoHasHighScore();
        break;

      default:
        result = this.api.currentPlayer().name;
    }
    return result;

  }
  gameState(): string {
    var result = "";
    switch (this.gameObject.gameState) {
      //case GAME_STATE.NEW_GAME:
      //case GAME_STATE.PLAYERS:
      case GAME_STATE.SELECTING:
        result = "Choose question";
        break;
      case GAME_STATE.ANSWERING:
        result = "Select answer";
        break;
      case GAME_STATE.ROUND_BREAK:
        result = "";
        break;
      case GAME_STATE.GAME_ENDED:
      case GAME_STATE.GAME_OVER:
        result = "Score: " + this.api.getHighScore();
        break;
      default:
        result = "[" + this.gameObject.gameState + "] Game what? ";
    }

    return result;
  }

  toggleSummary() {
    this.showsummary = this.showsummary ? false : true
  }

  computeScorePct(player) {
    var result = '0%'
    if (player.correct + player.incorrect != 0) {
      result = '' + Math.round(player.correct * 100 / (player.correct + player.incorrect)) + '%';
    }
    return result;
  }
}
