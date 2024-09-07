import { Test, TestingModule } from '@nestjs/testing';
import { ImageGuard } from './image.guard';
import { JwtService, JsonWebTokenError } from '@nestjs/jwt';
import { ImageService } from './image.service';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('ImageGuard', () => {
  let guard: ImageGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ImageService,
          useValue: {
            findCommentByCommentIdAndUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ImageGuard>(ImageGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should allow requests with valid token', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'PUT',
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
