import { Tridiagonal, Row, JoinOperatorIterator, Seamless, Span } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

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

  it('should swap hello world', () => {
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