const fs    = require("fs");
const path  = require("path");

const sbmRoot = path.resolve(__dirname, "../assets/submissions");
const smbDirs = fs.readdirSync(sbmRoot);
const jsonObj = {};

smbDirs.forEach((sbmDirName) => {
    const sbmDirPath = path.resolve(sbmRoot, sbmDirName);
    if (fs.lstatSync(sbmDirPath).isDirectory()) {
        const filenames = fs.readdirSync(sbmDirPath);
        jsonObj[sbmDirName] = {
            img: filenames.find((fn) => fn !== "thumb.jpg" && fn.match(/.((png)|(jpg)|(jpeg))$/i)) || "",
            //msg: filenames.find((fn) => fn.match(/.((txt))$/i)) || "",
        };
    }
});
fs.writeFile(
    path.resolve(sbmRoot, "existing.json"),
    JSON.stringify(jsonObj),
    (err) => console.log(err),
);
