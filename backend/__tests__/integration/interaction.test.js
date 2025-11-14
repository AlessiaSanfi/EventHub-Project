/**
 * @file Test di Integrazione per l'Interazione Utente-Evento.
 * @description Contiene i test di integrazione per l'iscrizione e la cancellazione della partecipazione ad un evento (attend/unattend) tramite le rotte /api/events/:id/attend.
 */

const request = require('supertest');
const app = require('../../app');
const Event = require('../../models/Event'); 
const User = require('../../models/User'); // Importa il modello User

// Variabili per l'autenticazione di un utente standard
let userToken;
let standardUserId;
let testEventId;
let adminCreatorId; 
let adminToken;

beforeAll(async () => {
    // 1. Crea l'utente Admin (il creatore dell'evento)
    const adminUser = await User.create({
        username: 'adminCreator',
        email: 'creator@test.it',
        password: 'password123',
        role: 'admin'    
    });
    adminCreatorId = adminUser._id;

    // 2. Crea l'utente Standard (che parteciperà)
    const standardUser = await User.create({
        username: 'standardUser',
        email: 'standard@test.it',
        password: 'password123',
        role: 'user'
    });
    standardUserId = standardUser._id;

    // 3. Login per ottenere il token dell'utente standard
    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'standard@test.it',
            password: 'password123'
        });
    userToken = loginResponse.body.token || loginResponse.body.data?.token;

    // 4. Login per ottenere il token dell'admin (uso adminToken per creare l'evento)
    const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'creator@test.it',
            password: 'password123'
        });
    adminToken = adminLoginResponse.body.token || adminLoginResponse.body.data?.token;

    // 5. Crea un evento di test usando l'adminToken
    const eventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            title: 'Test Event for Interaction',
            description: 'Test',
            date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Test Location',
            capacity: 50,
            category: 'Tecnologia'
        });

    testEventId = eventResponse.body.data?._id;
}, 35000);

describe('[persistent] User Interaction with Events', () => {
    // Disabilita la pulizia del DB durante i test di interazione
    afterEach(() => {
    });

    it('POST /api/events/:id/attend should allow a user to attend an event', async () => {
        const response = await request(app)
            .post(`/api/events/${testEventId}/attend`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('POST /api/events/:id/attend should fail if user is already attending', async () => {
        const response = await request(app)
            .post(`/api/events/${testEventId}/attend`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.statusCode).toBe(400);
    });

    it('DELETE /api/events/:id/attend should allow a user to cancel attendance', async () => {
        const response = await request(app)
            .delete(`/api/events/${testEventId}/attend`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
    });

    // Pulisce SOLO DOPO tutti i test di questo suite
    afterAll(async () => {
        // pulizia finale del DB per questo suite
        await User.deleteMany({});
        await Event.deleteMany({});
    });
});