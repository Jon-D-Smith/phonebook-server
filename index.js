require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()

const mongoose = require('mongoose')
const Person = require('./models/person')


app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req, res) => { return JSON.stringify(req.body) })

app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`))

const requestLogger = (request, response, next) => {
console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

const persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateID = () => {
    return Math.floor(Math.random() * 100000000)
}


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => response.json(persons))
})

app.get('/info', async (request,response) => {
    const now = new Date(8.64e15).toString()
    const people = await Person.find({}).then(p => {
      return p.length
    })
    response.send(`<p>Phonebook has info for ${people} people </p> <p>${now}</p>`)
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(newPerson => response.json(newPerson))
    
})

app.get('/api/persons/:id', (request, response, next) => {
      Person.findById(request.params.id)
            .then(person => response.json(person))
            .catch(error => next(error))

})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const updatedPerson = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, updatedPerson, {new:true})
        .then(result => {
          response.json(result)
        })
        .catch(error => next(error))
})


app.delete('/api/persons/:id', (request,response, next) => {
    Person.findByIdAndDelete(request.params.id) 
          .then(response.status(204).end())
          .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({error:'Malformed ID'})
  }
  next(error)

}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {console.log(`App starting on port: ${PORT}`)})