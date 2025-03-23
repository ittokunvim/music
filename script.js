const music = document.getElementById("music");
const audio = new Audio();

const JsonPath = "./data.json";
const DocsTitle = "ミュージック一覧";

// Json attributes
// {
//  "path": "string",
//  "title": "string",
//  "artist": "string",
//  "references": string[],
//  "createdAt": "string"
// }

async function fetchJson() {
	try {
		const response = await fetch(JsonPath, { cache: "no-store" });
		const data = await response.json();
		data.forEach((music) => {
			music.createdAt = formatDate(music.createdAt);
		});
		return data;
	} catch (error) {
		console.error(error);
	}
}

async function createMusicList() {
	const jsonData = await fetchJson();
	const myMusicList = document.createElement("div");
	const myMusicTitle = document.createElement("h2");

	myMusicList.classList.add("list");
	myMusicTitle.textContent = DocsTitle;

	jsonData.forEach(async (data) => {
		const myMusicItem = document.createElement("div");
		const myItemTitle = await createItemTitle(data.title);
		const myItemArtist = document.createElement("div");
		const myItemCreatedAt = document.createElement("div");
		const myItemReferences = await createItemReferences(data.references);

		addAudioEvent(myItemTitle, data.path);

		myMusicItem.classList.add("item");
		myItemArtist.classList.add("artist");
		myItemCreatedAt.classList.add("createdAt");

		myItemArtist.textContent = data.artist;
		myItemCreatedAt.textContent = `${data.createdAt}に作成`;

		myMusicItem.appendChild(myItemTitle);
		myMusicItem.appendChild(myItemArtist);
		myMusicItem.appendChild(myItemCreatedAt);
		myMusicItem.appendChild(myItemReferences);

		myMusicList.appendChild(myMusicItem);
	});

	music.appendChild(myMusicTitle);
	music.appendChild(myMusicList);
}

async function createItemTitle(title) {
	const myTitle = document.createElement("div");
	const mySpan = document.createElement("span");
	const myPlayIcon = document.createElement("i");

	myTitle.classList.add("title");
	myTitle.dataset.playing = false;
	myPlayIcon.classList.add("fa-solid", "fa-play");
	mySpan.textContent = title;

	myTitle.appendChild(myPlayIcon);
	myTitle.appendChild(mySpan);

	return myTitle;
}

async function createItemReferences(references) {
	const myDetails = document.createElement("details");
	const mySummary = document.createElement("summary");

	myDetails.classList.add("references");
	mySummary.textContent = "参考リンク";
	myDetails.appendChild(mySummary);
	references.forEach((reference) => {
		const myItemReference = document.createElement("a");
		myItemReference.textContent = reference;
		myItemReference.href = reference;
		myDetails.appendChild(myItemReference);
	});

	return myDetails;
}

async function addAudioEvent(title, path) {
	title.addEventListener("click", () => {
		const playIcon = title.querySelector("i");
		const src = path;

		title.dataset.playing = title.dataset.playing === "true" ? "false" : "true";
		audio.src = src;

		if (title.dataset.playing === "true") {
			audio.play();
			audio.dataset.playing = "true";
			playIcon.classList.remove("fa-play");
			playIcon.classList.add("fa-pause");
		} else {
			audio.pause();
			audio.dataset.playing = "false";
			playIcon.classList.remove("fa-pause");
			playIcon.classList.add("fa-play");
		}
	});
}

function formatDate(createdAt) {
	const date = new Date(createdAt);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}年${month}月${day}日`;
}

createMusicList();

