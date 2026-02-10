import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller.js';
import { LoginDto } from './dto/login.dto.js';
import { authDatabase } from './auth.js';

describe('AuthController', () => {
  let controller: AuthController;
  let querySpy: jest.SpiedFunction<typeof authDatabase.query>;

  const mockResponse = (): Response =>
    ({ setHeader: jest.fn() }) as unknown as Response;

  const mockRequest = (): Request =>
    ({ headers: { origin: 'http://localhost:4200' } }) as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    querySpy = jest.spyOn(authDatabase, 'query');

    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn();
  });

  afterEach(() => {
    querySpy.mockRestore();
    jest.resetAllMocks();
  });

  it('returns payload on valid credentials (username)', async () => {
    const dto: LoginDto = { identifier: 'admin', password: '1234' };

    querySpy.mockResolvedValue({
      rows: [{ email: 'admin@example.com' }],
      rowCount: 1,
    } as never);

    const payload = { success: true };

    (global as unknown as { fetch: jest.Mock }).fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'session=abc' },
      json: () => Promise.resolve(payload),
    });

    const res = mockResponse();
    const req = mockRequest();

    const setHeaderSpy = jest.spyOn(res, 'setHeader');

    const result = await controller.login(dto, res, req);

    expect(result).toEqual(payload);
    expect(setHeaderSpy).toHaveBeenCalledWith('set-cookie', 'session=abc');
    expect(querySpy).toHaveBeenCalled();
  });

  it('throws UnauthorizedException when username is not found', async () => {
    const dto: LoginDto = { identifier: 'missing', password: '1234' };

    querySpy.mockResolvedValue({ rows: [], rowCount: 0 } as never);

    const res = mockResponse();
    const req = mockRequest();

    await expect(controller.login(dto, res, req)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
