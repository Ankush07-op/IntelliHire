process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;
let recruiterToken;
let recruiterId;
let otherRecruiterToken;
let otherRecruiterId;

jest.setTimeout(60000);

const os = require('os');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    runtimeAdapters: { os },
  });

  // Register main recruiter
  const recRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Alice Recruiter',
      email: 'alice@hiring.com',
      password: 'password123',
      role: 'recruiter',
      companyName: 'AliceCorp',
    });
  recruiterToken = recRes.body.token;
  recruiterId = recRes.body._id || recRes.body.id;

  // Register secondary recruiter
  const otherRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Bob Recruiter',
      email: 'bob@hiring.com',
      password: 'password123',
      role: 'recruiter',
      companyName: 'BobCorp',
    });
  otherRecruiterToken = otherRes.body.token;
  otherRecruiterId = otherRes.body._id || otherRes.body.id;
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);

describe('Jobs Endpoints', () => {
  let createdJobId;

  it('should allow a recruiter to create a new job posting', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Senior React Developer',
        description: 'Building high quality frontend interfaces with React and TypeScript.',
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Tailwind'],
        experienceLevel: 'Senior',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('Senior React Developer');
    expect(res.body.requiredSkills).toContain('React');
    createdJobId = res.body._id;
  });

  it('should reject job creation without title or description', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        requiredSkills: ['Node.js'],
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('required');
  });

  it('should fetch public jobs list', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.jobs)).toBeTruthy();
    expect(res.body.jobs.length).toBeGreaterThanOrEqual(1);
  });

  it('should filter jobs scoped to recruiterId', async () => {
    // Bob creates a separate job
    await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${otherRecruiterToken}`)
      .send({
        title: 'Python Data Engineer',
        description: 'ETL pipelines using Python and Spark.',
        requiredSkills: ['Python', 'SQL'],
        experienceLevel: 'Mid',
      });

    // Query jobs for Alice only
    const aliceJobsRes = await request(app)
      .get(`/api/jobs?recruiterId=${recruiterId}`);

    expect(aliceJobsRes.statusCode).toEqual(200);
    expect(aliceJobsRes.body.jobs.length).toEqual(1);
    expect(aliceJobsRes.body.jobs[0].title).toEqual('Senior React Developer');

    // Query jobs for Bob only
    const bobJobsRes = await request(app)
      .get(`/api/jobs?recruiterId=${otherRecruiterId}`);

    expect(bobJobsRes.statusCode).toEqual(200);
    expect(bobJobsRes.body.jobs.length).toEqual(1);
    expect(bobJobsRes.body.jobs[0].title).toEqual('Python Data Engineer');
  });

  it('should get job by ID', async () => {
    const res = await request(app).get(`/api/jobs/${createdJobId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toEqual(createdJobId);
    expect(res.body.title).toEqual('Senior React Developer');
  });
});
