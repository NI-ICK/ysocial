import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CreatePostFormComponent } from './create-post-form.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { createPost } from '../../../store/posts/posts.actions'

describe('CreatePostFormComponent', () => {
  let component: CreatePostFormComponent
  let fixture: ComponentFixture<CreatePostFormComponent>
  let store: MockStore

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePostFormComponent],
      providers: [provideMockStore()],
    }).compileComponents()

    store = TestBed.inject(MockStore)
    fixture = TestBed.createComponent(CreatePostFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set currentUser on ngOnInit', () => {
    component.ngOnInit()
    component.currentUser$.subscribe((user) => {
      expect(user).toEqual({ id: '1' })
    })
  })

  it('should handle file input click on handleChooseFile', () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    component.fileInput = { nativeElement: fileInput }
    const clickSpy = jest.spyOn(fileInput, 'click')

    component.handleChooseFile()

    expect(clickSpy).toHaveBeenCalled()
  })

  it('should clear selectedFile and imagePreview on handleRemoveFile', () => {
    component.selectedFile = new File(['content'], 'file')
    component.imagePreview = 'image.png'

    component.handleRemoveFile()

    expect(component.selectedFile).toBeNull()
    expect(component.imagePreview).toEqual('')
  })

  it('should update selectedFile and imagePreview on handleFileInputChange', () => {
    const file = new File(['content'], 'file')

    const input = document.createElement('input')
    Object.defineProperty(input, 'files', { value: [file], writable: false })

    const event = new Event('change')
    Object.defineProperty(event, 'target', { value: input, writable: false })

    const fileReaderMock = {
      readAsDataURL: jest.fn(function () {
        this.result = 'preview-data'
        this.onload({})
      }),
    } as Partial<FileReader>

    jest
      .spyOn(window, 'FileReader')
      .mockImplementation(() => fileReaderMock as FileReader)

    component.handleFileInputChange(event)

    expect(component.selectedFile).toEqual(file)
    expect(component.imagePreview).toBe('preview-data')
  })

  it('should not call dispatch if body and selectedFile are empty', () => {
    component.createPostForm.get('body')?.setValue('')
    component.selectedFile = null
    const dispatchSpy = jest.spyOn(store, 'dispatch')

    component.handleFormSubmit()

    expect(dispatchSpy).not.toHaveBeenCalled()
  })

  it('should call dispatch if form is valid and reset form data', () => {
    const mockFile = new File(['content'], '')
    component.createPostForm.get('body')?.setValue('test')
    component.selectedFile = mockFile
    const dispatchSpy = jest.spyOn(store, 'dispatch')

    const removeFileSpy = jest.spyOn(component, 'handleRemoveFile')
    const formResetSpy = jest.spyOn(component.createPostForm, 'reset')

    component.handleFormSubmit()

    expect(dispatchSpy).toHaveBeenCalledWith(
      createPost({ body: 'test', file: mockFile })
    )
    expect(removeFileSpy).toHaveBeenCalled()
    expect(formResetSpy).toHaveBeenCalled()
  })
})
