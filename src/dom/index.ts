export const width = (node: HTMLElement): number => node.offsetWidth
export const height = (node: HTMLElement): number => node.offsetHeight

export const cloneHTML = (): HTMLElement | null => {
  const node = document.querySelector('html')
  return node ? (node.cloneNode(true) as HTMLElement) : null
}

export const filterNode = (node: HTMLElement, selector: string): HTMLElement => {
  node.querySelectorAll(selector).forEach((n) => n.remove())
  return node
}
