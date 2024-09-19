import { PredictionEntity } from './prediction.entity';

describe('PredictionEntity', () => {
  it('should be defined', () => {
    expect(new PredictionEntity()).toBeDefined();
  });

  it('should have the correct default properties', () => {
    const prediction = new PredictionEntity();

    expect(prediction).toHaveProperty('id');
    expect(prediction).toHaveProperty('supermarket');
    expect(prediction).toHaveProperty('fresh');
    expect(prediction).toHaveProperty('halfFresh');
    expect(prediction).toHaveProperty('soiled');
    expect(prediction).toHaveProperty('fecha');
  });
});
