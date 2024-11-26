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
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateNotificationDto } from 'src/notifications/dto/notification.dto';
import { ConfigService } from '@nestjs/config';
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
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160684/z2a3dsj8ko57bvjzkxpj.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160684/hkiadmvus3iiwyngzhqm.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160684/t02oeeijuuh5zq2iksu4.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160684/pmhstzcwt7l44r3by9el.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160684/eunuaivdsaasxa2rqd9z.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160684/oudlhu0oizwvww68ejtl.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160683/fqbbhlg998mrp5iihrhs.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160683/rdhpq1hzs6jutxj6pol2.jpg',
    'https://res.cloudinary.com/dzkeyfsjm/image/upload/v1732160683/bkybk624txh1ormnwrhw.jpg',
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
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const { Client } = await importDynamic('@gradio/client');
    this.app = await Client.connect('ItsEnder/freshness_detection');
    const supermarkets = await this.findAllWithCronEnabled();

    supermarkets.forEach((supermarket) => {
      this.startOrUpdateCronJob(supermarket.id);
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
      relations: [
        'address',
        'owner',
        'categories',
        'users',
        'cameras.category',
      ],
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
    const supermarket = await this.getSupermarket(supermarketId);

    await this.supermarketRepo.update(supermarketId, {
      cronjobEnabled,
      scheduleFrequency:
        supermarket.testModeUsed &&
        scheduleFrequency === ScheduleFrequency.EVERY_MINUTE
          ? ScheduleFrequency.DAILY
          : scheduleFrequency,
      startTime: new Date(),
    });

    if (cronjobEnabled) {
      if (!supermarket.cameras || supermarket.cameras.length === 0) {
        throw new BadRequestException(
          `El supermercado con ID ${supermarketId} no tiene camaras instaladas. Instala al menos una camara para activar las predicciones.`,
        );
      } else {
        await this.startOrUpdateCronJob(supermarketId);
      }
    } else {
      this.stopCronJobIfExists(supermarketId);
    }
  }

  async startOrUpdateCronJob(supermarketId: number) {
    const supermarket = await this.getSupermarket(supermarketId);

    const cronExpression = this.getCronExpression(
      supermarket.scheduleFrequency,
      supermarket.startTime,
    );

    this.stopCronJobIfExists(supermarketId);

    const job = new CronJob(cronExpression, async () => {
      console.log(
        `Cronjob ejecutado para el supermercado con ID: ${supermarketId} a las ${moment().format('HH:mm:ss')}`,
      );

      if (
        supermarket.scheduleFrequency === ScheduleFrequency.EVERY_MINUTE &&
        this.checkTestModeLimit(supermarketId)
      ) {
        console.log(
          `Límite de modo de prueba alcanzado para supermercado ${supermarketId}. Cambiando a DAILY.`,
        );
        await this.updateSupermarket(supermarketId, {
          testModeUsed: true,
        });

        await this.updateCronStatus(
          supermarketId,
          true,
          ScheduleFrequency.DAILY,
        );
        return;
      }

      try {
        const randomImageUrl = this.getRandomImageUrl();
        const predictionData = await this.fetchPrediction(randomImageUrl);

        const randomCamera =
          supermarket.cameras[
            Math.floor(Math.random() * supermarket.cameras.length)
          ];

        const cameraSection = randomCamera.category.name;

        const predictionToSave: PredictionResponse = predictionData[0];
        const predictionParsed: CreatePredictionDto = {
          cameraId: randomCamera.id,
          image: randomImageUrl,
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

        const prediction =
          await this.predictionsService.create(predictionParsed);

        if (
          prediction.result === 'Spoiled' ||
          prediction.result === 'Half-fresh'
        ) {
          const notification: CreateNotificationDto = {
            predictionId: prediction.id,
            supermarketId: prediction.supermarket.id,
            title: 'Alerta de frescura en tu carne',
            message: `Notamos algo extraño en tu sección de existencias de carne el día ${moment(prediction.createdAt).format('dddd, D [de] MMMM [a las] h:mm a')} en tu sección de ${cameraSection}, ¡Revisa tus existencias!`,
          };

          const predictionDetailUrl = `${this.configService.get('CLIENT_URL')}/dashboard/predictions?predictionId=${prediction.id}`;

          const mailToSend: {
            to: string;
            subject: string;
            text?: string;
            html?: string;
          } = {
            subject: 'Alerta de frescura en tu carne',
            to: supermarket.owner.email,
            // text: `Notamos algo extraño en tu sección de existencias de carne el dia ${moment(prediction.createdAt).format('dddd, D [de] MMMM [a las] h:mm a')}, ¡Revisa tus existencias!`,
            html: `<h1>Hola! ${supermarket.owner.firstName}</h1>
      <p>Notamos que en tu sección de carnes hay algo extraño el día ${moment(
        prediction.createdAt,
      )
        .subtract(5, 'hours')
        .locale('es')
        .format('dddd, D [de] MMMM [a las] h:mm a')
        .replace(/^\w/, (c) =>
          c.toUpperCase(),
        )} en tu sección de ${cameraSection}. Por favor, revisa el estado de las existencias y toma las medidas necesarias.</p>
        <p>Puedes revisar acá los detalles de la alerta <a href="${predictionDetailUrl}" style="color: #1a73e8; text-decoration: none;">Haciendo clic aquí</a></p>
      `,
          };
          await this.notificationsService.createNotification(
            notification,
            mailToSend,
          );
        }
      } catch (error) {
        console.error('Error al hacer la predicción:', error);
      }
    });

    this.schedulerRegistry.addCronJob(`supermarketCron-${supermarketId}`, job);
    job.start();
  }

  private async stopCronJobIfExists(supermarketId: number) {
    const jobName = `supermarketCron-${supermarketId}`;
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      const existingJob = this.schedulerRegistry.getCronJob(jobName);
      existingJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
      console.log(`Cronjob ${jobName} detenido y eliminado.`);
      await this.updateSupermarket(supermarketId, {
        testModeUsed: true,
      });
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

  // async startCronJob(supermarketId: number) {
  //   const { handle_file } = await importDynamic('@gradio/client');
  //   const supermarket = await this.getSupermarket(supermarketId);
  //   const cronExpression = this.getCronExpression(
  //     supermarket.scheduleFrequency,
  //     supermarket.startTime,
  //   );

  //   const job = new CronJob(cronExpression, async () => {
  //     console.log(
  //       `Cronjob ejecutado para el supermercado con ID: ${supermarketId} a las ${moment().format('HH:mm:ss')}`,
  //     );

  //     if (
  //       supermarket.scheduleFrequency === ScheduleFrequency.EVERY_MINUTE &&
  //       this.checkTestModeLimit(supermarketId)
  //     ) {
  //       console.log('entraaa');
  //       return;
  //     }

  //     try {
  //       const randomImageUrl = this.getRandomImageUrl();
  //       const predictionData = await this.fetchPrediction(
  //         randomImageUrl,
  //         handle_file,
  //       );

  //       console.log('PREDICTION ---->', predictionData[0]);
  //       const predictionToSave: PredictionResponse = predictionData[0];

  //       const predictionParsed: CreatePredictionDto = {
  //         supermarketId,
  //         result: predictionToSave.label,
  //         fresh: predictionToSave.confidences.find(
  //           (confidence) => confidence.label === 'Fresh',
  //         ).confidence,
  //         halfFresh: predictionToSave.confidences.find(
  //           (confidence) => confidence.label === 'Half-fresh',
  //         ).confidence,
  //         spoiled: predictionToSave.confidences.find(
  //           (confidence) => confidence.label === 'Spoiled',
  //         ).confidence,
  //       };
  //       console.log(
  //         '🚀 ~ SupermarketService ~ job ~ predictionParsed:',
  //         predictionParsed,
  //       );

  //       await this.predictionsService.create(predictionParsed);
  //       // Aquí puedes agregar lógica adicional para manejar la predicción
  //     } catch (error) {
  //       console.error('Error al hacer la predicción:', error);
  //     }
  //   });

  //   this.schedulerRegistry.addCronJob(`supermarketCron-${supermarketId}`, job);
  //   job.start();
  // }

  // private validatePredictionResponse(predictionData: any): boolean {

  // }

  private checkTestModeLimit(supermarketId: number): boolean {
    const executions = this.testModeExecutions.get(supermarketId) || 0;
    if (executions >= this.TEST_MODE_LIMIT) {
      // Actualiza la frecuencia a DAILY y reinicia el cronjob con la nueva frecuencia
      this.updateCronStatus(supermarketId, true, ScheduleFrequency.DAILY);
      return true;
    }
    this.testModeExecutions.set(supermarketId, executions + 1);
    return false;
  }

  private async fetchPrediction(imageUrl: string) {
    const { handle_file } = await importDynamic('@gradio/client');
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();
    const prediction = await this.app.predict('/predict', [
      handle_file(imageBlob),
    ]);
    return prediction.data;
  }

  private getRandomImageUrl(): string {
    return this.meatImages[Math.floor(Math.random() * this.meatImages.length)];
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
