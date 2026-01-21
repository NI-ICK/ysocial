import { TestBed } from '@angular/core/testing'

import { PopupService } from './popup.service'
import { take } from 'rxjs'

describe('PopupService', () => {
  let service: PopupService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PopupService)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should emit a popup when showPopup is called', () => {
    let currentPopup = null
    service.popup$.subscribe((popup) => (currentPopup = popup))

    service.showPopup('Test')
    expect(currentPopup).toEqual({ message: 'Test', duration: 5000 })
  })

  it('should clear popup after specific duration', () => {
    let currentPopup = null
    service.popup$.subscribe((popup) => (currentPopup = popup))

    service.showPopup('Test', 3000)
    expect(currentPopup).toEqual({ message: 'Test', duration: 3000 })

    jest.advanceTimersByTime(3000)

    expect(currentPopup).toBeNull()
  })
})
