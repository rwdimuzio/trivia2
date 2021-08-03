import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuestionTrueFalseComponent } from './question-true-false.component';

describe('QuestionTrueFalseComponent', () => {
  let component: QuestionTrueFalseComponent;
  let fixture: ComponentFixture<QuestionTrueFalseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionTrueFalseComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionTrueFalseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
