# Copilot instructions

- ドキュメントと Issue は、別途指定がない限り日本語で記述する。
- Issue の解決方法を説明する場合は、対応する英語のコミットメッセージも提示する。
- `docs/data.json` は JSON 配列として維持し、各曲には `path`、`title`、`artist`、`references`、`createdAt` を含める。
- 音源ファイルは `docs/assets/music/<album-date>/` に配置し、`<album-date>` には `YYYYMMDD` 形式を使用する。
- `audio-to-mp3.sh` または `cut-music.sh` を変更する場合は、引数検証、ファイルパスの引用、曲ごとの明確なエラー表示と処理結果のサマリーを維持する。
- 音源追加の手順やコマンドライン引数を変更する場合は、`README.md` も更新する。
