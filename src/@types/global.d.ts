type ReturnTypeP<T extends (...args: any[]) => any> = ThenArg<ReturnType<T>>
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
