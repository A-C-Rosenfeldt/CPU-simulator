import { Tridiagonal, Row, Transpose, RowCursor, JopWithRefToValue, KeyValueValue } from '../src/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Row alone', () => {
	it('Find fresh 0.0 values, just to check for lucky geometries => statistics pleawe', () => {
		const span = new KeyValueValue<number>(3, 4);
		span.Value=[1,2,3] // negative sample
		const row=new Row([span] )
		expect( row.Value[0].length ).to.equal(3)

		const span0 = new KeyValueValue<number>(3, 4); // len start .. I shoudl be the other way around .. but in this way it is the default string property first
		span0.Value=[0,2,3] // negative sample
		const row0=new Row([span] )
		expect( row0.Value[0].length ).to.equal(3)

		let newKeyValues:number[]=[]
        let newValues:number[][]=[] ;

		( Row.RLE(row0.KeyValue , newKeyValues , newValues) ) (row0.Value[0],0,null) ;

		expect(newValues.length).to.equal(2)
		expect(newKeyValues[0]).to.equal(4)
		
	})
})
