import { PartialType } from '@nestjs/mapped-types';
import { CreatePredictionDto } from '../CreatePredictionDto/create-prediction.dto';


export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {}