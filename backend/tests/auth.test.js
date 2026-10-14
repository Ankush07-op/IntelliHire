process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;

jest.setTimeout(60000);

const os = require('os');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    runtimeAdapters: { os },
  });
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);

describe('Auth Endpoints', () => {
  it('should register a new recruiter successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tech Recruiter',
        email: 'recruiter@techcorp.com',
        password: 'password123',
        role: 'recruiter',
        companyName: 'TechCorp',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toEqual('recruiter');
  });

  it('should fail login with incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recruiter@techcorp.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('should fetch the authenticated user profile with GET /api/auth/me', async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recruiter@techcorp.com',
        password: 'password123',
      });
    expect(loginRes.statusCode).toEqual(200);
    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toEqual(200);
    expect(meRes.body.email).toEqual('recruiter@techcorp.com');
    expect(meRes.body.role).toEqual('recruiter');
  });

  it('should update user profile with PUT /api/auth/profile', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recruiter@techcorp.com',
        password: 'password123',
      });
    const token = loginRes.body.token;

    const updateRes = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: '+1 555-0199',
        location: 'New York, NY',
        skills: ['React', 'Node.js', 'Express', 'MongoDB'],
        experienceYears: 4,
        summary: 'Experienced full stack software engineer',
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.phone).toEqual('+1 555-0199');
    expect(updateRes.body.location).toEqual('New York, NY');
    expect(updateRes.body.skills).toContain('React');
    expect(updateRes.body.experienceYears).toEqual(4);
    expect(updateRes.body.summary).toEqual('Experienced full stack software engineer');
  });
});