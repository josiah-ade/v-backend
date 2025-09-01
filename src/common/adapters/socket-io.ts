


import { AllConfigType } from '@/config/config.type';
import { INestApplication, Injectable, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

@Injectable()
export class SocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIoAdapter.name);

  constructor(
    private readonly app: INestApplication,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const origins = this.configService.getOrThrow('app.corsOrigin', {
      infer: true,
    });

    this.logger.log(`Creating Socket.IO server on port ${port}`);
    this.logger.log(`CORS origins: ${JSON.stringify(origins)}`);

    const cors = {
      origin: origins,
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    const serverOptions: ServerOptions = {
      ...options,
      cors,
      transports: ['websocket'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
      upgradeTimeout: 10000,
      allowUpgrades: false, 
      perMessageDeflate: {
        threshold: 1024,
        zlibDeflateOptions: {
          level: 3,
          concurrency: 10,
        },
        zlibInflateOptions: {
          level: 3,
        },
      },
    };

    this.logger.log(`Socket.IO server options: ${JSON.stringify({
      ...serverOptions,
      cors: { ...cors, origin: Array.isArray(origins) ? `[${origins.length} origins]` : origins }
    }, null, 2)}`);

    const server = super.createIOServer(port, serverOptions);

    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Add comprehensive event logging
    server.on('connection', (socket) => {
      this.logger.log(`    Client connected: ${socket.id}`);
      this.logger.log(`   - From: ${socket.handshake.address}`);
      this.logger.log(`   - Origin: ${socket.handshake.headers.origin}`);
      // this.logger.log(`   - Transport: ${socket.conn.transport.name}`);
      // this.logger.log(`   - User-Agent: ${socket.handshake.headers['user-agent']?.slice(0, 50)}...`);
    });

    server.engine.on('connection_error', (err) => {
      this.logger.error('  Socket.IO connection error:', err);
      this.logger.error(`   - Code: ${err.code}`);
      this.logger.error(`   - Message: ${err.message}`);
      this.logger.error(`   - Context: ${JSON.stringify(err.context)}`);
    });

    server.on('connect_error', (err) => {
      this.logger.error(' Socket.IO connect error:', err);
    });

    // Log when server is ready
    server.on('listening', () => {
      this.logger.log(` Socket.IO server listening on port ${port}`);
    });

    return server;
  }
}