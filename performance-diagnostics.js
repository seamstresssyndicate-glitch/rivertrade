/**
 * Performance Diagnostics
 * Monitors and reports on application performance
 */

class PerformanceDiagnostics {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      apiCallCount: 0,
      apiCallsTiming: [],
      errors: [],
      warnings: []
    };
    this.init();
  }

  init() {
    this.measurePageLoad();
    this.setupErrorTracking();
    this.setupPerformanceObserver();
    this.logInitialMetrics();
  }

  measurePageLoad() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      this.metrics.pageLoadTime = timing.loadEventEnd - navigationStart;
      this.metrics.domContentLoadedTime = timing.domContentLoadedEventEnd - navigationStart;

      console.log(`Page Load Time: ${this.metrics.pageLoadTime}ms`);
      console.log(`DOM Content Loaded: ${this.metrics.domContentLoadedTime}ms`);
    }
  }

  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        timestamp: new Date().toISOString()
      });
      console.error('Tracked error:', event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        message: event.reason?.message || event.reason,
        type: 'UnhandledPromiseRejection',
        timestamp: new Date().toISOString()
      });
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  setupPerformanceObserver() {
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 1000) {
              this.metrics.warnings.push({
                message: `Slow operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`,
                timestamp: new Date().toISOString()
              });
            }
          }
        });

        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        console.warn('PerformanceObserver not fully supported');
      }
    }
  }

  trackAPICall(endpoint, duration) {
    this.metrics.apiCallCount++;
    this.metrics.apiCallsTiming.push({
      endpoint,
      duration,
      timestamp: new Date().toISOString()
    });

    if (duration > 3000) {
      this.metrics.warnings.push({
        message: `Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
    }
  }

  logInitialMetrics() {
    console.group('Performance Diagnostics');
    console.log('Initial Metrics:', this.metrics);
    console.groupEnd();
  }

  getReport() {
    return {
      metrics: this.metrics,
      summary: {
        totalErrors: this.metrics.errors.length,
        totalWarnings: this.metrics.warnings.length,
        averageAPICallDuration: this.getAverageAPICallDuration(),
        pageLoadTimeMs: this.metrics.pageLoadTime
      }
    };
  }

  getAverageAPICallDuration() {
    if (this.metrics.apiCallsTiming.length === 0) return 0;
    const total = this.metrics.apiCallsTiming.reduce((sum, call) => sum + call.duration, 0);
    return (total / this.metrics.apiCallsTiming.length).toFixed(2);
  }

  printReport() {
    const report = this.getReport();
    console.group('Performance Report');
    console.table(report.summary);
    console.log('Errors:', report.metrics.errors);
    console.log('Warnings:', report.metrics.warnings);
    console.groupEnd();
  }
}

// Initialize diagnostics
const performanceDiagnostics = new PerformanceDiagnostics();

// Override fetch to track API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const startTime = performance.now();
  
  return originalFetch.apply(this, args).then((response) => {
    const duration = performance.now() - startTime;
    const endpoint = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    performanceDiagnostics.trackAPICall(endpoint, duration);
    return response;
  }).catch((error) => {
    const duration = performance.now() - startTime;
    const endpoint = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    performanceDiagnostics.trackAPICall(endpoint, duration);
    throw error;
  });
};
