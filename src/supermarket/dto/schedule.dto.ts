import { IsEnum } from 'class-validator';
import { ScheduleFrequency } from 'src/shared/enums/schedule-frequency';

export class ScheduleFrequencyDto {
  @IsEnum(ScheduleFrequency, {
    message:
      'scheduleFrequency debe ser uno de los siguientes valores: ' +
      Object.values(ScheduleFrequency).join(', '),
  })
  scheduleFrequency: ScheduleFrequency;
}
