# Usage: ruby cut-music.rb MP3_DIR START_TIME END_TIME
# Requirements: ruby, ffmpeg
# Example: ruby cut-music.rb MP3_DIR START_TIME END_TIME
MP3_DIR = ARGV[0]
START_TIME = ARGV[1]
END_TIME = ARGV[2]

MUSIC_DIR = "music"

# Check if the user has provided the required arguments
if MP3_DIR.nil? || START_TIME.nil? || END_TIME.nil?
  puts "Usage: ruby cut-music.rb MP3_DIR START_TIME END_TIME"
  exit
end

# Check if the MP3_DIR exists
if Dir.exist?(MP3_DIR) == false
  puts "The directory #{MP3_DIR} does not exist"
  exit
end

# Check START_TIME and END_TIME are integers
unless START_TIME =~ /^[0-9]+$/ && END_TIME =~ /^[0-9]+$/
  puts "The start time or end time should be integers"
  exit
end

# Get all the mp3 files in the directory
mp3_files = Dir.glob("#{MP3_DIR}/*.mp3")

# Check if there are any mp3 files in the directory
if mp3_files.empty?
  puts "No mp3 files found in the directory #{MP3_DIR}"
  exit
end

# Cut the music files
mp3_files.each do |mp3_file|
  music_file = "#{MUSIC_DIR}/#{File.basename(mp3_file, ".mp3")}.mp3"
  system("ffmpeg -i '#{mp3_file}' -ss #{START_TIME} -t #{END_TIME} -acodec copy '#{music_file}'")
end
