export function reverseWords(sentence) {
  if (!sentence) return '';
  return sentence.split('').reverse().join('');
}

function jumbleWord(word) {
  if (!word || word.length <= 2) return word;

  const chars = word.split('');
  // Fisher-Yates (Durstenfeld) shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const jumbled = chars.join('');
  // Retry if somehow it's the same (rare for longer words)
  return (jumbled === word && word.length > 3) ? jumbleWord(word) : jumbled;
}

export function jumbleWords(sentence) {
  if (!sentence) return '';
  return sentence.split(' ').map(jumbleWord).join(' ');
}

export function calculateWPM(correctChars, timeSeconds) {
  if (timeSeconds <= 0) return 0;
  return Math.round((correctChars / 5) / (timeSeconds / 60));
}

export function calculateAccuracy(correctChars, totalTyped) {
  if (totalTyped <= 0) return 0;
  return ((correctChars / totalTyped) * 100).toFixed(1);
}

export function compareText(expected, typed) {
  let correctChars = 0;
  const typedLength = typed.length;
  const expectedLength = expected.length;

  for (let i = 0; i < typedLength; i++) {
    if (i < expectedLength && typed[i] === expected[i]) {
      correctChars++;
    }
  }
  return {
    correctChars,
    accuracy: calculateAccuracy(correctChars, typedLength),
    isCorrect: typed === expected
  };
} 