#!/bin/bash

# cut-music.sh: Cut music files from a directory
# Requirements: bash, ffmpeg
# Usage: bash cut-music.sh MP3_DIR CUT_DIR START_TIME END_TIME
# Example: bash cut-music.sh /path/to/mp3 /path/to/cut 10 30

set -eo pipefail

MP3_DIR="${1:-}"
CUT_DIR="${2:-}"
START_TIME="${3:-}"
END_TIME="${4:-}"

# Check if the user has provided the required arguments
if [ -z "$MP3_DIR" ] || [ -z "$CUT_DIR" ] || [ -z "$START_TIME" ] || [ -z "$END_TIME" ]; then
  echo "Usage: bash cut-music.sh MP3_DIR CUT_DIR START_TIME END_TIME"
  exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg is not installed"
  exit 1
fi

# Check if the MP3_DIR exists
if [ ! -d "$MP3_DIR" ]; then
  echo "Error: The directory '$MP3_DIR' does not exist"
  exit 1
fi

# Check if the CUT_DIR exists, create it if not
if [ ! -d "$CUT_DIR" ]; then
  mkdir -p "$CUT_DIR"
  echo "Created directory: $CUT_DIR"
fi

# Validate START_TIME and END_TIME are integers
if ! [[ "$START_TIME" =~ ^[0-9]+$ ]] || ! [[ "$END_TIME" =~ ^[0-9]+$ ]]; then
  echo "Error: The start time and end time should be integers"
  exit 1
fi

# Count mp3 files
mp3_count=$(find "$MP3_DIR" -maxdepth 1 -name "*.mp3" -o -name "*.MP3" | wc -l)

if [ "$mp3_count" -eq 0 ]; then
  echo "Error: No mp3 files found in the directory '$MP3_DIR'"
  exit 1
fi

echo "Found $mp3_count mp3 file(s) to cut"
echo "Start time: ${START_TIME}s, End time: ${END_TIME}s"

# Cut the music files
cut_count=0
failed=0

for mp3_file in "$MP3_DIR"/*.mp3 "$MP3_DIR"/*.MP3; do
  # Skip if file doesn't exist
  [ -f "$mp3_file" ] || continue
  
  # Get the filename without extension
  filename=$(basename "$mp3_file" .mp3)
  filename=$(basename "$filename" .MP3)
  cut_file="$CUT_DIR/$filename.mp3"
  
  echo "Cutting: $(basename "$mp3_file") -> $filename.mp3"
  
  # Cut the music file with error handling
  if ffmpeg -i "$mp3_file" -ss "$START_TIME" -t "$END_TIME" -acodec copy "$cut_file" 2>/dev/null; then
    ((cut_count++))
  else
    echo "Error: Failed to cut '$(basename "$mp3_file")'"
    ((failed++))
  fi
done

echo ""
echo "Cutting complete: $cut_count succeeded, $failed failed"

