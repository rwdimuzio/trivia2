import { Component, Input, OnInit } from '@angular/core';
import { QUESTION_STATE } from 'src/app/classes/enum';
import { ApiService } from 'src/app/services/api.service';

/**
 * component to display and process a true/false type question
 */
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

  loaded = false;
  gameObject: any;
  @Input() public question: any;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.load();
  }

  async load() {
    this.gameObject = await this.api.getGame();
    this.loaded = true;
  }

  /**
   * Register a guess
   * @param the question 
   * @param the guest's selected answer 
   */
  guess(question, answer): void {
    if (question.answer != "") { return; }
    question.answer = answer;
    question.state = (question.answer === question.correct_answer) ? this.CORRECT : this.INCORRECT;
    if (question.state == this.CORRECT) {
      this.api.answerGood(question);
    } else {
      this.api.answerBad();
    }
  }

  /**
   * select the icon name depending on the state of the question
   * and how it is answered
   *  
   * @param question(and answer) 
   * @param selection to display true or false
   * @returns 
   */
  selectIcon(question, selection) {
    var result = "noicon";
    if (question.answer == "") {
      result = "noicon"; // no guesses yet
    } else {
      if (question.correct_answer == selection && question.answer == selection) {
        result = "happy";
      } else if (selection == question.answer) {
        result = "close";
      }
    }
    return result;
  }

}
