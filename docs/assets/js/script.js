const music = document.getElementById("music");
const album = document.getElementById("album");
const audio = new Audio();

const JsonPath = "./data.json";
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
 * 日付文字列をフォーマット
 * @param {string} dateStr - 日付文字列（例：20220901）
 * @returns {string} - フォーマット済みの日付（例：2022年9月）
 */
function formatDateToYearMonth(dateStr) {
	const year = dateStr.substring(0, 4);
	const month = dateStr.substring(4, 6);
	const monthInt = parseInt(month, 10);
	return `${year}年${monthInt}月`;
}

/**
 * URLから日付を抽出
 * @returns {string|null} - 日付文字列（例：20220901）、見つからない場合はnull
 */
function getDateFromURL() {
	const pathname = window.location.pathname;
	// /20220901のようなパターンから日付を抽出
	const match = pathname.match(/\/(\d{8})$/);
	return match ? match[1] : null;
}

/**
 * pathから日付を抽出
 * @param {string} path - ファイルパス（例：assets/music/20220901/4321.mp3）
 * @returns {string|null} - 日付文字列（例：20220901）、見つからない場合はnull
 */
function getDateFromPath(path) {
	const match = path.match(/(\d{8})/);
	return match ? match[1] : null;
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
			const albumName = formatDateToYearMonth(albumId);

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
 * ミュージックリストを作成してDOMに追加
 */
async function createMusicList() {
	// JSONデータを非同期で取得
	const jsonData = await fetchJson();

	// JSONデータが空の場合は処理を中止
	if (!jsonData || jsonData.length === 0) {
		console.warn("ミュージックデータが見つかりません");
		return;
	}

	// URLから日付を取得
	const dateFromURL = getDateFromURL();

	// URLから日付が取得できない場合は処理を中止
	if (!dateFromURL) {
		console.warn("URLから有効な日付が見つかりません");
		return;
	}

	// URLの日付に一致するアルバムのみをフィルタリング
	const filteredData = jsonData.filter((data) => {
		const dateFromPath = getDateFromPath(data.path);
		return dateFromPath === dateFromURL;
	});

	// フィルタ後のデータが空の場合
	if (filteredData.length === 0) {
		console.warn(`日付 ${dateFromURL} に一致するアルバムが見つかりません`);
		return;
	}
	
	const myMusicList = document.createElement("div");
	const myMusicTitle = document.createElement("h2");

	myMusicList.classList.add("list");
	myMusicTitle.textContent = formatDateToYearMonth(dateFromURL);

	filteredData.forEach((data) => {
		const myMusicItem = document.createElement("div");
		const myItemTitle = createItemTitle(data.title);
		const myItemArtist = document.createElement("div");
		const myItemReferences = createItemReferences(data.references);

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

/**
 * 曲のタイトル要素を作成
 * @param {string} title - 曲のタイトル
 * @returns {HTMLElement} - タイトル要素
 */
function createItemTitle(title) {
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

/**
 * 参考リンク要素を作成
 * @param {Array} - 参考リンクのURL配列
 * @returns {HTMLElement} - 参考リンク要素
 */
function createItemReferences(references) {
	const myDetails = document.createElement("details");
	const mySummary = document.createElement("summary");

	myDetails.classList.add("references");
	mySummary.textContent = "参考リンク";
	myDetails.appendChild(mySummary);

	if (references && references.length > 0) {
		references.forEach((reference) => {
			const myItemReference = document.createElement("a");
			myItemReference.textContent = reference;
			myItemReference.href = reference;
			myItemReference.target = "_blank";
			myItemReference.rel = "noopener noreferrer";
			myDetails.appendChild(myItemReference);
		});
	}

	return myDetails;
}

/**
 * 音声再生機能を追加
 * @param {HTMLElement} title - タイトル要素
 * @param {string} path - 音声ファイルのパス
 */
function addAudioEvent(title, path) {
	title.addEventListener("click", () => {
		const playIcon = title.querySelector("i");

		title.dataset.playing = title.dataset.playing === "true" ? "false" : "true";
		audio.src = path;

		if (title.dataset.playing === "true") {
			audio.play();
			playIcon.classList.remove("fa-play");
			playIcon.classList.add("fa-pause");
		} else {
			audio.pause();
			playIcon.classList.remove("fa-pause");
			playIcon.classList.add("fa-play");
		}
	});
}

document.addEventListener("DOMContentLoaded", () => {
	if (album) {
		createAlbumList();
	}

	if (music) {
		createMusicList();
	}
});

