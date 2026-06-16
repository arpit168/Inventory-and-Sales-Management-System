import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

let server;

// Start server
const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`✓ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ Health check at http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      if (server) {
        server.close(async () => {
          console.log('HTTP server closed.');
          
          try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
          } catch (err) {
            console.error('Error closing MongoDB connection:', err);
          }
          
          process.exit(0);
        });

        // Force shutdown after 30 seconds
        setTimeout(() => {
          console.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 30000);
      }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

startServer();