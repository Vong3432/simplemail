import dayjs from "dayjs"
import tz from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import relativeTime from "dayjs/plugin/relativeTime"
import duration from "dayjs/plugin/duration"

dayjs.extend(tz)
dayjs.extend(utc)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export const findMilliseconds = (send_at: string, timezone: string): number => {

    console.log(`time ${send_at} ${timezone}`)

    const currentDate = dayjs.tz(dayjs(), timezone)
    const sendAtDate = dayjs(send_at).tz(timezone, true)

    if (sendAtDate.isValid() === false) {
        throw "[send_at] is invalid"
    }

    // calculation
    const duration = dayjs.duration(sendAtDate.diff(currentDate))
    const gapInDays = duration.asDays()

    if (gapInDays > 7) {
        throw "[send_at] is more than 7 days (has gap in days as: ${gapInDays}), please make sure you provide date that has less or equal than 7 days."
    } else if (gapInDays < 0) {
        throw "[send_at] is outdated."
    }

    console.log(duration.days())

    const calculatedMs = duration.asMilliseconds()

    console.log(`Current: ${currentDate.format("YYYY-MM-DD HH:mm:ss")}, requestDate: ${sendAtDate.format("YYYY-MM-DD HH:mm:ss")}, diff: ${duration.humanize(true)}, ms: ${calculatedMs}`)

    return calculatedMs
}