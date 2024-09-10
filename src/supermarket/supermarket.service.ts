import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supermarket } from './entities/supermarket.entity';
import { Repository } from 'typeorm';
import {
  CreateSupermarketDto,
  UpdateSupermarketDto,
} from './dto/supermarket.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { UserService } from 'src/user/user.service';
import { Address } from './entities/address.entity';

@Injectable()
export class SupermarketService implements OnModuleInit {
  constructor(
    @InjectRepository(Supermarket)
    private supermarketRepo: Repository<Supermarket>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    const supermarkets = await this.findAllWithCronEnabled();

    supermarkets.forEach((supermarket) => {
      this.startCronJob(supermarket.id);
    });
  }

  async findAllWithCronEnabled(): Promise<Supermarket[]> {
    const supermarkets = await this.supermarketRepo.find({
      where: { cronjobEnabled: true },
    });

    return supermarkets;
  }

  async getSupermarkets(): Promise<Supermarket[]> {
    return await this.supermarketRepo.find();
  }

  async getSupermarket(id: number): Promise<Supermarket> {
    const supermarket = await this.supermarketRepo.findOne({ where: { id } });
    if (!supermarket) {
      throw new NotFoundException(`Supermarket with ID ${id} not found`);
    }
    return supermarket;
  }

  async updateCronStatus(
    supermarketId: number,
    cronjobEnabled: boolean,
  ): Promise<void> {
    await this.supermarketRepo.update(supermarketId, { cronjobEnabled });
    if (cronjobEnabled) {
      this.startCronJob(supermarketId);
    } else {
      this.stopCronJob(supermarketId);
    }
  }

  private startCronJob(supermarketId: number) {
    const job = new CronJob('* * * * *', async () => {
      // Lógica del cronjob que se ejecuta cada hora
      console.log(
        `Cronjob ejecutado para el supermercado con ID: ${supermarketId}`,
      );
      // Aquí podrías implementar la lógica de obtener la imagen y enviarla a FastAPI
    });

    this.schedulerRegistry.addCronJob(`supermarketCron-${supermarketId}`, job);
    job.start();
  }

  private stopCronJob(supermarketId: number) {
    const job = this.schedulerRegistry.getCronJob(
      `supermarketCron-${supermarketId}`,
    );
    if (job) {
      job.stop();
      this.schedulerRegistry.deleteCronJob(`supermarketCron-${supermarketId}`);
    }
  }

  async createSupermarket(
    supermarket: CreateSupermarketDto,
  ): Promise<Supermarket> {
    const address = this.addressRepo.create(supermarket.address);
    await this.addressRepo.save(address);
    const owner = await this.userService.getUser(supermarket.ownerId);
    if (!owner) {
      throw new NotFoundException(
        `User with ID ${supermarket.ownerId} not found`,
      );
    }

    const newSupermarket = this.supermarketRepo.create({
      ...supermarket,
      owner,
      address,
    });
    return await this.supermarketRepo.save(newSupermarket);
  }

  async updateSupermarket(
    id: number,
    supermarket: UpdateSupermarketDto,
  ): Promise<Supermarket> {
    await this.getSupermarket(id);
    return await this.supermarketRepo.save({ id, ...supermarket });
  }

  async deleteSupermarket(id: number): Promise<void> {
    await this.supermarketRepo.delete(id);
  }
}
