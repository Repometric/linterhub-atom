'use babel';

export default class LintersErrorView {

  constructor(linter, message, file) {
    this.element = document.createElement('span');

    const description = document.createElement('span');
    description.innerHTML = linter + ": " + message.Message + " ";
    this.element.appendChild(description);

    this.hide = document.createElement('span');
    this.hide.classList.add('inline-block')
    this.hide.classList.add('highlight-info')
    this.hide.classList.add('hide-warning')
    this.hide.innerHTML += "Ignore";
    this.hide.style.cursor = "pointer";
    this.hide.setAttribute("linter-name", linter);
    this.hide.setAttribute("rule-name", message.Rule.Name);
    this.hide.setAttribute("file-name", file);
    this.hide.setAttribute("line-number", message.Line);
    this.element.appendChild(this.hide);
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
