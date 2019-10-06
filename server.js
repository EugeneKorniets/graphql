require('dotenv').config()

const { MongoClient } = require('mongodb')
const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')

const MONGO_DB = process.env.DB_HOST
const PORT = process.env.PORT

const typeDefs = readFileSync('./server-app/typeDefs.graphql', 'UTF-8')
const resolvers = require('./server-app/resolvers')

async function start () {
  const app = express()

  const client = await MongoClient.connect(MONGO_DB, {
    useNewUrlParser: true
  })

  console.log(`MongoDB connected`)

  const db = client.db()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization
      const currentUser = await db.collection('users').findOne({ githubToken })
      return { db, currentUser }
    }
  })

  server.applyMiddleware({
    app
  })

  app.get('/', (req, res) => res.end('Welcome to the Application'))
  app.get('/playground', expressPlayground({
    endpoint: '/graphql'
  }))

  app
    .listen({ port: PORT }, () => {
      console.log(`Client Service running on http://localhost:${PORT}`)
      console.log(`GraphQL Service running on http://localhost:${PORT}${server.graphqlPath}`)
      console.log(`Playground Service running on http://localhost:${PORT}/playground`)
    })
}

start()
  .then(() => {
    console.log(`Successful application running`)
  })
  .catch((err) => {
    console.log(`Failed application running`)
    console.dir(err)
  })
