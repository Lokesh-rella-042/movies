const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbpath = path.join(__dirname, 'moviesData.db')
const app = express()

app.use(express.json())

let db = null

const installingTheDbdata = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running')
    })
  } catch (error) {
    console.log(`DB ${error.message}`)
    process.exit(1)
  }
}

installingTheDbdata()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getPlayerQuery = `
       SELECT
         *
       FROM 
         movie
       WHERE 
         movie_id = ${movieId};`
  const playerResponse = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(playerResponse))
})

app.post('/movies/', async (request, response) => {
  const postingMovieDetalis = request.body
  const {directorId, movieName, leadActor} = postingMovieDetalis

  const postingQuery = `
  INSERT INTO 
    movie ( 'director_id', 'movie_name', 'lead_actor')
  VALUES 
          ( ${directorId}, '${movieName}', '${leadActor}')`
  await db.run(postingQuery)
  response.send('Movie Successfully Added')
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const specificDirectorsQuery = `
        SELECT
          movie_name
        FROM 
          movie
        WHERE 
          director_id = ${directorId};`
  const specificResponse = await db.all(specificDirectorsQuery)
  response.send(
    specificResponse.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.put('/movies/:movieId/', async (request, response) => {
  const puttingMovieValues = request.body
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = puttingMovieValues
  const putMovieQuery = `
  UPDATE
    movie 
  SET 
  director_id = ${directorId},
  movie_name  = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE
  movie_id = ${movieId};
  `
  await db.run(putMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/movies/', async (request, response) => {
  const getMovieNames = `
       SELECT
           movie_name
       FROM
           movie;`
  const getAllNames = await db.all(getMovieNames)
  response.send(
    getAllNames.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

const convertDbObjectToResponseObjectDirectors = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const getdirectorsNames = `
       SELECT
           *
       FROM
           director;`
  const specificResponse = await db.all(getdirectorsNames)
  response.send(specificResponse)
})

module.exports = app
