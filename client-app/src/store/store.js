import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const url = 'http://localhost:4000/graphql'

export default new Vuex.Store({
  state: {
    totalPhotos: 0,

    totalUsers: 0
  },

  getters: {
    getTotalPhotos: state => state.totalPhotos,

    getTotalUsers: state => state.totalUsers
  },

  mutations: {
    setTotalPhotos (state, { totalPhotos }) {
      state.totalPhotos = totalPhotos
    },

    setTotalUsers (state, { totalUsers }) {
      state.totalUsers = totalUsers
    }
  },

  actions: {
    loadTotalPhotos ({ commit }) {
      let query = '{totalPhotos, totalUsers}'
      let opts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      }

      return fetch(url, opts)
        .then(res => res.json())
        .then(({ data }) => {
          commit('setTotalPhotos', data)
          commit('setTotalUsers', data)
          return data
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }
})
