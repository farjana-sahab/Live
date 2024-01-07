export default function video_status(status){
    if(status === 1){
        return "Live not start yet"
    }
    if(status === 2){
        return "Video start processing..."
    }
    if(status === 3){
        return "Video upload complete"
    }
    if(status === 4){
        return "Video upload failed"
    }
    if(status === 5){
        return "Currently in live"
    }
}