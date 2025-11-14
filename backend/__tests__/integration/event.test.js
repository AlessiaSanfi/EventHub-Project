/**
 * @file Test di Integrazione per le Operazioni CRUD sugli Eventi.
 * @description Contiene i test di integrazione completi per la creazione, lettura, aggiornamento ed eliminazione di un evento (Event CRUD) gestite da eventRoutes.
 */

const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Event = require('../../models/Event');
const mongoose = require('mongoose'); 

// Variabili per l'autenticazione
let adminToken;
let adminUser;
let userId;

// Dati fittizi per l'evento
const eventData = {
    title: 'Conferenza Test Backend',
    description: 'Test di integrazione per la creazione di un evento.',
    date: new Date(Date.now() + 86400000).toISOString(),
    location: 'Sede Test',
    capacity: 100,
    category: 'Tecnologia',
};

// Hook per ottenere l'autenticazione prima di tutti i test
beforeAll(async () => {
    
    // 1. Crea l'utente Admin nel DB di test
    adminUser = await User.create({
        username: 'testadmin',
        email: 'admin@test.it',
        password: 'password123',
        role: 'admin'
    });

    // Ottieni l'ID ObjectId e il Token JWT
    adminToken = adminUser.getSignedJwtToken(); 
    userId = adminUser._id; 
}, 35000);

describe('Event CRUD Operations', () => {
    let createdEventId;

    it('should perform complete CRUD operations on an event', async () => {
        // CREATE
        let response = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${adminToken}`) 
            .send(eventData);
        
        expect(response.statusCode).toBe(201);
        createdEventId = response.body.data._id;
        console.log('✓ Event created:', createdEventId);

        // READ
        response = await request(app)
            .get(`/api/events/${createdEventId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.data._id).toBe(createdEventId);
        console.log('✓ Event retrieved');

        // UPDATE
        const updateData = {
            title: 'Conferenza Test Backend Aggiornata',
            description: 'Descrizione aggiornata'
        };
        
        response = await request(app)
            .put(`/api/events/${createdEventId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.data.title).toBe(updateData.title);
        console.log('✓ Event updated');

        // DELETE
        response = await request(app)
            .delete(`/api/events/${createdEventId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.statusCode).toBe(200);
        console.log('✓ Event deleted');
    });
});