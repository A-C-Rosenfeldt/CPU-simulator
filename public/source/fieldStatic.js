import './field/semiconductor';
import './field/metal';
import { Field, Contact, Metal } from './fields';
class LowImpedanceContact extends Contact {
}
class Paint {
}
export class FieldWMatrix extends Field {
}
// test in test/fields
export class ContactedField extends FieldWMatrix {
    // which numbers in the string literal correspond to low impedance? GND, VCC and for historical reasons: +12 +5 0 -5 -12
    // Or more like 5 and 3.3 ?
    constructor(touchTypedDescription, contacts /* derived class can pass wireContact */) {
        /*
         super does all this now
          const contacts=new LowImpedanceContact[10]
          const pureLocal=new Array<string>(touchTypedDescription.length)
      
          for(let y=0;y<touchTypedDescription.length;y++){
              const line=touchTypedDescription[y]
              pureLocal[y]=line.replace(/\d/,(match,  offset)=> {
            contacts[Number.parseInt(match)] = new LowImpedanceContact(y, offset)
            return 'm' // todo this does not work. I need a bidirectional reference => fields.ts/class Tupel}
            )
        }
        */
        if (!contacts) { // undefined because no parameter given or  (null because i dunno? )
            contacts = [];
            for (let i = 0; i < 5; i++) {
                const c = new LowImpedanceContact();
                c.voltage = i; // keep it simple.
                Contact[i] = c;
            }
        }
        super(touchTypedDescription, contacts);
    }
    // no input from matrix. Move to super?
    // find conected ( via edges ) conductive parts "m"etal   ( not number = metal on given potential )
    // How do I store the info? State is my enemy..
    // Matrix{ lhs rhs } does only care for number (known U) vs m ( metal piece)
    // only m uses floodfill.
    // call from contact? So floating metal piece gets a contact?
    // how do we express: Q sum over all cells = lastFrame Q ? Just add a Row to the Matrix!
    // how do we express: U == contact .. Though why do I want to solve it right now?
    //   coax with wave resistance is a bit different then ground contact with capacitor!
    // So we start with the latter: U is known. Q is not constrained.
    // the former adds Ohmic equation => U and Q are both unknonw?
    // This method needs to be called inside loop over field every timeStep. Mark cells for timeStep fill?
    // This sets U in the phase between Matrix stuff. Either ohmic or all to contact.U .
    floodfills(floodedInEven) {
        //   the connected gates are filled in a  common implementation with backtracking
        // this fits well with run-time usage. I go through all gates sequentally
        // I need outOfBound code  like in FieldToDiagonal.ToSparseMatrix. This time: outOfBoundsRead => NaN
        const seeds = new Array(); // So I don't want to paint it.
        // Instead I use double buffer on field coordinates
        // and I set U on the field
        //this.fieldInVarFloats[0][0].Contact=1 // setAt is method of array, but no of string
        // looking for connected electrodes . I assume that the author manages only one contact point .. so here we gather like 10 coordinates
        this.IterateOverAllCells((i_mat, i, k) => {
            const c = i_mat.Contact;
            if (c) {
                seeds.push({ contact: c, coords: [i, k] }); // ToDo: How to match contact with column in Matrix? The relation / mapping can have both types, can't it 
            }
            i_mat.RunningNumberOfJaggedArray; // Negative only for literal potential ( important stepping stone). Don't fill literals (todo)! 
            // we know that Q and U exchange places for insulator vs metal
            // so now for an electrode: U is not on the lhs
        });
        let U = 0; // potential
        let Q = this.floodFill(seeds, U); // simple depth first search ideal for small electrodes.
        // So should I specialize this to ohmic contact so that I can solve it in the matrix? Seems easy
        // So for both 
        //   I need access to the Matrix and the positions therein. I have
        // see above: i_mat.RunningNumberOfJaggedArray
        //   
        // looking for floats    // floating gates can only be detected in a serial fashion. // only do this at init
        let cc = 0;
        this.IterateOverAllCells((i_mat, i, k) => {
            const c = i_mat.Contact;
            if (i_mat.BandGap === 0 && !c) {
                seeds.push({ contact: cc++, coords: [i, k] }); // voltage is shared (cc is corresponding column in LinAlg), but needs to be calculated. Charge density is a field, but sum is constrained to 0 (add row).
                let Q = this.floodFill(seeds, i_mat.Potential);
                if (Q > 0) { // steepest descent to explain our problem
                }
                else {
                }
                // floats act like a semiconductor cell in curved space
                // 
                // we should not call this in between the steps
            }
        });
        // Alternatives
        //  foreachCell{if(digit) while(!stack.empty) four directions} }; forEach(Cell){'m' ? floodfill}
        //  cellular automata: [black, white].{forEach( checker board  -- 4 directions -- )} . min max value for ordinates of cells with dangling bounds (may grow +1 per cycle) and for m. Floats are difficult to follow
        //  turtle: follow fill path. Follow turns. Number of suspect cells needs to go to zero.
        //    At dead end: shoot over, scan whole map with the direction where the current on is line
        //      if we reach the border => like in cellular reduce min max value.
        //    for floats and to avoid an initial search for a contact, I need to be rename patches ( relation  patches n : 1 contact)
        //     second pass: replace flaot contacts with real contact ( only member of float ) if that is not null
        //     shortcut: set real contact on higher number.
        // Exception: Short-cut . So I do not know what the author of the map wants to tell me with this
    }
    // ToDo: Go back to single seed so that I can use it in between Matrix phases to distribute U
    // Either place U and Q in Paint or pull out the loop
    floodFill(seeds, potential) {
        let Q = 0;
        while (seeds.length > 0) {
            const paint = seeds.pop();
            const c = paint.contact;
            const coords = paint.coords;
            let i = coords[1];
            let k = coords[2];
            // loop starts in middle row for simple backtracing structure
            // check is cheap and so I do not need to store d and e
            // I can use d easily. Sorry for the mess.
            let d = 0;
            let e = -1;
            if (coords.length > 4) {
                d = coords[3];
                e = coords[4];
            }
            for (; d <= 1; d += d === 0 ? -1 : 2) {
                let row = this.fieldInVarFloats[i + d];
                if (row) {
                    (d === 0) || (e = 0);
                    for (; e < 2; e += 2) {
                        const cell = row[k + e];
                        if (cell && cell instanceof Metal) { //} cell.BandGap==0) {
                            const cc = cell.Contact;
                            if (!cc) {
                                seeds.push({ contact: c /* dupe */, coords: [i, k, d, e] });
                                i += d;
                                k += e;
                                // simulate C# / yield  in   typescript by doing a reset of the direction
                                d = 0;
                                e = -1;
                                // we stay in row, not needed: break // boundary check
                                // filling 
                                //  I need some clearing for the next frame
                                //  this cannot be "Contact" because that would be a single interface in the map
                                // Payload
                                Q += cell.CarrierCount[1] - cell.CarrierCount[0];
                                cell.Potential = potential;
                            }
                            else {
                                if (cc != c)
                                    throw "short cut;";
                            }
                        }
                    }
                }
            }
        }
        return Q;
    }
}
// Maybe later I should compare this grid based version. Make it a shader! Be more realistic for silicon
// But till then, it does not look as cool and intutive like a small number of fast moving electrons. Electrons with inertia. See semiconductor.ts
// // Partial differential equation
// class PDE{
//   // I would love it if readonly extends to the block following a constructor .. Maybe I am a total C# fan boy
//   public readonly c:number[]    // charge?
//   public readonly m:number[][];  // Metal?
//   // trivial, but needed due to  missing syntax features of  TypeScript 
//   constructor(cc:number[],mm:number[][]){
//     this.c=cc
//     this.m=mm
//   }
//   public DoDirection(d:number[],reflection=false ){ //}: boolean){
//     return ;
//   }
// }
// I want to mimic the compact representation in the original Silicon.
// the mirror in FIN reduces the area to process in the calculation
// This, here in code, multiple metal connections to n-dopen Si are modelled
//export class FinFet{
// public PoissonGen(){
//   //?this.DoAll(new PDE())
//   return //Matrix to invert 
// }
// public CarrierGen(){
//   return // nothing. Sideeffect: create new frame of carriers
// }
// // border special
// // trying to replace  if  with data indirection
// public DoAllXandThenYOrSo(ode:PDE){
//   // Multiply with the Matrix from field.ts . So where is Tridiagonal Matrix here?. Why is this file called Static
//   const pitch=10;
//   const width=10;
//   var directions=[1,pitch];
//   var x=0;var y=0;
//   ode.DoDirection(directions,true) 
//   directions.push(-1)
//   do{
//     ode.DoDirection(directions)
//   }while(++y<width);
//   directions.shift()
//   ode.DoDirection(directions,true)
// }
//Gate: number[]; // Voltages
// connectedToPowerRail: boolean[]=[false,false]; // VSS, VDD
// contacts: Contact[] // wire
// Field:Tupel[][4]; // looks like I should go with 4x4 matrix and not worry about pivot. Matrix is fixed. I just have to multiply.
// constructor(){
//   var element="g";
//   switch(element){
//   }
//   const crossSection=Tupel[4];
//   var c=crossSection[0];
//   c.BandGap=3
//   var c=crossSection[1];
//   c.BandGap=3
//   c.ChargeDensity=1; // we start in enhancement mode
//   var c=crossSection[2];
//   c.BandGap=3
//   var c=crossSection[3];
//   c.BandGap=1
//   this.Field[0]=crossSection;//] as Tupel[][4];
// }
// ToTexture(raw : Uint8Array, p:number )
// {
//   for(let y=0;y<16;y++)
//     for(var x=0;x<4;x++){
//       this.Field.ToTexture(raw, p+4*x);
//       this.Field.ToTexture(raw, p-4*x);
//     }
//   }
// class Field{
// field: Tupel[][]; // semiconductor
// fieldFloat: Tupel[]; // metal  -- floating because they are connected via impedance (R) with the coaxial wires. ToDo: extend to two dimensions, think of doped semiconductor: show carriers in surface states
// floatPitch=6;
// 1x1 block. DGL to solve
// Poisson(x:number,y:number){
//     this.field[x][y].Potential=(
//         this.field[x][y-1].Potential
//         +this.field[x][y+1].Potential
//         +this.field[x-1][y].Potential
//         +this.field[x+1][y].Potential
//     )/4 + this.field[x][y].ChargeDensity();
// }
// // check: sum(sum()) == 0
// // metal voltage can be read for Poisson, but writing leads to average over the segment.
// // On Top and bottom one line refers to the inhomogenous part
// // ToDo: Is there any way to reference the names of fields directly?
// PIntern=new PDE([1,1],[
//   ,[ 0,-1, 0]
//   ,[-1, 4,-1]  // this stuff falls apart at borders, in curved space, higher dimensions
//   ,[ 0,-1, 0]
// ]);
// PMirror=new PDE([1,0], [
//   ,[   -1, 0]
//   ,[    4,-2]
//   ,[   -1, 0]
// ]);
// // see electrode aggregation
// PGaps__=new PDE([1,1],[
//   ,[ 0, 1 ]
//   ,[-1,-3 ]
//   ,[ 0, 1 ]
// ]);
//PoissonDirection
// compact code for 2d
// And assign to? I dunno the gap between gates/electrodes is already present
// So we need a jagged array. Pitch depends on row. Hmm.
//current:Number[][]; // Backbuffer for Ohm
// OhmX(y:number){
//   let x=0
//   this.field
//   let potentials=[this.field[x][y].Potential]
// }
// I alternate between LaPlace (voltage from wire) and Ohm (current into wire)
// OhmAll(){
// // ToDo: For a metal electrode sum up all matrices
// var segments=['ex','am','ple']
// segments.forEach( segment=>{
//   if (true /*source in other segment*/){
//     var value=[3,4,5] //segments.getPreviousValue();
//     var homo=(new Tridiagonal(4)).MatrixProductUsingTranspose( value); // 
//     throw "the multiplication-method was not realy tested using value:Array"
//   }      
// })
//   {
//     let xSize=10
//     let ySize=10
//     //for (
//     let y=0
//     let x=0
//     //)
//     let directions:number[]=[0,0,0,0]
//     // aggregate over all directions where current can flow off
//     if (x===0){
//       directions[2]=this.OhmDirection(2,this.PMirror); // set current. We need to buffer this for the  the creditor process
//     }
//     else
//     {
//     if (x<xSize-1){
//       this.OhmDirection(2,this.PIntern)
//       if (y===0){
//         this.OhmDirection(2,this.PIntern )
//         // how to move homogenous part to the other side? Multiply and negate.
//       }
//     }else{
//     }
//   }
// // Insolvenz: Alle bekommen ihren Anteil (current flows due to field strength until bucket is empty)
// // ECL and no HEMPT: I will dope the bulk and may even go differential to avoid this case
//Limit(p, currents:number[]){
//   for(let p=0;p<10;p++){ // iterate over all elements of the electrode        
//   let carrier=this.fieldFloat[p].GetCarrier()
//   //let currents=this.fieldFloat[p].Current.concat([-this.fieldFloat[p+1].Current[0],-this.fieldFloat[p+this.floatPitch].Current[0]])
//   let current=this.fieldFloat[p].Current.filter(out_c => out_c > 0).reduce( (p,c) => p+c  ,0); // ToDo: change to 1 cell per frame flow for semiconductor (MVP.. maybe GPU or WASM can be used to do multiple simulations steps per display frame(60fps)). Metal does one segment per frame ( via GaussJordan ).
//   // [0]-
//   // this.fieldFloat[p+1].Current[0]+
//   // this.fieldFloat[p].Current[1]-
//   // -this.fieldFloat[p+this.floatPitch].Current[1]
//   let minLimit=0
//   if (carrier<current){
//     // limit the time step
//     let q=carrier/current;
//     if (q<minLimit) {
//       minLimit=q // solve the worst negative charge cell per frame per segment
//     }
//   }
// //}
//     // ?? this.OhmDirection([0,3])
//     let E= this.field[x  ][y].Potential-
//            this.field[x+1][y].Potential
//     let C= this.field[x  ][y].GetCarrier()-
//     this.field[x+1  ][y].GetCarrier()
//     let d=C*E;
//     this.field[x  ][y].AddCarrier(d);
//     this.field[x+1  ][y].AddCarrier(-d);
//     //this.OhmDirection(1)
//     //this.OhmDirection(this.floatPitch)
//     this.OhmX(y++)
//       do{
//       }while(false)
//     }
//   }
// }
// OhmDirection(direction:number, pde:PDE){      
//     let y=0
//     let x=0
//     //let currents=directions.map(direction=>{
//     let E= this.field[x  ][y].Potential-
//            this.field[x+this.floatPitch[direction]][y].Potential   // why is there any pitch? I thought I store field as jagged array?
//     let C=//[
//     this.field[x  ][y].GetCarrier()
//     //this.fieldFloat[x+direction].GetCarrier()
//     //]
//     //let c=C[0]-C[1]
//     //let d=
//     return C*E; // Field strength 1  removes all carriers and the material becomes insulating
//     }
//     // if (C[0]+d<0) d=-C[0]
//     // if (C[1]-d<0) d=+C[1]
//     // this.field[x  ][y].SetCarrier(C[0]+d);
//     // this.field[x+1  ][y].SetCarrier(C[1]-d)        
//     // this.OhmX(y++)
//     //   do{
//     //   }while(false)
//     // }
// // }
// // I cannot check may calculations this way, also want Doping within to spread the charge. May later add wavefunctions?: "I only do one dimension: HEMT"
// Ohm(x:number,y:number){
//   // x should be = 3
//   const potentials=[1,0]; // Vss = -5V , Gnd = 0V 
//   //this.Emitter.flow, this.Collector.slice(-1,-1) ]
//   // not really forEach: ToDo: convert to join
//   for(let n=0;n<this.contacts.length;n++){
//     const contact=this.contacts[n]
//     var current=contact.Flow(this.field[4-1][ contact.semiPos].Potential); // Impedance
//     const r=0 //  Now, segmentation is unified between semiconductor and metal.   this.contacts[n]..fromVss;
//     for (var j=r;j<r+3;j++){ // Style: how big should contacts be? In a crystal diode they are quite big
//       const c=this.contacts[n]
//       this.field[4-1][j].Potential[j]=c.wire.flow[0][c.semiPos-globalTime]+c.wire.flow[1][c.semiPos+globalTime];
//     }
//   }
//   if (y>=0)
//   {
//     potentials[0]=this.field[x][y].Potential
//   }else{
//   const potentials=//[
//     [this.field[x][y],//this.field[x+1][y]],
//   this.field[x][y+1]//,this.field[x+1][y+1]]
//   ]
// }
//   const p=potentials //.map(po=>po.Potential)
//   const voltages= p[1]-p[0] 
//   //[  p[1][1]-p[1][0] + p[0][1]-p[0][0] ,
//   // p[1][1]-p[1][0] + p[0][1]-p[0][0]    ];
//   const c=this.field[x][y].Carrier //.map(pot=>pot.Carrier)
//   // does not work beyond 1 dimension
//   const carrier=  c[0]+c[1];//[0] + c[0][1]+c[0][0];
//   // We operate in 2d
//   var field=new Tupel[20][20];
//   // nonlinear: how to solve?
//   // carrier movement is time-dependent
//   // lastFrame.carrier * current = thisFrame.carrier
//   // laplace(potential) = thisFrame.carrier    
//   let rhs=field.getCarrier()  
//   // lastFrame.carrier * grad(potential)*Leitfähigkeit = current
//   // thisFrame.carrier = div(current) + lastFrame.carrier
//   // in homogenous medium this becomes
//   // thisFrame.carrier = (LaPlace(potential)+base) * lastFrame.carrier
//   // cannot solve carriers in this step
//   // this is so slow  and  not  the same in tubes.
//   c[0]+=carrier*voltages
//   c[1]-=carrier*voltages
//   //+this.field[x][y+1].Carrier
//   //current[x][y]=
// }
// OhmField(){
//   // to always get carriers from last fram
//   for(let x=4-1;x>=0;--x){
//     for(let y=4-1;y>=0;--y){
//     }
//   }
// }
// Meander breaks symmetry and does not help that much when I use RLE. Comeback later? Meander optimized for  metal vs semiconductor  shape
// Meander(x:number, y:number, level:number){
//   if (level-->0)
//   {
//     var check=Number[4][2];
//     this.Meander(level);
//   }
// }
// Interlace(x:number, y:number) // and gray code
// { 
//   let combined=0;let last=0;
//   let ror=(1<<2*2)
//   for(let d=0;d++;d<2){
//     last^=x&ror
//     combined|=last
//     combined>>=1;x>>=1;
//     last^=y&ror
//     combined|=last
//     combined>>=1;y>>=1;
//   }
//   return combined;
// }
// mat=Number[4][4];
// homo=Number[12]
//# sourceMappingURL=fieldStatic.js.map