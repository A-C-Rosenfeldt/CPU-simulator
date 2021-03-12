import {Tridiagonal, Span, Row, FromRaw} from './enforcePivot.js'
import {Wire} from './wire.js'  // kind of hoisting. I need to criss cross import for parent-child  relation
import {SimpleImage} from './GL'
import './field/semiconductor.js'
import './field/metal.js'

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
class Position{
  [key:number]:number ;
}

const stride=6
function MyMap( pos:Position){
  let cell=pos[0]*stride
}

class Mirror{
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
var globalTime:number;



class /*SemiconductorMetal*/ Contact {
  matrix:Tridiagonal; // the matrix is shared by all contacts
  column:number[]; // dated maybe? A column full of contacts? But I only have sparse contacts and be have two in complex gates
  /*
  contacts lead to shielded wires. So the differential equation needs to exhbit the impedance: 
    Current flows => voltage appears  .. 
  // .. relative to the voltage in the cable. This voltage is the sum of the forward and backwards signal 
     (I will use voltage for it => no sign change on the end).
  // When the differential equation is solved, this will be the case. 
     Shielded wires act as resistors to the voltage comming in (both sides). Current comes in from both sides.
  // This would have to be modelled like 2 times the voltage as a source and then a resistor connected 
     to the semiconductor (to get absolute and differential voltage right).
  // termination at the end is made by means of transistors. 
  */
  Flow(voltageInSemi : number){ // flow into the node

    var voltages=this.wire.getVoltage(this.wirePos);

    // ODE
    var currentIntoSemi=voltages.map(v => v-voltageInSemi /* /R */ );

    // After solution of local voltage and current: Set outgoing signals on each side.
    // Since the wire uses a rotating pointer into a fixed array, we need to update the values
    // Otherwise the signal would just pass through us.
    this.wire.setCurrent(this.wirePos,currentIntoSemi); // Todo: Wire is connected via R (parallel R made of both directions). So: set current in Flow step, get voltage in Field step

    // equation from above as matrix. Square to be invertable
    const R=//[
      //,[,],
      [-1/* new col only  */,+1 /*new col and row*/] // we only add I to the homognous side.
    //];
    //this.matrix.row.push(new Row(this.matrix.row.length,0,[[],R,[]])); //V
    // new interface to Row
    const a=new Array<Span<number>>(3)
    a[0]=new Span<number>(0,0)
    a[1]=FromRaw<number>(-1,+1)//R)
    a[2]=new Span<number>(0,0)
    this.matrix.row.push(new Row(a));

    //matrix.appendOnDiagonal(R); //I
    const VoltageInWire=3;
    this.column.concat(R.map(r=>VoltageInWire*r) /*, 2 ???]*/);
  }
 // static properties

 // this is added to the matrix (not the map)
 OdeInhomogenous: number = 3; // Voltage in cable
 Ode__homogenous: number = 50; // Impedance
  

 // owned by FinFet
  wire: Wire; // ref to. Hmm who owns a wire?
  wirePos: number; // we just store the position on the wire also her

  semiPos: number;
  //fromVss: number; // length=2
  
  // dynamic variables -- these need to be solved by the matrix inverter. All currents are calculated within
 // voltages: number[]; // Signals coming from both sides
  //currents: number[]; // The solution is quite simple: A passing current going through the wire and the current coming from the semiconductor split between two equal resistors in parallel.



}


class Tupel{
    // coulomb / m³  or whatever. Same unit for both
    Carrier : number[]; // for 6502 nfets: all negative. But I need double buffer
    Current: number[]; // for both directions (x,y)
    Doping : number;
    static bufferId:number=0
    ChargeDensity=() => this.Carrier[Tupel.bufferId] + this.Doping;

    Potential: number;  // Voltage relative to ground
    BandGap: number; // Voltage. 0=metal. 1=Si. 3=SiO2
    
    RunningNumberOfJaggedArray: number;

    ToTexture(raw : Uint8Array, p:number )
    {
        raw[p+3]=255;
        raw[p+0]=this.BandGap*255/3;
        const chargeDensity=this.ChargeDensity();
        
        raw[p+(chargeDensity>0?1:2)]=Math.abs(chargeDensity);
        // todo voltage?
    }
    
    FromString(fixed: String)
    {

    }

    GetCarrier(){
      return this.Carrier[Tupel.bufferId];
    }

    AddCarrier(val:number){
      this.Carrier[1^Tupel.bufferId]=this.Carrier[Tupel.bufferId]+val;
    }

    SetCarrier(val:number){
      this.Carrier[1^Tupel.bufferId]=val;
    }
}

// Bandgap = 0 . Conflict with  ToTexture() above. View model vs real model?
class Metal extends Tupel {
  contact:Contact;
  ToTexture(raw : Uint8Array, p:number )
  {
      raw[p+3]=255;
      raw[p+0]=0; //this.BandGap*255/3;
      const chargeDensity=this.ChargeDensity();
      
      raw[p+1]=(chargeDensity);
      raw[p+2]=this.Potential;
  }
}

class Insulator extends Tupel {
  ToTexture(raw : Uint8Array, p:number )
  {
      raw[p+3]=255;
      raw[p+0]=this.BandGap*255/3;
      const chargeDensity=this.ChargeDensity();
      
      raw[p+(chargeDensity>0?1:2)]=Math.abs(chargeDensity);
  }
}

// import format, test GL
export class MapForField{
  touchTypedDescription:string[]
  maxStringLenght:number
  flatLength:number
  // EG exampleField
  constructor(touchTypedDescription:string[]){
    this.maxStringLenght=Math.max.apply(null, touchTypedDescription.map(t=>t.length))
    this.flatLength=touchTypedDescription.map(t=>t.length).reduce((a,c)=>a+c,0)
    this.touchTypedDescription=touchTypedDescription
    // parse string and .. yeah really do not know if I should replace UTF-8 with JS typeInformation
    // Yes we should because I do not want to expose this to  Field2Matrix
  }

  Print( ):ImageData{ //ToPicture   print=text vs picture?
    const iD=new ImageData(this.maxStringLenght, this.touchTypedDescription.length)
    // RGBA. This flat data structure resists all functional code
    // ~screen
    for(let pointer=0;pointer<iD.data.length;pointer+=4){
        iD.data.set([0,25,0,255],pointer) // ~dark green 
    }

    this.touchTypedDescription.forEach((str,i)=>{
      // JS is strange still. I need index:      for (let c of str) 
      for(let k=0;k<str.length;k++)
      {
        const c=str[k]
        const bandgaps=new Map([['i',2],['-',2],['s',1],['m',0]])
        iD.data.set([
            bandgaps.get(c)*30,
            0,
            c==='-'?200:0], // charge density. Blue is so weak on my monitor
            ((i*this.maxStringLenght)+k)<<2)
        }
    })
    return iD;
  }

  PrintGl( ):SimpleImage{ //ToPicture   print=text vs picture?
    const pixel=new Uint8Array(4*this.maxStringLenght * this.touchTypedDescription.length)
    // RGBA. This flat data structure resists all functional code
    // ~screen
    for(let i=0;i<pixel.length;){
      // bluescreen
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 32
    }

    this.touchTypedDescription.forEach((str,i)=>{
      // JS is strange still. I need index:      for (let c of str) 
      for(let k=0;k<str.length;k++)
      {
        const c=str[k]
        const bandgaps=new Map([['i',2],['-',2],['s',1],['m',0]])
        let p=((i*this.maxStringLenght)+k)<<2;

        //iD.data.set([
          pixel[p++]=bandgaps.get(c)*50
          pixel[p++]=0
          pixel[p++]=  c==='-'?200:0; // charge density. Blue is so weak on my monitor
          pixel[p++] = 255
          //  ((i*this.maxStringLenght)+k)<<2)
        //}
    }
   
  })
  return {pixel:pixel,width:this.maxStringLenght, height:this.touchTypedDescription.length}; 
  }
}



export class FieldToDiagonal extends MapForField {
  fieldInVarFloats: Tupel[][] = []

  constructor(touchTypedDescription: string[]) {
    super(touchTypedDescription);
    //this.fieldInVarFloats[0][0]=new Tupel()
    this.ConstTextToVarFloats();
  }

  // needed for contacts
  preprocessChar(char: string) {
    return char
  }

  // need to store the electric field somewhere
  // Bandgap may stay in text? But this strange replacement function?
  ConstTextToVarFloats(): void { //ToPicture   print=text vs picture?
    // May be later: const pixel=new Float64Array(4*this.maxStringLenght * this.touchTypedDescription.length)

    this.touchTypedDescription.forEach((str, i) => {
      const row = new Array<Tupel>(str.length) //[]=[]
      // JS is strange still. I need index:      for (let c of str) 
      const c= str.replace(/\d/,'m')
      for (let k = 0; k < str.length; k++) {
        //const c = this.preprocessChar(str[k])  // static would feel weird if we are going to overwrite it
        const bandgaps = new Map([['i', 2], ['-', 2], ['s', 1], ['m', 0]])

        const tu = c[k] === str[k] ? new Tupel(): new Metal();

        tu.BandGap = bandgaps.get(c[k])
        tu.Potential = 0  // field
        tu.Doping = c === '-' ? 200 : 0 // charge density. Blue is so weak on my monitor

        const contact=Number.parseInt(str[k])
        if (! Number.isNaN(contact)){
          (tu as Metal).contact=this.lowimpedanceContacts // Todo call virtual function. We do not have contacts yet
        }

        row[k] = tu;
      }
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

  // override ToDiagonalMatrix
  ToSparseMatrix(): Tridiagonal {
    // Tridiagonal instead of:  call meander in FinFet
    // Field can be jagged array .. because of Java and the tupels and stuff. is possible. Boundary is boundaray
    // 
    const matrix = new Tridiagonal(this.flatLength) // number of rows. May need to grow, but no problem in sparse notation

    // flatten
    let i_mat = 0
    let pitch = 0
    // let ps=[p]  // Due to FinFet  triode Gate symmetry, asymmetric jaggies are a thing
    // let c=''
    for (let i = 0; i < this.fieldInVarFloats.length; i++) {
      const str = this.fieldInVarFloats[i]
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        // aparently bottleneck like parameters or RLE do not make much sense, better leak absolute positions from the beginning
        // allocate max needed memory. Initialize with 0 
        let span = [-pitch, -1, str.length].map((global, l) => new Span<number>(3 - (Math.abs(1 - l) << 1), global + i_mat))

        //const c = str[k]

        span[1].extends[1] = 0; //const proto:Span<number>[]=[[], [4], []]
        //const build_h=new Span<number>(0,i_mat)

        // Laplace will source all fields. Only target is XOR ChargeDensity.
        // I need this for all bandgaps. LAter:sort   if (c.BandGap === 0) {
        // Charge Carrier
        //else
        {
          // Laplace 2d
          // boundary condition: voltage value  ( but I am not interested in charge)
          {
            if (k < str.length - 1) {
              span[1].extends[2] = -1 //.push(-1)
              span[1].extends[1]++
            }
            if (k > 0) {
              span[1].extends[0] = -1 //.unshift(-1)
              span[1].extends[1]++
            }

            // Jagged
            if (i > 0 && this.fieldInVarFloats[i - 1].length > k) {
              span[0].extends[0] = -1 //.push(-1)
              span[1].extends[1]++
            } else {
              span[0].start = span[1].start //what was this? span[0]=span[1]
            }
            if (i + 1 < this.fieldInVarFloats.length && this.fieldInVarFloats[i + 1].length > k) {
              span[2].extends[0] = -1 //.push(-1)
              span[1].extends[1]++
            } else {
              span[2].start = span[1].start + span[1].extends.length //span[2]=span[1]+proto[1].length-1  // Maybe I should allow starts out of bounds?
            }
          }
        }
        matrix.row[i_mat] = new Row(span) // does 0 trim anyway. It is a constant battle to fight for intuitive sparse matrix
        this.fieldInVarFloats[i][k].RunningNumberOfJaggedArray = i_mat++
      }

      pitch = str.length
      // small array. Trying to get semantics correct
      // ps=ps.slice(0,1) 
      // ps.unshift(i_mat) 
    }

    return matrix
  }

}


export class Field extends FieldToDiagonal {
  ToDoubleSquareMatrixSortByKnowledge(): Tridiagonal[]{
    const m=this.ToSparseMatrix() // Laplace operator   to  chargeDensity = LaPlace &* voltage
    // type change. Due to RLE "trying to stick" we are not allowed to concat the matrices. Are we? Swap works generally as does RLE! Oh we do. So no influence due to the implemention detail "RLE"
    Field.AugmentMatrix(m)  //  itself:   unity &* chargeDensity = LaPlace &* voltage
                            //  itself:   0  =(unity |  LaPlace) &* ( voltage | chargeDensity )  // negate chargeDensity
    this.SortByKnowledge(m)  // depending on bandgap we know voltage or density. Once again we create an index
    
    m.inverse

    // class Field looks into this.fieldInVarFloats[each].bandgap, if 0, the potential is know, else the charge density is known
    // Gaus Jordan is supposed to clear the unknown columns. At the same time, it fills the known columns
    // So why not already supply the known columns and avoid this  unmotivated  create new unity matrix in Gauss-Jordan?
    // To keep it generic and avoid book-keeping (debugging, demonstration/documentation), Field has to move its entries to left and right side. It can use this.fieldInVarFloats as an indirection to bind the vectors (field values)
    // It maybe cool, to have a add/sub work over a combined, rectangular matrix. Question: How do I organize spans? Just generallize spans[] ?    
    throw "not implemented"
    return null
  }

  // I want to make this function as general as possible because I haven't jet found an argument against this concept.
  // Maybe use helper class and polymorphism to remove collector?
  // Trouble is: the loops all look slightly different. Position of parameters is easy to read in the base classes. Code only covers 20 lines. Lots of interfaces to external API.
  // So this is for my internal formats ( field and matrix ). Should be possible to edit all interface to assimilate all adapter-code
  // This code is (ToDo )used by the following 3 methods.
  protected IterateOverAllCells<T>(f: (i_mat:Tupel, i: number, k: number) => T ) : Array<T> {
    const collector= new Array<T>(this.flatLength)
    let i_mat = 0
    for (let i = 0; i < this.fieldInVarFloats.length; i++) {
      const str = this.fieldInVarFloats[i]
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        // aparently bottleneck like parameters or RLE do not make much sense, better leak absolute positions from the beginning
        collector[i_mat++] = f(str[k],i,k) // as any as T  // ToDo   So I have to support both directions. Collector is part of the function?
        //f(str[k] /* reference type */, /* Todo: uuupsie. Vector is supposed to have value type elements */)
        //f(i_mat, i, k);
      }
    }
    return collector
  }

  // for testing. Pure function
  // motivation: for inversion the original matrix need to be augmented by a unity matrix. They need to be a single matrix to let run Row.sub, row.trim, field.swap transparently over both.
  public static AugmentMatrix(M:Tridiagonal){
    M.row.forEach((r,i)=>{
      r.data.push([1])
      const s=M.row.length+i
      r.starts.push(s)
      r.starts.push(s+1)
    })
  }

  // right now this only does swaps between two groups:{ (un-)known }
  // Doesn' make thing easier to code and hard to display data oriented debugging. better do it on the spans before sending to the constructor[trim]
  // public only for testing. ToDo: extract into external class .. okay not this stuff it is almost trivial. look into the matrix stuff maybe?
  // one reference in line 493
  private groupByKnowledge(m:Tupel,i:number,k:number):boolean{
    return m.BandGap===0 
    if (this.fieldInVarFloats[i][k].BandGap===0){

      // This code fails for "vertical" pitched spans with length > 1
      const m=this.M.row[this.i]
      const o=this.M.row.length>>1
      const a=m.get(i)
      m.set(m.get(i+o),i)
      m.set(a,i+o)   // moved clear into set
    }
    //throw "not fully implementd"
    //return 0
  }

  // ToDo: Composition
  private M:Tridiagonal;
  private i:number;

  public SortByKnowledge(M:Tridiagonal){
    this.M=M;

    M.row.forEach((r,i)=>{
      this.i=i;
      const passedThrough:Array<boolean>=this.IterateOverAllCells<boolean>(this.groupByKnowledge)
      // parameter in field is boolean, but for the algorithm I tried to adapt to starts[] to reduce the lines of critical code
      const startsToSwap=new Array<number>()
      passedThrough.reduce((a,b,i)=>{
        if (a !== b){
          startsToSwap.push(i) // should not be that many
        }
        return b // lame, I know. Side-effects are just easier 
      },false)
      // First, lets check if really necessary: if (passedThroughstartsToSwap.push(i) // should not be that many
      M.swapColumns(startsToSwap)
    })
  }

  private knownItemsOnly(m,i,k):number{
    return 0
  }

  // Since matrix multiplication is always more expensive (squared) then the vector stuff, and for tests, vectors are value type, and binding is done by copy in field
  KnownItemsOnly(): Array<number>{
    //FieldCoordsToIndexIntoVector
    //this.fieldInVarFloats.map(f => f.)
    this.IterateOverAllCells(this.knownItemsOnly )
    throw "not fully implemented"
    return null
  }

  FromUnknownItems(linalg :Array<number>){
    throw "not fully implemented"
    return null
  }



  bufferId=0; // like field in interlaced video. Used to double buffer the carriers
}

// this example is later cut and refused (as in fuse, to weld) as needed
// ToDo: The number does not make any sense anymore
// ToDo: Multiline String by join('') ? To keep indention!
// What does the number mean?
export const exampleField:string[]=[
   // connected m  . Connected to wire with impedance=50
  ['S',1,'mmmmmmm'], // simple boundary condition
  [    4,'ssssssm'], // contact
  [3,'sssiii'],  // we assume homognous electric field between plates (the side walls of the gates)
  [4,'sssi-im'], // gate
  [3,'sssiii'], // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part
  [1,'sssmmmm'], // self gate = Faraday
  [3,'sssi-im'], // self gate
  [3,'sssiiii'],
  [1,'mmmmmmm'], // simple boundary condition
].map(whatDoesNumberMean=>whatDoesNumberMean.slice(-1)[0] as string);

export const fieldTobeSquared:string[]=[
  // connected m  . Connected to wire with impedance=50
 'sssm', // contact
 'siii',  // we assume homognous electric field between plates (the side walls of the gates)
 'i-im', // gate
 'sssi', // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part
];

export const bandsGapped:string[]=[
  // connected m  . Connected to wire with impedance=50
 'sssi', // contact
 'siii',  // we assume homognous electric field between plates (the side walls of the gates)
 'i-is', // gate
 'sssi', // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part
];

var html = `
  <div>
    <span>Some HTML here</span>
  </div>
`;

// Some gates are connected to the silicon slab => current flowing
const gate=new Field( ['ex']
  ); // So "m" is the inhomogenous part

const instance='CGCFC'; // the ends are implicit
