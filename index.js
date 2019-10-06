const { ApolloServer } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

const typeDefs = require('./server-app/typeDefs')

let _id = 0
let photos = [
  {
    id: 1,
    name: 'Image 1 from 1 user',
    description: 'This 1s photo',
    category: 'SELFIE',
    githubUser: 1,
    created: '07-11-2018'
  },
  {
    id: 2,
    name: 'Image 2 from 1 user',
    description: 'This 1s photo',
    category: 'PORTRAIT',
    githubUser: 1,
    created: '12-15-2018'
  },
  {
    id: 3,
    name: 'Image 3 from 2 user',
    description: 'This 2s photo',
    category: 'ACTION',
    githubUser: 2,
    created: '07-11-2019'
  }
]
let users = [
  {
    githubLogin: 1,
    name: 'Piter Parker'
  },
  {
    githubLogin: 2,
    name: 'John Snow'
  }
]
let tags = [
  {
    photoID: 1,
    userID: 1
  },
  {
    photoID: 2,
    userID: 1
  },
  {
    photoID: 2,
    userID: 2
  },
  {
    photoID: 3,
    userID: 1
  }
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,

    allPhotos: () => photos,

    totalUsers: () => users.length,

    allUsers: () => users
  },

  Mutation: {
    postPhoto(parent, args) {
      let newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date()
      }
      photos.push(newPhoto)
      return newPhoto
    }
  },

  Photo: {
    url: parent => `https://avatars.mds.yandex.net/get-pdb/1378219/d4a355b0-9212-4181-b804-52f2e687cde5/s1200`,

    postedBy: parent => users.find(user => user.githubLogin === parent.githubUser),

    taggedUsers: parent => tags
        // возвращаем массив тегов для текущего пользователя
        .filter(tag => tag.photoID === parent.id)
        // возвращаем массив userID
        .map(tag => tag.userID)
        // возвращаем массив объектов User
        .map(userID => users.find(user => user.githubLogin === userID))
  },

  User: {
    postedPhotos: parent => photos.filter(photo => photo.githubUser === parent.githubLogin),

    inPhotos: parent => tags
        // возвращаем массив тегов для текущего юзера
        .filter(tag => tag.userID === parent.id)
        // возвращаем массив photoID
        .map(tag => tag.photoID)
        // возвращаем массив объектов Photo
        .map(photoID => photos.find(photo => photo.id === photoID))
  },

  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server
  .listen()
  .then(({ url }) => console.log(`GraphQL service running on ${url}`))
