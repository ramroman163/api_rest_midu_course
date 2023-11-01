const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const { getMoviesPagination } = require('./functions/pagination')

const app = express()

app.disable('x-powered-by')

app.use(express.json())

const ACCEPTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:1234',
  'http://localhost:8080',
  'https://google.com/'
]

app.get('/movies', (req, res) => {
  const origin = req.headers.origin

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  if (req.query.genre) {
    console.log('Filtrado por género')
    const { genre } = req.query

    if (genre) {
      const filteredMovies = movies.filter((movie) => movie.genre.some(movieGenre => movieGenre.toLowerCase() === genre.toLowerCase()))

      return res.json(filteredMovies)
    }

    res.json(movies)
  }

  if (req.query.page) {
    console.log('Filtrado por página')
    const { page } = req.query

    const result = getMoviesPagination(movies, parseInt(page))

    if (!result.length) {
      return res.json({ message: 'Error al realizar paginación' })
    }

    return res.json(result)
  }

  return res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params

  const movie = movies.find(movies => movies.id === id)

  if (movie) return res.json(movie)
  else return res.status(404).json({ message: 'movie not found!' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  // Ta mal, no es REST porque estamos guardando el estado de peliculas
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie

  res.status(200).json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const origin = req.headers.origin

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
  }

  res.sendStatus(200)
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
