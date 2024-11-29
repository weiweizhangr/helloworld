const express = require('express');
const { Registry, Gauge, Counter, Histogram } = require('prom-client');
 
// 创建一个 Prometheus 指标注册表
const register = new Registry();
 
// 注册默认的采集器
register.setDefaultLabels({ app: 'my-node-app' });
 
// 定义一些示例指标
const requestDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10] // 自定义桶
});
 
const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});
 
const activeRequestsGauge = new Gauge({
  name: 'active_requests',
  help: 'Number of active HTTP requests'
});
 
// 初始化 Express 应用
const app = express();
let activeRequests = 0;
 
// 中间件：记录请求开始时间和增加活动请求数
app.use((req, res, next) => {
  const start = Date.now();
  activeRequests++;
  activeRequestsGauge.set(activeRequests);
 
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestDurationHistogram.observe({ method: req.method, route: req.path, code: res.statusCode }, duration);
    requestCounter.inc({ method: req.method, route: req.path, code: res.statusCode });
    activeRequests--;
    activeRequestsGauge.set(activeRequests);
  });
 
  next();
});
 
// 示例路由
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
 
app.get('/health', (req, res) => {
    res.send('Healthy');
});
 
 
// 暴露 Prometheus 指标
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
 
// 启动应用
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});