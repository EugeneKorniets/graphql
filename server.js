const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')

const typeDefs = readFileSync('./server-app/typeDefs.grapql', 'UTF-8')
const resolvers = require('./server-app/resolvers')

let app = express()

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.applyMiddleware({
  app
})

app.get('/', (req, res) => res.end('Welcome to the Application'))
app.get('/playground', expressPlayground({
  endpoint: '/graphql'
}))

app
  .listen({ port: 4000}, () => {
    console.log(`Client Service running on http://localhost:4000`)
    console.log(`GraphQL Service running on http://localhost:4000${server.graphqlPath}`)
    console.log(`Playground Service running on http://localhost:4000/playground`)
  })
