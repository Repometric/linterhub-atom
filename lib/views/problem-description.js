'use babel';

import * as Mustache from "mustache";
import * as fs from 'fs';
import * as path from 'path';

export default class LinterhubProblemView {

  constructor(_linter, _message, _file) {
    this.template = fs.readFileSync(path.join(__dirname, '/templates/problem-description.html'), "utf-8");
    this.element = document.createElement('span');
    this.element.id = 'linterhub-problem-description';
    this.element.innerHTML = Mustache.render(this.template, { linter: _linter, name: _message.Rule.Name, file: _file, line: _message.Line});
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

  getElement()
  {
    return this.element;
  }

}
