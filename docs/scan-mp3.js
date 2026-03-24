#!/usr/bin/env node

// このスクリプトは、指定したディレクトリ以下のファイル名を読み取り
// JSONとして出力するスクリプトです
// 既存のJSONファイルがある場合は、データを追加します
// Usage: node json.js SOURCE_DIR [OUTPUT_FILE]

const fs = require('fs');
const path = require('path');

// コマンドライン引数を取得
const sourceDir = process.argv[2];
const outputFile = process.argv[3];

// ヘルプ表示
function showHelp() {
  console.log('Usage: node json.js SOURCE_DIR [OUTPUT_FILE]');
  console.log('');
  console.log('Description:');
  console.log('  Scans a directory for mp3 files and generates a JSON file');
  console.log('  If the output file already exists, new data will be appended');
  console.log('');
  console.log('Arguments:');
  console.log('  SOURCE_DIR   - Directory containing mp3 files');
  console.log('  OUTPUT_FILE  - Output JSON file (optional)');
  console.log('                 If omitted, output to stdout');
  console.log('');
  console.log('Examples:');
  console.log('  node json.js /path/to/mp3');
  console.log('  node json.js /path/to/mp3 output.json');
  console.log('  ./json.js /path/to/mp3 music.json');
}

// 引数のチェック
if (!sourceDir) {
  showHelp();
  process.exit(1);
}

// ディレクトリが存在するかチェック
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: The directory '${sourceDir}' does not exist`);
  process.exit(1);
}

// ディレクトリであるかチェック
const stats = fs.statSync(sourceDir);
if (!stats.isDirectory()) {
  console.error(`Error: '${sourceDir}' is not a directory`);
  process.exit(1);
}

// 出力ファイルの親ディレクトリをチェック（書き込み可能か）
if (outputFile) {
  const outputDir = path.dirname(outputFile);
  const actualDir = outputDir === '.' ? process.cwd() : outputDir;
  
  if (!fs.existsSync(actualDir)) {
    console.error(`Error: Output directory '${actualDir}' does not exist`);
    process.exit(1);
  }
}

// mp3ファイルを読み込む
let mp3Files = [];
try {
  const files = fs.readdirSync(sourceDir);
  mp3Files = files
    .filter(file => file.toLowerCase().endsWith('.mp3'))
    .sort();
} catch (error) {
  console.error(`Error reading directory: ${error.message}`);
  process.exit(1);
}

// mp3ファイルが存在するかチェック
if (mp3Files.length === 0) {
  console.error(`Error: No mp3 files found in the directory '${sourceDir}'`);
  process.exit(1);
}

console.error(`Found ${mp3Files.length} mp3 file(s)`);

// 新しいJSONを生成
const newJson = mp3Files.map((mp3File) => {
  const filename = path.parse(mp3File).name;
  const filePath = path.join(sourceDir, mp3File);

  return {
    path: filePath,
    title: filename,
    artist: 'artist',
    references: ['reference'],
    createdAt: '2026'
  };
});

// 出力先を決定
if (outputFile) {
  let jsonData = newJson;

  // 既存のJSONファイルがあるかチェック
  if (fs.existsSync(outputFile)) {
    try {
      const existingData = fs.readFileSync(outputFile, 'utf8');
      const existingJson = JSON.parse(existingData);

      // 既存のデータが配列かチェック
      if (Array.isArray(existingJson)) {
        // 重複排除（pathで比較）
        const existingPaths = new Set(existingJson.map(item => item.path));
        const uniqueNewData = newJson.filter(item => !existingPaths.has(item.path));

        jsonData = [...existingJson, ...uniqueNewData];
        console.error(`✓ Loaded existing JSON with ${existingJson.length} item(s)`);
        console.error(`  Adding ${uniqueNewData.length} new item(s) (${newJson.length - uniqueNewData.length} duplicate(s) skipped)`);
      } else {
        console.error('Warning: Existing file is not a JSON array. Overwriting...');
        jsonData = newJson;
      }
    } catch (error) {
      console.error(`Warning: Could not parse existing JSON: ${error.message}`);
      console.error('  Overwriting with new data...');
      jsonData = newJson;
    }
  } else {
    console.error(`Creating new JSON file: '${outputFile}'`);
  }

  // ファイルに書き込む
  try {
    const jsonString = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(outputFile, jsonString + '\n', 'utf8');
    console.error(`✓ Successfully wrote ${jsonData.length} item(s) to '${outputFile}'`);
  } catch (error) {
    console.error(`Error writing to file: ${error.message}`);
    process.exit(1);
  }
} else {
  // 標準出力に出力
  const jsonString = JSON.stringify(newJson, null, 2);
  console.log(jsonString);
}
