// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2
import { Tridiagonal, Row } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Hello function 2020-11-19 18:35', () => {

  it('should return hello world 2020-11-19 18:35', () => {
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
    scalar.row[0]=Row.Single(0,4) // new 0,[[],[4],[]]) // Faktor 20
    const result = scalar.getAt(0,0) //hello();
    expect(result).to.equal(4);
  });

});


describe('Doing some linAlg', () => {
    it('shOuld reTurn 5', () => {

      let size = 4
      const unit = new Tridiagonal(size)
      for(var i=0;i<size;i++){
        unit.row[i]=Row.Single(i,5) //0,[[],[5],[]])
      }

      unit.row[0].sub(unit.row[1], 1)  // 0,0,0 -> 1,1,1 has no gaps in pass1. That is okay
      //image=unit.print() // check 2020082401157
      const result = unit.getAt(0, 0);
      let warn = true;
      expect(result).to.equal(5);
    });
});