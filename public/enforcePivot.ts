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
    // doesn't work length:number
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

// What is better: Iterator, or a forEach with callback? I want to use "this" for output => iterator;while
// Todo: sub uses this
// Todo: swap uses this
class JoinOperatorIterator{
    s:number[][]
    i:number[] // I need to generalize for swap which needs 3 arrays and iteration 3 times over arrays is worse then iterating over 3 values inside the loop 
    gap=0
    last:number
    constructor(...s:number[][]){
        //let start_next:number[]=new Array<number>() //        =this.starts.slice() // copy all elements
        //let data_next:number[][]=new Array<number[]>() // becomes the new Data array. Created push by push, splice by splice
        this.s=s
        this.last=Math.max(...this.s.map(s=>s[s.length-1]))
            //console.log('pass '+pass+' data '+this.data.map(d=>d.length).join())
            // was needded for  TRI diagonal. Not for RLE. We do pivot like text book (no innovation) .let gaps: number[][] = [[], []]
   
            this.i = new Array<number>(s.length).fill(0) // this  Mybe use .values instead?
            
            //let story:number[]=[]
            // ? let data_i=0
            //let concatter:number[][]=new Array<number[]>() //,cut1:number[];
            // inner join ( sparse version )
    }

    next():number{

            if ((this.i[0] < this.s[0].length || this.i[1] < this.s[1].length) ){
                
            
                    // console.log("i "+i+" a "+a)
                const pass1gap=this.gap;

                /*do*/{
                    // trying to avoid infinity, null and undefined for better readability
                    
                    let cursor=this.s.map(s=>[this.last,s.length])
                    //new Array<[number,number]>(this.i.length).fill([),s.length])
                    // let I:number=this.s[1][this.s[1].length-1]+1
                    // let A:number=this.s[0][this.s[0].length-1]+1

                    let min=this.last
                    cursor.forEach((c,i)=>{
                        const k=this.i[i]
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
                                this.i[i]++
                                this.gap ^= 1 << i
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
            return this.last+1 //null // if (variable === null)    // only in collections: undefined  // if (typeof myVar !== 'undefined')
    }
}

export class Row{
    starts:number[] //= [0,0,0,0,0,0]; // vs GC, number of test cases
    //ranges=[[0,1],[2,3],[4,5]]
    data:number[][] //= [[],[],[]] 

    // this constructor tries to avoid GC. Maybe test later?
    // This does not leak in the data structure, which is JS style: full of pointers for added flexibility
    // basically just flattens the starts? For the join?
    // Mirror and generally metal leads to values > 1 on the diagonal
    constructor(start:Span<number>[]){//number[], data:number[][]){//pos:number, pitch:number, data:number[][], forwardpitch=pitch){
        // we need to filter and map at the same time. So forEach it is  (not functional code here)
        // Basically we could deal with 0 in data and 0 in range, but then we could just go back to full matrix
        // This doesn't yet split. Maybe ToDo  add statistics about internal 0s
        for(let pass=0;;pass++){
            let counter=0
            start.forEach(s=>{
                const range=[s.extends.length,0]
                //const ranpe=ranpe.slice(0,ranpe.length)
                // only string has trim(). And it can't even return the number of trimmed items  
                s.forEach((t,i)=>{
                    if (t!==0){
                        for(let d=0;d<2;d++){
                            range[d]=Math.min(range[d],i)
                            i=-i
                        }                    
                    }
                })
                if (range[0]<=-range[1]){

                    if (pass===1){
                        this.starts.splice(counter<<1,2,s.start+range[0],s.start+1-range[1]) // should be  in placw
                        const part= s.extends.slice(range[0],1-range[1]) as Array<number> //  slice seems to return span.
                        // SetPrototype was the old way. Now we have this way ( is this even proper OOP? ) . In CS 2.0 I would have needed a for loop
                        this.data[counter]=part //new Array<number>().splice(0,0,...part) // ... seems to shed of "start" . In th 
                    }
                    counter++
                }
            })

            if (pass>0){
                break
            }
            this.starts=new Array(counter<<1)
            this.data=new Array(counter)
            
            // fun=(s:Span<number>,range)=>{
            //     this.starts.push(s.start+range[0],s.start-range[1])
            //     this.data.push(s.slice(range[0],range[1]))
            // }
        }


        // this.data=start.map(s=>s.slice()) // convert Span to base class  ES6: [...s] Do I like it?

        // // 2020-11-19 ToDo: This is to complicated: does not work well with vertical edges
        // //this.starts=[].concat.apply([],this.data.map(d=>[pos-Math.floor(d.length/2),pos+Math.ceil(d.length/2)]))

        // // var aggregate=data.map(d=>d.length)
        // // {
        // //     let i=0
        // //     let a=aggregate[i++]
        // //     do{

        // //     }

        // // }
        // // Better do: start of diagonal range  and from there  run length encoding of zeros
        // this.starts=[].concat.apply([],start.map(d=>[d.start,d.start+d.length]))      
        // //this.starts=new Array(6).fill(pos)
        // // {
        // //     const fitch = forwardpitch
        // //     this.starts[0] -= pitch + data[0].length
        // //     this.starts[1] -= pitch + data[0].length
        // //     this.starts[4] += fitch + data[1].length
        // //     this.starts[5] += fitch + data[1].length
        // // }
        // // // for diagonal-only construction
        // // if (this.starts[1]>this.starts[2]){
        // //     this.starts[0]-=this.starts[1]-this.starts[2]
        // //     this.starts[1]=this.starts[2]
        // // }
        
        // // if (this.starts[4]<this.starts[3]){
        // //     this.starts[5]-=this.starts[4]-this.starts[3]
        // //     this.starts[4]=this.starts[3]
        // // }
        
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
        // if (segment & 1){ // it is different for --   compared to ++
        //     return null
        // }
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

    // the data blow up part -> log and print statistics! Also see stackoverlow: inverse of a sparse matrix
    // Doesn't look like this code knows about the number of spans. So do I really need the constraint? After all, I cannot enforce anything using spans. Permutation is transparent to this.
    sub(that:Row, factor?:number){
        let start_next:number[]=new Array<number>() //        =this.starts.slice() // copy all elements
        let data_next:number[][]=new Array<number[]>() // becomes the new Data array. Created push by push, splice by splice
        that.starts
        //let combinedStarts=[]

        // sides is only for target row
        /*for (let side = -1; side <= +1; side += 2)*/ //{
        let n= 0 //: number /// for pass=2

        for (let pass = 0; pass < 2; pass++) {
            console.log('pass '+pass+' data '+this.data.map(d=>d.length).join())
            // was needded for  TRI diagonal. Not for RLE. We do pivot like text book (no innovation) .let gaps: number[][] = [[], []]
   
            const jop=new JoinOperatorIterator(this.starts,that.starts)

            let i = 0 // this  Mybe use .values instead?
            let a = 0 // that
            let story:number[]=[]
            let gap=0
            //let data_i=0
            let concatter:number[][]=new Array<number[]>() //,cut1:number[];
            // inner join ( sparse version )
            do {
                // console.log("i "+i+" a "+a)
                const pass1gap=gap;

                /*do*/{
                    // trying to avoid infinity, null and undefined for better readability
                    let I:number=that.starts[that.starts.length-1]+1
                    let A:number=this.starts[this.starts.length-1]+1
                    if (i < this.starts.length){
                        I = this.starts[i]
                    }
                    if (a < that.starts.length){                    
                        A = that.starts[a]
                    }

                    if (I > A) {
                        a++; gap ^= 2; story[0] = A
                    }else{
                        i++; gap ^= 1; story[0] = I
                        if (I === A) {
                            a++; gap ^= 2
                        }                          
                    }
                }//while(false)
                
                //target value
                if (pass === 1 && story.length===2 /* in pass=0."micro pass"=0 story is not completely filled because border swim in a soup.  This needs reversed story */) { // polymorphism?
                    console.log( 'story '+story[1]+' '+story[0] +' gap '+pass1gap);

                    // function construct only used to retard i and a by two and keep the names. Alternatively I could do a-- and start_next.reverse() or something. Important: ts.push();this.data[index].concat(ts)
                    (function trailing(i:number,a:number){

                        if (pass1gap & 1){  // This is an abbreviation for: "In pass=1 we need the gap value one turn older than the story[] value"
                            console.log('this.data['+i+'>>1].slice('+story[1]+'-'+this.starts[i]+','+story[0]+'-'+this.starts[i]+')')
                            let cut= this.data[i>>1].slice(story[1]-this.starts[i],story[0]-this.starts[i]) // Todo: double buffer? No ts is already the second buffer and non-sparse can only grow (at the moment)
                            if (pass1gap & 2){
                                for(let b=0;b<cut.length;b++){
                                    console.log("b "+b)
                                    const t=that.data[a>>1][b+(story[1]-that.starts[a])]
                                    if (factor){
                                        cut[b] -= factor*t
                                    }else{
                                        //throw "use [get;set;trim] instead"
                                        cut[b] += t   // field.group, field.swap, matrix.set
                                    }
                                }
                            }
                            concatter.push(cut)
                            // old version, which uh, ugly: data_next[data_i].splice(story[1]-(start_next[data_i<<1]),cut0.length,...cut0);           // todo: use start_next to  decide   .. until data is filled: splice 
                        }else{
                            if (pass1gap & 2){
                                console.log('ts.push(that.data['+a+'>>1].slice('+story[1]+'-'+that.starts[a]+','+story[0]+'-'+that.starts[a]+'))')
                                concatter.push(that.data[a>>1].slice(story[1]-that.starts[a-1],story[0]-that.starts[a]))
                            }
                            // else{
                            //     ts.push(Array(story[0]-story[1]).fill(0))
                            // }
                        }
                    }).bind(this)(i-2,a-2)

                    console.log('this.starts['+n+'] === story['+0+']')
                    console.log('if'+this.starts[n]+' === '+story[0])
                    while (this.starts[n] === story[0]) {
                        console.log('ts.length: '+data_next.length)
                        if ((n & 1) === 1) {
                            const index=n>>1
                            const rValue=Array.prototype.concat.apply([],data_next)
                            console.log('pass '+pass+' data '+this.data.map(d=>d.length).join()+'   ['+index+'] = '+rValue)
                            this.data[index]=Array.prototype.concat.apply([],data_next)
                                data_next=[]
                        }
                        n++                        
                    }                    
                }

                // target address. Mostly runs first, but data_next.push runs later
                if ( (pass1gap === 0 ) !== (gap === 0) ) { // switching from gap mode to filled values mode and back                   
                    if (pass===0){
                        start_next.push(story[0]) // note border
                    }else{
                        if (gap===0){ // target value needs to process the end of the span and thus be in a gap. We do a trick here: first initialization of concatter
                            //if (pass===0){
                                //data_next.push(new Array<number>(story[0] - start_next[start_next.length-1])) // create scratchpad to avoid creation of new arrays by concat()
                                //Todo: combine data and start in class span for a single push?
                            //}else{
                                data_next.push(Array.prototype.concat.apply([],concatter)) // the JS way. I don't really know why, but here I miss pointers. (C# has them):
                                /*  var buffer = new ArrayBuffer(24);
                                    var idView = new Float64Array(buffer, byte offset=0*8, length=1*8); // instead of slice
                                    target.set(idView)
                                */
                                concatter=new Array<number[]>()     
                            //}
                        }
                    }
                } // RLE does not have seams  // Was for Tridiagonal: we care for all seams
                story[1] = story[0] // the end of the gap becomes the start of the value-span                

                //  else { // pass=0, but this belongs to the block outside below the while loops.
                //     if (gap === 0) { // gap indicated gap in the output. Gap.bit=0 means: There is a gap. May want to rename variable. Only when both inputs have a gap, does the output have one ( in pass=0 anyway because "Data" (values) come in pass=1)
                //         // we get here only after processing the first starts of the input rows. So on the first "inner pass" in pass=0, story[1] will be set in the other branch
                //         start_next=start_next.concat(story)
                //     } //else { // not a gap
                //     //     story[1] = story[0] // the end of the gap becomes the start of the value-span. we looked back ( larger index => earlier to avoid negative indices when possible)
                //     // } 

                //     // // Special code for Tridagonal
                //     // if (gap !== 0) {
                //     //     story[1] = story[0] // we looked back
                //     // } else { // we record gaps
                //     //     const pointer = gaps[i < 3 ? 0 : 1].slice(1, 2)
                //     //     if (pointer[0] - pointer[1] > story[0] - story[1]) {
                //     //         gaps[i < 3 ? 0 : 1] = [i].concat(story)
                //     //     }
                //     // }
                // }
                // // if before was a gap, but now is no gap
                // if (pass1gap === 0 && gap !== 0) {

                // } // RLE does not have seams  // Was for Tridiagonal: we care for all seams
            } while (i < this.starts.length || a < that.starts.length);


            // Not needed for RLE
            // if (pass===0){
            //     // what to do if there are no gaps?
            //     // main diagonal takes it!
            //     // similar to constructor, but sadly not the same
            //     throw "now RLE"
            //     this.starts= new Array(this.starts.length).
            //     fill(Math.min(this.starts[0                     ],that.starts[0]),0).
            //     fill(Math.max(this.starts[this.starts.length-1  ],that.starts[this.starts.length-1  ]),3)

            //     if (gaps){
            //         for(let side=0;side<2;side++){
            //         if (gaps[side] && gaps[side].length>0){
            //             this.starts.splice(1+3*side,0,...gaps[side])
            //         }
            //         }
            //     }
            // }

       
        }
        // flip buffers
        this.starts = start_next
        this.data = data_next
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

    // only used for test. The other matrix will be an inverted Matrix, which is no sparse
    innerProduct_Matrix(M: Tridiagonal):Row {
        const accs=new Span<number>(M.length(),0)
        for (let acc_i = 0; acc_i < M.length(); acc_i++) {
            let acc = 0
            this.data.forEach((d, i) => {
                d.forEach((cell, j) => {
                    acc += cell * M.getAt(j+this.starts[i<<1], acc_i)
                })
            })
            accs[acc_i]=acc
        }
        {
            let a=new Array<Span<number>>(3) //=[[],[],[]];
            a[0]=new Span<number>(0,0) //.start=0)
            a[1]=accs
            a[2]=new Span<number>(0,accs.extends.length)
            const row=new Row(a) //0,0,[[],[],[]])
            //row.data[1]=accs
            return row
        }
    }    

}

// class RowTest{
//     data(){
//         let row=new Row(3,4,[[0.25],[0.25],[0.25],[0.25]]);
//     }
// }

export class Tridiagonal{
    row:Row[]
    constructor(length:number){
        this.row=new Array(length)
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

    setTo1(){
        this.row.forEach((row,i)=>{
            this.row[i]=Row.Single(i,1) //new Row(i,0,[[],[1],[]])
        })
    }

    length():number{
        return this.row.length
    }
    getAt(row:number, column:number){
        return this.row[row].get(column);
    }

    public swapColumns(swapHalf:number[] /* I only explicitly use bitfields if I address fields literally */){
        let //adapter=[]
        // always needed for merge  // if (swapHalf.length & 1 && swapHalf[0]>0){ // match boolean on both sides. It starts globally with swap=false
            adapter=[swapHalf.length] // Maybe move this code to field? Where is "augment" ?
        //}
        const swap=swapHalf.concat(adapter,swapHalf.map(pos=>pos+swapHalf.length)) // "mirror"
        // ToDo: three way join? Now I understand why other people use indirection instead of RLE
        // I could cut out using the swapHalf-Mask and then swap ( which should just fit/match ) and then trim spans ( remove zero lengths ) by constructing new Rows
        let last_Cut=0
        this.row.forEach(row=>{ // the block clearly separates singular and plural
            //join starts and swap
            const l=row.starts.length >> 1
            //for(let half=0;half<l;half+=l>>1){
            let jop=new JoinOperatorIterator(row.starts.slice(0,l),row.starts.slice(l,l<<1),swapHalf)
            let pos:number
            const starts_new=new Array<number>()
            const values_new=new Array<number[]>()
            let last_gap=jop.gap
            while((pos=jop.next()) <= jop.last /* could be replaced by < Matrix.width */){
                starts_new.push(pos)
                if ( (jop.gap & 4 ) ===0){
                    if ((jop.gap & 1) === 0 ){
                        last_gap=jop.gap
                        last_Cut=pos           // todo: trim is responsible for this. Only leave here if it does not cost a lot of code
                    }

                }
            }
        })
    }

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
            if (o.starts.slice(-1)[0]>this.row.length){
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

    // due to pitch I expect the other 
    inverse(): Tridiagonal{
        const inve=new Tridiagonal(this.row.length) // I may want to merge the runlength encoders?

        for(let i=0;i<this.row.length;i++){
            [this.row[i],inve.row[i]].forEach(side=>side.scale(1/this.row[i].get(i)))
            for(let k=0;k<this.row.length;k++)if (k!==i){
               const f=this.row[k].get(i)
               if (f!==0){
                this.row[k].sub(this.row[i],f)
                inve.row[k].sub(this.row[i],f)
               }
            }
        }
        return inve
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


    MatrixProduct(that:number[]|Tridiagonal) {
        if (Array.isArray( that ) ) { // Poisson simulation uses columns
            return this.row.map(r=>{
                return r.innerProduct(that)
            })
        } else{ // mostly to test inverse
            const degen=new Tridiagonal(this.length())
            degen.row=this.row.map(r=>{
                return  r.innerProduct_Matrix(that)
            })
            return degen
        }            
    }

    //product
    //Tridiagonal|
// }

// // Note how the filenam as of 20201124 still contains "enforcePivot", but that responsibility lies fully within field.cs
// export class MatrixTupelWithCommonSpans extends Tridiagonal{
    inverseHalf(){
        //const inve=new Tridiagonal(this.row.length) // I may want to merge the runlength encoders?

        for(let i=0;i<this.row.length>>1;i++){
            this.row[i].scale(1/this.row[i].get(i))
            for(let k=0;k<this.row.length;k++)if (k!==i){
               const f=this.row[k].get(i)
               if (f!==0){
                this.row[k].sub(this.row[i],f)
                //inve.row[k].sub(this.row[i],f)
               }
            }
        }
        // in place //return inve
    }

    // both left half and full innerProduct (not really now, but it is --after all-- a Matrix) may make sense
    // inner product works, if the other matrix/vector is shorter. From a math point of view, I would need a Transpose function ( ToDo on demand )
}