"use strict";
const cli = require("./linterhub-cli");
const i = require("./linterhub-installer");
const util = require("./util");
const path = require("path");

class FileResult {
    constructor(uri, diagnostics) {
        this.uri = uri;
        this.diagnostics = diagnostics;
    }
}

class Integration
{

    initializeLinterhub() {
        this.linterhub = new cli.LinterhubCliLazy(this.path_cli, this.project, this.mode);
        this.onReady = this.linterhub.version();
        return this.onReady;
    }

    constructor(project) {
        this.project = project;
        this.path_cli = "";
        this.path_extension = path.resolve(__dirname + "/../../");
        this.mode = "";
    }

    install() {
        return i.getDotnetVersion()
            .then(() => { this.mode = cli.LinterhubMode.dotnet; })
            .catch(() => { this.mode = cli.LinterhubMode.native; })
            .then(() => { console.log(`SERVER: start download.`); })
            // .then(() => { atom.notifications.addInfo(this.mode.toString()); })
            .then(() => {
            return i.install(this.mode, null, true, this.path_extension)
                .then((data) => {
                console.log(`SERVER: finish download.`);
                return data;
            })
                .catch((reason) => {
                console.error("SERVER: error catalog " + $reason.toString() + ".");
                return [];
            })
                .then((result) => {
                atom.notifications.addSuccess("Linterhub successfully installed");
                return result;
            });
        }).then(x => {
          this.path_cli = x;
          this.initializeLinterhub();
          this.version().then((x) => {
            atom.notifications.addSuccess(x);
          })
          this.linterVersion("jshint", false).then((x) => {
            atom.notifications.addSuccess(JSON.stringify(x));
          })

        });
    }

    version()
    {
      return this.onReady
        .then(() => {
          return this.linterhub.version();
        })
        .catch((reason) => {
          atom.notifications.addError(reason.toString());
        });
    }

    catalog() {
        return this.onReady
            .then(() => this.linterhub.catalog())
            .then((data) => {
            let json = JSON.parse(data);
            return json;
        })
            .catch((reason) => {
            console.error(`SERVER: error catalog '${reason}.toString()'.`);
            return [];
        })
            .then((result) => {
            return result;
        });
    }

    linterVersion(name, install) {
        return this.onReady
            .then(() => this.linterhub.linterVersion(name, install))
            .then((data) => {
            let json = JSON.parse(data);
            console.log(data);
            return json;
        })
            .catch((reason) => {
            console.error(`SERVER: error while requesting linter version '${reason}.toString()'.`);
            return null;
        })
            .then((result) => {
            return result;
        });
    }

    activate(name) {
        return this.onReady
            .then(() => this.linterhub.activate(name))
            .catch((reason) => { console.error(`SERVER: error activate '${reason}.toString()'.`); })
            .then(() => name);
    }

    deactivate(name) {
        return this.onReady
            .then(() => this.linterhub.deactivate(name))
            .catch((reason) => { console.error(`SERVER: error deactivate '${reason}.toString()'.`); })
            .then(() => name);
    }
}
exports.Integration = Integration;
