import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto, UpdatePredictionDto } from './dto/prediction.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get()
  getPredictionsBySupermarket(@Param('id') id: number) {
    return this.predictionsService.getPredictionsBySupermarket(id);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Prediction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPredictionDto: CreatePredictionDto) {
    return this.predictionsService.create(createPredictionDto);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Prediction updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: number,
    @Body() updatePredictionDto: UpdatePredictionDto,
  ) {
    return this.predictionsService.update(id, updatePredictionDto);
  }
}
