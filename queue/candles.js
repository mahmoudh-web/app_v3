import axios from "axios"
import { DateTime } from "luxon"
import {
	kline_1m,
	kline_3m,
	kline_5m,
	kline_15m,
	kline_1h,
} from "../mongo/schema.js"

const getLastCandles = async instrument => {
	const one = await kline_1m
		.findOne({ identifier: { $regex: `^${instrument}` } })
		.sort({ identifier: -1 })
		.select("start")
	const three = await kline_3m
		.findOne({ identifier: { $regex: `^${instrument}` } })
		.sort({ identifier: -1 })
		.select("start")

	const five = await kline_5m
		.findOne({ identifier: { $regex: `^${instrument}` } })
		.sort({ identifier: -1 })
		.select("start")

	const fifteen = await kline_15m
		.findOne({ identifier: { $regex: `^${instrument}` } })
		.sort({ identifier: -1 })
		.select("start")

	const hour = await kline_1h
		.findOne({ identifier: { $regex: `^${instrument}` } })
		.sort({ identifier: -1 })
		.select("start")

	return { one, three, five, fifteen, hour }
}

const getFirstCandle = async (symbol, interval, start, end) => {
	const query = `${process.env.DATA_BASE_URL}${process.env.KLINE}?symbol=${symbol}&interval=${interval}&startTime=${start}&endTime=${end}&limit=1`
	const firstCandleQuery = await axios(query)
		.then(res => res.data[0])
		.catch(err => console.log(err))

	return DateTime.fromMillis(firstCandleQuery[0])
		.startOf("day")
		.setZone("utc")
}

export { getLastCandles, getFirstCandle }
