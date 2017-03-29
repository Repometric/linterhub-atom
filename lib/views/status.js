'use babel';

import * as Mustache from "mustache";
import * as fs from 'fs';
import * as path from 'path';

/**
* Linterhub status class
*/
export default class LinterhubStatusView {
  /**
  * Constructor for LinterhubStatusView
  */
  constructor() {
    this.template = fs.readFileSync(path.join(__dirname, '/templates/status.html'), "utf-8");
    this.element = document.createElement('span');
    this.element.id = 'linterhub-statusbar';
    this.render();
  }

  render(_status, _visibility){
    this.status = _status != null ? _status : this.status;
    this.visibility = _visibility != null ? _visibility : this.visibility;
    this.element.innerHTML = Mustache.render(this.template, { visibility: this.visibility, status: this.status});
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

}
