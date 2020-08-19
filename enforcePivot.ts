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
class Row{
    starts:number[] = [0,0,0,0,0,0]; // vs GC, number of test cases
    ranges=[[0,1],[2,3],[4,5]]
    sides=[[0,1,2,3,4,5]]
    
    //ranges: better alternative.   print  vs  sub
    data:number[][] = [[],[],[]] 

    constructor(pos:number, pitch:number, data:number[][]){
        this.data[0]=data[0];
        this.data[1]=data[1].concat([1]).concat(data[2]);
        this.data[2]=data[3];

        this.sides.push(this.sides[0].reverse())
    }

    private find(at:number):number{
        let segment=this.starts.length
        while(this.starts[--segment]<at){
            if (segment<0) return null;
        };

        if (segment in [1,3,5]){
            return null
        }

        return [segment][at-this.starts[segment]]

    }

    get(at:number):number{
        const tupel=this.find(at)
        return tupel[0] !== null ? this.data[tupel[0]][tupel[1]] : 0
    }

    set(value:number, at:number){
        const tupel=this.find(at)
        return this.data[tupel[0]][tupel[1]]
    }

    // GC friendly  inplace code  looks ugly :-(
    scale(factor:number){
        if (factor !== 1){ // factor 1 should be default. Lets plot how it detoriates over the process
        this.data.forEach(segment=>segment.forEach((value,i)=>segment[i]*=factor))
        }
    }

    // the data blow up part -> log and print statistics! Also see stackoverlow: inverse of a sparse matrix
    sub(that:Row){
        {
        const clone=this.starts.slice() // copy all elements
        that.starts
        let combinedStarts=[]

        // expand outer limits. ToDo: TestHook
        {
            let side=-3
            if (this.starts[3-side]>that.starts[3-side]){
                combinedStarts[3-side]=Math.min(
                this.starts[3-side],that.starts[3-side])
            }
            side+=6
            if (this.starts[3-side]>that.starts[3-side]){
                this.starts[3-side]=that.starts[3-side]
            }            
        }

        // sides is only for target row
        /*for (let side = -1; side <= +1; side += 2)*/ //{
        let won: number
        for (let pass = 0; pass < 2; pass++) {
            let gaps: number[][] = [[], []]

            //let acc = 0
            let i = 0
            let a = 0
            let story=[]
            let gap=0
            do {
                let I = clone[i]
                let A = that.starts[a]

                // if (pass === 1 && gap === 0) {
                //     this.starts[i]=t
                // }

                //let t: number
                if (I < A) {
                    i++; gap ^= 1; story[0] = A
                } else {
                    a++; gap ^= 2; story[0] = I
                }

                if (gap !== 0) {
                    story[1] = story[0]
                } else {
                    if (pass === 1) { // polymorphism?
                    //    this.starts[i]=gaps[i < 3 ? 0 : 1]
                    } else {
                        const pointer=gaps[i < 3 ? 0 : 1].slice(1,2)
                        if (  pointer[0]-pointer[1] > story[0]-story[1] ){
                            gaps[i < 3 ? 0 : 1]=[i].concat(story)
                        }
                    }
                }

            } while (i < this.starts.length && a < this.starts.length);

            this.starts=[
                Math.min(this.starts[0],that.starts[0]),
                gaps[0][1],
                gaps[0][2],
                gaps[1][1],
                gaps[1][2],
                Math.max(this.starts[5],that.starts[5])
            ]
        }

        for(let cashier=0;cashier<6;cashier++){
            
        }
        //}

        // decide which gap to keep
        {
            let side=-2
            this.starts[3-side]>that.starts[3-side]
        }
        this.data.forEach(segment=>segment.forEach((value,i)=>segment[i]*=factor))
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

    // parent has to initialize buffer because we fill only defined values
    print(targetRough:ImageData, targetFine:Number ){
        
    }
}

class RowTest{
    data(){
        let row=new Row(3,4,[[0.25],[0.25],[0.25],[0.25]]);
    }
}

class Tridiagonal{
    rows:Row[]
    constructor(length:number){
        this.rows=new Array(length)
        this.rows
    }

    length():number{
        return this.rows.length
    }
    getAt(row:number, column:number){
        return this.rows[row].get(column);
    }
}