'use babel';

class ProgressStep {
    constructor() {
        this.parts = process.platform === 'win32' ?
            ['-', '\\', '|', '/'] :
            ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.index = 0;
    }
    next() {
        return this.parts[this.index = ++this.index % this.parts.length];
    }
}

export default class LinterhubStatusView {

  constructor() {
    this.element = document.createElement('div');
    this.element.style.display = 'inline-block'
    this.element.style.color = "white"

    const progress = document.createElement('div');
    progress.style.display = 'inline-block'
    progress.id = "linterhub-status-progress";
    this.element.appendChild(progress);

    let progressStep = new ProgressStep();
    setInterval(function () {
        if(atom.config.get('linterhub-atom.progress'))
        {
          progress.textContent = progressStep.next();
        }
        else {
          progress.textContent = ' ';
        }
    }, 80);

    const name = document.createElement('div');
    name.style.display = 'inline-block'
    name.style.marginRight = "5px"
    name.style.marginLeft = "2px"
    name.id = "linterhub-status-name";
    name.textContent = "Linterhub: ";
    this.element.appendChild(name);

    const message = document.createElement('div');
    message.style.display = 'inline-block'
    message.id = "linterhub-status-text";
    this.element.appendChild(message);
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  changeStatus(text)
  {
    const element = this.element.lastChild;
    element.textContent = text;
  }

  getElement() {
    return this.element;
  }

}
