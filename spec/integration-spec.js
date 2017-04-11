'use babel';

import * as assert from 'assert';
import * as sinon from 'sinon';
import { Integration, StatusLogger } from '../lib/integration';
import { CompositeDisposable } from 'atom';

beforeEach(() => {
  waitsForPromise(() =>
    Promise.all([
      atom.packages.activatePackage('linterhub-atom'),
    ])
  );
});

describe('Integration class', () => {
  let integration = new Integration("project", new CompositeDisposable(), function() {});

  describe('normalizePath method', () => {
    it('should return valid path', () => {
      expect(integration.normalizePath("path")).toBe("path");
    });
  });
});

describe('StatusLogger class', () => {
  it('should change atom config', () => {
    var status = new StatusLogger();
    status.update(null, true, "Test");
    expect(atom.config.get('linterhub-atom.progress')).toEqual(true);
    expect(atom.config.get('linterhub-atom.status')).toEqual("Test");
    status.update(null, false, "Test2");
    expect(atom.config.get('linterhub-atom.progress')).toEqual(false);
    expect(atom.config.get('linterhub-atom.status')).toEqual("Test2");
    status.update(null, null, "Test3");
    expect(atom.config.get('linterhub-atom.progress')).toEqual(true);
    expect(atom.config.get('linterhub-atom.status')).toEqual("Test3");
  });
});
