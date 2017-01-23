'use babel';

import { CompositeDisposable } from 'atom';
var api = require("./shared/ide.atom");

export default {

  subscriptions: null,

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linterhub-atom:test': () => this.test()
    }));

    var lapi = new api.Integration(atom.project.getPaths()[0]); // TODO FIX THIS
    lapi.install();
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  test() {
    atom.notifications.addInfo(JSON.stringify(atom.project.getPaths()));
  }

};
