'use babel';

export default class LintersManagerView {
  constructor(data) {
    this.element = document.createElement('div');
    this.element.classList.add('linterhub-atom');
    this.element.id = 'linterhub-atom-lm-view';
    this.element.style.padding = '15px';

    const head = document.createElement('h1');
    head.classList.add('block');
    head.innerHTML = 'Linters Manager';
    head.style.marginBottom = '25px';
    this.element.appendChild(head);

    const closeButton = document.createElement('div');
    closeButton.classList.add('linterhub-atom-lm-closeButton');
    closeButton.classList.add('close');
    closeButton.classList.add('icon');
    closeButton.classList.add('icon-x');
    this.element.appendChild(closeButton);

    const searchCont = document.createElement('div');
    searchCont.classList.add('native-key-bindings');
    this.element.appendChild(searchCont)

    const linterSearch = document.createElement('input');
    linterSearch.type = 'search';
    linterSearch.autofocus = 'true';
    linterSearch.placeholder = 'Start type linter name...';
    linterSearch.classList.add('linterhub-atom-lm-linterSearch');
    searchCont.appendChild(linterSearch);

    const linterContainer = document.createElement('div');
    linterContainer.classList.add('linterhub-atom-lm-linterContainer');
    this.element.appendChild(linterContainer);

    data.forEach((linter) => {
      const block = document.createElement('label');
      block.classList.add('linterhub-atom-lm-block');
      block.classList.add('input-label');
      block.classList.add('text-highlight');
      block.id = 'lint-' + linter.name;

      const inp = document.createElement('input');
      inp.classList.add('linterhub-atom-lm-checkbox');
      inp.classList.add('input-toggle');
      inp.style.marginRight = '10px';
      inp.type = 'checkbox';
      inp.setAttribute('checked', 1);
      if (!linter.active) {
        inp.removeAttribute('checked');
      }

      const description = document.createElement('span');
      description.classList.add('linterhub-atom-lm-description');
      description.classList.add('block');
      description.classList.add('text-subtle');
      description.innerHTML = linter.description;

      const badge = document.createElement('span');
      badge.classList.add('linterhub-atom-lm-badge');
      badge.classList.add('badge');
      badge.innerHTML = linter.languages;

      block.appendChild(inp);
      block.innerHTML += linter.name + ': ';
      block.appendChild(badge);
      block.appendChild(description);
      linterContainer.appendChild(block);
    });
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}
