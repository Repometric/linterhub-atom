'use babel';

import * as path from 'path';
import { Linterhub, LinterhubTypes } from 'linterhub-ide';
import LinterhubProblemView from './views/problem-description';
let DOMListener = require('dom-listener');

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

let subscriptions
let linter

/**
*
*/
export class Integration {

  /**
  * @param {Object} project
  * @param {String} version - linterhub current version
  */
  constructor(project, _subscriptions, _linter) {
    this.project = project;
    this.logger = new Logger();
    this.status = new StatusLogger();
    this.status.update(null, false, 'Active');

    subscriptions = _subscriptions;
    linter = _linter;

    const ListenerBar = new DOMListener(document);
    ListenerBar.add('.hide-warning', 'click', (event) => {
      atom.commands.dispatch(event.target, 'linterhub-atom:warningCallback');
    });
    subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:warningCallback': (event) => this.warningCallback(event),
      'linterhub-atom:analyze_project': (event) => this.handleErrors(null)
    }));
  }

  init_subscriptions()
  {

    subscriptions.add(linter)

    var handleErrors = this.handleErrors;

    // Setting and clearing messages per filePath
    subscriptions.add(atom.workspace.observeTextEditors(function(textEditor) {
    const editorPath = textEditor.getPath()
      if (!editorPath) {
        return
      }

      handleErrors(editorPath);

      const changeSubscription = textEditor.onDidSave(function(event){
        handleErrors(event.path);
      })
      subscriptions.add(changeSubscription)

      const destroySubscription = textEditor.onDidDestroy(function() {
        subscriptions.remove(destroySubscription)
        subscriptions.remove(changeSubscription)
        linter.setMessages(editorPath, [])
      })

      subscriptions.add(destroySubscription)
    }));
  }

  handleErrors(_path)
  {
    if(_path != null) {
      Linterhub.analyzeFile(_path).then(function(data){
        linter.setMessages(_path, data);
      });
    }
    else {
      Linterhub.analyze().then(function(data){
        linter.setAllMessages(data);
      });
    }
  }

  /**
  * Warning callback
  *
  * @param {Object} event - Link to event node ---------------------
  */
  warningCallback(event) {
    // let linter = event.target.getAttribute('linter-name');
    let _warning = event.target.getAttribute('rule-name');
    if (_warning === 'null') _warning = null;
    let _file = event.target.getAttribute('file-name');
    if (_file === 'null') _file = null;
    let _line = event.target.getAttribute('line-number');
    if (_line === 'null') _line = null;
    let target = event.currentTarget;
    Linterhub.ignoreWarning({
      file: _file, line: _line, error: _warning,
    }).then(() => {
      this.handleErrors(_file);
    });
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
      case 3:
        severity = 'info';
        break;
    }
    let row = message.Row || {Start: message.Line, End: message.Line};
    let column = message.Column || {Start: message.Character, End: message.Character};
    if (column.Start == column.End) column.End = 10000;
    var position = [[row.Start - 1, column.Start - 1], [row.End - 1, column.End - 1]];

    return {
      description: (new LinterhubProblemView(linter, message, file)).getElement().innerHTML,
      severity: severity,
      location: {
        file: path.join(this.project, file),
        position: position,
      },
      excerpt: message.Message,
    };
  }
}
