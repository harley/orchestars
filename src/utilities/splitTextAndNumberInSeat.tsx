/**
 * 
 * @param value eg: A1, A2, B1
 * @returns 
 */
export function splitTextAndNumber(value: string) {
  const match = value.match(/^([A-Za-z]+)(\d+)$|^(\d+)([A-Za-z]+)$/)
  if (!match) return null

  if (match[1] && match[2]) {
    // Format: letters first, then numbers (e.g., A1, AA10)
    return {
      text: match[1],
      number: parseInt(match[2], 10),
    }
  } else {
    // Format: numbers first, then letters (e.g., 3B, 10AA)
    return {
      text: match[4],
      number: parseInt(match[3] as string, 10),
    }
  }
}
