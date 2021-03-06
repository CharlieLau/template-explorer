import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import serve from 'rollup-plugin-serve'


export default [
    {
        input: 'src/string/index.js',
        output: {
            file: './lib/esm/stringbase.js',
            format: 'esm',
            name: 'tExporer',
            sourcemap: true,
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: "node_modules/**"
            }),
            process.env.SERVE ? serve({
                open: true,
                contentBase: '',
                openPage: '/public/index.html',
                host: '127.0.0.1',
                port: '9999'
            }) : null
        ]
    },
    {
        input: 'src/dom/index.js',
        output: {
            file: './lib/esm/dombase.js',
            format: 'esm',
            name: 'tExporer',
            sourcemap: true,
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: "node_modules/**"
            })
        ]
    }
]