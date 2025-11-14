const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ----------------------------------------------------
// MOCKING: Simula le librerie esterne usate dai metodi d'istanza (matchPassword, getSignedJwtToken)
// ----------------------------------------------------
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Simula una struttura User essenziale (Mock dell'oggetto istanza Mongoose)
const mockUser = (id, role, password) => ({
    _id: id || '60c72b2f9c1b9c001c9a6a8b',
    role: role || 'utente',
    password: password || 'hashedPasswordFromDB',
    
    // Simula il metodo di istanza matchPassword (come se fosse implementato in models/User.js)
    matchPassword: async function(enteredPassword) {
        // Chiama la funzione di confronto di bcrypt (che è stata mockata)
        return await bcrypt.compare(enteredPassword, this.password);
    },

    // Simula il metodo di istanza getSignedJwtToken (come se fosse implementato in models/User.js)
    getSignedJwtToken: function() {
        return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });
    }
});


describe('User Model Utility Methods', () => {

    let user;

    beforeEach(() => {
        // Crea un utente di base per ogni test
        user = mockUser();
        // Reimposta tutti i mock prima di ogni test per isolare i risultati
        jest.clearAllMocks(); 
        
        // Simula le variabili d'ambiente (per il testing JWT)
        process.env.JWT_SECRET = 'JWT_SECRET_TEST';
        process.env.JWT_EXPIRE = '99d';
    });
    
    // ----------------------------------------------------
    // TEST 1: user.matchPassword()
    // ----------------------------------------------------
    describe('matchPassword', () => {
        it('should return true if the entered password matches the hashed password', async () => {
            // Istruisce il mock di bcrypt a restituire true
            bcrypt.compare.mockResolvedValue(true); 

            const isMatch = await user.matchPassword('PasswordCorretta123');
            
            // Verifica che bcrypt.compare sia stata chiamata correttamente
            expect(bcrypt.compare).toHaveBeenCalledWith('PasswordCorretta123', user.password);
            expect(isMatch).toBe(true);
        });

        it('should return false if the entered password does not match', async () => {
            // Istruisce il mock di bcrypt a restituire false
            bcrypt.compare.mockResolvedValue(false);

            const isMatch = await user.matchPassword('PasswordSbagliata');

            expect(bcrypt.compare).toHaveBeenCalled();
            expect(isMatch).toBe(false);
        });
    });

    // ----------------------------------------------------
    // TEST 2: user.getSignedJwtToken()
    // ----------------------------------------------------
    describe('getSignedJwtToken', () => {
        it('should sign a JWT with the correct payload (id and role)', () => {
            // Simula il risultato della firma JWT
            const expectedToken = 'fake.jwt.token';
            jwt.sign.mockReturnValue(expectedToken);

            const token = user.getSignedJwtToken();

            // Verifica che jwt.sign sia stata chiamata con payload, secret ed expire corretti
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: user._id, role: user.role }, // Payload
                process.env.JWT_SECRET,            // Secret
                { expiresIn: process.env.JWT_EXPIRE } // Options
            );
            expect(token).toBe(expectedToken);
        });
    });
});