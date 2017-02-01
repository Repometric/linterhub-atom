"use babel";
import { LinterhubCliLazy, LinterhubMode, install, getDotnetVersion, Integration, LoggerInterface, StatusInterface } from "linterhub-ide";
import * as path from 'path';
import * as fs from 'fs';

class Logger implements LoggerInterface
{
  constructor()
  {
    this.prefix = "Linterhub: ";
  }
  info(string)
  {
    console.log(this.prefix + string.toString());
  }
  error(string)
  {
    console.error(this.prefix + string.toString());
  }
  error(string)
  {
    console.warn(this.prefix + string.toString());
  }
}

class StatusLogger implements StatusInterface
{
    update(params, progress, text)
    {
      if(typeof progress !== "undefined")
        atom.config.set('linterhub-atom.progress', Boolean(progress));
      else
        atom.config.set('linterhub-atom.progress', true);
      console.log("Status: " + text);
      atom.config.set('linterhub-atom.status', text);
    }
}

/*
this.settings = {
  linterhub: {
    enable: true,
    mode: "",
    cliPath: "",
    extensionPath: path.resolve(__dirname + "/../../")
  }
}
*/

class IntegrationLogic
{
    constructor(project, version) {
      this.project = project;
      this.linterhub_version = version;
      this.logger = new Logger();
      this.status = new StatusLogger();
      this.status.update(null, false, "Active")
    }

    /*
    initializeIntegration()
    {
      this.settings.linterhub.cliPath = atom.config.get('linterhub-atom.path_cli');
      this.settings.linterhub.mode = atom.config.get('linterhub-atom.mode');
      if(this.settings.linterhub.mode == undefined || this.settings.linterhub.cliPath == undefined)
      {
        this.status.update(null, true, "Installing...")
        return this.install()
          .then((data) => {this.settings.linterhub.cliPath = data})
      }
      else {
        if (!fs.existsSync(this.settings.linterhub.cliPath)) {
          this.status.update(null, true, "Installing...")
          return this.install()
            .then((data) => {
              this.settings.linterhub.cliPath = data;
              console.log(data)
              atom.config.set('linterhub-atom.path_cli', data);
              atom.config.set('linterhub-atom.mode', this.settings.linterhub.mode);
            })
        }
        else
          return this.initializeLinterhub().then(() => this.status.update(null, false, "Active"));
      }
    }
    */

    normalizePath(path)
    {
      return path;
    }

    sendDiagnostics(data, doc = null) {
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
exports.IntegrationLogic = IntegrationLogic;
