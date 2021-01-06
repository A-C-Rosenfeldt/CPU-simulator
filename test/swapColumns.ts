import { Tridiagonal, Row, JoinOperatorIterator, Seamless, Span } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Swap Hello function 2021-01-03', () => {

  it('should swap hello world', () => {
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