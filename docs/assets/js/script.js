const music = document.getElementById("music");
const album = document.getElementById("album");
const audio = new Audio();

const JsonPath = "./data.json";
const DocsTitle = "ミュージック一覧";
const AlbumTitle = "アルバム一覧";

// Json attributes
// {
//  "path": "string",
//  "title": "string",
//  "artist": "string",
//  "references": string[],
// }

/**
 * JSONファイルを取得
 * @returns {Promise<Array>}
 */
async function fetchJson() {
	try {
		const response = await fetch(JsonPath, { cache: "no-store" });
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("JSONファイルの取得に失敗しました:", error);
	}
}

/**
 * アルバム一覧をHTMLで表示する
 * JSONデータを取得し、アルバムごとに曲をグループ化してDOMに追加
 */
async function createAlbumList() {
	// JSONデータを非同期で取得
	const jsonData = await fetchJson();

	// JSONデータが空の場合は処理を中止
	if (!jsonData || jsonData.length === 0) {
		console.warn("アルバムデータが見つかりません");
		return;
	}
	
	// JSONデータからアルバム情報を抽出・整理
	const albumsData = getAlbums(jsonData);

	// アルバムコンテナを取得
	const albumContainer = document.getElementById("album");

	// コンテナが存在しない場合は処理を中止
	if (!albumContainer) {
		console.warn("アルバムコンテナが見つかりません");
		return;
	}
	
	// h2タイトルを作成
	const myTitle = document.createElement("h2");
	myTitle.textContent = AlbumTitle;
	albumContainer.appendChild(myTitle);

	// リストコンテナ（class="list"）を作成
	const myList = document.createElement("div");
	myList.classList.add("list");

	// 各アルバムのHTML構造を作成
	albumsData.forEach((album) => {
		// アルバムコンテナを作成（class="20220601"など）
		const albumDiv = document.createElement("div");
		albumDiv.classList.add(album.id);

		// アルバムリンクを作成
		const albumLink = document.createElement("a");
		albumLink.href = album.id;
		albumLink.textContent = album.name;

		// 曲リストを作成
		const songList = document.createElement("ul");
		album.titles.forEach((title) => {
			// 各曲をリストアイテムとして追加
			const listItem = document.createElement("li");
			listItem.textContent = title;
			songList.appendChild(listItem);
		});

		// アルバムコンテナに要素を追加
		albumDiv.appendChild(albumLink);
		albumDiv.appendChild(songList);
		
		// リストコンテナにアルバムを追加
		myList.appendChild(albumDiv);
	});

	// ページのアルバムコンテナにリストを追加
	albumContainer.appendChild(myList);
}

/**
 * JSONデータからアルバム情報を抽出・整理
 * パスの日付情報からアルバムを自動生成
 * @param {Array} jsonData - JSONから取得した曲データ配列
 * @returns {Array} - { id, name, titles } 形式のアルバム配列
 */
function getAlbums(jsonData) {
	// アルバム情報を格納するMap（重複排除のため）
	const albumMap = new Map();

	// 各曲のデータを処理
	jsonData.forEach((data) => {
		// パスから日付IDを抽出（例: "assets/music/20220601/..." → "20220601"）
		const pathMatch = data.path.match(/(\d{8})/);
		
		if (pathMatch) {
			const albumId = pathMatch[1]; // "20220601"
			
			// 日付からアルバム名を生成（例: "20220601" → "2022年6月"）
			const year = albumId.substring(0, 4);
			const month = parseInt(albumId.substring(4, 6));
			const albumName = `${year}年${month}月`;

			// ユニークキー（日付IDで統一）
			const key = albumId;

			// アルバムがMapに存在しない場合は初期化
			if (!albumMap.has(key)) {
				albumMap.set(key, {
					id: albumId,
					name: albumName,
					titles: [],
				});
			}
			
			// アルバムに曲のタイトルを追加
			albumMap.get(key).titles.push(data.title);
		}
	});

	// Mapを配列に変換し、日付IDでソート
	return Array.from(albumMap.values())
		.sort((a, b) => a.id.localeCompare(b.id));
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
		const myItemReferences = await createItemReferences(data.references);

		addAudioEvent(myItemTitle, data.path);

		myMusicItem.classList.add("item");
		myItemArtist.classList.add("artist");

		myItemArtist.textContent = data.artist;

		myMusicItem.appendChild(myItemTitle);
		myMusicItem.appendChild(myItemArtist);
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

if (album != null) {
	createAlbumList();
}

if (music != null) {
	createMusicList();
}

