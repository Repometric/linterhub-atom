'use babel'

import { CompositeDisposable } from 'atom'
import { Linterhub, LinterhubTypes } from 'linterhub-ide';
import { Integration } from './integration';
import * as path from 'path';

let subscriptions

export default {
  config: {
    'linterhub-atom.mode': {
      'description': 'How to run linters',
      'type': 'integer',
      'default': null,
    },
    'linterhub-atom.path_cli': {
      'description': 'Path to cli',
      'type': 'string',
      'default': null,
    }
  }
};

function version() {
  Linterhub.version().then((hubVersion) => {
    atom.notifications.addSuccess(hubVersion);
  });
}

export function activate() {

  subscriptions = new CompositeDisposable();
  let settings = {
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

  let integration = new Integration(
    atom.project.getPaths()[0]
  );

  Linterhub.initializeLinterhub(integration, settings);
  subscriptions.add(atom.commands.add('atom-workspace', {
    'linterhub-atom:version': () => version()
  }));

}

export function deactivate() {
  subscriptions.dispose()
}

export function consumeIndie(registerIndie) {
  const linter = registerIndie({
    name: 'Linterhub',
  })
  subscriptions.add(linter)

  // Setting and clearing messages per filePath
  subscriptions.add(atom.workspace.observeTextEditors(function(textEditor) {
    const editorPath = textEditor.getPath()
    if (!editorPath) {
      return
    }

    handleErrors(editorPath);

    function handleErrors(_path)
    {
      Linterhub.analyzeFile(_path).then(function(data){
        linter.setMessages(_path, data);
      });
    }

    const changeSubscription = textEditor.onDidSave(function(event){
      handleErrors(event.path);
    })
    subscriptions.add(changeSubscription)

    const destroySubscription = textEditor.onDidDestroy(function() {
      subscriptions.remove(destroySubscription)
      subscriptions.remove(changeSubscription)
      linter.setMessages(editorPath, [])
    })

    subscriptions.add(destroySubscription)
  }))
}
