'use babel';

import LintersManagerView from './linterhub-lm-view';
import LinterhubStatusView from './linterhub-status-view';
import { CompositeDisposable, TextEditor } from 'atom';
import { Integration } from './shared/ide.atom';
const path = require("path");

export default {
  api: null,
  subscriptions: null,
  statusBarTile: null,
  linterhubStatus: null,
  lmPanel: null,
  lmView: null,
  config: {
    "linterhub-atom.mode": {
      "description": "How to run linters",
      "type": "integer",
      "default": null
    },
    "linterhub-atom.path_cli": {
      "description": "Path to cli",
      "type": "string",
      "default": null
    }
  },
  activate(state) {

    this.subscriptions = new CompositeDisposable();
    atom.config.set('linterhub-atom.progress', false);
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:version': () => this.version(),
      'linterhub-atom:manager': () => this.manager(),
      'linterhub-atom:activate_linter' : (e) => this.manager_callback(e),
      'linterhub-atom:hide': () => this.hide()
    }));
    this.linterhubStatus = new LinterhubStatusView();
    this.subscriptions.add(
      atom.config.observe('linterhub-atom.status', value => {
        if(value != undefined)
          this.linterhubStatus.changeStatus(value.toString());
      })
    );
    this.api = new Integration(atom.project.getPaths()[0]); // TODO FIX THIS
    this.api.initializeIntegration();
  },

  consumeStatusBar(statusBar){
    this.statusBarTile = statusBar.addRightTile({item: this.linterhubStatus, priority: 1000000})
  },

  deactivate() {
    this.lmView.destroy();
    this.subscriptions.dispose();
    this.statusBarTile.destroy();
  },

  hide() {
    if(this.lmPanel != null)
      this.lmPanel.hide();
  },

  manager_callback(e)
  {
    let checked = e.target.childNodes[0].checked;
    let linter = e.target.id.split('-')[1];
    if(checked)
      this.api.activate(linter);
    else
      this.api.deactivate(linter);
  },

  version() {
    this.api.version().then((x) => {
      atom.notifications.addSuccess(x);
    });
  },

  manager() {
    if(this.lmPanel != null)
      this.lmPanel.show();
    else
      this.api.catalog().then((result) => {
        this.lmView = new LintersManagerView(result);

        this.lmPanel = atom.workspace.addModalPanel({
          item: this.lmView.getElement(),
          visible: false
        });
        this.lmPanel.show();
      })
  },

  provideLinter() {
    var api = this.api;
    return {
      scope: 'project', // or 'project'
      lintsOnChange: false, // or true
      grammarScopes: ['*'],
      lintOnFly: false,
      lint(textEditor) {
        const editorPath = textEditor.getPath()
        const projectPath = atom.project.relativizePath(editorPath)[0]
        const fileDir = path.dirname(editorPath)

        return api.analyze();
      }
    }
  }

};
