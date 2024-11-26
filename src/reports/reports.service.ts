// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment';
import { Response } from 'express';
import { Sale } from 'src/sales/entities/sale.entity';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { Prediction } from 'src/predictions/entities/prediction.entity';
import { Product } from 'src/products/entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Camera } from 'src/cameras/entity/camera.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Camera)
    private cameraRepository: Repository<Camera>,
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private supermarketService: SupermarketService,
  ) {}

  async getSalesReport(filters: ReportFiltersDto) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.user', 'user')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .where('sale.supermarketId = :supermarketId', {
        supermarketId: filters.supermarketId,
      });

    if (filters.userId) {
      query.andWhere('sale.userId = :userId', { userId: filters.userId });
    }

    if (filters.productId) {
      query.andWhere('saleItems.productId = :productId', {
        productId: filters.productId,
      });
    }

    if (filters.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('sale.date BETWEEN :startDate AND :endDate', {
        startDate: moment(filters.startDate).startOf('day').toDate(),
        endDate: moment(filters.endDate).endOf('day').toDate(),
      });
    }

    return query.getMany();
  }

  async generateSalesReportPDF(filters: ReportFiltersDto, response: Response) {
    const sales = await this.getSalesReport(filters);
    const supermarket = await this.supermarketService.getSupermarket(
      filters.supermarketId,
    );

    const doc = new PDFDocument({ margin: 50 });
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=report_${filters.startDate ? moment(filters.startDate).format('YYYY-MM-DD') : 'all'}_to_${filters.endDate ? moment(filters.endDate).format('YYYY-MM-DD') : 'all'}.pdf`,
    );

    doc.pipe(response);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`Reporte de Ventas del Supermercado "${supermarket.name}"`, {
        align: 'center',
      });

    if (filters.startDate && filters.endDate) {
      doc
        .fontSize(14)
        .font('Helvetica')
        .text(
          `Del ${moment(filters.startDate).format('DD/MM/YYYY')} al ${moment(filters.endDate).format('DD/MM/YYYY')}`,
          { align: 'center' },
        );
    } else {
      doc
        .fontSize(14)
        .font('Helvetica')
        .text('Reporte general (sin rango de fechas)', { align: 'center' });
    }
    doc.moveDown(2);

    if (sales.length === 0) {
      doc
        .fontSize(14)
        .text(
          'No se encontraron ventas en el rango de fechas o filtros proporcionados.',
          {
            align: 'center',
          },
        );
      doc.end();
      return;
    }

    sales.forEach((sale, index) => {
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`Venta #${index + 1}`);
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Usuario: ${sale.user.getFullName()}`);
      doc.text(`Fecha: ${moment(sale.date).format('DD/MM/YYYY HH:mm:ss')}`);
      doc.text(`Total: $${sale.totalPrice}`);
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Productos vendidos:');
      sale.saleItems.forEach((item) => {
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(
            `- ${item.product.name}: ${item.quantity} unidades a $${item.product.price} cada una`,
          );
      });

      doc.moveDown(1);
      doc
        .strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(1);
    });

    doc.end();
  }

  async getLeastSoldProducts(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .select('product.id', 'id_producto')
      .addSelect('product.name', 'nombre')
      .addSelect('SUM(saleItems.quantity)', 'cantidad') // Cambiado el alias
      .where('sale.supermarketId = :supermarketId', { supermarketId });

    if (startDate && endDate) {
      query.andWhere('sale.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query
      .addSelect('SUM(saleItems.quantity * product.unitCost)', 'totalCostos')
      .groupBy('product.id, product.name') // Agregado product.name al groupBy
      .orderBy('cantidad', 'ASC'); // Usando el nuevo alias

    return query.getRawMany();
  }

  async getMostSoldProducts(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .select('product.id', 'id_producto')
      .addSelect('product.name', 'nombre_producto')
      .addSelect('SUM(saleItems.quantity)', 'cantidad') // Cambiado el alias
      .where('sale.supermarketId = :supermarketId', { supermarketId });

    if (startDate) {
      query.andWhere('sale.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('sale.date <= :endDate', { endDate });
    }

    query
      .addSelect('SUM(saleItems.quantity * product.unitCost)', 'totalCostos')
      .groupBy('product.id, product.name') // Agregado product.name al groupBy
      .orderBy('cantidad', 'DESC'); // Usando el nuevo alias

    return query.getRawMany();
  }

  async getTotalProfits(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.saleItems', 'saleItems')
      .leftJoin('saleItems.product', 'product')
      .select('SUM(saleItems.quantity * product.price)', 'total_ingresos')
      .addSelect('SUM(saleItems.quantity * product.unitCost)', 'total_costos')
      .where('sale.supermarketId = :supermarketId', { supermarketId });

    if (startDate) {
      query.andWhere('sale.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('sale.date <= :endDate', { endDate });
    }

    const result = await query.getRawOne();
    const ganancias_netas =
      parseFloat(result.total_ingresos) - parseFloat(result.total_costos);

    return {
      total_ingresos: parseFloat(result.total_ingresos),
      total_costos: parseFloat(result.total_costos),
      ganancias_netas,
    };
  }

  async getMeatFreshnessStatus(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.cameraRepository
      .createQueryBuilder('camera')
      .innerJoin('camera.category', 'category') // Relación con la categoría
      .leftJoin('camera.predictions', 'prediction') // Relación con las predicciones
      .select('camera.id', 'cameraId') // ID de la cámara
      .addSelect('camera.name', 'cameraName') // Nombre de la cámara
      .addSelect('category.name', 'categoryName') // Nombre del corte asociado
      .addSelect(
        `SUM(CASE WHEN prediction.result = 'Fresh' THEN 1 ELSE 0 END)`,
        'freshCount',
      ) // Total de Fresh
      .addSelect(
        `SUM(CASE WHEN prediction.result = 'Half-fresh' THEN 1 ELSE 0 END)`,
        'halfFreshCount',
      ) // Total de Half-fresh
      .addSelect(
        `SUM(CASE WHEN prediction.result = 'Spoiled' THEN 1 ELSE 0 END)`,
        'spoiledCount',
      ) // Total de Spoiled
      .where('camera.supermarketId = :supermarketId', { supermarketId });

    if (startDate) {
      query.andWhere('prediction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('prediction.createdAt <= :endDate', { endDate });
    }

    query
      .groupBy('camera.id') // Agrupar por cámara
      .addGroupBy('camera.name') // Agrupar por nombre de cámara
      .addGroupBy('category.name'); // Agrupar por categoría asociada

    return query.getRawMany();
  }

  async getProductsByUser(
    supermarketId: number,
    userId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    return await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.user', 'user')
      .leftJoin('sale.saleItems', 'saleItems')
      .leftJoin('saleItems.product', 'product')
      .select(
        `
        "user"."id" AS "id_usuario",
        CONCAT("user"."firstName", ' ', "user"."lastName") AS "nombre_usuario",
        "product"."id" AS "id_producto",
        "product"."name" AS "nombre_producto",
        SUM("saleItems"."quantity") AS "total_vendido"
      `,
      )
      .where('sale.supermarketId = :supermarketId', { supermarketId })
      .andWhere(
        userId ? 'sale.userId = :userId' : '1=1',
        userId ? { userId } : {},
      )
      .andWhere(
        startDate ? 'sale.date >= :startDate' : '1=1',
        startDate ? { startDate } : {},
      )
      .andWhere(
        endDate ? 'sale.date <= :endDate' : '1=1',
        endDate ? { endDate } : {},
      )
      .groupBy(
        '"user"."id", "user"."firstName", "user"."lastName", "product"."id", "product"."name"',
      )
      .getRawMany();
  }

  async getProductsByCategory(supermarketId: number) {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('category.id', 'id_categoria')
      .addSelect('category.name', 'categoria')
      .addSelect('COUNT(product.id)', 'cantidad_productos')
      .where('product.supermarketId = :supermarketId', { supermarketId })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .getRawMany();
  }

  async getInventoryRotation(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.saleItems', 'saleItems')
      .leftJoin('saleItems.product', 'product')
      .leftJoin('product.inventory', 'inventory')
      .select('product.name', 'nombre_producto')
      .addSelect('product.id', 'id_producto')
      .addSelect('SUM(saleItems.quantity)', 'total_vendidos')
      .addSelect('inventory.stock', 'stock_actual')
      .addSelect(
        'CASE WHEN inventory.stock > 0 THEN CAST(SUM(saleItems.quantity) AS FLOAT) / CAST(inventory.stock AS FLOAT) ELSE 0 END',
        'porcentaje_rotacion',
      )
      .where('sale.supermarketId = :supermarketId', { supermarketId });

    if (startDate) {
      query.andWhere('sale.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('sale.date <= :endDate', { endDate });
    }

    return query
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('inventory.stock')
      .orderBy('"porcentaje_rotacion"', 'DESC')
      .getRawMany();
  }

  async getMeatStatusSummary(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.predictionRepository
      .createQueryBuilder('prediction')
      .select('prediction.result', 'status')
      .addSelect('COUNT(prediction.id)', 'cantidad')
      .addSelect(`TO_CHAR(prediction.createdAt, 'YYYY-MM') AS fecha`)
      .where('prediction.supermarketId = :supermarketId', { supermarketId });

    if (startDate) {
      query.andWhere('prediction.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('prediction.createdAt <= :endDate', { endDate });
    }

    return query
      .groupBy('prediction.result')
      .addGroupBy('fecha')
      .orderBy('fecha', 'DESC')
      .addOrderBy('cantidad', 'DESC')
      .getRawMany();
  }

  async getSpoiledMeatAnalysis(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.predictionRepository
      .createQueryBuilder('prediction')
      .select([
        `CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE COUNT(CASE WHEN prediction.result = 'Spoiled' THEN 1 END)::float / COUNT(*)::float * 100 
         END AS spoiledPercentage`, // Evita la división por cero
        'COUNT(*) AS totalPredictions',
        `COUNT(CASE WHEN prediction.result = 'Spoiled' THEN 1 END) AS spoiledCount`,
        'AVG(prediction.spoiled) AS avgSpoiledConfidence',
        `COUNT(CASE WHEN prediction.result = 'Half-fresh' THEN 1 END) AS halfFreshCount`,
        'AVG(prediction.halfFresh) AS avgHalfFreshConfidence',
        `COUNT(CASE WHEN prediction.result = 'Fresh' THEN 1 END) AS freshCount`,
        'AVG(prediction.fresh) AS avgFreshConfidence',
      ])
      .where('prediction.supermarketId = :supermarketId', { supermarketId });

    if (startDate) {
      query.andWhere('prediction.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('prediction.createdAt <= :endDate', { endDate });
    }

    return query.getRawOne();
  }

  async getMeatQualityTrend(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const results = await this.predictionRepository
      .createQueryBuilder('prediction')
      .select([
        `TO_CHAR(prediction.createdAt, 'YYYY-MM-DD') AS "date"`,
        'prediction.result AS "status"',
        'COUNT(prediction.id) AS "count"',
        'AVG(prediction.spoiled) AS "avgSpoiledConfidence"',
        'AVG(prediction.fresh) AS "avgFreshConfidence"',
        'AVG(prediction.halfFresh) AS "avgHalfFreshConfidence"',
      ])
      .where('prediction.supermarketId = :supermarketId', { supermarketId })
      .andWhere(
        new Brackets((qb) => {
          if (startDate)
            qb.andWhere('prediction.createdAt >= :startDate', { startDate });
          if (endDate)
            qb.andWhere('prediction.createdAt <= :endDate', { endDate });
        }),
      )
      .groupBy('"date"')
      .addGroupBy('prediction.result')
      .orderBy('"date"', 'DESC')
      .getRawMany();

    // Si no hay datos, devolver valores predeterminados
    if (results.length === 0) {
      return [
        {
          date: startDate ? moment(startDate).format('YYYY-MM-DD') : 'N/A',
          status: 'Spoiled',
          count: 0,
          avgSpoiledConfidence: 0,
          avgFreshConfidence: 0,
          avgHalfFreshConfidence: 0,
        },
        {
          date: startDate ? moment(startDate).format('YYYY-MM-DD') : 'N/A',
          status: 'Fresh',
          count: 0,
          avgSpoiledConfidence: 0,
          avgFreshConfidence: 0,
          avgHalfFreshConfidence: 0,
        },
        {
          date: startDate ? moment(startDate).format('YYYY-MM-DD') : 'N/A',
          status: 'Half-fresh',
          count: 0,
          avgSpoiledConfidence: 0,
          avgFreshConfidence: 0,
          avgHalfFreshConfidence: 0,
        },
      ];
    }

    return results;
  }

  async getCostsReport(
    supermarketId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.saleItems', 'saleItems')
      .leftJoin('saleItems.product', 'product')
      .select('product.id', 'id_producto')
      .addSelect('product.name', 'nombre_producto')
      .addSelect('SUM(saleItems.quantity)', 'cantidad_vendida')
      .addSelect('SUM(saleItems.quantity * product.unitCost)', 'costo_total')
      .where('sale.supermarketId = :supermarketId', { supermarketId });

    if (startDate) {
      query.andWhere('sale.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('sale.date <= :endDate', { endDate });
    }

    query.groupBy('product.id, product.name');
    return query.getRawMany();
  }

  async getProductsWithCriticalStock(supermarketId: number) {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoin('inventory.product', 'product')
      .select([
        'product.name as nombre_producto',
        'inventory.stock as stock_actual',
      ])
      .where('inventory.supermarketId = :supermarketId', { supermarketId })
      .andWhere('inventory.stock <= :criticalLevel', { criticalLevel: 10 })
      .getRawMany();
  }

  async generateCompleteReportPDF(
    filters: ReportFiltersDto,
    response: Response,
  ) {
    const supermarket = await this.supermarketService.getSupermarket(
      filters.supermarketId,
    );
    const doc = new PDFDocument({ margin: 50 });

    // Configure response headers
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=complete_report_${moment().format('YYYY-MM-DD')}.pdf`,
    );
    doc.pipe(response);

    // Title
    doc
      .fontSize(20)
      .font('Courier-Bold')
      .text(`Reporte Completo - ${supermarket.name}`, { align: 'center' });
    doc.moveDown(2);

    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    // Get all report data
    const [
      mostSoldProducts,
      profits,
      meatStatus,
      productsByUser,
      leastSoldProducts,
      criticalStock,
      productsByCategory,
      inventoryRotation,
      meatStatusSummary,
    ] = await Promise.all([
      this.getMostSoldProducts(filters.supermarketId, startDate, endDate),
      this.getTotalProfits(filters.supermarketId, startDate, endDate),
      this.getMeatFreshnessStatus(filters.supermarketId, startDate, endDate),
      this.getProductsByUser(
        filters.supermarketId,
        filters.userId,
        startDate,
        endDate,
      ),
      this.getLeastSoldProducts(filters.supermarketId, startDate, endDate),
      this.getProductsWithCriticalStock(filters.supermarketId),
      this.getProductsByCategory(filters.supermarketId),
      this.getInventoryRotation(filters.supermarketId, startDate, endDate),
      this.getMeatStatusSummary(filters.supermarketId, startDate, endDate),
    ]);

    // Add each section to the PDF
    this.addSectionToPDF(doc, 'Productos Más Vendidos', mostSoldProducts);
    this.addSectionToPDF(doc, 'Ganancias Totales', [profits]);
    this.addSectionToPDF(doc, 'Estado de Frescura de Carnes', meatStatus);
    this.addSectionToPDF(doc, 'Productos por Usuario', productsByUser);
    this.addSectionToPDF(doc, 'Productos Menos Vendidos', leastSoldProducts);
    this.addSectionToPDF(doc, 'Productos con Stock Crítico', criticalStock);
    this.addSectionToPDF(doc, 'Productos por Categoría', productsByCategory);
    this.addSectionToPDF(doc, 'Rotación de Inventario', inventoryRotation);
    this.addSectionToPDF(doc, 'Resumen de Estado de Carnes', meatStatusSummary);

    doc.end();
  }

  private addSectionToPDF(doc: PDFKit.PDFDocument, title: string, data: any[]) {
    doc.addPage();
    doc.fontSize(18).font('Courier-Bold').text(title, { align: 'left' }); // Alinear título a la izquierda
    doc.moveDown(1);

    if (!data || data.length === 0) {
      doc.fontSize(14).font('Courier').text('No hay datos disponibles', {
        align: 'center', // Alinear mensaje también a la izquierda
      });
      return;
    }

    const keys = Object.keys(data[0]);
    const columnWidth = (doc.page.width - 100) / keys.length;

    // Encabezados
    doc.fontSize(14).font('Courier-Bold');
    keys.forEach((key, i) => {
      doc.text(key, 50 + i * columnWidth, doc.y, {
        width: columnWidth,
        align: 'left',
        underline: true,
      });
    });

    doc.moveDown(1);

    // Línea horizontal bajo los encabezados
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor('black')
      .stroke();
    doc.moveDown(0.5);

    // Filas de datos
    data.forEach((row, rowIndex) => {
      const rowStart = doc.y;
      doc.fontSize(12).font('Courier');
      keys.forEach((key, i) => {
        doc.text(row[key]?.toString() || '', 50 + i * columnWidth, rowStart, {
          width: columnWidth,
          align: 'left',
        });
      });

      // Línea divisoria bajo cada fila de datos
      if (rowIndex < data.length - 1) {
        doc
          .moveTo(50, doc.y + 10)
          .lineTo(doc.page.width - 50, doc.y + 10)
          .strokeColor('gray')
          .stroke();
      }

      doc.moveDown(1);
    });

    doc.moveDown(3); // Añade más espacio al final de cada sección para separarlas mejor
  }
}
