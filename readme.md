# MySQL Intro

Det blev mycket nytt idag, men här är en sammanfattning av hur du startar upp allt med Nodejs. Det är mer eller mindre samma varje gång du startar ett nytt projekt, så när du skrivit allt en 100 ggr så sitter det 🦹.

## Starta upp projektet

Kör wsl, från din hemkatalog, du kan här byta ut `te22-mysql-intro` mot vad du vill att din mapp ska heta:

```bash
cd code
mkdir te22-mysql-intro
cd te22-mysql-intro
npm init -y
touch server.js
npm i express
npm i nodemon -D
```

När allt är klart så kan du öppna upp projektet i VSCode:

```bash
code .
```

Vi behöver sedan fixa så att vi kan köra ES6-moduler i Nodejs och ett tillhörande script för att köra servern:

Redigera package.json:
```json
"main": "server.js",
"type": "module",
"scripts": {
    "dev": "nodemon server.js"
}
```

Vi kommer i det här projektet använda oss av MySQL, så vi behöver installera `mysql2` och `dotenv`:

```bash
npm i mysql2 dotenv
```

## Server.js

För att testa att få igång servern så kan du skriva följande kod i server.js:

```javascript
import express from 'express'

const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
```

Testa att köra servern:

```bash
npm run dev
```

Surfa in på http://localhost:3000 och du ska se "Hello World!".

## MySQL

För att koppla upp oss mot MySQL behöver vi skapa en connection pool. Det gör vi i en egen fil som vi sedan kan importera i våra routes (och eller projekt).

Skapa db.js:
```javascript
  import mysql from 'mysql2'

const pool = mysql.createPool({
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
})

export default pool
```

I filen finns det upprepade referenser till `process.env`, det är för att vi ska kunna använda oss av en .env-fil för att hantera våra miljövariabler.

En .env fil är en fil som innehåller miljövariabler, som inte ska pushas till git. Det är en säkerhetsrisk att pusha upp sina miljövariabler till git, då det kan leda till att någon annan kan komma åt din databas.


Skapa och redigera .env:
```bash
DATABASE_HOST=localhost
DATABASE_USERNAME=root
DATABASE_PORT=3306
DATABASE_PASSWORD=secret
DATABASE_DATABASE=te22_mysql_intro
```

Skapa och redigera .gitignore:
```bash
node_modules
.env
```

För att andra ska kunna förstå hur de ska sätta upp sin .env-fil så kan du skapa en .env.example, det är för att när du klonar ner ett projekt så kan du se vilka miljövariabler som behövs:

## Använda dotenv

För att använda oss av .env-filen så behöver vi importera `dotenv` i vårt projekt. Det gör vi i server.js:

```javascript
import 'dotenv/config'
```

Klart, gör det som rad ett så att det är det första som körs i server.js. Viktigt att komma ihåg är att .env-filen måste ligga i rooten av projektet och att när du ändrar i .env-filen så måste du starta om servern för att ändringarna ska slå igenom.

## Exempel

Nu kan vi använda oss av db.js för att göra en enkel query mot vår databas:

Redigera server.js:
```javascript
app.get('/', async (req, res) => {
  const [birds] = await pool.promise().query('SELECT * FROM birds')

  res.json(birds)
})
```

Detta förutsätter såklart att du har en tabell som heter `birds` i din databas. 

