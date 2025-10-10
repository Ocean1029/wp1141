# Seed Data

This directory contains CSV files with seed data for the database.

## Files

### colors.csv

Defines the color palette used throughout the application.

**Columns:**
- `hex_code`: Color hex code (e.g., #FF6B6B)
- `name`: Human-readable color name
- `meaning`: Psychological/emotional meaning of the color

### themes.csv

Defines default theme categories for diary entries.

**Columns:**
- `name`: Theme name
- `description`: Detailed description of the theme
- `color_hex`: Associated color hex code (must exist in colors.csv)

### diaries.csv

Sample diary entries for testing and demonstration.

**Columns:**
- `title`: Diary entry title
- `content`: Full diary content (can be multi-paragraph)

## Usage

### Import seed data

```bash
# Inside the backend container
pnpm run seed

# Or from host machine
docker-compose exec backend pnpm run seed
```

### Reset and reseed database

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start containers (will run init.sql to create tables)
docker-compose up -d

# Wait for database to be ready, then seed
docker-compose exec backend pnpm run seed
```

## Adding New Data

### Adding a new color

1. Edit `colors.csv`
2. Add a new line with hex_code, name, and meaning
3. Run the seed script

### Adding a new theme

1. Make sure the color exists in `colors.csv`
2. Edit `themes.csv`
3. Add a new line with name, description, and color_hex
4. Run the seed script

## CSV Format Notes

- Use commas as delimiters
- Wrap fields containing commas in double quotes
- First row must be the header
- UTF-8 encoding
- Unix line endings (LF)

## Example: Adding a custom color and theme

**colors.csv:**
```csv
#9B59B6,Purple,Represents mystery and spirituality
```

**themes.csv:**
```csv
Spirituality,Thoughts about spiritual experiences and beliefs,#9B59B6
```

Then run:
```bash
pnpm run seed
```

