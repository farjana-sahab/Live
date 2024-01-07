import { formatDistanceToNow } from 'date-fns';
import { utcToZonedTime, getTimezoneOffset } from 'date-fns-tz';
import { parseISO } from 'date-fns';


export default function calculate_time_ago(time, timezone = 'Asia/Kolkata'){
    const zonedTime = parseISO(time)

    const timeAgo = formatDistanceToNow(zonedTime, { addSuffix: true });
  
    return timeAgo;

}