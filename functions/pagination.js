function getMoviesPagination (movies, page) {
  if (typeof page === 'string' || page < 1) {
    return []
  }

  const maxPage = page * 5
  const minPage = maxPage - 5
  const moviesPagination = movies.slice(minPage, maxPage)

  return moviesPagination
}

module.exports = {
  getMoviesPagination
}
