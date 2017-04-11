'use babel';

/* eslint max-len: ["error", { "ignoreStrings": true }]*/

import * as sinon from 'sinon';
import * as path from 'path';
import LinterhubProblemView from '../lib/views/problem-description';
import {
    Integration,
    StatusLogger,
} from '../lib/integration';
import {
    Linterhub,
} from 'linterhub-ide';
import {
    CompositeDisposable,
} from 'atom';

beforeEach(() => {
    waitsForPromise(() =>
        Promise.all([
            atom.packages.activatePackage('linterhub-atom'),
        ])
    );
});

describe('Integration class', () => {
    let integration = new Integration(
        'project',
        new CompositeDisposable(),
        function() {}
    );

    describe('normalizePath method', () => {
        it('should return valid path', () => {
            expect(integration.normalizePath('path')).toBe('path');
        });
    });
    describe('handleErrors method', () => {
        it('should call analyzeFile if path specified', function() {
            let analyzeFileStub = sinon.stub(Linterhub, 'analyzeFile')
                .callsFake(function(path) {
                    return new Promise((resolve, reject) => {
                        resolve(null);
                    });
                });
            integration.handleErrors('path');
            sinon.assert.calledWith(analyzeFileStub, 'path');
            analyzeFileStub.restore();
            let analyzeStub = sinon.stub(Linterhub, 'analyze')
                .callsFake(function(path) {
                    return new Promise((resolve, reject) => {
                        resolve(null);
                    });
                });
            integration.handleErrors(null);
            sinon.assert.calledWith(analyzeStub);
            analyzeStub.restore();
        });
    });
    describe('saveConfig method', () => {
        it('should save atom config', () => {
            integration.saveConfig({
                linterhub: {
                    mode: 666,
                    cliPath: 'testpath',
                },
            });
            expect(atom.config.get('linterhub-atom.mode')).toEqual(666);
            expect(atom.config.get('linterhub-atom.path_cli'))
                .toEqual('testpath');
        });
    });

    describe('convertError method', () => {
        it('should return valid problem', () => {
            integration.project = 'project';
            let problem = {
                Column: {
                    Start: 10,
                    End: 20,
                },
                Line: 15,
                Message: 'description',
                Row: {
                    Start: 15,
                    End: 15,
                },
                Rule: {
                    Id: 'id',
                    Name: 'jshint.W033',
                    Namespace: 'namespace',
                },
                Severity: 1,
            };
            let result = integration.convertError(problem, 'linter', 'file.js');
            expect(result).toEqual({
                description:
                    (new LinterhubProblemView('linter', problem, 'file.js'))
                    .getElement()
                    .innerHTML,
                severity: 'warning',
                location: {
                    file: path.join(integration.project, 'file.js'),
                    position: [
                        [14, 9],
                        [14, 19],
                    ],
                },
                excerpt: 'linter: description',
            });
        });
    });

    describe('sendDiagnostics method', () => {
        let data = '[{"Name":"linter","Model":{"Files":[{"Path":"file.js","Errors":[{"Message":"description","Rule":{"Name":"jshint.W083","Id":null,"Namespace":null},"Severity":1,"Evidence":null,"Line":10,"Column":{"Start":15,"End":20},"Row":{"Start":15,"End":15}}]}],"ParseErrors":{"ErrorMessage":null,"Input":null}}}]';
        it('should return array of problems', () => {
            let result = [{
                description: (new LinterhubProblemView('linter', {
                    Rule: {
                        Name: 'jshint.W083',
                    },
                    Line: 10,
                }, 'file.js')).getElement().innerHTML,
                severity: 'warning',
                location: {
                    file: path.join(integration.project, 'file.js'),
                    position: [
                        [14, 14],
                        [14, 19],
                    ],
                },
                excerpt: 'linter: description',
            }];
            expect(integration.sendDiagnostics(data)).toEqual(result);
        });
        it('should call convertError', function() {
            let convertErrorStub = sinon.stub(integration, 'convertError')
                .callsFake(function(path) {
                    return null;
                });
            integration.sendDiagnostics(data);
            sinon.assert.called(convertErrorStub);
            convertErrorStub.restore();
        });
    });
});

describe('StatusLogger class', () => {
    it('should change atom config', () => {
        let status = new StatusLogger();
        status.update(null, true, 'Test');
        expect(atom.config.get('linterhub-atom.progress')).toEqual(true);
        expect(atom.config.get('linterhub-atom.status')).toEqual('Test');
        status.update(null, false, 'Test2');
        expect(atom.config.get('linterhub-atom.progress')).toEqual(false);
        expect(atom.config.get('linterhub-atom.status')).toEqual('Test2');
        status.update(null, null, 'Test3');
        expect(atom.config.get('linterhub-atom.progress')).toEqual(true);
        expect(atom.config.get('linterhub-atom.status')).toEqual('Test3');
    });
});
