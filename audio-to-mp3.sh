#!/bin/bash

# audio-to-mp3.sh: Convert various audio files to mp3
# Requirements: bash, ffmpeg
# Supported formats: wav, flac, m4a, aac, ogg, wma, alac, opus
# Example: bash audio-to-mp3.sh AUDIO_DIR MP3_DIR

set -eo pipefail

AUDIO_DIR="$1"
MP3_DIR="$2"

# Supported audio formats (without dot)
SUPPORTED_FORMATS=("wav" "flac" "m4a" "aac" "ogg" "wma" "alac" "opus" "aiff" "ape")

# Check if the user has provided the required arguments
if [ -z "$AUDIO_DIR" ] || [ -z "$MP3_DIR" ]; then
  echo "Usage: bash audio-to-mp3.sh AUDIO_DIR MP3_DIR"
  echo "Supported formats: ${SUPPORTED_FORMATS[*]}"
  exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg is not installed"
  exit 1
fi

# Check if the audio directory exists
if [ ! -d "$AUDIO_DIR" ]; then
  echo "Error: The directory '$AUDIO_DIR' does not exist"
  exit 1
fi

# Check if the MP3 directory exists, create it if not
if [ ! -d "$MP3_DIR" ]; then
  mkdir -p "$MP3_DIR"
  echo "Created directory: $MP3_DIR"
fi

# Count audio files
audio_count=0
for format in "${SUPPORTED_FORMATS[@]}"; do
  count=$(find "$AUDIO_DIR" -maxdepth 1 -name "*.${format}" -o -name "*.$(echo "$format" | tr '[:lower:]' '[:upper:]')" | wc -l)
  audio_count=$((audio_count + count))
done

# Count mp3 files
mp3_count=$(find "$AUDIO_DIR" -maxdepth 1 \( -name "*.mp3" -o -name "*.MP3" \) | wc -l)
total_count=$((audio_count + mp3_count))

if [ "$total_count" -eq 0 ]; then
  echo "Error: No audio files found in the directory '$AUDIO_DIR'"
  echo "Supported formats: ${SUPPORTED_FORMATS[*]}, mp3"
  exit 1
fi

echo "Found $audio_count audio file(s) and $mp3_count mp3 file(s) to process"

# Convert the audio files to mp3
converted=0
failed=0
copied=0
skipped=0

# Find all files in the directory
for audio_file in "$AUDIO_DIR"/*; do
  # Skip if not a file
  [ -f "$audio_file" ] || continue
  
  # Get file extension (lowercase)
  extension=$(echo "${audio_file##*.}" | tr '[:upper:]' '[:lower:]')
  
  # Get the filename without extension
  filename=$(basename "$audio_file" ".$extension")
  
  # Handle mp3 files
  if [ "$extension" = "mp3" ]; then
    mp3_file="$MP3_DIR/$(basename "$audio_file")"
    
    # Skip if mp3 already exists in MP3_DIR
    if [ -f "$mp3_file" ]; then
      echo "Skipped: $(basename "$audio_file") (already exists)"
      ((skipped++))
      continue
    fi
    
    echo "Copying: $(basename "$audio_file") -> $MP3_DIR/$(basename "$audio_file")"
    
    # Copy the mp3 file
    if cp "$audio_file" "$mp3_file"; then
      ((copied++))
    else
      echo "Error: Failed to copy '$(basename "$audio_file")'"
      ((failed++))
    fi
    continue
  fi
  
  # Check if format is supported for conversion
  if [[ ! " ${SUPPORTED_FORMATS[*]} " =~ " ${extension} " ]]; then
    continue
  fi
  
  mp3_file="$MP3_DIR/$filename.mp3"
  
  # Skip if mp3 already exists
  if [ -f "$mp3_file" ]; then
    echo "Skipped: $filename.mp3 (already exists)"
    ((skipped++))
    continue
  fi
  
  echo "Converting: $(basename "$audio_file") -> $filename.mp3"
  
  # Convert with error handling
  if ffmpeg -i "$audio_file" -vn -ac 2 -ar 44100 -ab 256k -acodec libmp3lame -f mp3 "$mp3_file" 2>/dev/null; then
    ((converted++))
  else
    echo "Error: Failed to convert '$(basename "$audio_file")'"
    ((failed++))
  fi
done

echo ""
echo "Processing complete:"
echo "  Converted: $converted"
echo "  Copied: $copied"
echo "  Failed: $failed"
echo "  Skipped: $skipped"

