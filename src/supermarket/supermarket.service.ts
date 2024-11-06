import {
  BadRequestException,
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
  CreateAddressDto,
  CreateSupermarketDto,
  UpdateSupermarketDto,
} from './dto/supermarket.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { UserService } from 'src/user/user.service';
import { Address } from './entities/address.entity';
import * as moment from 'moment';
import { importDynamic } from 'src/shared/utils';
import { ScheduleFrequency } from 'src/shared/enums/schedule-frequency';
import { PredictionResponse } from 'src/shared/types/prediction';
import { CreatePredictionDto } from 'src/predictions/dto/prediction.dto';
import { PredictionsService } from 'src/predictions/predictions.service';
// import * as fs from 'fs';
// import * as path from 'path';

@Injectable()
export class SupermarketService implements OnModuleInit {
  private app: any;
  private testModeExecutions: Map<number, number> = new Map();
  private readonly TEST_MODE_LIMIT = 10;
  private readonly meatImages = [
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1729543375/semi-fresh_xtoukp.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1729543375/fresh_txjchq.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1729543375/rotten_meat_pjpppc.jpg',
  ];

  constructor(
    @InjectRepository(Supermarket)
    private supermarketRepo: Repository<Supermarket>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly predictionsService: PredictionsService,
  ) {}

  async onModuleInit() {
    const { Client } = await importDynamic('@gradio/client');
    this.app = await Client.connect('ItsEnder/freshness_detection');
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
    const supermarket = await this.supermarketRepo.findOne({
      where: { id },
      relations: ['address', 'owner', 'categories', 'users'],
    });
    if (!supermarket) {
      throw new NotFoundException(`Supermercado con ID ${id} no encontrado`);
    }
    return supermarket;
  }

  async updateCronStatus(
    supermarketId: number,
    cronjobEnabled: boolean,
    scheduleFrequency: ScheduleFrequency,
  ): Promise<void> {
    await this.supermarketRepo.update(supermarketId, {
      cronjobEnabled,
      scheduleFrequency,
      startTime: new Date(),
    });
    if (cronjobEnabled) {
      this.startCronJob(supermarketId);
    } else {
      this.stopCronJob(supermarketId);
    }
  }

  // async startCronJob(supermarketId: number) {
  //   // const { handle_file } = await importDynamic('@gradio/client');
  //   const supermarket = await this.getSupermarket(supermarketId);
  //   console.log(
  //     '🚀 ~ SupermarketService ~ startCronJob ~ supermarket:',
  //     supermarket,
  //   );

  //   const startTime = moment(supermarket.startTime);

  //   // HORA
  //   // const cronExpression = `${startTime.seconds()} ${startTime.minutes()} ${startTime.hours()} * * *`;

  //   // MINUTO PARA TEST
  //   const cronExpression = `${startTime.seconds()} * * * * *`;

  //   const job = new CronJob(cronExpression, async () => {
  //     console.log(
  //       `Cronjob ejecutado para el supermercado con ID: ${supermarketId} a las ${moment().format('HH:mm:ss')}`,
  //     );

  //     // const response_0 = await fetch(
  //     //   'https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png',
  //     // );
  //     // const exampleImage = await response_0.blob();

  //     // const prediction = await this.app.predict('/predict', [
  //     //   handle_file(exampleImage),
  //     // ]);

  //     // console.log('PREDICTION ---->', prediction.data);

  //     // Working on this
  //     // const response = await this.callFastApi(supermarketId);
  //     // console.log('🚀 ~ SupermarketService ~ job ~ response:', response);
  //   });

  //   this.schedulerRegistry.addCronJob(`supermarketCron-${supermarketId}`, job);
  //   job.start();
  // }

  private getCronExpression(
    frequency: ScheduleFrequency,
    startTime: Date,
  ): string {
    const time = moment(startTime);
    switch (frequency) {
      case ScheduleFrequency.EVERY_MINUTE:
        return '* * * * *';
      case ScheduleFrequency.DAILY:
        return `${time.minutes()} ${time.hours()} * * *`;
      case ScheduleFrequency.TWICE_DAILY:
        return `${time.minutes()} ${time.hours()},${(time.hours() + 12) % 24} * * *`;
      case ScheduleFrequency.WEEKLY:
        return `${time.minutes()} ${time.hours()} * * ${time.day()}`;
      case ScheduleFrequency.TWICE_WEEKLY:
        return `${time.minutes()} ${time.hours()} * * ${time.day()},${(time.day() + 3) % 7}`;
      case ScheduleFrequency.MONTHLY:
        return `${time.minutes()} ${time.hours()} ${time.date()} * *`;
      default:
        throw new Error('Invalid schedule frequency');
    }
  }

  async startCronJob(supermarketId: number) {
    const { handle_file } = await importDynamic('@gradio/client');
    const supermarket = await this.getSupermarket(supermarketId);
    const cronExpression = this.getCronExpression(
      supermarket.scheduleFrequency,
      supermarket.startTime,
    );

    const job = new CronJob(cronExpression, async () => {
      console.log(
        `Cronjob ejecutado para el supermercado con ID: ${supermarketId} a las ${moment().format('HH:mm:ss')}`,
      );

      if (
        supermarket.scheduleFrequency === ScheduleFrequency.EVERY_MINUTE &&
        this.checkTestModeLimit(supermarketId)
      ) {
        console.log('entraaa');
        return;
      }

      try {
        const randomImageUrl = this.getRandomImageUrl();
        const predictionData = await this.fetchPrediction(
          randomImageUrl,
          handle_file,
        );

        console.log('PREDICTION ---->', predictionData[0]);
        const predictionToSave: PredictionResponse = predictionData[0];

        const predictionParsed: CreatePredictionDto = {
          supermarketId,
          result: predictionToSave.label,
          fresh: predictionToSave.confidences.find(
            (confidence) => confidence.label === 'Fresh',
          ).confidence,
          halfFresh: predictionToSave.confidences.find(
            (confidence) => confidence.label === 'Half-fresh',
          ).confidence,
          spoiled: predictionToSave.confidences.find(
            (confidence) => confidence.label === 'Spoiled',
          ).confidence,
        };
        console.log(
          '🚀 ~ SupermarketService ~ job ~ predictionParsed:',
          predictionParsed,
        );

        await this.predictionsService.create(predictionParsed);
        // Aquí puedes agregar lógica adicional para manejar la predicción
      } catch (error) {
        console.error('Error al hacer la predicción:', error);
      }
    });

    this.schedulerRegistry.addCronJob(`supermarketCron-${supermarketId}`, job);
    job.start();
  }

  // private validatePredictionResponse(predictionData: any): boolean {

  // }

  private checkTestModeLimit(supermarketId: number): boolean {
    const executions = this.testModeExecutions.get(supermarketId) || 0;
    if (executions >= this.TEST_MODE_LIMIT) {
      console.log(
        `Test mode limit reached for supermarket ${supermarketId}. Changing to daily schedule.`,
      );
      this.updateCronStatus(supermarketId, true, ScheduleFrequency.DAILY);
      return true;
    }
    this.testModeExecutions.set(supermarketId, executions + 1);
    return false;
  }

  private getRandomImageUrl(): string {
    return this.meatImages[Math.floor(Math.random() * this.meatImages.length)];
  }

  private async fetchPrediction(imageUrl: string, handle_file: any) {
    console.log(
      '🚀 ~ SupermarketService ~ fetchPrediction ~ imageUrl:',
      imageUrl,
    );
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();
    const prediction = await this.app.predict('/predict', [
      handle_file(imageBlob),
    ]);
    return prediction.data;
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
    const owner = await this.userService.getUser(supermarket.ownerId);
    if (!owner) {
      throw new NotFoundException(
        `Usuario con ID ${supermarket.ownerId} no encontrado`,
      );
    }

    if (owner.ownedSupermarket) {
      throw new BadRequestException('El usuario ya posee un supermercado');
    }

    const addressStr: CreateAddressDto = supermarket.address;
    const address = this.addressRepo.create(addressStr);
    await this.addressRepo.save(address);

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

    if (supermarketToUpdate.address) {
      await this.addressRepo.save({
        id: supermarketToUpdate.address.id,
        ...supermarketToUpdate.address,
        ...supermarket.address,
      });
    }

    return await this.supermarketRepo.save({
      ...supermarketToUpdate,
      ...supermarket,
    });
  }

  async deleteSupermarket(id: number): Promise<void> {
    const supermarket = await this.getSupermarket(id);

    if (supermarket && supermarket.address) {
      await this.addressRepo.delete(supermarket.address.id);
    }

    await this.supermarketRepo.delete(id);
  }
}
