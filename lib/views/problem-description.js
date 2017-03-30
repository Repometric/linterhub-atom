'use babel';

import * as Mustache from "mustache";
import * as fs from 'fs';
import * as path from 'path';

/*
* Linterhub Problem View. Used to show buttons for fixing problems
*/
export default class LinterhubProblemView {

  /**
  * @constructor
  * @param {String} _linter - Name of linter which generates this problem
  * @param {Object} _message - Describes problem (rule, line etc). For more information look at linterhub-ide documentation
  * @param {Object} _file - File path
  */
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
  * Destroy LinterhubProblemView
  */
  destroy() {
    this.element.remove();
  }

  /**
  * Get LinterhubProblemView element (used to add Problem View to every error in document)
  * @return {Object} - Dom Object for current view
  */
  getElement()
  {
    return this.element;
  }

}
