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
/**
 * Find all filenames starting from `rootDirectory` that match a wildcard pattern.
 * @param solutionPattern A filename pattern to evaluate, possibly containing wildcards.
 */
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
function set(path, value, obj) {
    var schema = obj; // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for (var i = 0; i < len - 1; i++) {
        var elem = pList[i];
        if (!schema[elem])
            schema[elem] = {};
        schema = schema[elem];
    }
    schema[pList[len - 1]] = value;
    return schema;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let filePath = tl.getPathInput("sourcePath");
        let propertyNames = tl.getPathInput("properties");
        let valueNames = tl.getPathInput("values");
        let printFile = tl.getBoolInput("printFile");
        if (filePath === undefined) {
            throw new Error("Filepath cannot be empty");
        }
        if (propertyNames === undefined) {
            throw new Error("properties cannot be empty");
        }
        if (valueNames === undefined) {
            throw new Error("values cannot be empty");
        }
        let path = expandSolutionWildcardPatterns(filePath);
        let file = fs.readFileSync(filePath, "utf8");
        var json = JSON.parse(file);
        let properties = propertyNames.split("\n");
        let values = valueNames.split("\n");
        if (printFile) {
            console.log(`List of properties: ${properties}`);
            console.log(`Original file: ${file}`);
        }
        for (var i = 0; i < properties.length; i++) {
            let property = properties[i];
            let value = values[i];
            if (printFile) {
                console.log(`Set ${property} to ${value}`);
            }
            let propertiesCurrent = property.split(".");
            var item = json;
            let val = set(property, value, item);
        }
        if (printFile) {
            console.log(`Modified file: \n${JSON.stringify(json)}`);
        }
    });
}
run();
