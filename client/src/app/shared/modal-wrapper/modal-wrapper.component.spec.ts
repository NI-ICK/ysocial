import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ModalWrapperComponent } from './modal-wrapper.component'
import { By } from '@angular/platform-browser'

describe('ModalWrapperComponent', () => {
  let component: ModalWrapperComponent
  let fixture: ComponentFixture<ModalWrapperComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalWrapperComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ModalWrapperComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit close event on backdrop click', () => {
    const closeModalSpy = jest.spyOn(component.close, 'emit')
    const element = fixture.debugElement.query(By.css('.backdrop'))

    element.triggerEventHandler('click')
    expect(closeModalSpy).toHaveBeenCalled()
  })
})
