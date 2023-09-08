import { createRouter, createWebHistory } from 'vue-router'

const Home = () => {
    let a = import(/* webpackChunkName: 'home' */'../view/Home');
    console.log(a)
    a.then(res => {
        console.log('res===>',res)
    })
    return a
}
const About = () => import(/* webpackChunkName: 'about' */'../view/About')

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/about',
            component: About
        },
        {
            path: '/home',
            component: Home
        }
    ]
})