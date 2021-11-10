import { Tridiagonal, Span, Row, FromRaw } from './enforcePivot.js'
//import { Wire } from './wire'  // kind of hoisting. I need to criss cross import for parent-child  relation
import { SimpleImage } from './GL.js'
import './field/semiconductor.js'
import './field/metal.js'
import { Electron } from './field/semiconductor.js'

/*
read from 

larger area to read
than to write

conservation of charge

/*

So my newest concept is:
I cache the field of a dipole. Dipole because all my transistors are globally not charged?
Scrap that. So I just evaluate the field of a charged wire ( E = 1/r ) as an array.
I place my metal shape with opposite charge into this field, or ah who cares, so I use a square boundray,
and set the potential on it according to the wire potential.
So I place this U=homogenous metal object in there and calculate charge distribution.
These are the linear Poisson equations  collapsed over U => so it cannot be inverted for the time being.
Charge is on the other side of the equation. Or is it? No Charge is on the right side,
and only the sum (1) is on the left side ( and all the 0 for the dielectric space around the metal)
Now the matrix can be inverted again.
Collapsing n U -> 1 U
Shifting n Q -> to the right   and   add one row
Check!

How did I come to this? Ah right I have multiple objects. I have point charge carrier (wire) or an electrode.
The carrier moves or the electrode gets charged ( sum of all charges in transistor leads to stray field in the wires, yeah should be so, Lets look at the rails. Rails are supposed to have zero impedance! So of course there is input charge in a CMOS gate!)
Then there is a second electode nearby ( for the gating of the carriers).
The equation is like the one above, just on dielectric pixel has a Q=1
  recalc for moving Q .. or move metal (along surface)
  LU does not reuse results for pivot. Pivot is dominated by the dielectric. Real pivot is only needed in the range of collaped U and .. Q takes the place of the diagonal there.

  So Housten we are back at premature optimization. Out matrix does not need pivot.
  I do not need scary permutation matrices, I could also just do rows and columns in my order,
  by first only doing the dielectric and canceling any row that would touch metal (by clearing).
  So for the next inversion, I do reuse, reuse , ah I better check beforehand up to what point I want to reuse. 

How do I center? For carrier on metal: center on carrier.
For that I would calculate the halo around each carrier. On the border will be a discrepancy which iteratively will be solved ..
but wouldn't it be more sensible to collect all carrier fields on borders and the jump to the next border?
Yeah, her it comes:

If I do Direchlet boundary anyway, I can do blocks. I clear out complete blocks an recreate them using matrix multiplication.
So I use boundary of other blocks (closed interval) from last frame / last stepping?
If you think about it, doing Poisson single cell just applies this to a single cell.

So the boundary puts lots of U on the left side, on straight lines the outside potential just add up to the charge just inside.
So the boundary acts like a line of charge. I mean I estimate 50% duty area, so most cells will be charged.

Do I need electrode - electrode simulations? Probably not, though specs talk about C_{GS} and such.
But I can reuse the result quite efficiently.
While for carrier I need to recalc for every carrier position * electrode config,
here I only have elctrode config.
I have some more U callapsing ( and replacement by variable Q).

The funny thing is that I can cut my simulation result to a small block and it still makes sense.
Instead of the default simulation far of, I have the real boundary values in that state.

These "Green Function" ( not retarded, Maxwell and time is not in play yet )

 */



// Converts Maps to matrix



// Right now I am in 2d, and I use a grid (like minecraft), but I have seen coils without isotropie and that looked ugly.
class Position {
  [key: number]: number;
}

const stride = 6
function MyMap(pos: Position) {
  let cell = pos[0] * stride
}

class Mirror {
  // modify matrix to simulate a perfect mirror on the left (for FinFET and whenelt)
}

// there is iterative field caclutation
// E from last frame and div from this charge distribution


// 1) Charge Movement
// this charge distribution
// 0) boundary E (U) from last frame ( MVP.  Later maybe alternating: forward, backward )
// using last frame E: Residuum and the calculate Halo

// 0) On Metal: All U is the same -> put that into div calculation.  Also sum of div is given by number of charge carriers
// 1) charge movement ( into waveguide)

// I  would also like to get stuff squishy and add momentum like in navier stokes, but this doubles the state and thus comes after the MinimalViableProduct
// while kinematic is important for  hot electron  simulation ,  viscosity is somwhat meaningless. I don not even have the colors to visualize.

// So I do not undertand most of the matrix inversion stuff. I DO understand that I cannot fully invert a matrix, though my application is on the border of it.
// To be able to use out of the Box LU decomposition. Someone said a 10 000 matrix is okay. So in finite element space I can use tiles of 100x100
// Still I think I would go 16x32. With the 32 overlapping.
// If I do blocks I would need to define boundary conditions. Okay that is easy I just skip that one summand.

// Charge alone lets carriers occupy a 2d plane on both sides of a capacitor. From the side this looks ugly, thus I need pressure.


//                 n
// d2    P = delta E      //    =  poisson
// delta P =        E     // force
// P       =        U
// n                       // ideal gas equation


// If I do band diagonal

// In numerical recipies some vectors are multiplied with the inverse in one go
// The inverse is still calculated and returned. Vector on the go is not used for pivot but may be good on rounding errors


// Inverse caching
// So I have gates, selfgates, cathode, collector (see line 138: ex)
// So in 1d (totem pole) I have like 6 transition elements
// What about 2d ( wired or) ? I insert Y piece and keep all conections sufficiently separated?
//  Yeah that creates a cross with jaggy diagonals. <- not in MVP because I can use metal instead
var globalTime: number;

export class LinkIntoMatrix {
  RunningNumberOfJaggedArray: number;  // It is not only about he jaggies, but we skip metal cells held at staic potential
  // I don't need this to be here because it extends to all cells of the electrode. I helps to solve the U, Q distribution. I need to reference it in the next frame ( same row? ) and I need a link from connection to Matrix ah..
  //  RunningNumberOfDustributedElectrode: number=-1; // electrode: ( connectionCell | first cell found on scan ) has number > 0  ( because JaggedArray is set first and starts with 0)

}
export class Contact extends LinkIntoMatrix {
  x: number; y: number;  // bond wire landing position on the map
  RunningNumberOfWireU: number;
  
  // Dynamic contact has a first version of the ohmic Matrix code. Now I moved it closer to the "curved field" code to keep an eye on the invertablity of the matrix
  Q_lastFrame: number; // floating
  U_Bias: number; // Ohmic t
  // So if code is in Contact ( child of ~ ), it needs a link. Since clean code keeps parameters at a minimum, it is a field
  matrix: Tridiagonal; // I am not sure about this one. the matrix is shared by all contacts
}

export class Tupel extends LinkIntoMatrix {
  // coulomb / m³  or whatever. Same unit for both
  CarrierCount: number[]; // mobile. for 6502 nfets: all negative. But I need double buffer
  // Linked List which may come handy, but needs a fully debugged base simulator  .  Carrier: Electron ; // nullable ref .. linked List?
  Current: number[]; // for both directions (x,y)
  Doping: number;
  static bufferId: number = 0  // todo:  static is problematic when add maps / staggered update
  ChargeDensity = () => this.CarrierCount[Tupel.bufferId] + this.Doping;

// Potential = 0, Contact!=null ( after floodfill ) => Potential is stored in contact   .. or first scanned cell for float. Why again don't floats need a contact ah, I want easy map drawing.
  Potential: number;  // Voltage relative to ground .  
  BandGap: number; // Voltage. 0=metal. 1=Si. 3=SiO2
  Contact: Contact | number; // Do I like that this repeats the "LinkIntoMatrix"? Tupel owns Contact. No problem, as lifecycle is app lifecycle ( no frame or phase stuff ). A Wire could be an owner, but Wire is optional. Only Tupel is required, at least make sure it is the one first encountered on scan? No, still looking at possiblity to unite skins into one cell-based style.

  ToTexture(raw: Uint8Array, p: number) {
    raw[p + 3] = 255;
    raw[p + 0] = this.BandGap * 255 / 3;
    const chargeDensity = this.ChargeDensity();

    raw[p + (chargeDensity > 0 ? 1 : 2)] = Math.abs(chargeDensity);
    // todo voltage?
  }

  FromString(fixed: String) {

  }

  GetCarrier() {
    return this.CarrierCount[Tupel.bufferId];
  }

  AddCarrier(val: number, carrier: Electron=null) {
    this.CarrierCount[1 ^ Tupel.bufferId] = this.CarrierCount[Tupel.bufferId] + val;
    // carrier.next=this.Electron
    // this.Electron=carrier
  }

  SetCarrier(val:number) {
    this.CarrierCount[1 ^ Tupel.bufferId] = val; // for surface charge on metal electrodes
    // maybe free space optimzation, where close electrons interact via 1/r law. So I need infinitesimal math?   this.Carrier=null
  }
}

// Bandgap = 0 . Conflict with  ToTexture() above. View model vs real model?
export class Metal extends Tupel {

  // I think I don't use an index, but reuse floodfill every frame
  // contact: Contact;  // because the reverse link is as difficult
  floodedInEven: boolean; // double buffer

  ToTexture(raw: Uint8Array, p: number) {
    raw[p + 3] = 255;
    raw[p + 0] = 0; //this.BandGap*255/3;
    const chargeDensity = this.ChargeDensity();

    raw[p + 1] = (chargeDensity);
    raw[p + 2] = this.Potential;
  }
}

class Insulator extends Tupel {
  ToTexture(raw: Uint8Array, p: number) {
    raw[p + 3] = 255;
    raw[p + 0] = this.BandGap * 255 / 3;
    const chargeDensity = this.ChargeDensity();

    raw[p + (chargeDensity > 0 ? 1 : 2)] = Math.abs(chargeDensity);
  }
}

// import format, test GL
export class MapForField {
  touchTypedDescription: string[]
  maxStringLenght: number
  flatLength: number
  m_count: number
  // EG exampleField
  constructor(touchTypedDescription: string[], contacts: Contact[]=null) {
    this.maxStringLenght = Math.max.apply(null, touchTypedDescription.map(t => t.length))
    this.flatLength = touchTypedDescription.map(t => t.length).reduce((a, c) => a + c, 0)
    this.touchTypedDescription = touchTypedDescription
    // parse string and .. yeah really do not know if I should replace UTF-8 with JS typeInformation
    // Yes we should because I do not want to expose this to  Field2Matrix

    // for static electrodes. A test mode where each m gets a random value no matter the neighbours
    this.m_count = touchTypedDescription.map(t => (t.match(/M/g) || []).length).reduce((a, c) => a + c, 0); // global search for m.  maybe just for sanity checks
  }

  Print(): ImageData { //ToPicture   print=text vs picture?
    const iD = new ImageData(this.maxStringLenght, this.touchTypedDescription.length)
    // RGBA. This flat data structure resists all functional code
    // ~screen
    for (let pointer = 0; pointer < iD.data.length; pointer += 4) {
      iD.data.set([0, 25, 0, 255], pointer) // ~dark green 
    }

    this.touchTypedDescription.forEach((str, i) => {
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        const c = str[k]
        const bandgaps = new Map([['i', 2], ['-', 2], ['s', 1], ['m', 0]])
        iD.data.set([
          bandgaps.get(c) * 30,
          0,
          c === '-' ? 200 : 0], // charge density. Blue is so weak on my monitor
          ((i * this.maxStringLenght) + k) << 2)
      }
    })
    return iD;
  }

  PrintGl(): SimpleImage { //ToPicture   print=text vs picture?
    const pixel = new Uint8Array(4 * this.maxStringLenght * this.touchTypedDescription.length)
    // RGBA. This flat data structure resists all functional code
    // ~screen
    for (let i = 0; i < pixel.length;) {
      // bluescreen
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 32
    }

    this.touchTypedDescription.forEach((str, i) => {
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        const c = str[k]
        const bandgaps = new Map([['i', 2], ['-', 2], ['s', 1], ['m', 0]])
        let p = ((i * this.maxStringLenght) + k) << 2;

        //iD.data.set([
        pixel[p++] = bandgaps.get(c) * 50
        pixel[p++] = 0
        pixel[p++] = c === '-' ? 200 : 0; // charge density. Blue is so weak on my monitor
        pixel[p++] = 255
        //  ((i*this.maxStringLenght)+k)<<2)
        //}
      }

    })
    return { pixel: pixel, width: this.maxStringLenght, height: this.touchTypedDescription.length };
  }
}



export class FieldToDiagonal extends MapForField {
  fieldInVarFloats: Tupel[][] = []

  constructor(touchTypedDescription: string[], contacts: Contact[]=null) {
    super(touchTypedDescription, contacts); // ToDo: This parameter feedthrough came accidentally
    //this.fieldInVarFloats[0][0]=new Tupel()
    this.ConstTextToVarFloats();
  }

  // needed for contacts
  preprocessChar(char: string) {
    return char
  }

  contacts: Contact[]

  // need to store the electric field somewhere
  // Bandgap may stay in text? But this strange replacement function?
  ConstTextToVarFloats(): void { //ToPicture   print=text vs picture?
    // May be later: const pixel=new Float64Array(4*this.maxStringLenght * this.touchTypedDescription.length)

    this.touchTypedDescription.forEach((str, i) => {
      const row = new Array<Tupel>(str.length) //[]=[]
      // JS is strange still. I need index:      for (let c of str) 
      //const c = this.preprocessChar(str[k])  // static would feel weird if we are going to overwrite it

      const public_bandgap = new Map([['i', 2], ['-', 2], ['s', 1],  ['M', 0]])
      const forBlock=function(char:string):Tupel{
        const n=Number.parseFloat(char)
        if (Number.isNaN(n) ){
          if ('A' <= char && char <='Z'){ //.codePointAt(0) )
            tu=new Metal()
            tu.Contact = this.contacts[char.charCodeAt(0)] // Do I want an asciative array? Todo call virtual function. We do not have contacts yet
          }else{
            var tu = new Tupel()
            tu.BandGap=public_bandgap.get(char)            
          }
          tu.Doping = char === '-' ? 200 : 0 // charge density. Blue is so weak on my monitor
        }else{
          tu = new Metal();
          tu.Potential=n        }
        return tu
      }

      var k=0; // for(let k of str)  // I would need map()
      for (; k < str.length; k++) {
        row[k] = forBlock(str.charAt(k)); // str[k] works the same . Maybe destructure [...str] would be shorter?
      }

      // const bandgaps = new Map([['i', 2], ['-', 2], ['s', 1], ['m', 0], ['M', 0]])
      
      // const c = str.replace(/\d/, 'm')  // this is difficult code to read and in band.  this is potential. Not index into wire. Wire as bonding position instead
      // for (let k = 0; k < str.length; k++) {
      //   const tu = c[k] === str[k] ? new Tupel() : new Metal();

      //   tu.BandGap = bandgaps.get(c[k])
      //   if (tu instanceof Metal)
      //     tu.Potential = Number.parseFloat(str[k])  // field :  case: static electrode, random value for test, connected to wire
      //   else
      //     tu.Potential = 0 // random is not good for testing. I stick with this 
      //   tu.Doping = c === '-' ? 200 : 0 // charge density. Blue is so weak on my monitor

      //   const contactId = Number.parseInt(str[k])
      //   if (!Number.isNaN(contactId)) {
      //     (tu as Metal).Contact = this.contacts[contactId] // Todo call virtual function. We do not have contacts yet
      //   }

      //   row[k] = tu;
      // }
      
      this.fieldInVarFloats[i] = row;
    })
  }

  PrintGl(): SimpleImage { //ToPicture   print=text vs picture?
    const pixel = new Uint8Array(4 * this.maxStringLenght * this.touchTypedDescription.length)
    // RGBA. This flat data structure resists all functional code
    // ~screen
    for (let i = 0; i < pixel.length;) {
      // bluescreen
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 32 // partly transparent like on modern windows managers
    }

    // flatten
    this.fieldInVarFloats.forEach((str, i) => {
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        const c = str[k]
        let p = ((i * this.maxStringLenght) + k) << 2;

        //iD.data.set([
        pixel[p++] = c.BandGap  //bandgaps.get(c)*50
        pixel[p++] = c.Potential
        pixel[p++] = c.Doping // charge density. Blue is so weak on my monitor
        pixel[p++] = 255
        //  ((i*this.maxStringLenght)+k)<<2)
        //}
      }

    })
    return { pixel: pixel, width: this.maxStringLenght, height: this.touchTypedDescription.length };
  }

  // Code for testing! Only diagonal. ToDo: Find special cases code!
  // What about jaggies? Do if in inner loop? If beyong jaggy above || first line?
  ToDiagonalMatrix(): Tridiagonal {
    // Tridiagonal instead of:  call meander in FinFet
    // Field can be jagged array .. because of Java and the tupels and stuff. is possible. Boundary is boundaray
    // 
    const matrix = new Tridiagonal(this.flatLength) // number of rows. May need to grow, but no problem in sparse notation

    // flatten
    let p = 0
    // let ps=[p]  // Due to FinFet  triode Gate symmetry, asymmetric jaggies are a thing
    // let c=''
    for (let i = 0; i < this.fieldInVarFloats.length; i++) {
      const str = this.fieldInVarFloats[i]
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        const c = str[k]
        matrix.row[p] = Row.Single(p, c.BandGap) //new Row(a)//p, 0, [[], [ /* c.Potential // unsuited for testing*/], []])
        p++
      }
    }

    return matrix
  }

  // Poisson for bound ( and jagged ) array.
  // override ToDiagonalMatrix

  // So I am used to multiply like this: Matrix.Vector. So we have ( and I cannot help it ):
  //  Q =  DGL.U
  // later we invert for U
  // But if we skip Q ( we don't care for grounden electrodes), we also need to separate U befor inversion:
  //  Q =  DGL.U + DGL.u   // u meaning the boring u we already know. So we split the rows. Group by rows. But cen we do it already in this method?
  //  <=>  Q =  DGL.U + DGL.u   //  group by U vs u  and this before the matrix with its pitch
  ShapeToSparseMatrix(metalLiesOutside = false): Tridiagonal {
    // Tridiagonal instead of:  call meander in FinFet
    // Field can be jagged array .. because of Java and the tupels and stuff. is possible. Boundary is boundaray
    // 
    const matrix = new Tridiagonal(this.flatLength) // number of rows. May need to grow, but no problem in sparse notation
    const vector: Array<number> = []  // U vs u
    // flatten
    let i_mat = 0, i_mat_pre = 0, i_vec_pre = 0

    // pitch varies per field row on jagged, and even variies per cell with static
    // I feel like every cell in the field needs an index into the matrix ( -1 = null )
    let pitch = 0

    // let ps=[p]  // Due to FinFet  triode Gate symmetry, asymmetric jaggies are a thing
    // let c=''
    for (let i = 0, i_pre = 0; i < this.fieldInVarFloats.length; i++) {


      // indices for "down" refereces. I think, I can keep within this loop. Data access is a hard fact, separation of concern can be achieved by means of a callback
      for (; i_pre < Math.min(i + 2,this.fieldInVarFloats.length); i_pre++) {
        const str = this.fieldInVarFloats[i_pre]
        for (let k = 0; k <  str.length; k++) { // dupe
          if (typeof str[k].Contact === 'object') { // flood fill has to marked all cells belonging to that electrode/contact
            str[k].RunningNumberOfJaggedArray = i_mat_pre++  // production
            // so I want to sort by local first and by type ( electrode ) second, to get a mostly diagonal matrix
            const ccc=(str[k].Contact as Contact) ;
            if (ccc.x==k && ccc.y==i_pre){ // how do we 
              ccc.RunningNumberOfJaggedArray = i_mat_pre++ // This adds a row with last
              // this works because we add U and Q (from this cell). I only store one index because every entry is on the diagonal ( trace )
              // Q is here for metal anyway
              // U is here for the whole electrode  ()
              ccc.RunningNumberOfWireU=i_vec_pre++ // how do I store ref to known U of last frame? 
                // Now I wonder how access goes? MatrixMultiplication would usually go along a row and MAC the products.
                // But now it seems that we cannot pull the columns effectively?
              // the matrix on the rhs ( known ) is rectangular. We know the y ordinate needs to be the same as on lhs, but x is also needed to integrate with curved space and static electrodes
            }
          } else {
            str[k].RunningNumberOfJaggedArray = - i_vec_pre++ // test & tune ( in combination with doping )
            // todo: MAC on the vector
          }
        }
      }


      const str = this.fieldInVarFloats[i]

      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        // for push aka charge
        if (typeof str[k].Contact === 'object')  //  number means => simple test setup with given potential. Object means -> connected to wire with wave resistance
        {

          var cellPrecise_pitch = -1;
          this.fieldInVarFloats[i - 1][k]; // so i+1 is not possible, huh

          // aparently bottleneck like parameters or RLE do not make much sense, better leak absolute positions from the beginning
          // allocate max needed memory. Initialize with 0 
          // todo: set all to zero because we split into u and U after the partial DGL formulation
          let span = [-pitch, -1, str.length].map((global, l) => new Span<number>(3 - (Math.abs(1 - l) << 1), global + i_mat /* makes it square? */))

          //const c = str[k]

          //const build_h=new Span<number>(0,i_mat)

          // Laplace will source all fields. Only target is XOR ChargeDensity.
          //  Floating metal and all other bandgaps: I need this for all bandgaps. LAter:sort   if (c.BandGap === 0) {
          //  Metal 'M' vs 'm' held at potential: I don't need

          // Charge Carrier
          //else

          // Laplace 2d
          // boundary condition: voltage value  ( but I am not interested in charge)
          // I cannot read the definition of span.
          // So I guess there are wasted spans ( zero length )

          span[1].extends[1] = 0; //const proto:Span<number>[]=[[], [4], []]
          {
            // expand the diagonal
            if (k < str.length - 1) {
              span[1].extends[2] = -1 // Poisson equaton  // so this is in conflict with u vs U   //.push(-1)
              span[1].extends[1]++    // to accound for borders / dimensions on a high potential without a field
            } // new Row() eats 0 in extend   line 466: if (t!==0)   .. This is useful because all those integers will give us spurious zeroes on vector add. Lets use them. Also: Statistics 
            if (k > 0) {
              span[1].extends[0] = -1 //.unshift(-1)
              span[1].extends[1]++
            }

            // Jagged
            if (i > 0 && this.fieldInVarFloats[i - 1].length > k) {
              span[0].extends[0] = -1 //.push(-1)
              span[1].extends[1]++
            } else {
              // Todo: Check if new Row() discards untouched new Span() !   //  span[0].start = span[1].start //    //what was this? span[0]=span[1]
            }
            if (i + 1 < this.fieldInVarFloats.length && this.fieldInVarFloats[i + 1].length > k) {
              span[2].extends[0] = -1 //.push(-1)
              span[1].extends[1]++
            } else {
              // Todo: Check if new Row() discards untouched new Span() !   //  span[2].start = span[1].start + span[1].extends.length //span[2]=span[1]+proto[1].length-1  // Maybe I should allow starts out of bounds?
            }
          }


          // todo split into  lhs and rhs 
          // follow indices
          // duped code from above .. visitor pattern? (todo)
          //var index=[] //undefined,undefined] // value types cannot be null
          var accumulator = 0, center = 0
          const setCells: Array<Array<number>> = [[]] // This is not a map because I don't access randomly

          for (var di = 0; di < 2; di++)for (var dk = 0; dk < 2; dk++) {
            // rotation. Just guessed the values. I can read this easily
            const si = i - 0 + (di - dk)
            if (si >= 0 && si < this.fieldInVarFloats.length) {
              const str_pull = this.fieldInVarFloats[si]
              const sk = k - 1 + (di + dk)
              if (k >= 0 && k < str_pull.length) {
                const vec = str_pull[k];
                const i_vec = vec.RunningNumberOfJaggedArray
                if (i_vec < 0) {   // so negative indices point to the rhs ( vector )
                  // U -> u
                  vector[-i_vec] += span[si].extends[sk] * vec.Potential // default =0     //  For test I really need values, no reference to wire  // This is only run once on boot. So it only works with vec.Potential = const
                } else {
                  // fill the diagonal. Even after jaggies and discarded holes ( electrodes ), for inversion, the diagonal needs to collect all the ++
                  if (setCells[setCells.length - 1][0] < i_mat && i_mat < i_vec) {
                    center = setCells.length;
                    setCells.push([i_mat, accumulator]) // still need to accumulate the other half, but lets declare the structure in one go
                  }
                  setCells.push([i_vec, -1])


                  // let otherSide=di+dk & 2 
                  // span[si].extends[otherSide]=-1 //this hard to read code avoids overlapping spans
                  // span[si].start=i_vec  // i_vec is sorted / ordered  // Cells which don't exist

                }
                accumulator++//span[1].extends[1]++   // i_mat  not ordered .. two pass? .. or "accumulator reg"?
              }
            }
          }
          setCells[center][1] = accumulator
          matrix.row[i_mat++] = new Row(setCells)  // push pull
        }
      }

      pitch = str.length
      // with electrodes:

      // small array. Trying to get semantics correct
      // ps=ps.slice(0,1) 
      // ps.unshift(i_mat) 
    }

    return matrix
  }

}


export class Field extends FieldToDiagonal {
  ToDoubleSquareMatrixSortByKnowledge_naive(): Tridiagonal { // we would need to join rows : []{  //  for some reason I decided against Matric[] {

    this.CreateSides(); // known cells (for naive: metal) go into one group ( right hand side, =1), unknown (s and i) go into another (left hand side = 0 ) )
    // Now the shape on left hand side should have "holes"? Jagged is not enough to describe this .. Jagged is all I got for free from the programming language
    const m = this.ShapeToSparseMatrix() // Laplace operator   to  chargeDensity = LaPlace &* voltage

    // array: position in Matrix

    // type change. Due to RLE "trying to stick" we are not allowed to concat the matrices. Are we? Swap works generally as does RLE! Oh we do. So no influence due to the implemention detail "RLE"
    //const mr=
    Field.AugmentMatrix_with_Unity(m) // this should create two Matrices to be compatible with swap columns and MatrixMultiply  //  itself:   unity &* chargeDensity = LaPlace &* voltage
    //  itself:   0  =(unity |  LaPlace) &* ( voltage | chargeDensity )  // negate chargeDensity

    // shiftedOverlay uses Seamless[2]
    this.GroupByKnowledge(m)  // I still need the mapping to loop over and set random values ( with a given seed )
    // Okay not really. We not only don't solve for U at electrode cells, but also don't try to satisfy poisson there
    // So in reality we filter and we do it in Field and not in some Matrix code. Matrix inversion needs square matrix and it is already difficult enough to detect indefinite matrices ( where they coome from ) that I do not want LU stuff for fixed values which only happen in tests.
    // But the matrix columns are not swapped, but they are del

    // for extended electrode (not literal Potential) we now have U on the known side .. which is mostly true 
    // we compact the known site to a single U and sort it back onto the unkonw side?
    // Q is unknown. That Matrix stays almost square. We can clean rows and columns on the unknown site with a nonsquare matrix on the rhs.
    //  floodfill  - columns ->  add up cells inside each row belonging to the columns  ( right multiply a U spread matrix, which is not square)
    // How do I call floodfill from here. Import goes the other way.
    //   right multiply changes number of columns .. number of rows still match lhs

    // Why do my two cases ( float with fixed SUM(Q)  |   connected via R to an U) keep the Matrix square
    //  ( I can write this code because I test the rest with cell potential )
    // So fixed SUM(Q) = Q_{t-1}  ( steht das nicht schon irgendwo? ). Q is lhs an multiplies with unity so far.
    //   Now all the Q on lhs create a new Row and sum up to Q from last frame (+ Delta Q due to charge carriers). Still square because we are allowed to move U to unknown ( lhs )
    //    I will switch Q and U between the sides later anyway .. think: value/unit. So no Problem to have Q on the other side
    //     But is it square? It adds row and column on the right. It adds one row to the left hmm
    // With R:  Q_withCarriers +  ( U-U_connected ) / R  // this is the new row. It is even normal with Q on lhs and R on rhs
    //   Here also U moves over to lhs and makes our matrix square => invertable
    // The above method GroupByKnowledge() looks good. We just add our row, won't we?
    m.inverseRectangular
    var statics = [3, 4, 5] // this -> static value vector
    m.MatrixProduct(statics);

    // Todo
    //this.GroupByKnowledge(m): Swap two times to get back to U and Q
    // how do we get back the compact U .. also a second path? How do we skip the staticU cells? cell.RunningNumberOfJaggedArray! Each electrode needs a second RunningNumb

    // class Field looks into this.fieldInVarFloats[each].bandgap, if 0, the potential is know, else the charge density is known
    // Gaus Jordan is supposed to clear the unknown columns. At the same time, it fills the known columns
    // So why not already supply the known columns and avoid this  unmotivated  create new unity matrix in Gauss-Jordan?
    // To keep it generic and avoid book-keeping (debugging, demonstration/documentation), Field has to move its entries to left and right side. It can use this.fieldInVarFloats as an indirection to bind the vectors (field values)
    // It maybe cool, to have a add/sub work over a combined, rectangular matrix. Question: How do I organize spans? Just generallize spans[] ?    
    //throw "616 not implemented"
    return m // null
  }

  CreateSides() {
    // SortByKnowledge  does it all
    //  M.swapColumns(startsToSwap,dropColumn) 
  }

  ToDoubleSquareMatrixOnlyWhatIsNeeded_GroundedElectrodes(): Tridiagonal {
    const m = this.ShapeToSparseMatrix() // Laplace operator   to  chargeDensity = LaPlace &* voltage
    // type change. Due to RLE "trying to stick" we are not allowed to concat the matrices. Are we? Swap works generally as does RLE! Oh we do. So no influence due to the implemention detail "RLE"
    Field.AugmentMatrix_with_Unity(m)  //  itself:   unity &* chargeDensity = LaPlace &* voltage
    //  itself:   0  =(unity |  LaPlace) &* ( voltage | chargeDensity )  // negate chargeDensity
    this.GroupByKnowledge(m)  // depending on bandgap we know voltage or density. Once again we create an index

    // Maybe  CleanCode will kick in, until then I want Matlab notebook stuff in  main(). Also one of the reason for this exercise:  m.inverse

    // class Field looks into this.fieldInVarFloats[each].bandgap, if 0, the potential is know, else the charge density is known
    // Gaus Jordan is supposed to clear the unknown columns. At the same time, it fills the known columns
    // So why not already supply the known columns and avoid this  unmotivated  create new unity matrix in Gauss-Jordan?
    // To keep it generic and avoid book-keeping (debugging, demonstration/documentation), Field has to move its entries to left and right side. It can use this.fieldInVarFloats as an indirection to bind the vectors (field values)
    // It maybe cool, to have a add/sub work over a combined, rectangular matrix. Question: How do I organize spans? Just generallize spans[] ?    
    throw "639 not implemented"
    return null
  }

  // I want to make this function as general as possible because I haven't jet found an argument against this concept.
  // Maybe use helper class and polymorphism to remove collector?
  // Trouble is: the loops all look slightly different. Position of parameters is easy to read in the base classes. Code only covers 20 lines. Lots of interfaces to external API.
  // So this is for my internal formats ( field and matrix ). Should be possible to edit all interface to assimilate all adapter-code
  // This code is (ToDo )used by the following 3 methods.
  protected IterateOverAllCells<T>(f: (i_mat: Tupel, i: number, k: number) => T): Array<T> {
    const collector = new Array<T>(this.flatLength)
    let i_mat = 0
    for (let i = 0; i < this.fieldInVarFloats.length; i++) {
      const str = this.fieldInVarFloats[i]
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        // aparently bottleneck like parameters or RLE do not make much sense, better leak absolute positions from the beginning
        collector[i_mat++] = f(str[k], i, k) // as any as T  // ToDo   So I have to support both directions. Collector is part of the function?
        //f(str[k] /* reference type */, /* Todo: uuupsie. Vector is supposed to have value type elements */)
        //f(i_mat, i, k);
      }
    }
    return collector
  }

  // for testing. Pure function
  // motivation: for inversion the original matrix need to be augmented by a unity matrix. They need to be a single matrix to let run Row.sub, row.trim, field.swap transparently over both.
  public static AugmentMatrix_with_Unity(M: Tridiagonal) /* :Tridiagonal  ugly join needed */ {


    M.AugmentMatrix_with_Unity()
    return
    // Todo

    // const om:Row[] = M.row.map((r, i) => {
    //   //const s=new Span<number>(1,i)
    //   const or=new Row([[i,i+1]]);
    //   or.data=[[1]]
    //   return or
 
    // })
    // const other = new Tridiagonal(om)
    // return other;

//    const other = new Tridiagonal(M.row.length)
    const rows=M.row.forEach((r, i) => {
      r.data.push([1])
      const s = M.row.length + i
      r.starts.push(s)
      r.starts.push(s + 1)
    })
    // this would lead to joins  //  return other
  }

  // right now this only does swaps between two groups:{ (un-)known }
  // Doesn' make thing easier to code and hard to display data oriented debugging. better do it on the spans before sending to the constructor[trim]
  // public only for testing. ToDo: extract into external class .. okay not this stuff it is almost trivial. look into the matrix stuff maybe?
  // one reference in line 493
  private groupByKnowledge(m: Tupel, i: number, k: number): boolean {
    return m.BandGap === 0
    if (this.fieldInVarFloats[i][k].BandGap === 0) {

      // This code fails for "vertical" pitched spans with length > 1
      const m = this.M.row[this.i]
      const o = this.M.row.length >> 1
      const a = m.get(i)
      m.set(m.get(i + o), i)
      m.set(a, i + o)   // moved clear into set
    }
    //throw "not fully implementd"
    //return 0
  }

  // ToDo: Composition
  private M: Tridiagonal;
  private i: number;

  // Sort by knowledge may be a reason to use a single matrix and a zero vector on the other side of the equation
  // Depending on the number of (un) known  ( var  vs const )  columns ( at least in tests, maybe also in later applications),
  // the uhm aehm no .. not definite. Needs to be square and that comes from field interpretation
  public GroupByKnowledge(M: Tridiagonal, dropColumn = false) {
    // todo: static function?  this.M = M;

    M.row.forEach((r, i) => {
      this.i = i;
      const passedThrough: Array<boolean> = this.IterateOverAllCells<boolean>(this.groupByKnowledge)
      // parameter in field is boolean, but for the algorithm I tried to adapt to starts[] to reduce the lines of critical code
      const startsToSwap = new Array<number>()
      passedThrough.reduce((a, b, i) => {
        if (a !== b) {
          startsToSwap.push(i) // should not be that many
        }
        return b // lame, I know. Side-effects are just easier 
      }, false)
      // First, lets check if really necessary: if (passedThroughstartsToSwap.push(i) // should not be that many
      M.swapColumns(startsToSwap, dropColumn)  // so this works on two matrices, right? Starts to swap tells us which field cells just keep their value ( in case of dropColumn)
    })
  }

  private knownItemsOnly(m, i, k): number {
    return 0
  }

  // Since matrix multiplication is always more expensive (squared) then the vector stuff, and for tests, vectors are value type, and binding is done by copy in field
  KnownItemsOnly(): Array<number> {
    //FieldCoordsToIndexIntoVector
    //this.fieldInVarFloats.map(f => f.)
    this.IterateOverAllCells(this.knownItemsOnly)
    throw "not fully implemented"
    return null
  }

  FromUnknownItems(linalg: Array<number>) {
    throw "not fully implemented"
    return null
  }

  bufferId = 0; // like field in video. Used to double buffer the carriers instead of doing interlaced.

  // I feel like there already needs to be some code. For example:  fieldStatic.ts/

}



// this example is later cut and refused (as in fuse, to weld) as needed
// ToDo: The number does not make any sense anymore
// ToDo: Multiline String by join('') ? To keep indention!
// What does the number mean?
export const exampleField: string[] = [
  // connected m  . Connected to wire with impedance=50
  ['S', 1, 'mmmmmmm'], // simple boundary condition
  [4, 'ssssssm'], // contact
  [3, 'sssiii'],  // we assume homognous electric field between plates (the side walls of the gates)
  [4, 'sssi-im'], // gate
  [3, 'sssiii'], // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part
  [1, 'sssmmmm'], // self gate = Faraday
  [3, 'sssi-im'], // self gate
  [3, 'sssiiii'],
  [1, 'mmmmmmm'], // simple boundary condition
].map(whatDoesNumberMean => whatDoesNumberMean.slice(-1)[0] as string);

export const fieldTobeSquared: string[] = [
  // connected m  . Connected to wire with impedance=50
  'sssm', // contact
  'siii',  // we assume homognous electric field between plates (the side walls of the gates)
  'i-im', // gate
  'sssi', // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part
];

export const bandsGapped: string[] = [
  // connected m  . Connected to wire with impedance=50
  'sssi', // contact
  'siii',  // we assume homognous electric field between plates (the side walls of the gates)
  'i-is', // gate
  'sssi', // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part
];

export const arena: string[] = [
  'mmmm', // contact
  'miim',  // we assume homognous electric field between plates (the side walls of the gates)
  'miim', // gate
  'mmmm', // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part 
];

export const arenaVerbatim: string[] = [
  '00000', // contact
  '0iii0',  // we assume homognous electric field between plates (the side walls of the gates)
  '0i1i0', // gate
  '0iii0', // gate
  '00000', // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part 
];

var html = `
  <div>
    <span>Some HTML here</span>
  </div>
`;

// Some gates are connected to the silicon slab => current flowing
const gate = new Field(['ex'], []); // So "m" is the inhomogenous part

const instance = 'CGCFC'; // the ends are implicit
