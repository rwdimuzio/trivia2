import { Component, Input, OnInit } from '@angular/core';
import { QUESTION_STATE } from 'src/app/classes/enum';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-question-true-false',
  templateUrl: './question-true-false.component.html',
  styleUrls: ['./question-true-false.component.scss'],
})
export class QuestionTrueFalseComponent implements OnInit {
  UNANSWERED = QUESTION_STATE.UNANSWERED;
  SELECTED = QUESTION_STATE.SELECTED;
  CORRECT = QUESTION_STATE.CORRECT;
  INCORRECT = QUESTION_STATE.INCORRECT;

  loaded=false;
  gameObject:any;
  @Input() public question:any;

  constructor(private api:ApiService) { }

  ngOnInit() {
    this.load();
  }
  async load() {

    this.gameObject = await this.api.getGame();
    this.loaded=true;
  }

  guessTrueFalse(question,answer){
    if(question.answer!=""){return; }
    question.answer=answer;
    question.state=(question.answer===question.correct_answer)?this.CORRECT:this.INCORRECT;
    if(question.state==this.CORRECT){
        this.api.answerGood(question);
    } else {
        this.api.answerBad();
    }
  }

  selectTrueFalseIcon(question,answer){
    var result="noicon";
    if(question.answer==""){
      result="noicon"; // no guesses yet
    } else {
      if(question.correct_answer == answer && question.answer == answer){
          result="happy";
      } else if(answer==question.answer){
        result="close";
      }
    }
    return result;
  }

}
