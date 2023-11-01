const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Title is required'
  }),
  year: z.number().int().min(1870).max(2024),
  director: z.string(),
  duration: z.number().int().min(0),
  rate: z.number().min(0).max(10).optional(),
  poster: z.string().url({
    message: 'Poster must be a URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Crime', 'Drama', 'Sci-Fi', 'Comedy']),
    {
      required_error: 'Genre is required',
      invalid_type_error: 'Genre must be string'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
