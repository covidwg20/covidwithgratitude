const fs    = require("fs");
const path  = require("path");

const sbmRoot = path.resolve(__dirname, "../assets/submissions");
const smbDirs = fs.readdirSync(sbmRoot);
const jsonObj = {};

smbDirs.forEach((sbmDirName) => {
    const sbmDirPath = path.resolve(sbmRoot, sbmDirName);
    if (fs.lstatSync(sbmDirPath).isDirectory()) {
        jsonObj[sbmDirName] = fs.readdirSync(sbmDirPath)
        .find((fileName) => fileName.match(/.((png)|(jpg)|(jpeg))$/i));
    }
});
fs.writeFile(
    path.resolve(sbmRoot, "existing.json"),
    JSON.stringify(jsonObj),
    (err) => console.log(err),
);
