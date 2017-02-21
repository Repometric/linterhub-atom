'use babel';

import LintersManagerView from './linterhub-lm-view';
import LinterhubStatusView from './linterhub-status-view';
import { CompositeDisposable, TextEditor } from 'atom';
import { IntegrationLogic } from './shared/ide.atom';
import { Integration, Run } from 'linterhub-ide';
import * as path from 'path';

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
    let settings = {
      linterhub: {
        enable: true,
        mode: atom.config.get('linterhub-atom.mode'),
        cliPath: atom.config.get('linterhub-atom.path_cli'),
        cliRoot: path.resolve(__dirname + "/../"),
        run: [
          Run.none,
          Run.force
        ]
      }
    }

    console.log(settings);

    let version = "0.3.3";
    let integrationLogic = new IntegrationLogic(atom.project.getPaths()[0], version);
    this.api = new Integration(new IntegrationLogic(atom.project.getPaths()[0], version), settings); // TODO FIX THIS
    //this.api.initialize(settings);
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
      this.api.activate(linter).then(() => {
        atom.notifications.addSuccess("Linter " + linter + " activated!")
      })
    else
      this.api.deactivate(linter).then(() => {
        atom.notifications.addSuccess("Linter " + linter + " deactivated!")
      })
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
      scope: 'file', // or 'project'
      lintsOnChange: false, // or true
      grammarScopes: ['*'],
      lintOnFly: false,
      lint(textEditor) {
        const editorPath = textEditor.getPath()
        const projectPath = atom.project.relativizePath(editorPath)[0]
        const fileDir = path.dirname(editorPath)
        return api.analyzeFile(editorPath, Run.force)
        //return api.analyze();
      }
    }
  }

};
