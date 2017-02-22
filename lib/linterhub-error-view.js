'use babel';

export default class LintersErrorView {

  constructor(linter, message, file) {
    this.element = document.createElement('span');

    hide = document.createElement('span');
    hide.classList.add('inline-block')
    hide.classList.add('highlight-info')
    hide.classList.add('hide-warning')
    hide.innerHTML += "Ignore";
    hide.style.cursor = "pointer";
    hide.setAttribute("linter-name", linter);
    hide.setAttribute("rule-name", message.Rule.Name);
    hide.setAttribute("file-name", file);
    hide.setAttribute("line-number", message.Line);
    this.element.appendChild(hide);

    const description = document.createElement('span');
    description.innerHTML = linter + ": " + message.Message + " ";
    this.element.appendChild(description);
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
