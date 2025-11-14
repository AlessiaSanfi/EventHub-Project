/**
 * @file Test di Integrazione per l'Autenticazione Utente.
 * @description Contiene i test di integrazione per le rotte di registrazione e login (CRUD) gestite da authRoutes.
 */

const request = require('supertest');
const app = require('../../app'); // Importa l'istanza 'app' da app.js

// Descrive il test suite per le rotte di Autenticazione
describe('POST /api/auth/register', () => {
    it('should successfully register a new user and return a JWT', async () => {
        const userData = {
            username: 'TestUser',
            email: 'testuser@example.com',
            password: 'Password123!',
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        // Verifica lo stato HTTP
        expect(response.statusCode).toBe(201);
        
        // Verifica che la risposta contenga il token e i dati utente
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.username).toBe('TestUser');
        expect(response.body.user.role).toBe('user'); // Verifica il ruolo predefinito
    });

    it('should return 400 if required fields are missing', async () => {
        const incompleteData = {
            username: 'Incomplete',
            // Manca l'email e la password
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(incompleteData);

        expect(response.statusCode).toBe(400);
        // Assicurati che il messaggio di errore corrisponda a quello del tuo controller
        expect(response.body.message).toContain('Errore di validazione'); 
    });
});