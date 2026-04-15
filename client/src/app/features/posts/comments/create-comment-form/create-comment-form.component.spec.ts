import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateCommentFormComponent } from './create-comment-form.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { User } from '../../../../utils/interfaces/user.interface'
import { selectCurrentUser } from '../../../../store/auth/auth.selectors'
import { take } from 'rxjs'
import { ElementRef } from '@angular/core'
import { createComment } from '../../../../store/comments/comments.actions'

describe('CreateCommentFormComponent', () => {
  let component: CreateCommentFormComponent
  let fixture: ComponentFixture<CreateCommentFormComponent>
  let store: MockStore

  const mockUser = {
    id: '1',
    username: 'test',
  } as User

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCommentFormComponent],
      providers: [provideMockStore()],
    }).compileComponents()

    fixture = TestBed.createComponent(CreateCommentFormComponent)
    store = TestBed.inject(MockStore)
    component = fixture.componentInstance
    fixture.detectChanges()

    component.postId = '1'

    store.overrideSelector(selectCurrentUser, mockUser)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should assign currentUser', (done) => {
      component.ngOnInit()

      component.currentUser$.pipe(take(1)).subscribe((user) => {
        expect(user?.id).toEqual('1')
        done()
      })
    })

    it('should call resizeTextarea when form value changes', () => {
      const resizeSpy = jest.spyOn(component, 'resizeTextarea')

      component.ngOnInit()

      component.createCommentForm.setValue({ body: 'test ' })

      expect(resizeSpy).toHaveBeenCalled()
    })
  })

  describe('resizeTextarea', () => {
    it('should resize textarea based on scrollHeight', () => {
      const textarea = document.createElement('textarea')

      Object.defineProperty(textarea, 'scrollHeight', {
        value: 150,
      })

      component.textareaRef = new ElementRef(textarea)

      component.resizeTextarea()

      expect(textarea.scrollHeight).toEqual(150)
    })
  })

  describe('handleFormSubmit', () => {
    it('should return if body is null', () => {
      component.createCommentForm.setValue({ body: '' })
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.handleFormSubmit()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should dispatch createComment and reset form', () => {
      component.createCommentForm.setValue({ body: 'test' })
      const dispatchSpy = jest.spyOn(store, 'dispatch')
      const resetSpy = jest.spyOn(component.createCommentForm, 'reset')

      component.handleFormSubmit()

      expect(resetSpy).toHaveBeenCalled()
      expect(dispatchSpy).toHaveBeenCalledWith(
        createComment({ body: 'test', postId: '1', parentId: null })
      )
    })
  })
})
