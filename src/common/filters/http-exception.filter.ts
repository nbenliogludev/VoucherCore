import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function hasMessageProperty(value: unknown): value is { message: unknown } {
  return typeof value === 'object' && value !== null && 'message' in value;
}

function extractErrorMessage(errorResponse: unknown): string | string[] {
  if (typeof errorResponse === 'string') {
    return errorResponse;
  }

  if (hasMessageProperty(errorResponse)) {
    const { message } = errorResponse;

    if (typeof message === 'string' || isStringArray(message)) {
      return message;
    }
  }

  return 'Internal server error';
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      console.error('--- UNHANDLED CAUGHT SERVER ERROR ---', exception);
    }

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message = extractErrorMessage(errorResponse);

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
