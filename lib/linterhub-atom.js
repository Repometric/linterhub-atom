'use babel';

import LintersManagerView from './linterhub-lm-view';
import LinterhubStatusView from './linterhub-status-view';
import { CompositeDisposable, TextEditor } from 'atom';
import { IntegrationLogic } from './shared/ide.atom';
import { Integration, Run } from 'linterhub-ide';
let DOMListener = require('dom-listener');
let listeners = [];
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

  add_window_callback(obj)
  {
    var e = null;
    if(obj instanceof TextEditor) e = obj;
    if(obj.item instanceof TextEditor) e = obj.item;
    if(e == null) return;

    var callback = this.warning_callback;
    var index = parseInt(e.id);
    var listener = new DOMListener(e.element);
    listener.add('.hide-warning', 'click', (l) => { atom.commands.dispatch(l.target, "linterhub-atom:warning_callback") });
    listeners.push({
      id: index,
      obj: listener
    });
    // TODO run analyze after creating
    // atom.commands.dispatch(atom.views.getView(atom.workspace), "linter:lint")
  },

  /*
  remove_window_callback(e)
  {
    if(e.item !== undefined)
    {
      var index = parseInt(e.item.id);
      listeners.forEach((item) =>
      {
        if(item.id == index)
          item.obj.dispose();
      });
      atom.notifications.addWarning("Closed: " + index)
    }
  },
  */

  activate(state) {

    this.subscriptions = new CompositeDisposable();
    atom.config.set('linterhub-atom.progress', false);
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:version': () => this.version(),
      'linterhub-atom:manager': () => this.manager(),
      'linterhub-atom:hide': () => this.hide(),
      'linterhub-atom:activate_linter': (e) => this.manager_callback(e),
      'linterhub-atom:warning_callback': (e) => this.warning_callback(e)
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

    let version = "0.3.4";
    let integrationLogic = new IntegrationLogic(atom.project.getPaths()[0], version);
    this.api = new Integration(integrationLogic, settings); // TODO FIX THIS

    var listener = new DOMListener(document);
    listener.add('.linterhub-atom-lm-block', 'change', function(event){ atom.commands.dispatch(event.currentTarget, "linterhub-atom:activate_linter") });
    listeners.push({
      id: 0,
      obj: listener
    });
    var listener_bar = new DOMListener(document.querySelector("linter-panel"));
    listener_bar.add('.hide-warning', 'click', (l) => { atom.commands.dispatch(l.target, "linterhub-atom:warning_callback") });
    listeners.push({
      id: 1,
      obj: listener_bar
    });
    atom.workspace.onDidAddPaneItem(this.add_window_callback);
    atom.workspace.getPaneItems().forEach((item) => { this.add_window_callback(item); });
    //atom.workspace.onDidDestroyPaneItem(this.remove_window_callback);
  },

  consumeStatusBar(statusBar){
    this.statusBarTile = statusBar.addRightTile({item: this.linterhubStatus, priority: 1000000})
  },

  deactivate() {
    this.listener.destroy()
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

  warning_callback(e)
  {
    let linter = e.target.getAttribute("linter-name");
    let _warning = e.target.getAttribute("rule-name");
    if(_warning === "null") _warning = null;
    let _file = e.target.getAttribute("file-name");
    if(_file === "null") _file = null;
    let _line = e.target.getAttribute("line-number");
    if(_line === "null") _line = null;
    let target = e.currentTarget;
    this.api.ignoreWarning({ file: _file, line: _line, error: _warning }).then(() => {
        atom.commands.dispatch(target, "linter:lint")
    });
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
      lintsOnChange: false,
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
