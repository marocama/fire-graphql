const express = require('express')
const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { ApolloServer, gql } = require('apollo-server-express')

!admin.apps.length ? admin.initializeApp() : admin.app()

const app = express()
const db = admin.firestore()


const typeDefs = gql`
  type User {
    name: String
    email: String
  }

  type Query {
    users : [User]
  }
`

const resolvers = {
  Query: {
    users: () => {
      return new Promise((resolve, reject) => {
        fetchAllUsers(data => resolve(data))
      })
    }
  }
}

const fetchAllUsers = callback => {
  db.collection('Users').get()
  .then(result => callback(result.docs.map(i => ({ ...i.data() }))) )
  .catch(e => console.log(e))
}

const server = new ApolloServer({ typeDefs, resolvers, introspection: true })

server.start().then(res => {
  server.applyMiddleware({ app, path: '/' })
})

exports.graphql = functions.region('southamerica-east1').https.onRequest(app)