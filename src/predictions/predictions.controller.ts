import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto, UpdatePredictionDto } from './dto/prediction.dto';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  // Crear una nueva predicción
  @Post()
  create(@Body() createPredictionDto: CreatePredictionDto) {
    return this.predictionsService.create(createPredictionDto);
  }

  // Actualizar una predicción existente
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updatePredictionDto: UpdatePredictionDto,
  ) {
    return this.predictionsService.update(id, updatePredictionDto);
  }
}
