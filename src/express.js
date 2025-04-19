import express from 'express'
import logger from 'morgan'

const app = express()

app.use(logger('dev'))
app.use(express.static('public')) // Serve static files from the public directory
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!\n')
  })
  
export default (port = process.env.PORT || 3000) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}. NODE_ENV is set to ${process.env.NODE_ENV}`)
  })
}