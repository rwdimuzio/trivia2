import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuestionMultiChoiceComponent } from './question-multi-choice.component';

describe('QuestionMultiChoiceComponent', () => {
  let component: QuestionMultiChoiceComponent;
  let fixture: ComponentFixture<QuestionMultiChoiceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionMultiChoiceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionMultiChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
