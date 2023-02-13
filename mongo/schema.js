import mongoose from "mongoose"

const logTypeSchema = new mongoose.Schema({
	name: String,
})

const logSchema = new mongoose.Schema({
	createdAt: { type: Date, required: true, immutable: true },
	readAt: Date,
	message: String,
	type: logTypeSchema,
	function: String,
})

const instrumentSchema = new mongoose.Schema({
	symbol: { type: String, unique: true },
	status: String,
	baseAsset: String,
	baseAssetPrecision: Number,
	quoteAsset: String,
	quotePrecision: Number,
	quoteAssetPrecision: Number,
	orderTypes: Array,
	icebergAllowed: Boolean,
	ocoAllowed: Boolean,
	quoteOrderQtyMarketAllowed: Boolean,
	allowTrailingStop: Boolean,
	cancelReplaceAllowed: Boolean,
	isSpotTradingAllowed: Boolean,
	isMarginTradingAllowed: Boolean,
	filters: Array,
	permissions: Array,
	defaultSelfTradePreventionMode: String,
	allowedSelfTradePreventionModes: Array,
	download: { type: Boolean, default: false },
})

const kline_1mSchema = new mongoose.Schema({
	startTime: { type: Number, required: true },
	closeTime: { type: Number, required: true },
	startTimeISO: { type: Date, required: true },
	closeTimeISO: { type: Date, required: true },
	open: { type: Number, required: true },
	high: { type: Number, required: true },
	low: { type: Number, required: true },
	close: { type: Number, required: true },
	volume: { type: Number, required: true },
	quoteAssetVolume: { type: Number, required: true },
	takerBuyBaseAssetVolume: { type: Number, required: true },
	takerBuyQuoteAssetVolume: { type: Number, required: true },
	identifier: { type: String, required: true, unique: true },
	symbol: { type: String, required: true },
})

const kline_3mSchema = new mongoose.Schema({
	startTime: { type: Number, required: true },
	closeTime: { type: Number, required: true },
	startTimeISO: { type: Date, required: true },
	closeTimeISO: { type: Date, required: true },
	open: { type: Number, required: true },
	high: { type: Number, required: true },
	low: { type: Number, required: true },
	close: { type: Number, required: true },
	volume: { type: Number, required: true },
	quoteAssetVolume: { type: Number, required: true },
	takerBuyBaseAssetVolume: { type: Number, required: true },
	takerBuyQuoteAssetVolume: { type: Number, required: true },
	identifier: { type: String, required: true, unique: true },
	symbol: { type: String, required: true },
})

const kline_5mSchema = new mongoose.Schema({
	startTime: { type: Number, required: true },
	closeTime: { type: Number, required: true },
	startTimeISO: { type: Date, required: true },
	closeTimeISO: { type: Date, required: true },
	open: { type: Number, required: true },
	high: { type: Number, required: true },
	low: { type: Number, required: true },
	close: { type: Number, required: true },
	volume: { type: Number, required: true },
	quoteAssetVolume: { type: Number, required: true },
	takerBuyBaseAssetVolume: { type: Number, required: true },
	takerBuyQuoteAssetVolume: { type: Number, required: true },
	identifier: { type: String, required: true, unique: true },
	symbol: { type: String, required: true },
})

const kline_15mSchema = new mongoose.Schema({
	startTime: { type: Number, required: true },
	closeTime: { type: Number, required: true },
	startTimeISO: { type: Date, required: true },
	closeTimeISO: { type: Date, required: true },
	open: { type: Number, required: true },
	high: { type: Number, required: true },
	low: { type: Number, required: true },
	close: { type: Number, required: true },
	volume: { type: Number, required: true },
	quoteAssetVolume: { type: Number, required: true },
	takerBuyBaseAssetVolume: { type: Number, required: true },
	takerBuyQuoteAssetVolume: { type: Number, required: true },
	identifier: { type: String, required: true, unique: true },
	symbol: { type: String, required: true },
})

const kline_1hSchema = new mongoose.Schema({
	startTime: { type: Number, required: true },
	closeTime: { type: Number, required: true },
	startTimeISO: { type: Date, required: true },
	closeTimeISO: { type: Date, required: true },
	open: { type: Number, required: true },
	high: { type: Number, required: true },
	low: { type: Number, required: true },
	close: { type: Number, required: true },
	volume: { type: Number, required: true },
	quoteAssetVolume: { type: Number, required: true },
	takerBuyBaseAssetVolume: { type: Number, required: true },
	takerBuyQuoteAssetVolume: { type: Number, required: true },
	identifier: { type: String, required: true, unique: true },
	symbol: { type: String, required: true },
})

const queueSchema = new mongoose.Schema({
	symbol: { type: String, required: true },
	timeframe: { type: String, required: true },
	start: { type: Number, required: true },
	end: { type: Number, required: true },
	endISO: { type: Date, required: true },
	startISO: { type: Date, required: true },
	active: { type: Boolean, default: false },
})

const LogType = mongoose.model("logType", logTypeSchema)
const Log = mongoose.model("log", logSchema)
const Instrument = mongoose.model("instrument", instrumentSchema)
const Queue = mongoose.model("download_queue", queueSchema)
const kline_1m = mongoose.model("kline_1m", kline_1mSchema)
const kline_3m = mongoose.model("kline_3m", kline_3mSchema)
const kline_5m = mongoose.model("kline_5m", kline_5mSchema)
const kline_15m = mongoose.model("kline_15m", kline_15mSchema)
const kline_1h = mongoose.model("kline_1h", kline_1hSchema)

export {
	LogType,
	Log,
	Instrument,
	Queue,
	kline_1m,
	kline_3m,
	kline_5m,
	kline_15m,
	kline_1h,
}

//   model TestQueue {
//     id        String       @id @default(auto()) @map("_id") @db.ObjectId
//     symbol    String
//     timeframe String
//     bot       String
//     settings  Json
//     active    Boolean   @default(false)
//   }
