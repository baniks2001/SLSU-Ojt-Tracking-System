// Performance monitoring utilities for high-traffic systems
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  activeConnections: number;
  cacheHitRate: number;
  errorRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    memoryUsage: 0,
    activeConnections: 0,
    cacheHitRate: 0,
    errorRate: 0
  };

  private static instance: PerformanceMonitor;

  private constructor() {
    this.metrics = {
      responseTime: 0,
      memoryUsage: 0,
      activeConnections: 0,
      cacheHitRate: 0,
      errorRate: 0
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  // Track response time
  trackResponseTime(responseTime: number) {
    this.metrics.responseTime = responseTime;
    if (responseTime > 1000) {
      // Slow response alert
      this.metrics.errorRate++;
    }
  }

  // Track memory usage
  trackMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      this.metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    }
  }

  // Track active connections
  trackConnection(active: boolean) {
    this.metrics.activeConnections = active ? this.metrics.activeConnections + 1 : this.metrics.activeConnections - 1;
  }

  // Track cache performance
  trackCacheHit(hit: boolean) {
    this.metrics.cacheHitRate = hit ? 
      (this.metrics.cacheHitRate + 1) / 2 : 
      this.metrics.cacheHitRate / 2;
  }

  // Track errors
  trackError() {
    this.metrics.errorRate++;
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Reset metrics (call periodically)
  resetMetrics() {
    this.metrics = {
      responseTime: 0,
      memoryUsage: 0,
      activeConnections: 0,
      cacheHitRate: 0,
      errorRate: 0
    };
  }

  // Check if system is under stress
  isUnderStress(): boolean {
    return (
      this.metrics.responseTime > 2000 || // > 2s response time
      this.metrics.memoryUsage > 512 || // > 512MB memory usage
      this.metrics.activeConnections > 100 || // > 100 active connections
      this.metrics.errorRate > 10 // > 10 errors per minute
    );
  }

  // Get performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.responseTime > 2000) {
      recommendations.push('Consider implementing response caching');
      recommendations.push('Optimize database queries');
    }
    
    if (this.metrics.memoryUsage > 512) {
      recommendations.push('Monitor for memory leaks');
      recommendations.push('Implement connection pooling');
    }
    
    if (this.metrics.activeConnections > 100) {
      recommendations.push('Consider load balancing');
      recommendations.push('Implement rate limiting');
    }
    
    if (this.metrics.cacheHitRate < 50) {
      recommendations.push('Optimize caching strategy');
    }
    
    if (this.metrics.errorRate > 10) {
      recommendations.push('Review error handling');
      recommendations.push('Implement circuit breaker pattern');
    }
    
    return recommendations;
  }
}

export default PerformanceMonitor;
