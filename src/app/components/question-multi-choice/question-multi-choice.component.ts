import { Component, Input, OnInit } from '@angular/core';
import { QUESTION_STATE } from 'src/app/classes/enum';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-question-multi-choice',
  templateUrl: './question-multi-choice.component.html',
  styleUrls: ['./question-multi-choice.component.scss'],
})
export class QuestionMultiChoiceComponent implements OnInit {
  UNANSWERED = QUESTION_STATE.UNANSWERED;
  SELECTED = QUESTION_STATE.SELECTED;
  CORRECT = QUESTION_STATE.CORRECT;
  INCORRECT = QUESTION_STATE.INCORRECT;

  public gameObject: any;
  @Input() public question: any;
  loaded = false;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.load();
  }

  async load() {
    this.gameObject = await this.api.getGame();
    this.loaded = true;
  }


  guess(question, answer) {
    if (question.answer != "") { return; }
    question.answer = answer;
    question.state = (question.answer === question.correct_answer) ? this.CORRECT : this.INCORRECT;
    if (question.state == this.CORRECT) {
      this.api.answerGood(question);
    } else {
      this.api.answerBad();
    }
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

}
