const express = require('express')
const {connection,PORT} = require('./Config/db')
const cors = require('cors')
const userController = require('./Controllers/usercontroller')
const productController = require('./Controllers/productcontroller')

const app = express()

app.use(express.json())
app.use(cors())


app.get('/',(req,res)=>{
    res.send({msg:'Running'})
})


app.use('/api', userController)
app.use('/api', productController)


app.listen(PORT, async () =>{
    try {
        await connection
        console.log('Connected to database')
    } catch (error) {
        console.log(error)
    }

    console.log(`Listening on PORT: ${PORT}`)
}
)