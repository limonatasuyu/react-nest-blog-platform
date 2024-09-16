import { Test, TestingModule } from '@nestjs/testing';
import { CommentsGuard } from './comments.guard';
import { JwtService, JsonWebTokenError } from '@nestjs/jwt';
import { CommentsService } from './comments.service';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('CommentsGuard', () => {
  let guard: CommentsGuard;
  let jwtService: JwtService;
  let commentsService: CommentsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CommentsGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: CommentsService,
          useValue: {
            findCommentByCommentIdAndUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<CommentsGuard>(CommentsGuard);
    jwtService = module.get<JwtService>(JwtService);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should allow requests with valid token and comment', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (
      commentsService.findCommentByCommentIdAndUserId as jest.Mock
    ).mockResolvedValue(true);

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
    (
      commentsService.findCommentByCommentIdAndUserId as jest.Mock
    ).mockResolvedValue(true);

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

  it('should throw InternalServerError if no commentId is received and request method is not GET or POST', () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (
      commentsService.findCommentByCommentIdAndUserId as jest.Mock
    ).mockResolvedValue(true);

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'PUT',
      query: {},
      user: { payload: { sub: 'userId' } },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should allow requests if no commentId is received and request method is GET', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (
      commentsService.findCommentByCommentIdAndUserId as jest.Mock
    ).mockResolvedValue(true);

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'GET',
      query: {},
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

  it('should allow requests if no commentId is received and request method is POST', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (
      commentsService.findCommentByCommentIdAndUserId as jest.Mock
    ).mockResolvedValue(true);

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'POST',
      query: {},
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

  it('should throw UnauthorizedException if no comment is found and request method is not GET or POST', () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (
      commentsService.findCommentByCommentIdAndUserId as jest.Mock
    ).mockResolvedValue(null);

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
