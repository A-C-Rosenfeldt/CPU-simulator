class Tupel{
    // coulomb / m³  or whatever. Same unit for both
    Carrier : number; // for 6502 nfets: all negative
    Doping : number;
    ChargeDensity=() => this.Carrier + this.Doping;

    Potential: number;  // Voltage relative to ground
    BandGap: number; // Voltage. 0=metal. 1=Si. 3=SiO2
    
    ToTexture(raw : Uint8Array, p:number )
    {
        raw[p+3]=255;
        raw[p+0]=this.BandGap*255/3;
        const chargeDensity=this.ChargeDensity();
        
        raw[p+(chargeDensity>0?1:2)]=Math.abs(chargeDensity);
    }    
}

class FinFet{

}

class Field{
    field: Tupel[][];

    LaPlace(x:number,y:number){
        this.field[x][y].Potential=(
            this.field[x-1][y-1].Potential
            +this.field[x-1][y+1].Potential
            +this.field[x+1][y-1].Potential
            +this.field[x+1][y+1].Potential
        )/4 + this.field[x][y].ChargeDensity();
        //LU
//         const matrixI = Math.matrix([[0, 1], [2, 3], [4, 5]]);
// const vectorJ = math.matrix([[2], [1]]);
// const vectorIJ = math.multiply(matrixI, vectorJ);
    }





    Inverse(){
        // https://github.com/josdejong/mathjs/blob/develop/src/function/matrix/inv.js

    // this is a matrix of 3 x 3 or larger
      // calculate inverse using gauss-jordan elimination
      //      https://en.wikipedia.org/wiki/Gaussian_elimination
      //      http://mathworld.wolfram.com/MatrixInverse.html
      //      http://math.uww.edu/~mcfarlat/inverse.htm
/*
      // make a copy of the matrix (only the arrays, not of the elements)
      const A = mat.concat()
      for (r = 0; r < rows; r++) {
        A[r] = A[r].concat()
      }

      // create an identity matrix which in the end will contain the
      // matrix inverse
      const B = identity(rows).valueOf()

      // loop over all columns, and perform row reductions
      for (let c = 0; c < cols; c++) {
        // Pivoting: Swap row c with row r, where row r contains the largest element A[r][c]
        let ABig = abs(A[c][c])
        let rBig = c
        r = c + 1
        while (r < rows) {
          if (abs(A[r][c]) > ABig) {
            ABig = abs(A[r][c])
            rBig = r
          }
          r++
        }
        if (ABig === 0) {
          throw Error('Cannot calculate inverse, determinant is zero')
        }
        r = rBig
        if (r !== c) {
          temp = A[c]; A[c] = A[r]; A[r] = temp
          temp = B[c]; B[c] = B[r]; B[r] = temp
        }

        // eliminate non-zero values on the other rows at column c
        const Ac = A[c]
        const Bc = B[c]
        for (r = 0; r < rows; r++) {
          const Ar = A[r]
          const Br = B[r]
          if (r !== c) {
            // eliminate value at column c and row r
            if (Ar[c] !== 0) {
              f = divideScalar(unaryMinus(Ar[c]), Ac[c])

              // add (f * row c) to row r to eliminate the value
              // at column c
              for (s = c; s < cols; s++) {
                Ar[s] = addScalar(Ar[s], multiply(f, Ac[s]))
              }
              for (s = 0; s < cols; s++) {
                Br[s] = addScalar(Br[s], multiply(f, Bc[s]))
              }
            }
          } else {
            // normalize value at Acc to 1,
            // divide each value on row r with the value at Acc
            f = Ac[c]
            for (s = c; s < cols; s++) {
              Ar[s] = divideScalar(Ar[s], f)
            }
            for (s = 0; s < cols; s++) {
              Br[s] = divideScalar(Br[s], f)
            }
          }
        }
      }
      return B
    }
*/
    }
}