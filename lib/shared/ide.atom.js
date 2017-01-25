"use strict";
const cli = require("./linterhub-cli");
const i = require("./linterhub-installer");
const util = require("./util");
const path = require("path");
const fs = require("fs");

class Integration
{

    initializeLinterhub() {
        this.linterhub = new cli.LinterhubCliLazy(this.path_cli, this.project, this.mode);
        this.onReady = this.linterhub.version();
        atom.notifications.addSuccess("Linterhub initialized :)")
        return this.onReady;
    }

    constructor(project) {
        this.project = project;
        this.path_cli = "";
        this.path_extension = path.resolve(__dirname + "/../../");
        this.mode = "";
    }

    initializeIntegration()
    {
      this.path_cli = atom.config.get('linterhub-atom.path_cli');
      this.mode = atom.config.get('linterhub-atom.mode');
      if(this.mode == undefined || this.path_cli == undefined)
        return this.install();
      else {
        if (!fs.existsSync(this.path_cli)) {
          return this.install();
        }
        else
          return this.initializeLinterhub();
      }
    }

    install() {
        return i.getDotnetVersion()
            .then(() => { this.mode = cli.LinterhubMode.dotnet; })
            .catch(() => { this.mode = cli.LinterhubMode.native; })
            .then(() => {
              atom.config.set('linterhub-atom.mode', this.mode);
              console.log(this.mode)
            })
            .then(() => { atom.notifications.addInfo("Start the Linterhub installation..")})
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
          atom.config.set('linterhub-atom.path_cli', x)
          this.initializeLinterhub();
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
            .then(() => {
              atom.notifications.addSuccess(`Linter '${name}' is activated!`);
              return name;
            });
    }

    deactivate(name) {
        return this.onReady
            .then(() => this.linterhub.deactivate(name))
            .catch((reason) => { console.error(`SERVER: error deactivate '${reason}.toString()'.`); })
            .then(() => {
              atom.notifications.addSuccess(`Linter '${name}' is deactivated!`);
              return name;
            });
    }

    analyze() {
        return this.onReady
            .then(() => { console.log(`SERVER: analyze project.`); })
            .then(() => this.linterhub.analyze())
            .then((data) => { return this.getDiagnostics(data) })
            //.catch((reason) => { console.error(`SERVER: error analyze project '${reason}.toString()'.`); })
            //.then(() => { console.log(`SERVER: finish analyze project.`); });
    }

    getDiagnostics(data) {
        let json = JSON.parse(data);
        let results = [];
        for (let index = 0; index < json.length; index++) {
            var linterResult = json[index];
            linterResult.Model.Files.forEach((file) => {
                file.Errors.forEach((error) => {
                    results.push(this.convertError(error, linterResult.Name, file.Path));
                });
            });
        }
        return results;
    }

    convertError(message, linter, file) {
        let severity = 'Warning';
        switch (Number(message.Severity)) {
            case 0:
                severity = 'Error';
                break;
            case 1:
                severity = 'Warning';
                break;
            case 2:
                severity = 'Info';
                break;
            case 3:
                severity = 'Info';
                break;
        }
        let row = message.Row || { Start: message.Line, End: message.Line };
        let column = message.Column || { Start: message.Character, End: message.Character };
        return {
            type: severity,
            range: [[row.Start - 1, 0 ], [row.End - 1, 10000]], // TODO fix problem with ranges for jshint
            text: linter + ": " + message.Message,
            filePath: path.join(this.project, file)
        };
    }
}
exports.Integration = Integration;
