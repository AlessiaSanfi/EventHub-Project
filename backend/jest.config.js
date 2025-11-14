/**
 * @file Configurazione di Jest per i Test di Backend.
 * @description Definisce l'ambiente di testing, i file di setup da eseguire, e i percorsi da ignorare durante l'esecuzione dei test.
 */

module.exports = {
  // Esegue questo file prima di ogni test
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], 
    testEnvironment: 'node',

  // Ignora il file di setup quando cerca le suite di test.
    testPathIgnorePatterns: ["/node_modules/", "/jest.setup.js"],
};