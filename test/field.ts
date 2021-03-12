import { Row } from '../public/enforcePivot.js';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped } from '../public/fields.js'
import { main } from '../public/GL.js';
import { ContactedField } from '../public/fieldStatic'

// swap column test .. I mean not the bare swap dealing with RLE, but the interpretation of the map

// There is no extra test data.
// Just check that 
//  for metal     voltage ends up on the right and charge on the left
//  for insulator voltage ends up on the left and charge (doping) on the rigth
//  semiconductors: not in this file

// Static field

const tri=new Field(fieldTobeSquared)  // from TestFields.ts 

// create the laplacian: from public testFields
// const NoSwap=new Field(bandsGapped)
// // reproduce stuff from above
// squared=NoSwap.ToSparseMatrix()

// in that function use: const c = str[k] 
// and call this:
tri.SortByKnowledge()
// or is it a pipe?

// from simple to complex


// TL;DR
// I use curved space. Field from neighbouring patches is injected as m fields with given voltage. Internally the patch does not know if metal border is contact to wire or to patch.
// One problem is the dielectric in a coaxial wire ( "contact" ). So I do not want to put the burden of my coax wire shortcut calcs onto the complicated PDE solver
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
const metalScalar:string[]=['m'];
const insulatorScalar:string[]=['i'];
const degneratedVector:string[]=['mm'];
const degneratedMatrix:string[]=['mm','mm'];

// LaPlace does indeed work here because we get 1 on the main diagonal
const insulatorOneContact:string[]=['mi']; // one contact, one voltage, no charge
// LaPlace starts to work at 1d  ( also: border of a 2d patch )
const insulator:string[]=['mim']; // So it seems that this would not clear the determinant. So i is curved space
// I have to determine after swapping. So swap function on translate TouchTyped ?
// det is sum( dets) . -only one of those dets is != 0 before. Laplace adds a second
// this is used to decide if i=contact 0  XOR  curved space
// I don't like the global coupling. It should be clear for a human from a local look to the map what happens
// With 50% probability I will have patches
// swap within one side would not change .. yeah but we deliberately change to the other side of the equation

const contacts2d_testcase:string[]=['0i1'];
// so order: first do metal contacts and then try to add i going from highest LaPlace to lowest ( with zero, charge does not couple to voltage at all).

 // first case where charge and voltage are interlaced left and right
const bulk=['iii','iii','iii']
const metal=['mmm','mmm','mmm']
const contacts=['mmm','iii','mmm'] // two contacts. What do with i on border? Do not set voltage .. curved space would work, after all


// undefined? Boundary condition Curved space vs ground. voltage=contact[0] || 0  . This fits best with coax cables and metal boxes in RF devices
// technically all m in contact with boundary need to have contact[0] voltage

// voltage is undefined. See line above. With 1st order ODE there is only one condition: Set the function. Not the derivative.

// check voltage==0 && charge==0

const checkContact=new ContactedField(metalScalar)

checkContact.lowImpedanceContacts[0].voltage=3.3

// FinFet has contacts, so try the cases above with contact to anything != GND



// low impedance wires have the numbers 0 .. 4
const degneratedScalarContacted:string[]=['0'];
const contactedSpreads:string[]=['0m'];
const contactedMatrix:string[]=['0m','mm'];

// check voltage==-5 && charge==0 .. Better define an offset? So 0 == -5  and  1 == -3.3


// FinFet has contacts, so try the cases above with contact to anything != GND

const contactsAverage:string[]=['0i1']; // check average in center
const contacts2d:string[]=['0ii','ii1'];
const contactsSquare:string[]=['0ii','iii','ii1']; // // check average in center
