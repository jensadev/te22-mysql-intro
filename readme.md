```bash
cd code
mkdir te22-mysql-intro
cd te22-mysql-intro
npm init -y
touch server.js
npm i express
npm i nodemon -D
```

Redigera package.json:
```json
"main": "server.js",
"type": "module",
"scripts": {
    "dev": "nodemon server.js"
}
```

Redigera server.js:
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
