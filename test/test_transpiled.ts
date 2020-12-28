// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2
import { Tridiagonal, Row, JoinOperatorIterator, Seamless, Span } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Hello function 2020-12-01 12:17', () => {

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

describe('trim row (Accessing my code)', () => {
  it('shOuld reTurn [4]', () => {
      //const scalar = new Tridiagonal(1);
      const r = Row.Single(0, 4); // new 0,[[],[4],[]]) // Faktor 20
      expect(r.data[0].length).to.equal(1);
      const result = r.data[0][0]; //hello();
      expect(result).to.equal(4);
  });
});

describe('Matrix Accessing my code', () => {

  it('shOuld reTurn 4', () => {
    const scalar=new Tridiagonal(1)
    scalar.row[0]=Row.Single(0,4) // new 0,[[],[4],[]]) // Faktor 20
    const result = scalar.getAt(0,0) //hello();
    expect(result).to.equal(4);
  });

});

    // sub now uses quite complicated helper classes. Even private classes should be tested. I mean, with fields within classes it is probably difficult to not destroy the tests, but with classes?
describe('Testing unequi-join', () => {

  it('shOuld return 0', () => {
    const jop=new JoinOperatorIterator([0,3,4,9],[1,4,6,8])

    let result = jop.next()    
    expect(result).to.equal(0);
    // Inf fact: I do not know .. ah I know, both I should guard the next edge
    // expect(jop.i[0][0]).to.equal(0);
    // expect(jop.i[0][0]).to.equal(1);
    result = jop.next()    
    expect(result).to.equal(1);    
    result = jop.next()    
    expect(result).to.equal(3);
    result = jop.next()    
    expect(result).to.equal(4);
    result = jop.next()    
    expect(result).to.equal(6);
    result = jop.next()    
    expect(result).to.equal(8);
    result = jop.next()    
    expect(result).to.equal(9);
    result = jop.next()    
    expect(result).to.equal(jop.last);    
  });

});

describe('Testing Seamless', () => {

  it('shOuld reTurn 4', () => {
    const sea=new Seamless()

    const span=new Span<number>(3,0)
    span.extends=[2,3,4]
    sea.removeSeams([span],0 /* from above test */, true)
    // jop is at the beginning. Nothing to write yet    
    expect(sea.start_next.length).to.equal(0,"nothing in output yet"); //2020-12-28  start_nest is undefined

    // but lets test with "accidental input" sea.flush()
    
    const span1=new Span<number>(0,3)
    span.extends=[]
    sea.removeSeams([span1],3 /* from above test */, false)

    expect(sea.start_next.length).to.equal(1);
    expect(sea.data_next.length).to.equal(1);

    expect(sea.data_next[0].length).to.equal(3);

    let result = sea.start_next //hello();
    expect(result[0]).to.equal(0);
    expect(result[1]).to.equal(3);

    const resultd = sea.data_next[0] //hello();
    expect(resultd[0]).to.equal(2);
    expect(resultd[1]).to.equal(3);
    expect(resultd[2]).to.equal(4);


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