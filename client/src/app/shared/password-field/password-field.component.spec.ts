import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PasswordFieldComponent } from './password-field.component'
import { By } from '@angular/platform-browser'
import { FormControl, NgControl } from '@angular/forms'

describe('PasswordFieldComponent', () => {
  let component: PasswordFieldComponent
  let fixture: ComponentFixture<PasswordFieldComponent>
  let ngControlMock

  beforeEach(async () => {
    ngControlMock = {
      provide: NgControl,
      useClass: class extends NgControl {
        control = new FormControl()
        viewToModelUpdate() {}
      },
    }

    await TestBed.configureTestingModule({
      imports: [PasswordFieldComponent],
    })
      .overrideComponent(PasswordFieldComponent, {
        add: { providers: [ngControlMock] },
      })
      .compileComponents()

    fixture = TestBed.createComponent(PasswordFieldComponent)
    component = fixture.componentInstance

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should change state on toggle click', () => {
    const toggleSpy = jest.spyOn(component, 'togglePassword')
    const element = fixture.debugElement.query(By.css('.password-toggle'))

    element.triggerEventHandler('click')

    expect(toggleSpy).toHaveBeenCalled()
    expect(component.passwordHidden).toBe(false)

    element.triggerEventHandler('click')

    expect(toggleSpy).toHaveBeenCalled()
    expect(component.passwordHidden).toBe(true)
  })
})
