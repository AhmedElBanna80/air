# Air Quality Monitoring System

This monorepo contains a full-stack application for air quality monitoring, with data upload, processing, and visualization capabilities.

## Repository Structure

- `/apps/api` - Backend API built with Hono, TypeScript, and PostgreSQL with TimescaleDB
- `/apps/web` - Frontend application built with React and TypeScript

## Features

- CSV data uploading for air quality measurements
- Data processing with dependency injection
- Time series visualization with interactive charts
- Parameter filtering and date range selection
- PostgreSQL with TimescaleDB for efficient time-series data storage

## Prerequisites

- Node.js (>= 16)
- pnpm
- Docker and Docker Compose

## Getting Started

### 1. Install Dependencies

First, install all dependencies using pnpm:

```bash
# At the root of the monorepo
pnpm install
```

### 2. Start the Database

The application uses PostgreSQL with TimescaleDB extension for time-series data. Start the database using Docker Compose:

```bash
# Navigate to the API directory
cd apps/api

# Start the database container
docker-compose up -d
```

This will start PostgreSQL with TimescaleDB on port 5432 and initialize the required tables and extensions.

### 3. Start the Development Servers

#### Start the API server:

```bash
# In the api directory
cd apps/api
pnpm dev
```

The API will be available at http://localhost:3001.

#### Start the Web application:

```bash
# In a new terminal, navigate to the web directory
cd apps/web
pnpm dev
```

The web application will be available at http://localhost:3000.

## Using the Application

### 1. Upload Air Quality Data

1. Open the web application at http://localhost:3000
2. Navigate to the Upload page
3. Click on "Choose File" and select a CSV file containing air quality data
4. Click "Upload" to upload and process the file
5. Wait for the confirmation message indicating successful upload

The CSV file should have the following columns:
- Date (DD/MM/YYYY)
- Time (HH.MM.SS)
- CO(GT) - Carbon monoxide ground truth
- PT08.S1(CO) - PT08.S1 sensor response for CO
- NMHC(GT) - Non-methane hydrocarbons ground truth
- C6H6(GT) - Benzene ground truth
- PT08.S2(NMHC) - PT08.S2 sensor response for NMHC
- NOx(GT) - Nitrogen oxides ground truth
- PT08.S3(NOx) - PT08.S3 sensor response for NOx
- NO2(GT) - Nitrogen dioxide ground truth
- PT08.S4(NO2) - PT08.S4 sensor response for NO2
- PT08.S5(O3) - PT08.S5 sensor response for O3
- T - Temperature
- RH - Relative Humidity
- AH - Absolute Humidity

### 2. View Air Quality Charts

1. After uploading data, navigate to the Charts page
2. Select a date range to view the data
3. Choose parameters to display from the dropdown menu
4. The chart will display the selected parameters over time
5. Hover over data points to see exact values

## Development

### API Environment Variables

The API uses the following environment variables (defined in `/apps/api/.env`):

```
PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=airquality
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=air-quality-data
```

### Adding New Components

The web application uses shadcn/ui components. To add new components, use:

```bash
cd apps/web
pnpx shadcn@canary add button
```

### Running Tests

```bash
# Run API tests
cd apps/api
pnpm test

# Run web tests
cd apps/web
pnpm test
```

## Troubleshooting

- If you encounter database connection issues, make sure the Docker container is running: `docker ps`
- For "Module not found" errors, try running `pnpm install` again
- If uploads fail, check the API logs for detailed error messages

## License

MIT
