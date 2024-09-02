import {
  BadRequestException,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import customMessage from '../responses/customMessage.response';
import { LoginAuthDto } from 'src/auth/dto/LoginAuth.dto';

@UsePipes(ValidationPipe)
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(
    err: Error | null,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: number,
  ): any {
    const request = context.switchToHttp().getRequest();
    const { email, password }: LoginAuthDto = request.body;

    if (err || !user) {
      if (!email) {
        throw new BadRequestException(
          customMessage(
            HttpStatus.BAD_REQUEST,
            'email or username should not be empty',
          ),
        );
      } else if (!password) {
        throw new BadRequestException(
          customMessage(HttpStatus.BAD_REQUEST, 'password should not be empty'),
        );
      } else {
        throw err || new UnauthorizedException();
      }
    }
    return user;
  }
}
