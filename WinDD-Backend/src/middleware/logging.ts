import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate a unique request ID
  const requestId = Math.random().toString(36).substring(7);
  
  // Store the start time
  const startTime = Date.now();
  
  // Log the request
  console.log(`\n[${new Date().toISOString()}] [${requestId}] Request:`, {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined
    }
  });

  // Store the original res.json method
  const originalJson = res.json;
  
  // Override res.json to intercept the response
  res.json = function (body) {
    // Log the response
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[${new Date().toISOString()}] [${requestId}] Response: (${duration}ms)`, {
      statusCode: res.statusCode,
      body: body
    });
    
    // Call the original json method
    return originalJson.call(this, body);
  };

  next();
};

export const mongooseLogger = () => {
  const mongoose = require('mongoose');
  
  mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
    console.log(`\n[${new Date().toISOString()}] Mongoose:`, {
      collection: collectionName,
      method: method,
      query: query,
      doc: doc
    });
  });
}; 