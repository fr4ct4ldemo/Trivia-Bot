import { categories } from '../config/categories.js'

export const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

export const getCategoryName = (id) => categoryMap[id] || 'Unknown'

export const getCategoryEmoji = (id) => categories.find(c => c.id === id)?.emoji || '❓'

export const getCategoryByName = (name) => categories.find(c => c.name === name)