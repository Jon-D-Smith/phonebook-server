const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()


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
    response.json(persons)
})

app.get('/info', (request,response) => {
    const now = new Date(8.64e15).toString()
    const people = persons.length
    response.send(`<p>Phonebook has info for ${people} people </p> <p>${now}</p>`)
})

app.post('/api/persons', (request, response) => {
    const person = request.body
    const id = generateID()
    person.id = id
    if(!person.name) {
        response.status(400).json({'error':'please enter a name'})
    }
    if(!person.number) {
        response.status(400).json({'error':'please enter a number'})
    }
    if(persons.find(p => p.name === person.name)) {
        console.log(person.name)
        response.status(400).json({'error':'Person already exists'})
    }

    response.json(person) 
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if(person) {
        response.json(person)
        
    }   else {
        response.status(404).end()
    }

})

app.delete('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)
    const people = persons.filter(person => person.id !== id)
    console.log(people)
    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {console.log(`App starting on port: ${PORT}`)})