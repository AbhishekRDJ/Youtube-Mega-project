import mongoose from 'mongoose'
import { DB_Name } from '../constants.js'


const connectDB = async () => {
    try {

        const connectionString = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
        console.log(`mongoDB connected at :${connectionString.connection.host}`);

    } catch (error) {
        console.log('Fail to connect monogDB: ' + error);


    }

}
export default connectDB;