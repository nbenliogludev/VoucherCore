import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let response: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ url: '/promo-codes' }),
      }),
    } as ArgumentsHost;
  });

  it('formats HTTP exceptions with a plain string response body', () => {
    filter.catch(
      new HttpException('Promo code not found', HttpStatus.NOT_FOUND),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Promo code not found',
      timestamp: expect.any(String),
      path: '/promo-codes',
    });
  });

  it('falls back to the internal server error message when a message property has an unsupported type', () => {
    filter.catch(
      new HttpException({ message: 42 }, HttpStatus.BAD_REQUEST),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Internal server error',
      timestamp: expect.any(String),
      path: '/promo-codes',
    });
  });

  it('uses the first validation message when the exception contains an array', () => {
    filter.catch(
      new HttpException(
        { message: ['email must be an email', 'email should not be empty'] },
        HttpStatus.BAD_REQUEST,
      ),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'email must be an email',
      timestamp: expect.any(String),
      path: '/promo-codes',
    });
  });

  it('falls back to the internal server error message for malformed HTTP payloads', () => {
    filter.catch(
      new HttpException({ error: 'teapot' }, HttpStatus.I_AM_A_TEAPOT),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.I_AM_A_TEAPOT);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.I_AM_A_TEAPOT,
      message: 'Internal server error',
      timestamp: expect.any(String),
      path: '/promo-codes',
    });
  });

  it('logs unexpected errors and returns a 500 response', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    filter.catch(new Error('boom'), host);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '--- UNHANDLED CAUGHT SERVER ERROR ---',
      expect.any(Error),
    );
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: expect.any(String),
      path: '/promo-codes',
    });

    consoleErrorSpy.mockRestore();
  });
});
