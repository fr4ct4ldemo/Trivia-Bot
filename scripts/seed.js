import { addQuestion } from '../src/db/questions.js'

const questions = [
  {
    question: "What is the capital of Japan?",
    correct: "Tokyo",
    wrong: ["Osaka", "Kyoto", "Hiroshima"],
    category: "Geography",
    difficulty: "easy"
  },
  {
    question: "What is 2 + 2?",
    correct: "4",
    wrong: ["3", "5", "6"],
    category: "Mathematics",
    difficulty: "easy"
  },
]

const seed = async () => {
  for (const q of questions) {
    await addQuestion('test', q)
  }
  console.log('Seeded')
}

seed()