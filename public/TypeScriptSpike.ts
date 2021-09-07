function foo0(x, y, z) { }
var args0 = [0, 1, 2];
foo0.apply(null, args0);
var a2=new Array<number>();





//foo(...a2);  //  re underline   I need an update of some kind?



declare function foo(args_0: number, args_1: string, args_2: boolean): void;

const args: [number, string, boolean] = [42, "hello", true];
foo(42, "hello", true);
foo(args[0], args[1], args[2]);
foo(...args);