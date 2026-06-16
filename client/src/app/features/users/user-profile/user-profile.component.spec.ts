import { ComponentFixture, TestBed } from '@angular/core/testing'

import { UserProfileComponent } from './user-profile.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import {
  ActivatedRoute,
  convertToParamMap,
  RouterModule,
} from '@angular/router'
import { selectUserProfile } from '../../../store/users/users.selectors'
import { User } from '../../../utils/interfaces/user.interface'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { of, take } from 'rxjs'
import {
  clearUserProfile,
  loadUserProfile,
  toggleFollow,
  updateUserProfileImage,
} from '../../../store/users/users.actions'

describe('UserProfileComponent', () => {
  let component: UserProfileComponent
  let fixture: ComponentFixture<UserProfileComponent>
  let mockStore: MockStore
  let activatedRouteMock = {
    params: of({ username: 'test' }),
    snapshot: {
      paramMap: convertToParamMap({ username: 'test' }),
    },
  }

  const profileMock = { id: '1', username: 'test' } as User
  const userMock = { id: '2', username: 'test2' } as User

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(UserProfileComponent)
    component = fixture.componentInstance
    mockStore = TestBed.inject(MockStore)

    mockStore.overrideSelector(selectUserProfile, profileMock)
    mockStore.overrideSelector(selectCurrentUser, userMock)

    fixture.detectChanges()

    window.URL.createObjectURL = jest.fn().mockReturnValue('preview-data')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should select userProfile', (done) => {
      component.userProfile$.pipe(take(1)).subscribe((profile) => {
        expect(profile).toEqual(profileMock)
        done()
      })
    })

    it('should select currentUser', (done) => {
      component.currentUser$.pipe(take(1)).subscribe((user) => {
        expect(user).toEqual(userMock)
        done()
      })
    })

    it('should dispatch loadUserProfile', () => {
      const spy = jest.spyOn(mockStore, 'dispatch')

      component.ngOnInit()

      expect(spy).toHaveBeenCalledWith(loadUserProfile({ username: 'test' }))
    })

    it('should set postsState to created from sessionStorage', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('created')

      component.ngOnInit()

      expect(component.postsState).toEqual('created')
    })

    it('should set postsState to liked from sessionStorage', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('liked')

      component.ngOnInit()

      expect(component.postsState).toEqual('liked')
    })

    it('should set postsState to created for invalid or null storage value', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      component.ngOnInit()

      expect(component.postsState).toEqual('created')
    })
  })

  describe('handleButtonClick', () => {
    it('should set postsState and sessionStorage', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem')

      component.handleButtonClick('liked')

      expect(component.postsState).toEqual('liked')
      expect(spy).toHaveBeenCalledWith('profilePostsState', 'liked')
    })
  })

  describe('ngOnDestroy', () => {
    it('should dispatch clearUserProfile', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      component.ngOnDestroy()

      expect(dispatchSpy).toHaveBeenCalledWith(clearUserProfile())
    })

    it('should remove value from sessionStore if isBrowser', () => {
      component.isBrowser = true

      const spy = jest.spyOn(Storage.prototype, 'removeItem')

      component.ngOnDestroy()

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('handleFollow', () => {
    it('should return if userProfile is null', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      mockStore.overrideSelector(selectUserProfile, null)

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should dispatch toggleFollow', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      component.handleFollow()

      expect(dispatchSpy).toHaveBeenCalledWith(toggleFollow({ userId: '1' }))
    })
  })

  describe('handleFile', () => {
    it('should handle file input click on handleChooseFile', () => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      component.fileInput = { nativeElement: fileInput }
      const clickSpy = jest.spyOn(fileInput, 'click')

      component.handleChooseFile()

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should update selectedFile and imagePreview on handleFileInputChange and dispatch action', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')
      const file = new File(['content'], 'file')

      const input = document.createElement('input')
      Object.defineProperty(input, 'files', { value: [file], writable: false })

      const event = new Event('change')
      Object.defineProperty(event, 'target', { value: input, writable: false })

      component.handleFileInputChange(event)

      expect(component.selectedFile).toEqual(file)
      expect(component.imagePreview).toBe('preview-data')
      expect(dispatchSpy).toHaveBeenCalledWith(
        updateUserProfileImage({ image: file, preview: 'preview-data' })
      )
    })
  })

  describe('template', () => {
    it('should hide follow button for the same user', () => {
      mockStore.overrideSelector(selectUserProfile, userMock)
      mockStore.refreshState()

      fixture.detectChanges()

      const button = fixture.nativeElement.querySelector(
        '[data-testid="follow-btn"]'
      )

      expect(button).not.toBeTruthy()
    })

    it('should show follow button for a different user', () => {
      const button = fixture.nativeElement.querySelector(
        '[data-testid="follow-btn"]'
      )

      expect(button).toBeTruthy()
    })

    it('should call handleFollow on click', () => {
      const spy = jest.spyOn(component, 'handleFollow')
      const button = fixture.nativeElement.querySelector(
        '[data-testid="follow-btn"]'
      )

      button.click()

      expect(spy).toHaveBeenCalled()
    })

    it('should call handleButtonClick with created', () => {
      const spy = jest.spyOn(component, 'handleButtonClick')

      const btn = fixture.nativeElement.querySelector(
        '[data-testid="state-btn-created"]'
      )

      btn.click()

      expect(spy).toHaveBeenCalledWith('created')
    })

    it('should call handleButtonClick with liked', () => {
      const spy = jest.spyOn(component, 'handleButtonClick')

      const btn = fixture.nativeElement.querySelector(
        '[data-testid="state-btn-liked"]'
      )

      btn.click()

      expect(spy).toHaveBeenCalledWith('liked')
    })
  })
})
