const fetch = require('node-fetch')

const { authorizeWithGitHub } = require('./utils')
const { ObjectID } = require('mongodb')

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const { GraphQLScalarType } = require('graphql')

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

    async createTag(parent, { userID, photoID }, { db }) {
      // TODO обработать кейс с отсутсвием фотки или юзера

      let newTag = {
        userID,
        photoID
      }

      await db.collection('tags').replaceOne(newTag, newTag, { upsert: true })

      return await db.collection('photos').findOne({_id: ObjectID(photoID)})
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

    taggedUsers: async (parent, args, { db }) => {
      const tags = await db.collection('tags').find().toArray()

      const userIDs = tags
        // возвращаем массив тегов для текущей фотографии
        .filter(tag => tag.photoID === parent._id.toString())
        // возвращаем массив userID
        .map(tag => tag.userID)

        return db.collection('users')
          .find({ githubLogin: { $in: userIDs }})
          .toArray()
    }
  },

  User: {
    postedPhotos: (parent, args, { db }) => db.collection('photos').find({ userID: parent.githubLogin }).toArray(),

    inPhotos: async (parent, args, { db }) => {
      const tags = await db.collection('tags').find().toArray()

      const photoIDs = tags
        // возвращаем массив тегов для текущего юзера
        .filter(tag => tag.userID === parent.githubLogin)
        // возвращаем массив photoID
        .map(tag => ObjectID(tag.photoID))

      return db.collection('photos')
        .find({ _id: { $in: photoIDs }})
        .toArray()
    }
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
