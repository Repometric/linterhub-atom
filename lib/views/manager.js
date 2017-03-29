'use babel';

import { Linterhub, LinterhubTypes } from 'linterhub-ide';
import * as Mustache from "mustache";
import * as fs from 'fs';
import * as path from 'path';
let DOMListener = require('dom-listener');

export default class LintersManagerView {

  constructor(subscriptions)
  {
    const listener = new DOMListener(document);
    listener.add('.linterhub-atom-lm-block', 'change', (event) => {
      atom.commands.dispatch(
        event.currentTarget, 'linterhub-atom:activate_linter');
    });
    const listenerCloseButton = new DOMListener(document);
    listenerCloseButton.add(
      '.linterhub-atom-lm-closeButton', 'mousedown', (event) => {
        atom.commands.dispatch(event.target, 'linterhub-atom:hide');
    });
    const listenerSearch = new DOMListener(document);
    listenerSearch.add('.linterhub-atom-lm-linterSearch', 'input', (event) => {
      atom.commands.dispatch(event.target, 'linterhub-atom:search');
    });
    subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:hide': () => this.hide(),
      'linterhub-atom:search': (event) => this.linterSearch(event),
      'linterhub-atom:activate_linter': (event) => this.managerCallback(event),
    }));
  }

  init(data) {
    this.template = fs.readFileSync(path.join(__dirname, '/templates/manager.html'), "utf-8");
    this.element = document.createElement('span');
    this.element.id = 'linterhub-managerview';
    this.element.innerHTML = Mustache.render(this.template, { linters: data });
  }

  show()
  {
    if (this.panel != null) {
      this.panel.show();
      document.getElementsByClassName(
        'linterhub-atom-lm-linterSearch'
      )[0].focus();
    } else {
      Linterhub.catalog().then((result) => {
        this.init(result);
        this.panel = atom.workspace.addModalPanel({
          item: this.getElement(),
          visible: false,
        });
        this.panel.show();
      });
    }
  }

  hide() {
    if (this.panel != null) {
      document.getElementsByClassName(
        'linterhub-atom-lm-linterSearch')[0].value = '';
      const allLinters = document.getElementsByClassName(
        'linterhub-atom-lm-block');
      for (let i = 0; i < allLinters.length; i++) {
        allLinters[i].style.display = 'block';
      }
      this.panel.hide();
    };
  }

  /**
  * Linter activate/deactivate callback
  *
  * @param {Object} event - Link to event node ---------------------
  */
  managerCallback(event) {
    // FIX THIS
    let checked = event.target.childNodes[0].checked;
    console.log(checked);
    let linter = event.target.id.split('-')[1];
    if (checked) {
      Linterhub.activate(linter).then(() => {
        atom.notifications.addSuccess('Linter ' + linter + ' activated!');
      });
    } else {
      Linterhub.deactivate(linter).then(() => {
        atom.notifications.addSuccess('Linter ' + linter + ' deactivated!');
      });
    }
  }

  linterSearch(event) {
    let value = event.target.value;
    let patt = new RegExp(value, 'i');
    const allLinters = document.getElementsByClassName('linterhub-atom-lm-block');
    for (let i = 0; i < allLinters.length; i++) {
      if (!patt.test(allLinters[i].id.replace('lint-', '')) &&
          !patt.test(allLinters[i].childNodes[3].textContent)) {
        allLinters[i].style.display = 'none';
      } else {
        allLinters[i].style.display = 'block';
      }
    }
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}
