'use babel';

import LintersManagerView from './linterhub-lm-view';
import { CompositeDisposable } from 'atom';
import { Integration } from './shared/ide.atom';
const path = require("path");
let api;

export default {
  subscriptions: null,
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

    // Register command
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:version': () => this.version(),
      'linterhub-atom:manager': () => this.manager()
    }));

    api = new Integration(atom.project.getPaths()[0]); // TODO FIX THIS
    api.initializeIntegration();

  },

  deactivate() {
    this.lmView.destroy();
    this.subscriptions.dispose();
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
