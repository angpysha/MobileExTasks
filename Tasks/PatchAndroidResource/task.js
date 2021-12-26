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
const trm = require("azure-pipelines-task-lib/toolrunner");
const fs = require("fs");
const convert = require("xml-js");
const { DOMParser } = require('@xmldom/xmldom');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let tool = trm.ToolRunner;
            let filePath = tl.getInput("sourcePath");
            let propertyName = tl.getInput("propertyName");
            let propertyValue = tl.getInput("propertyValue");
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
            console.log("Property name: %s", propertyName);
            let properties = propertyName.split(",");
            let values = propertyValue.split(",");
            let xmlString = fs.readFileSync(filePath, 'utf8');
            console.log("Xml file content before patch: \n%s", xmlString);
            var options = { ignoreComment: true, alwaysChildren: true };
            var oo = convert.xml2js(xmlString, options);
            let parser = new DOMParser();
            let obj = parser.parseFromString(xmlString, "text/xml");
            const select = require('xpath.js');
            for (var i = 0; i < properties.length; i++) {
                const nodes = select(obj, `//resources/string[@name='${properties[i]}']`);
                console.log(`Old value for ${properties[i]}: ${nodes[0].firstChild.data}`);
                nodes[0].firstChild.data = values[i];
                console.log(`New value for ${properties[i]}: ${nodes[0].firstChild.data}`);
            }
            console.log("New value: \n%s", obj.toString());
            tl.writeFile(filePath, obj.toString(), "utf8");
        }
        catch (er) {
            tl.setResult(tl.TaskResult.Failed, er.message);
        }
    });
}
run();
