// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2
import { Tridiagonal, Row } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Hello function', () => {

  it('should return hello world', () => {
    //const scalar=new Tridiagonal(1)
    //scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
    const result = 4//scalar.getAt(0,0) //hello();
    expect(result).to.equal(4);
  });

});
//$ ./node_modules/mocha/bin/mocha
// node ./node_modules/mocha/bin/mocha
// # mocha.opts
// --require babel-register ./test/setup
// test/**/*.test.js

describe('Accessing my code', () => {

  it('shOuld reTurn 4', () => {
    const scalar=new Tridiagonal(1)
    scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
    const result = scalar.getAt(0,0) //hello();
    expect(result).to.equal(4);
  });

});