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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let filePath = tl.getInput("sourceFile");
            let oldName = tl.getInput("oldActivityName");
            let newName = tl.getInput("newActivityName");
            let printFile = tl.getBoolInput("printFile");
            if (filePath === undefined) {
                throw new Error(`File path cannot be empty`);
            }
            // console.log(`Default dir ${defDir}`)
            if (oldName === undefined) {
                throw new Error(`Old name cannot be empty`);
            }
            if (newName === undefined) {
                throw new Error(`New name cannot be empty`);
            }
            let path = expandSolutionWildcardPatterns(filePath);
            if (!fs.existsSync(path)) {
                throw new Error(`The following path does not exists`);
            }
            if (printFile) {
                console.log(`Path file ${path}`);
            }
            var fileContent = fs.readFileSync(path, "utf8");
            if (printFile) {
                console.log(`Original file content: \n${fileContent}`);
            }
            console.log(`Replace activity label from ${oldName} to ${newName}`);
            fileContent = fileContent.replace(`Label = "${oldName}"`, `Label = "${newName}"`);
            if (printFile) {
                console.log(`Modified file content: \n${fileContent}`);
            }
            tl.writeFile(path, fileContent, "utf8");
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
