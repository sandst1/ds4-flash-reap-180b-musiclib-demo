import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { errorHandler } from './errorHandler.js';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.get('/test-error', (req, res, next) => {
    const err = new Error('Something broke');
    err.status = 418;
    next(err);
  });
  app.get('/test-default-error', (req, res, next) => {
    next(new Error('Default error'));
  });
  app.use(errorHandler);
  return supertest(app);
}

describe('errorHandler middleware', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns { error, status } JSON with the given status code', async () => {
    const request = buildApp();
    const res = await request.get('/test-error');
    expect(res.status).toBe(418);
    expect(res.body).toEqual({ error: 'Something broke', status: 418 });
  });

  it('returns 500 for errors without a status', async () => {
    const request = buildApp();
    const res = await request.get('/test-default-error');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Default error', status: 500 });
  });

  it('logs the error to console.error', async () => {
    const request = buildApp();
    await request.get('/test-error');
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something broke' }));
  });
});
