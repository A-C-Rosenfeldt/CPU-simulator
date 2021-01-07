import { Tridiagonal, Row, JoinOperatorIterator, Seamless, Span } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

class SeamlessMock implements Seamless{
  data_next: number[][] = []
  start_next: number[] = []
  
  constructor() { //keepSeamAt?:number){
    // this is a conflict. I like to be explicit and constructive, but at the same time minimize surface. swapArray seems to be rich enough to induce seams. Will write tests to express my intent.
      //  this.keepSeamAt=keepSeamAt
  }
  flush() {
    throw new Error('Method not implemented.');
  }
      removeSeams(fillValues: Span<number>[], pos: number, filled: boolean, factor?: number, nukeCol?: number, whatIf?: boolean) {
        const f=fillValues[0] // array functionality for sub only. Degenerated case is simpler than type union 
        this.start_next.push(f.start,f.extends.length) // raw for max flexiblity applying mocha.expect
      }
  }

describe('Swap Hello function 2021-01-03', () => {
  it('shouls work with three operands jop and cutter at 0 and row.length', () => {
    let jop = new JoinOperatorIterator([0, 1],[3, 4],[0, 0, 3, 4, 6, 6])

    // find minimum start value of the three
    let pos=jop.next()
    expect(pos).to.equal(0)
    // white box
    {
      let i=0
      expect(jop.i[i++].from).to.equal(1)
      expect(jop.i[i++].from).to.equal(0) // shifted values start later
      expect(jop.i[i++].from).to.equal(1)
    }

    pos=jop.next()
    expect(pos).to.equal(0)    
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.i[i++].from).to.equal(1)
      expect(jop.i[i++].from).to.equal(0) // shifted values start later
      expect(jop.i[i++].from).to.equal(2)
    }
    // todo: double zero length cutter for different fill state with nominal same small signature.  --  needed because I do not want to check for each Row. Swap is one loop outside => easy debug

    pos=jop.next()
    expect(pos).to.equal(1)    
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.i[i++].from).to.equal(2)
      expect(jop.i[i++].from).to.equal(0) // shifted values start later
      expect(jop.i[i++].from).to.equal(2)
    }

    // pos=jop.next()
    // expect(pos).to.equal(2)   // actually: 3 
    // // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    // {
    //   let i=0
    //   expect(jop.i[i++].from).to.equal(2)
    //   expect(jop.i[i++].from).to.equal(0) // shifted values start later
    //   expect(jop.i[i++].from).to.equal(2)
    // }

    pos=jop.next()
    expect(pos).to.equal(3)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.i[i++].from).to.equal(2)
      expect(jop.i[i++].from).to.equal(1) // shifted values start later
      expect(jop.i[i++].from).to.equal(3)
    }

    pos=jop.next()
    expect(pos).to.equal(4)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.i[i++].from).to.equal(2)
      expect(jop.i[i++].from).to.equal(2) // shifted values start later
      expect(jop.i[i++].from).to.equal(4)
    }

    pos=jop.next()
    expect(pos).to.equal(6)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.i[i++].from).to.equal(2)
      expect(jop.i[i++].from).to.equal(2) // shifted values start later
      expect(jop.i[i++].from).to.equal(5)
    }

    pos=jop.next()
    expect(pos).to.equal(6)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.i[i++].from).to.equal(2)
      expect(jop.i[i++].from).to.equal(2) // shifted values start later
      expect(jop.i[i++].from).to.equal(6)
    }    

    pos=jop.next()
    expect(pos).to.equal(7)
    // zero length cutter  needed because I do not want to check for each Row. Swap is one loop outside => easy debug
    {
      let i=0
      expect(jop.i[i++].from).to.equal(2)
      expect(jop.i[i++].from).to.equal(2) // shifted values start later
      expect(jop.i[i++].from).to.equal(6)
    }    

  });



    it('row swap', () => {
      // Maybe inject mock, which tests, if buffers were flushed before read?
  
      //const scalar=new Tridiagonal(1)
      //scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
      const result = 4//scalar.getAt(0,0) //hello();
      expect(result).to.equal(4);
  
      let size = 6
      const row=Row.Single(0,5) //0,[[],[5],[]])
      
      const swapHalf=[0,1]
      const spans_new_Stream=[new SeamlessMock(),new SeamlessMock()] // todo: inject unit test debug moch    I copy row instead  l)
      const delayedSWP= [0,0].concat(  swapHalf.map(pos=>pos+(size>>1)) , [size,size]) // concat: cut spans which span the center. This method seems to be responsible for this feature
  
        // todo: this becomes a method of class Row
        row.shiftedOverlay(size, delayedSWP, spans_new_Stream)      
      
  
      // expect(unit.getAt(0,0)).to.equal(5)
      // expect(unit.getAt(0,3)).to.equal(0)
      // unit.swapColumns([0,1])
      // expect(unit.getAt(0,0)).to.equal(0)
      // expect(unit.getAt(0,3)).to.equal(5)
  
      // expect(unit.getAt(1,1)).to.equal(5)
      // expect(unit.getAt(1,4)).to.equal(0)
      // unit.swapColumns([1,3])
      // expect(unit.getAt(1,1)).to.equal(0)
      // expect(unit.getAt(2,4)).to.equal(5)
  
  
    });

  it('Matrix swap integrated with seamless', () => {
    // Maybe inject mock, which tests, if buffers were flushed before read?

    //const scalar=new Tridiagonal(1)
    //scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
    const result = 4//scalar.getAt(0,0) //hello();
    expect(result).to.equal(4);

    let size = 6
    const unit = new Tridiagonal(size)
    for(var i=0;i<size;i++){
      unit.row[i]=Row.Single(i,5) //0,[[],[5],[]])
    }

    expect(unit.getAt(0,0)).to.equal(5)
    expect(unit.getAt(0,3)).to.equal(0)
    unit.swapColumns([0,1])
    expect(unit.getAt(0,0)).to.equal(0)
    expect(unit.getAt(0,3)).to.equal(5)

    expect(unit.getAt(1,1)).to.equal(5)
    expect(unit.getAt(1,4)).to.equal(0)
    unit.swapColumns([1,3])
    expect(unit.getAt(1,1)).to.equal(0)
    expect(unit.getAt(2,4)).to.equal(5)


  });

});