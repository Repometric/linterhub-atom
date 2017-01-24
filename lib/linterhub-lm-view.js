'use babel';

export default class LintersManagerView {

  constructor(text) {
    this.element = document.createElement('div');
    this.element.classList.add('linterhub-atom');

    const message = document.createElement('div');
    message.textContent = text;
    message.classList.add('message');
    this.element.appendChild(message);
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
