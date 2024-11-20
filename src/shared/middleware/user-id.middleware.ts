import { Injectable, NestMiddleware } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extraer el token del encabezado de autorización
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Decodificar el JWT
        const decoded = this.jwtService.decode(token) as {
          sub?: string; // userId
          supermarketId?: string; // supermarketId
        };

        const userId = decoded?.sub;
        const supermarketId = decoded?.supermarketId;

        if (userId) {
          await this.dataSource.query(`SET app.user_id = '${userId}'`);
        }

        if (supermarketId) {
          await this.dataSource.query(
            `SET app.supermarket_id = '${supermarketId}'`,
          );
        }
      }
    } catch (error) {
      console.error('Error in UserContextMiddleware:', error);
    }

    next();
  }
}
