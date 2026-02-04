export function formatJapanDate(date: Date): string {
	const formatter = new Intl.DateTimeFormat("ja-JP", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		weekday: "short",
	})
	const parts = formatter.formatToParts(date)
	const partMap = new Map(parts.map((part) => [part.type, part.value]))
	const year = partMap.get("year") ?? ""
	const month = partMap.get("month") ?? ""
	const day = partMap.get("day") ?? ""
	const weekday = partMap.get("weekday") ?? ""
	return `${year}/${month}/${day}（${weekday}）`
}
