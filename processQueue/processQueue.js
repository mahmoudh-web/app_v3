import { DateTime } from "luxon"
import axios from "axios"
import { chunk } from "lodash-es"
import {
	kline_1m,
	kline_3m,
	kline_5m,
	kline_15m,
	kline_1h,
} from "../mongo/schema.js"

const processJob = async job => {
	const settings = timeframes.filter(t => t.interval === job.timeframe)
	const updateInterval = settings[0].resultMillis

	// set parameters for whole session
	const sessionStart = DateTime.fromMillis(job.start).setZone("utc")
	const sessionEnd = DateTime.fromMillis(job.end).setZone("utc")

	// set start and end for first request
	let requestStart = sessionStart
	let requestEnd = sessionStart.plus({ milliseconds: updateInterval - 1 })

	// // create array of url's to query
	const requests = []
	do {
		if (requestEnd > sessionEnd) {
			requestEnd = sessionEnd
		}

		const query = `${process.env.DATA_BASE_URL}${process.env.KLINE}?symbol=${job.symbol}&interval=${job.timeframe}&startTime=${requestStart.ts}&endTime=${requestEnd.ts}&limit=${listSize}`
		requests.push(query)
		requestStart = requestStart.plus({ milliseconds: updateInterval })
		requestEnd = requestEnd.plus({ milliseconds: updateInterval - 1 })
	} while (requestStart < sessionEnd)

	const results = []
	let count = 1
	for await (let request of requests) {
		// get candle data
		const data = await axios(request)
			.then(res => res.data)
			.catch(err => {
				return []
			})

		// format candle data
		const formatted = formatCandles(data, job.symbol)
		formatted.forEach(candle => results.push(candle))

		console.log(
			`${job.symbol} - ${job.timeframe}: request ${count} of ${requests.length} - received ${data.length} candles, total ${results.length} candles`
		)
		count += 1
	}

	if (results.length) {
		await saveCandles(results, job.timeframe, job.symbol)
		console.log(`finished writing ${job.symbol} - ${job.timeframe}m`)
	}
}

function formatCandles(candles, symbol) {
	const candleData = []

	candles.forEach(candle => {
		const kline = {
			startTime: candle[0],
			closeTime: candle[6],
			startTimeISO: DateTime.fromMillis(Number(candle[0])),
			closeTimeISO: DateTime.fromMillis(Number(candle[6])),
			open: candle[1],
			high: candle[2],
			low: candle[3],
			close: candle[4],
			volume: candle[5],
			quoteAssetVolume: candle[7],
			takerBuyBaseAssetVolume: candle[9],
			takerBuyQuoteAssetVolume: candle[10],
			identifier: `${symbol}_${candle[0]}`,
			symbol: symbol,
		}

		candleData.push(kline)
	})

	return candleData
}

async function saveCandles(candles, timeframe, symbol) {
	console.log(`${symbol} - ${timeframe}: ${candles.length} candles`)
	const chunked = chunk(candles, 5000)

	let x = 1
	for await (let chunk of chunked) {
		console.log(
			`${symbol} - ${timeframe}: writing chunk ${x} of ${chunked.length}`
		)
		switch (timeframe) {
			case "1m":
				await kline_1m
					.insertMany(chunk, { ordered: false })
					.catch(err => console.log(err))
				break
			case "3m":
				await kline_3m
					.insertMany(chunk, { ordered: false })
					.catch(err => console.log(err))
				break
			case "5m":
				await kline_5m
					.insertMany(chunk, { ordered: false })
					.catch(err => console.log(err))
				break
			case "15m":
				await kline_15m
					.insertMany(chunk, { ordered: false })
					.catch(err => console.log(err))
				break
			case "1h":
				await kline_1h
					.insertMany(chunk, { ordered: false })
					.catch(err => console.log(err))
				break
		}
		x += 1
	}
}

export { processJob }
