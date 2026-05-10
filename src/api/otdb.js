import fetch from 'node-fetch'
import { decodeHtml } from './decoder.js'

let token = null

const getToken = async () => {
  if (!token) {
    const res = await fetch('https://opentdb.com/api_token.php?command=request')
    const data = await res.json()
    token = data.token
  }
  return token
}

const fetchFromApi = async (url) => {
  const res = await fetch(url)
  const data = await res.json()
  if (data.response_code === 3 || data.response_code === 4) {
    token = null
    throw new Error('Token exhausted')
  }
  if (data.response_code !== 0) {
    throw new Error(`API error: ${data.response_code}`)
  }
  return data.results
}

export const fetchQuestion = async (categoryId, difficulty) => {
  const tok = await getToken()
  const url = `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=${difficulty}&token=${tok}`
  const results = await fetchFromApi(url)
  return normalize(results[0])
}

export const fetchBatch = async (amount, categoryId, difficulty) => {
  const tok = await getToken()
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&token=${tok}`
  const results = await fetchFromApi(url)
  return results.map(normalize)
}

const normalize = (q) => {
  const question = decodeHtml(q.question)
  const correct = decodeHtml(q.correct_answer)
  const wrongs = q.incorrect_answers.map(decodeHtml)
  const choices = [correct, ...wrongs].sort(() => Math.random() - 0.5)
  return {
    question,
    correct,
    choices,
    category: q.category,
    difficulty: q.difficulty,
    categoryId: q.category_id,
  }
}