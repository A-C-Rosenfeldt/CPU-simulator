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

    const span2=new Span<number>(3,0)
    span2.extends=[22,23,24] 

    sea.removeSeams([],2 /* First value  from  above test */, true)  // Matrix Row  starts with zeros ( false ). After 2 of them, values are filled "true". jop flipped to true on first edge.
    expect(sea.start_next.length).to.equal(0); // we switch from empty ( Matrix out of bounds has 0) to filled
    //expect(sea.start_next[0]).to.equal(2);  // we cannot note 2 here because we do not know if a zero length and an edge back to false comes



    const span=new Span<number>(3,2)
    span.extends=[2,3,4]  // i >> 1  can give the string one cycle after getting the start value. After all we need to wait for end

// in this case  ..  white box test is needed. Different folder? Is for edge cases. Maybe transform into black later
    expect(sea.pos_input[0]).to.equal(2) // { // eat zero length  ( Row constructor does this too, but it is only one line ). No code outside this block!
    expect(sea.pos_input[1]).to.equal(0)  
    expect(sea.filled[1]).to.equal(false)
    expect(sea.filled[0]).to.equal(true)
    
    expect(sea.data_next.length).to.equal(0);    

    sea.removeSeams([span],5 /* ToDo: check!  0 makes no sense!  from above test */, false /* flips from jop  go to false */)   // We add 5 values and stay true: more to come (why do we know this?)

    expect(sea.pos_input[0]).to.equal(5) // { // eat zero length  ( Row constructor does this too, but it is only one line ). No code outside this block!
    expect(sea.pos_input[1]).to.equal(2)  

    expect(sea.start_next.length).to.equal(1); // Note pos[1] . jop again detects filled state => no real border, just a seam. Do not note!
    expect(sea.start_next[0]).to.equal(2);
    expect(sea.data_next.length).to.equal(0); // values still reside in concatter    

    // jop is at the beginning. Nothing to write yet    
    expect(sea.start_next.length).to.equal(1,"nothing in output yet"); //2020-12-28  start_nest is undefined

    // but lets test with "accidental input" sea.flush()
    
    const span1=new Span<number>(1,3)
    span1.extends=[1 /* len < 1 is ignored */]
    sea.removeSeams([span1],6 /* zero length are ignored. So either need .flush to transmitt the final  fill vs gap  value:  */, false /* value after the string we deliver in first param */)
    expect(sea.start_next.length).to.equal(2); // fill state  confirmed by advancing to new position
    expect(sea.data_next.length).to.equal(1);  // flush concatter because confirmed state is  not filled
    expect(sea.data_next[0].length).to.gt(0);  // since I ignore zero length even before the switching detection, concatter must contain values. Otherwise the input spans have to be bogus. 

    //span1.extends = [99,99,99]; 

    expect(sea.start_next.length).to.equal(2);
    expect(sea.data_next.length).to.equal(1);

    expect(sea.data_next[0].length).to.equal(3);  // one fused span from 2..5  5-2=3

    let result = sea.start_next //hello();
    expect(result[0]).to.equal(2);
    expect(result[1]).to.equal(5);

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