import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EditUserFormComponent } from './edit-user-form.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { UsersService } from '../users-service/users.service'
import { PopupService } from '../../../shared/popup/popup.service'
import { Router, RouterModule } from '@angular/router'
import { User } from '../../../utils/interfaces/user.interface'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { of, take } from 'rxjs'
import { deleteUser, updateUser } from '../../../store/users/users.actions'
import { ElementRef } from '@angular/core'

describe('EditUserFormComponent', () => {
  let component: EditUserFormComponent
  let fixture: ComponentFixture<EditUserFormComponent>
  let mockStore: MockStore
  let usersService: Partial<UsersService>
  let popupService: Partial<PopupService>
  let router: Router

  const userMock = {
    id: '123',
    username: 'test',
  } as User

  beforeEach(async () => {
    popupService = {
      showPopup: jest.fn(),
    }
    usersService = {
      isUsernameTaken: jest.fn(),
      isEmailTaken: jest.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [EditUserFormComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: UsersService, useValue: usersService },
        { provide: PopupService, useValue: popupService },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(EditUserFormComponent)
    component = fixture.componentInstance
    mockStore = TestBed.inject(MockStore)
    router = TestBed.inject(Router)

    fixture.detectChanges()

    mockStore.overrideSelector(selectCurrentUser, userMock)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should select currentUser', (done) => {
      component.ngOnInit()

      component.currentUser$.pipe(take(1)).subscribe((user) => {
        expect(user).toEqual(userMock)
        done()
      })
    })
  })

  describe('validators', () => {
    it('should set password mismatch error', () => {
      component.editForm.patchValue({
        password: 'test',
        repeatPassword: 'test1',
      })

      component.editForm.updateValueAndValidity()

      expect(
        component.editForm.get('password')?.hasError('passwordMismatch')
      ).toEqual(true)
    })

    it('should remove password mismatch error when passwords match', () => {
      component.editForm.patchValue({
        password: 'test',
        repeatPassword: 'test',
      })

      component.editForm.updateValueAndValidity()

      expect(
        component.editForm.get('password')?.hasError('passwordMismatch')
      ).toEqual(false)
    })

    it('should set email mismatch error', () => {
      component.editForm.patchValue({
        email: 'test@test',
        repeatEmail: 'test1@test',
      })

      component.editForm.updateValueAndValidity()

      expect(
        component.editForm.get('email')?.hasError('emailMismatch')
      ).toEqual(true)
    })

    it('should remove email mismatch error when emails match', () => {
      component.editForm.patchValue({
        email: 'test@test',
        repeatEmail: 'test@test',
      })

      component.editForm.updateValueAndValidity()

      expect(
        component.editForm.get('email')?.hasError('emailMismatch')
      ).toEqual(false)
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      ;(usersService.isUsernameTaken as jest.Mock).mockReturnValue(
        of({ data: { isUsernameTaken: false } })
      )
      ;(usersService.isEmailTaken as jest.Mock).mockReturnValue(
        of({ data: { isEmailTaken: false } })
      )
    })

    it('should set atLeastOneRequired when form is empty', async () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      await component.handleSubmit()

      expect(component.editForm.errors).toEqual({
        atLeastOneRequired: true,
      })

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should not submit invalid form', async () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')
      component.editForm.patchValue({
        email: 'test',
      })

      await component.handleSubmit()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should dispatch updateUser with username only', async () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')
      component.editForm.patchValue({
        username: 'new-user',
      })

      await component.handleSubmit()

      expect(dispatchSpy).toHaveBeenCalledWith(
        updateUser({
          newUsername: 'new-user',
          newBio: '',
          newPassword: '',
          newEmail: '',
        })
      )
    })

    it('should dispatch updateUser with all fields', async () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')
      component.editForm.patchValue({
        username: 'test',
        bio: 'test',
        password: 'test',
        repeatPassword: 'test',
        email: 'test@test.com',
        repeatEmail: 'test@test.com',
      })

      await component.handleSubmit()

      expect(dispatchSpy).toHaveBeenCalledWith(
        updateUser({
          newUsername: 'test',
          newBio: 'test',
          newPassword: 'test',
          newEmail: 'test@test.com',
        })
      )
    })

    it('should emit submitSuccess', async () => {
      const emitSpy = jest.spyOn(component.submitSuccess, 'emit')

      component.editForm.patchValue({
        username: 'test',
      })

      await component.handleSubmit()

      expect(emitSpy).toHaveBeenCalled()
    })

    it('should navigate when username is changed', async () => {
      const navigateSpy = jest.spyOn(router, 'navigate')
      component.editForm.patchValue({
        username: 'test',
      })

      await component.handleSubmit()

      expect(navigateSpy).toHaveBeenCalledWith(['/', 'test'])
    })

    it('should not navigate if username is empty', async () => {
      const navigateSpy = jest.spyOn(router, 'navigate')
      component.editForm.patchValue({
        bio: 'bio',
      })

      await component.handleSubmit()

      expect(navigateSpy).not.toHaveBeenCalled()
    })
  })

  describe('delete modal', () => {
    it('should open confirmation modal', () => {
      component.openConfirmDelete()

      expect(component.showConfirmDelete).toBe(true)
    })

    it('should close confirmation modal', () => {
      component.showConfirmDelete = true

      component.closeConfirmDelete()

      expect(component.showConfirmDelete).toBe(false)
    })
  })

  describe('delete user', () => {
    it('should dispatch deleteUser', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')
      component.handleDeleteUser()

      expect(dispatchSpy).toHaveBeenCalledWith(deleteUser())
    })

    it('should navigate home after delete', () => {
      const navigateSpy = jest.spyOn(router, 'navigate')
      component.handleDeleteUser()

      expect(navigateSpy).toHaveBeenCalledWith(['/'])
    })
  })

  describe('resizeTextarea', () => {
    it('should resize textarea to scroll height', () => {
      const textarea = document.createElement('textarea')

      Object.defineProperty(textarea, 'scrollHeight', {
        configurable: true,
        value: 150,
      })

      component.textareaRef = {
        nativeElement: textarea,
      } as ElementRef<HTMLTextAreaElement>

      component.resizeTextarea()

      expect(textarea.style.height).toBe('150px')
    })
  })

  it('shows at least one field error when submitting empty form', () => {
    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    )

    submitBtn.click()
    fixture.detectChanges()

    expect(component.editForm.errors).toEqual({
      atLeastOneRequired: true,
    })

    expect(fixture.nativeElement.textContent).toContain(
      'Please fill out at least on field.'
    )
  })
})
