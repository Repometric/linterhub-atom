'use babel';

import LintersManagerView from './linterhub-lm-view';
import LinterhubStatusView from './linterhub-status-view';
import { CompositeDisposable } from 'atom';
import { Integration } from './shared/ide.atom';
const path = require("path");
let api;

export default {
  subscriptions: null,
  statusBarTile: null,
  linterhubStatus: null,
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

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    atom.config.set('linterhub-atom.progress', false);
    // Register command
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:version': () => this.version(),
      'linterhub-atom:manager': () => this.manager()
    }));
    this.linterhubStatus = new LinterhubStatusView();
    this.subscriptions.add(
      atom.config.observe('linterhub-atom.status', value => {
        if(value != undefined)
          this.linterhubStatus.changeStatus(value.toString());
      })
    );
    api = new Integration(atom.project.getPaths()[0]); // TODO FIX THIS
    api.initializeIntegration();
  },

  consumeStatusBar(statusBar){
    this.statusBarTile = statusBar.addRightTile({item: this.linterhubStatus, priority: 1000000})
  },

  deactivate() {
    this.lmView.destroy();
    this.subscriptions.dispose();
    this.statusBarTile.destroy();
  },

  test() {
    atom.notifications.addInfo(JSON.stringify(atom.project.getPaths()));
  },

  version() {
    api.version().then((x) => {
      atom.notifications.addSuccess(x);
    });
  },

  manager() {
    let myPackageView = new LintersManagerView("test");

    let modalPanel = atom.workspace.addModalPanel({
      item: myPackageView.getElement(),
      visible: false
    });
    modalPanel.show();
    setTimeout(function () {
      modalPanel.hide()
    }, 3000);
  },

  provideLinter() {
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
