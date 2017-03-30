'use babel'

import { CompositeDisposable } from 'atom';
import { Linterhub, LinterhubTypes } from 'linterhub-ide';
import { Integration } from './integration';
import * as path from 'path';
import LinterhubManagerView from './views/manager';

let subscriptions
let statusBar
let managerView
let linter
let settings

function show_version() {
  Linterhub.version().then((hubVersion) => {
    atom.notifications.addSuccess(hubVersion);
  });
}

function show_manager() {
  if(managerView == null)
    managerView = new LinterhubManagerView(subscriptions);
  managerView.show();
}

export function activate() {
  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.commands.add('atom-workspace', {
    'linterhub-atom:version': () => show_version(),
    'linterhub-atom:manager': () => show_manager()
  }));
  settings = {
    linterhub: {
      enable: true,
      mode: atom.config.get('linterhub-atom.mode'),
      cliPath: atom.config.get('linterhub-atom.path_cli'),
      cliRoot: path.resolve(__dirname + '/../'),
      run: [
        LinterhubTypes.Run.none,
        LinterhubTypes.Run.force
      ]
    },
  };
}
export function consumeSignal(registry) {
  statusBar = registry.create()
  subscriptions.add(statusBar)
  subscriptions.add(
    atom.config.observe('linterhub-atom.status', (value) => {
      if (value !== undefined) {
        statusBar.clear();
        if(value != "Active")
          statusBar.add(value);
      }
    })
  );
  subscriptions.add(
    atom.config.observe('linterhub-atom.progress', (value) => {
      if (value !== undefined) {
        if (!value) {
          statusBar.clear();
        }
      }
    })
  );
}

export function deactivate() {
  subscriptions.dispose()
}

export function consumeIndie(registerIndie) {
  linter = registerIndie({
    name: 'Linterhub',
  })
  if(atom.project.getPaths()[0] == undefined)
  {
    atom.notifications.addError("Can't initialize Linterhub cause you don't open any project")
    return
  }
  let integration = new Integration(
    atom.project.getPaths()[0], subscriptions, linter
  );

  Linterhub.initializeLinterhub(integration, settings);
  integration.init_subscriptions();
}
