import mongoose from "mongoose"

const connectDb = () => {
	console.log("connecting to db")
	// connect to db
	mongoose.set("strictQuery", true)
	mongoose.connect(process.env.DATABASE_URL)
}

const disconnectDb = () => {
	console.log(`disconnecting from db`)
	mongoose.disconnect()
}

export { connectDb, disconnectDb }
