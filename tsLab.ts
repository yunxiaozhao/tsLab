import { curry } from "ramda";

type GenF<T> = () => Generator<T>
type GenL<A, B, C> = () => Generator<A, B, C>
type Gen1<T> = (x:number) => Generator<T>

/**
 * 当两次的计算结果差距小于eps停止
 */
const within = curry((eps: number,gen: GenF<number>) => {
    const i = gen()
    var result: number[] = []
    var index = -1;
    //首先要求出前三个abc才能进行优化,之后如果两者差距大于eps则继续
    while (index < 2 || result[index]-result[index-1] > eps||result[index-1]-result[index] > eps) {
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

        //由于计算n需要三个a、b、c三个值，加上generator lazy的特性，因此需要在次暂存一下上次和上上次产生的值，也就是b和c
        var abc:number[] = [NaN, NaN, NaN]   
        while (true) {
            const h = i.next().value

            //c的新值为b的旧值
            abc[2] = abc[1]

            //b的新值为a的旧值
            abc[1] = abc[0]

            //产生新的a
            abc[0] = f(_f,x,h)

            //产出abc的三元组
            yield(abc)
        }
    })

}


//论文中的order函数
const order = (gen:GenL<number[], never, unknown>) =>  {
    return (function* () {
        const i = gen()
        while(true) {
            const abc = i.next().value
            if(!isNaN(abc[2])) {
                //函数中给出的计算n的公式
                const n = Math.round(Math.log2((abc[0]-abc[2])/(abc[1]-abc[2])-1))
                //elimerror不再需要c，因此返回a、b、n的三元组
                const abn:number[] = [abc[0], abc[1], n]
                yield abn
            }
            else {
                //如果没有最初的三个数则n=NaN
                const abn:number[] = [abc[0], abc[1], NaN]
                yield abn
            }
        }
    })
}

//论文中的elimerror函数
const elimerror = (gen:GenL<number[], never, unknown>) => {
    return (function* () {
        const i = gen() 
        while(true) {
            const abn = i.next().value
            //如果无法计算n则不进行优化直接返回a
            if(isNaN(abn[2])) yield abn[0]
            else {
                //如果n可以得到则按论文中的公式计算得到a
                var exp = Math.pow(2, abn[2])
                const a:number = (abn[1]*exp-abn[0])/(exp-1)
                yield a
            }
        }
    })
} 


//求微分的主体
const easydiff = (f:(x:number)=>number, x:number, h:number) => (f(x+h)- f(x))/h

//折半迭代器，用于折半h
function* halve(x:number) {
    while(true) {
        yield x
        x/=2
    }
}

//在此定义需要微分的函数
const foo = (x:number) => 2*x*x +3*x

//计算微分结果，最后两个数字第一个是计算微分的x的值，第二个是初始的h0
console.log(within(0.001)((elimerror(order(map(easydiff)(halve)(foo)(5)(4))))))
