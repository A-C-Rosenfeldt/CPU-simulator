import {SimpleImage} from './GL'
// pivot is no necessary for small matrix
// our matrix has block structure
// one block with large entries on diagonale
// small block
// Make sure, that small is on the bottom

// Mapping 2d locality to 1d vectors could be done using a meander
// with a somewhat irregular looking diagonal and many incencetives to optimize prematurely ..
// ..or much simpler by allowing 3 diagonals in a sparse matrix

// funny thing is that I need row and column indices
// There maybe a large problem with garbage collection

// this may look like preamture optimization, but the goals of the project are:
// understandable performance ( like what you would do prematurely)
// explain a CPU

// we could store left and right side of the equation
export class Span<T>{
    extends: Array<T>  // we duplicate part of the interface in order to never need to copy the items
    start:number
    // doesn't work:  length:number
    unshift(...items: T[]): number{
        if (this.start){
            if (--this.start<0) {throw "below bounds" }
        }

        return this.extends.unshift.apply(this,items)
    }
    constructor(len:number,s:number) { //start:number, data:Arry<T>){
        this.extends=new Array<T>(len)        
        this.start=s
        //this.length=len
    }

    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
        this.extends.forEach(callbackfn)
    }
    // shedOfStart(a,b):Array<T>{
    //     //ParentClass.prototype JS 
    //     // ES6 accepts both
    //     let t= super.slice.call(this,a,b)
    //     return t // TS
    // }
    //string:number[]=[]
}

class SpanWithCommonFactor<T> extends Span<T>{
    factor:number
}

// Consider: RowConstructor which takes Span instead of Array<Span> ( check for .Start )
export function FromRaw<T>(...b:Array<T>):Span<T>{
    const s= new Span<T>(b.length,0);  // set prototype . Ducktyping alone won't call correct unshift
    // transfer values without destroying prototype and being somewhat comaptible with C# and Java
    // Does this translate into arguments[] ?
    for(var i=0;i<b.length;i++){
        s.extends[i]=b[i]
    }
    return s
}

interface ValuesInSpan{
    filled:boolean;
    ValueSpanStartInMatrix:number;
} 

interface DoublyIndirect{
    mp:number;
    max:number;
}
class FilledFrom implements DoublyIndirect,ValuesInSpan{
    //filled=false;
    from=0;     // position in starts. We may trace the first element, but do not yet have a record of a previous boundary
   // fromfrom=0; // position in Matrix
    max=0
    readonly ex:Array<number>;
    //SummandForJoin=0 // only needed for swap, not for sub.  todo remove. I want join to be short. I do not shift for anything else

    get mp(){
        // apparently "undefined" is used in join ..  if (this.from < 1) throw "right hand side of string needs to be at minimum at 1"
         return this.ex[this.from] ;
    }

    constructor(s: Array<number>){
        // todo: maybe only store s?
        this.max=s.length
        this.ex=s;
    }

    // Interface Value
    get filled(){
        return (this.from & 1 )===1  // looks back like ValueSpanStartInMatrix
    }    
    get ValueSpanStartInMatrix(){
        // apparently "undefined" is used in join ..  if (this.from < 1) throw "right hand side of string needs to be at minimum at 1"
         return this.ex[this.from - 1 /* anchor of span is on the low end, but join tracks the high end for the "end condition" .. todo: switch */] ; 
    } 
}

class NowNotOnlyStartInMatrixButAlsoValuesAtThatPos extends FilledFrom{
    readonly values:number[][]
    factor:number;
    constructor(r: Row){
        super(r.starts)
        this.values=r.data // Todo: hide some data using private scope in base class
    }
}

// What is better: Iterator, or a forEach with callback? I want to use "this" for output => iterator;while
// Todo: sub uses this
// Todo: swap uses this
export class JoinOperatorIterator{
    s=new Array<number[]>()
    i=new Array<FilledFrom>() // I need to generalize for swap which needs 3 arrays and iteration 3 times over arrays is worse then iterating over 3 values inside the loop 
    filled=0
    filled_last:number
    behind=-1 // join operator, please leave me alone  :number

    // Todo: Look up how to do  constructor overloading correctly in typeScript. Compared to C#, Java, C++ this is a mess
    constructor(...s:number[][]);
    constructor(initi:boolean, ...s:number[][]);
    constructor(){ //}...s:number[][]){
        if (arguments.length>0){
            let t=(typeof arguments[0] !== "boolean")  // I cannot find a different way
            // for sub and innerProduct
            let d=-1
            for(let k=t?-1:0 ; ++k<arguments.length; ){
                const u=arguments[k] as number[]
                if (!Array.isArray(u)){
                    throw " I try to capture the last parameters! That should lead to an array of arrays! "
                }
                // if (d>=0 && this.s[d]>u){
                //     throw " starts need to grow monotonously! u: "+u
                // }
                this.s[++d]=u
                if (t){
                    this.i[d] =new  FilledFrom(u )  // I do not know. Maybe for swap? I am in the middle of refactor right now
                }
            }
            console.log(" this.s :  "+this.s)
            try{
            console.log(" this.s[0] :  "+this.s[0])
            }catch{}
        this.behind=Math.max(...this.s.map(s=>s[s.length-1]))+1 
        }
    }

    next():number{

        // negative position in matrix should work => todo test
        // this.i.forEach((c)=>{
        //     if (pos>c.mp ){ // this would lead to an endless loop: && c.from < c.max-1){ // not while because Seamless removes zero length spans ( degenerated )
        //         c.from++ ; 
        //        // c.filled =  !c.filled  ; // ^= 1 << i

        //     }
        // })

        // on the one hand: state is my enemy
        // on the other hand: JS does not like joins (needed in Seams). NoSQL does not like joins. We cannot use a join to code a join, or can we?
        // Maybe I should start with an equi-join
        // this.i[1]=this.i[0].map(ff=>{
        //     // todo: If debugged, make it one line
        //     let neu=new FilledFrom(ff.ex /* readonly reference */); // I mean I could instead add an "if" into the ctor.
        //     Object.assign(neu, ff ); // affects only own properties. Overwrites ex a second time
        //     //const {...neu, mp}=ff;
        //      return neu; 
        //     } ) // this sets the order of indices. Feels okay
        //this.filled_last=this.filled_last
        const min = this.i.reduce((p,v) => {
          return  (v.from < v.max && v.mp < p) ?  v.mp : p ;  // could set a break point on some part of a line in  VSC
        },this.behind 
        ) // uh. again a join

        //if (min<this.last) // this would lead to an endless loop
        {
            this.i.forEach((c)=>{
                            if (min===c.mp ){ // this would lead to an endless loop: && c.from < c.max-1){ // not while because Seamless removes zero length spans ( degenerated )
                                c.from++ ; 
                               // c.filled =  !c.filled  ; // ^= 1 << i

                            }
                        })
                        
        }
 return min
            //if ((this.i[0][0].from < this.s[0].length || this.i[0][1] < this.s[1].length) )
            {
                
            
                    // console.log("i "+i+" a "+a)
                const pass1gap=this.filled;

                /*do*/{
                    // trying to avoid infinity, null and undefined for better readability
                    
                    let cursor=this.s.map(s=>[this.behind,s.length])
                    //new Array<[number,number]>(this.i.length).fill([),s.length])
                    // let I:number=this.s[1][this.s[1].length-1]+1
                    // let A:number=this.s[0][this.s[0].length-1]+1

                    let min=this.behind
                    cursor.forEach((c,i)=>{
                        const k=this.i[0][i].from
                        if (k < c[1]){
                            c[0]=this.s[i][k]
                        }
                        if (min>c[0]){
                            min=c[0]
                        }
                    })

                    // if (this.i[0] < this.s[0].length){
                    //     I = this.s[0][this.i[0]]
                    // }
                    // if (this.i[1] < this.s[1].length){                    
                    //     A = this.s[1][this.i[1]]
                    // }

                    {
                        let R:number
                        cursor.forEach((c,i)=>{
                            if (min===c[0]){
                                // this.i[i].from++ ; 
                                // this.i[i].filled =  !this.i[i].filled  ; // ^= 1 << i
                                R=c[0]
                            }
                        })
                        return R
                    }
                    
                    // if (I > A) {
                    //     this.i[0]++; this.gap ^= 2; return A
                    // }else{
                    //     this.i[0]++; this.gap ^= 1;
                    //     if (I === A) {
                    //         this.i[1]++; this.gap ^= 2
                    //     }
                    //     return I                    
                    // }
                }//while(false)
            }
            return this.behind+1 //null // if (variable === null)    // only in collections: undefined  // if (typeof myVar !== 'undefined')
    }
}

export /* for transparent test*/ class JopWithRefToValue extends JoinOperatorIterator {
    i:NowNotOnlyStartInMatrixButAlsoValuesAtThatPos[]
    // Todo: Look up how to do  constructor overloading correctly in typeScript. Compared to C#, Java, C++ this is a mess
    constructor(...r: Row[]){ //s: number[][])
    // constructor(initi:boolean, ...s:number[][]);
    // constructor()
    //{ //}...s:number[][]){
        super(false, ...r.map(r=>r.starts)) // base class is already complicated enough. Hide the values!  //  uh, messy. Maybe I just have bad luck with my flat parameters?
        this.i=r.map(r=>new NowNotOnlyStartInMatrixButAlsoValuesAtThatPos(r))

        // for (let k = arguments.length; --k >= 0;) {
        //     const u = arguments[k] as number[]
        //     this.i[k] = new NowNotOnlyStartInMatrixButAlsoValuesAtThatPos(u)  // I do not know. Maybe for swap? I am in the middle of refactor right now
        //     throw "expand FilledFrom!"
        // }
    }

//     static ZipValues(...row: Row[]) {
//         var jop=new JopWithRefToValue(...row.map(r=>r.starts)) // jop only uses starts
//         // but sub and innerProduct need a ref to the values
//         this.i = this.s.map(starts=> new FilledFrom(starts) )

// //        this.i.
//         throw new Error('Method not implemented.')
//     }
//     value:number[][][]
}

export interface Seamless{
    removeSeams(//criterium: ((a: number) => boolean),
        fillValues: Span<number>[], // sourceStart: number[],
        pos: number, filled: boolean,
        operation?:Result, nujeCol?:number,
        whatIf?:boolean  // expose the triviality of this premature optimization
    )  // these come indirectly ( gap:number=> gap:bool?) from JoinOperator

    flush()

    data_next: number[][]
    start_next: number[]
}
export class AllSeamless implements Seamless {
    private _data_next: number[][] = []
    public get data_next(): number[][] {
        if (!this.flushed){
            throw "not sealed"}
        return this._data_next
    }
    public data_push(value: number[]) {
        this._data_next.push( value )
        this.flushed=false
    }
    private _start_next: number[] = []
    public get start_next(): number[] {
        if (!this.flushed){
            throw "not sealed"}
        return this._start_next
    }
    public start_push(value: number) {
        this._start_next.push(value)
        this.flushed=false
    }


    flushed=true // I do not support live FIFO at the moment. All readers want to do forEach on the data. Data is short, I do not ever expect streams to occure in THIS class
    starts = 0 // whatIf
    length = 0 // whatIf  .. basically needs 3 passes for tight malloc =>  WhatIf:number
    // this may better be a function which accepts delegates and does for(let pass=0;;pass++){ over them
    //. Todo: Try both ways
    // two passes where motivated by memory allocation, but mess with the OOP structure
    filled = [false, false] // todo: no array.. here we need an array to remember that old pos to know if we have to flush? 
    pos_input = -1 // state is your enemy. Keep in sync with delayed Slice [-1,-1] // needed for slice
    //pos_output = [0,-1] // pos[1] lags behind on output if seams are eliminated. 
    concatter = new Array<number[]>()
    fillValues=new Array<Span<number>>() // undefined is not the logical start value  // where to put this? Apparently sub also already delays  and  swap also needs it .. so better put in in Seamless? Caller just needs a simple reorder of calls. Todo in swap? Single Responsible .. logs sure look strange
    // it is important to only strong monotonic pos before using the data values for the last span
    // swap has weak monotonic cutter for center (which may or may not be needed)
    // robust code, cleaner logs, delay stuff all in one place: Delay in class AllSeamless

    removeSeams(//criterium: ((a: number) => boolean),
        _fillValues: Span<number>[] | SpanWithCommonFactor<number>[], // sourceStart: number[],
        pos: number, filled: boolean,
        operation:Result=null, nukeCol?:number,
        whatIf = false // expose the triviality of this premature optimization
    )  // these come indirectly ( gap:number=> gap:bool?) from JoinOperator
    {
        this.flushed=false
        console.log("should be [5] 2: "+(_fillValues as Span<number>[]).map(f=>f.extends + "  ,  "))

        //throw "nase" 
        if (this.pos_input < pos) { // eat zero length  ( Row constructor does this too, but it is only one line ). No code outside this block!
            
            console.log(" going from filled?:" + this.filled[1] + " to filled?: "+  this.filled[0] + " to filled: "+filled );
            console.log("should be [5] 6: "+this.fillValues.map(f=>f.extends)+" should be [5] 3: "+(_fillValues as Span<number>[]).map(f=>f.extends))

            if (this.pos_input>=0 && (this.filled[1]!=this.filled[0])) {this.start_push(this.pos_input) } // now that we advanced, lets note last border (if it was a real edge) // todo pos_input>=0 is indeed bad for the cutter in swap. Though now I use zero length cutter...
 
            // properties? With delegates I get to use Arrays!
            // Test run: pos=1 fillValues.start=0 filled is homogenous .. concatter is already prepared to accept data
            if (this.filled[1] && !this.filled[0]) { // switched before advance 
                if (whatIf) {
                    this.starts++
                } else {
                    {
                    } {
                         // from filled to gap .. flush.  Join encounters a border, determines "filled" and we can use the positios to cut out ranges in the source Rows
                        { // flush .. sure this gap will have length>0 .. seems I need 3 {gap,pos}
                            const t = Array.prototype.concat.apply([], this.concatter)
                            this.data_push(t) // the JS way. I don't really know why, but here I miss pointers. (C# has them):
                            if (this._data_next.length > (this._start_next.length >>1)) { throw "I could not belive it, but log claims 1: "+this._data_next.length +" > "+ this._start_next.length +" >>1  "}
                            this.concatter = new Array<number[]>()
                        }
                    }
                } // RLE does not have seams  // Was for Tridiagonal: we care for all seams
            }
            // now we do not need the oldest value anymore. Discard to avoid errors in code.

            //!whatIf &&
            // 2021-01-03 pulled before concat
            // The caller already delays the value parameters ( filled, start ) one call behind the position parameter (pos). The caller combines the filled states of the sources. Seamless only accepts filled after pos advance anyway.
            if (this.filled[0] /* edge tracking  need have to be over filled area */ && this.fillValues.length>0) { //this.pos.length>1) { // fuse spans   // maybe invert meaning   =>  gap -> filled.  Filled (true) and .extends (length>0) parameters should agree
                //console.log("should be [5] 4: "+this.fillValues.map(f=>f.extends))
                console.log('going to slice '+this.fillValues.map(fv=>" '"+fv.extends+"' slice("+ (this.pos_input - fv.start)+","+( pos - fv.start)+" factor?: "+ (fv as SpanWithCommonFactor<number>).factor+")"))
                if (this.fillValues.some(fv=>fv.extends.length< pos - fv.start)){
                    throw "out of bounds 1: "+filled+" was "+this.filled[0] // break point here to investigate stack
                }
                const cut = this.fillValues.map(fv => fv.extends.slice(this.pos_input - fv.start, pos - fv.start));
                if (operation === null) {
                    this.concatter.push(cut[0]);console.log("push c: "+cut[0])
                } else {
                    // Violation of  Single Responsibility Principle for  Sub
                    // ToDo: Trouble is, I do not really need the slices
                    operation.clear() //const result = new Array<number>() // this sets length, not capacity: pos - this.pos_input[1])
                    for (let k = this.pos_input; k < pos; k++) {
                        let sum = 0
                        const retards = this.fillValues.map(fv => [fv.extends[k - fv.start], (fv as SpanWithCommonFactor<number>).factor])
                        console.log("REusltSub0 :"+retards.map(r=>r[1]))
                        operation.operation(retards)  // some values can become 0. Doesn't look easy to incorporate a check here. Better rely on the Row construction check, which is already needed for the field_to_matrix transformation.
                        
                    }
                    this.concatter.push(operation.result);console.log("push r: "+operation.result)
                }
            } /*else*/ { // flush buffer. Be sure to call before closing stream!
            }

            this.pos_input = pos
            // Keep this below to get consisten logs

            // Delay three positions because: Confirm by advance (3), compare with previous value (2)
            // Caller already delays "filled" in the sources by appropriating inverting bit0 of index into starts[]
            // So we do not have to deal with 3 fill values and 8 combinations in our heads and in automated tests ( state is your enemy )
            this.filled[1] = this.filled[0] // last possible moment. Quite some lag to compensate
            this.filled[0] = filled
            // match value delay to position delay
            this.fillValues=_fillValues // Todo: hide using inner function
        }
        
    }

    // better be sure to end with gap=true (from span end .. test?) or else call this
    // Build pattern to avoid the state code in the accessor? 
    flush() {
        if (this.filled[1] /* condition derived from log while debugging. Maybe test? */) { // to keep even numbeer of open and close .. looks better in log .. also even worse than a seam (aesthetically) .  todo test for this
            this.start_push(this.pos_input)
            if ((this._start_next.length & 1) ===1) {throw "Matrix starts empty, and ends empty"}
            const t : number[]= Array.prototype.concat.apply([], this.concatter)
            console.log("flush: "+this._start_next.join() + "->"+ t.join() +" by the way, filled: "+this.filled)
            // is filled, so there must be data available
            if (this.concatter.length<=0) {throw "with filled there needs to be data!"}
            
            this._data_next.push(t)
            if (this._data_next.length > (this._start_next.length >>1)) { throw "I could not belive it, but log claims 2: "+this._data_next.length +" > "+ this._start_next.length +" >>1  "}
        }else{
            console.log("flush: not because stream is not active" )
        }
        this.flushed=true
    }
}

// speed optimization ( premature? )
class Passes{
    jop:JoinOperatorIterator
    // clearly different signatur => no function array or overloading!
    pass_pos(){// gives pos and gap
    }
    pass_value(){ 
        // fills concater
    }
}

// Clone in JS. I know that it is okay with Row and Matrix. Better not apply recursively on graphs which are not trees!
// https://javascript.plainenglish.io/deep-clone-an-object-and-preserve-its-type-with-typescript-d488c35e5574
export class cloneable {
    public static deepCopy<T>(source: T): T {
      return Array.isArray(source)
      ? source.map(item => this.deepCopy(item))
    //   : source instanceof Date
    //   ? new Date(source.getTime())
      : source && typeof source === 'object'
            ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
               Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
               o[prop] = this.deepCopy((source as { [key: string]: any })[prop]);
               return o;
            }, Object.create(Object.getPrototypeOf(source)))
      : source as T;
    }
  }
export class Row{
    starts:number[] //= [0,0,0,0,0,0]; // vs GC, number of test cases
    //ranges=[[0,1],[2,3],[4,5]]
    data:number[][] //= [[],[],[]] 

    // flattens the starts for the join. Adapter to work with partial differential equation of field
    // this constructor tries to avoid GC. Maybe test later?
    // This does not leak in the data structure, which is JS style: full of pointers for added flexibility
    // Mirror and generally metal leads to values > 1 on the diagonal
    constructor(start:Span<number>[] | number[][] ){//number[], data:number[][]){//pos:number, pitch:number, data:number[][], forwardpitch=pitch){
        // we need to filter and map at the same time. So forEach it is  (not functional code here)
        // Basically we could deal with 0 in data and 0 in range, but then we could just go back to full matrix
        // This doesn't yet split. Maybe ToDo  add statistics about internal 0s

        // check for bounds
        // todo: remove zero length
        // trim 0 values
        this.starts=new Array() //counter<<1)  does not work for both types
        this.data=new Array() //counter)
        // Used only in two places in this funtion, but very much needed to clear things up. Promote?
        const last= (a:Array<any>) => a[a.length-1]
        const lasi= (a:Array<any>) => a[a.length-1]++
        
        {//for(let pass=0;;pass++){
            let danglingBond=-1  // semi-open interval. We keep a gap of size 1 because there is no data to concat to yet.
            
            start.forEach( (s: (Span<number> | number[] ))  =>{

                if (Array.isArray( s )){
                    // Array is misused for  (pos|value)  pairs  //why would I add plain start without data. What is this Span thing even
                    if (s[1] != 0){ // avoid zero length intervals
                        if (s[0]==danglingBond){ 
                                {//if (pass===1){
                                    lasi(this.starts)
                                    last(this.data).push(s[1])   //  no fuse? new Array<number>().splice(0,0,...part) // ... seems to shed of "start" . In th 
                                }
                        }else{
                            {//if (pass===1){
                                this.starts.push(s[0],s[0]+1) // should be  in placw
                                this.data.push([s[1]])   //  no fuse? new Array<number>().splice(0,0,...part) // ... seems to shed of "start" . In th 
                            }
                           
                        }
                        danglingBond=s[0]
                    }
                }else{
                    const range=[s.extends.length,0]
                    //const ranpe=ranpe.slice(0,ranpe.length)
                    // only string has trim(). And it can't even return the number of trimmed items

                    // trim 0 values
                    // todo: better two passes: over s and s reverse. That min stuff looks strange
                    s.forEach((t,i)=>{
                        if (t!==0){
                            for(let d=0;d<2;d++){
                                range[d]=Math.min(range[d],i)  // what is this?
                                i=-i
                            }                    
                        }
                    })

                    // if after trim length still > 0 ( range is a closed interval)
                    if (range[0]<=-range[1]){

                        {//if (pass===1){
                            const start=[s.start+range[0],s.start+1-range[1]]
                            const value= s.extends.slice(range[0],1-range[1]) as Array<number>
                            // SetPrototype was the old way. Now we have this way ( is this even proper OOP? ) . In CS 2.0 I would have needed a for loop
                            if (start[0]==danglingBond){
                                lasi(this.starts)
                                last(this.data).concat(value)
                            }else{
                                this.starts.push(...start)
                                this.data.push(value) //new Array<number>().splice(0,0,...part) // ... seems to shed of "start" . In th                                
                            }
                            danglingBond=s[0]
                        }
                    }
                }
            })

            // if (pass>0){
            //     break
            // }

            // fun=(s:Span<number>,range)=>{
            //     this.starts.push(s.start+range[0],s.start-range[1])
            //     this.data.push(s.slice(range[0],range[1]))
            // }
        }
        
        // no such elegant method this.removeSeams() // seamless should be called to become seamless

        // //if (this.starts.reduce<boolean>((v1,v0)=>v1 || v0<0,false) ) {throw "out of lower bound";}
        if (this.starts.reduce<number>((v1,v0)=>v0>=v1? v0 : Number.MAX_SAFE_INTEGER,0) === Number.MAX_SAFE_INTEGER ) {
            console.log(this.starts)
            throw "no order";
        }
    }

    static Single(pos:number, b: number):Row{
        const a=//new Array<Span<number>>(3)
        //a[0]=new Span<number>(0,pos)
        /*a[1]=*/[FromRaw<number>(b)];a[0].start=pos
        //a[2]=new Span<number>(0,pos+1)
    
        return new Row(a)
    }
    private find(at:number):number[]{
        let segment=this.starts.length
        while(this.starts[--segment]>at){
            if (segment<0) return null;
        };
        return [segment, at-this.starts[segment]]
    }
    get(at:number):number{
        const tupel=this.find(at)
        return tupel[0] & 1 ? 0: this.data[tupel[0]>>1][tupel[1]]
    }
    set(value:number, at:number){
        const tupel=this.find(at)
        if (value===0){ // used by field.group* (it does swaps)
            this.clear(tupel,at)
        }else{
            // ToDo: insert behind
            // let  function find return segment  ( without shift )
            let segment=tupel[0]
            if (segment&1){
                segment>>=1
                // vertical (in Matrix) span of horizontal neighbourhood in field 
                    // special cases are in clear
                    // I hope that I do not need them here
                // vertical (in Matrix) span of vertical neighbourhood in field ( pitched )
                // Important: Fill the pitch position.  ToDo: Check for double wide matrix. As of 20201124 has data.length >= 4
                // Maybe later switch to full run length. What about the number of special cases? We need the join and we need an additional  function clear (which can split) 
                this.sub(Row.Single(at,value)) // without factor it just writes all nonnull components of argument to this.row
                // this should find the date with length=0?
            }else{
                this.data[tupel[0]>>1][tupel[1]]=value
            }
        } 
    }

    // Makes you think that  Matrix.Sub  should also be able to detect  0  .. cost: move code around   .. benefit: Matrix with integers can easily hit 0  ..  Bandgap integers? Inverse -> rationals. Pivot? Vectors are floats
    private clear(tupel:number[],at:number){
        let segment=tupel[0]
        if ( (segment & 1) === 0){
            // similar code to set for the cases where trim
                if (this.starts[segment]===at){ // we are looping big to low (because that is the way!) .  Zero span starts towards higher positions
                    this.data[tupel[0]].pop();//push(value)
                    this.starts[segment]-- // ToDo: check
                    return
                }
                if (this.starts[segment+1]===at){
                    this.data[tupel[0]].shift()
                    this.starts[segment]++ // ToDo: check
                    return
                }            
            // pop
            // shift
            // case: cut
            // old: find data with length=0
            // new: 
            this.starts.splice(segment,0,tupel[1],tupel[1]+1)
            segment>>=1
            const d=this.data[tupel[0]]
            this.data.splice(segment,0,this.data[tupel[0]].slice(0,tupel[1]),d.slice(0,tupel[1]),d.slice(tupel[1]))
        }        
    }

    is1():boolean{
        return 1e-6>(
            Math.max.apply(this.data.map(d=>Math.max.apply(d)))-
            Math.min.apply(this.data.map(d=>Math.min.apply(d))) // If no arguments are given, the result is +∞.
        )
    }

    // GC friendly  inplace code  looks ugly :-(
    scale(factor:number){
        if (factor !== 1){ // factor 1 should be default. Lets plot how it detoriates over the process
        this.data.forEach(segment=>segment.forEach((value,i)=>segment[i]*=factor))
        }
    }

    // similar to   shiftedOverlay()  .. only returns one half and does not swap anything within
    // Only one seam, so less loops ( for the other method I would need to place the code in a different project and don't let the debugger go in there, but instead show CI test results )
    // Todo: Make this a test/case wrapper for orderByKnowledge(back)
    //  ButThen: It is so short, humble and easy to debug and can probably create good error messages
    // After orderByKnowledge(back) and for UnitTest.Mul we want to get the inverse as defined in math
    // sub() may have removed seams
    //. So noswap, filter version . How to combine? RemoveSeams is called in there
    splitAtSeam(side:number,pos:number /* Row does not know about matrix and does not know the length (width) of the underlying Matrix */):Row{

        const rr=new Array<Row>() //.fill( new Row([]) ) //cloneable.deepCopy(this))

        var i=0
        while(i< this.starts.length && this.starts[i]<pos) { i++ }  // orderByKnowledge has halves for this

        var r=new Row([])        
        if (side==0){
            r.starts = this.starts.slice(0,i)
            r.data=this.data.slice(0,i>>1) // like in orderByKnowledge. No spurious +1 or anything
            var ultra = r.starts.length - 1
        }else{
            r.starts=this.starts.slice(i)
            r.data=this.data.slice(i>>1)
            ultra=0                
        }
        //for(var side=0;side++;side<2){
        if (i&1){                
            var l=pos-r.starts[ultra]  // todo: search for last()
            if (l!=0){
                r.starts.push(pos)
                r.data.push(this.data[i>>1].slice(l))
            }
        }
        //}
        return r

        //remove zero length

       
        rr[0].starts.push(pos)  // this is all checked in JoinOperatorITerator. I hate to do it here
        rr[1].starts.slice(i)
        rr[1].starts.unshift(pos) // this is all checked in JoinOperatorITerator. I hate to do it here




        // rr[0].starts.forEach((s,i))


        // this also does not distinguish between start filled  vd  start empty
        // jop has active source. 
        const jop=new JoinOperatorIterator(this.starts,[pos]) // does starts+data(no it does not), avoids zero length ( while also avoiding edge cases )
        // // todo: No Start yet. Where is that
        // const startss=new Array<Row>()
        // var rl:number
        // var seam=pos
        // do{
        //     var starts=new Array<Number>()            
        //     while(  (rl = jop.next()) < seam ){
        //         starts.push( rl )
        //         // where is data?
        //     }
        //     const r=new Row([])
        //     r.starts=starts


        //     startss.push(t)
        //     seam=this.starts[this.starts.length]
        // }while( startss.length<2) // caller expects this 
    
        // //I need to get rid of pointers and iterators
        // // constructor takes number[][] .. somehow I need something in between lying array and spans
        // const testPoint=startss.map(start=>new Row(start))
        // return null //new Row(0);
    }

    // trying to avoid  join  artifacts
    extendUnity(pos){
        // Seamless is only for statistics on sparse inversion. Sub should still work with seams: //const drain=new Seamless()
        this.data.push([1])
        this.starts.push(pos)
        this.starts.push(pos+1)
    }


    // todo: remove in child class due to all the calls
    // the data blow up part -> log and print statistics! Also see stackoverlow: inverse of a sparse matrix
    // Doesn't look like this code knows about the number of spans. So do I really need the constraint? After all, I cannot enforce anything using spans. Permutation is transparent to this.
    sub(that:Row, factor?:number, nukeCol=-2 /* < -1 <= pos */){
        let start_next:number[]=new Array<number>() //        =this.starts.slice() // copy all elements
        let data_next:number[][]=new Array<number[]>() // becomes the new Data array. Created push by push, splice by splice
        that.starts
        //let combinedStarts=[]

        // sides is only for target row
        /*for (let side = -1; side <= +1; side += 2)*/ //{
        let n= 0 //: number /// for pass=2

        // not using passes right now. Maybe need to add aflush . for (let pass = 0; pass < 2; pass++) {
            //console.log('pass '+pass+' data '+this.data.map(d=>d.length).join())
            // was needded for  TRI diagonal. Not for RLE. We do pivot like text book (no innovation) .let gaps: number[][] = [[], []]
   
            const jop=new JopWithRefToValue(this,that) // source stream  ToDo use this instead of code below
            const drain=new AllSeamless() // target stream

            let i = 0 // this  Mybe use .values instead?
            let a = 0 // that
            let story:number[]=[]
            let gap=0
            //let data_i=0
            //let concatter:number[][]=new Array<number[]>() //,cut1:number[];

            let pos:number
            //=new Array<Span<number>>()
            // was the old way to keep Seamless smaller. TDD at its worst I guess. Trapped me in Swap. \\let these:Span<number>[]=[]
            // Maybe we should check for input data. No idea what jop does without input though.
            while(  (pos = jop.next()) < jop.behind ){ // last is just after the end in Matrix {  pos behind does not deliver any results with slice. We have the extra flush method to avoid application of superfical parameters
 
                // inverting is supposed to clear (upper or lower) triangles completely
                // if (nukeCol < pos && nukeCol >= drain.pos_input[0]){
                //     drain.removeSeams(these, nukeCol, !jop.i[0].every(v => v.filled === false), factor /* sorry */, nukeCol);
                //     drain.removeSeams(these, nukeCol+1, false, factor /* sorry */, nukeCol); // delete cell
                // } // todo test: pos is at 1, these[0].start is lagging at 0 .. length 1 .. That means: pos is behind the span .  Debug: 5 times "dive into"
  
                //let pointer = this.data//;throw "this hack does not scale and especially does not work with filter"
                // for(let j=1;j>=0;j--){ // only this explict code works with  "this" and "that" data
                
                if (jop.i.length != 2) throw "This is a binary operator!"
                // jop.i.from starts at 0 and this is okay, as starts start at 0 .. Starts point into the start of the matrix and these >= 0
                // so at first pass, ii.from=0 is valid (though, we could be before), but is ii.filled?
                jop.i[1].factor=factor
                const these = jop.i.filter(ii=>ii.from <= ii.max && (ii.filled /* looks back like ValueSpanStartInMatrix */)).map(ii => {
                    //  const ii=jop.i[1][j]
                    if (typeof ii.ValueSpanStartInMatrix === "undefined" ||  typeof ii.ValueSpanStartInMatrix !== "number"){
                        throw "all indizes should just stop before the end ii.mp. From: "+ii.ValueSpanStartInMatrix
                    } 
                    const thi = new SpanWithCommonFactor<number>(0, ii.ValueSpanStartInMatrix)
                    thi.factor=ii.factor
                    
                    if (typeof ii.from === "undefined" ||  typeof ii.from !== "number"){
                        throw "all indizes should just stop before the end ii.from"
                    }
                    thi.extends = (ii as NowNotOnlyStartInMatrixButAlsoValuesAtThatPos).values[ii.from >> 1]  // advance from RLE to values => join .. ToDo: inheritance from .starts:number[] to Span and let  TypeScript Check. Still the base type would just be a number. Also the index count differs by a factor of 2 
                    //pointer = that.data
                    //console.log(" span.start: "+thi.start );
                    return thi
                })

                console.log(" pos: "+pos+" we just transitioned to: "+!jop.i.every(v => v.filled === false)+ " sources to fill from: {"+these.map(t=>("start: "+t.start )+(",len: "+t.extends.length))+"}");
                // first pass, just store pos for slice()

            
                const Sub=new ResultSub()
                // before filter Sub.factor=factor
                drain.removeSeams(these, pos, !jop.i.every(v => v.filled === false), Sub, nukeCol);       
                // if ( jop.i[1][j] ){
                //     const thi=new Span<number>(0, pointer.starts[jop.i[j]] )
                //     thi.extends=pointer.data[jop.i[j]>>1]
                //     these.push(thi)
                // }

                // up the last position in the matrix at least one of these has values        
            }; 

            // This should be  equivalent to pos=jop.last, but is somewhat more concise: we are out of bounds and need to get outta here!
            drain.flush(); // after we filled concater in the last cycle of the loop and set filled=false, we now confirm that no zero length are to come
            // nothing comes after the end of the last span ..  and with end I mean position in matrix not in Starts
            // drain.flush // pretty sure I need this. I'll just try out to live with less LoC

            if (! jop.i.every(v => v.filled === false) ) throw "last boundary should be a closing one"
        
        // flip buffers
        this.starts = drain.start_next
        this.data = drain.data_next

        console.log("now in sub: "+this.starts.join('') + "->"+ this.data.join('') )
    }

    // shift= copy at orher half. overlay of swap info over data? Does so it groups columns. Where are the two groups? I understand that we only need one Join because the span structure is due to the orginal field
    public shiftedOverlay(length: number, delayedSWP: number[], spans_new_Stream: Seamless[] /* out parameter */, dropColumn=false) {
        if (spans_new_Stream.length !== 2) throw "spans_new_Stream.length !== 2"
        var delayedRow = new Row([])
        // rename trick //const row=this
        delayedRow.data = this.data
        delayedRow.starts = this.starts.map(s => s + (length >> 1)) // this is clearly simpler than some function injection indirection. Also: fast due to me using spans already. It is called "dynamic programming", I guess.

        //join starts and swap
        const l = this.starts.length >> 1
        //for(let half=0;half<l;half+=l>>1){
        let jop = new JoinOperatorIterator(this.starts, delayedRow.starts, delayedSWP /* uhg, ugly join */) //row.starts.slice(0,l),row.starts.slice(l,l<<1),swapHalf)

        // ^ so this is one indirection less then needed
        // gotta change  FillValues.ValueSpanStartInMatrix 
        let pos: number
        //const spans_new=new Array<Span<number>>()
        // const spans_new_Stream=new AllSeamless()  // jop doesn't like zero length ( if => while, but debugging nightmare ). So zero length gaps can give zero progress on "position in Matrix" .. so what?
        //let last_gap=0 //jop.gap
        //const secondHalf=new Array<Span<number>>()
        // todo: test that swap  discards the single source outside of the overlapping range
        while ((pos = jop.next()) < (length) /* we only care for the overlap ..  = flush does this. Also in jop all source cursors advance in lock step */ /* jop.behind */ /* could be replaced by < Matrix.width */) {
            // sub uses job.gap&3 !==0
            // swap uses (not sure about all the brackets):
            // we have two sources and two targets and either pass through or swap  //const activeSource = jop.i[2].filled /*swap active*/ ? 1 : 0

            // this is more or a test of jop? While i[] goes behind starts, pos stays within (behind==abort) and starts goes behind matrix and any of the inputs can already be behind (but not all)
            // todo: what does pos=-1 mean? Center seam! Todo: remove from code somehow. Maybe overwrite method in Seamless via inheritance or something? Test with Row.lenght and without.
            jop.i.forEach((j, k) => {
                console.log( j.ValueSpanStartInMatrix + " <= " + pos + " < " + j.ex[j.from] + " from: " + j.from + " <= " + j.ex.length + " filled " + j.filled)
            })
            //console.log("") // spacer



            // console.log(" from  : " + jop.i[activeSource].from   + ' pos: ' + pos + ' >= ' + (this.row.length>>1))
            // console.log(" filled: " + jop.i[activeSource].filled + " row data.length: " + row.data.length)
            if (pos >= (length >> 1) /* find first span after center-seam (hopefully) */) // .filled >> (jop.filled >> 2 )) & 1 ) ===0)
            {


                // what does this even eman? t.extends=row.data[i].slice(...relative.map(x=>x-row.starts[i]))
                // don't jop and seams handle this: spans_new.push(t)

                // [starts, delayedStarts] .. pos >= (length >> 1) => delayed Starts are the non-swapped starts. filled === i=0
                spans_new_Stream.forEach((AS, i) => {
                    const activeSource = (i === 0) === jop.i[2].filled ? 0 : 1
                    const filled=jop.i[activeSource].filled  // XOR^3

                    const interfaceIsSharedWithSub = new Array<Span<number>>()
                                    // Todo: This needs to be a loop because I only go over the starts at one half because shifting the copy only gives me that. So I need to fill t.extends within the for loop in 892
                    if (filled) {
                        let t = new Span<number>(0, jop.i[activeSource].ValueSpanStartInMatrix)
                        // does not matter because data is the same //const starts=jop.i[2].filled ? row.data: de
                        t.extends = this.data[jop.i[activeSource].from >> 1 /* Maybe I should write an accessor */] // 

                        const i = jop.i[activeSource].from
                        if ((i >> 1) >= this.data.length) {
                            console.log('place breakpoint here ' + (i >> 1) + ' >= ' + length + "  filled? " + jop.i[activeSource].filled)
                            console.log('place breakpoint here ' + (i) + ' >= ' + length + "  filled? " + jop.i[activeSource].filled)
                        }
                        console.log(" i: " + i + " data[i]: " + this.data[i >> 1]) // enforcePivot.ts:915  i: 1 data[i]: undefined
                        console.log("should be [5] 0: "+t.extends)
                        interfaceIsSharedWithSub.push(t)
                    } // else, just let removeSeam note the closing edge
                    console.log("should be [5] 1: "+interfaceIsSharedWithSub.map(f=>f.extends))
                    AS.removeSeams(interfaceIsSharedWithSub, pos, filled  )
                })
                // not good: secondHalf.push( interfaceIsSharedWithSub, pos,jop.i[1-activeSource].filled)
            } // without source data there is not need to push something ( at least remove unnecessary log entries )

            // sub uses concatter and (pass1gap === 0 ) ! to remove seams
            // if ((jop.gap & 1) === 0 ){
            //     last_gap=jop.gap
            //     last_Cut=pos           // todo: trim is responsible for this. Only leave here if it does not cost a lot of code
            // }
        }

        // todo:  eat zero values   as  in place
        //const row_new=new Row(spans_new) // does trim 0 valus, but cannot fuse spans via start
        if (spans_new_Stream.length !== 2) throw "spans_new_Stream.length !== 2  1"
        
        spans_new_Stream.forEach(AS => AS.flush()) // access to start_next without flush should result in an error. Type conversion? Should not have no effect here due to central seam cutter .. ah no, has zero length. Aft seam cutter could get a length? After all length was not the reason for an error
        this.starts = spans_new_Stream[0].start_next.map(ns => ns - (length >> 1)).concat(spans_new_Stream[1].start_next) // todo: inheritance from common base due to same private data.
        try{
        console.log(this.starts.length+" = "+ spans_new_Stream[0].start_next.length + " + " + spans_new_Stream[1].start_next.length)
        }catch{
            console.log("span did not have two spans")
        }
        console.log("row.starts: " + (this.starts))
        if (this.starts.filter(r => r < 0).length > 0) {
            throw "shifting forth and back  does not  match "+ spans_new_Stream.map(s=>"["+s.start_next+"]") //this.starts // 0,-2,3,1
        }
        this.data = Array.prototype.concat.apply([],spans_new_Stream.map(ns => ns.data_next))

        try{
            console.log(this.data.length+" = "+ spans_new_Stream[0].data_next.length + " + " + spans_new_Stream[1].data_next.length) // 2=0+1
            }catch{
                console.log("data did not have two spans")
        }        
        if (this.data.length > (this.starts.length >>1)) { throw "I could not belive it, but log claims 0: "+this.data.length +" > "+ this.starts.length +" >>1  "}
    }


    // parent needs to add Matrix.length
    holdBothsides(i:number){
        /*
        this.starts.unshift(-i+1);  // matrix is mirrord on the left
        this.starts.unshift(-i);
        */
       this.starts.push(i)
       this.starts.push(i+1)
       this.data.push([1])
    }

    static printScale=30;

    // parent has to initialize buffer because we fill only defined values
    PrintGl(targetRough:Uint8Array, targetFine:number ){
        this.data.forEach((d,i)=>d.forEach((cell,j)=>{
            let p=targetFine+(this.starts[i<<1]+j)<<2
            targetRough[p++]=cell<0?cell*Row.printScale:0
            targetRough[p++]=cell>0?cell*Row.printScale:0
            targetRough[p++]=0
            targetRough[p++]=255 // better not do black numbers on black screen  
        }))
    }

    // parent has to initialize buffer because we fill only defined values
    print(targetRough:ImageData, targetFine:number ){
        this.data.forEach((d,i)=>d.forEach((cell,j)=>{
            targetRough.data.set([
                cell<0?cell*Row.printScale:0,
                0,
                cell>0?cell*Row.printScale:0,255], // cannot do black numbers on black screen
                targetFine+(this.starts[i<<1]+j)<<2)
        }))
    }

    innerProduct(column:number[] ):number{
        let acc=0
        this.data.forEach((d,i)=>{d.forEach((cell,j)=>{
            acc+=cell*column[j+this.starts[i<<1]]
        })})
        return acc
    }    

    // only used for test. The other matrix will be an inverted Matrix, which is not sparse
    innerProduct_Matrix(M: Tridiagonal):Row {
        //const accs=new Span<number>(M.length(),0)
        //for (let acc_i = 0; acc_i < M.length(); acc_i++)
        // todo class cursor with ref to row
        const cursors=new Array<number>(M.length()).fill(0) // other source is not sparse => no jop  
        const accs=M.row.map((row,acc_i)=>{
            let acc = 0
            this.data.forEach((d, i) => {
                d.forEach((cell, j) => {
                    acc += cell * row[j+this.starts[i<<1]].get(acc_i) // M.getAt(j+this.starts[i<<1], acc_i)
                    // todo: don't dive into  row.find all the time. 
                })
            })
            //accs[acc_i]=
            return acc
        })

        // not sparse .. huh?

        {
            let a=new Array<Span<number>>(3) //=[[],[],[]];
            a[0]=new Span<number>(0,0) //.start=0)
            //a[1]=accs
            //a[2]=new Span<number>(0,accs.extends.length)
            const row=new Row(a) //0,0,[[],[],[]])
            //row.data[1]=accs
            return row
        }
    }
    
    
    innerProductRows(that:Row ):number{
        const jop=new JopWithRefToValue(this,that) //this.starts,that.starts)
        //jop.ZipValues([this.data,that.data])
        // monkey patch the  indices
        // const pick=(data:number[][],i:FilledFrom)=>{
        //     if (data.length<=(i.from>>1)-1/*trial and error*/ || p<i.ex[i.from-2]){ //}.ValueSpanStartInMatrix){
        //         throw "not in order: "+data.length+" <= "+i.from + ">>1 || "+p+" < "+i.ValueSpanStartInMatrix+" !"
        //     }
        //     console.log(data.length+" "+i.from + " >>1)-1/*trial and error*/][" + p + " - " + i.ex[i.from-1])
        //     return data[(i.from>>1)-1/*trial and error*/][p-i.ex[i.from-2]] //i.ValueSpanStartInMatrix]
        // }

        const a=new AllSeamless();

        // so this is the same as sub/Seamless. It only changes the innerloop. I could not finde a simpler solution to the underlying structure 2021-01-16
        // unify sub and inner product?
        // let acc=0
        let pos:number

        // throw " this does not work with filter! todo"
        // let pointer = this.data // code from sub  todo here and there: extend or wrap JOP to add values
        // let check=this.starts
        
        // let p= Math.min.apply(0, j.i.map(i=>i.ex[0]) )  // does not work because pos lags behind from
        // let filled=false
        // //throw " from also needs a delay that gets too complicated. I need to use  code from swap or sub here"
        while ((pos = jop.next()) < jop.behind) {
            //const interfaceIsSharedWithSub = new Array<Span<number>>()

            const filled=!jop.i.some(i => (i.from & 1) === 0)
            console.log(pos+" "+jop.i[0].from+ " 01 "+jop.i[1].from+ " filled: "+filled)

            const these = jop.i.filter(ii=>ii.from <= ii.max && (ii.filled /* looks back like ValueSpanStartInMatrix */)).map(ii => {
                // code from sub
                //  const ii=jop.i[1][j]
                if (typeof ii.ValueSpanStartInMatrix === "undefined" ||  typeof ii.ValueSpanStartInMatrix !== "number"){
                    throw "all indizes should just stop before the end ii.mp. From: "+ii.ValueSpanStartInMatrix
                } 
                const thi = new Span<number>(0, ii.ValueSpanStartInMatrix)
                
                if (typeof ii.from === "undefined" ||  typeof ii.from !== "number"){
                    throw "all indizes should just stop before the end ii.from"
                }
                thi.extends = (ii as NowNotOnlyStartInMatrixButAlsoValuesAtThatPos).values/*pointer*/[ii.from >> 1]  // advance from RLE to values => join .. ToDo: inheritance from .starts:number[] to Span and let  TypeScript Check. Still the base type would just be a number. Also the index count differs by a factor of 2 
                {
                    const round=(ii.from >> 1) << 1
                    if (thi.extends.length < ii.ex[round+1]-ii.ex[round] ){
                        throw "starts do not match  data.length "+ thi.extends.length+" <= "+ii.ex[round+1]+" - "+ii.ex[round] +" round : "+round 
                    }

                    if (thi.extends.length <= pos-ii.ex[round] ){
                        throw "out of bounds 0. Filled should have toggled to false"
                    }                    
                }

                // pointer = that.data
                // check=that.starts
                //console.log(" span.start: "+thi.start );
                return thi
            })
            const mul=new ResultMul()
            a.removeSeams(these, pos, jop.i.every(v => v.filled /* differs from sub */ ), mul /*inject multiply */) //, factor /* sorry */, nukeCol);

            // if (filled) { // it is just one bit => trial and error.   !i.filled)){  // inverse logic (AND instead of OR) to the sub enclave in Seamless. todo: compare

                
            //     if (p < 0) throw "something is wrong with filled"
            //     for (; p < pos; p++) {
            //         acc += pick(this.data, j.i[0]) *
            //             pick(clmn.data, j.i[1])
            //         if (isNaN(acc)) {
            //             throw "Two lines abo ve: !j.i.some(i=>!i.filled    is buggy .Nan due to: " + this.data + "," + j.i[0] + "," + clmn.data + "," + j.i[1]
            //         }
            //         p++ // delay like the first in sub and swap?
            //     }
            // }
            // p = pos

        }
        a.flush()
        console.log(" before reduce : "+ a.data_next.map(d=>d[0]))
        return a.data_next.reduce((p,v)=>p+v[0],0)  // could ony sum up per span .. otherwise the type system gets very ugly. I do only expect a small number of spans. I would rather add a  reduce number of spans policy  than complicating this code
        //return acc
    }
}

// class RowTest{
//     data(){
//         let row=new Row(3,4,[[0.25],[0.25],[0.25],[0.25]]);
//     }
// }

export interface Matrix{

}

export class Tridiagonal implements Matrix{
    row:Row[]
    constructor(length:number|Row[]){
        if (typeof length === "number")
        {this.row=new Array(length)}
        else[
            this.row=length
        ]
        //I cannot create rows
        //I do not want thousand different constructors
        //user will have to fill the array

        // Square because I need the inverse
    }

    is1():boolean{
        for(let i=0;i<this.row.length;i++){
            if (this.row[i].is1()) return true
        }
        return false
    }

    setTo1():Tridiagonal{
        for(let i=this.row.length;--i>=0;){
            this.row[i]=Row.Single(i,1) //new Row(i,0,[[],[1],[]])
        }
        return this // enable chain
    }

    length():number{
        return this.row.length
    }
    getAt(row:number, column:number){
        return this.row[row].get(column);
    }

    // Todo: make the same as [this.row,inve.row].forEach(side=>side[k].sub(side[i],f))
    public swapColumns(swapHalf:number[] /* I only explicitly use bitfields if I address fields literally */, dropColumn=false){
        if (swapHalf.length>0){ // jop should better be able to deal with empty? Down in innerloop I look at delayedSWP.. ah no I do not!
        let //adapter=[]
        // always needed for merge  // if (swapHalf.length & 1 && swapHalf[0]>0){ // match boolean on both sides. It starts globally with swap=false
            adapter=[swapHalf.length] // Maybe move this code to field? Where is "augment" ?
        //}
        //const swap=swapHalf.concat(adapter,swapHalf.map(pos=>pos+swapHalf.length)) // "mirror"
        const delayedSWP= [0,0].concat(  swapHalf.map(pos=>pos+(this.row.length>>1)) , [this.row.length,this.row.length]) // concat: cut spans which span the center. This method seems to be responsible for this feature
        // 2021-01-06  This looks bogus in log of jop ( too short, so check)
        console.log(" swap " + swapHalf + " -> " + delayedSWP) 
        // -1 does not work well with jop (it should though), where pos (into matrix) is initialized with 0 => input cursors advance before being put in lockstep. Todo: throw in jop? Calculate jop from inputs?
        // I can stay positive when I add this to row.starts / and delayed starts  ...  and data :-(
        // Or like this:
        //const fillFliper = swapHalf[0]=0

        // ToDo: three way join? Now I understand why other people use indirection instead of RLE
        // I could cut out using the swapHalf-Mask and then swap ( which should just fit/match ) and then trim spans ( remove zero lengths ) by constructing new Rows
        let last_Cut=0
        // Seamless already does the mapping part. Todo seamless is Row? but: shold I manually shorten the prototype chain to remove access to some methods?   . this.row=this.row.map
        this.row.forEach((row,i_row)=>{ // the block clearly separates singular and plural
            const spans_new_Stream=[new AllSeamless(),new AllSeamless()] // todo: inject unit test debug moch    I copy row instead  l)
            const length=this.row.length ; // data private to Matrix. Maybe Row should know its length? But it would be duplicated state. Pointer to parent Matrix? Maybe later.
            
            // todo: this becomes a method of class Row
            // What does "Overlay" mean?
            row.shiftedOverlay(length, delayedSWP, spans_new_Stream, dropColumn)
            //return spans_new_Stream
        })
}}

    PrintGl():SimpleImage{
        const s=this.row.length
        const pixel = new Uint8Array(s*s*4); // 2+4+4 = 10
        // RGBA. This flat data structure resists all functional code
        for(let i=0;i<pixel.length;){
            // greenscreen
            pixel[i++] = 0
            pixel[i++] = 0
            pixel[i++] = 128
            pixel[i++] = 255
        }
        
        for(let r=0, pointer=0;r<this.row.length;r++, pointer+=s /*20201117 first test: 4*/){
            const o=this.row[r]
            if (typeof o==="undefined" || o.starts.slice(-1)[0]>this.row.length){
                // o=undefined should not happen. I should probably not construct an undefined row todo..
                console.log("Starts: "+o.starts+" > "+this.row.length)
                throw "out of upper bound"
            }
            o.PrintGl(pixel, pointer)
        }
        return {width: s, height:s, pixel: pixel};
    }    
    print():ImageData{
        const s=this.row.length
        const iD=new ImageData(s,s)
        // RGBA. This flat data structure resists all functional code
        for(let pointer=0;pointer<iD.data.length;pointer+=4){
            iD.data.set([0,255,0,255],pointer) // greenscreen
        }
        
        for(let r=0, pointer=0;r<this.row.length;r++, pointer+=4){
            this.row[r].print(iD, pointer)
        }
        return iD;
    }


    AugmentMatrix_with_Unity(){
        const M=this
        const rows=M.row.forEach((r, i) => {
            r.data.push([1])
            const s = M.row.length + i
            r.starts.push(s)
            r.starts.push(s + 1)
          })
    }

    // Only works on rectangular matrix. Inverse is a sideeffect in the right columns if you called "AugmentMatrix_with_Unity" before. Can only call it once. But 
    inverseRectangular() /* in place  : Tridiagonal*/{
        //we run inverse on 2x1 rectangular matrix //const inve=new Tridiagonal(this.row.length).setTo1() // I may want to merge the runlength encoders?

        // I try to hide the start index of arrays in languages. Thus I need forEach
        this.row.forEach( (rl,i)=>{
            // if (inve.row.length<=i){
            //     throw "outofBounds in inverse "+i
            // }
            if (typeof this.row[i] === "undefined"){
                throw "this is undefined: "+i
            }
            // if (typeof inve.row[i] === "undefined"){
            //     throw "inverse is undefined: "+i
            // }
            if (Math.abs(rl.get(i))<0.0001) { // rounding error. To avoid: Use multiplication to clear rows and normalize afterwards. But even then: 64 bit feels a lot, but a checker chess board may almost make sense, but Laplace in 2d has a four, so only 32 fields. So yeah maybe check 4x4 sectors offline? But what about coding mistakes later?
                throw "division by zero (matrix undefinite)"
            }
            const factor=1/rl.get(i) // resuts in -1 as Matrix: expel the -sign as far as possible out of my logic ( + commutes, *(+factor) is default)
            console.log("factor: "+factor+"  from "+rl.data );//+ " and "+ inve.row[i].data);
            rl/* ,inve.row[i]].forEach(side=>side*/.scale(factor)//);
            console.log("factor: "+factor+"   to  "+rl.data );//+ " and "+ inve.row[i].data);
            this.row.forEach((rr,k)=>{ if (k!==i){
               const f=rr.get(i)
               if (f!==0){
                //[this.row,inve.row].forEach(side=>side[k].sub(side[i],f))
                // duplicated code leads to bugs! 2020-01-20
                rr.sub(rl,f) // ToDo: nuke column
                // inve.row[k].sub(this.row[i],f)
               }
            }})
        
            this.row.forEach((rr,k)=>{
                const f=rr.get(i);
                const s= (k===i) ?1:0;
                if (Math.abs(f-s)>0.001){
                    throw "column not empty i/live: "+f+" should be "+s
                }
             })
        })

        console.log("inside Tridiagonal.inverse "+this.row[0].data[0][0])
        for(let i=0;i<this.row.length>>1;i++){
            for(let k=0;k<this.row.length;k++){ //if (k!==i){
                const f=this.row[k].get(i);
                const s= (k===i) ?1:0;
                if (Math.abs(f-s)>0.001){
                    throw "column not empty i/delayed: "+f+" should be "+s
                }
             }
        }

      //  return inve
    }

    // for unit test
    inverse(): Tridiagonal{
        const M=cloneable.deepCopy(this)
        // clone .. for the multiplication tests. Deep Clone: Rows, start, data
        M.AugmentMatrix_with_Unity()
        M.inverseRectangular()
        // return right half of clone
        const M2=new Tridiagonal(0) // split does not work in place because it may need space at the seam
        M2.row=M.row.map(r=>r.splitAtSeam(1,this.row.length ))
        return M2
    }
    
    // ToDo on demand
    //inverseWithPivot(): void {
        // What is this pivot thing anyway? Double wide matrix. Check for largest element with unknown column header. Clear other entries in this column.
        // For span optimization I may want to use a row with the shortest span. Make sure that larges entry is not greater by a factor of 16? Consider contrast in Row and column?
        // I may want to backtrack, I matrix grows beyond a certain factor  =>  print statistics

        // You know in LU this would not be possible, but we don't want a vector, we want a matrix.
        // LU   or the recipe in Wikipedia: First do L to get the determinant. But our code cannot catch this exception, so why bother? With L matrix I would need to keep a book about finished rows 

        // Pivot is a can of worms
    //}    


    // MatrixProduct(that:number[]|Tridiagonal) {
    //     throw "not maintained"
    //     if (Array.isArray( that ) ) { // Poisson simulation uses columns
    //         return this.row.map(r=>{
    //             return r.innerProduct(that)
    //         })
    //     } else{ // mostly to test inverse
    //         const degen=new Tridiagonal(this.length())
    //         degen.row=this.row.map(r=>{
    //             return  r.innerProduct_Matrix(that)
    //         })
    //         return degen
    //     }            
    // }


    //product
    //Tridiagonal|
// }



// dead end. This creates a lot of unnecessary calls to class jop and seamless 
// // Note how the filenam as of 20201124 still contains "enforcePivot", but that responsibility lies fully within field.cs
// export class MatrixTupelWithCommonSpans extends Tridiagonal{
    inverseHalf(){
        //const inve=new Tridiagonal(this.row.length) // I may want to merge the runlength encoders?

        for(let i=0;i<this.row.length>>1;i++){
            this.row[i].scale(1/this.row[i].get(i)) // uh rounding. At least our cell of interest should be exactly 1 after this. Or?
            //this.row[i].set(1,i); // combat rounding while still minimizing the number of divides
            for(let k=0;k<this.row.length;k++)if (k!==i){
               const f=this.row[k].get(i)
               if (f!==0){
                this.row[k].sub(this.row[i],f,i) // No rounding problems anymore. Multiplication with 1 is safe. Still, let's be a bit explicit here
                //inve.row[k].sub(this.row[i],f)
               }else{
                   throw "pivot is broken"
               }
            }

            for(let k=0;k<this.row.length;k++){ //if (k!==i){
                const f=this.row[k].get(i);
                const s= (k===i) ?1:0;
                if (Math.abs(f-s)>0.001){
                    throw "column not empty live: "+f+" should be "+s
                }
             }
        }

        console.log("inside inverse Half "+this.row[0].data[0][0])
        for(let i=0;i<this.row.length>>1;i++){
            for(let k=0;k<this.row.length;k++){ //if (k!==i){
                const f=this.row[k].get(i);
                const s= (k===i) ?1:0;
                if (Math.abs(f-s)>0.001){
                    throw "column not empty delayed: "+f+" should be "+s
                }
             }
        }

        throw "use other inverse"
        // in place //return inve
    }

    // both left half and full innerProduct (not really now, but it is --after all-- a Matrix) may make sense
    // inner product works, if the other matrix/vector is shorter. From a math point of view, I would need a Transpose function ( ToDo on demand )
    // !! not in-place !!

    // Though I the sparse Matrix multiplication is my motivation for this project
    // I still don't want users to see different method names.
    // Also we are not in the inner loop and thus don't need to optimize for speed

    MatrixProduct(that:Tridiagonal):Tridiagonal
    MatrixProduct(that:number[]):number[]
    MatrixProduct<CNC extends number[]|Tridiagonal>(that:CNC):CNC {
  
        if (Array.isArray( that ) ) { // Poisson simulation uses columns. // ToDo I have no other matrix multiplication method. Todo: Remove implementation detail from function name
            const result = this.row.map(r => {
               return r.innerProduct( that )
            })

            return result as CNC; // huh?
        } else{ // UsingTranspose   // mostly to test inverse
            const t=new Transpose(that) // hoisting. Todo: Move dependet class up
            const result=this.row.map(r=>new SeamlessWithRef(r))
            let safety=10
            while(t.next()){ // column by column. This fits second matrix to compensate for going cross rows. Left matrix doesn't care becaus MAC is along it rows. Result can't complain because we still stream it (no random access).
                //const acc=that.row.map((dump)=>0) 
                result.forEach(r=> {
                    const s=new Span<number>(1,t.pos)
                    s.extends=[r.ref.innerProductRows(t.c)] // degenerated
                    console.log(s.extends[0]); if ( isNaN( s.extends[0])) {
                        throw "NaN does not make sense in my algorithm"
                    }
                    r.removeSeams(  [s],t.pos, s.extends[0]!==0 ) 
                } )
                // let acc:number
                // result[0].removeSeams([new Span(1,t.i)],t.i,acc!==0)
                if (safety<1) {
                    console.log("endless loop")
                }
                if (safety--<0) {throw "endless loop"}
            }

            // SEamless to Row .. todo how?

            const degen=new Tridiagonal(this.length())
            degen.row=result.map(r=>{
                const row=new Row([])
                r.flush()
                row.starts=r.start_next  // I really miss constructor overloading                
                row.data=r.data_next     // 0 is removed as "not filled" in the per element writing to r.removeSeams
                return  row //todo  where do I already remove zeros after seamless? Should I  //r..innerProduct_Matrix(that)
            })
            return degen as CNC // huh?
        }            
    }

}

class SeamlessWithRef extends AllSeamless{
    ref: Row
    constructor(ref:Row){
        super()
        this.ref=ref
    }
}

// similar to jop, but simpler? Maybe it should become a base. jop with single input?
export /* for unit test */ class RowCursor{
   r:Row
   span:number=0
   pos=0
   constructor(r:Row){
       this.r=r
   }
   noSideEffect=true
   advance(i:number):number{
    this.noSideEffect=false
        this.noSideEffect= this.span<this.r.starts.length  // delay: Was there an advance before we got to the current position?  // this looks suspectivly like Seamless. Or more like jop. jop over all rows, but without the slice .. only subscript operator

       // ensure edge to track
       // only accept seamless
       while(this.r.starts[this.span]<=i){ // always track the next edge. otherwise first letter becomes a special case
        if (this.r.starts.length<=this.span){
            console.log("advance: no")

            return this.getValue()
        }
        this.span++
       }

       if (this.span===0){console.log("advance: 0 : "+this.span+" . ")
           return 0}
       this.pos=i-this.r.starts[this.span-1] // trying to avoid simple copy.   Here again the problem of left and right edges of spans/strings :-(   When streaming: looks like lag.
       console.log("advance: 1 : "+this.span+" . "+this.pos)
       //this.noSideEffect=true
       return this.getValue();
    }

   getValue():number{
       const stupidDebugger= ((this.span & 1) === 0) || (this.r.starts.length<=this.span)? 0  // gap
       : this.r.data[this.span>>1][this.pos]
       console.log(" "+((this.span & 1) === 0) +" || "+ (this.r.starts.length<=this.span) + " ? 0 : this.r.data[" + (this.span>>1) +"][" +this.pos +"] " )
       if (typeof stupidDebugger==="undefined"){
           throw " jop and filled should have prevented this out of bounds access"
       }
       return stupidDebugger
    }


    //    if (this.span & 1){
    //        // gap
    //    }
        
    //     +this.pos < i){
    //     while (this.r.data.length>this.span){
    //         if (this.pos <this.r.data[this.span>>1].length){
    //             return true 
    //         }
    //         this.pos=0
    //         this.span++
    //     }

    //         if (this.r.data.length>this.span && (++this.pos)<this.r.data[this.span].length){
    //         }
    //     }
    // this.pos=-1
    //     if ((++this.pos)>=this.r.data.length){
    // return false
}

// Iterator over Matrix which keeps O() for debug, log, performance
export class Transpose implements Matrix{
    M:Tridiagonal
    I:Array<RowCursor>
    c:Row  // column as Row
    pos=-1
      constructor(M:Tridiagonal){
          this.M=M
          this.I=M.row.map(r=>new RowCursor(r))

      }
      next():boolean{
          let anyProgress=false
          // we do not have starts yet:  //const s=new AllSeamless()
          this.c=new Row([]); // trim would mostly work, but what about tridiagonal + pitch and  then scale?
          let last=0
          this.pos++ // so that this class, this.I and this.pos => user of this class  are all on the same page
          this.I.forEach((j,i)=>{
            const v= j.advance(this.pos)
            console.log("side@ "+i+" : "+j.noSideEffect)
            anyProgress||=j.noSideEffect // why is typeScript converting my method with sideEffects into this shortcut code? Just analyse the scopes, compiler!
            if (v!==0 && typeof v !== "undefined"){
                if (last===0){
                    this.c.starts.push(i)
                    this.c.data.push([])
                }
                this.c.data[this.c.data.length-1].push(v)
            }else{
                if (last!==0){
                    this.c.starts.push(i)
                }
            }
            last=v
        })
        if (last!==0) { this.c.starts.push(this.I.length) } // flush
        
        return anyProgress
      }
    getCellInRow(r: number): number {
        return this.I[r].getValue()
     }
}


export interface Result{
    result : Array<number> // concatter / seamless expects this for slice and stuff
    clear():void
    operation(retards: number[][]):void
}
class ResultSub implements Result{
 result = new Array<number>()
 clear(){this.result = new Array<number>()}
 //factor:number 
 
 operation(retards: number[][]):void {
    console.log("REusltSub0 :"+retards.map(r=>r[1]))

    const resultSpan = retards.reduce(this.loop,0) 
    this.result.push(resultSpan)
 }

    private loop(p: number, c: number[]) : number {
            console.log("ResultSub: " + p + " ( (" + typeof c[1] + " !== number || (" + c[1] + " as number)=== 0) ?")
            return ((typeof c[1] !== "number" || (c[1] as number) === 0) ?
            p + c[0]
                : p-c[0] * c[1]
            )        
    }
}


class ResultMul implements Result{
    result = [0] // degenerated .. sorry todo ? 
    clear(){this.result=[0]}
    operation(retards: number[][]):void {
        console.log(" ResultMul, retards: "+retards)
       const resultSpan = retards.map(r=>r[0]).reduce((p, c) => p * c  /* , 1  reduce can't just spit out the only element if type is result of function. But then I do not want unecessary multiplication */ ) // some values can become 0. Doesn't look easy to incorporate a check here. Better rely on the Row construction check, which is already needed for the field_to_matrix transformation.
       this.result[0]+=(resultSpan)
   }
   }