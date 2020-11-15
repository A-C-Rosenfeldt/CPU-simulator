import {Tridiagonal, Row} from './enforcePivot.js'
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


class /*SemiconductorMetal*/ Contact{
  matrix:Tridiagonal; // the matrix is shared by all contacts
  column:number[];
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
    this.matrix.row.push(new Row(this.matrix.row.length,0,[[],R,[]])); //V
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
    
    ToTexture(raw : Uint8Array, p:number )
    {
        raw[p+3]=255;
        raw[p+0]=this.BandGap*255/3;
        const chargeDensity=this.ChargeDensity();
        
        raw[p+(chargeDensity>0?1:2)]=Math.abs(chargeDensity);
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

export class StaticField{
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



export class FieldToDiagonal extends StaticField {
  fieldInVarFloats:Tupel[][]

  constructor(touchTypedDescription:string[]){
    super(touchTypedDescription);
    this.fieldInVarFloats[0][0]=new Tupel()
    this.ConstTextToVarFloats();
  }

  // need to store the electric field somewhere
  // Bandgap may stay in text? But this strange replacement function?
  ConstTextToVarFloats( ):void{ //ToPicture   print=text vs picture?
    // May be later: const pixel=new Float64Array(4*this.maxStringLenght * this.touchTypedDescription.length)

    this.touchTypedDescription.forEach((str,i)=>{
      // JS is strange still. I need index:      for (let c of str) 
      for(let k=0;k<str.length;k++)
      {
        const c=str[k]
        const bandgaps=new Map([['i',2],['-',2],['s',1],['m',0]])
        
        const tu=new Tupel();

          tu.BandGap=bandgaps.get(c)
          tu.Potential=0  // field
          tu.Doping=  c==='-'?200:0 // charge density. Blue is so weak on my monitor
        
        this.fieldInVarFloats[i][k]=tu;
    }
   
  })
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
      pixel[i++] = 32 // partly transparent like on modern windows managers
    }

    // flatten
    this.fieldInVarFloats.forEach((str,i)=>{
      // JS is strange still. I need index:      for (let c of str) 
      for(let k=0;k<str.length;k++)
      {
        const c=str[k]
        let p=((i*this.maxStringLenght)+k)<<2;

        //iD.data.set([
          pixel[p++]= c.BandGap  //bandgaps.get(c)*50
          pixel[p++]= c.Potential
          pixel[p++]= c.Doping // charge density. Blue is so weak on my monitor
          pixel[p++] = 255
          //  ((i*this.maxStringLenght)+k)<<2)
        //}
    }
   
  })
  return {pixel:pixel,width:this.maxStringLenght, height:this.touchTypedDescription.length}; 
  }

  // Code for testing! Only diagonal. ToDo: Find special cases code!
  // What about jaggies? Do if in inner loop? If beyong jaggy above || first line?
  ToMatrix(): Tridiagonal{
    // Tridiagonal instead of:  call meander in FinFet
    // Field can be jagged array .. because of Java and the tupels and stuff. is possible. Boundary is boundaray
    // 
    const matrix= new Tridiagonal(this.flatLength) // number of rows. May need to grow, but no problem in sparse notation

    // flatten
    let p = 0
    // let ps=[p]  // Due to FinFet  triode Gate symmetry, asymmetric jaggies are a thing
    // let c=''
    for (let i = 0; i < this.fieldInVarFloats.length; i++) {
      const str=this.fieldInVarFloats[i]
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        const c = str[k]        
        matrix.row[p] = new Row(p, 0, [[], [c.BandGap /* c.Potential // unsuited for testing*/], []])
        p++
      }

      // small array. Trying to get semantics correct
      //ps=ps.slice(0,1) 
      //ps.unshift(p) 
    }

    return matrix
  }
}


export class Field extends FieldToDiagonal {

  ToMatrix(): Tridiagonal{
    // Tridiagonal instead of:  call meander in FinFet
    // Field can be jagged array .. because of Java and the tupels and stuff. is possible. Boundary is boundaray
    // 
    const matrix= new Tridiagonal(this.flatLength) // number of rows. May need to grow, but no problem in sparse notation

    // flatten
    let i_mat = 0
    let pitch=0
    // let ps=[p]  // Due to FinFet  triode Gate symmetry, asymmetric jaggies are a thing
    // let c=''
    for (let i = 0; i < this.fieldInVarFloats.length; i++) {
      const str=this.fieldInVarFloats[i]
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        const c = str[k]      
        let k_mat=i_mat; // Start with diagonal // Tridiagonal is not yet tested. Maybe I need a second trick to tackle all shapes of sparseness:  this.Interlace(x,y)
        // ToDo: Move behind the solver: Repeat this verschachtelter loop to multiply vector with matrix and to convert vector back to field:  flat[flatIndex]=this.field[x][y];

        const proto=[[], [4], []]
        // Laplace will source all fields. Only target is XOR ChargeDensity.
        if (c.BandGap===0)
        {
          // Charge Carrier
        }else{
        // Laplace 4x4 from the end of this file
        //LaPlace4x4(tiles:number[][][])
        {
          // const flat=Number[4*4];
          // for(let y=0;y<4;y++){
          //   for(var x=0;x<4;x++){

              
              // this.homo[flatIndex]=this.field[x][y].ChargeDensity();
              // this.mat[flatIndex][flatIndex]=4; // diagnoal entries are all <> 0

              if (k<str.length-1){
                proto[1].push(-1)
              }
              if (k>0){
                proto[1].unshift(-1)
                k_mat--
              }

              // Jagged ( symmetry or later: wired-or  )
              if (i+1<this.fieldInVarFloats.length && this.fieldInVarFloats[i+1].length>k){
                proto[2]=[-1]
              }
              if (i>0  && this.fieldInVarFloats[i-1].length>k ){
                proto[0]=[-1]
              }

              // const x=i,y=k
              // // homogenous and inhomogenous (the border: 4+4+4+4) parts
              // if (x>0)
              // {
              //   this.mat[flatIndex][this.Interlace(x-1,y)]=-1;
              // }else{
              //   this.homo[flatIndex] -= this.contacts[0].wire.getVoltage(0)[0]
              // }
    
              // if (x<4-1)
              // {
              //   this.mat[flatIndex][this.Interlace(x+1,y)]=-1;
              // }else{
              //   this.homo[flatIndex][this.Interlace(x-1,y)]=-2; // see above
              // }
    
              // if (y>0)
              // {
              //   this.mat[flatIndex][this.Interlace(x,y-1)]=-1;
              // }else{
              //   this.homo[flatIndex] -= tiles[0][x][4-1];
              // }          
    
              // if (y<4-1)
              // {
              //   this.mat[flatIndex][this.Interlace(x,y+1)]=-1;
              // }else{
              //   this.homo[flatIndex] -= tiles[1][x][0];
              // }   
    
          //   }
          // }
        }        
        // if (i>0 && this.fieldInVarFloats[i-1].length>k){
        //   compressed[0]=[-1]
        // }
        // if (i<this.fieldInVarFloats.length-1&& this.fieldInVarFloats[i+1].length>k){
        //   compressed[2]=[-1]
        // }  
      }

        matrix.row[i_mat] = new Row(k_mat, pitch , proto, str.length ) // pitch need to be relativ to pos ( not to array bounds )
        i_mat++
      }

      pitch=str.length
      // small array. Trying to get semantics correct
      // ps=ps.slice(0,1) 
      // ps.unshift(i_mat) 
    }

    return matrix
  }


  bufferId=0; // like field in interlaced video. Used to double buffer the carriers

  ToMatrix0(): Tridiagonal{
    // Tridiagonal instead of:  call meander in FinFet
    // jagged array is possible. Boundary is boundaray
    const matrix= new Tridiagonal(this.flatLength) // number of rows. May need to grow, but no problem in sparse notation
    const pitch=[0,0]
    // ToDo find existing code about the top and low boundary
    for(let i=0;i<matrix.row.length;i++){
      matrix.row[i]=new Row(i,10,[[-1],[-1,4,-1],[-1]])

      
    }

    // Todo: extablish this real version
    let p=0
    // copied from printGL
    this.touchTypedDescription.forEach((str,i)=>{
      // JS is strange still. I need index:      for (let c of str) 
      pitch[1]=pitch[0]
      pitch[0]=str.length 

      for(let k=0;k<str.length;k++)
      {
        const c=str[k]
        const bandgaps=new Map([['i',2],['-',2],['s',1],['m',0]])
        let p=((i*this.maxStringLenght)+k)<<2;

   

        matrix.row[p++]=new Row(i,pitch[1],[[-1],[-1,4,-1],[-1]],pitch[1])
        //iD.data.set([
          // pixel[p++]=bandgaps.get(c)*50
          // pixel[p++]=0
          // pixel[p++]=  c==='-'?200:0; // charge density. Blue is so weak on my monitor
          // pixel[p++] = 255
          //  ((i*this.maxStringLenght)+k)<<2)
        //}

    }    
  }    )
    return matrix
  }
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


var html = `
  <div>
    <span>Some HTML here</span>
  </div>
`;

// Some gates are connected to the silicon slab => current flowing
const gate=new Field( ['ex']
  ); // So "m" is the inhomogenous part

const instance='CGCFC'; // the ends are implicit

// Partial differential equation
class PDE{
  // I would love it if readonly extends to the block following a constructor .. Maybe I am a total C# fan boy
  public readonly c:number[]    // charge?
  public readonly m:number[][];  // Metal?
  // trivial, but needed due to  missing syntax features of  TypeScript 
  constructor(cc:number[],mm:number[][]){
    this.c=cc
    this.m=mm
  }

  public DoDirection(d:number[],reflection=false ){ //}: boolean){
    return ;
  }
}

// I want to mimic the compact representation in the original Silicon.
// the mirror in FIN reduces the area to process in the calculation
// This, here in code, multiple metal connections to n-dopen Si are modelled
export class FinFet{

  public PoissonGen(){
    //?this.DoAll(new PDE())
    return //Matrix to invert 
  }

  public CarrierGen(){
    return // nothing. Sideeffect: create new frame of carriers
  }
   
  // border special
  // trying to replace  if  with data indirection
  public DoAllXandThenYOrSo(ode:PDE){
    const pitch=10;
    const width=10;
    var directions=[1,pitch];
    var x=0;var y=0;
    ode.DoDirection(directions,true) 

    directions.push(-1)
    do{
      ode.DoDirection(directions)

    }while(++y<width);

    directions.shift()

    ode.DoDirection(directions,true)
  }


  //Gate: number[]; // Voltages

  connectedToPowerRail: boolean[]=[false,false]; // VSS, VDD

  contacts: Contact[] // wire

  Field:Tupel[][4]; // looks like I should go with 4x4 matrix and not worry about pivot. Matrix is fixed. I just have to multiply.

  constructor(){
    var element="g";
    switch(element){

    }


    const crossSection=Tupel[4];
    var c=crossSection[0];
    c.BandGap=3
    var c=crossSection[1];
    c.BandGap=3
    c.ChargeDensity=1; // we start in enhancement mode
    var c=crossSection[2];
    c.BandGap=3
    var c=crossSection[3];
    c.BandGap=1

    this.Field[0]=crossSection;//] as Tupel[][4];
  }

  

  ToTexture(raw : Uint8Array, p:number )
  {
    for(let y=0;y<16;y++)
      for(var x=0;x<4;x++){
        this.Field.ToTexture(raw, p+4*x);
        this.Field.ToTexture(raw, p-4*x);
      }
    }
  //} 
// }

// class Field{
    field: Tupel[][]; // semiconductor

    fieldFloat: Tupel[]; // metal  -- floating because they are connected via impedance (R) with the coaxial wires. ToDo: extend to two dimensions, think of doped semiconductor: show carriers in surface states
    floatPitch=6;

    // 1x1 block. DGL to solve
    Poisson(x:number,y:number){
        this.field[x][y].Potential=(
            this.field[x][y-1].Potential
            +this.field[x][y+1].Potential
            +this.field[x-1][y].Potential
            +this.field[x+1][y].Potential
        )/4 + this.field[x][y].ChargeDensity();
    }

    // check: sum(sum()) == 0
    // metal voltage can be read for Poisson, but writing leads to average over the segment.
    // On Top and bottom one line refers to the inhomogenous part
    // ToDo: Is there any way to reference the names of fields directly?
    PIntern=new PDE([1,1],[
      ,[ 0,-1, 0]
      ,[-1, 4,-1]
      ,[ 0,-1, 0]
    ]);

    PMirror=new PDE([1,0], [
      ,[   -1, 0]
      ,[    4,-2]
      ,[   -1, 0]
    ]);

    // see electrode aggregation
    PGaps__=new PDE([1,1],[
      ,[ 0, 1 ]
      ,[-1,-3 ]
      ,[ 0, 1 ]
    ]);

    //PoissonDirection
    // compact code for 2d

    // And assign to? I dunno the gap between gates/electrodes is already present
    // So we need a jagged array. Pitch depends on row. Hmm.
    
    //current:Number[][]; // Backbuffer for Ohm
    OhmX(y:number){
      let x=0
      this.field
      let potentials=[this.field[x][y].Potential]

    }
    // I alternate between LaPlace (voltage from wire) and Ohm (current into wire)
    OhmAll(){

    // ToDo: For a metal electrode sum up all matrices
    var segments=['ex','am','ple']

    segments.forEach( segment=>{
      if (true /*source in other segment*/){
        var value=[3,4,5] //segments.getPreviousValue();
        var homo=(new Tridiagonal(4)).MatrixProduct( value);

      }      
    })


      {
        let xSize=10
        let ySize=10

        //for (
        let y=0
        let x=0
        //)

        let directions:number[]=[0,0,0,0]

        // aggregate over all directions where current can flow off
        if (x===0){
          directions[2]=this.OhmDirection(2,this.PMirror); // set current. We need to buffer this for the  the creditor process
        }
        else
        {
        if (x<xSize-1){
          this.OhmDirection(2,this.PIntern)
          if (y===0){
            this.OhmDirection(2,this.PIntern )
            // how to move homogenous part to the other side? Multiply and negate.
          }
        }else{

        }
      }


    // // Insolvenz: Alle bekommen ihren Anteil (current flows due to field strength until bucket is empty)
    // // ECL and no HEMPT: I will dope the bulk and may even go differential to avoid this case
    //Limit(p, currents:number[]){
      for(let p=0;p<10;p++){ // iterate over all elements of the electrode        
      let carrier=this.fieldFloat[p].GetCarrier()
      //let currents=this.fieldFloat[p].Current.concat([-this.fieldFloat[p+1].Current[0],-this.fieldFloat[p+this.floatPitch].Current[0]])
      let current=this.fieldFloat[p].Current.filter(out_c => out_c > 0).reduce( (p,c) => p+c  ,0); // ToDo: change to 1 cell per frame flow for semiconductor (MVP.. maybe GPU or WASM can be used to do multiple simulations steps per display frame(60fps)). Metal does one segment per frame ( via GaussJordan ).
      
      // [0]-
      // this.fieldFloat[p+1].Current[0]+
      // this.fieldFloat[p].Current[1]-
      // -this.fieldFloat[p+this.floatPitch].Current[1]

      let minLimit=0
      if (carrier<current){
        // limit the time step
        let q=carrier/current;
        if (q<minLimit) {
          minLimit=q // solve the worst negative charge cell per frame per segment
        }
      }

    //}

        // ?? this.OhmDirection([0,3])
        let E= this.field[x  ][y].Potential-
               this.field[x+1][y].Potential
        let C= this.field[x  ][y].GetCarrier()-
        this.field[x+1  ][y].GetCarrier()

        let d=C*E;
        this.field[x  ][y].AddCarrier(d);
        this.field[x+1  ][y].AddCarrier(-d);
        
        //this.OhmDirection(1)
        //this.OhmDirection(this.floatPitch)

        this.OhmX(y++)
          do{

          }while(false)
        }
      }
    }

    OhmDirection(direction:number, pde:PDE){      
        let y=0
        let x=0

        //let currents=directions.map(direction=>{
        let E= this.field[x  ][y].Potential-
               this.field[x+this.floatPitch[direction]][y].Potential   // why is there any pitch? I thought I store field as jagged array?
        let C=//[
        this.field[x  ][y].GetCarrier()
        //this.fieldFloat[x+direction].GetCarrier()
        //]

        //let c=C[0]-C[1]

        //let d=
        return C*E; // Field strength 1  removes all carriers and the material becomes insulating
        }
        // if (C[0]+d<0) d=-C[0]
        // if (C[1]-d<0) d=+C[1]
        // this.field[x  ][y].SetCarrier(C[0]+d);
        // this.field[x+1  ][y].SetCarrier(C[1]-d)        

        // this.OhmX(y++)
        //   do{

        //   }while(false)
        // }
    // }






    // I cannot check may calculations this way, also want Doping within to spread the charge. May later add wavefunctions?: "I only do one dimension: HEMT"
    Ohm(x:number,y:number){

      // x should be = 3
      const potentials=[1,0]; // Vss = -5V , Gnd = 0V 
      //this.Emitter.flow, this.Collector.slice(-1,-1) ]

      // not really forEach: ToDo: convert to join
      for(let n=0;n<this.contacts.length;n++){
        const contact=this.contacts[n]
        var current=contact.Flow(this.field[4-1][ contact.semiPos].Potential); // Impedance

        const r=0 //  Now, segmentation is unified between semiconductor and metal.   this.contacts[n]..fromVss;
        for (var j=r;j<r+3;j++){ // Style: how big should contacts be? In a crystal diode they are quite big
          const c=this.contacts[n]
          this.field[4-1][j].Potential[j]=c.wire.flow[0][c.semiPos-globalTime]+c.wire.flow[1][c.semiPos+globalTime];
        }
      }

      if (y>=0)
      {
        potentials[0]=this.field[x][y].Potential
      }else{
      const potentials=//[
        [this.field[x][y],//this.field[x+1][y]],
      this.field[x][y+1]//,this.field[x+1][y+1]]
      ]
    }
      const p=potentials //.map(po=>po.Potential)

      const voltages= p[1]-p[0] 
      //[  p[1][1]-p[1][0] + p[0][1]-p[0][0] ,
      // p[1][1]-p[1][0] + p[0][1]-p[0][0]    ];

      const c=this.field[x][y].Carrier //.map(pot=>pot.Carrier)

      // does not work beyond 1 dimension
      const carrier=  c[0]+c[1];//[0] + c[0][1]+c[0][0];

      // We operate in 2d
      var field=new Tupel[20][20];

      // nonlinear: how to solve?
      // carrier movement is time-dependent
      // lastFrame.carrier * current = thisFrame.carrier

      // laplace(potential) = thisFrame.carrier    
      let rhs=field.getCarrier()  
      // lastFrame.carrier * grad(potential)*Leitfähigkeit = current
      // thisFrame.carrier = div(current) + lastFrame.carrier

      // in homogenous medium this becomes
      // thisFrame.carrier = (LaPlace(potential)+base) * lastFrame.carrier

      // cannot solve carriers in this step
      c[0]+=carrier*voltages
      c[1]-=carrier*voltages

      //+this.field[x][y+1].Carrier

      //current[x][y]=
    }

    OhmField(){
      // to always get carriers from last fram
      for(let x=4-1;x>=0;--x){
        for(let y=4-1;y>=0;--y){
        }
      }
    }

    // Meander(x:number, y:number, level:number){
    //   if (level-->0)
    //   {
    //     var check=Number[4][2];
    //     this.Meander(level);
    //   }
    // }

    Interlace(x:number, y:number) // and gray code
    { 
      let combined=0;let last=0;
      let ror=(1<<2*2)
      for(let d=0;d++;d<2){
        last^=x&ror
        combined|=last
        combined>>=1;x>>=1;
        last^=y&ror
        combined|=last
        combined>>=1;y>>=1;
      }
      return combined;
    }

    mat=Number[4][4];
    homo=Number[12]
    
  }
