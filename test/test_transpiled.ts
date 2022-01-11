// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2
import { Tridiagonal, Row, JoinOperatorIterator, AllSeamless, Span } from '../src/enforcePivot';
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

describe('key value pairs like classical sparse matrix', () => {
  it('should connect dangling bonds', () => {
      //const scalar = new Tridiagonal(1);
      const r = new Row([[3,6],[4,7]])
      expect(r.starts.length).to.equal(2);
      expect(r.starts[0]).to.equal(3);
      expect(r.starts[1]).to.equal(5);
      expect(r.data[0].length).to.equal(2);
      const result = r.data[0][0]; //hello();
      expect(result).to.equal(6);
      expect(r.data[0][1]).to.equal(7);
  });
  it('should trim dangling bonds', () => {
    //const scalar = new Tridiagonal(1);
    const r = new Row([[2,0],[3,6],[4,7],[5,0]])
    // rest like above
    expect(r.starts.length).to.equal(2);
    expect(r.starts[0]).to.equal(3);
    expect(r.starts[1]).to.equal(5);
    expect(r.data[0].length).to.equal(2);
    const result = r.data[0][0]; //hello();
    expect(result).to.equal(6);
    expect(r.data[0][1]).to.equal(7);
  });
  it('should trim -- and there is a gap', () => {
    //const scalar = new Tridiagonal(1);
    const r = new Row([[2,0],[3,6],[5,7],[6,0]])
    // rest like above
    expect(r.starts.length).to.equal(4);
    expect(r.starts[0]).to.equal(3);
    expect(r.starts[1]).to.equal(4);
    expect(r.starts[2]).to.equal(5);
    expect(r.starts[3]).to.equal(6);
    expect(r.data[0].length).to.equal(1);
    const result = r.data[0][0]; //hello();
    expect(result).to.equal(6);
    expect(r.data[1][0]).to.equal(7);
  });
  it('should trim inside the gap', () => {
    //const scalar = new Tridiagonal(1);
    const r = new Row([[2,6],[3,0],[5,0],[6,7]])
    // rest like above
    expect(r.starts.length).to.equal(4);
    expect(r.starts[0]).to.equal(2);
    expect(r.starts[1]).to.equal(3);
    expect(r.starts[2]).to.equal(6);
    expect(r.starts[3]).to.equal(7);
    expect(r.data[0].length).to.equal(1);
    const result = r.data[0][0]; //hello();
    expect(result).to.equal(6);
    expect(r.data[1][0]).to.equal(7);
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

    const these = jop.i.every(ii => {
      //  const ii=jop.i[1][j]
      return  typeof ii.mp === "number"
              })
    expect(these).to.true

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
    expect(result).to.equal(jop.behind);
    expect(jop.i.every(v => v.filled === false) ).to.true;
  });
});

// before(async () => {  
//   await Special.setupForThisFile()
// })

describe('Testing Seamless', () => {

  let sea=new AllSeamless()

  beforeEach(function(){
    console.log('see.. this function is run EACH time')
    sea.removeSeams([],2 /* First value  from  above test */, false)  // Matrix Row  starts with zeros ( false ). After 2 of them, values are filled "true". jop flipped to true on first edge.
  })
  it('empty, false, flush', () => {
  
    // sea.removeSeams(filled: { 2020: {true, false, false}, 2021: {false, true, true} })
 
    // end of  set-up

    // transparent box access too risky for usage //expect(sea.start_next.length).to.equal(0); // we switch from empty ( Matrix out of bounds has 0) to filled
    expect(sea.filled[1]).to.equal(false) // not yet trigger data concat !
    expect(sea.filled[0]).to.equal(false) // parameter

       /*
    Debug log from 2021-01-08  test/swapColumns
public/enforcePivot.ts:746  going from filled?:false to filled?:false
public/enforcePivot.ts:199  going from filled?:false to filled?:true
public/enforcePivot.ts:199 flush: 4-> by the way, filled: false,false
public/enforcePivot.ts:262 flush: 34-> by the way, filled: false,true

then I changed: !this.filled[0] to this.filled[1]
.. now, let's test
     */
    sea.flush()
    expect(sea.start_next.length).to.equal(0)
  })

  
  it('extend, true, flush', () => {
 
    const span=new Span<number>(3,2)
    span.extends=[2,3,4]  // i >> 1  can give the string one cycle after getting the start value. After all we need to wait for end

// in this case  ..  white box test is needed. Different folder? Is for edge cases. Maybe transform into black later
// what does thar mean?    //expect(sea.pos_input[0]).to.equal(2) // { // eat zero length  ( Row constructor does this too, but it is only one line ). No code outside this block!
    expect(sea.pos_input).to.equal(2) //0)  

    sea.removeSeams([span],5 /* ToDo: check!  0 makes no sense!  from above test */, true /* flips from jop  go to false */)   // We add 5 values and stay true: more to come (why do we know this?)
    expect(sea.filled[1]).to.equal(false)
    expect(sea.filled[0]).to.equal(true)

    sea.flush()
    expect(sea.start_next.length).to.equal(0) 
    return
    expect(sea.start_next.length).to.equal(1); //  Note pos[1] . jop again detects filled state => no real border, just a seam. Do not note!
    expect(sea.start_next[0]).to.equal(2);
    expect(sea.data_next.length).to.equal(0); // Make sure concatting happens on true->false transition.  values still reside in concatter    

    expect(sea.pos_input[0]).to.equal(5) // { // eat zero length  ( Row constructor does this too, but it is only one line ). No code outside this block!
    expect(sea.pos_input[1]).to.equal(2)  

    // jop is at the beginning. Nothing to write yet    
    expect(sea.start_next.length).to.equal(1,"nothing in output yet"); //2020-12-28  start_nest is undefined

    // but lets test with "accidental input" sea.flush()
    
    const span1=new Span<number>(1,3)
    span1.extends=[1 /* len < 1 is ignored */]
    sea.removeSeams([span1],5 /* = 3+2  ; zero length are ignored. So either need .flush to transmitt the final  fill vs gap  value:  */, true /* value after the string we deliver in first param */)
    expect(sea.start_next.length).to.equal(1); // still filling
    expect(sea.data_next.length).to.equal(0); // still filling
    sea.flush();
    expect(sea.start_next.length).to.equal(2); // this "start" is really a "stop"
    expect(sea.data_next.length).to.equal(1); // data  from start to stop

    // ancient: expect(sea.data_next[0].length).to.equal(3);  // one fused span from 2..5  5-2=3

    let result = sea.start_next //hello();
    expect(result[0]).to.equal(2);
    expect(result[1]).to.equal(5);

    const resultd = sea.data_next[0] //hello();
    expect(resultd[0]).to.equal(2);
    expect(resultd[1]).to.equal(3);
    expect(resultd[2]).to.equal(4);


  });

});



    // sub now uses quite complicated helper classes. Even private classes should be tested. I mean, with fields within classes it is probably difficult to not destroy the tests, but with classes?
    describe('Testing unequi-join integrate Seamless', () => {

      it('shOuld return 0', () => {

        // to actually join something, I need two spans of values
        const span1=new Span<number>(3,0)                
        const span2=new Span<number>(3,1)

        const jop=new JoinOperatorIterator([0,3,4,9],[1,4,6,8])
        span1.extends=[12,13,14]
        span2.extends=[22,23,24]         

        const sea=new AllSeamless()

        let result = jop.next()    
        expect(result).to.equal(0);
        const these = jop.i.every(ii => {
          //  const ii=jop.i[1][j]
          return  typeof ii.mp === "number"
                  })
        expect(these).to.true

        // we simulate  "sub"  . Any not 0 => 0.   ( be sure to let Row.ctrs remove the (single)0 due to sub )
        expect(jop.i[0].filled).to.true
        expect(jop.i[1].filled).to.false
        sea.removeSeams([span1],result, true)
        expect(sea.pos_input).to.equal(0) // this is a little bit lame. Todo: better test data. Push this edge case towards the end.

        
        // Inf fact: I do not know .. ah I know, both I should guard the next edge
        // expect(jop.i[0][0]).to.equal(0);
        // expect(jop.i[0][0]).to.equal(1);
        result = jop.next()    
        expect(result).to.equal(1);
        sea.removeSeams([span1,span2],result, true) // huh, overlap
        expect(sea.pos_input).to.equal(1) 
        // todo: create  filled=false        
        
        result = jop.next()    
        expect(result).to.equal(3);
        result = jop.next()    

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
      let result = unit.getAt(0, 0);
      let warn = true;
      expect(result).to.equal(5);
      result = unit.getAt(0, 1);
      expect(result).to.equal(-5);

    });
});