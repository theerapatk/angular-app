// const express = require('express')
// const app = express();
// const port = 8000;

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// });

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}!`)
// });

const express = require('express');
const app = express(),
    bodyParser = require('body-parser');
port = 3080;

const users = [];

app.use(bodyParser.json());
app.use(express.static(process.cwd() + '/pokedex-app/dist/pokedex/'));

app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/user', (req, res) => {
    const user = req.body.user;
    users.push(user);
    res.json('user addedd');
});

app.get('/', (req, res) => res.sendFile(process.cwd() + '/pokedex-app/dist/pokedex/index.html'));
app.get('/*', (req, res) => res.sendFile(process.cwd() + '/pokedex-app/dist/pokedex/index.html'));

app.listen(port, () => console.log(`** Server is listening on localhost:${port}, open your browser on http://localhost:${port}/ **`));