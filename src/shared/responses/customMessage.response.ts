import { HttpStatus } from '@nestjs/common';

export default function customMessage(statusCode: HttpStatus, message: string) {
  return {
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
}
