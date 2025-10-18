// Business logic for Theme operations
import { themeRepository } from './theme.repository';
import { AppError } from '../../shared/errors/AppError';
import type { CreateThemeDto, UpdateThemeDto, ThemeQueryDto } from './theme.dto';

export class ThemeService {
  /**
   * Get all themes with optional filtering
   */
  async getAllThemes(query: ThemeQueryDto) {
    return themeRepository.findAll(query);
  }

  /**
   * Get a single theme by ID
   */
  async getThemeById(id: string) {
    const theme = await themeRepository.findById(id);

    if (!theme) {
      throw new AppError('Theme not found', 404);
    }

    return theme;
  }

  /**
   * Create a new theme
   */
  async createTheme(data: CreateThemeDto) {
    // Check if theme name already exists
    const nameExists = await themeRepository.existsByName(data.name);
    if (nameExists) {
      throw new AppError('Theme with this name already exists', 409);
    }

    return themeRepository.create(data);
  }

  /**
   * Update an existing theme
   */
  async updateTheme(id: string, data: UpdateThemeDto) {
    // Check if theme exists
    const exists = await themeRepository.exists(id);
    if (!exists) {
      throw new AppError('Theme not found', 404);
    }

    // If updating name, check for uniqueness
    if (data.name) {
      const nameExists = await themeRepository.existsByName(data.name, id);
      if (nameExists) {
        throw new AppError('Theme with this name already exists', 409);
      }
    }

    return themeRepository.update(id, data);
  }

  /**
   * Delete a theme
   */
  async deleteTheme(id: string) {
    // Check if theme exists
    const exists = await themeRepository.exists(id);
    if (!exists) {
      throw new AppError('Theme not found', 404);
    }

    // Note: Segments will have their themeId set to null due to onDelete: SetNull
    await themeRepository.delete(id);
  }
}

// Singleton instance
export const themeService = new ThemeService();

