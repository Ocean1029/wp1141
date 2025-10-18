// Controller for handling Color HTTP requests
import type { Request, Response } from 'express';
import { colorService } from './color.service';
import {
  createColorSchema,
  updateColorSchema,
  colorQuerySchema,
} from './color.dto';

export class ColorController {
  /**
   * GET /api/colors
   * Get all colors with optional search
   */
  async getAllColors(req: Request, res: Response) {
    const query = colorQuerySchema.parse(req.query);
    const colors = await colorService.getAllColors(query);

    res.json({
      success: true,
      count: colors.length,
      data: colors,
    });
  }

  /**
   * GET /api/colors/:id
   * Get a single color by ID
   */
  async getColorById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid color ID',
      });
      return;
    }

    const color = await colorService.getColorById(id);

    res.json({
      success: true,
      data: color,
    });
  }

  /**
   * POST /api/colors
   * Create a new color
   */
  async createColor(req: Request, res: Response) {
    const data = createColorSchema.parse(req.body);
    const color = await colorService.createColor(data);

    res.status(201).json({
      success: true,
      message: 'Color created successfully',
      data: color,
    });
  }

  /**
   * PUT /api/colors/:id
   * Update an existing color
   */
  async updateColor(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid color ID',
      });
      return;
    }

    const data = updateColorSchema.parse(req.body);
    const color = await colorService.updateColor(id, data);

    res.json({
      success: true,
      message: 'Color updated successfully',
      data: color,
    });
  }

  /**
   * DELETE /api/colors/:id
   * Delete a color
   */
  async deleteColor(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid color ID',
      });
      return;
    }

    await colorService.deleteColor(id);

    res.json({
      success: true,
      message: 'Color deleted successfully',
    });
  }
}

// Singleton instance
export const colorController = new ColorController();

