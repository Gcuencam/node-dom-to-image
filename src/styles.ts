export const getStylesFromFile = (node: HTMLElement) => {
  const stylesheet = document.querySelector<HTMLLinkElement>('[rel="stylesheet"]')
  if (stylesheet?.sheet) {
    const head = node.querySelector('head')
    const cssContent = Array.from(stylesheet.sheet.cssRules)
      .map((rule) => rule.cssText)
      .join('\n')
    const style = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(document.createTextNode(cssContent))
    head?.appendChild(style)
  }
}
