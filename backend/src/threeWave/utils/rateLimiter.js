/**
 * Token Bucket Rate Limiter & LLM Cache Utility
 */

class RateLimiterAndCache {
  constructor(maxCallsPerMin = 20) {
    this.maxCallsPerMin = maxCallsPerMin;
    this.callTimestamps = [];
    this.cache = new Map();
  }

  async waitForSlot() {
    const now = Date.now();
    this.callTimestamps = this.callTimestamps.filter(t => now - t < 60000);

    if (this.callTimestamps.length >= this.maxCallsPerMin) {
      const oldest = this.callTimestamps[0];
      const waitTime = 60000 - (now - oldest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    this.callTimestamps.push(Date.now());
  }

  getCachedVerdict(symbol, barTimestamp, modelName) {
    const key = `${symbol}:${barTimestamp}:${modelName}`;
    return this.cache.get(key) || null;
  }

  setCachedVerdict(symbol, barTimestamp, modelName, verdict) {
    const key = `${symbol}:${barTimestamp}:${modelName}`;
    this.cache.set(key, verdict);
  }
}

const rateLimiter = new RateLimiterAndCache(20);

module.exports = {
  rateLimiter
};
