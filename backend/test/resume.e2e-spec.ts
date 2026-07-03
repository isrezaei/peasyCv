import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { ResumeData } from '@resume/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { createDefaultResumeData } from '../src/resumes/resume-default.factory';

/**
 * End-to-end test of the core contract: auth + the DB -> API -> ResumeData
 * round-trip (shape-identical), ownership enforcement, and the public share view.
 *
 * Requires a running Postgres with the schema migrated:
 *   npm run db:up && npm run prisma:migrate --workspace @resume/backend
 */
describe('Resume API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const createdEmails: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Mirror the production pipeline from main.ts.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (createdEmails.length) {
      await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
    }
    await app.close();
  });

  function uniqueEmail(prefix: string): string {
    const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.test`;
    createdEmails.push(email);
    return email;
  }

  async function registerUser(prefix: string): Promise<{ accessToken: string }> {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: uniqueEmail(prefix), password: 'Password123', name: 'Tester' })
      .expect(201);
    expect(res.body.tokens.accessToken).toBeDefined();
    expect(res.body.tokens.refreshToken).toBeDefined();
    return { accessToken: res.body.tokens.accessToken };
  }

  const stripTimestamps = (r: ResumeData) => {
    const clone = { ...r } as Partial<ResumeData>;
    delete clone.createdAt;
    delete clone.updatedAt;
    return clone;
  };

  it('rejects unauthenticated resume access with 401', async () => {
    await request(app.getHttpServer()).get('/resumes').expect(401);
  });

  it('round-trips a full ResumeData through PUT -> GET with identical shape', async () => {
    const { accessToken } = await registerUser('owner');
    const auth = { Authorization: `Bearer ${accessToken}` };
    const resume = createDefaultResumeData({ title: 'Round Trip' });

    const put = await request(app.getHttpServer())
      .put(`/resumes/${resume.id}`)
      .set(auth)
      .send(resume)
      .expect(200);

    // The persisted resume matches the input exactly (timestamps are server-set).
    expect(stripTimestamps(put.body)).toEqual(stripTimestamps(resume));

    const get = await request(app.getHttpServer())
      .get(`/resumes/${resume.id}`)
      .set(auth)
      .expect(200);
    expect(stripTimestamps(get.body)).toEqual(stripTimestamps(resume));

    // The "current" convenience endpoint returns the same document.
    const current = await request(app.getHttpServer())
      .get('/resumes/current')
      .set(auth)
      .expect(200);
    expect(current.body.id).toBe(resume.id);
  });

  it('persists edits to nested collections and ordering', async () => {
    const { accessToken } = await registerUser('editor');
    const auth = { Authorization: `Bearer ${accessToken}` };
    const resume = createDefaultResumeData();

    // Reorder languages and edit a skill to prove deep persistence + order.
    resume.languages.reverse();
    resume.skills[0].skills.push({ id: 'skill-new', name: 'GraphQL' });
    resume.personalInfo.fullName = 'ویرایش‌شده';

    await request(app.getHttpServer()).put(`/resumes/${resume.id}`).set(auth).send(resume).expect(200);
    const get = await request(app.getHttpServer()).get(`/resumes/${resume.id}`).set(auth).expect(200);

    expect(get.body.languages.map((l: { name: string }) => l.name)).toEqual(
      resume.languages.map((l) => l.name),
    );
    expect(get.body.skills[0].skills.at(-1).name).toBe('GraphQL');
    expect(get.body.personalInfo.fullName).toBe('ویرایش‌شده');
  });

  it('rejects an invalid payload with 400', async () => {
    const { accessToken } = await registerUser('validate');
    const resume = createDefaultResumeData();
    await request(app.getHttpServer())
      .put(`/resumes/${resume.id}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({ ...resume, templateId: 'not-a-real-template' })
      .expect(400);
  });

  it('enforces ownership — another user cannot read or delete', async () => {
    const owner = await registerUser('owner2');
    const intruder = await registerUser('intruder');
    const resume = createDefaultResumeData();

    await request(app.getHttpServer())
      .put(`/resumes/${resume.id}`)
      .set({ Authorization: `Bearer ${owner.accessToken}` })
      .send(resume)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/resumes/${resume.id}`)
      .set({ Authorization: `Bearer ${intruder.accessToken}` })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/resumes/${resume.id}`)
      .set({ Authorization: `Bearer ${intruder.accessToken}` })
      .expect(404);
  });

  it('shares a resume read-only via public token', async () => {
    const { accessToken } = await registerUser('sharer');
    const auth = { Authorization: `Bearer ${accessToken}` };
    const resume = createDefaultResumeData({ title: 'Shared' });
    await request(app.getHttpServer()).put(`/resumes/${resume.id}`).set(auth).send(resume).expect(200);

    const share = await request(app.getHttpServer())
      .post(`/resumes/${resume.id}/share`)
      .set(auth)
      .expect(201);
    const token = share.body.token as string;
    expect(token).toHaveLength(32);

    // Public, NO auth header — read-only view resolves.
    const pub = await request(app.getHttpServer()).get(`/share/${token}`).expect(200);
    expect(pub.body.resume.id).toBe(resume.id);
    expect(pub.body.ownerName).toBe('Tester');

    // Disabling sharing makes the link stop resolving.
    await request(app.getHttpServer()).delete(`/resumes/${resume.id}/share`).set(auth).expect(204);
    await request(app.getHttpServer()).get(`/share/${token}`).expect(404);
  });
});
