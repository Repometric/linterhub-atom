"use strict";
const cli = require("./linterhub-cli");
const i = require("./linterhub-installer");
const path = require("path");

class FileResult {
    constructor(uri, diagnostics) {
        this.uri = uri;
        this.diagnostics = diagnostics;
    }
}

class Integration {
    constructor(project) {
        this.project = project;
        this.path_cli = "";
        this.path_extension = "";
        this.mode = "";
    }

    initialize(settings = null) {
      this.path_extension = path.resolve(__dirname + "/../../");
      atom.notifications.addInfo(this.path_cli);
    }

    install() {
        return i.getDotnetVersion()
            .then(() => { this.mode = cli.LinterhubMode.dotnet; })
            .catch(() => { this.mode = cli.LinterhubMode.native; })
            .then(() => { atom.notifications.addInfo(`SERVER: start download.`); })
            .then(() => { atom.notifications.addInfo(this.mode.toString()); })
            .then(() => {
            return i.install(this.mode, null, true, this.path_extension)
                .then((data) => {
                atom.notifications.addInfo(`SERVER: finish download.`);
                return data;
            })
                .catch((reason) => {
                atom.notifications.addError("SERVER: error catalog " + $reason.toString() + ".");
                return [];
            })
                .then((result) => {
                atom.notifications.addSuccess("Linterhub successfully installed");
                return result;
            });
        });
    }
}
exports.Integration = Integration;
