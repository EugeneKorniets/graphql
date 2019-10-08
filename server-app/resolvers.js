const fetch = require('node-fetch')

const { authorizeWithGitHub } = require('./utils')

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const { GraphQLScalarType } = require('graphql')

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
    me: (parent, args, { currentUser }) => currentUser,

    totalPhotos: (parent, args, { db }) => db.collection('photos').estimatedDocumentCount(),

    allPhotos: (parent, args, { db }) => db.collection('photos').find().toArray(),

    totalUsers: (parent, args, { db }) => db.collection('users').estimatedDocumentCount(),

    allUsers: (parent, args, { db }) => db.collection('users').find().toArray()
  },

  Mutation: {
    async postPhoto(parent, args, { db, currentUser }) {
      if (!currentUser) {
        throw new Error('Only an authorized user can post a photo')
      }

      const newPhoto = {
        ...args.input,
        userID: currentUser.githubLogin,
        created: new Date()
      }

      const { insertedIds } = await db.collection('photos').insert(newPhoto)
      newPhoto.id = insertedIds[0]

      return newPhoto
    },

    async githubAuth (parent, { code }, { db }) {
      let {
        message,
        access_token,
        avatar_url,
        login,
        name
      } = await authorizeWithGitHub({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      })

      if (message) {
        throw new Error(message)
      }

      let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url
      }

      const { ops:[user] } = await db
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

      return { user, token: access_token }
    },

    addFakeUsers: async (root, { count }, { db }) => {
      let randomUserApi = `https://randomuser.me/api/?results=${count}`
      let { results } = await fetch(randomUserApi)
        .then(res => res.json())

      let users = results.map(res => ({
        githubLogin: res.login.username,
        name: `${res.name.first} ${res.name.last}`,
        avatar: res.picture.thumbnail,
        githubToken: res.login.sha1
      }))

      await db.collection('users').insert(users)

      return users
    },

    async fakeUserAuth (parent, { githubLogin }, { db }) {
      let user = await db.collection('users').findOne({ githubLogin })

      if (!user) {
        throw new Error(`Cannot find user with GithubLogin ${githubLogin}`)
      }

      return {
        token: user.githubToken,
        user
      }
    }
  },

  Photo: {
    id: parent => parent.id || parent._id,

    url: parent => `/img/photos/${parent._id}.jpg`,

    postedBy: (parent, args, { db }) => db.collection('users').findOne({ githubLogin: parent.userID }),

    taggedUsers: parent => tags
      // возвращаем массив тегов для текущего пользователя
      .filter(tag => tag.photoID === parent.id)
      // возвращаем массив userID
      .map(tag => tag.userID)
      // возвращаем массив объектов User
      .map(userID => db.collection('users').find({ githubLogin: userID }))
  },

  User: {
    postedPhotos: (parent, args, { db }) => db.collection('photos').find({ userID: parent.githubLogin }).toArray(),

    inPhotos: (parent, args, { db }) => tags
      // возвращаем массив тегов для текущего юзера
      .filter(tag => tag.userID === parent.id)
      // возвращаем массив photoID
      .map(tag => tag.photoID)
      // возвращаем массив объектов Photo
      .map(photoID => db.collection('photos').find({ _id: photoID }).toArray())
  },

  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
}

module.exports = resolvers
