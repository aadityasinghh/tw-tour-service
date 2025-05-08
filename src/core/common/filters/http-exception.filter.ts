import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseCodes } from '../constants/response-messages.constant';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let responseBody: any = {
            data: null,
            message: 'Internal server error',
            code: ResponseCodes.FAILED,
        };

        // Handle HttpExceptions (including our custom ones)
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            // Check if this is our custom format
            if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                'message' in exceptionResponse &&
                'code' in exceptionResponse
            ) {
                responseBody = exceptionResponse;
            } else {
                // NestJS's standard HttpException
                responseBody.message =
                    typeof exceptionResponse === 'object'
                        ? (exceptionResponse as any).message ||
                          'An error occurred'
                        : exceptionResponse;

                // Set appropriate code based on status
                switch (status) {
                    case HttpStatus.NOT_FOUND:
                        responseBody.code = ResponseCodes.NOT_FOUND;
                        break;
                    case HttpStatus.BAD_REQUEST:
                        responseBody.code = ResponseCodes.BAD_REQUEST;
                        break;
                    case HttpStatus.UNAUTHORIZED:
                        responseBody.code = ResponseCodes.UNAUTHORIZED;
                        break;
                    case HttpStatus.CONFLICT:
                        responseBody.code = ResponseCodes.CONFLICT;
                        break;
                    case HttpStatus.FORBIDDEN:
                        responseBody.code = ResponseCodes.FORBIDDEN;
                        break;
                }
            }
        }
        // Handle database query errors
        else if (exception instanceof QueryFailedError) {
            status = HttpStatus.BAD_REQUEST;

            // Handle specific PostgreSQL errors based on error message
            if (
                exception.message.includes('invalid input syntax for type uuid')
            ) {
                responseBody.message =
                    'Invalid UUID format provided. Please check the ID parameter.';
                responseBody.code = ResponseCodes.BAD_REQUEST;
            } else if (
                exception.message.includes('violates foreign key constraint')
            ) {
                responseBody.message =
                    "The request references an entity that doesn't exist.";
                responseBody.code = ResponseCodes.BAD_REQUEST;
            } else if (
                exception.message.includes(
                    'duplicate key value violates unique constraint',
                )
            ) {
                status = HttpStatus.CONFLICT;
                responseBody.message =
                    'A resource with these details already exists.';
                responseBody.code = ResponseCodes.CONFLICT;
            } else {
                responseBody.message =
                    'Database query failed: ' + exception.message;
            }
        } else if (exception instanceof Error) {
            // Handle standard JS errors
            responseBody.message = exception.message;

            // Check for common error patterns in the message
            if (exception.message.includes('uuid')) {
                status = HttpStatus.BAD_REQUEST;
                responseBody.code = ResponseCodes.BAD_REQUEST;
            }
        }

        response.status(status).json(responseBody);
    }
}
