'use babel';

import {
    CompositeDisposable,
} from 'atom';
import {
    Linterhub,
    LinterhubTypes,
} from 'linterhub-ide';
import {
    Integration,
} from './integration';
import * as path from 'path';
import LinterhubManagerView from './views/manager';

let subscriptions;
let statusBar;
let managerView;
let linter;
let settings;

/**
 * Callback function.
 * Shows notification with Linterhub version (version of every component)
 */
function showVersion() {
    Linterhub.version().then((hubVersion) => {
        atom.notifications.addSuccess(hubVersion);
    });
}

/**
 * Callback function. Creates Linterhub Manager View
 */
function showManager() {
    if (managerView == null)
        managerView = new LinterhubManagerView(subscriptions);
    managerView.show();
}

/**
 * Entry point. Adds basic subscriptions, parses settings for Linterhub
 */
export function activate() {
    subscriptions = new CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-workspace', {
        'linterhub-atom:version': () => showVersion(),
        'linterhub-atom:manager': () => showManager(),
    }));
    settings = {
        linterhub: {
            enable: true,
            mode: atom.config.get('linterhub-atom.mode'),
            cliPath: atom.config.get('linterhub-atom.path_cli'),
            cliRoot: path.resolve(__dirname + '/../'),
            run: [
                LinterhubTypes.Run.none,
                LinterhubTypes.Run.force,
            ],
        },
    };
}

/**
 * Initialize status bar, add subscriptions
 * @param {any} registry Registry object for adding linters
 */
export function consumeSignal(registry) {
    statusBar = registry.create();
    subscriptions.add(statusBar);
    subscriptions.add(
        atom.config.observe('linterhub-atom.progress', (value) => {
            if (value !== undefined) {
                if (!value) {
                    statusBar.clear();
                } else {
                    statusBar.add('Linterhub');
                }
            }
        })
    );
}

/**
 * Dispose all objects
 */
export function deactivate() {
    subscriptions.dispose();
}

/**
 * Initialize Linter and Linterhub
 * @param {Object} registerIndie - Used to initialize new Indie Linter
 */
export function consumeIndie(registerIndie) {
    linter = registerIndie({
        name: 'Linterhub',
    });
    if (atom.project.getPaths()[0] === undefined) {
        atom.notifications.addError(
            'Can\'t initialize Linterhub cause you don\'t open any project'
        );
        return;
    }
    let integration = new Integration(
        atom.project.getPaths()[0], subscriptions, linter
    );
    Linterhub.initializeLinterhub(integration, settings);
    integration.initSubscriptions();
}
