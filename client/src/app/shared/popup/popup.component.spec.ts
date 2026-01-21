import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PopupComponent } from './popup.component'
import { PopupService } from './popup.service'
import { of } from 'rxjs'

describe('PopupComponent', () => {
  let component: PopupComponent
  let fixture: ComponentFixture<PopupComponent>
  let popupServiceMocK: Partial<PopupService>

  beforeEach(async () => {
    popupServiceMocK = {
      popup$: of({ message: 'Test', duration: 5000 }),
    }

    await TestBed.configureTestingModule({
      imports: [PopupComponent],
      providers: [{ provide: PopupService, useValue: popupServiceMocK }],
    }).compileComponents()

    fixture = TestBed.createComponent(PopupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set popup when service eimts', () => {
    component.ngOnInit()
    fixture.detectChanges()

    expect(component.popup).toEqual({ message: 'Test', duration: 5000 })
  })
})
