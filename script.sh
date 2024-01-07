#!/bin/bash

start_time=$(date +%s)

# curl 'https://api.twilio.com/2010-04-01/Accounts/AC0a279586456e986fc4e3179a496f3781/Messages.json' -X POST \
#     --data-urlencode 'To=whatsapp:+8801777101213' \
#     --data-urlencode 'From=whatsapp:+14155238886' \
#     --data-urlencode "Body=script start running" \
#     -u AC0a279586456e986fc4e3179a496f3781:c205f1fb4ec56679770adea0ccd21dab

LOCK_FILE="/tmp/script/script.lock"


while [ -e "$LOCK_FILE" ]; do
    echo "Another instance of the script is already running. Waiting for it to finish..."
    sleep 5
done

touch "$LOCK_FILE"


SOURCE_DIR="/tmp/rec/"
MP4_DIR="/tmp/after_rec/mp4"
# UPLOAD_DIR="/tmp/upload_folder"


mkdir -p "$MP4_DIR"
# mkdir -p "$UPLOAD_DIR"


# MINIO_ENDPOINT="http://103.177.125.74:9000"  # Replace with your MinIO server's endpoint
# ACCESS_KEY="G9NVBB1oJzo3Hv13"
# SECRET_KEY="edVObN0xklFsIFPYNdUbw3XtOQsZlOnO"
# BUCKET_NAME="videos"

AZURE_STORAGE_ACCOUNT='ctallstorage'
AZURE_STORAGE_ACCESS_KEY='6G6P/YPwFD7x9xSLj5agJ3yT2zRLBFmhOfeWxH7WoD2Mh3Dia4CmrEYD7+zwJTJHkFPrVpu439kc+ASt4KRcAQ=='

echo "Checking for files in ${SOURCE_DIR}"
LAST_FILE=$(ls -t "${SOURCE_DIR}" | head -n 1)
echo "LAST_FILE: ${LAST_FILE}"

liveKey=$(echo $LAST_FILE | sed 's/-[^-]*\.flv$//')

LIVE_VIDEO_UPDATE_ENDPOINT="http://192.168.64.1:8000/update_live/${liveKey}"

DATA='{
  "video_status": 2,
  "meta_data": {}
}'

curl -X 'PATCH' \
  "$LIVE_VIDEO_UPDATE_ENDPOINT" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "$DATA"


generate_mp4() {
    SOURCE_DIR=$1
    LAST_FILE=$2
    MP4_DIR=$3
    FILENAME=$4


    log_event() {
        log_file=$5
        if [ $? -eq 0 ]; then
            echo "$(date +%F_%T): Segments generated successfully for $FILENAME" >> /tmp/script/script_output.log
        else
            echo "$(date +%F_%T): Error during segment generation for $FILENAME" >> /tmp/script/script_output.log
        fi
    }

    # ffmpeg -i "${SOURCE_DIR}${LAST_FILE}" -c:v libx264 -c:a aac -strict experimental "${MP4_DIR}/${FILENAME}.mp4"

    # Generate 720p_mp4 video
    ffmpeg -i "${SOURCE_DIR}${LAST_FILE}" -vf "scale=1280:720" -c:a copy -movflags faststart "${MP4_DIR}/${FILENAME}_720p.mp4"
    log_event "${MP4_DIR}/${FILENAME}_720p.log"


    # cp "${MP4_DIR}/${FILENAME}_720p.mp4" /tmp/upload_folder

    # Generate 480p_mp4 video
    ffmpeg -i "${SOURCE_DIR}${LAST_FILE}" -vf "scale=854:480" -c:a copy -movflags faststart "${MP4_DIR}/${FILENAME}_480p.mp4"
    log_event "${MP4_DIR}/${FILENAME}_480p.log"

    # cp "${MP4_DIR}/${FILENAME}_480p.mp4" /tmp/upload_folder

    # Generate 240p_mp4 video
    ffmpeg -i "${SOURCE_DIR}${LAST_FILE}" -vf "scale=426:240" -c:a copy -movflags faststart "${MP4_DIR}/${FILENAME}_240p.mp4"
    log_event "${MP4_DIR}/${FILENAME}_240p.log"

    # cp "${MP4_DIR}/${FILENAME}_240p.mp4" /tmp/upload_folder

}


# mkdir -p 720p 480p 240p

mkdir -p 480p


generate_ts_files() {
    bitrate=$1
    folder=$2
    MP4_DIR=$3
    FILENAME=$4
    FOLDERNAME=$5

    # Calculate an even height to ensure dimensions are divisible by 2
    height=$((bitrate * 9 / 16 / 2 * 2))


    echo "$(date +%F_%T):- Generating segments for $folder" >> /tmp/script/script_output.log


    ffmpeg -i "${MP4_DIR}/${FILENAME}.mp4" -vf "scale=$bitrate:$height" -c:v h264 -b:v 800k -c:a aac -hls_time 10 -hls_list_size 0 -hls_segment_filename "$folder/%03d.ts" "$folder/$FOLDERNAME.m3u8"

    if [ $? -eq 0 ]; then
        echo "$(date +%F_%T):- Segments generated successfully for $folder" >> /tmp/script/script_output.log
    else
        echo "$(date +%F_%T):- Error during segment generation for $folder" >> /tmp/script/script_output.log
    fi
}

if [ -n "$LAST_FILE" ]; then
    echo "$(date +%F_%T):- Last created file: $LAST_FILE" >> /tmp/script/script_output.log

    FILENAME=$(basename "$LAST_FILE" .flv)
    UPLOAD_FOLDER_NAME=$(basename "$LAST_FILE" .flv)
    mkdir -p "/tmp/$UPLOAD_FOLDER_NAME"
    UPLOAD_FOLDER_LOCATION="/tmp/$UPLOAD_FOLDER_NAME"

    # ffmpeg -i "${SOURCE_DIR}${LAST_FILE}" -c:v libx264 -c:a aac -strict experimental "${MP4_DIR}/${FILENAME}.mp4"

    generate_mp4 $SOURCE_DIR $LAST_FILE $MP4_DIR $FILENAME 

    cp "${MP4_DIR}/${FILENAME}_720p.mp4" /tmp/$UPLOAD_FOLDER_NAME
    cp "${MP4_DIR}/${FILENAME}_480p.mp4" /tmp/$UPLOAD_FOLDER_NAME
    cp "${MP4_DIR}/${FILENAME}_240p.mp4" /tmp/$UPLOAD_FOLDER_NAME
    # generate_ts_files 1280 720p "$MP4_DIR" "$FILENAME"
    generate_ts_files 854 480p "/tmp/$UPLOAD_FOLDER_NAME" ${FILENAME}_480p $UPLOAD_FOLDER_NAME

    mkdir -p "$UPLOAD_FOLDER_LOCATION/hls"

    mv "$folder"/* "$UPLOAD_FOLDER_LOCATION/hls"

    rm -r 480p
    rm -r /tmp/after_rec
    rm -r /tmp/hls

    az storage blob upload-batch --destination "videos/${UPLOAD_FOLDER_NAME}" --type block --source /tmp/${UPLOAD_FOLDER_NAME} --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY

    # upload in azure

    if [ $? -eq 0 ]; then
        hls_folder="${UPLOAD_FOLDER_NAME}/hls"

        hls_m3u8="${UPLOAD_FOLDER_NAME}/hls/${UPLOAD_FOLDER_NAME}.m3u8"

        DATA='{
            "video_status": 3,
            "meta_data": {
                "720p": "'$UPLOAD_FOLDER_NAME'/'$UPLOAD_FOLDER_NAME'.mp4",
                "480p": "'$UPLOAD_FOLDER_NAME'/'$UPLOAD_FOLDER_NAME'_480p.mp4",
                "240p": "'$UPLOAD_FOLDER_NAME'/'$UPLOAD_FOLDER_NAME'_240p.mp4",
                "hls": "'$hls_folder'",
                "hls_m3u8": "'$hls_m3u8'"

            }
        }'
        curl -X 'PATCH' \
        "$LIVE_VIDEO_UPDATE_ENDPOINT" \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "$DATA"
        echo "Copy to Azure succeeded "
    else
        DATA='{
        "video_status": 4,
        "meta_data": {}
        }'

        curl -X 'PATCH' \
        "$LIVE_VIDEO_UPDATE_ENDPOINT" \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "$DATA"

        echo "Copy to Azure failed "
    fi

    rm -r /tmp/$UPLOAD_FOLDER_NAME


else
    echo "$(date +%F_%T):- No files found in ${SOURCE_DIR}." >> /tmp/script/script_output.log
fi

rm "$LOCK_FILE"

# end_time=$(date +%s)
# elapsed_time=$((end_time - start_time))
# hours=$((elapsed_time / 3600))
# minutes=$((elapsed_time % 3600 / 60))
# seconds=$((elapsed_time % 60))

# message="successfully uploaded, time taken: $hours hr, $minutes min, $seconds sec"

# curl 'https://api.twilio.com/2010-04-01/Accounts/AC0a279586456e986fc4e3179a496f3781/Messages.json' -X POST \
#     --data-urlencode 'To=whatsapp:+8801777101213' \
#     --data-urlencode 'From=whatsapp:+14155238886' \
#     --data-urlencode "Body=$message" \
#     -u AC0a279586456e986fc4e3179a496f3781:c205f1fb4ec56679770adea0ccd21dab 