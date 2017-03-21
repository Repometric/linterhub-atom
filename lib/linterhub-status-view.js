'use babel';
/**
* Linterhub status class
*/
export default class LinterhubStatusView {
  /**
  * Constructor for LinterhubStatusView
  */
  constructor() {
    this.element = document.createElement('div');
    this.element.style.display = 'inline-block';
    this.element.style.color = 'white';

    const progress = document.createElement('span');
    progress.classList.add('loading');
    progress.classList.add('loading-spinner-tiny');
    progress.classList.add('inline-block');
    progress.style.marginTop = '7px';
    progress.style.marginRight = '5px';
    progress.style.visibility = 'hidden';
    this.element.appendChild(progress);

    setInterval(() => {
      if (atom.config.get('linterhub-atom.progress')) {
        progress.style.visibility = 'visible';
      } else {
        progress.style.visibility = 'hidden';
      }
    }, 80);

    const name = document.createElement('div');
    name.style.display = 'inline-block';
    name.style.marginRight = '5px';
    name.style.marginLeft = '2px';
    name.id = 'linterhub-status-name';
    name.textContent = 'Linterhub: ';
    this.element.appendChild(name);

    const message = document.createElement('div');
    message.style.display = 'inline-block';
    message.id = 'linterhub-status-text';
    this.element.appendChild(message);
  }

  /**
  * Serialize
  */
  serialize() {}
  /**
  * Destroy LinterhubStatusView
  */
  destroy() {
    this.element.remove();
  }
  /**
  * Change status text function
  *
  * @param {String} text - linterhub state
  */
  changeStatus(text) {
    const element = this.element.lastChild;
    element.textContent = text;
  }
  /**
  * Get element function
  *
  * @return {Object} - Return LinterhubStatusView object
  */
  getElement() {
    return this.element;
  }

}
