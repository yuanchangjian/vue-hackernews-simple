export default {
    SET_PATH: ({ commit }, path) => {
        commit('SET_PATH', path)
        return Promise.resolve()
    }
}
