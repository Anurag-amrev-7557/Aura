/**
 * Analytics and performance monitoring utilities
 */

// Simple analytics class for tracking user interactions
class Analytics {
  constructor() {
    this.events = [];
    this.performance = {};
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track user events
  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      }
    };

    this.events.push(event);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // Send to analytics service in production
    this.sendEvent(event);
  }

  // Track page views
  pageView(pageName) {
    this.track('page_view', {
      page: pageName,
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    });
  }

  // Track ATS-specific events
  trackATSEvent(action, data = {}) {
    this.track(`ats_${action}`, {
      ...data,
      feature: 'ats_analyzer'
    });
  }

  // Track performance metrics
  trackPerformance(metric, value, unit = 'ms') {
    this.performance[metric] = { value, unit, timestamp: Date.now() };
    
    this.track('performance_metric', {
      metric,
      value,
      unit
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      severity: 'error'
    });
  }

  // Track user interactions
  trackInteraction(element, action) {
    this.track('user_interaction', {
      element,
      action,
      interaction_type: 'click'
    });
  }

  // Send event to analytics service
  async sendEvent(event) {
    try {
      // In a real application, you would send this to your analytics service
      // For now, we'll store in localStorage for demo purposes
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        existing.push(event);
        
        // Keep only last 100 events to prevent storage overflow
        if (existing.length > 100) {
          existing.splice(0, existing.length - 100);
        }
        
        localStorage.setItem('analytics_events', JSON.stringify(existing));
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Get session summary
  getSessionSummary() {
    const sessionDuration = Date.now() - this.startTime;
    const eventCounts = this.events.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1;
      return acc;
    }, {});

    return {
      sessionId: this.sessionId,
      duration: sessionDuration,
      eventCounts,
      totalEvents: this.events.length,
      performance: this.performance
    };
  }

  // Clear stored data
  clear() {
    this.events = [];
    this.performance = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_events');
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  static measureAPICall(apiName, promise) {
    const startTime = performance.now();
    
    return promise
      .then(result => {
        const duration = performance.now() - startTime;
        analytics.trackPerformance(`api_${apiName}`, duration);
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        analytics.trackPerformance(`api_${apiName}_error`, duration);
        analytics.trackError(error, { api: apiName });
        throw error;
      });
  }

  static measureComponentRender(componentName, renderFn) {
    const startTime = performance.now();
    const result = renderFn();
    const duration = performance.now() - startTime;
    
    analytics.trackPerformance(`render_${componentName}`, duration);
    return result;
  }

  static measureFileUpload(fileSize, promise) {
    const startTime = performance.now();
    
    return promise
      .then(result => {
        const duration = performance.now() - startTime;
        const throughput = fileSize / (duration / 1000); // bytes per second
        
        analytics.trackPerformance('file_upload_duration', duration);
        analytics.trackPerformance('file_upload_throughput', throughput, 'bytes/s');
        
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        analytics.trackPerformance('file_upload_error', duration);
        throw error;
      });
  }
}

// Create global analytics instance
export const analytics = new Analytics();

// ATS-specific tracking functions
export const trackATS = {
  resumeUploaded: (fileType, fileSize) => {
    analytics.trackATSEvent('resume_uploaded', {
      file_type: fileType,
      file_size: fileSize,
      timestamp: Date.now()
    });
  },

  templateSelected: (templateName) => {
    analytics.trackATSEvent('template_selected', {
      template_name: templateName
    });
  },

  analysisStarted: (hasJobDescription) => {
    analytics.trackATSEvent('analysis_started', {
      has_job_description: hasJobDescription
    });
  },

  analysisCompleted: (score, duration) => {
    analytics.trackATSEvent('analysis_completed', {
      overall_score: score,
      analysis_duration: duration
    });
  },

  resumeImproved: () => {
    analytics.trackATSEvent('resume_improved');
  },

  jobsSearched: (query, resultsCount) => {
    analytics.trackATSEvent('jobs_searched', {
      query_length: query.length,
      results_count: resultsCount
    });
  },

  errorOccurred: (errorType, errorMessage) => {
    analytics.trackATSEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage
    });
  }
};

// Initialize performance observers
if (typeof window !== 'undefined') {
  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      analytics.trackPerformance('lcp', lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        analytics.trackPerformance('fid', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      analytics.trackPerformance('cls', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  }

  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    analytics.trackPerformance('page_load_time', loadTime);
  });

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    analytics.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(new Error(event.reason), {
      type: 'unhandled_promise_rejection'
    });
  });
}

export default analytics;
