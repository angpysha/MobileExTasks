"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const fs = require("fs");
const plist = require('plist');
function expandSolutionWildcardPatterns(solutionPattern) {
    let defDir = tl.getVariable("Build.SourcesDirectory");
    if (defDir === undefined) {
        throw new Error("Build.SourcesDirectory undefined");
    }
    const matchedSolutionFiles = tl.findMatch(defDir, solutionPattern, { followSymbolicLinks: false, followSpecifiedSymbolicLink: false, allowBrokenSymbolicLinks: false });
    tl.debug(`Found ${matchedSolutionFiles ? matchedSolutionFiles.length : 0} solution files matching the pattern.`);
    if (matchedSolutionFiles && matchedSolutionFiles.length > 0) {
        const result = matchedSolutionFiles[0];
        if (matchedSolutionFiles.length > 1) {
            tl.warning(tl.loc('MultipleSolutionsFound', result));
        }
        return result;
    }
    else {
        throw new Error(tl.loc('SolutionDoesNotExist', solutionPattern));
    }
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let sourceFile = tl.getPathInput("sourceFile");
        let properties = tl.getInput("properties");
        let values = tl.getInput("values");
        if (sourceFile === undefined) {
            throw new Error("Source file cannot be empty");
        }
        let path = expandSolutionWildcardPatterns(sourceFile);
        if (properties === undefined) {
            throw new Error("Properties cannot be empty");
        }
        if (values === undefined) {
            throw new Error("Values cannot be empty");
        }
        let content = fs.readFileSync(path, "utf8");
        var plistObj = plist.parse(content);
        let propertiesArray = properties.split("\n");
        let valuesArray = values.split("\n");
        if (propertiesArray.length != valuesArray.length) {
            throw new Error("Proerties names and values should have the same length");
        }
        for (var i = 0; i < propertiesArray.length; i++) {
            plistObj[`${propertiesArray[i]}`] = valuesArray[i];
        }
        console.log(`${plist.build(plistObj)}`);
        //console.log(`${plistObj["AppCenterId"]}`);
    });
}
run();
