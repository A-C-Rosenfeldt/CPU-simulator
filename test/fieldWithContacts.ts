import { Cloneable, Row, Tridiagonal } from '../src/enforcePivot';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, Contact } from '../src/fields'
import { main } from '../src/GL';
import { ContactedField } from '../src/fieldStatic'
import { setContactVoltages } from '../src/field/setContactVoltage'
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

const contactsAverageV: string[] = ['B', 'i', 'A']; // check average in center



describe('2i0metal', () => {
	it('electrode covering more than one cell', () => {
		const Swap = new Field( 
		['BBsss',  // this could later be the result of a paint algorithm which follows 'm' .
		'BBsss',
		'sssss',
		'sssAA',
			'sssAA']);
		const [v, m] = Swap.ShapeToSparseMatrix();
	
		var imageGlM = m.PrintGl()
		//imageM.push( imageGlM) //main('FieldGl0_field',imageGl) 
		m.AugmentMatrix_with_Unity(-1)
		Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
		// too big imageM.push(m.PrintGl());
		m.inverseRectangular() // in place. Still wonder if I should provide a immutable version
		//		imageM.push(m.PrintGl());
		setContactVoltages(Swap, v, [-5, -6, -7 ])

		var a=0
		for( var i=-7;i<-5;i++){
			expect(v[0+a]).to.equal(i)
			expect(v[1+a]).to.equal(i)
			expect(v[5+a]).to.equal(i)
			expect(v[6+a]).to.equal(i)
			a+=5+3
		}

		{ // we need the voltag both in the tuple for later read out, and now in v (like vector, not voltage) to get the charge density.
			var metal = Swap.fieldInVarFloats[0][0];
			expect(metal.Potential).to.equal(-7)
			metal = Swap.fieldInVarFloats[0][1];
			expect(metal.Potential).to.equal(-7)
			metal = Swap.fieldInVarFloats[4][4];
			expect(metal.Potential).to.equal(-6)			
		}

		const M2 = m.split() // uses the -1 from above.  //new Tridiagonal(0) // split does not work in place because it may need space at the seam
		// Maybe hide/encapsulate the rows? M2.row = m.row.map(r => r.split(1, m.row.length)) // this is ugly internal stuff. I guess I need in place before I can get new features.
		const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
		Swap.pullInSemiconductorVoltage(potential) 		
	});
	
	it('should float to bias', () => {
		const Swap = new Field(['Ai'])
		expect(Swap.flatLength).to.equal(2)
		var [v, m] = Swap.ShapeToSparseMatrix();
		expect(m.getAt(0, 0)).to.equal(1)
		expect(m.getAt(0, 1)).to.equal(-1)
		expect(m.getAt(0, 2)).to.equal(0)

		const rn = Swap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(1)
		expect(m.getAt(rn, rn)).to.equal(1)
		expect(m.getAt(rn, 0)).to.equal(-1) // sort by column would put off-diagonal elements on the rhs. This cannot be already sorted. So after augmenting?
		expect(Swap.fieldInVarFloats[0][0].RunningNumberOfJaggedArray).to.equal(0)
		m.AugmentMatrix_with_Unity()
		expect(m.getAt(0, 2)).to.equal(1)
		expect(m.getAt(0, 3)).to.equal(0)
		expect(m.getAt(1, 3)).to.equal(1)

		expect(m.inverseRectangular.bind(m)).to.throw() // bias voltage is not set, so inverse Matrix cannot deduce the cell voltage from charge distribution

		var [v, m] = Swap.ShapeToSparseMatrix();
		m.AugmentMatrix_with_Unity()
		Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
		m.inverseRectangular() // in place. Still wonder if I should provide a immutable version

		// taken from log on 2022-02-22 => regressionsTest
		expect(m.getAt(0, 0)).to.equal(1)
		expect(m.getAt(0, 1)).to.equal(0)
		expect(m.getAt(0, 2)).to.equal(0)
		expect(m.getAt(0, 3)).to.equal(1)
		expect(m.getAt(1, 0)).to.equal(0)
		expect(m.getAt(1, 1)).to.equal(1)
		expect(m.getAt(1, 2)).to.equal(-1)
		expect(m.getAt(1, 3)).to.equal(1)

		expect(v[0]).to.equal(0)  //  no fixed voltage
		// So I've got contacts using capital letters. Each position right now has its own letter ( could be M ). Wire up in derived class?
		// so an external class does this
		// contact filler? Swap.fieldInVarFloats.forEach

		setContactVoltages(Swap, v, [-5, -6, -7 /* something different for the test. Negative because then there is no conflict with the hardwired values */])  // 
		expect(v[0]).to.equal(-7)
		{ // we need the voltag both in the tuple for later read out, and now in v (like vector, not voltage) to get the charge density.
			const metal = Swap.fieldInVarFloats[0][0];
			expect(metal.Potential).to.equal(-7)
		}
		const M2 = new Tridiagonal(0) // split does not work in place because it may need space at the seam
		M2.row = m.row.map(r => r.split(1, m.row.length)) // this is ugly internal stuff. I guess I need in place before I can get new features.
		const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
		expect(potential[0]).to.equal(0) // 0 is for a cell which is metal and thus we look for the charge and not the potential!

		Swap.pullInSemiconductorVoltage(potential) // opposite of groupByKnowledge
		const metal = Swap.fieldInVarFloats[0][0];
		expect(metal.Potential).to.equal(-7)
		expect(metal.GetCarrier()).to.equal(0)  // global charge neutrality


		//m.AugmentMatrix_with_Unity()  // Now I wonder how this works with jaggies? Row.length ? And does it straigten out the jaggies?
		//expect(m.getAt(rn,rn+6)).to.equal(1)  //  the start of the other diagonal				
		//		expect(m.inverseRectangular()).to.throw()

		// inplace? // 20220218 "division by zero (matrix undefinite)"
		// expect(m.getAt(rn,rn)).to.approximately(1,0.001)		

		// expect(v[1]).to.equal(0)  //  no fixed voltage
		// expect(v[2]).to.equal(0)  //  no fixed voltage
	})
	it('i should float to the average m', () => {
		const Swap = new Field(contactsAverage)
		expect(Swap.flatLength).to.equal(3)

		const [v, m] = Swap.ShapeToSparseMatrix();
		expect(Swap.flatLength).to.equal(3)

		expect(m.getAt(0, 0)).to.equal(1)
		expect(m.getAt(0, 1)).to.equal(-1)
		expect(m.getAt(0, 2)).to.equal(0)

		const rn = Swap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(1)
		expect(m.getAt(rn, rn)).to.equal(2)  //  two sides
		// pull in (from the sides) is 1
		expect(m.getAt(rn, 0)).to.equal(-1) // sort by column would put off-diagonal elements on the rhs. This cannot be already sorted. So after augmenting?
		expect(m.getAt(rn, 2)).to.equal(-1) // no influence by bandgap, just mesh effect
		expect(Swap.fieldInVarFloats[0][0].RunningNumberOfJaggedArray).to.equal(0)
		// At 1 we expect the unknown charge swapped in. Still it just sits as 1 on the diagonal like before the swap
		// The magic happens at invers .. it is kinda routing
		// Now I understand that we need to sort, but the row  .. pull is 1 always anyway
		expect(Swap.fieldInVarFloats[0][2].RunningNumberOfJaggedArray).to.equal(2)

	//	m.negate() //todo: m*=-1 to move it to the same side as unity  // swapColumns or PullIn could do this two, but the negate woudl be burried in excel like code.
	// here it is clear from the quation that it will work.
	// With swap columns this is also clear, but leads to ugly code.
	// With pull .. thaaat code runs after inverse . No idea what the switched signs of the known values lead to


	// So we either have to scale the known vectors matrix each time we pull it over = , or we can do it with the unkonws.
	// In the second case .. inverse rectangular always solves for unity for the unknown. So we need to pull the known over = anyway. We just have twice the data access
	// Or we give inverse a paramter to solve for -1? But then the swap code has infiltrated the inverse calculation. 


		m.AugmentMatrix_with_Unity(-1) // without column swap: Adding of rows is independent of signs of whole columns. But with swap: A swap on one side of the equation is commutation, but accross the sides is equivalent transformation and changes the sign.
		// so it is a bit weird that  inverse  still creates a +1 unit matrix and thus further down we will have to correct that
		// Without column swaps -1 * -1 = +1  as if both matrices would have stayed on their side
		// swapped colums need to have their sign changes. I hope that I have choosen the most simple way for book keeping.
		expect(m.getAt(0, 3)).to.equal(-1)
		expect(m.getAt(0, 4)).to.equal(0)
		expect(m.getAt(0, 5)).to.equal(0)

		expect(Swap.flatLength).to.equal(3)
		expect(m.getAt(0, 3)).to.equal(-1) // sort by column would put off-diagonal elements on the rhs. This cannot be already sorted. So after augmenting?
		expect(m.getAt(1, 3)).to.equal(0)

		expect(Swap.flatLength).to.equal(3)
		console.log("Swap.flatLength " + Swap.flatLength)

		Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
		m.inverseRectangular() // bias voltage is not set, so inverse Matrix cannot deduce the cell voltage from charge distribution
		const M2=m.split() // uses Matrix.sign  // .row = m.row.map(r => r.split(1, m.row.length).scale(m.sign)) // -1 from unity?  this is ugly internal stuff. I guess I need in place before I can get new features.


		setContactVoltages(Swap, v, [-3, -5, -7 /* something different for the test. Negative because then there is no conflict with the hardwired values */])  // 
		expect(v[0]).to.equal(-7)
		expect(v[1]).to.equal(0)
		expect(v[2]).to.equal(-5)
		{ // we need the voltag both in the tuple for later read out, and now in v (like vector, not voltage) to get the charge density.
			const metal = Swap.fieldInVarFloats[0][0];
			expect(metal.Potential).to.equal(-7)
		}
		{ // we need the voltag both in the tuple for later read out, and now in v (like vector, not voltage) to get the charge density.
			const metal = Swap.fieldInVarFloats[0][2];
			expect(metal.Potential).to.equal(-5)
		}
		const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
/*
[
   -7,   0, -5,

  0.5, 0.5,-0.5,   |    [ -7,
 -0.5, 0.5,-0.5,   |      0,
 -0.5, 0.5, 0.5,   |      -5,
]
]
*/
		
		Swap.pullInSemiconductorVoltage(potential) // opposite of groupByKnowledge

		{
			const metal = Swap.fieldInVarFloats[0][0];
			expect(metal.Potential).to.equal(-7)
			expect(metal.GetCarrier()).to.equal(-1)
		}
		{
			const metal = Swap.fieldInVarFloats[0][1];
			expect(metal.Potential).to.equal(-6)
			expect(metal.GetCarrier()).to.equal(0)
		}
		{
			const metal = Swap.fieldInVarFloats[0][2];
			expect(metal.Potential).to.equal(-5)
			expect(metal.GetCarrier()).to.equal(+1)
		}


		/*		expect(m.getAt(0,0)).to.equal(1)
				expect(m.getAt(0,1)).to.equal(-1)		
				expect(m.getAt(0,2)).to.equal(0)
				expect(m.getAt(0,3)).to.equal(1)
				expect(m.getAt(0,4)).to.equal(0)
				expect(m.getAt(0,5)).to.equal(0)
		
		
				expect(Swap.flatLength).to.equal(3)
				expect(m.getAt(0,3)).to.equal(1)
				expect(m.getAt(1,3)).to.equal(0)
				expect(m.getAt(rn,0)).to.equal(-1) // why -1 ?
				expect(m.getAt(rn,2)).to.equal(0)
		
				expect(v[0]).to.equal(0)  //  no fixed voltage
		*/
		//m.AugmentMatrix_with_Unity()  // Now I wonder how this works with jaggies? Row.length ? And does it straigten out the jaggies?
		//expect(m.getAt(rn,rn+6)).to.equal(1)  //  the start of the other diagonal				
		//		expect(m.inverseRectangular()).to.throw()

		// inplace? // 20220218 "division by zero (matrix undefinite)"
		// expect(m.getAt(rn,rn)).to.approximately(1,0.001)		

		// expect(v[1]).to.equal(0)  //  no fixed voltage
		// expect(v[2]).to.equal(0)  //  no fixed voltage
	})
	it('should all float to the average2d m', () => {
		const Swap = new Field(contacts2d)
		const [v, m] = Swap.ShapeToSparseMatrix();
		const rn = Swap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(1)
		expect(m.getAt(rn, rn)).to.equal(3)  //   T junction
		expect(m.getAt(0, 0)).to.equal(2)  //   corner
		expect(v.length).to.equal(6)  //  to match matrix length
		let i = 0 // regression test
		expect(v[i++]).to.equal(0)  //  one pole  horizontally
		expect(v[i++]).to.equal(0) //  other pole  vertically
		expect(v[i++]).to.equal(0)  //  one pole  vertically
		expect(v[i++]).to.equal(0) //  other pole horizontally

		m.AugmentMatrix_with_Unity()  // Now I wonder how this works with jaggies? Row.length ? And does it straigten out the jaggies?
		Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
		m.inverseRectangular() // in place. Still wonder if I should provide a immutable version
		const M2 = new Tridiagonal(0) // split does not work in place because it may need space at the seam
		M2.row = m.row.map(r => r.split(1, m.row.length).scale(-1))

		setContactVoltages(Swap, v, [-3, -5, -7 /* something different for the test. Negative because then there is no conflict with the hardwired values */])  // 
		expect(v[0]).to.equal(-7)
		expect(v[1]).to.equal(0)
		expect(v[5]).to.equal(-5)
		{ // we need the voltag both in the tuple for later read out, and now in v (like vector, not voltage) to get the charge density.
			const metal = Swap.fieldInVarFloats[0][0];
			expect(metal.Potential).to.equal(-7)
		}
		{ // we need the voltag both in the tuple for later read out, and now in v (like vector, not voltage) to get the charge density.
			const metal = Swap.fieldInVarFloats[1][2];
			expect(metal.Potential).to.equal(-5)
		}

		const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
				
		Swap.pullInSemiconductorVoltage(potential) // opposite of groupByKnowledge

		// I cannot MAP letters here. That would be part of the wire layout.
		{
			const metal = Swap.fieldInVarFloats[0][0];
			expect(metal.Potential).to.equal(-7)
			expect(metal.GetCarrier()).to.above(-1)
		}
		{
			const metal = Swap.fieldInVarFloats[0][1];
			expect(metal.Potential).to.below(-6)
			expect(metal.GetCarrier()).to.equal(0)
		}
		{
			const metal = Swap.fieldInVarFloats[1][1];
			expect(metal.Potential).to.above(-6)
			expect(metal.GetCarrier()).to.equal(0)
		}
		{
			const metal = Swap.fieldInVarFloats[1][2];
			expect(metal.Potential).to.equal(-5)
			expect(metal.GetCarrier()).to.below(+1)
		}

	})
})
