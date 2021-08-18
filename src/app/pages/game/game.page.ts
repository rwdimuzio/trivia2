import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { QUESTION_STATE, GAME_STATE } from 'src/app/classes/enum';
import { ApiService } from 'src/app/services/api.service';

/**
 * Main game play happens here.
 * 
 */

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

  showsummary = false; // toggle for game div or playere score summary div
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

  /**
   * 
   */
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

  /**
   * 
   */
  ionViewWillLeave() {
    if (this.gamePlayStateSubscription != null) {
      console.log("Remove obserer");
      this.gamePlayStateSubscription.unsubscribe();
      this.gamePlayStateSubscription = null;
    }
  }

  /**
   * observed a game state change present user with options depending on what it is 
   * @param state 
   */
  async handleStateChange(state) {
    this.questions = this.gameObject.rounds[this.gameObject.currentRound];

    console.log("handle State Change: " + state + "  " + this.api.describeGameState(state));
    switch (state) {
      case GAME_STATE.NEW_GAME:
        this.router.navigate(['/start']); // you don't belong here
        break;
      case GAME_STATE.PLAYERS:
        this.gameOver = false;
        this.router.navigate(['/start']); // you don't belong here
        break;
      case GAME_STATE.ROUND_BREAK:
        this.gameOver = false;
        this.levelPauseDialog(); // 
        break;
      case GAME_STATE.GAME_OVER:
        this.gameOver = true;
        this.gameOverDialog();
        break;
      case GAME_STATE.GAME_ENDED:
        this.gameOver = true;
        break;
    }

  }

  /**
   *  event:  between level break 
   *  present a dialog with high score summarized
   */
  async levelPauseDialog() {
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

  /**
   *  event: game over
   *  present user with summary of  
   */
  async gameOverDialog() {
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

  /**
   * time to leave
   */
  exitGame() {
    this.router.navigate(['/start']);
  }


  /**
   * shows the current player name or the winner
   * @returns string 
   */
  playerPrompt() {
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
  /**
   * shows what the game expects the player to do next, 
   * or a score summary when game is over
   * @returns string
   */
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

  /**
   * Toggle betweeen the summary div and main play div 
   */
  toggleSummary() {
    this.showsummary = this.showsummary ? false : true
  }

  /**
   * summarize percent answered correctly by the play
   * @param player 
   * @returns percent
   */
  computeScorePct(player) {
    var result = '0%'
    if (player.correct + player.incorrect != 0) {
      result = '' + Math.round(player.correct * 100 / (player.correct + player.incorrect)) + '%';
    }
    return result;
  }
}
