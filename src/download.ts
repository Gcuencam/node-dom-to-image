export const createLink = (url: string, name: string) => {
  const link = document.createElement('a')
  link.download = name
  link.href = url
  return link
}
