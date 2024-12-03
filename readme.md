# MySQL Intro

Det blev mycket nytt idag, men här är en sammanfattning av hur du startar upp allt med Nodejs. Det är mer eller mindre samma varje gång du startar ett nytt projekt, så när du skrivit allt en 100 ggr så sitter det 🦹.

Vi skapade en databas med fåglar och fågelarter.

mysql> describe birds;
+------------+-----------------+------+-----+---------+----------------+
| Field      | Type            | Null | Key | Default | Extra          |
+------------+-----------------+------+-----+---------+----------------+
| id         | bigint unsigned | NO   | PRI | NULL    | auto_increment |
| species_id | bigint unsigned | YES  |     | NULL    |                |
| name       | varchar(255)    | YES  |     | NULL    |                |
| wingspan   | int             | YES  |     | NULL    |                |
+------------+-----------------+------+-----+---------+----------------+
4 rows in set (0.01 sec)

mysql> describe species;
+--------------+-----------------+------+-----+---------+----------------+
| Field        | Type            | Null | Key | Default | Extra          |
+--------------+-----------------+------+-----+---------+----------------+
| id           | bigint unsigned | NO   | PRI | NULL    | auto_increment |
| name         | varchar(255)    | YES  |     | NULL    |                |
| latin        | varchar(255)    | YES  |     | NULL    |                |
| wingspan_min | int             | YES  |     | NULL    |                |
| wingspan_max | int             | YES  |     | NULL    |                |
+--------------+-----------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)

Du hittar en sql dump i filen [webbserver.sql](webbserver.sql). Du kan importera den i tableplus eller med kommandot `mysql -u USER -p webbserver < webbserver.sql`.

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

Om vi redigerar routen till namnet `/birds` så följer vi REST-principen och gör det tydligare vad vi får tillbaka, en lista med alla fåglar.

För att använda REST så kan vi även skapa en route för att hämta en specifik fågel:

```javascript
app.get('/birds/:id', async (req, res) => {
  const [bird] = await pool.promise().query('SELECT * FROM birds WHERE id = ?', [req.params.id])

  res.json(bird)
})
```

Här använder vi :id i routen för att läsa in id:t som skickas med i URL:en. Vi kan sedan använda oss av `req.params.id` för att hämta ut fågeln med det specifika id:t ur databasen.

## Nunjucks och views

För att rendera ut HTML så kan vi använda oss av Nunjucks. Vi kan skapa en mapp som heter views och där lägga våra vyer. Vi kan sedan använda oss av `res.render` för att rendera ut en vy.

För att använda oss av Nunjucks så behöver vi installera `nunjucks`:

```bash
npm i nunjucks
```

Vi behöver också uppdatera vårt dev script i package.json så att vi lyssnar i ändringar på fler filtyper:

```json
"dev": "nodemon -e js,html,njk,json,css ./server.js"
```

Vi behöver sedan konfigurera Nunjucks i server.js:

```javascript
import nunjucks from 'nunjucks'

nunjucks.configure('views', {
  autoescape: true,
  express: app
})
```

## Views

Skapa en mapp som heter views och en fil som heter layout.njk:
Använd dig av Emmet och skriv `html:5` för att få en grundstruktur på din HTML-fil.

```html
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>
</head>
<body>
  {% block content %}{% endblock %}
</body>
</html>
```

Skapa en fil som heter index.njk:
```html
{% extends "layout.njk" %}

{% block content %}
  <h1>{{ title }}</h1>
  <p>{{ message }}</p>
{% endblock %}
```

## Birds och bird

Här är din uppgift att skapa en birds.njk som du använder för att visa alla fåglar.

Sidan ska använda en nunjucks loop för att loopa igenom alla fåglar och visa upp dem. Det ska gå att klicka på varje fågel för att komma till en sida som visar mer information om den specifika fågeln.

[Nunjucks for loop](https://mozilla.github.io/nunjucks/templating.html#for)

Länkarna skriver ni ut i loopen och där får ni använda href="/birds/{{ data från databasen }}.

### Router

GET /birds
GET /birds/:id

## CRUD

När vi jobbar med data och databaser så pratar vi ofta om CRUD, Create, Read, Update och Delete. Det är de fyra mest grundläggande operationerna som vi kan göra mot en databas.

Det är dock inte alltid som vi behöver alla fyra och som vanligast så är inte heller alla fyra tillgängliga för alla användare. Det är också så att de inte nödvändigtvis skapas i den ordningen, utan det är mer en beskrivning av vad vi kan göra.

### Read

Vi har redan gjort en Read-operation, vi har hämtat ut alla fåglar och en specifik fågel.

Read görs med en GET-request och vi kan använda oss av en query för att hämta ut data från databasen. Vi väljer sedan data med en SELECT-query.

För att hämta en specifik rad ur tabellen så använder vi oss av WHERE och anger vilket id vi vill hämta. Id't vi vill hämta skickas med url:en eller en query och finns då tillgänglig i request-objektet.

### Create

För att skapa en ny fågel så kan vi använda oss av en POST-request. Vi kan skapa en form i vår vy som skickar med informationen till en ny route.

För att skapa en species så krävs det ingen extra data från tabellerna, men det skiljer sig för birds då vi faktiskt behöver en species_id för att skapa en ny fågel.

I båda fallen med våra tabeller så behöver vi inte skicka med id:t, det sköter databasen själv. Vi kan använda oss av auto_increment för att skapa ett nytt id.

Vi kommer också att testköra create frågor med tableplus för att se att det fungerar.

#### Ny art 

För att skapa en ny species så behöver vi routa till det, för att följa rest så kan vi använda oss av /species, där vi följer samma princip som för birds.

* GET /species - Hämta alla arter
* GET /species/:id - Hämta en specifik art
* GET /species/new - Formulär för att skapa en ny art
* POST /species - Skapa en ny art

Din uppgift är att skapa routesen för species. Här kommer informationen som vi behöver för att skapa en ny art.

Skapa en ny template för formuläret, `species_form.njk`, som du sedan renderar ut i din route. Formuläret ska skicka en POST-request till /species.

```html
<form action="/species" method="POST">
  <label for="name">Name</label>
  <input type="text" name="name" id="name">
  <label for="latin">Latin</label>
  <input type="text" name="latin" id="latin">
  <label for="wingspan_min">Wingspan min</label>
  <input type="number" name="wingspan_min" id="wingspan_min">
  <label for="wingspan_max">Wingspan max</label>
  <input type="number" name="wingspan_max" id="wingspan_max">
  <button type="submit">Submit</button>
</form>
```

Formuläret tar emot samtlig data från användaren som behövs för att skapa en ny art. När formuläret skickas så skickas det till /species och där kan vi sedan använda oss av `req.body` för att hämta ut datan.

```javascript
app.post('/species', async (req, res) => {
  const { name, latin, wingspan_min, wingspan_max } = req.body

  const [result] = await pool.promise().query('INSERT INTO species (name, latin, wingspan_min, wingspan_max) VALUES (?, ?, ?, ?)', [name, latin, wingspan_min, wingspan_max])

  res.json(result)
})
```

Här är det viktigt att komma ihåg att vi inte ska skicka med id:t, det sköter databasen själv. Vi kan sedan använda oss av `res.json` för att skicka tillbaka resultatet av vår query (detta är dock mer av en test). Vi kan sedan skicka användaren vidare till en annan vy eller en annan route.

```js
res.redirect('/species')
```

Med det på plats så kan nu användaren skapa ny arter, nästa steg är att använda sig av den informationen för att skapa nya fåglar.

#### Ny fågel

För att skapa en ny fågel så behöver vi en species_id, det är en referens till vilken art fågeln tillhör. Vi kan använda oss av en select i formuläret för att välja vilken art fågeln tillhör.

Det viktiga här är att i din GET /birds/new så skickar du med informationen om alla arter som finns i databasen. Detta gör du genom att hämta ut alla arter och skicka med dem till din vy.

```javascript
app.get('/birds/new', async (req, res) => {
  const [species] = await pool.promise().query('SELECT * FROM species')

  res.render('birds_form.njk', { species })
})
```

I din vy så kan du sedan använda dig av en select för att visa upp alla arter som finns i databasen.

```html
<form action="/birds" method="POST">
  <label for="name">Name</label>
  <input type="text" name="name" id="name">
  <label for="wingspan">Wingspan</label>
  <input type="number" name="wingspan" id="wingspan">
  <label for="species_id">Species</label>
  <select name="species_id" id="species_id">
    <option value="1">Art 1</option>
    <option value="2">Art 2</option>
    <option value="3">Art 3</option>
  </select>
  <button type="submit">Submit</button>
</form>
```

Formuläret skickar med species_id, name och wingspan till /birds. Vi kan sedan använda oss av `req.body` för att hämta ut datan.

```javascript
app.post('/birds', async (req, res) => {
  const { name, wingspan, species_id } = req.body

  const [result] = await pool.promise().query('INSERT INTO birds (name, wingspan, species_id) VALUES (?, ?, ?)', [name, wingspan, species_id])

  res.json(result)
})
```

När en ny fågel skapas så skickas användaren vidare till en annan vy eller en annan route.

#### Förbättringar

Det går också att låta användaren skapa en art direkt när hen skapar en fågel, det kräver dock att en fråga körs för att skapa en ny art och sedan en fråga för att skapa en ny fågel. Det kan absolut vara en bra övning att prova att skapa.

#### Säkerhet

När vi jobbar med formulär så är det viktigt att tänka på säkerheten. Det är viktigt att validera datan som skickas in och att inte lita på att användaren skickar in korrekt data.

Vi kommer att gå igenom detta senare under kursen för det är ett viktigt och stort ämne.

### Update

### Delete


