import { Prediction } from './prediction.entity';

describe('PredictionEntity', () => {
  it('debe definirse', () => {
    expect(new Prediction()).toBeDefined();
  });

  it('debería tener las propiedades predeterminadas correctas', () => {
    const prediction = new Prediction();

    expect(prediction).toHaveProperty('id');
    expect(prediction).toHaveProperty('supermercado');
    expect(prediction).toHaveProperty('fresco');
    expect(prediction).toHaveProperty('mediofresco');
    expect(prediction).toHaveProperty('vencido');
    expect(prediction).toHaveProperty('fecha');
  });
});
