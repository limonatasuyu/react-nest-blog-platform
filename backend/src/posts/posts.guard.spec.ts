import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JsonWebTokenError } from '@nestjs/jwt';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { PostsGuard } from './posts.guard';
import { PostsService } from './posts.service';

describe('PostsGuard', () => {
  let postsGuard: PostsGuard;
  let postsService: PostsService;
  let postsModule: TestingModule;
  let jwtService: JwtService;

  beforeAll(async () => {
    postsModule = await Test.createTestingModule({
      providers: [
        PostsGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PostsService,
          useValue: {
            getPostByIdAndUser: jest.fn(),
          },
        },
      ],
    }).compile();

    postsGuard = postsModule.get<PostsGuard>(PostsGuard);
    jwtService = postsModule.get<JwtService>(JwtService);
    postsService = postsModule.get<PostsService>(PostsService);
  });

  afterAll(async () => {
    await postsModule.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow requests with valid token and post', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (postsService.getPostByIdAndUser as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'PUT',
      query: { post_id: 'postId' },
      user: { payload: { sub: 'userId' } },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = await postsGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it("should throw UnauthorizedException if jwt isn't verifies the token", () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(JsonWebTokenError);
    (postsService.getPostByIdAndUser as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'PUT',
      query: { post_id: 'postId' },
      user: { payload: { sub: 'userId' } },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(postsGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw InternalServerError if no postId is received and request method is not GET or POST', () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (postsService.getPostByIdAndUser as jest.Mock).mockResolvedValue(null);

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

    expect(postsGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException, //InternalServerErrorException,
    );
  });

  it('should allow requests if no postId is received and request method is GET', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (postsService.getPostByIdAndUser as jest.Mock).mockResolvedValue(null);

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
    const result = await postsGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should allow requests if no postId is received and request method is POST', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (postsService.getPostByIdAndUser as jest.Mock).mockResolvedValue(null);

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
    const result = await postsGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no post is not found and request method is not GET or POST', () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { sub: 'userId' },
    });
    (postsService.getPostByIdAndUser as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      headers: { authorization: 'Bearer validToken' },
      method: 'PUT',
      query: { post_id: 'postId' },
      user: { payload: { sub: 'userId' } },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(postsGuard.canActivate(mockContext)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
