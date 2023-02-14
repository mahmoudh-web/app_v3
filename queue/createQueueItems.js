import { DateTime } from "luxon"
import { downloadableInstruments } from "../instruments/instrumentData.js"
import { getLastCandles, getFirstCandle } from "./candles.js"
import { Queue } from "../mongo/schema.js"

const createQueueItems = async () => {
	// get instruments to download data for
	const instruments = await downloadableInstruments()
	if (!instruments.length) {
		console.log("No instruments returned")
		return
	}

	const startDate = DateTime.fromISO("2018-01-01T00:00:00.000").setZone("utc")
	const endDate = DateTime.now()
		.minus({ days: 1 })
		.endOf("day")
		.setZone("utc")

	for await (let instrument of instruments) {
		let oneStart = startDate
		let threeStart = startDate
		let fiveStart = startDate
		let fifteenStart = startDate
		let hourStart = startDate

		console.log(`Creating jobs for ${instrument.symbol}`)

		// get last candles
		const lastCandles = await getLastCandles(instrument.symbol)

		if (lastCandles.one) {
			oneStart = DateTime.fromMillis(lastCandles.one.startTime)
				.plus({ minutes: 1 })
				.setZone("utc")
		} else {
			oneStart = await getFirstCandle(
				instrument.symbol,
				"1m",
				startDate.ts,
				endDate.ts
			)
		}

		if (lastCandles.three) {
			threeStart = DateTime.fromMillis(lastCandles.three.startTime)
				.plus({ minutes: 3 })
				.setZone("utc")
		} else {
			threeStart = await getFirstCandle(
				instrument.symbol,
				"3m",
				startDate.ts,
				endDate.ts
			)
		}

		if (lastCandles.five) {
			fiveStart = DateTime.fromMillis(lastCandles.five.startTime)
				.plus({ minutes: 5 })
				.setZone("utc")
		} else {
			fiveStart = await getFirstCandle(
				instrument.symbol,
				"5m",
				startDate.ts,
				endDate.ts
			)
		}

		if (lastCandles.fifteen) {
			fifteenStart = DateTime.fromMillis(lastCandles.fifteen.startTime)
				.plus({ minutes: 15 })
				.setZone("utc")
		} else {
			fifteenStart = await getFirstCandle(
				instrument.symbol,
				"15m",
				startDate.ts,
				endDate.ts
			)
		}

		if (lastCandles.hour) {
			hourStart = DateTime.fromMillis(lastCandles.hour.startTime)
				.plus({ hours: 1 })
				.setZone("utc")
		} else {
			hourStart = await getFirstCandle(
				instrument.symbol,
				"1h",
				startDate.ts,
				endDate.ts
			)
		}

		await setJob(instrument.symbol, "1m", oneStart)
		await setJob(instrument.symbol, "3m", threeStart)
		await setJob(instrument.symbol, "5m", fiveStart)
		await setJob(instrument.symbol, "15m", fifteenStart)
		await setJob(instrument.symbol, "1h", hourStart)
	}
}

async function setJob(symbol, interval, start) {
	const end = setEndDate(start.ts)

	if (start < end) {
		const queueData = {
			symbol: symbol,
			timeframe: interval,
			start: start.ts,
			startISO: start.toISO(),
			end: end.ts,
			endISO: end.toISO(),
		}
		await Queue.create(queueData)
	}
	return true
}

function setEndDate(start) {
	const yesterday = DateTime.now()
		.minus({ days: 1 })
		.endOf("day")
		.setZone("utc")
	let end = DateTime.fromMillis(start)
		.plus({ days: 30 })
		.endOf("day")
		.setZone("utc")

	if (end > yesterday) end = yesterday

	return end
}

export { createQueueItems }
