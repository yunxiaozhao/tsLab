import { curry } from "ramda";

type GenF<T> = () => Generator<T>
type Gen1<T> = (x:number) => Generator<T>
var c:number = NaN 
var b:number = NaN
var a:number = NaN


/**
 * 当两次的计算结果差距小于eps停止
 */
const within = curry((eps: number,gen: GenF<number>) => {
    const i = gen()
    var result: number[] = []
    result.push(i.next().value)
    result.push(i.next().value)
    var index = 1;
    while (result[index]-result[index-1] > eps||result[index-1]-result[index] > eps) {
        const v = i.next()
        result.push(v.value)
        index++
    }
    return result
})

/**
 * 
 * @param f 接收一个三元的函数作为执行map
 * curry中：
 * gen作为生成器
 * f1为求微分的函数
 * x为求微分的值
 * h0为最初分割的大小
 */
const map = (f: (_f:(x: number) => number, x: number, h: number) => number)=>(gen: Gen1<number>)=>(_f:(x: number) => number)=>(x:number)=>(h0:number) => {
    return (function* () {
        const i = gen(h0)
        while (true) {
            const h = i.next().value
            c=b
            b=a
            a = f(_f,x,h)
            yield(a)
        }
    })

}

//折半迭代器
function* halve(x:number) {
    while(true) {
        yield x
        x/=2
    }
}

//论文中的elimerror函数
const elimerror = (n:number) => (gen:GenF<number>) => {
    return (function* () {
        const i = gen()
        var temp = i.next()
        console.log(a)
        if(isNaN(c)) yield temp.value 
        else {
            var exp = Math.pow(2, n)
            yield (b*exp-a)/(exp-1)
        }
    })
} 

//论文中的order函数
const order = () => {
    if(isNaN(c)) return 1
    else return Math.round(Math.log2((a-c)/(b-c)-1))
}

//求微分的主体
const easydiff = (f:(x:number)=>number, x:number, h:number) => (f(x+h)- f(x))/h

//随便写一个函数
const foo = (x:number) => 2*x*x +3*x

//version 1
console.log(within(0.1)((elimerror(order())(map(easydiff)(halve)(foo)(2)(1)))))
