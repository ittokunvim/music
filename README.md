# music

このリポジトリには、お気に入りの音楽が保存されています。
またその音楽を公開しているサイトで視聴することができます。

## 音楽の詳細

- 音楽は`docs/assets/music`に保存
- 曲の長さは`30`秒
- `docs/data.json`に曲の情報が書かれている
- 曲はアルバムごとで管理されており、名前が`20220901`の形式でディレクトリで保存されている

### 音楽を追加する

音楽を追加するには以下の手順を踏んで行う

```bash
# 曲をmp3に変換する
./audio-to-mp3.sh AUDIO_DIR MP3_DIR
# 曲をカットする
./cut-music.sh MP3_DIR CUT_DIR START_TIME END_TIME
# ディレクトリ名を変更し、移動させる
mv CUT_DIR docs/assets/music/20220901
# カレントディレクトリを移動する
cd docs
# JSONに音楽の情報を書き込む
node json.js SOURCE_DIR [OUTPUT_FILE]
```

