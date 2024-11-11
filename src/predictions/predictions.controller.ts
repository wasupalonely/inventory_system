import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto, UpdatePredictionDto } from './dto/prediction.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';

@ApiTags('Predictions')
@Controller('predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Roles(Role.Admin, Role.Owner, Role.Viewer)
  @Get('supermarket/:id')
  @ApiResponse({ status: 200, description: 'Predictions found successfully' })
  @ApiResponse({ status: 404, description: 'Supermarket not found' })
  getPredictionsBySupermarket(@Param('id') id: number) {
    return this.predictionsService.getPredictionsBySupermarket(id);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Prediction found successfully' })
  @ApiResponse({ status: 404, description: 'Prediction not found' })
  getPrediction(@Param('id') id: number) {
    return this.predictionsService.getById(id);
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
