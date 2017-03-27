'use babel';

import * as path from 'path';
// import * as fs from 'fs';
//import LintersErrorView from '../linterhub-error-view';

/**
*
*/
class Logger /* implements LoggerInterface*/ {
  /**
  *
  */
  constructor() {
    this.prefix = 'Linterhub: ';
  }
  /**
  * @param {String} string - Log message
  */
  info(string) {
    console.log(this.prefix + string.toString());
  }
  /**
  * @param {String} string - Log message
  */
  error(string) {
    console.error(this.prefix + string.toString());
    atom.notifications.addWarning(string);
  }
  /**
  * @param {String} string - Log message
  */
  warn(string) {
    console.warn(this.prefix + string.toString());
  }
}

/**
*
*/
class StatusLogger /* implements StatusInterface*/ {

  /**
  * @param {Object} params -
  * @param {Object} progress -
  * @param {String} text -
  */
  update(params, progress, text) {
    if (typeof progress !== 'undefined') {
      atom.config.set('linterhub-atom.progress', Boolean(progress));
    } else {
      atom.config.set('linterhub-atom.progress', true);
    }
    console.log(text);
    atom.config.set('linterhub-atom.status', text);
  }
}

/**
*
*/
export class Integration {

  /**
  * @param {Object} project
  * @param {String} version - linterhub current versionz
  */
  constructor(project) {
    this.project = project;
    this.logger = new Logger();
    this.status = new StatusLogger();
    this.status.update(null, false, 'Active');
  }

  /**
  * @param {Object} settings - Linterhub settings
  */
  saveConfig(settings) {
    console.log("Saving config..");
    atom.config.set('linterhub-atom.mode', settings.linterhub.mode);
    atom.config.set('linterhub-atom.path_cli', settings.linterhub.cliPath);
  }

  /**
  * @param {String} path - Current project path
  * @return {String} - Return curent project path
  */
  normalizePath(path) {
    return path;
  }

  /**
  * @param {Object} data -
  * @return {Object} -
  */
  sendDiagnostics(data) {
    let json = JSON.parse(data);
    let results = [];
    for (let index = 0; index < json.length; index++) {
      let linterResult = json[index];
      linterResult.Model.Files.forEach((file) => {
        file.Errors.forEach((error) => {
          results.push(this.convertError(error, linterResult.Name, file.Path));
        });
      });
    }
    return results;
  }

  /**
  * @param {Object} message -
  * @param {Object} linter -
  * @param {Object} file -
  * @return {Object} -
  */
  convertError(message, linter, file) {
    let severity = 'warning';
    switch (Number(message.Severity)) {
      case 0:
        severity = 'error';
        break;
      case 1:
        severity = 'warning';
        break;
      case 2:
        severity = 'info';
        break;
      case 3:
        severity = 'info';
        break;
    }
    let row = message.Row || {Start: message.Line, End: message.Line};
    /* let column = message.Column ||
    {Start: message.Character, End: message.Character};*/

    return {
      severity: severity,
      location: {
        file: path.join(this.project, file),
        position: [[row.Start - 1, 0], [row.End - 1, 10000]],/* TODO fix problem
        with ranges for jshint*/
      },
      excerpt: message.Message,
      //description: `### What is this?\nThis is a randomly generated value`
    };
  }
}
