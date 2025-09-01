import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';


function hasMessage(obj: any): obj is { message: string } {
  return obj && typeof obj === 'object' && 'message' in obj && typeof obj.message === 'string';
}

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    
    this.logger.error('WebSocket exception:', exception);

    if (exception instanceof WsException) {
      const error = exception.getError();
      
      // Extract message from different error formats
      const message = this.extractErrorMessage(error);
      
      client.emit('error', {
        message,
        type: 'ws_exception'
      });
    } else if (exception instanceof Error) {
      client.emit('error', {
        message: 'Internal server error',
        type: 'internal_error'
      });
    } else {
      client.emit('error', {
        message: 'An unexpected error occurred',
        type: 'unknown_error'
      });
    }
  }

  private extractErrorMessage(error: string | object): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (hasMessage(error)) {
      return error.message;
    }
    
    // If it's an object but doesn't have a message property
    if (typeof error === 'object' && error !== null) {
      // Try to stringify the object for debugging
      try {
        const errorStr = JSON.stringify(error);
        this.logger.debug('Non-string error object:', errorStr);
        return 'WebSocket error occurred';
      } catch {
        return 'WebSocket error occurred';
      }
    }
    
    return 'WebSocket error';
  }
}