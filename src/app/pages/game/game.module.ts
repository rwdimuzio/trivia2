import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
import { QuestionMultiChoiceComponent } from 'src/app/components/question-multi-choice/question-multi-choice.component';
import { QuestionSummaryComponent } from 'src/app/components/question-summary/question-summary.component';
import { QuestionTrueFalseComponent } from 'src/app/components/question-true-false/question-true-false.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule
  ],
  declarations: [GamePage,QuestionMultiChoiceComponent, QuestionTrueFalseComponent, QuestionSummaryComponent]
})
export class GamePageModule {}
