import { HINT_COST } from '../config/constants.js'

export const generateHint = (correct, category) => {
  const types = [
    () => `The answer has ${correct.length} letters`,
    () => `The answer starts with the letter ${correct[0].toUpperCase()}`,
    () => `Think about ${getCategoryHint(category)}`,
  ]
  const hint = types[Math.floor(Math.random() * types.length)]()
  return { hint, cost: HINT_COST }
}

const getCategoryHint = (category) => {
  const hints = {
    'General Knowledge': 'common facts',
    'Science': 'scientific concepts',
    'History': 'historical events',
    'Geography': 'world locations',
    'Sports': 'athletes and games',
    'Music': 'songs and artists',
    'Movies': 'films and actors',
    'Technology': 'gadgets and software',
    'Art & Literature': 'books and paintings',
    'Animals': 'creatures and wildlife',
    'Mathematics': 'numbers and equations',
    'Mythology': 'gods and legends',
    'Politics': 'leaders and laws',
    'Vehicles': 'cars and machines',
  }
  return hints[category] || 'the topic'
}