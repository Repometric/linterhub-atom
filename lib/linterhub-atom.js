'use babel';

import { CompositeDisposable, TextEditor } from 'atom';
import { Integration, Run } from 'linterhub-ide';
import * as path from 'path';
import LintersManagerView from './linterhub-lm-view';
import LinterhubStatusView from './linterhub-status-view';
import { IntegrationLogic } from './shared/ide.atom';

let DOMListener = require('dom-listener');
let listeners = [];

export default {
  api: null,
  subscriptions: null,
  statusBarTile: null,
  linterhubStatus: null,
  lmPanel: null,
  lmView: null,
  config: {
    'linterhub-atom.mode': {
      'description': 'How to run linters',
      'type': 'integer',
      'default': null
    },
    'linterhub-atom.path_cli': {
      'description': 'Path to cli',
      'type': 'string',
      'default': null
    }
  },

  /**
  * Add window callback on all open text editor tabs in atom
  *
  * @param {Object} panelItems - Array with all TextEditor panels in project
  */
  add_window_callback(panelItems) {
    let panelObject = null;
    if (panelItems instanceof TextEditor) panelObject = panelItems;
    if (panelItems.item instanceof TextEditor) panelObject = panelItems.item;
    if (panelObject == null) return;

    let callback = this.warning_callback;
    let index = parseInt(panelObject.id);
    let listener = new DOMListener(panelObject.element);
    listener.add('.hide-warning', 'click', (event) => {
      atom.commands.dispatch(event.target, 'linterhub-atom:warning_callback');
    });
    listeners.push({
      id: index,
      panelItems: listener
    });
    // TODO run analyze after creating
    // atom.commands.dispatch(atom.views.getView(atom.workspace), 'linter:lint')
  },

  /*
  remove_window_callback(e)
  {
    if(e.item !== undefined)
    {
      var index = parseInt(e.item.id)
      listeners.forEach((item) =>
      {
        if(item.id == index)
          item.panelItems.dispose()
      })
      atom.notifications.addWarning('Closed: ' + index)
    }
  },
  */

  /**
  * Activate linterhub
  */
  activate() {
    this.subscriptions = new CompositeDisposable();
    atom.config.set('linterhub-atom.progress', false);
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:version': () => this.version(),
      'linterhub-atom:manager': () => this.manager(),
      'linterhub-atom:hide': () => this.hide(),
      'linterhub-atom:search': (event) => this.linterSearch(event),
      'linterhub-atom:activate_linter': (event) => this.manager_callback(event),
      'linterhub-atom:warning_callback': (event) => this.warning_callback(event)
    }));
    this.linterhubStatus = new LinterhubStatusView();
    this.subscriptions.add(
      atom.config.observe('linterhub-atom.status', value => {
        if (value !== undefined) {
          this.linterhubStatus.changeStatus(value.toString());
        }
      })
    );
    this.createLinterhubApi();
    this.addLinterhubListeners();
    atom.workspace.onDidAddPaneItem(this.add_window_callback);
    atom.workspace.getPaneItems().forEach((item) => {
      this.add_window_callback(item);
    });
    //atom.workspace.onDidDestroyPaneItem(this.remove_window_callback)
  },

  /**
  * Create linterhub api with integration constructior
  */
  createLinterhubApi() {
    let settings = {
      linterhub: {
        enable: true,
        mode: atom.config.get('linterhub-atom.mode'),
        cliPath: atom.config.get('linterhub-atom.path_cli'),
        cliRoot: path.resolve(__dirname + '/../'),
        run: [
          Run.none,
          Run.force
        ]
      }
    };
    const version = '0.3.4';
    let integrationLogic = new IntegrationLogic(
      atom.project.getPaths()[0], version
    );
    this.api = new Integration(integrationLogic, settings); // TODO FIX THIS
  },

  /**
  * Add dom listeners
  */
  addLinterhubListeners() {
    const listener = new DOMListener(document);
    listener.add('.linterhub-atom-lm-block', 'change', (event) => {
      atom.commands.dispatch(event.currentTarget, 'linterhub-atom:activate_linter');
    });
    listeners.push({
      id: 0,
      panelItems: listener
    });
    const ListenerBar = new DOMListener(document.querySelector('linter-panel'));
    ListenerBar.add('.hide-warning', 'click', (event) => {
      atom.commands.dispatch(event.target, 'linterhub-atom:warning_callback');
    });
    listeners.push({
      id: 1,
      panelItems: ListenerBar
    });
    const listenerCloseButton = new DOMListener(document);
    listenerCloseButton.add('.linterhub-atom-lm-closeButton', 'mousedown', (event) => {
      atom.commands.dispatch(event.target, 'linterhub-atom:hide');
    });
    listeners.push({
      id: 2,
      panelItems: listenerCloseButton
    });
    const listenerSearch = new DOMListener(document);
    listenerSearch.add('.linterhub-atom-lm-linterSearch', 'input', (event) => {
      atom.commands.dispatch(event.target, 'linterhub-atom:search');
    });
    listeners.push({
      id: 3,
      panelItems: listenerSearch
    });
  },
  /*
  * Search linter in panel
  */
  linterSearch(event) {
    let value = event.target.value;
    var patt = new RegExp(value, 'i');
    const allLinters = document.getElementsByClassName('linterhub-atom-lm-block');
    for (let i = 0; i < allLinters.length; i++) {
      if (!patt.test(allLinters[i].id.replace('lint-','')) &&
          !patt.test(allLinters[i].childNodes[3].textContent)) {
        allLinters[i].style.display = 'none';
      } else {
        allLinters[i].style.display = 'block';
      }
    }
  },
  /**
  * Linterhub status
  */
  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addRightTile({
      item: this.linterhubStatus,
      priority: 1000000
    });
  },

  /**
  * Deactivate linterhub
  */
  deactivate() {
    this.listener.destroy();
    this.lmView.destroy();
    this.subscriptions.dispose();
    this.statusBarTile.destroy();
  },

  /**
  * Hide linterhub panel
  */
  hide() {
    if (this.lmPanel != null) {
      document.getElementsByClassName('linterhub-atom-lm-linterSearch')[0].value = '';
      const allLinters = document.getElementsByClassName('linterhub-atom-lm-block');
      for (let i = 0; i < allLinters.length; i++) {
        allLinters[i].style.display = 'block';
      }
      this.lmPanel.hide()
    };
  },

  /**
  * Linter activate/deactivate callback
  */
  manager_callback(event) {
    let checked = event.target.childNodes[0].checked;
    let linter = event.target.id.split('-')[1];
    if (checked) {
      this.api.activate(linter).then(() => {
        atom.notifications.addSuccess('Linter ' + linter + ' activated!');
      });
    } else {
      this.api.deactivate(linter).then(() => {
        atom.notifications.addSuccess('Linter ' + linter + ' deactivated!');
      });
    }
  },

  /**
  * Warning callback
  */
  warning_callback(event) {
    let linter = event.target.getAttribute('linter-name');
    let _warning = event.target.getAttribute('rule-name');
    if (_warning === 'null') _warning = null;
    let _file = event.target.getAttribute('file-name');
    if (_file === 'null') _file = null;
    let _line = event.target.getAttribute('line-number');
    if (_line === 'null') _line = null;
    let target = event.currentTarget;
    this.api.ignoreWarning({ file: _file, line: _line, error: _warning }).then(() => {
      atom.commands.dispatch(target, 'linter:lint');
    });
  },

  /**
  * Show linterhub version
  */
  version() {
    this.api.version().then((hubVersion) => {
      atom.notifications.addSuccess(hubVersion);
    });
  },

  /**
  * Show linterhub panel
  */
  manager() {
    if (this.lmPanel != null) {
      this.lmPanel.show();
      document.getElementsByClassName('linterhub-atom-lm-linterSearch')[0].focus();
    } else {
      this.api.catalog().then((result) => {
        this.lmView = new LintersManagerView(result);
        this.lmPanel = atom.workspace.addModalPanel({
          item: this.lmView.getElement(),
          visible: false
        });
        this.lmPanel.show();
      });
    }
  },

  /**
  * Provide select linter
  */
  provideLinter() {
    let api = this.api;
    return {
      scope: 'file', // or 'project'
      lintsOnChange: false,
      grammarScopes: ['*'],
      lintOnFly: false,
      lint(textEditor) {
        const editorPath = textEditor.getPath();
        const projectPath = atom.project.relativizePath(editorPath)[0];
        const fileDir = path.dirname(editorPath);
        return api.analyzeFile(editorPath, Run.force);
        //return api.analyze()
      }
    };
  }
};
