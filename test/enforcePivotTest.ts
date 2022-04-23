import { Tridiagonal, Row, Transpose, RowCursor, JopWithRefToValue, KeyValueValue } from '../src/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Row alone: Find 0.0   statistics please', () => {
	it('split', () => {
		const r = new Row([[49,1]]) // empty throws. I cannot see a usage for empty rows in a field
		r.KeyValue = [   // private values grabbed from debugger . Todo: Change to use public interface
			48,			49,			90,			91,			96,			98
		]
		r.Value=[
			[			  1,			],
			[			  1,			],
			[			  1,			  -2,			],
		  ]
		const pos=new Array(...r.KeyValue) // shallow clone. Not really needed
		const cut=49
		const s=r.split(1, cut)
		
		expect(s.KeyValue.length & 1 ).to.equal(0)

		for(var i=s.KeyValue.length;i>0;i--){
			expect(s.KeyValue.pop()).to.equal(pos.pop()-cut)
		}
	})
	it('trim', () => {
		{
			const span = new KeyValueValue<number>(3, 4);
			span.Value = [1, 2, 3] // negative sample
			const row = new Row([span])
			expect(row.Value[0].length).to.equal(3)
		}

		{
			const span0 = new KeyValueValue<number>(3, 4); // len start .. I shoudl be the other way around .. but in this way it is the default string property first
			span0.Value = [0, 2, 3] // negative sample
			const row0 = new Row([span0])
			expect(row0.Value[0].length).to.equal(2) // trim in constructor
		}
		{
			const span0 = new KeyValueValue<number>(3, 4); // len start .. I shoudl be the other way around .. but in this way it is the default string property first
			span0.Value = [1, 2, 3] // negative sample
			const row0 = new Row([span0])
			expect(row0.Value[0].length).to.equal(3)
			row0.Value[0][0] = 0 // happens in inverse at a trivial stage where we should better work in place -- but maybe elsewhere also?

			let newKeyValues: number[] = []
			let newValues: number[][] = [];

			(Row.RLE(row0.KeyValue, newKeyValues, newValues))(row0.Value[0], 0, null);

			expect(newValues.length).to.equal(1) // no cut, only trim
			expect(newValues[0].length).to.equal(2)
			expect(newKeyValues[0]).to.equal(5)
		}
	})
	it('cut', () => {
		{
			const span0 = new KeyValueValue<number>(3, 4); // len start .. I shoudl be the other way around .. but in this way it is the default string property first
			span0.Value = [1.5, 2.5, 3.5] // negative sample
			const row0 = new Row([span0])
			expect(row0.Value[0].length).to.equal(3)
			row0.Value[0][1] = 0.0 // happens in inverse at a trivial stage where we should better work in place -- but maybe elsewhere also?

			let newKeyValues: number[] = []
			let newValues: number[][] = [];

			(Row.RLE(row0.KeyValue, newKeyValues, newValues))(row0.Value[0], 0, null);

			expect(newValues.length).to.equal(2) // cut
			expect(newValues[0].length).to.equal(1)
			expect(newKeyValues[0]).to.equal(4)
			expect(newKeyValues[1]).to.equal(5)
			expect(newKeyValues[2]).to.equal(6)
			expect(newKeyValues[3]).to.equal(7)

			expect(newValues[0][0]).to.equal(1.5)
			expect(newValues[1][0]).to.equal(3.5)
		}
	})
})
