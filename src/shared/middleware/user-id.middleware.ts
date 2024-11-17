import { Injectable, NestMiddleware } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extraer el token del header de autorización
      const authHeader = req.headers.authorization;
      console.log('Auth Header:', authHeader); // Debug log

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Decodificar el token y mostrar el payload completo
        const decoded = this.jwtService.decode(token);
        console.log('Decoded JWT:', decoded); // Debug log

        const userId = decoded?.sub;
        console.log('User ID from token:', userId); // Debug log

        if (userId) {
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();

          try {
            // Verificar el valor actual antes de establecerlo
            const beforeValue = await queryRunner.query(
              `SELECT current_setting('app.user_id', true)`,
            );
            console.log('Before setting user_id:', beforeValue);

            console.log('USER ID', userId);

            // Establecer el nuevo valor
            const query = await queryRunner.query(
              `SET LOCAL app.user_id = '${userId.toString()}'`,
            );
            console.log('🚀 ~ UserIdMiddleware ~ use ~ query:', query);

            // Verificar que se estableció correctamente
            const afterValue = await queryRunner.query(
              `SELECT current_setting('app.user_id', true)`,
            );
            console.log('After setting user_id:', afterValue);
          } catch (error) {
            console.error('Error setting user_id:', error);
          } finally {
            await queryRunner.release();
          }
        }
      }
    } catch (error) {
      console.error('Error in UserIdMiddleware:', error);
    }

    next();
  }
}
