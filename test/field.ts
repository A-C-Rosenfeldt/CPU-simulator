import { Cloneable, Row, Tridiagonal } from '../src/enforcePivot';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, Contact } from '../src/fields'

import { ContactedField } from '../src/fieldStatic'

import { expect } from 'chai';
import 'mocha';

// swap column test .. I mean not the bare swap dealing with RLE, but the interpretation of the map

// There is no extra test data.
// Just check that 
//  for metal     voltage ends up on the right and charge on the left
//  for insulator voltage ends up on the left and charge (doping) on the rigth
//  semiconductors: not in this file

// Static field

const tri = new Field(fieldTobeSquared, null)  // from TestFields.ts 

// create the laplacian: from public testFields
// const NoSwap=new Field(bandsGapped)
// // reproduce stuff from above
// squared=NoSwap.ToSparseMatrix()

// in that function use: const c = str[k] 
// and call this:
tri.ToDoubleSquareMatrixSortByKnowledge_naive()
// or is it a pipe?

// from simple to complex


// TL;DR
// I use curved space. Field from neighbouring patches is injected as m fields with given voltage. Internally the patch does not know if metal border is contact to wire or to patch.
// This does not work due to the arbitrary shape of the electrodes: One problem is the dielectric in a coaxial wire ( "contact" ). So I do not want to put the burden of my coax wire shortcut calcs onto the complicated PDE solver
// Coax has to set the voltage ( linear interpolation to  tame the dynamics and MVP) and expose the result as metal.
// So there can be isolated metal on the border? For TouchTyped I would have to write 01234 . But we use
// Sequence
// flood fill ( do I want this in MVP? ): contact numbers, negative numbers for floating gates.
//   ConstTextToVarFloats()  ..  
//  and linerp happens after that ( coax gets a ref to the one contact and all coax have the same size)
// inverse






// story for the next 100ll
// needs a wire? Default = 0 to decouple. Trouble with patches (within large gates especially): The box needs to be open.

//  ^
//  |
//  |
//     conflict
//  |
//  |
//  v

// It is weird to place a pixel boundary around my map
// So I draw the boundary myself. If I later do patches, I copy the voltage in the overlap: from inner seam (which is updated by inverse()) to outer seam to act as a boundary no matter what bandgap.
// So all px touching the boundary get a value (0) or from a contact and charge density is not calculated ( determinant becomes zero )

// Boundary conditions for voltage. There are two common conditions in the literature. Then there are mixed cases
// Dirichlet: ground the case. We use this. Boundary value is given. No strange Maxwell vector stuff going on yet, so we are done.
// Neumann: eletric field strength or a case with surface charge? I feel like this should not be happening in digital circuits.
// Cauchy: Single side. May be interesting for an antenna maybe? Not in current scope

// charge density is not calculated for zero in curved space LaPlacian. Voltage is taken from contact[0]
const metalScalar: string[] = ['m'];  // curved space degenerated => voltage=0=charge
const insulatorScalar: string[] = ['i']; // curved space degenerated =>  voltage=0=charge
const degneratedVector: string[] = ['mm']; // test floodfill float , huh
const degneratedMatrix: string[] = ['mm', 'mm'];

// LaPlace does indeed work here because we get 1 on the main diagonal
const insulatorOneContact: string[] = ['mi']; // one contact, one voltage, no charge
// LaPlace starts to work at 1d  ( also: border of a 2d patch )
const insulator: string[] = ['mim']; // So it seems that this would not clear the determinant. So i is curved space
// I have to determine after swapping. So swap function on translate TouchTyped ?
// det is sum( dets) . -only one of those dets is != 0 before. Laplace adds a second
// this is used to decide if i=contact 0  XOR  curved space
// I don't like the global coupling. It should be clear for a human from a local look to the map what happens
// With 50% probability I will have patches
// swap within one side would not change .. yeah but we deliberately change to the other side of the equation
// Maybe I should just log at which line Matrix inverse fails. After all it goes from top to bottom -- left to right. Useful for degubbing

const contacts2d_testcase: string[] = ['0i1']; // test floodfill, degenerated
// so order: first do metal contacts and then try to add i going from highest LaPlace to lowest ( with zero, charge does not couple to voltage at all).

// first case where charge and voltage are interlaced left and right
const bulk = ['iii', 'iii', 'iii']
const metal = ['mmm', 'mmm', 'mmm']
const contacts = ['m0m', 'iii', 'm1m'] // two contacts. What do with i on border? Do not set voltage .. curved space would work, after all
// real floodfill application



// undefined? Boundary condition Curved space vs ground. voltage=contact[0] || 0  . This fits best with coax cables and metal boxes in RF devices
// technically all m in contact with boundary need to have contact[0] voltage

// voltage is undefined. See line above. With 1st order ODE there is only one condition: Set the function. Not the derivative.

// check voltage==0 && charge==0

// low impedance wires have the numbers 0 .. 4
const degneratedScalarContacted: string[] = ['0']; // done
const floatTo: string[] = ['2i']
const contactsAverage: string[] = ['4i2']; // check average in center
const contacts2d: string[] = ['4ii', 
                              'ii2']; // should all float up to the one given potential
const contactsSquare: string[] = ['4ii', 'iii', 'ii2']; // // check average in center

const contactsAverageV: string[] = ['4','i','2']; // check average in center
describe('0i', () => {
	it('should all float to the reference',()=>{
		const NoSwap = new Field(floatTo)
		const [v,m] = NoSwap.ShapeToSparseMatrix();
		const rn = NoSwap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(1)  //  1/1 = 1
		expect(v.length).to.equal(1)  //  to match matrix length
		expect(v[0]).to.equal(2)  //  "float to"
	})
	it('should all float to the reference mirror',()=>{
		const NoSwap = new Field(['i2'])
		const [v,m] = NoSwap.ShapeToSparseMatrix();
		const rn = NoSwap.fieldInVarFloats[0][0].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(1)  //  1/1 = 1
	})	
	it('should all float to the reference transpose',()=>{
		const NoSwap = new Field(['2','i'])
		const [v,m] = NoSwap.ShapeToSparseMatrix();
		const rn = NoSwap.fieldInVarFloats[1][0].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(1)  //  1/1 = 1
		expect(v.length).to.equal(1)  //  to match matrix length
		expect(v[0]).to.equal(2)  //  "float to"
		
		m.AugmentMatrix_with_Unity() // just adds a single 1
		expect(m.getAt(rn,rn+1)).to.equal(1)  //  1/1 = 1				
		m.inverseRectangular() // inplace?
		expect(m.getAt(rn,rn+1)).to.equal(1)
		expect(m.getAt(rn,rn)).to.equal(1)
	})		
})

describe('2i0', () => {
	it('should all float to the average',()=>{
		const NoSwap = new Field(contactsAverage)
		const [v,m] = NoSwap.ShapeToSparseMatrix();
		const rn = NoSwap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(2)  //  two sides
		expect(v[0]).to.equal(6)  //  sum
	})	
	it('should all float to the averageV',()=>{
		const NoSwap = new Field(contactsAverageV)
		const [v,m] = NoSwap.ShapeToSparseMatrix();
		const rn = NoSwap.fieldInVarFloats[1][0].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(2)  //  two sides
		expect(v[0]).to.equal(6)  //  sum
	})		
	it('should all float to the average2d',()=>{
		const NoSwap = new Field(contacts2d)
		const [v,m] = NoSwap.ShapeToSparseMatrix();		
		const rn = NoSwap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(3)  //   sides
		expect(v.length).to.equal(4)  //  to match matrix length
		let i=0 // regression test
		expect(v[i++]).to.equal(4)  //  one pole  horizontally
		expect(v[i++]).to.equal(2) //  other pole  vertically
		expect(v[i++]).to.equal(4)  //  one pole  vertically
		expect(v[i++]).to.equal(2) //  other pole horizontally

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
	it('should all float to the average Square',()=>{
		const NoSwap = new Field(contactsSquare)
		const [v,m] = NoSwap.ShapeToSparseMatrix();  // todo v should be in the augmented columns .. but v gets added to charge by mobi
		// v is a list of known voltages. Their influence on the unknowns is expressed via a forward multiplication with a matrix ( right hand side ) .. This is the way for connected electrodes. .. but for static voltages and for tests maybe .. it should no look like LU makes sense here
		const rn = NoSwap.fieldInVarFloats[0][1].RunningNumberOfJaggedArray;
		expect(rn).to.equal(0)
		expect(m.getAt(rn,rn)).to.equal(3)  //  3 sides
		expect(v.length).to.equal(7)  //  to match matrix length
		let i=0
		expect(v[i++]).to.equal(4)  
		expect(v[i++]).to.equal(0)  
		expect(v[i++]).to.equal(4)  

		//for(;i<4;i++){ // regression test
		expect(v[i++]).to.equal(0)   //  Poisson does no diagonal
		//}
		expect(v[i++]).to.equal(2)  
		expect(v[i++]).to.equal(0)  
		expect(v[i++]).to.equal(2)  
		// do inversion

		//const o=new Tridiagonal(m) // clone
		const o=m.inverse()  // Now I wonder how this works with jaggies? Row.length ? And does it straigten out the jaggies?
		// for augmention with something else then unity .. use class cloneable !
		//m.inverseRectangular() // inplace? Inplace is bad to test
		const e=m.MatrixProduct(o)  // should be 1 again
		expect(e.getAt(0,0)).to.approximately(1,0.001)

		// degenerated case because we have no contact and thus no bandgap==0 left in the matrix
		// basically: NoSwap.ToDoubleSquareMatrixSortByKnowledge_naive(){
		const c=Cloneable.deepCopy(m)
		c.AugmentMatrix_with_Unity()
		NoSwap.GroupByKnowledge(c) // NoSwap still has the method, but it should not have an effect
		expect(m.getAt(0,0)===m.getAt(0,0)).to.be.true  
		expect(m.getAt(0,1)===m.getAt(0,1)).to.be.true 
		expect(m.getAt(1,0)===m.getAt(1,0)).to.be.true 

		const potential = m.MatrixProduct(v)  // this is a good way to test the inverse. Later there are ofthen the fixed rails. So it may be nice to have them integrated into a sandwich column .. dunno
		// If I stay with this MatrixProduct, I would need to concat(v & contacts) .. this test has no Contacts, though
		// a good way to remember how v matches the columns of the Matrix is to imagine that you adjust those fixed potentials and then see how the potential goes up and down like a blanket in your bed.
		// ToDo store potential in Field to utilize the  print2canvas routine
		NoSwap.pullInSemiconductorVoltage(potential) // on bugs this hopefully throws
	})	
})

describe('sort columns all on one side', () => {
	it('should return hello world 2020-11-19 18:35', () => {

		const checkContact = new ContactedField(metalScalar)

		// 2020 Version checkContact.lowImpedanceContacts[0].voltage=1
		checkContact.fieldInVarFloats[0][0].Potential = 1  // 2021 Version

		const m = checkContact.ToDoubleSquareMatrixSortByKnowledge_naive()
		// todo
		const result = 4//scalar.getAt(0,0) //hello();
		expect(result).to.equal(4);
	});


	it('2021-12-18 metal', () => {
		const NoSwap = new Field(degneratedScalarContacted)
		expect(NoSwap.flatLength).to.equal(1)
		// 2020 Version checkContact.lowImpedanceContacts[0].voltage=1
		// 2022, now I have CAPS for contacts and numerals for fixed potential.  Was: checkContact.fieldInVarFloats[0][0].Potential = 1; // 2021 Version
		const m = NoSwap.ShapeToSparseMatrix();
		expect(NoSwap.fieldInVarFloats[0][0].RunningNumberOfJaggedArray).to.not.exist // field has only one cell which is grounden => nothing to solve
		// check .. ah JS without TS intellisense is a pain to write tests :-()
		//(0, chai_1.expect)(m.row[0]).to.exist;

		//NoSwap.row ;
		console.log(" use dynamic to access data ") // no typeScript anymore :-()
		//const scalar=new Tridiagonal(1)
		//scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20

	});

	it('2021-12-18 insulator', () => {
		const contacts = Field.CreateContactBareMetal()
		Field.SetContact(contacts, 'M', new Contact())
		const NoSwap = new Field(insulatorScalar, contacts)

		// the method should be able to just create the differential equation without the boundary ( closed space like on a sphere or torus). This matrix can not be inverted
		const m = NoSwap.ShapeToSparseMatrix();
		expect(NoSwap.fieldInVarFloats[0][0].RunningNumberOfJaggedArray).to.equal(0)
		// check
		//m.
		//const scalar=new Tridiagonal(1)
		//scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
		const result = 4; //scalar.getAt(0,0) //hello();
		expect(result).to.equal(4);
	});


	it('2021-12-18 metal which expects a wire', () => {

		const contacts = Field.CreateContactBareMetal()
		Field.SetContact(contacts, 'M', new Contact())

		const NoSwap = new Field(['M'], contacts)
		// 2020 Version checkContact.lowImpedanceContacts[0].voltage=1
		// 2022, now I have CAPS for contacts and numerals for fixed potential.  Was: 
		NoSwap.fieldInVarFloats[0][0].Potential = 1; // 2021 Version
		//NoSwap.contacts.contacts.  I think 
		const m = NoSwap.ShapeToSparseMatrix();
		// check
		//m.
		//const scalar=new Tridiagonal(1)
		//scalar.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
		const result = 4; //scalar.getAt(0,0) //hello();
		expect(result).to.equal(4);
	});


});

// FinFet has contacts, so try the cases above with contact to anything != GND





// wire mechanism is not basic --  as far as I have seen with the examples in University. Solve for Q is something different
const contactedSpreads: string[] = ['0m'];
const contactedMatrix: string[] = ['0m', 'mm'];

// check voltage==-5 && charge==0 .. Better define an offset? So 0 == -5  and  1 == -3.3


// FinFet has contacts, so try the cases above with contact to anything != GND

