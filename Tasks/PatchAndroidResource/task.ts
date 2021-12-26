import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import fs = require('fs');
import { domainToASCII } from 'url';
import { isNullOrUndefined } from 'util';
import convert = require("xml-js");
const { DOMParser } = require('@xmldom/xmldom')

async function run() {
    try {
    let tool = trm.ToolRunner;

    let filePath: string | undefined = tl.getInput("sourcePath");
    let propertyName: string | undefined = tl.getInput("propertyName");
    let propertyValue: string | undefined = tl.getInput("propertyValue");


    if (filePath === undefined) {
        throw new Error("!!! Missing required parameter FilePath");
    }

    if (propertyName === undefined) {
        throw new Error("!!! Missing required parameter PropertyName");
    }

    if (propertyValue === undefined) {
        throw new Error("!!! Missing required parameter PropertyValue");
    }

    console.log("Load resources file path: %s", filePath);

    console.log("Property name: %s", propertyName)

    let properties = propertyName.split(",");
    let values = propertyValue.split(",");

    let xmlString: string | undefined = fs.readFileSync(filePath, 'utf8');

    console.log("Xml file content before patch: \n%s", xmlString);

    var options = {ignoreComment: true, alwaysChildren: true};
    var oo = convert.xml2js(xmlString, options);
    let parser = new DOMParser();
    
     let obj = parser.parseFromString(xmlString, "text/xml");
     const select = require('xpath.js');

     for (var i = 0; i < properties.length; i++) 
     {
        const nodes = select(obj, `//resources/string[@name='${properties[i]}']`);
        console.log(`Old value for ${properties[i]}: ${nodes[0].firstChild.data}`);

        nodes[0].firstChild.data = values[i];

        console.log(`New value for ${properties[i]}: ${nodes[0].firstChild.data}`);   
     }

    
    console.log("New value: \n%s", obj.toString());

    tl.writeFile(filePath, obj.toString(), "utf8")
} catch (er: any)
{
    tl.setResult(tl.TaskResult.Failed, er.message);
}
}

run();