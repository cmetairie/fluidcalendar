export function wait(secondes) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(timer)
    }, secondes * 1000)
  })
}
