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
export class Row {
    // Mirror and generally metal leads to values > 1 on the diagonal
    constructor(pos, pitch, data) {
        this.starts = [0, 0, 0, 0, 0, 0]; // vs GC, number of test cases
        this.ranges = [[0, 1], [2, 3], [4, 5]];
        this.data = [[], [], []];
        this.data = data;
        this.starts = [].concat.apply([], this.data.map(d => [pos - Math.floor(d.length / 2), pos + Math.ceil(d.length / 2)]));
        this.starts[0] -= pitch;
        this.starts[1] -= pitch;
        this.starts[4] += pitch;
        this.starts[5] += pitch;
        // for diagonal-only construction
        if (this.starts[1] > this.starts[2]) {
            this.starts[0] -= this.starts[1] - this.starts[2];
            this.starts[1] = this.starts[2];
        }
        if (this.starts[4] < this.starts[3]) {
            this.starts[5] -= this.starts[4] - this.starts[3];
            this.starts[4] = this.starts[3];
        }
    }
    find(at) {
        let segment = this.starts.length;
        while (this.starts[--segment] > at) {
            if (segment < 0)
                return null;
        }
        ;
        if (segment & 1) { // it is different for --   compared to ++
            return null;
        }
        return [segment >> 1, at - this.starts[segment]];
    }
    get(at) {
        const tupel = this.find(at);
        return tupel[0] !== null ? this.data[tupel[0]][tupel[1]] : 0;
    }
    set(value, at) {
        const tupel = this.find(at);
        return this.data[tupel[0]][tupel[1]];
    }
    is1() {
        return 1e-6 > (Math.max.apply(this.data.map(d => Math.max.apply(d))) -
            Math.min.apply(this.data.map(d => Math.min.apply(d))) // If no arguments are given, the result is +∞.
        );
    }
    // GC friendly  inplace code  looks ugly :-(
    scale(factor) {
        if (factor !== 1) { // factor 1 should be default. Lets plot how it detoriates over the process
            this.data.forEach(segment => segment.forEach((value, i) => segment[i] *= factor));
        }
    }
    // the data blow up part -> log and print statistics! Also see stackoverlow: inverse of a sparse matrix
    sub(that, factor) {
        let clone = this.starts.slice(); // copy all elements
        that.starts;
        let combinedStarts = [];
        // sides is only for target row
        /*for (let side = -1; side <= +1; side += 2)*/ //{
        let n = 0; //: number /// for pass=2
        let ts = new Array();
        for (let pass = 0; pass < 2; pass++) {
            console.log('pass ' + pass + ' data ' + this.data.map(d => d.length).join());
            let gaps = [[], []];
            let i = 0; // Mybe use .values instead?
            let a = 0;
            let story = [];
            let gap = 0;
            do {
                // console.log("i "+i+" a "+a)
                const pass1gap = gap;
                do {
                    // trying to avoid infinity, null and undefined for better readability
                    let I = that.starts[that.starts.length - 1] + 1;
                    let A = clone[clone.length - 1] + 1;
                    if (i < clone.length) {
                        I = clone[i];
                    }
                    if (a < that.starts.length) {
                        A = that.starts[a];
                    }
                    if (I > A) {
                        a++;
                        gap ^= 2;
                        story[0] = A;
                    }
                    else {
                        i++;
                        gap ^= 1;
                        story[0] = I;
                        if (I === A) {
                            a++;
                            gap ^= 2;
                        }
                    }
                } while (false);
                if (pass === 1 && story.length === 2 /* this needs reversed story */) { // polymorphism?
                    console.log('story ' + story[1] + ' ' + story[0] + ' gap ' + pass1gap);
                    (function trailing(i, a) {
                        let cut0, cut1;
                        if (pass1gap & 1) {
                            console.log('this.data[' + i + '>>1].slice(' + story[1] + '-' + clone[i] + ',' + story[0] + '-' + clone[i] + ')');
                            cut0 = this.data[i >> 1].slice(story[1] - clone[i], story[0] - clone[i]); // Todo: double buffer? No ts is already the second buffer and non-sparse can only grow (at the moment)
                            if (pass1gap & 2) {
                                for (let b = 0; b < cut0.length; b++) {
                                    console.log("b " + b);
                                    cut0[b] -= factor * that.data[a >> 1][b + (story[1] - that.starts[a])];
                                }
                            }
                            ts.push(cut0);
                        }
                        else {
                            if (pass1gap & 2) {
                                console.log('ts.push(that.data[' + a + '>>1].slice(' + story[1] + '-' + that.starts[a] + ',' + story[0] + '-' + that.starts[a] + '))');
                                ts.push(that.data[a >> 1].slice(story[1] - that.starts[a - 1], story[0] - that.starts[a]));
                            }
                            else {
                                ts.push(Array(story[0] - story[1]).fill(0));
                            }
                        }
                    }).bind(this)(i - 2, a - 2);
                    console.log('this.starts[' + n + '] === story[' + 0 + ']');
                    console.log('if' + this.starts[n] + ' === ' + story[0]);
                    while (this.starts[n] === story[0]) {
                        console.log('ts.length: ' + ts.length);
                        if ((n & 1) === 1) {
                            const index = n >> 1;
                            const rValue = Array.prototype.concat.apply([], ts);
                            console.log('pass ' + pass + ' data ' + this.data.map(d => d.length).join() + '   [' + index + '] = ' + rValue);
                            this.data[index] = Array.prototype.concat.apply([], ts);
                            ts = [];
                        }
                        n++;
                    }
                    story[1] = story[0]; // we care for all seams
                }
                else {
                    if (gap !== 0) { // we record gaps
                        story[1] = story[0]; // we looked back
                    }
                    else {
                        const pointer = gaps[i < 3 ? 0 : 1].slice(1, 2);
                        if (pointer[0] - pointer[1] > story[0] - story[1]) {
                            gaps[i < 3 ? 0 : 1] = [i].concat(story);
                        }
                    }
                }
            } while (i < clone.length || a < that.starts.length);
            if (pass === 0) {
                // what to do if there are no gaps?
                // main diagonal takes it!
                // similar to constructor, but sadly not the same
                this.starts = new Array(this.starts.length).
                    fill(Math.min(this.starts[0], that.starts[0]), 0).
                    fill(Math.max(this.starts[5], that.starts[5]), 3);
                if (gaps) {
                    for (let side = 0; side < 2; side++) {
                        if (gaps[side] && gaps[side].length > 0) {
                            this.starts.splice(1 + 3 * side, 0, ...gaps[side]);
                        }
                    }
                }
            }
        }
    }
    // parent needs to add Matrix.length
    holdBothsides(i) {
        /*
        this.starts.unshift(-i+1);  // matrix is mirrord on the left
        this.starts.unshift(-i);
        */
        this.starts.push(i);
        this.starts.push(i + 1);
        this.data.push([1]);
    }
    // parent has to initialize buffer because we fill only defined values
    print(targetRough, targetFine) {
        this.ranges.forEach((r, i) => this.data[i].forEach((cell, j) => {
            targetRough.data.set([
                cell < 0 ? cell * Row.printScale : 0,
                0,
                cell > 0 ? cell * Row.printScale : 0, 255
            ], // cannot do black numbers on black screen
            targetFine + (this.starts[r[0]] + j) << 2);
        }));
    }
    innerProduct(column) {
        let acc = 0;
        this.ranges.forEach((r, i) => {
            this.data[i].forEach((cell, j) => {
                acc += cell * column[j + this.starts[r[0]]];
            });
        });
        return acc;
    }
    // only used for test. The other matrix will be an inverted Matrix, which is no sparse
    innerProduct_Matrix(M) {
        const accs = new Array(M.length());
        for (let acc_i = 0; acc_i < M.length(); acc_i++) {
            let acc = 0;
            this.ranges.forEach((r, i) => {
                this.data[i].forEach((cell, j) => {
                    acc += cell * M.getAt(j + this.starts[r[0]], acc_i);
                });
            });
            accs[acc_i] = acc;
        }
        {
            const row = new Row(0, 0, [[], [], []]);
            row.data[1] = accs;
            return row;
        }
    }
}
Row.printScale = 20;
class RowTest {
    data() {
        let row = new Row(3, 4, [[0.25], [0.25], [0.25], [0.25]]);
    }
}
export class Tridiagonal {
    constructor(length) {
        this.row = new Array(length);
        //I cannot create rows
        //I do not want thousand different constructors
        //user will have to fill the array
    }
    is1() {
        for (let i = 0; i < this.row.length; i++) {
            if (this.row[i].is1())
                return true;
        }
        return false;
    }
    setTo1() {
        this.row.forEach((row, i) => {
            this.row[i] = new Row(i, 0, [[], [1], []]);
        });
    }
    length() {
        return this.row.length;
    }
    getAt(row, column) {
        return this.row[row].get(column);
    }
    printGl() {
        const s = this.row.length;
        const pixel = new Uint8Array(s * s * 4); // 2+4+4 = 10
        // RGBA. This flat data structure resists all functional code
        for (let pointer = 0; pointer < iD.data.length; pointer += 4) {
            iD.data.set([0, 255, 0, 255], pointer); // greenscreen
        }
        for (let r = 0, pointer = 0; r < this.row.length; r++, pointer += 4) {
            this.row[r].print(iD, pointer);
        }
        return iD;
    }
    print() {
        const s = this.row.length;
        const iD = new ImageData(s, s);
        // RGBA. This flat data structure resists all functional code
        for (let pointer = 0; pointer < iD.data.length; pointer += 4) {
            iD.data.set([0, 255, 0, 255], pointer); // greenscreen
        }
        for (let r = 0, pointer = 0; r < this.row.length; r++, pointer += 4) {
            this.row[r].print(iD, pointer);
        }
        return iD;
    }
    // due to pitch I expect the other 
    inverse() {
        const inve = new Tridiagonal(this.row.length); // I may want to merge the runlength encoders?
        for (let i = 0; i < this.row.length; i++) {
            [this.row[i], inve.row[i]].forEach(side => side.scale(1 / this.row[i].get(i)));
            for (let k = 0; k < this.row.length; k++)
                if (k !== i) {
                    const f = this.row[k].get(i);
                    if (f !== 0) {
                        this.row[k].sub(this.row[i], f);
                        inve.row[k].sub(this.row[i], f);
                    }
                }
        }
        return inve;
    }
    MatrixProduct(that) {
        if (Array.isArray(that)) { // Poisson simulation uses columns
            return this.row.map(r => {
                return r.innerProduct(that);
            });
        }
        else { // mostly to test inverse
            const degen = new Tridiagonal(this.length());
            degen.row = this.row.map(r => {
                return r.innerProduct_Matrix(that);
            });
            return degen;
        }
    }
}
//# sourceMappingURL=enforcePivot.js.map