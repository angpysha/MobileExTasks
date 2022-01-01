import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import fs = require('fs');

/**
 * Find all filenames starting from `rootDirectory` that match a wildcard pattern.
 * @param solutionPattern A filename pattern to evaluate, possibly containing wildcards.
 */
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

function set(path: any, value: any, obj: any) : any {
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;

    return schema;
}


async function run() {
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

    if (!fs.existsSync(path)) {
        throw new Error("The following file does not exists");
    }

    let file = fs.readFileSync(filePath,"utf8");
    var json = JSON.parse(file);
    let properties = propertyNames.split("\n");
    let values = valueNames.split("\n");

    if (printFile) 
    {
        console.log(`List of properties: ${properties}`);

        console.log(`Original file: ${file}`);
    }

    for (var i =0; i < properties.length; i++) 
    {
        let property = properties[i];
        let value = values[i];
        if (printFile) 
        {
            console.log(`Set ${property} to ${value}`);
        }

        let propertiesCurrent = property.split(".");

        var item = json;

        let val = set(property, value, item);
    }
    if (printFile) 
    {
        console.log(`Modified file: \n${JSON.stringify(json)}`);
    }
}

run();