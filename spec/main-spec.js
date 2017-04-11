describe('Linterhub extension', () => {
  beforeEach(() => {
    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('linterhub-atom'),
      ])
    );
  });
  it('should be in the packages list', () =>
    expect(atom.packages.isPackageLoaded('linterhub-atom')).toBe(true)
  );

  it('should be an active package', () =>
    expect(atom.packages.isPackageActive('linterhub-atom')).toBe(true)
  );
});
