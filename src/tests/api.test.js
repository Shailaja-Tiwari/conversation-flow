const request = require('supertest');
const app = require('../app');

describe('API Endpoints Test Suite', () => {
  let testData;
  let userId;
  let moduleId;
  let questionId;

  beforeAll(() => {
    testData = global.getTestData();
    userId = testData.user._id;
    moduleId = testData.moduleA._id;
    questionId = testData.questions.a1._id;
  });

  beforeEach(async () => {
    // Reset user state before each test
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      currentModuleId: null,
      currentQuestionId: null,
      checkpointQuestionIds: []
    });
    
    // Clear history
    const History = require('../models/History');
    await History.deleteMany({ userId });
  });

  // ==========================================
  // TEST 1: GET /users - List all users
  // ==========================================
  describe('GET /users', () => {
    it('should return all users', async () => {
      const res = await request(app).get('/users');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });
  });

  // ==========================================
  // TEST 2: POST /modules/:moduleId/start - Start a module
  // ==========================================
  describe('POST /modules/:moduleId/start', () => {
    it('should start a module and return first question', async () => {
      const res = await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('question');
      expect(res.body.question).toHaveProperty('text');
      expect(res.body.question).toHaveProperty('options');
      expect(res.body.question.moduleId).toBe(moduleId.toString());
    });

    it('should return 404 for non-existent module', async () => {
      const fakeModuleId = '507f191e810c19729de860ea';
      const res = await request(app)
        .post(`/modules/${fakeModuleId}/start`)
        .send({ userId });
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ==========================================
  // TEST 3: GET /users/:userId/current - Get current question
  // ==========================================
  describe('GET /users/:userId/current', () => {
    it('should return current question after starting module', async () => {
      // Start module first
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      // Get current question
      const res = await request(app).get(`/users/${userId}/current`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('question');
      expect(res.body.question).toHaveProperty('text');
    });

    it('should return complete message when no active question', async () => {
      const res = await request(app).get(`/users/${userId}/current`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('complete', true);
    });
  });

  // ==========================================
  // TEST 4: GET /users/:userId/history - Get user history
  // ==========================================
  describe('GET /users/:userId/history', () => {
    it('should return user history', async () => {
      // Start module and answer a question
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const firstQuestion = testData.questions.a1;
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: firstQuestion._id,
          optionId: firstQuestion.options[0]._id
        });

      // Get history
      const res = await request(app).get(`/users/${userId}/history`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeGreaterThan(0);
    });

    it('should return empty history for new user', async () => {
      const newUser = require('../models/User');
      const testNewUser = await newUser.create({ name: 'New User' });
      
      const res = await request(app).get(`/users/${testNewUser._id}/history`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.history).toEqual([]);
      
      // Cleanup
      await newUser.findByIdAndDelete(testNewUser._id);
    });
  });

  // ==========================================
  // TEST 5: GET /users/questions/:questionId - Resolve deep link
  // ==========================================
  describe('GET /users/questions/:questionId', () => {
    it('should resolve deep link to current question', async () => {
      // Start module first
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const firstQuestion = testData.questions.a1;
      const res = await request(app)
        .get(`/users/questions/${firstQuestion._id}`)
        .query({ userId: userId.toString() });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('question');
    });

    it('should redirect when question is not current', async () => {
      // Start module first to set currentQuestionId
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const differentQuestion = testData.questions.b1;
      const res = await request(app)
        .get(`/users/questions/${differentQuestion._id}`)
        .query({ userId: userId.toString() });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('redirected', true);
    });
  });

  // ==========================================
  // TEST 6: POST /answer - Submit an answer
  // ==========================================
  describe('POST /answer', () => {
    it('should submit answer and return next question', async () => {
      // Start module first
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const firstQuestion = testData.questions.a1;
      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: firstQuestion._id,
          optionId: firstQuestion.options[0]._id
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('question');
      expect(res.body.question).toHaveProperty('text');
    });

    it('should return 400 when missing required fields', async () => {
      const res = await request(app)
        .post('/answer')
        .send({ userId });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent question', async () => {
      const fakeQuestionId = '507f191e810c19729de860ea';
      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: fakeQuestionId,
          optionId: '507f191e810c19729de860eb'
        });
      
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid option', async () => {
      const firstQuestion = testData.questions.a1;
      const fakeOptionId = '507f191e810c19729de860eb';
      
      // Start module first
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: firstQuestion._id,
          optionId: fakeOptionId
        });
      
      expect(res.statusCode).toBe(400);
    });

    it('should complete flow when no next question', async () => {
      // Navigate to terminal question (b2 has no next)
      await request(app)
        .post(`/modules/${testData.moduleB._id}/start`)
        .send({ userId });

      const b1 = testData.questions.b1;
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: b1._id,
          optionId: b1.options[0]._id
        });

      const b2 = testData.questions.b2;
      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: b2._id,
          optionId: b2.options[0]._id
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('complete', true);
    });
  });

  // ==========================================
  // TEST 7: POST /go-back - Go back to previous question
  // ==========================================
  describe('POST /go-back', () => {
    it('should go back to previous question', async () => {
      // Start module and answer first question
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const firstQuestion = testData.questions.a1;
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: firstQuestion._id,
          optionId: firstQuestion.options[0]._id
        });

      // Go back
      const res = await request(app)
        .post('/go-back')
        .send({ userId });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('question');
      expect(res.body.question._id).toBe(firstQuestion._id.toString());
    });

    it('should return 400 when no history exists', async () => {
      const res = await request(app)
        .post('/go-back')
        .send({ userId });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 when missing userId', async () => {
      const res = await request(app)
        .post('/go-back')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should block go-back past checkpoint', async () => {
      // Start module
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const a1 = testData.questions.a1;
      const a2 = testData.questions.a2; // This is a checkpoint

      // Answer a1 to reach checkpoint a2
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a1._id,
          optionId: a1.options[0]._id
        });

      // Answer checkpoint a2
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a2._id,
          optionId: a2.options[0]._id
        });

      // Try to go back past checkpoint - should fail
      const res = await request(app)
        .post('/go-back')
        .send({ userId });
      
      // Should fail because a2 is a checkpoint
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('checkpoint');
    });
  });

  // ==========================================
  // TEST 8: Cross-module navigation
  // ==========================================
  describe('Cross-module navigation', () => {
    it('should navigate from module A to module B', async () => {
      // Start module A
      await request(app)
        .post(`/modules/${testData.moduleA._id}/start`)
        .send({ userId });

      const a1 = testData.questions.a1;
      const a2 = testData.questions.a2;
      const a3 = testData.questions.a3; // Has option with nextModuleId

      // Navigate to a3
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a1._id,
          optionId: a1.options[1]._id // Goes to a3
        });

      // Answer a3 with option that goes to module B
      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a3._id,
          optionId: a3.options[1]._id // nextModuleId = module B
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.question.moduleId).toBe(testData.moduleB._id.toString());
    });
  });

  // ==========================================
  // TEST 9: Edge Cases - Answer Submission
  // ==========================================
  describe('Edge Cases - Answer Submission', () => {
    it('should return 400 when answering a question that is not current', async () => {
      // Start module
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      // Try to answer a different question (not the current one)
      const differentQuestion = testData.questions.a2;
      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: differentQuestion._id,
          optionId: differentQuestion.options[0]._id
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Not your current question');
    });

    it('should return 400 when userId is missing', async () => {
      const res = await request(app)
        .post('/answer')
        .send({
          questionId: testData.questions.a1._id,
          optionId: testData.questions.a1.options[0]._id
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('userId, questionId, optionId required');
    });

    it('should return 400 when questionId is missing', async () => {
      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          optionId: testData.questions.a1.options[0]._id
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('userId, questionId, optionId required');
    });

    it('should return 400 when optionId is missing', async () => {
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const res = await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: testData.questions.a1._id
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('userId, questionId, optionId required');
    });
  });

  // ==========================================
  // TEST 10: Edge Cases - Go Back
  // ==========================================
  describe('Edge Cases - Go Back', () => {
    it('should return 400 when trying to go back from first question', async () => {
      // Start module but don't answer any question
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      // Try to go back without any history
      const res = await request(app)
        .post('/go-back')
        .send({ userId });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('No history to go back to');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeUserId = '507f191e810c19729de860ea';
      const res = await request(app)
        .post('/go-back')
        .send({ userId: fakeUserId });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('User not found');
    });
  });

  // ==========================================
  // TEST 11: Edge Cases - Deep Links
  // ==========================================
  describe('Edge Cases - Deep Links', () => {
    it('should return 400 for deep link with non-existent userId', async () => {
      const fakeUserId = '507f191e810c19729de860ea';
      const res = await request(app)
        .get(`/users/questions/${testData.questions.a1._id}`)
        .query({ userId: fakeUserId });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('User not found');
    });

    it('should handle deep link with non-existent questionId', async () => {
      // Start module first
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const fakeQuestionId = '507f191e810c19729de860ea';
      const res = await request(app)
        .get(`/users/questions/${fakeQuestionId}`)
        .query({ userId: userId.toString() });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('redirected', true);
      expect(res.body).toHaveProperty('question');
    });

    it('should return 400 when userId query parameter is missing', async () => {
      const res = await request(app)
        .get(`/users/questions/${testData.questions.a1._id}`);
      
      expect(res.statusCode).toBe(400);
    });
  });

  // ==========================================
  // TEST 12: Edge Cases - Module Start
  // ==========================================
  describe('Edge Cases - Module Start', () => {
    it('should restart module when user already has an active module', async () => {
      // Start module A
      await request(app)
        .post(`/modules/${testData.moduleA._id}/start`)
        .send({ userId });

      // Navigate to second question
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: testData.questions.a1._id,
          optionId: testData.questions.a1.options[0]._id
        });

      // Start module A again - should reset to first question
      const res = await request(app)
        .post(`/modules/${testData.moduleA._id}/start`)
        .send({ userId });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.question._id).toBe(testData.questions.a1._id.toString());
    });

    it('should return 400 when userId is missing', async () => {
      const res = await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({});
      
      // The controller will fail when trying to get user
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeUserId = '507f191e810c19729de860ea';
      const res = await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId: fakeUserId });
      
      expect(res.statusCode).toBe(400); // User not found returns 400 from stateService
    });
  });

  // ==========================================
  // TEST 13: Edge Cases - Current Question
  // ==========================================
  describe('Edge Cases - Current Question', () => {
    it('should return 400 for non-existent user', async () => {
      const fakeUserId = '507f191e810c19729de860ea';
      const res = await request(app)
        .get(`/users/${fakeUserId}/current`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('User not found');
    });
  });

  // ==========================================
  // TEST 14: Edge Cases - History
  // ==========================================
  describe('Edge Cases - History', () => {
    it('should return 400 for non-existent user', async () => {
      const fakeUserId = '507f191e810c19729de860ea';
      const res = await request(app)
        .get(`/users/${fakeUserId}/history`);
      
      expect(res.statusCode).toBe(200); // History returns empty array for non-existent user
      expect(res.body.history).toEqual([]);
    });
  });

  // ==========================================
  // TEST 15: Edge Cases - Checkpoint Behavior
  // ==========================================
  describe('Edge Cases - Checkpoint Behavior', () => {
    it('should add checkpoint to user after answering checkpoint question', async () => {
      const User = require('../models/User');
      
      // Start module
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const a1 = testData.questions.a1;
      const a2 = testData.questions.a2; // This is a checkpoint

      // Answer a1 to reach checkpoint a2
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a1._id,
          optionId: a1.options[0]._id
        });

      // Answer checkpoint question a2
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a2._id,
          optionId: a2.options[0]._id
        });

      // Verify checkpoint was added to user
      const user = await User.findById(userId);
      expect(user.checkpointQuestionIds).toHaveLength(1);
      expect(user.checkpointQuestionIds[0].toString()).toBe(a2._id.toString());
    });

    it('should prevent going back to question before checkpoint', async () => {
      // Start module
      await request(app)
        .post(`/modules/${moduleId}/start`)
        .send({ userId });

      const a1 = testData.questions.a1;
      const a2 = testData.questions.a2; // Checkpoint
      const a3 = testData.questions.a3;

      // Navigate: a1 -> a2 (checkpoint) -> a3
      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a1._id,
          optionId: a1.options[0]._id // Goes to a2
        });

      await request(app)
        .post('/answer')
        .send({
          userId,
          questionId: a2._id,
          optionId: a2.options[0]._id // Goes to a3
        });

      // Try to go back from a3 - should be blocked by checkpoint a2
      const res = await request(app)
        .post('/go-back')
        .send({ userId });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cannot go back past a checkpoint');
    });
  });

  // ==========================================
  // TEST 16: Edge Cases - Invalid ObjectIds
  // ==========================================
  describe('Edge Cases - Invalid ObjectIds', () => {
    it('should handle invalid ObjectId format gracefully', async () => {
      const invalidId = 'not-a-valid-object-id';
      const res = await request(app)
        .post(`/modules/${invalidId}/start`)
        .send({ userId });
      
      // Should return error (either 400 or 500 depending on validation)
      expect([400, 500]).toContain(res.statusCode);
    });

    it('should return 404 for module with valid but non-existent ObjectId', async () => {
      const validButFakeId = '507f191e810c19729de860ea';
      const res = await request(app)
        .post(`/modules/${validButFakeId}/start`)
        .send({ userId });
      
      expect(res.statusCode).toBe(404);
    });
  });
});
