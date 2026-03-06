import mongoose from 'mongoose';

// Connection management for better performance
let cachedConnection: typeof mongoose | null = null;
let connectionCount = 0;

export async function connectDB() {
  // If we already have a connection, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    connectionCount++;
    console.log(`Reusing existing DB connection (count: ${connectionCount})`);
    return cachedConnection;
  }

  // Create new connection if needed
  if (!cachedConnection || mongoose.connection.readyState !== 1) {
    console.log('Creating new DB connection');
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI!);
    connectionCount = 0;
  }

  return cachedConnection;
}

// Graceful connection close for cleanup
export async function closeDBConnection() {
  if (cachedConnection) {
    console.log('Closing DB connection');
    await mongoose.connection.close();
    cachedConnection = null;
    connectionCount = 0;
  }
}

// Connection health check
export function getConnectionHealth() {
  if (!cachedConnection) {
    return { status: 'disconnected', connections: 0 };
  }

  const state = cachedConnection.connection.readyState;
  const healthStatus: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    status: healthStatus[state] || 'unknown',
    connections: connectionCount,
    readyState: state
  };
}
