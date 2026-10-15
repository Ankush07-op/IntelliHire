process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Application = require('../src/models/Application');
const AIAnalysis = require('../src/models/AIAnalysis');
const Job = require('../src/models/Job');

let mongoServer;
let recruiterToken;
let recruiterId;
let otherRecruiterToken;
let applicantToken;
let applicantId;
let testJob;
let testApp;

jest.setTimeout(60000);

const os = require('os');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    runtimeAdapters: { os },
  });

  // Register recruiter
  const recRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Sarah Hiring',
      email: 'sarah@innovate.io',
      password: 'password123',
      role: 'recruiter',
      companyName: 'Innovate',
    });
  recruiterToken = recRes.body.token;
  recruiterId = recRes.body._id || recRes.body.id;

  // Register second recruiter (to test 403 authorization guard)
  const otherRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Other Hiring',
      email: 'other@innovate.io',
      password: 'password123',
      role: 'recruiter',
      companyName: 'Innovate Other',
    });
  otherRecruiterToken = otherRes.body.token;

  // Register applicant
  const appRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'John Candidate',
      email: 'john@candidate.org',
      password: 'password123',
      role: 'applicant',
    });
  applicantToken = appRes.body.token;
  applicantId = appRes.body._id || appRes.body.id;

  // Create a job owned by Sarah
  testJob = await Job.create({
    recruiterId,
    title: 'Full Stack Engineer',
    description: 'Node.js and React expertise needed',
    requiredSkills: ['Node.js', 'React', 'MongoDB'],
    experienceLevel: 'Mid',
    status: 'active',
  });

  // Create an application directly in MongoDB for John
  testApp = await Application.create({
    jobId: testJob._id,
    applicantId,
    resumeUrl: 'test_public_resume_id',
    status: 'Applied',
  });

  // Create an AI Analysis record for the application
  await AIAnalysis.create({
    applicationId: testApp._id,
    score: 88,
    matchedSkills: ['Node.js', 'React'],
    missingSkills: ['MongoDB'],
    experienceYears: 3,
    summary: 'Candidate demonstrates strong React and Node fundamentals.',
  });
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);

describe('Applications & Rankings Endpoints', () => {
  it('should allow candidate to retrieve their own applications', async () => {
    const res = await request(app)
      .get('/api/applications/me')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(1);
    expect(res.body[0].jobId._id.toString()).toEqual(testJob._id.toString());
  });

  it('should allow recruiter to update application status to Shortlisted', async () => {
    const res = await request(app)
      .patch(`/api/applications/${testApp._id}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        status: 'Shortlisted',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.application.status).toEqual('Shortlisted');
  });

  it('should allow recruiter to schedule an interview with interview details', async () => {
    const res = await request(app)
      .patch(`/api/applications/${testApp._id}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        status: 'Interview',
        interviewDetails: {
          date: '2026-11-01',
          time: '15:30',
          meetingLink: 'https://meet.google.com/test-room',
          notes: 'Prepare system design discussion',
        },
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.application.status).toEqual('Interview');
  });

  it('should reject status update from an unauthorized recruiter with 403', async () => {
    const res = await request(app)
      .patch(`/api/applications/${testApp._id}/status`)
      .set('Authorization', `Bearer ${otherRecruiterToken}`)
      .send({
        status: 'Rejected',
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('Not authorized to update this status');
  });

  it('should allow recruiter to fetch indexed AI rankings for their job', async () => {
    const res = await request(app)
      .get(`/api/rankings/job/${testJob._id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('rankings');
    expect(res.body.count).toEqual(1);
    expect(res.body.rankings[0].score).toEqual(88);
    expect(res.body.rankings[0].matchedSkills).toContain('Node.js');
  });
});
