const fs    = require("fs");
const path  = require("path");

const sbmRoot = path.resolve(__dirname, "../assets/submissions");
const smbDirs = fs.readdirSync(sbmRoot);
const jsonObj = {};

smbDirs.forEach((sbmDirName) => {
    jsonObj[sbmDirName] = fs.readdirSync(path.resolve(sbmRoot, sbmDirName))
    .find((fileName) => fileName.match(/.((png)|(jpg)|(jpeg))$/i));
});
fs.writeFile(
    path.resolve(sbmRoot, "existing.json"),
    JSON.stringify(jsonObj),
    (err) => console.log(err),
);
