import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService, QUESTION_STATE } from 'src/app/services/api.service';


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

  noSources = false;
  gameObject:any=null;
  questions: Array<any> = [];

  token = "";

  constructor(private alertController:AlertController, private router:Router, private api:ApiService) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {

    this.gameObject = await this.api.getGame();
    this.questions = this.gameObject.rounds[0];
  }

  loadNextRound(){

  }
  loadRound(){

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
