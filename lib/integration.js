'use babel';

import * as path from 'path';
import {
    Linterhub,
} from 'linterhub-ide';
import LinterhubProblemView from './views/problem-description';
let DOMListener = require('dom-listener');

/**
 * Used to log messages from Linterhub
 * @class Logger
 */
export class Logger {
    /**
     * Initialize logger
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
        atom.notifications.addWarning(string.toString());
    }
    /**
     * @param {String} string - Log message
     */
    warn(string) {
        console.warn(this.prefix + string.toString());
    }
}

/**
 * Show plugins status (used in linterhub-ide)
 * @class StatusLogger
 */
export class StatusLogger {

    /**
     * @param {string} id - id of window
     * @param {Boolean} progress - is Linterhub doing tasks or not
     */
    update(id, progress) {
        if (typeof progress !== 'undefined' && progress !== null) {
            atom.config.set('linterhub-atom.progress', Boolean(progress));
        } else {
            atom.config.set('linterhub-atom.progress', true);
        }
    }
}

let subscriptions;
let linter;

/**
 * Describes methods for Linterhub (how to convert problems etc)
 * @class Integration
 */
export class Integration {

    /**
     * @constructor
     * @param {Object} _project - Current project to analyze
     * @param {Object} _subscriptions - Add subscriptions on custom events
     * @param {Object} _linter - Instance of Indie Linter
     */
    constructor(_project, _subscriptions, _linter) {
        this.project = _project;
        this.logger = new Logger();
        this.status = new StatusLogger();

        subscriptions = _subscriptions;
        linter = _linter;

        let warningCallback = this.warningCallback;
        let handleErrors = this.handleErrors;

        subscriptions.add(atom.commands.add('atom-workspace', {
            'linterhub-atom:warningCallback': (event) =>
                warningCallback(event, handleErrors, _project),
            'linterhub-atom:analyze_project': function(event) {
                handleErrors(null);
            },
        }));
    }

    /**
     * Initialize subscriptions for TextEditors and other
     */
    initSubscriptions() {
        subscriptions.add(linter);
        let handleErrors = this.handleErrors;

        // Setting and clearing messages per filePath
        subscriptions.add(
            atom.workspace.observeTextEditors(function(textEditor) {
                const editorPath = textEditor.getPath();
                if (!editorPath) {
                    return;
                }

                const ListenerBar = new DOMListener(textEditor.element);
                let listener = ListenerBar.add('.hide-warning', 'click',
                    function(event) {
                        atom.commands.dispatch(
                            event.target,
                            'linterhub-atom:warningCallback'
                        );
                    }
                );

                handleErrors(editorPath);

                const changeSubscription = textEditor.onDidSave(
                    function(event) {
                        handleErrors(event.path);
                    }
                );
                subscriptions.add(changeSubscription);

                const destroySubscription = textEditor.onDidDestroy(function() {
                    listener.dispose();
                    subscriptions.remove(destroySubscription);
                    subscriptions.remove(changeSubscription);
                    linter.setMessages(editorPath, []);
                });

                subscriptions.add(destroySubscription);
            }));
    }

    /**
     * Used to start analyze of file or project
     * @param {string} _path - File to analyze, analyze whole project on null
     */
    handleErrors(_path) {
        console.log(_path);
        if (_path !== null) {
            Linterhub.analyzeFile(_path).then(function(data) {
                linter.setMessages(_path, data);
            });
        } else {
            Linterhub.analyze().then(function(data) {
                linter.setAllMessages(data);
            });
        }
    }

    /**
     * Warning callback. Adds ignore rules.
     * @param {Object} event - Link to event node
     * @param {Function} handleErrors - callback for analyzing project
     * @param {string} project
     */
    warningCallback(event, handleErrors, project) {
        // let linter = event.target.getAttribute('linter-name');
        let _warning = event.target.getAttribute('rule-name');
        if (_warning === 'null') _warning = null;
        let _file = event.target.getAttribute('file-name');
        if (_file === 'null') _file = null;
        let _line = event.target.getAttribute('line-number');
        if (_line === 'null') _line = null;

        Linterhub.ignoreWarning({
            file: _file,
            line: _line,
            error: _warning,
        }).then(() => {
            handleErrors(path.join(project, _file));
        });
    }

    /**
     * Updates settings after installation of Linterhub (used in linterhub-ide)
     * @param {Object} settings - Linterhub settings
     */
    saveConfig(settings) {
        this.logger.info('Saving config..');
        atom.config.set('linterhub-atom.mode', settings.linterhub.mode);
        atom.config.set('linterhub-atom.path_cli', settings.linterhub.cliPath);
    }

    /**
     * Normalaize file/project path (used in linterhub-ide)
     * @param {String} path - Current project path
     * @return {String} - Return curent project path
     */
    normalizePath(path) {
        return path;
    }

    /**
     * Converts analyze results to Atom model
     * @param {Object} data - analyze results
     * @return {Object} - analyze results in Atom model
     */
    sendDiagnostics(data) {
        let json = JSON.parse(data);
        let results = [];
        for (let index = 0; index < json.length; index++) {
            let linterResult = json[index];
            linterResult.Model.Files.forEach((file) => {
                file.Errors.forEach((error) => {
                    results.push(
                        this.convertError(
                            error,
                            linterResult.Name,
                            file.Path
                        )
                    );
                });
            });
        }
        return results;
    }

    /**
     * Converts single error to Atom Problem (as atom-linter requires)
     * @param {Object} message - Problem object
     * @param {String} linter - Linter name
     * @param {String} file - Relative file path
     * @return {Object} - Problem object in atom-linter type
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
        let row = message.Row || {
            Start: message.Line,
            End: message.Line,
        };
        let column = message.Column || {
            Start: message.Character,
            End: message.Character,
        };
        if (column.Start == column.End) column.End = 10000;
        let position = [
            [row.Start - 1, column.Start - 1],
            [row.End - 1, column.End - 1],
        ];

        return {
            description: (new LinterhubProblemView(linter, message, file))
                .getElement()
                .innerHTML,
            severity: severity,
            location: {
                file: path.join(this.project, file),
                position: position,
            },
            excerpt: linter + ': ' + message.Message,
        };
    }
}
