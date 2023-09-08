module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ['plugin:vue/vue3-essential', 'eslint:recommended'],
    parserOptions: {
        babelOptions: {
            presets: '@babel/eslint-parser'
        }
    }
}