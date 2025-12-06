import fs from "fs";

console.log("Updating invaders list...");

fetch("https://corsproxy.io/?url=https://pnote.eu/projects/invaders/map/invaders.json")
    .then((res) => res.json())
    .then((data) => {
        fs.writeFileSync("public/data/invaders.json", JSON.stringify(data, null, 2));
        console.log("Saved invaders data to public/data/invaders.json");
    });

console.log("Done.");