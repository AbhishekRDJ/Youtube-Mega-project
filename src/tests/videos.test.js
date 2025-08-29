import request from 'supertest'
import { app } from '../app.js'

describe('Videos API', () => {
  it('GET /api/v1/videos should return 200', async () => {
    const res = await request(app).get('/api/v1/videos').expect(200)
    expect(res.body).toBeDefined()
  })
})


