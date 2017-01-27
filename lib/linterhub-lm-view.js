'use babel';

let SubAtom = require('sub-atom')

export default class LintersManagerView {

  constructor(data) {
    this.subs = new SubAtom();

    this.element = document.createElement('div');
    this.element.classList.add('linterhub-atom');
    this.element.id = "linterhub-atom-lm-view";
    this.element.style.padding = "15px"

    const head = document.createElement('h1');
    head.classList.add('block');
    head.innerHTML = "Linters Manager";
    head.style.marginBottom = "10px"
    this.element.appendChild(head);

    data.forEach((linter) => {

      const block = document.createElement('label');
      block.classList.add('linterhub-atom-lm-block')
      block.classList.add('input-label')
      block.classList.add('text-highlight')
      block.id = "lint-" + linter.name;

      const inp = document.createElement('input');
      inp.classList.add('linterhub-atom-lm-checkbox')
      inp.classList.add('input-toggle')
      inp.style.marginRight = "10px"
      inp.type = 'checkbox';
      inp.setAttribute("checked", 1)
      if(!linter.active)
        inp.removeAttribute("checked");

      const description = document.createElement('span');
      description.classList.add('linterhub-atom-lm-description');
      description.classList.add('block');
      description.classList.add('text-subtle');
      description.innerHTML = linter.description;

      const badge = document.createElement('span');
      badge.classList.add('linterhub-atom-lm-badge')
      badge.classList.add('badge');
      badge.innerHTML = linter.languages;

      block.appendChild(inp);
      block.innerHTML += linter.name + ": ";
      block.appendChild(badge);
      block.appendChild(description);
      this.element.appendChild(block);

      this.subs.add(block, 'change', this._call);
    });
  }

  _call(variable)
  {
    atom.commands.dispatch(variable.currentTarget, "linterhub-atom:activate_linter")
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
