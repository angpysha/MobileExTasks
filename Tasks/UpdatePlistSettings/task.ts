import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import fs = require('fs');
const plist = require('plist');

function expandSolutionWildcardPatterns(solutionPattern: string): string {
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
    } else {
        throw new Error (tl.loc('SolutionDoesNotExist', solutionPattern));
    }
}

async function run() {
    let sourceFile = tl.getPathInput("sourceFile")
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
}

run();