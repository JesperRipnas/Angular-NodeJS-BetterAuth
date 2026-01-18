import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../shared/services/auth.service';
import { TranslationService } from '../shared/services/translation.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUser']);
    mockAuthService.getUser = jasmine.createSpy('getUser').and.returnValue({
      username: 'testuser',
      email: 'test@example.com',
    });

    mockTranslationService = jasmine.createSpyObj('TranslationService', [
      'translate',
      'language',
    ]);
    mockTranslationService.translate = jasmine
      .createSpy('translate')
      .and.returnValue('Translated Text');

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
