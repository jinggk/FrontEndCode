// demo1
function* gen(x) {
    const y = yield x + 2;
    const y1 = yield y + 3;
    return y1;
}

var g = gen(1);
console.log(g.next()); // { value: 3, done: false }
console.log(g.next(2)); // { value: 5, done: false }
console.log(g.next()); // { value: undefined, done: true }

// demo2

函数A(正常情况);
const a = {
    then: () => {
        console.log("then");
        return 123123;
    }
};

const test0 = async function() {};

const test1 = async function() {
    return 123;
};
const test2 = async function() {
    console.log(123);
};
const test4 = async function() {
    return a;
};

test0().then(console.log); // undefined
test1().then(console.log); // 123
test2().then(console.log); // 123 undefined
test4().then(console.log); // then

// 函数B(模拟情况);
function myAsync(myGenerator) {
    // 判断接受到的参数不是一个generator函数
    if (
        Object.prototype.toString.call(myGenerator) !==
        "[object GeneratorFunction]"
    ) {
        // 如果是一个普通函数
        if (
            Object.prototype.toString.call(myGenerator) === "[object Function]"
        ) {
            return new Promise((resolve, reject) => {
                // 默认返回一个promise对象
                try {
                    const data = myGenerator();
                    return resolve(data); // 尝试运行这个函数，并把结果resolve出去
                } catch (err) {
                    return reject(err); // 失败处理
                }
            });
        }
        // 如果参数含有then这个方法--thenable 鸭子类型
        if (typeof myGenerator.then === "function") {
            return new Promise((resolve, reject) => {
                try {
                    // 运行这个对象的then函数，并resolve出去
                    const data = myGenerator.then();
                    return resolve(data);
                } catch (err) {
                    return reject(err); // 失败处理
                }
            });
        }
        // 剩下的情况，统一resolve出去给的参数
        return Promise.resolve(myGenerator);
    }
    const gen = myGenerator(); // 生成迭代器
    const handle = genResult => {
        if (genResult.done) return; // 如果迭代器结束了，直接返回；
        return genResult.value instanceof Promise // 判断当前迭代器的value是否是Promise的实例
            ? genResult.value
                  .then(data => handle(gen.next(data))) // 如果是，则等待异步完成后继续递归下一个迭代，并把resolve后的data带过去
                  .catch(err => gen.throw(err)) // gen.throw 可以抛出一个允许外层去catch的err
            : handle(gen.next(genResult.value)); // 如果不是promise，就可以直接递归下一次迭代了
    };
    try {
        handle(gen.next()); // 开始处理next迭代
    } catch (err) {
        throw err;
    }
}

myAsync(function*() {
    try {
        yield Promise.reject(123);
        const data1 = yield new Promise(res => {
            setTimeout(() => {
                res(1234);
                console.log("step 1");
            }, 1000);
        });
        console.log(data1);
        const data2 = yield new Promise(res => {
            setTimeout(() => {
                res(12342);
                console.log("step 2");
            }, 1000);
        });
        console.log(data2);
    } catch (err) {
        console.log(888, err); // 888 123
    }
});

const a = {
    then: () => {
        console.log("then");
        return 123123;
    }
};

const test0 = myAsync(function() {});

const test1 = myAsync(function() {
    return 123;
});

const test2 = myAsync(function() {
    console.log(123);
});
const test4 = myAsync(function() {
    return a;
});

test0.then(console.log); // undefined
test1.then(console.log); // 123
test2.then(console.log); // 123 undefined
test4.then(console.log); // then

function* myGenerator() {
    const data = yield Promise.resolve("success");
    console.log(data); // success
}
const test = () => myAsync(myGenerator);
