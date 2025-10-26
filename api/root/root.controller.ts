import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@ApiTags('root')
@Controller()
export class RootController {
  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'API information retrieved successfully' })
  getHealth() {
    return {
      status: 'ok',
      message: 'MeTime API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/auth',
        users: '/users',
        companies: '/companies',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  getHealthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('test-uploads')
  @ApiOperation({ summary: 'Test uploads directory access' })
  @ApiResponse({ status: 200, description: 'Uploads directory test' })
  testUploads(@Res() res: Response) {
    const uploadsPath = join(process.cwd(), 'uploads');
    const servicesPath = join(uploadsPath, 'services');
    const thumbnailsPath = join(servicesPath, 'thumbnails');
    
    const result = {
      uploadsPath,
      servicesPath,
      thumbnailsPath,
      uploadsExists: existsSync(uploadsPath),
      servicesExists: existsSync(servicesPath),
      thumbnailsExists: existsSync(thumbnailsPath),
      files: []
    };

    // List files in services directory
    if (result.servicesExists) {
      const fs = require('fs');
      try {
        result.files = fs.readdirSync(servicesPath);
      } catch (error) {
        result.files = ['Error reading directory'];
      }
    }

    res.json(result);
  }
}
