import * as fs from "fs";
import * as path from "path";

console.log("Updating invaders list...");

fetch(
	"https://corsproxy.io/?url=https://pnote.eu/projects/invaders/map/invaders.json",
).then((data) => {
	const dir = path.join("public", "data");
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	fs.writeFileSync(
		path.join(dir, "invaders.json"),
		JSON.stringify(data, null, 2),
	);
	console.log("Saved invaders data to public/data/invaders.json");
});

console.log("Done.");
