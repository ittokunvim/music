# このスクリプトは、指定したディレクトリ以下のファイル名を読み取り
# JSONとして出力するスクリプトです
# Usage: ruby json.rb SOURCE_DIR
require "json"
require "fileutils"

# 読み込みたいディレクトリ名を指定する
SOURCE_DIR = ARGV[0]
# 引数のチェック
if SOURCE_DIR.nil? { 
  puts "Usage: ruby json.rb SOURCE_DIR"
  exit
}
# 引数のディレクトリがあるかチェック
if Dir.exist?(SOURCE_DIR) == false
  puts "The directory #{SOURCE_DIR} does not exist"
  exit
}
# 最終的にこの変数の値を出力する
json = []
# 型の定義
hash = {
  path: "",
  title: "",
  artist: "",
  references: [
    "",
  ],
  createdAt: ""
}
# 指定したディレクトリ下のmp3ファイル名を代入
mp3_files = Dir.glob("#{SOURCE_DIR}/*.mp3")
# mp3ファイル名をループ処理し、ハッシュに代入し
# ハッシュの値をJSONに格納する
mp3_files.each_with_index do |mp3_file, i|
  filename = File.basename(mp3_file, ".mp3")
  filepath = "cut/#{File.basename(mp3_file, ".mp3")}.mp3"
  path = "music/MUS_00#{i+1}.mp3";
  # FileUtils.cp filepath, path
  hash = {
    path: path,
    title: filename,
    artist: "",
    references: [
      "",
    ],
    createdAt: "2022",
  }
  json.push(hash)
end
# 出力
puts JSON.pretty_generate(json)
