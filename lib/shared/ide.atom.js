"use babel";
import { LinterhubCliLazy, LinterhubMode, install, getDotnetVersion } from "linterhub-ide";
import * as path from 'path';
import * as fs from 'fs';

class Logger
{
  info(string)
  {
    console.log(string);
  }
  error(string)
  {
    console.error(string);
  }
}

class Status
{
  update(string, progress)
  {
    if(typeof progress !== "undefined")
      atom.config.set('linterhub-atom.progress', Boolean(progress));
    else
      atom.config.set('linterhub-atom.progress', true);
    atom.config.set('linterhub-atom.status', string);
  }
}

class Integration
{
    initializeLinterhub() {
        this.linterhub = new LinterhubCliLazy(new Logger(), this.path_cli, this.project, this.mode);
        console.log(this.linterhub);
        this.onReady = this.linterhub.version();
        this.status.update("Active", false);
        return this.onReady;
    }

    constructor(project) {
      this.project = project;
      this.path_cli = "";
      this.path_extension = path.resolve(__dirname + "/../../");
      this.mode = "";
      this.linterhub_version = "0.3.2";
      this.logger = new Logger();
      this.status = new Status();
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
        return getDotnetVersion()
            .then(() => {
              this.status.update("Installing..", true)
            })
            .then(() => { this.mode = LinterhubMode.dotnet; })
            .catch(() => { this.mode = LinterhubMode.native; })
            .then(() => {
              atom.config.set('linterhub-atom.mode', this.mode);
            })
            .then(() => { atom.notifications.addInfo("Start the Linterhub installation..")})
            .then(() => { this.logger.info(`Linterhub: start download.`); })
            .then(() => {
            return install(this.mode, this.path_extension, null, true, this.logger, this.status, this.linterhub_version)
                .then((data) => {
                this.logger.info(`Linterhub: finish download.`);
                return data;
            })
                .catch((reason) => {
                this.logger.error("Linterhub: error catalog " + reason.toString() + ".");
                return [];
            })
            .then((result) => {
              this.status.update("Active", false);
              atom.notifications.addSuccess("Linterhub successfully installed");
              return result;
            });
        }).then((x) => {
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
            console.log(json);
            return json;
        })
            .catch((reason) => {
            this.logger.error(`Linterhub: error catalog '${reason}.toString()'.`);
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
            return json;
        })
            .catch((reason) => {
            this.logger.error(`Linterhub: error while requesting linter version '${reason}.toString()'.`);
            return null;
        })
            .then((result) => {
            return result;
        });
    }

    activate(name) {
        return this.onReady
            .then(() => this.linterhub.activate(name))
            .catch((reason) => { this.logger.error(`Linterhub: error activate '${reason}.toString()'.`); })
            .then(() => {
              atom.notifications.addSuccess(`Linter '${name}' is activated!`);
              return name;
            });
    }

    deactivate(name) {
        return this.onReady
            .then(() => this.linterhub.deactivate(name))
            .catch((reason) => { this.logger.error(`Linterhub: error deactivate '${reason}.toString()'.`); })
            .then(() => {
              atom.notifications.addSuccess(`Linter '${name}' is deactivated!`);
              return name;
            });
    }

    analyze() {
        return this.onReady
            .then(() => {
              this.status.update("Analyze project..", true);
            })
            .then(() => { this.logger.info(`Linterhub: analyze project.`); })
            .then(() => this.linterhub.analyze())
            .then((data) => { return this.getDiagnostics(data) })
            .catch((reason) => { this.logger.error(`Linterhub: error analyze project '${reason}.toString()'.`); })
            .then((data) => {
              this.status.update("Active", false);
              this.logger.info(`Linterhub: finish analyze project.`);
              return data;
            });
    }

    analyzeFile(path) {
        return this.onReady
            .then(() => this.logger.info('Linterhub: analyze file ' + path + '.'))
            .then(() => this.status.update("Analyze file..", true))
            .then(() => this.linterhub.analyzeFile(path))
            .then((data) => { return this.getDiagnostics(data) })
            .catch((reason) => { this.logger.error('Linterhub: error analyze file ' + reason.toString() + '.') })
            .then(() => { this.status.update("Active", false); })
            .then(() => this.logger.info('Linterhub: finish analyze file ' + path + '.'));
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
