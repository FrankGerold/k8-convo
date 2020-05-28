const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const keys = require('./keys');


// Express app setup
const app = express();
app.use(cors());
app.use(bodyParser.json());


// Postgres client setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

// Old:
// pgClient.on('error', () => console.log('Lost PG Connection'))
//
// pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch(err => console.log(err));
// 
// FIX:
pgClient.on('connect', () => {
  pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err=>console.log(err))
});


// Redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();


// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  let values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
});


app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});


app.post('/values', async (req, res) => {
  let index = req.body.index;

  if (parseInt(index) > 50) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

///////////////////////////////////////
// TESST

// const postGresTest = new Pool({
//   user: keys.pgUser,
//   host: keys.pgHost,
//   database: keys.pgDatabase,
//   password: keys.pgPassword,
//   port: keys.pgPort
// });
//
// postGresTest
//   .query('CREATE TABLE IF NOT EXISTS testes (number INT)')
//   .catch(err => console.log(err));
//
// postGresTest.query('INSERT INTO testes(number) VALUES($1)', 1);
//
// let select = () => postGresTest.query('SELECT * from values');
// console.log(select());
// select().then(r=>console.log('then', r))



// END TEST
///////////////////////////////




app.listen(5000, err => {
  console.log('Listening on port 5000');
})
