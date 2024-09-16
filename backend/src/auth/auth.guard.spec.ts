import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
// import { CommentsService } from '../comments/comments.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        /*{
          provide: CommentsService,
          useValue: {
            findCommentByCommentIdAndUserId: jest.fn(),
          },
        },*/
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should allow requests with valid token and comment', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'PUT',
      query: { commentId: 'commentId' },
      user: { payload: { sub: 'userId' } },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it("should throw UnauthorizedException if jwt isn't verifies the token", () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(JsonWebTokenError);

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'PUT',
      query: { commentId: 'commentId' },
      user: { payload: { sub: 'userId' } },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
