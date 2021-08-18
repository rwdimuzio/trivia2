import { Component, Input, OnInit } from '@angular/core';
import { Constants } from 'src/app/classes/constants';
import { GAME_STATE, QUESTION_STATE } from 'src/app/classes/enum';
import { ApiService } from 'src/app/services/api.service';
/**
 * Summarize for all the questions in the current round
 * and transmit the selection when the user picks (and is allowed to.)
 */

@Component({
  selector: 'app-question-summary',
  templateUrl: './question-summary.component.html',
  styleUrls: ['./question-summary.component.scss'],
})
export class QuestionSummaryComponent implements OnInit {
  UNANSWERED = QUESTION_STATE.UNANSWERED;
  SELECTED = QUESTION_STATE.SELECTED;
  CORRECT = QUESTION_STATE.CORRECT;
  INCORRECT = QUESTION_STATE.INCORRECT;

  public gameObject: any;
  @Input() public questions: any[];
  loaded = false;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loaded = true;
    this.load();
  }

  async load() {
    this.gameObject = await this.api.getGame();
    console.log("BEEP BEEP BOOP", this.gameObject);
    this.loaded = true;
  }

  /**
   * change opacity whether a question has been answered or not
   * @param question
   * @returns css class string
   */
  opaque(question): string {
    return (question.state == this.UNANSWERED) ? 'o100' : 'o50';
  }

  /**
   * 
   * @param question 
   * @returns a one or two char string
   */
  categoryCode(question) {
    return Constants.getCategoryType(question);
  }
  /**
   * User chooses a question and transmits the event
   * @param question 
   * @returns 
   */
  select(question) {
    // prevent dup selections 
    if (this.api.game.gameState != GAME_STATE.SELECTING) return;
    if (question.state != this.UNANSWERED) return;

    // if you get here, ok to select something
    console.log("selected", question);
    question.state = this.SELECTED;
    this.api.selectQuestion(question);
  }
}
