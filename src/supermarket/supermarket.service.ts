import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
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
// import * as fs from 'fs';
// import * as path from 'path';
// import { importDynamic } from 'src/shared/utils';

@Injectable()
export class SupermarketService implements OnModuleInit {
  private app: any;
  constructor(
    @InjectRepository(Supermarket)
    private supermarketRepo: Repository<Supermarket>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    // const { Client } = await importDynamic('@gradio/client');

    // this.app = await Client.connect('aicafee/fresh_vs_old_meat');
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
    return await this.supermarketRepo.find({ relations: ['address', 'owner'] });
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
    // const { handle_file } = await importDynamic('@gradio/client');
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

      // const response_0 = await fetch(
      //   'https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png',
      // );
      // const exampleImage = await response_0.blob();

      // const prediction = await this.app.predict('/predict', [
      //   handle_file(exampleImage),
      // ]);

      // console.log('PREDICTION ---->', prediction.data);

      // Working on this
      // const response = await this.callFastApi(supermarketId);
      // console.log('🚀 ~ SupermarketService ~ job ~ response:', response);
    });

    this.schedulerRegistry.addCronJob(`supermarketCron-${supermarketId}`, job);
    job.start();
  }

  private async stopCronJob(supermarketId: number) {
    const job = this.schedulerRegistry.getCronJob(
      `supermarketCron-${supermarketId}`,
    );
    if (job) {
      await this.supermarketRepo.update(supermarketId, {
        startTime: null,
      });
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
    const supermarketToUpdate = await this.getSupermarket(id);
    return await this.supermarketRepo.save({
      ...supermarketToUpdate,
      ...supermarket,
    });
  }

  async deleteSupermarket(id: number): Promise<void> {
    await this.supermarketRepo.delete(id);
  }
}
