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
import * as moment from 'moment';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
// import * as fs from 'fs';
// import * as path from 'path';
import * as FormData from 'form-data';
import { AxiosResponse } from 'axios';

@Injectable()
export class SupermarketService implements OnModuleInit {
  constructor(
    @InjectRepository(Supermarket)
    private supermarketRepo: Repository<Supermarket>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
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
    await this.supermarketRepo.update(supermarketId, {
      cronjobEnabled,
      startTime: new Date(),
    });
    if (cronjobEnabled) {
      this.startCronJob(supermarketId);
    } else {
      this.stopCronJob(supermarketId);
    }
  }

  async startCronJob(supermarketId: number) {
    const supermarket = await this.getSupermarket(supermarketId);
    console.log(
      '🚀 ~ SupermarketService ~ startCronJob ~ supermarket:',
      supermarket,
    );

    const startTime = moment(supermarket.startTime);

    // HORA
    // const cronExpression = `${startTime.seconds()} ${startTime.minutes()} ${startTime.hours()} * * *`;

    // MINUTO PARA TEST
    const cronExpression = `${startTime.seconds()} * * * * *`;

    const job = new CronJob(cronExpression, async () => {
      console.log(
        `Cronjob ejecutado para el supermercado con ID: ${supermarketId} a las ${moment().format('HH:mm:ss')}`,
      );
      const response = await this.callFastApi(supermarketId);
      console.log('🚀 ~ SupermarketService ~ job ~ response:', response);
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

  private async callFastApi(supermarketId: number): Promise<any> {
    const apiUrl = 'http://localhost:8000/predict/';

    // console.log('🚀 ~ SupermarketService ~ callFastApi ~ apiUrl:', __dirname);

    // const imagePath = path.resolve(__dirname, '..', 'images', 'R.jpeg');
    // const imageBuffer = fs.readFileSync(imagePath);

    const formData = new FormData();
    formData.append('supermarketId', supermarketId.toString());
    // formData.append('image', imageBuffer, {
    //   filename: 'R.jpeg',
    //   contentType: 'image/jpeg',
    // });

    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.post(apiUrl, formData, {
          headers: formData.getHeaders(),
        }),
      );
      console.log('Response from FastAPI:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error calling FastAPI:', error);
      throw error;
    }
  }
}
