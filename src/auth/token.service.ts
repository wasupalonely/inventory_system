import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async createToken(email: string, token: string) {
    const newToken = this.tokenRepository.create({ email, token });
    await this.tokenRepository.save(newToken);
  }

  async markTokenAsUsed(token: string) {
    await this.tokenRepository.update({ token }, { used: true });
  }

  async isTokenUsed(token: string): Promise<boolean> {
    const storedToken = await this.tokenRepository.findOne({ where: { token } });
    return storedToken ? storedToken.used : true;
  }

  async getToken(email: string, token: string) {
    return this.tokenRepository.findOne({ where: { email, token } });
  }
}
