import "dotenv/config"
import express from "express"
import pool from "./db.js"

const app = express()
const port = 3000

app.get("/birds", async (req, res) => {
  // const [birds] = await pool.promise().query('SELECT * FROM birds')
  const [birds] = await pool
    .promise()
    .query(
      `SELECT birds.*, species.name AS species 
      FROM birds 
      JOIN species ON birds.species_id = species.id;`,
    )
  res.json(birds)
})

app.get("/birds/:id", async (req, res) => {
  const [bird] = await pool
    .promise()
    .query(
      `SELECT birds.*, species.name AS species 
      FROM birds 
      JOIN species ON birds.species_id = species.id WHERE birds.id = ?;`,
      [req.params.id],
    )
  res.json(bird[0]) // ditt jobb är att skapa en res.render med nunjucks här
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
