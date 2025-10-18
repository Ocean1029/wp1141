// Controller for handling Theme HTTP requests
import type { Request, Response } from 'express';
import { themeService } from './theme.service';
import {
  createThemeSchema,
  updateThemeSchema,
  themeQuerySchema,
} from './theme.dto';

export class ThemeController {
  /**
   * GET /api/themes
   * Get all themes with optional filtering
   */
  async getAllThemes(req: Request, res: Response) {
    const query = themeQuerySchema.parse(req.query);
    const themes = await themeService.getAllThemes(query);

    res.json({
      success: true,
      count: themes.length,
      data: themes,
    });
  }

  /**
   * GET /api/themes/:id
   * Get a single theme by ID
   */
  async getThemeById(req: Request, res: Response) {
    const { id } = req.params;
    const theme = await themeService.getThemeById(id);

    res.json({
      success: true,
      data: theme,
    });
  }

  /**
   * POST /api/themes
   * Create a new theme
   */
  async createTheme(req: Request, res: Response) {
    const data = createThemeSchema.parse(req.body);
    const theme = await themeService.createTheme(data);

    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
      data: theme,
    });
  }

  /**
   * PUT /api/themes/:id
   * Update an existing theme
   */
  async updateTheme(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateThemeSchema.parse(req.body);
    const theme = await themeService.updateTheme(id, data);

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: theme,
    });
  }

  /**
   * DELETE /api/themes/:id
   * Delete a theme
   */
  async deleteTheme(req: Request, res: Response) {
    const { id } = req.params;
    await themeService.deleteTheme(id);

    res.json({
      success: true,
      message: 'Theme deleted successfully',
    });
  }
}

// Singleton instance
export const themeController = new ThemeController();

