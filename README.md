Linterhub Atom Extension
=====
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/fbcbd01cbdcd446f94133456d1562b2a)](https://www.codacy.com/app/xferra/linterhub-atom?utm_source=github.com&utm_medium=referral&utm_content=Repometric/linterhub-atom&utm_campaign=badger)
[![Build Status](https://travis-ci.org/Repometric/linterhub-atom.svg?branch=master)](https://travis-ci.org/Repometric/linterhub-atom)
[![Build status](https://ci.appveyor.com/api/projects/status/gle7x82v832ntf13?svg=true)](https://ci.appveyor.com/project/xferra/linterhub-atom)
[![Build status](https://circleci.com/gh/Repometric/linterhub-atom.svg?style=shield)](https://circleci.com/gh/Repometric/linterhub-atom)
[![Issue Count](https://codeclimate.com/github/Repometric/linterhub-atom/badges/issue_count.svg)](https://codeclimate.com/github/Repometric/linterhub-atom)
[![Code Climate](https://codeclimate.com/github/Repometric/linterhub-atom/badges/gpa.svg)](https://codeclimate.com/github/Repometric/linterhub-atom)

Extension to integrate [Linterhub](https://github.com/Repometric/linterhub-cli) into Atom: analyze your code using different linters.

## Requirements
* [Atom](https://atom.io) v1.0.0 or higher.

## How to develop
* Install all dependencies. Run `apm install` in root directory.
* Make your package available for Atom by running `apm link` in root directory.
* Run `atom . --dev`. It will open new instance of Atom with installed extension.
