import { Cloneable, Row, Tridiagonal } from '../src/enforcePivot';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, Contact } from '../src/fields'
import { main } from '../src/GL';
import { ContactedField } from '../src/fieldStatic'
// It seems like I want a LayoutAdapter to index the contacts
//  That class has a Contacted  Field and has contact Index (bi directional) for the boring, but confusing mapping of letter
//   Floodfill goes here
// ContactField only knows that a capital letter is metal and voltage is the known value while we solve for charge
//  After this tests, I will think about the charge constraint per electrode
//   voltage is the same for all cells covered by the elctrode, but charge distirbution is still unknown. Sum of charge is known. Clearly new test cases.

import { expect } from 'chai';
import 'mocha';

// taken from test/fields.ts .. Replaced literal voltage digits by capital letters
const contactsAverage: string[] = ['BiA']; // check average in center
const contacts2d: string[] = ['Bii', 
                              'iiA']; // should all float up to the one given potential
const contactsSquare: string[] = ['Bii', 'iii', 'iiA']; // // check average in center

const contactsAverageV: string[] = ['B','i','A']; // check average in center

describe('2i0metal', () => {
	it('should all float to the average m',()=>{
		const Swap = new Field(contactsAverage)
		const [v,m] = Swap.ShapeToSparseMatrix();
		const rn = Swap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(2)  //  two sides
		// pull in (from the sides) is 1
		expect(m.getAt(rn,0)).to.equal(1) // sort by column would put off-diagonal elements on the rhs. This cannot be already sorted. So after augmenting?
		expect(m.getAt(rn,2)).to.equal(1) // no influence by bandgap, just mesh effect
		expect(Swap.fieldInVarFloats[0][0].RunningNumberOfJaggedArray).to.equal(1)
		// At 1 we expect the unknown charge swapped in. Still it just sits as 1 on the diagonal like before the swap
		// The magic happens at invers .. it is kinda routing
		// Now I understand that we need to sort, but the row  .. pull is 1 always anyway
		expect(Swap.fieldInVarFloats[0][2].RunningNumberOfJaggedArray).to.equal(2)

		m.AugmentMatrix_with_Unity()
		expect(m.getAt(0,4)).to.equal(1) // sort by column would put off-diagonal elements on the rhs. This cannot be already sorted. So after augmenting?
		expect(m.getAt(1,4)).to.equal(0)
		
		Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
		expect(m.getAt(0,4)).to.equal(1)
		expect(m.getAt(1,4)).to.equal(0)
		expect(m.getAt(rn,0)).to.equal(1)
		expect(m.getAt(rn,2)).to.equal(1)


		expect(v[0]).to.equal(0)  //  no fixed voltage
		expect(v[1]).to.equal(0)  //  no fixed voltage
		expect(v[2]).to.equal(0)  //  no fixed voltage
	})		
	it('should all float to the average2d m',()=>{
		const NoSwap = new Field(contacts2d)
		const [v,m] = NoSwap.ShapeToSparseMatrix();		
		const rn = NoSwap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(1)
		expect(m.getAt(rn,rn)).to.equal(3)  //   T junction
		expect(m.getAt( 0, 0)).to.equal(2)  //   corner
		expect(v.length).to.equal(4)  //  to match matrix length
		let i=0 // regression test
		expect(v[i++]).to.equal(0)  //  one pole  horizontally
		expect(v[i++]).to.equal(0) //  other pole  vertically
		expect(v[i++]).to.equal(0)  //  one pole  vertically
		expect(v[i++]).to.equal(0) //  other pole horizontally

		m.AugmentMatrix_with_Unity()  // Now I wonder how this works with jaggies? Row.length ? And does it straigten out the jaggies?
		expect(m.getAt(rn,rn+4)).to.equal(1)  //  the start of the other diagonal				
		m.inverseRectangular() // inplace?
		expect(m.getAt(rn,rn)).to.approximately(1,0.001)
		const potential = m.MatrixProduct(v)  // this is a good way to test the inverse. Later there are ofthen the fixed rails. So it may be nice to have them integrated into a sandwich column .. dunno
		// If I stay with this MatrixProduct, I would need to concat(v & contacts) .. this test has no Contacts, though
		// a good way to remember how v matches the columns of the Matrix is to imagine that you adjust those fixed potentials and then see how the potential goes up and down like a blanket in your bed.
		// ToDo store potential in Field to utilize the  print2canvas routine
		NoSwap.pullInSemiconductorVoltage(potential) // on bugs this hopefully throws
	})
})
