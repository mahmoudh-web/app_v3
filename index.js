import * as dotenv from "dotenv"
dotenv.config()

import { DateTime } from "luxon"
import { getMarketData, setMarketData } from "./instruments/instrumentData.js"
import { connectDb, disconnectDb } from "./mongo/connection.js"
import { Queue } from "./mongo/schema.js"
import { createQueueItems } from "./queue/createQueueItems.js"
import { processJob } from "./processQueue/processQueue.js"

// set global variables
const helper = process.env.HELPER
const initialise = process.env.INITIALISE

// makes sure only one process is running
let processing = false

global.listSize = 1000 // no. of candles returned by api
global.timeframes = [
	{
		interval: "1m",
		minutes: "1",
		candles: 1440,
		candleMillis: 60000,
		resultMillis: 60000 * listSize,
	},
	{
		interval: "3m",
		minutes: "3",
		candles: 480,
		candleMillis: 180000,
		resultMillis: 180000 * listSize,
	},
	{
		interval: "5m",
		minutes: "5",
		candles: 288,
		candleMillis: 300000,
		resultMillis: 300000 * listSize,
	},
	{
		interval: "15m",
		minutes: "15",
		candles: 96,
		candleMillis: 900000,
		resultMillis: 900000 * listSize,
	},
	{
		interval: "1h",
		minutes: "60",
		candles: 24,
		candleMillis: 3600000,
		resultMillis: 3600000 * listSize,
	},
]

const weekDay = DateTime.now().weekday
const hour = DateTime.now().hour

// update instrument data
const marketData = async () => {
	if (processing) return

	processing = true
	console.log(`Updating instrument data`)
	if ((weekDay === 1 && hour === 0) || initialise === "true") {
		// get data from api
		const data = await getMarketData()

		if (data.length) {
			await setMarketData(data)
		}
	} else {
		console.log("market data is checked on mondays during midnight hour")
	}
	processing = false
}

// check queue
const checkQueue = async () => {
	if (processing) return

	processing = true
	console.log(`checking queue`)
	if (weekDay === 1 || initialise === "true") {
		await connectDb()
		// get queue count
		const queueCount = await Queue.countDocuments()

		// exit if queue items exist
		if (queueCount > 0) {
			console.log("items already in queue")
		} else {
			// create queue
			console.log("queue is empty, proceeding to create queue")
			await createQueueItems()
		}
	} else {
		console.log(`Update of historical data is carried out on mondays`)
	}

	processing = false
}

// process queue
const processQueue = async () => {
	if (processing) return

	processing = true
	console.log("processing queue")

	await connectDb()
	const job = await Queue.findOne({ active: false })

	if (!job) {
		console.log("Queue is empty")
		processing = false
		return
	}

	// set job as active
	await Queue.findByIdAndUpdate(job._id, { active: true })

	console.log(
		`Processing job for ${job.symbol} - ${job.timeframe} from ${job.startISO} to ${job.endISO}`
	)
	await processJob(job)

	//delete job
	await Queue.findByIdAndDelete(job._id)
	processing = false
}

// start processes

// if (helper === "false") {
// 	await marketData()
// 	setInterval(marketData, 3600000)
// }

if (helper === "false") {
	await checkQueue()
	setInterval(checkQueue, initialise ? 60000 : 3600000)
}

// await processQueue()
// setInterval(processQueue, 5000)

// disconnectDb()
