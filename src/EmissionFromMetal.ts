// Todo: split into production and demo code
import { particle } from "./electronsAsGLPoints.js";
//import {}
import { Field, Metal, Tupel } from './fields.js';
import { Squeeze } from "./GL.js";

var contacts2d: string[] =
	['BBsss',
		'BBsss',
		'sssss',
		'sssAA',
		'sssAA'];

var Swap = new Field(contacts2d)

{
	var previousRow:Tupel[] = null, previousCell:Tupel = null
	Swap.fieldInVarFloats.map(row => {
		if (previousRow != null)
			row.map((cell,i) => {
  				const threeQuarterConductor=3 // FieldToDiagonal{ ConstTextToVarFloats(){Map([['i', 2] ['s', 1]}  ; literalVoltageBoost=2 }
				//const interFace = (a,b)=>   // todo:check field
				const sucks = (a:Tupel[]):Number => {
					//(a.BandGap<threeQuarterConductor) !== (b.BandGap<threeQuarterConductor) && // inteface
					//for(
						var i=0 //;i<=1;i++)
					do{ // binary
						if (
							(a[i].BandGap<threeQuarterConductor) !== (a[i^1] instanceof Metal) && // inteface
							(a[i].Potential > a[i^1].Potential ) //=== (a.BandGap<threeQuarterConductor)  // voltage sucks
						)return i
						i=i^1
					}while(i==1 );
					return -1
				}
				 //const  bothWays

				//cell.Potential
	
				if (previousCell != null && sucks( [cell, previousCell] )>=0 ){
					// seed
				}
				if (previousRow != null){
					const vCell=previousRow[i]
					if (typeof vCell === "object" && sucks( [cell, vCell] )>=0){ // avoid to mention the base of arrays. I guess, "first" and "last" is more of standard than 0 and 1 . Then again 0 and 1 is THE computer standard. I don't get it.
						// seed
					}

				}
				previousCell = cell
			})
		previousCell = null
		previousRow = row
	}
	)
}



// Swap.fieldInVarFloats.map( row=> row.reduce( (previous,cell) => {

// },null) )




{
	const wh = new Squeeze()
	wh.width = Swap.touchTypedDescription.length
	wh.height = Swap.maxStringLenght
	const vertices = [0, 0, 1, 1]  // flat
	particle("EmissionFromMetal", vertices, wh) // share transformation matrix for border (make texels size=1)?
}