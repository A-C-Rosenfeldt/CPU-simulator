import { Tridiagonal, Row, JoinOperatorIterator, SeamlessValues, AllSeamless, KeyValueValue, Result } from '../src/enforcePivot';
import { expect } from 'chai';
import 'mocha';

class SeamlessMock implements SeamlessValues{
  data_next: number[][] = []
  KeyValue_next: number[] = []
  otherLog:number[][]=[]
  
  constructor() { //keepSeamAt?:number){
    // this is a conflict. I like to be explicit and constructive, but at the same time minimize surface. swapArray seems to be rich enough to induce seams. Will write tests to express my intent.
      //  this.keepSeamAt=keepSeamAt
  }
  flush() {
    // not needed in this mock:  throw new Error('Method not implemented.');
  }
      removeSeams(fillValues: KeyValueValue<number>[], pos: number, filled: boolean, operator?: Result, nukeCol?: number, whatIf?: boolean) {
        this.KeyValue_next.push(pos) // pos should always pass the test at the end of  swapColumns()
        //console.log("remove Seams at least has to note pos: "+pos+" and filled "+filled+" to check the chain of XORs")
        if (fillValues.length===1){
        const f=fillValues[0] // array functionality for sub only. Degenerated case is simpler than type union
        if (this.KeyValue_next.length>0 && this.KeyValue_next[this.KeyValue_next.length-1]>f.KeyValue){
          throw "values must be increasing monotonic "+ this.KeyValue_next +" > "+f.KeyValue  // back tracking from "shifting forth and back  does not match"
        } 
        
        this.otherLog.push([(filled?1:0),f.KeyValue,f.Value.length]) // todo: start next is public and this use crashes swapColums()
        }else{
          this.otherLog.push([(filled?1:0)])
          if (fillValues.length>1){
            throw "should only happen in subtract"
          }
        }
      }
  }

describe('Swap', () => {
  it('jop should work with three operands jop and cutter at 0 and row.length', () => {
    let jop = new JoinOperatorIterator([0, 1],[3, 4],[0, 0, 3, 4, 6, 6])

    // find minimum start value of the three
    let pos=jop.next()
    expect(pos).to.equal(0)
    // white box
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(1)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(0) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(1)
    }

    pos=jop.next()
    expect(pos).to.equal(0)    
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(1)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(0) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
    }
    // todo: double zero length cutter for different fill state with nominal same small signature.  --  needed because I do not want to check for each Row. Swap is one loop outside => easy debug

    pos=jop.next()
    expect(pos).to.equal(1)    
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(0) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
    }

    // pos=jop.next()
    // expect(pos).to.equal(2)   // actually: 3 
    // // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    // {
    //   let i=0
    //   expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
    //   expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(0) // shifted values start later
    //   expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
    // }

    pos=jop.next()
    expect(pos).to.equal(3)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(1) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(3)
    }

    pos=jop.next()
    expect(pos).to.equal(4)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(4)
    }

    pos=jop.next()
    expect(pos).to.equal(6)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(5)
    }

    pos=jop.next()
    expect(pos).to.equal(6)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(6)
    }    

    pos=jop.next()
    expect(pos).to.equal(7)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2)
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(2) // shifted values start later
      expect(jop.KeyValuesSources[i++].KeyKeyValue).to.equal(6)
    }    

  });



    it('jop + swap', () => {
      // Maybe inject mock, which tests, if buffers were flushed before read?
  
      //const scalar=new Tridiagonal(1)
      //scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
      const result = 4//scalar.getAt(0,0) //hello();
      expect(result).to.equal(4);
  
      let size = 6 >> 1
      const row=Row.Single(0,5) //0,[[],[5],[]])
      
      const swapHalf=[0,1]
      const spans_new_Stream=[new SeamlessMock(),new SeamlessMock()] // todo: inject unit test debug moch    I copy row instead  l)
      // state is you enemy. Swap brings all its borders with it. No need to stress the seam between original matrix and augmenation
      const delayedSWP= /*[size,size].concat( */ swapHalf.map(pos=>pos+(size)) /* , [size<<1,size<<1]) */ // concat: cut spans which span the center. This method seems to be responsible for this feature
  
      // todo: this becomes a method of class Row
      row.shiftedOverlay(size /* we now (2022-02) use the height of the matrix because the width is not so obvious with RLE and jaggies */, delayedSWP, spans_new_Stream)     // endless loop 

      expect(spans_new_Stream[1].KeyValue_next.length).to.equal(2)
      expect(spans_new_Stream[0].KeyValue_next.length).to.equal(2)
      let j=0
      {
        let i=0
        expect(spans_new_Stream[j].KeyValue_next[i]).to.equal(3)
        // unit test should only test public values. I think I changed the spec and the log is very sensitive to this
      //  expect(spans_new_Stream[j].otherLog[i++][0]).to.equal(0) // is 1 .. like no swap happend :-(
        expect(spans_new_Stream[j].KeyValue_next[++i]).to.equal(4)        
       // expect(spans_new_Stream[j].otherLog[i++][0]).to.equal(0)
      }
      j++
      {
        let i=0
        expect(spans_new_Stream[j].KeyValue_next[i]).to.equal(3)
        //expect(spans_new_Stream[j].otherLog[i++][0]).to.equal(1)
        expect(spans_new_Stream[j].KeyValue_next[++i]).to.equal(4)        
        //expect(spans_new_Stream[j].otherLog[i++][0]).to.equal(0)
      }

      // expect(unit.getAt(0,3)).to.equal(0)
  
    });

   //  flus is tested in test_transpiled.ts/Testing Seamless it('jop + swap + seamless(flush)', () => {
//    
  
it('jop + swap + seamless + tridiagonal', () => {
    // Maybe inject mock, which tests, if buffers were flushed before read?

    //const scalar=new Tridiagonal(1)
    //scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
    const result = 4//scalar.getAt(0,0) //hello();
    expect(result).to.equal(4);

    let size = 6>>1 // I changed the interface in 2022-02 to cater to the width-heigh asymmetry
    const unit = new Tridiagonal(size)
    for(var i=0;i<size;i++){
      unit.row[i]=Row.Single(i<<1 /* back to full width */,5) //0,[[],[5],[]])
    }

    // to left
    expect(unit.getAt(2,0)).to.equal(0)
    expect(unit.getAt(2,4)).to.equal(5)
    // to right
    expect(unit.getAt(0,0)).to.equal(5)
    expect(unit.getAt(0,4)).to.equal(0)
    unit.swapColumns([0,1])
    expect(unit.row[0].KeyValue.length).to.equal(2)
    expect(unit.row[0].KeyValue[0]).to.equal(3)
    expect(unit.row[0].KeyValue[1]).to.equal(4)

    expect(unit.row[0].Value.length).to.equal(1)
    expect(unit.row[0].Value[0][0]).to.equal(5)

    // to left
    expect(unit.getAt(2,0)).to.equal(0)
    expect(unit.getAt(2,4)).to.equal(5)
    // to right
    expect(unit.getAt(0,0)).to.equal(0)
    expect(unit.getAt(0,3)).to.equal(5)

    expect(unit.getAt(1,2)).to.equal(5)
    expect(unit.getAt(1,4)).to.equal(0)
    unit.swapColumns([1,3])
    expect(unit.getAt(1,2)).to.equal(0)
    expect(unit.getAt(1,2+3)).to.equal(5)


  });

});