# wav-to-mp3.rb: Convert all wav files in a directory to mp3 files
# Requirements: ruby, ffmpeg
# Example: ruby wav-to-mp3.rb WAV_DIR MP3_DIR
WAV_DIR = ARGV[0]
MP3_DIR = ARGV[1]

# Check if the user has provided the required arguments
if WAV_DIR.nil? || MP3_DIR.nil?
  puts "Usage: ruby wav-to-mp3.rb WAV_DIR MP3_DIR"
  exit
end

# check if the directories exist
if Dir.exist?(WAV_DIR) == false
  puts "The directory #{wav_dir} does not exist"
  exit
end

# check if the directories exist
if Dir.exist?(MP3_DIR) == false
  Dir.mkdir(MP3_DIR)
end

# Get all the wav files in the directory
wav_files = Dir.glob("#{WAV_DIR}/*.wav")

# Check if there are any wav files in the directory
if wav_files.empty?
  puts "No wav files found in the directory #{WAV_DIR}"
  exit
end

# Convert the wav files to mp3
wav_files.each do |wav_file|
  mp3_file = "#{MP3_DIR}/#{File.basename(wav_file, ".wav")}.mp3"
  system("ffmpeg -i '#{wav_file}' -vn -ac 2 -ar 44100 -ab 256k -acodec libmp3lame -f mp3 '#{mp3_file}'")
end

