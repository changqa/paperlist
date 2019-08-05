const express = require('express');

const paperListController = require('./controller/paperListController');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(express.json());

paperListController(app);

app.listen(3000);
