export class CreatePredictionDto {
    supermarket_id: number; // Relación con Supermarket
    fresh: number;
    halfFresh: number;
    soiled: number;
    fecha: Date;
  }