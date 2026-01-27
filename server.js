const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Erro ao criar tabela scores:', err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela users:', err.message);
            } else {
                console.log('Tabela "users" garantida.');
            }
        });
    }
});

// Auth Endpoints
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Usuario e senha obrigatorios' });

    const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(sql, [username, password], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Usuario ja existe' });
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, username });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(sql, [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Credenciais invalidas' });
        res.json({ id: user.id, username: user.username });
    });
});

// Endpoints
app.post('/api/scores', (req, res) => {
    const { name, score } = req.body;

    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Nome e pontuação são obrigatórios.' });
    }

    const sql = `INSERT INTO scores (name, score) VALUES (?, ?)`;
    db.run(sql, [name, score], function (err) {
        if (err) {
            console.error('Erro ao salvar score:', err.message);
            return res.status(500).json({ error: 'Erro interno ao salvar pontuação.' });
        }
        console.log(`Score salvo: ${name} - ${score}`);
        res.status(201).json({ id: this.lastID, name, score });
    });
});

app.get('/api/scores', (req, res) => {
    const sql = `SELECT * FROM scores ORDER BY score DESC LIMIT 10`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar scores:', err.message);
            return res.status(500).json({ error: 'Erro interno ao buscar pontuações.' });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
