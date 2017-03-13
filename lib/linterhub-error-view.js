'use babel'

export default class LintersErrorView {
  constructor (linter, message, file) {
    this.element = document.createElement('span')

    let hide = document.createElement('span')
    hide.classList.add('inline-block')
    hide.classList.add('highlight-info')
    hide.classList.add('hide-warning')
    hide.innerHTML += 'Ignore'
    hide.style.cursor = 'pointer'
    hide.setAttribute('linter-name', linter)
    hide.setAttribute('rule-name', message.Rule.Name)
    hide.setAttribute('file-name', file)
    hide.setAttribute('line-number', message.Line)
    this.element.appendChild(hide)

    let hide2 = document.createElement('span')
    hide2.classList.add('inline-block')
    hide2.classList.add('highlight-success')
    hide2.classList.add('hide-warning')
    hide2.innerHTML += 'Ignore in file'
    hide2.style.cursor = 'pointer'
    hide2.setAttribute('linter-name', linter)
    hide2.setAttribute('rule-name', message.Rule.Name)
    hide2.setAttribute('file-name', file)
    hide2.setAttribute('line-number', null)
    this.element.appendChild(hide2)

    const description = document.createElement('span')
    description.innerHTML = linter + ': ' + message.Message + ' '
    this.element.appendChild(description)
  }

  serialize () {}

  destroy () {
    this.element.remove()
  }

  getElement () {
    return this.element
  }
}
