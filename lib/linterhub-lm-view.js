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
      const message = document.createElement('label');
      message.classList.add("input-label");
      message.classList.add("text-highlight");
      message.style.paddingTop = "15px";
      message.style.width = "100%";
      message.style.display = "block"
      message.style.fontSize = "9pt"
      message.id = "lint-" + linter.name;

      const inp = document.createElement('input');
      inp.classList.add('input-toggle')
      inp.type = 'checkbox';
      inp.style.marginRight = "10px"
      inp.setAttribute("checked", 1)
      if(!linter.active)
        inp.removeAttribute("checked");
      message.appendChild(inp);

      message.innerHTML += linter.name + ": ";

      const description = document.createElement('span');
      description.classList.add('block');
      description.classList.add('text-subtle');
      description.innerHTML = linter.description;

      const badge = document.createElement('span');
      badge.classList.add('badge');
      badge.innerHTML = linter.languages;
      badge.style.float = "right";
      badge.style.marginLeft = "10px"
      message.appendChild(badge);

      message.appendChild(description);
      this.element.appendChild(message);

      // руки бы мне за такое оторвать
      this.subs.add(message, 'change', this._call);
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
