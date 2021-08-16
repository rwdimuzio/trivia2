import { Component, Input, OnInit } from '@angular/core';
import { GAME_STATE, QUESTION_STATE } from 'src/app/classes/enum';
import { ApiService} from 'src/app/services/api.service';

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
  readonly colors = {
    "G": "#90B2E5",
    "E": "#F974A9",
    "H": "#F3FD77",
    "AL": "#B99378",
    "SN": "#8CC37D",
    "SL": "#F6826E",
  };
  readonly edgeColors = {
    "G": "#83A0D1",
    "E": "#DD6897",
    "H": "#C2C95C",
    "AL": "#896C5C",
    "SN": "#688E5B",
    "SL": "#B56053",
  };

  readonly categoryList = {
    "General Knowledge": "E"
    , "Entertainment: Books": "AL"
    , "Entertainment: Film": "E"
    , "Entertainment: Music": "E"
    , "Entertainment: Musicals & Theatres": "E"
    , "Entertainment: Television": "E"
    , "Entertainment: Video Games": "E"
    , "Entertainment: Board Games": "E"
    , "Science & Nature": "SN"
    , "Science: Computers": "SN"
    , "Science: Mathematics": "SN"
    , "Mythology": "AL"
    , "Sports": "SL"
    , "Geography": "G"
    , "History": "H"
    , "Politics": "H"
    , "Art": "AL"
    , "Celebrities": "E"
    , "Animals": "SN"
    , "Vehicles": "SL"
    , "Entertainment: Comics": "E"
    , "Science: Gadgets": "SN"
    , "Entertainment: Japanese Anime & Manga": "AL"
    , "Entertainment: Cartoon & Animations": "AL"
  };
  loaded = false;

  constructor(private api: ApiService) { }

  ngOnInit() { 
    this.loaded = true;
    this.load();
  }

  async load(){
    this.gameObject = await this.api.getGame();
    console.log("BEEP BEEP BOOP",this.gameObject);
    this.loaded = true;
  }

  edgeColor(descr) {
    return this.edgeColors[this.catCat(descr)];
  }

  opaque(question) {
    return (question.state == this.UNANSWERED) ? 'o100' : 'o50';
  }

  catColor(descr) {
    return this.colors[this.catCat(descr)];
  }

  catCat(question) {
    return this.categoryList[question.category];
  }

  select(question) {
    if (this.api.game.gameState != GAME_STATE.SELECTING) return;
    if (question.state != this.UNANSWERED) return;
    console.log("selected", question);
    question.state = this.SELECTED;
    this.api.selectQuestion(question);
  }
}
