'use babel';

import LintersManagerView from './linterhub-lm-view';
import { CompositeDisposable } from 'atom';
import { Integration } from './shared/ide.atom';

export default {
  subscriptions: null,
  api: null,

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:version': () => this.version(),
      'linterhub-atom:manager': () => this.manager()
    }));
    this.api = new Integration(atom.project.getPaths()[0]); // TODO FIX THIS
    this.api.install();
  },

  deactivate() {
    this.lmView.destroy();
    this.subscriptions.dispose();
  },

  test() {
    atom.notifications.addInfo(JSON.stringify(atom.project.getPaths()));
  },

  version() {
    this.api.version().then((x) => {
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
  }

};
