<template>
    <header class="header-pc">
        <div class="nav-container clearfix">
            <!-- logo -->
            <a class="logo" href="/">
                <img  src="" alt="logo">
            </a>
            <!-- 导航条 -->
            <ul>
                <li v-for="(item, key) in navs" :key="key">
                    <a :href="item.href">{{ item.title }}</a>

                </li>
            </ul>
        </div>
    </header>
</template>

<script>
export default {
    name: 'WwHeader',
    data () {
        return {
            navs: [
                {
                    title: '11111111',
                    href: '/robot'
                },
                {
                    title: '2222222'
                },
                {
                    title: '3333333'
                },{
                    title: '44444444'
                },
            ]
        }
    }
}
</script>

<style>
    .nav-container {
        width: 1520px;
        height: 130px;
        margin: 0 auto;
        border: 1px solid red;
    }

    .logo {
       float: left; 
       margin-right: 430px; 
    }

    ul {
        float: right;
        display: flex;
        justify-content: space-between;
    }

    li {
         float: left; 
         margin-right: 40px;
    }

    .clearfix {
        overflow: hidden;
        zoom: 1;
    }
</style>