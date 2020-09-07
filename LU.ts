// We do not use LU. We need the inverse and the simplest code is based on GJ


// Does Matrix inverse

// I think this is standard code. I got parts from  copy not attribution required sources
// Anyway, once I thought I could find synergies between the iterative solver and the inversion,
// but I found out that wires, fields, pressure, metal parts all add rows into the matrix which in the end is not human readable anymore.
// But the matrix is sparse. So to test pivot or approximate inversion, I'd like to plot the abs(values) as intensities and sign(values) as color on the screen.
// My idea is to use pivot and to stop inversion when the matrix is not thaat sparse anymore.

// On the other side may just be a vector. We do not need an invers.
// First start with stuff which keeps sparse and does not introduce rounding errors

// Even if tile size is fixed, the shape of the metal electrodes leads to variable sizes
// Also for a non-blocky look of the electron field, I want overlap, so I solve for all tile combinations.
// Number of tile classes: 4
// combinations: 16 - 6  ( for the ends in the wrong part of the window)
// So how to proof the overlap thingy? Green function.
// How to not count double. So I use the output of in the middle of the window? So Green function swap will be half off when wandering to other tiles. And what do electrodes do?
// So I need to respect 3 tiles for the cache. Also: Only cache what is really in the map.
// semiconductor.Charge -> electric field  .  Metal.Potential -> Charge


// diagnoal entries are all <> 0
function LU(A:number[][]){
        let L=A; // L and U are stored inplace. Diagonal belongs to U. L has 1 on diagonal
        let U=A; //clone if A is needed afterwards (not the case here)
    
        for(let k=0;k<4*4;k++){
          for(let j=k+1;j<4*4;j++){
            L[j][k]=U[j][k] / U[k][k]
            for(let i=k;i<4*4;i++){
              U[j][i]-=L[j][k]*U[k][i]
            }
          }
        }
      }
        // Multiply
      //   for(let k=0;k<4*4;k++){
      //     for(let j=k+1;j<4*4;j++){
  
      // }
  //         const matrixI = Math.matrix([[0, 1], [2, 3], [4, 5]]);
  // const vectorJ = math.matrix([[2], [1]]);
  // const vectorIJ = math.multiply(matrixI, vectorJ);
      
  
  
function Gaus(A:number[][]){
  
        // create an identity matrix which in the end will contain the
        // matrix inverse
        const B = Number[4*4][4*4]//identity(rows).valueOf()
        for(let i=0;i<4*4;i++){
          B[i][i]=1;
        }
  
        for(let k=0;k<4*4;k++){
          const inv= 1 / A[k][k] // A[k][k]!=0 for laPlace
          for(let j=0;j<4*4;j++)if (j!=k){
            let f=A[j][k]
            if (f!==0){ 
              f*=inv
              let i=0
              while(i<k){
                A[j][i]-=f*A[k][i] // this is Matrix B. 
                i++
              }
              {
                A[j][k]=-f  // inplace and clean inner-loop. We already saved A[j][k] in f
                i++ // I dunno, does JS specify when i is accessed on both sides of the assignment?
              }
              while(i<4*4){
                A[j][i]-=f*A[k][i] // should produce 0 for i=k
                i++
              }
            }          
          }
        }
      }      
  /*
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