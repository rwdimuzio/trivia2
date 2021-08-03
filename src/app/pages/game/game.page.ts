import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

export class GameObject {
  question:any = '';
  playerIdx=0;
  players : Array<any> =  [
    {name:'Rich', score:0},
    {name:'Sallie', score:0}
  ];
  nextPlayer(){
    this.playerIdx = ((this.playerIdx+1) % this.players.length);
  } 
  answerGood(points){
    console.log("answerGood");
    this.players[this.playerIdx].score += points;
    this.nextPlayer();
  }
  answerBad(){
    console.log("answerBad");
    this.nextPlayer();
  }
  currentPlayer(){
    return this.players[this.playerIdx];
  }
}

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  UNANSWERED = 0;
  SELECTED = 1;
  CORRECT = 2;
  INCORRECT = 3;
  loading = false;

  noSources = false;
  gameObject : GameObject = new GameObject();
  questions: Array<any> = [];

  token = "";

  constructor(private alertController:AlertController, private router:Router, private webapiService:ApiService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {

    const parent = this;
    this.webapiService.getToken().subscribe(result => {
      console.log(result);
      if (result.response_code === 0) {
        this.token = result.token;
        this.doRefresh(null);
      }
    }, err => {
      console.log(err);
    });

    //this.webapiService.getSources().subscribe((res) => {
    //  console.log("IM BACK",res);
    //});
  }


  doRefresh(event) {
    this.loading = true;
    this.webapiService.getQuestions(this.token, 12).subscribe((res) => {
      this.loading = false;
      this.noSources = false;
      console.log(res);
      if (res.response_code === 0) {
        while (this.questions.length > 0) this.questions.pop();
        res.results.forEach(element => {
          if (element.type === 'multiple') {
            element.qlist = this.mergeQandA(element.incorrect_answers, element.correct_answer);
          }
          element.state = this.UNANSWERED;
          element.answer = '';
          console.log(element);
          this.questions.push(element);
        });
      } else {
        console.log("epic fail");
      }
    }, (err) => {
      console.log("doRefresh get questions fail", err);
      this.loading = false;
    },
      // complete
      () => {
        if (event && event.target) {
          event.target.complete();
        }
        console.log("refresh complete");
      });
  }

  mergeQandA(questions, answer) {
    var list = Array();
    for (var i in questions) {
      list.push(questions[i]);
    }
    list.push(answer);

    return list.sort(() => Math.random() - 0.5);
  }

  guess(question, answer) {
    if (question.answer != "") { return; }
    question.answer = answer;
    question.state = (question.answer === question.correct_answer) ? this.CORRECT : this.INCORRECT;

  }

  selectQuestionIcon(question, answer) {
    var result = "noicon";
    if (question.answer == "") {
      result = "noicon"; // no guesses yet
    } else {
      if (question.correct_answer == answer && question.answer == answer) {
        result = "happy";
      } else if (question.correct_answer == answer) {
        result = "star";
      } else if (answer == question.answer) {
        result = "sad";
      }
    }
    return result;
  }

  guessTrueFalse(question, answer) {
    if (question.answer != "") { return; }
    question.answer = answer;
    question.state = (question.answer === question.correct_answer) ? this.CORRECT : this.INCORRECT;

  }

  selectTrueFalseIcon(question, answer) {
    var result = "noicon";
    if (question.answer == "") {
      result = "noicon"; // no guesses yet
    } else {
      if (question.correct_answer == answer && question.answer == answer) {
        result = "happy";
      } else if (answer == question.answer) {
        result = "sad";
      }
    }
    return result;
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
