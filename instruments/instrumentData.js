import axios from "axios"
import { connectDb, disconnectDb } from "../mongo/connection.js"
import { Instrument } from "../mongo/schema.js"

const getMarketData = async () => {
	const url = `${process.env.DATA_BASE_URL}${process.env.EXCHANGE_INFO}`

	const data = await axios(url)
		.then(res => res.data.symbols)
		.catch(err => [])

	return data
}

const setMarketData = async data => {
	let count = 0

	await connectDb()

	for await (let instrument of data) {
		count++
		const instrumentData = {
			symbol: instrument.symbol,
			status: instrument.status,
			baseAsset: instrument.baseAsset,
			baseAssetPrecision: instrument.baseAssetPrecision,
			quoteAsset: instrument.quoteAsset,
			quotePrecision: instrument.quotePrecision,
			quoteAssetPrecision: instrument.quoteAssetPrecision,
			orderTypes: instrument.orderTypes,
			icebergAllowed: instrument.icebergAllowed,
			ocoAllowed: instrument.ocoAllowed,
			quoteOrderQtyMarketAllowed: instrument.quoteOrderQtyMarketAllowed,
			allowTrailingStop: instrument.allowTrailingStop,
			cancelReplaceAllowed: instrument.cancelReplaceAllowed,
			isSpotTradingAllowed: instrument.isSpotTradingAllowed,
			isMarginTradingAllowed: instrument.isMarginTradingAllowed,
			filters: instrument.filters,
			permissions: instrument.permissions,
			defaultSelfTradePreventionMode:
				instrument.defaultSelfTradePreventionMode,
			allowedSelfTradePreventionModes:
				instrument.allowedSelfTradePreventionModes,
			download:
				instrument.quoteAsset === "USDT" &&
				instrument.isSpotTradingAllowed &&
				instrument.status === "TRADING"
					? true
					: false,
		}

		await Instrument.updateOne(
			{ symbol: instrumentData.symbol },
			{ $set: instrumentData },
			{ upsert: true, new: true }
		)
	}
}

const downloadableInstruments = async () => {
	await connectDb()

	const instruments = await Instrument.find({
		download: true,
		status: "TRADING",
	}).sort({ symbol: 1 })

	if (!instruments.length) return []
	return instruments
}

export { getMarketData, setMarketData, downloadableInstruments }
