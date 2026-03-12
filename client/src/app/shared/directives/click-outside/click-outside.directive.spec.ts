import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Component } from '@angular/core'
import { ClickOutsideDirective } from './click-outside.directive'

@Component({
  template: `
    <div data-testid="outside">
      <div (clickOutside)="onOutsideClick()" data-testid="inside">Inside</div>
    </div>
  `,
  imports: [ClickOutsideDirective],
})
class TestHostComponent {
  onOutsideClick = jest.fn()
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>
  let component: TestHostComponent
  let insideElement: HTMLElement
  let outsideElement: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TestHostComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    insideElement = fixture.nativeElement.querySelector(
      '[data-testid="inside"]'
    )
    outsideElement = fixture.nativeElement.querySelector(
      '[data-testid="outside"]'
    )
  })

  it('should emit when clicking outside', () => {
    outsideElement.click()

    expect(component.onOutsideClick).toHaveBeenCalled()
  })

  it('should NOT emit when clicking inside', () => {
    insideElement.click()

    expect(component.onOutsideClick).not.toHaveBeenCalled()
  })
})
